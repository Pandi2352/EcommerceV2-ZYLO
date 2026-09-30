# Authentication & Role-Based Access Control (RBAC)

This document describes how authentication works in ZYLO. It points to the source files instead of copying code, so it stays accurate as the code evolves.

---

## 1. Module Layout

```
server/src/modules/auth/
├── controllers/   auth, password, email-verification, mfa, google-oauth
├── services/      auth (orchestration), token, auth-cookie, password, password-management,
│                  login-attempt, email-verification, mfa, mfa-challenge, google-oauth
├── dto/           register, login, forgot/reset/change password, token, mfa-code, disable-mfa
├── schemas/       refresh-session (one document per issued refresh token)
├── strategies/    jwt (cookie or Bearer), google (only registered when configured)
├── guards/        google-oauth (CSRF state check)
├── filters/       oauth-callback (redirects failures back to /login)
└── utils/         totp (RFC 6238), backup-codes, safe-redirect

server/src/modules/audit/   Security audit trail (global AuditService + GET /audit-logs)
server/src/modules/mail/    MailService (SMTP, or logs emails when SMTP_HOST is empty) + templates
server/src/common/          Guards, decorators, AppException + ErrorCode, shared utils and validators
```

Client side: `client/src/features/auth/` (components and hooks), `client/src/pages/auth/` (email-link and MFA pages), `client/src/context/AuthContext.tsx`, `client/src/services/auth.service.ts`.

---

## 2. Tokens and Sessions

| Token | Where | Lifetime | Notes |
|---|---|---|---|
| Access JWT | `access_token` HttpOnly cookie (or `Authorization: Bearer` for Swagger) | `JWT_ACCESS_EXPIRY` (15m) | Rejected if issued before the user's last password change |
| Refresh JWT | `refresh_token` HttpOnly cookie | `JWT_REFRESH_EXPIRY` (7d), or `JWT_REFRESH_REMEMBER_EXPIRY` (30d) with "Remember me" | Backed by a `refresh_sessions` document |
| MFA challenge | `mfa_challenge` HttpOnly cookie | 5 minutes | Signed with a secret derived from the access secret, so it can never be used as an access token |
| OAuth state | `oauth_state` HttpOnly cookie (`SameSite=Lax`) | 10 minutes | CSRF nonce + post-login redirect for Google sign-in |

- **Rotation:** every `POST /auth/refresh` consumes the presented refresh token and issues a new one in the same *family*.
- **Reuse detection:** replaying an already-rotated token more than 10 seconds later revokes the whole family and logs `REFRESH_TOKEN_REUSE`. The grace window avoids false positives when two tabs refresh at once.
- **Revocation:** `logout` revokes the current session; `logout-all`, password change and password reset revoke every session of the user.
- Tokens are never stored in `localStorage`/`sessionStorage`, and never returned in response bodies.

---

## 3. Sign-in Flows

### 3.1 Portals
The storefront and the admin console sign in through different endpoints:

| Endpoint | Accepts | Rejects with `WRONG_PORTAL` |
|---|---|---|
| `POST /auth/login` | `CUSTOMER` | Staff roles |
| `POST /auth/admin/login` | `SUPPORT_AGENT`, `ADMIN`, `SUPER_ADMIN` | Customers |

The portal check runs only after the password is verified, so it does not reveal account roles.

### 3.2 Password → (optional) second factor
1. `POST /auth/login` or `/auth/admin/login` with `{ email, password, rememberMe }`.
2. Without MFA: the response is `{ mfaRequired: false, user }` and session cookies are set.
3. With MFA: the response is `{ mfaRequired: true }` and only the `mfa_challenge` cookie is set. The client shows `/login/verify` (or `/admin/login/verify`).
4. `POST /auth/mfa/verify { code }` accepts a 6-digit TOTP code or a one-time backup code, then sets session cookies.

### 3.3 Google sign-in (customers only)
`GET /auth/google?redirect=/path&remember=true` → Google → `GET /auth/google/callback`.

- **Account resolution:** an already-linked account signs in. An existing *customer* with the same verified email is linked automatically. Otherwise a new customer account is created with `hasPassword: false`.
- **Staff accounts** can never use Google sign-in (`OAUTH_STAFF_NOT_ALLOWED`).
- **Failures** redirect to `/login?oauthError=CODE`.
- **Enabled only when configured:** it requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. `GET /auth/providers` tells the client whether to show the button.

---

## 4. Account Protection

| Mechanism | Rule |
|---|---|
| Rate limiting | Credential endpoints: 5/min per IP; email-sending endpoints: 3/min per IP; everything else 100/min (`common/constants/throttle.constants.ts`) |
| Lockout | 5 consecutive failed passwords or MFA codes lock the account for 15 minutes (`423 ACCOUNT_LOCKED` with `retryAfterSeconds`). A successful password reset unlocks it |
| Enumeration | Unknown emails take the same bcrypt time as known ones; forgot-password always returns 200 |
| Password policy | 8+ chars with upper, lower, digit and symbol (`common/validators/is-strong-password.decorator.ts`, mirrored in `client/src/utils/passwordPolicy.ts`) |
| Password reuse | A new password must differ from the current and the immediately previous password |
| Forced change | Users with `mustChangePassword` (seeded staff accounts) get `403 PASSWORD_CHANGE_REQUIRED` on every route except `/auth/me`, `/auth/password/change` and `/auth/logout-all` |
| MFA secrets | TOTP secrets are encrypted at rest with AES-256-GCM using `ENCRYPTION_KEY`; backup codes are stored as SHA-256 hashes; each TOTP time step is accepted once |
| Email tokens | Verification (24h) and reset (1h) tokens are random, single-use and stored only as SHA-256 hashes |

---

## 5. Roles and Authorization

Roles live in `server/src/common/enums/user-role.enum.ts` (mirrored in `client/src/constants/roles.ts`).

| Role | Portal | Inherits |
|---|---|---|
| `CUSTOMER` | Storefront | — |
| `SUPPORT_AGENT` | Admin | — |
| `ADMIN` | Admin | `SUPPORT_AGENT` |
| `SUPER_ADMIN` | Admin | `ADMIN`, `SUPPORT_AGENT` |

Global guards run in this order (registered in `app.module.ts`):

1. `ThrottlerGuard`: rate limits.
2. `JwtAuthGuard`: every route requires a valid access token unless decorated with `@Public()`.
3. `PasswordChangeGuard`: enforces `mustChangePassword` (bypass with `@AllowPasswordChangePending()`).
4. `RolesGuard`: `@Roles(UserRole.ADMIN)` admits `ADMIN` and `SUPER_ADMIN`. It is hierarchical via `roleSatisfies()`.

```typescript
@Roles(UserRole.ADMIN)          // ADMIN and SUPER_ADMIN
@Controller('audit-logs')
export class AuditController { … }
```

On the client, `<ProtectedRoute role={USER_ROLES.ADMIN}>` and `<ProtectedRoute anyRole={STAFF_ROLES}>` apply the same hierarchy. The admin sidebar hides items the user's role cannot open.

---

## 6. Audit Trail

`AuditService.log()` (global) records security events with user, email, role, portal, IP and user agent. Records are kept for 180 days via a TTL index.

- Events: `modules/audit/audit-event.enum.ts`
- API: `GET /api/v1/audit-logs` (ADMIN+), paginated and filterable by event, email, user and portal
- UI: Admin → Security Logs

Behind a reverse proxy, set `TRUST_PROXY=1` so the recorded IP is the client's, not the proxy's.

---

## 7. Error Codes

Errors carry a machine-readable `code` (see `common/constants/error-codes.ts` and `client/src/constants/errorCodes.ts`), for example `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `WRONG_PORTAL`, `PASSWORD_REUSED`, `MFA_INVALID_CODE`, `MFA_CHALLENGE_INVALID`, `INVALID_TOKEN`. Clients should branch on `code`, never on `message`.

---

## 8. Local Development

- **Emails:** leave `SMTP_HOST` empty. Verification and reset emails, including their links, are printed to the server log.
- **Seed accounts** (`npm run seed -- --users`):
  - `admin@zylo.internal` (SUPER_ADMIN) and `support@zylo.internal` (SUPPORT_AGENT). Both must change their password on first sign-in.
  - `customer@zylo.internal` (CUSTOMER).
- **Google sign-in:** set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add `GOOGLE_CALLBACK_URL` (default `http://localhost:5173/api/v1/auth/google/callback`) as an authorized redirect URI in Google Cloud Console.
