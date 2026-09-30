# Module Plan — Admin User Management (Roles, Permissions, Users, Invitations)

| | |
|---|---|
| **Status** | Planned and decisions resolved (§18). Ready for phase P1. A first prototype exists (see §2) |
| **App** | `apps/admin` (console) + `server` (API) |
| **Depends on** | Auth module (`docs/11-auth-rbac.md`), Audit module, Mail module |
| **Related docs** | `07-database-design.md`, `08-api-specification.md`, `14-security-guidelines.md` |
| **Last updated** | 2026-09-30 |

> **Scope note:** "Users" in this module means **staff accounts** of the admin console.
> Storefront customers are managed separately in the Customers module (line-items §18).

---

## Table of Contents
1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Current State & Gap Analysis](#2-current-state--gap-analysis)
3. [Key Design Decisions](#3-key-design-decisions)
4. [Data Model](#4-data-model)
5. [Permission Catalog (Seeded)](#5-permission-catalog-seeded)
6. [Default Roles (Seeded)](#6-default-roles-seeded)
7. [Authorization Architecture](#7-authorization-architecture)
8. [Business Rules & Guardrails](#8-business-rules--guardrails)
9. [Flows](#9-flows)
10. [API Specification](#10-api-specification)
11. [Admin UI Specification](#11-admin-ui-specification)
12. [Audit Logging](#12-audit-logging)
13. [Code Organisation](#13-code-organisation)
14. [Migration From the Current Prototype](#14-migration-from-the-current-prototype)
15. [Delivery Phases & Acceptance Criteria](#15-delivery-phases--acceptance-criteria)
16. [Testing Plan](#16-testing-plan)
17. [Post-MVP Backlog](#17-post-mvp-backlog)
18. [Resolved Decisions](#18-resolved-decisions)

---

## 1. Goals & Non-Goals

### Goals
- **Roles are data, not code.** Admins create, edit, activate/deactivate and delete roles from the console.
- **Permissions are code, not data.** A fixed, seeded catalog of `module.action` keys. The UI can only *read* the catalog and *assign* keys to roles.
- **Authorization is permission-based and enforced on the server.** Every admin API endpoint declares the permission it needs. Hiding a button in React is only cosmetic.
- **Staff join by invitation only.** A secure, expiring, single-use link ends with a password set by the invitee. Admins never know or set a staff password.
- **Every sensitive change is audited** with actor, target, IP, and before/after values.
- **Safe by default.**
  - The last Super Admin can never be removed.
  - Nobody can grant permissions they don't hold themselves.
  - A deactivated user loses access immediately.

### Non-Goals (MVP)
- Permission CRUD from the UI (explicitly forbidden).
- Customer account management (Customers module).
- Multiple roles per user **in the UI**. The data model supports it from day one (see D4).
- Field-level or record-level permissions (e.g. "only orders from warehouse A").
- SSO/SAML, SCIM provisioning, CSV import (post-MVP, §17).

---

## 2. Current State & Gap Analysis

The Auth module is complete: login, 2FA, lockout, sessions, password flows and audit logs. A first user-management prototype also exists (uncommitted at the time of writing):

| Area | Prototype today | Target (this plan) | Action |
|---|---|---|---|
| Roles | Hardcoded `UserRole` enum (`SUPPORT_AGENT`, `MANAGER`, `ADMIN`, `SUPER_ADMIN`) with a fixed hierarchy | `roles` collection, admin-managed. System roles protected | **Replace** enum-based staff roles |
| Permissions | Hardcoded list in `packages/shared/src/constants/permissions.ts`, keys like `catalog:manage` | Seeded `permissions` collection. Catalog on the server; keys like `products.edit` | **Replace**, migrate keys |
| Assignment | `customPermissions[]` stored **per user** | Permissions assigned **per role**; users get roles | **Replace** per-user grants |
| Enforcement | `@Roles(ADMIN)` hierarchy only. **Stored permissions are never checked** | `@RequirePermissions('users.invite')` + `PermissionsGuard` on every admin endpoint | **New**. Critical gap |
| Invitations | `staff_invitations` with hashed token, expiry, resend, revoke, accept | Same concept, plus: names, User ID, designation, personal note, role IDs, token rotation on resend, `REGISTERED` status | **Keep & extend** |
| Token check endpoint | `GET /admin/staff/invite/:token` (token in the URL path) | `POST /invitations/verify { token }` | **Change**: keeps tokens out of access logs |
| Service size | `staff.service.ts` is 471 lines | Split into roles, users, invitations and permissions services (< 200 lines each) | **Refactor** |
| Audit | Auth events + `STAFF_*` events, no before/after | Actor + target + resource + field-level diff | **Extend** schema |

**Keep:**
- Auth, sessions and 2FA
- `AuditService` and `MailService`
- The shared UI kit (`DataTable`, `Pagination`, `useForm`, `useApiQuery`…)
- The invitation email template
- The invitation token hashing approach

---

## 3. Key Design Decisions

| # | Decision | Rationale |
|---|---|---|
| **D1** | **Roles are a MongoDB collection.** Each role has `isSystem`: system roles can't be deleted and `super_admin` can't be edited | Admins need custom roles without deployments. System roles guarantee the platform always has an owner |
| **D2** | **The permission catalog lives in code** (`permissions.catalog.ts`) and is **synced to the DB** by the seed/startup routine: upsert new keys, mark removed ones `deprecated` | One reviewed source of truth that versions with the code that checks it. The DB copy lets the UI list and group permissions and lets roles reference them |
| **D3** | **Authorize by permission, never by role name.** Code checks `products.delete`, not "is Catalog Manager" | Roles are renamed and reshuffled by admins; permission keys are stable contracts |
| **D4** | **`user.roleIds: string[]` from day one; the MVP UI allows exactly one** | Multi-role support later is a UI change, not a data migration |
| **D5** | **Effective permissions = union of all active roles' permissions.** `super_admin` holds the wildcard `*` | New permissions are automatically granted to Super Admins; nothing to forget |
| **D6** | **Permissions are resolved per request (cached), never embedded in the JWT** | Revoking a permission takes effect on the next request, not after the 15-minute token lifetime |
| **D7** | **Invitations are a separate collection.** A `users` document is created only when the invitation is **accepted** | No half-created accounts without passwords; the users table contains only real, usable accounts |
| **D8** | **`accountType: 'CUSTOMER' \| 'STAFF'`** replaces the role enum for portal separation | Separates "which app can you sign into" (account type) from "what can you do" (roles/permissions) |
| **D9** | **Staff users are soft-deleted** (`deletedAt`); roles are hard-deleted only when unused | Audit history must keep resolving "who did this"; removing a role that nobody uses leaves nothing dangling |
| **D10** | **No privilege escalation.** An actor can only grant permissions, or assign roles, that are a subset of their own effective permissions (Super Admin exempt) | Stops an admin with `roles.edit` from granting themselves `*` through a role |

### Status vocabulary
| Entity | Values |
|---|---|
| Role | `ACTIVE`, `INACTIVE` |
| Staff user | `ACTIVE`, `INACTIVE` (plus a derived `LOCKED` badge while `lockUntil > now`) |
| Invitation | `INVITED`, `REGISTERED`, `EXPIRED`, `REVOKED` |

> **Why no `INVITED` user status?** Per D7, a person who hasn't accepted is an *invitation*, not a user.
> The Users page links to "Pending invitations (N)", so admins still see everyone in one place.

---

## 4. Data Model

All collections extend `BaseSchema` via `baseSchemaOptions()`: UUID `_id`, timestamps, and an `id` field in JSON.

### 4.1 `permissions` (seeded, read-only at runtime)
| Field | Type | Notes |
|---|---|---|
| `_id` | string | = `key` (e.g. `products.edit`), so role references stay human-readable |
| `key` | string | Unique. Pattern `^[a-z_]+\.[a-z_]+$` |
| `module` | string | `products`, `orders`, … (first segment of `key`) |
| `action` | string | `view`, `create`, … (second segment) |
| `name` | string | "Edit Products" |
| `description` | string | Shown under the checkbox |
| `group` | string | UI accordion label, e.g. "Catalog" |
| `sortOrder` | number | Order within the group |
| `isSensitive` | boolean | Highlighted in the UI (refunds, deletes, role management) |
| `deprecated` | boolean | Set when removed from the catalog; hidden in the UI, ignored by checks |

Index: `{ module: 1, sortOrder: 1 }`.

### 4.2 `roles`
| Field | Type | Notes |
|---|---|---|
| `name` | string | Unique (case-insensitive, via collation index), 2–60 chars |
| `key` | string | Unique, **immutable**. `^[a-z][a-z0-9_]{2,49}$`, auto-suggested from the name |
| `description` | string | ≤ 300 chars |
| `permissions` | string[] | Permission keys; `['*']` only for `super_admin` |
| `status` | `ACTIVE \| INACTIVE` | Inactive roles grant nothing and can't be newly assigned |
| `isSystem` | boolean | Seeded roles: `super_admin`, `admin`. Can't be deleted |
| `createdBy` / `updatedBy` | string (user id) | |
| `createdAt` / `updatedAt` | Date | |

Indexes: `{ key: 1 }` unique, `{ name: 1 }` unique with collation `{ locale: 'en', strength: 2 }`, `{ status: 1 }`.
User counts are computed with a query (`countDocuments({ roleIds: roleId })`), not stored, so they are never stale.

### 4.3 `users` (changes to the existing schema)
| Field | Change | Notes |
|---|---|---|
| `accountType` | **add** | `CUSTOMER` \| `STAFF`. Replaces portal checks based on `role` |
| `roleIds` | **add** | `string[]` of role `_id`s. Staff only; MVP UI enforces length 1 |
| `firstName`, `lastName` | **add** | `name` kept as a derived full name for existing code |
| `userCode` | **add** | The "User ID" shown in the UI (e.g. `ZY-0042`). A **reference code only**: never used to sign in (login is email + password). Unique among staff (sparse index). Separate from the internal UUID |
| `designation` | **add** | Free text, ≤ 80 chars (e.g. "Senior Catalog Executive") |
| `status` | **add** | `ACTIVE` \| `INACTIVE`. Replaces `isActive` (kept in sync during migration) |
| `invitedBy`, `invitationId` | **add** | Provenance |
| `deletedAt`, `deletedBy` | **add** | Soft delete. Default queries exclude deleted users |
| `role` (enum) | **deprecate** | Kept read-only during migration, then removed |
| `customPermissions` | **remove** | Replaced by role permissions (D3) |
| `lastLoginAt`, `mfaEnabled`, `lockUntil` | existing | Surfaced in the users table |

New indexes: `{ accountType: 1, status: 1 }`, `{ roleIds: 1 }`, `{ userCode: 1 }` unique sparse, `{ deletedAt: 1 }`.

### 4.4 `staff_invitations` (extends the prototype schema)
| Field | Type | Notes |
|---|---|---|
| `firstName`, `lastName` | string | Required |
| `email` | string | Lowercased |
| `userCode` | string | Required; must not clash with an existing staff user or an open invitation |
| `designation` | string | Optional |
| `roleIds` | string[] | Required, length 1 in MVP |
| `message` | string | Optional personal note, ≤ 500 chars, plain text (escaped in the email) |
| `tokenHash` | string | SHA-256 of the token, `select: false` |
| `status` | enum | `INVITED`, `REGISTERED`, `EXPIRED`, `REVOKED` |
| `expiresAt` | Date | `now + INVITATION_TTL` (default **7 days**) |
| `invitedBy`, `invitedByName` | string | Snapshot of the inviter |
| `sentCount`, `lastSentAt` | number, Date | Incremented on resend |
| `registeredAt`, `userId` | Date, string | Set on acceptance |
| `revokedAt`, `revokedBy` | Date, string | Set on revoke |

Indexes: `{ email: 1, status: 1 }`, `{ status: 1, expiresAt: 1 }`, `{ tokenHash: 1 }`.
**Invariant:** at most one `INVITED` invitation per email, enforced by a partial unique index on `{ email: 1 }` where `status = 'INVITED'`.

### 4.5 `audit_logs` (extensions)
Add `actorId`, `actorEmail` (who did it), `resourceType` (`USER` \| `ROLE` \| `INVITATION`), `resourceId`, `resourceName`, and `changes: [{ field, from, to }]`.
Existing fields (`userId`/`email` = subject, `ip`, `userAgent`, `portal`) stay. See §12.

---

## 5. Permission Catalog (Seeded)

### 5.1 Naming rules
- **Format:** `module.action`, lowercase, snake_case segments: `audit_logs.view`, `orders.refund`.
- **Actions come from a fixed vocabulary.** Do not invent per-screen keys.

| Action | Meaning |
|---|---|
| `view` | Read lists and details |
| `create` | Create new records |
| `edit` | Update existing records |
| `delete` | Remove records |
| `activate` | Activate or deactivate (users, roles, customers) |
| `publish` | Make content live |
| `approve` | Approve or reject (reviews, returns) |
| `cancel` | Cancel an order |
| `refund` | Issue a refund |
| `adjust` | Manual stock adjustments |
| `invite` | Send, resend and revoke invitations |
| `assign` | Assign permissions to roles, or roles to users |
| `import` / `export` | Bulk data in/out |

- **Rule:** `view` is implied by any other action in the same module. The UI auto-ticks `view` and the server auto-adds it on save, so nobody ends up with "edit but can't see".

### 5.2 MVP catalog
Only modules that exist or are in the current MVP roadmap are seeded. A permission for a feature that doesn't exist yet only confuses admins. New modules add their keys to the catalog when they ship; the sync (§5.3) picks them up.

| Group | Module | Keys |
|---|---|---|
| Overview | `dashboard` | `dashboard.view` |
| Access control | `users` | `users.view`, `users.invite`, `users.edit`, `users.activate`, `users.delete` |
| | `roles` | `roles.view`, `roles.create`, `roles.edit`, `roles.delete`, `roles.assign` |
| | `audit_logs` | `audit_logs.view`, `audit_logs.export` |
| Catalog | `products` | `products.view`, `products.create`, `products.edit`, `products.delete`, `products.publish`, `products.import`, `products.export` |
| | `categories` | `categories.view`, `categories.create`, `categories.edit`, `categories.delete` |
| | `brands` | `brands.view`, `brands.create`, `brands.edit`, `brands.delete` |
| | `inventory` | `inventory.view`, `inventory.adjust`, `inventory.export` |
| Sales | `orders` | `orders.view`, `orders.edit`, `orders.cancel`, `orders.refund`, `orders.export` |
| | `returns` | `returns.view`, `returns.approve` |
| | `payments` | `payments.view` |
| Customers | `customers` | `customers.view`, `customers.edit`, `customers.activate`, `customers.export` |
| | `reviews` | `reviews.view`, `reviews.approve`, `reviews.delete` |
| Marketing | `coupons` | `coupons.view`, `coupons.create`, `coupons.edit`, `coupons.delete` |
| Insights | `reports` | `reports.view`, `reports.export` |
| System | `settings` | `settings.view`, `settings.edit` |

**Sensitive** (flagged `isSensitive`, highlighted in the UI and always audited): all `*.delete`, `orders.refund`, `orders.cancel`, `roles.*` except `view`, `users.activate`, `users.delete`, `audit_logs.export`, `settings.edit`.

**Post-MVP modules** (added to the catalog when built): `promotions`, `shipping`, `warehouses`, `suppliers`, `analytics`, `content`, `notifications`.

`users.invite` also covers resending and revoking invitations. Viewing the invitations list requires `users.view`.

### 5.3 Catalog file & sync
```typescript
// server/src/modules/permissions/catalog/permissions.catalog.ts
export const PERMISSION_CATALOG = [
  {
    group: 'Catalog',
    module: 'products',
    permissions: [
      { action: 'view',   name: 'View Products',   description: 'Browse products and their details' },
      { action: 'create', name: 'Create Products', description: 'Add new products and variants' },
      { action: 'delete', name: 'Delete Products', description: 'Permanently remove products', sensitive: true },
      // …
    ],
  },
  // …
] as const satisfies readonly PermissionGroupDef[];
```

**Sync algorithm** (`PermissionSyncService`, runs from `npm run seed` **and** on server start; idempotent):
1. Flatten the catalog into keys and validate: pattern, known action, no duplicates. Invalid → **fail startup**.
2. Upsert each key: set name, description, group, order and sensitive flag; clear `deprecated`.
3. Keys in the DB but not in the catalog → `deprecated: true` (never hard-deleted, since roles may still reference them).
4. Log `added / updated / deprecated` counts.

**Frontend key constants:** `npm run gen:permissions` generates `packages/shared/src/constants/permissionKeys.ts` (a typed union of keys) from the catalog. CI fails if the generated file is stale. The UI list itself always comes from the API.

---

## 6. Default Roles (Seeded)

Seeded once, idempotently (matched by `key`). Admins may edit every role except `super_admin`, and delete every role except the system ones.

| Role | Key | System | Summary |
|---|---|---|---|
| Super Admin | `super_admin` | ✅ | `*`, everything, including future permissions |
| Admin | `admin` | ✅ | Everything except `settings.edit` and `audit_logs.export` |
| Operations Manager | `operations_manager` | | Orders, returns, inventory, customers (view), reports |
| Catalog Manager | `catalog_manager` | | Products, categories, brands, inventory |
| Order Manager | `order_manager` | | Orders (no refund), returns (view), customers (view) |
| Customer Support | `customer_support` | | Customers, orders (view), reviews, returns (view) |
| Marketing Manager | `marketing_manager` | | Coupons, reviews, products (view), reports (view) |
| Finance Manager | `finance_manager` | | Payments, refunds, orders (view/export), reports |
| Warehouse Manager | `warehouse_manager` | | Inventory, orders (view/edit status), products (view) |

**Seed matrix** (✔ = granted; blank = not granted; everyone gets `dashboard.view`):

| Permission | Ops | Catalog | Order | Support | Marketing | Finance | Warehouse |
|---|---|---|---|---|---|---|---|
| products.view | ✔ | ✔ | ✔ | ✔ | ✔ | | ✔ |
| products.create / edit / publish | | ✔ | | | | | |
| products.delete / import / export | | ✔ | | | | | |
| categories.* , brands.* | | ✔ | | | | | |
| inventory.view | ✔ | ✔ | ✔ | | | | ✔ |
| inventory.adjust / export | ✔ | ✔ | | | | | ✔ |
| orders.view | ✔ | | ✔ | ✔ | | ✔ | ✔ |
| orders.edit | ✔ | | ✔ | | | | ✔ |
| orders.cancel | ✔ | | ✔ | | | | |
| orders.refund | | | | | | ✔ | |
| orders.export | ✔ | | ✔ | | | ✔ | |
| returns.view | ✔ | | ✔ | ✔ | | ✔ | |
| returns.approve | ✔ | | | | | ✔ | |
| payments.view | | | | | | ✔ | |
| customers.view | ✔ | | ✔ | ✔ | ✔ | ✔ | |
| customers.edit / activate | | | | ✔ | | | |
| reviews.view / approve / delete | | | | ✔ | ✔ | | |
| coupons.* | | | | | ✔ | | |
| reports.view | ✔ | | | | ✔ | ✔ | |
| reports.export | ✔ | | | | | ✔ | |

The exact grants live in `roles.seed.ts`; this table is the reviewed specification for it.

---

## 7. Authorization Architecture

### 7.1 Request pipeline
```
Request
  → ThrottlerGuard            rate limits (existing)
  → JwtAuthGuard              valid session? loads req.user (existing)
  → PasswordChangeGuard       forced password change (existing)
  → AccountTypeGuard          @StaffOnly() / @CustomerOnly() routes
  → PermissionsGuard          @RequirePermissions(...) ⊆ effective permissions?
  → Controller → Service      business-rule checks (§8): self-modification, last super admin, escalation
```

### 7.2 Decorators
```typescript
@StaffOnly()                                   // class-level on every /admin controller
@Controller('admin/roles')
export class RolesController {
  @Get()
  @RequirePermissions('roles.view')
  list() { … }

  @Put(':id/permissions')
  @RequirePermissions('roles.assign')          // multiple keys = ALL required
  assignPermissions() { … }
}
```
- `@RequirePermissions(...keys)` requires **all** keys; `@RequireAnyPermission(...keys)` requires at least one.
- Keys are type-checked against the generated `PermissionKey` union, so a typo fails compilation.
- **Default deny:** a lint rule and unit test fail if a route under `/admin/*` has neither `@RequirePermissions`, `@RequireAnyPermission` nor an explicit `@StaffOnly()` with an `@AllowAnyStaff()` justification (e.g. `/admin/me`).

### 7.3 Resolving effective permissions
`PermissionResolverService.forUser(user)`:
1. Load the user's roles by `roleIds` (from an in-memory cache keyed by role id, TTL 60s, busted on any role write).
2. Drop `INACTIVE` roles.
3. Union their `permissions`. If any role holds `*`, return **all non-deprecated keys**.
4. Remove deprecated keys. Add implied `view` keys.

- The result is attached to `req.user.permissions` for the rest of the request.
- **Multi-instance note:** the cache is per process. With more than one API instance, either keep the short TTL (≤ 60s staleness on *grants*; revocations are also covered by re-reading the role on the sensitive routes in §8), or move to Redis pub/sub invalidation when Redis is introduced.

### 7.4 Session effects
| Event | Effect |
|---|---|
| Role permissions changed | Effective on the next request (≤ cache TTL). No re-login needed |
| Role deactivated | Its grants disappear on the next request |
| User deactivated or soft-deleted | **All sessions revoked immediately** (`TokenService.revokeAllForUser`); `JwtStrategy` already rejects inactive users |
| User's role changed | Effective on the next request; sessions kept |

### 7.5 Frontend
- `GET /auth/me` returns `permissions: string[]` (effective, with `*` already expanded) for staff users.
- The shared `AuthContext` exposes `can(key)` / `canAny(...keys)`, plus a `<Can permission="users.invite">` component and `<ProtectedRoute permission="roles.view">`.
- The sidebar, buttons and row actions are filtered with the same keys. This is cosmetic; the server is the authority.
- On a `403 PERMISSION_DENIED`, the client refreshes `/auth/me` (permissions may have changed) and shows a toast.

---

## 8. Business Rules & Guardrails

| # | Rule | Enforced in | Error code |
|---|---|---|---|
| R1 | A role assigned to any user **or** any open (`INVITED`) invitation cannot be deleted. Deactivate it or reassign first | RolesService | `ROLE_IN_USE` (details include `userCount`, `invitationCount`) |
| R2 | System roles can't be deleted; `super_admin` can't be edited or deactivated | RolesService | `ROLE_SYSTEM_PROTECTED` |
| R3 | Role `key` is immutable; `name` and `key` are unique | RolesService + unique index | `ROLE_NAME_TAKEN`, `ROLE_KEY_TAKEN` |
| R4 | Only known, non-deprecated keys can be assigned; `*` only to `super_admin` | RolesService (validated against the catalog) | `UNKNOWN_PERMISSION` |
| R5 | **No escalation:** the permissions granted to a role, or the roles assigned to a user or invitation, must be ⊆ the actor's effective permissions (Super Admin exempt) | RolesService, UsersService, InvitationsService | `PRIVILEGE_ESCALATION` |
| R6 | There must always be **≥ 1 active Super Admin**. The last one can't be deactivated, deleted, or have the role removed | UsersService | `LAST_SUPER_ADMIN` |
| R7 | Actors can't change their **own** role or status, or delete themselves | UsersService | `SELF_MODIFICATION_FORBIDDEN` |
| R8 | Inactive roles can't be newly assigned (existing holders keep the reference but get no grants) | UsersService, InvitationsService | `ROLE_INACTIVE` |
| R9 | Invitation email must not belong to an existing staff user or an open invitation. Customer emails can't be invited: staff and customer accounts are separate | InvitationsService | `EMAIL_TAKEN`, `INVITATION_PENDING_EXISTS` |
| R10 | `userCode` is unique across staff users and open invitations | InvitationsService, UsersService | `USER_CODE_TAKEN` |
| R11 | Deactivating or deleting a user revokes all their sessions immediately | UsersService → TokenService | — |
| R12 | Soft-deleted users keep their `email` reserved until purged (post-MVP); they don't appear in lists | UsersService | — |
| R13 | Optional: `STAFF_EMAIL_DOMAINS=zylo.com,zylo.in` restricts invitations to company domains | InvitationsService | `EMAIL_DOMAIN_NOT_ALLOWED` |

All errors use the existing `AppException` and `ErrorCode` envelope. New codes are listed in §10.6.

---

## 9. Flows

### 9.1 Invite → Accept
```
Admin (users.invite)
  │  POST /admin/invitations { firstName, lastName, email, userCode, designation, roleIds, message }
  ▼
InvitationsService
  ├─ validate R5, R8, R9, R10, R13
  ├─ token = random 32 bytes (base64url); store SHA-256(token) only
  ├─ status = INVITED, expiresAt = now + 7d
  ├─ email: {ADMIN_URL}/accept-invite?token=<token>   (no user id or role in the URL)
  └─ audit INVITATION_SENT
  ▼
Invitee opens the link → admin app /accept-invite
  │  POST /invitations/verify { token }  → { firstName, email (masked), roleName, expiresAt }
  ▼
Invitee sets a password (+ confirm; shared password policy)
  │  POST /invitations/accept { token, password }
  ▼
InvitationsService (single atomic transition)
  ├─ findOneAndUpdate({ tokenHash, status: INVITED, expiresAt > now }, { status: REGISTERED, … })
  │     → null? distinguish EXPIRED / REVOKED / REGISTERED / invalid (§10.6)
  ├─ re-check R8 (role still active) and R9 (email still free)
  ├─ create user: accountType STAFF, roleIds, status ACTIVE, isEmailVerified true,
  │               hasPassword true, mustChangePassword false, invitationId
  ├─ link invitation.userId, registeredAt
  └─ audit INVITATION_ACCEPTED + USER_CREATED
  ▼
Redirect to /login with "Account created, please sign in"
(the first sign-in then offers 2FA setup; see §17 "Enforce 2FA for staff")
```
The token-to-`REGISTERED` transition is a single conditional update. Two concurrent accepts can't both succeed; the loser gets `INVITATION_ALREADY_ACCEPTED`.

### 9.2 Resend / Revoke / Expire
| From status | Resend (`users.invite`) | Revoke (`users.invite`) |
|---|---|---|
| `INVITED` | New token (**old link stops working**), `expiresAt` reset, `sentCount++` | → `REVOKED` |
| `EXPIRED` | New token, back to `INVITED` | → `REVOKED` |
| `REVOKED` | New token, back to `INVITED` (subject to R8–R10 re-check) | — |
| `REGISTERED` | — (shows "View user") | — |

- **Expiry:** status `EXPIRED` is written lazily. Every read and verify treats `INVITED && expiresAt < now` as expired and persists the change. A daily job (post-MVP) sweeps the rest.
- **Resend throttling:** at most 1 resend per invitation per 60 seconds, and at most 5 per day (`INVITATION_RESEND_LIMIT`).

### 9.3 Role lifecycle
```
Create role (roles.create) → status ACTIVE, permissions [] (or copied from "Start from role…")
Edit details (roles.edit)  → name/description/status; key immutable
Assign permissions (roles.assign) → PUT full permission set; server computes the diff for the audit log
Delete (roles.delete)      → blocked by R1/R2; otherwise hard delete + audit ROLE_DELETED
```

### 9.4 User lifecycle
```
(Invitation accepted) → ACTIVE
ACTIVE ⇄ INACTIVE   (users.activate; R6, R7; deactivation revokes sessions)
Edit profile        (users.edit: firstName, lastName, designation, userCode)
Change role         (roles.assign: R5, R6, R7, R8)
Delete              (users.delete: soft delete; R6, R7; revokes sessions)
Reset password      → sends the standard reset email (existing flow); the admin never sees passwords
```

---

## 10. API Specification

All routes are under `/api/v1`. Admin routes are `@StaffOnly()`. Every list is paginated (`page`, `limit ≤ 100`) and returns `{ items, meta }`, the existing envelope.

### 10.1 Permissions (read-only)
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/admin/permissions` | `roles.view` | Catalog grouped by `group` → `module` → permissions (non-deprecated only) |

### 10.2 Roles
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/admin/roles` | `roles.view` | List with `userCount`, `permissionCount`. Filters: `q`, `status` |
| POST | `/admin/roles` | `roles.create` | `{ name, key?, description, permissions?, copyFromRoleId? }` |
| GET | `/admin/roles/:id` | `roles.view` | Details + counts |
| PATCH | `/admin/roles/:id` | `roles.edit` | `{ name?, description?, status? }` |
| PUT | `/admin/roles/:id/permissions` | `roles.assign` | `{ permissions: string[] }` (full replacement; returns the diff) |
| GET | `/admin/roles/:id/users` | `roles.view` + `users.view` | Users holding the role (paginated) |
| DELETE | `/admin/roles/:id` | `roles.delete` | R1, R2 |

### 10.3 Users (staff)
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/admin/users` | `users.view` | Filters below |
| GET | `/admin/users/:id` | `users.view` | Profile, roles, effective permissions, last login, 2FA status, recent audit events |
| PATCH | `/admin/users/:id` | `users.edit` | `{ firstName?, lastName?, designation?, userCode? }` |
| PUT | `/admin/users/:id/roles` | `roles.assign` | `{ roleIds: [id] }` (MVP: exactly one) |
| POST | `/admin/users/:id/activate` | `users.activate` | |
| POST | `/admin/users/:id/deactivate` | `users.activate` | Revokes sessions |
| POST | `/admin/users/:id/reset-password` | `users.edit` | Emails a reset link (existing flow) |
| DELETE | `/admin/users/:id` | `users.delete` | Soft delete, revokes sessions |

**User list query:** `q` (name, email or User ID), `roleId`, `status`, `designation`, `createdFrom`/`createdTo`, `lastLoginFrom`/`lastLoginTo`, `sort` (`name`, `createdAt`, `lastLoginAt`; `-` prefix = desc).

### 10.4 Invitations
| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/admin/invitations` | `users.view` | Filters: `q`, `status`, `roleId`, `invitedBy`, `invitedFrom`/`invitedTo` |
| POST | `/admin/invitations` | `users.invite` | Create and send |
| POST | `/admin/invitations/:id/resend` | `users.invite` | New token and email (§9.2) |
| POST | `/admin/invitations/:id/revoke` | `users.invite` | |
| POST | `/invitations/verify` | Public, throttled 5/min | `{ token }` → invitee preview |
| POST | `/invitations/accept` | Public, throttled 5/min | `{ token, password }` |

### 10.5 Current user
`GET /auth/me` adds `permissions: string[]` and `roles: [{ id, name, key }]` for staff.

### 10.6 New error codes
`PERMISSION_DENIED` (403), `ROLE_IN_USE`, `ROLE_SYSTEM_PROTECTED`, `ROLE_NAME_TAKEN`, `ROLE_KEY_TAKEN`, `ROLE_INACTIVE`, `UNKNOWN_PERMISSION`, `PRIVILEGE_ESCALATION` (403), `LAST_SUPER_ADMIN`, `SELF_MODIFICATION_FORBIDDEN` (403), `USER_CODE_TAKEN`, `INVITATION_PENDING_EXISTS`, `INVITATION_EXPIRED`, `INVITATION_REVOKED`, `INVITATION_ALREADY_ACCEPTED`, `INVITATION_INVALID`, `EMAIL_DOMAIN_NOT_ALLOWED`.
Conflicts return 409; validation errors 400; the invitation states 410 (`EXPIRED`, `REVOKED`), 409 (`ALREADY_ACCEPTED`) or 400 (`INVALID`).

---

## 11. Admin UI Specification

### 11.1 Navigation (sidebar group "User Management")
```
User Management
├── Users          /users          (users.view)
├── Roles          /roles          (roles.view)
└── Invitations    /invitations    (users.view)
```
Permissions are **not** a sidebar item. They're edited inside Role Details → Permissions, so the read-only catalog never looks like something admins manage.

### 11.2 Routes
| Route | Page | Guard |
|---|---|---|
| `/users` | Users list | `users.view` |
| `/users/:id` | User details (tabs: Overview · Activity) | `users.view` |
| `/roles` | Roles list | `roles.view` |
| `/roles/new` | Create role | `roles.create` |
| `/roles/:id` | Role details (tabs: Overview · Permissions · Users) | `roles.view` |
| `/invitations` | Invitations list | `users.view` |
| `/accept-invite?token=` | Accept invitation (public, `AuthCard`) | — |

"Invite user", "Edit user" and "Edit role details" open **side drawers**, so the list context stays visible.

### 11.3 Users list
- **Columns:** Name + email (avatar initials) · User ID · Role · Designation · Status (badge; `LOCKED` shown as an extra badge) · 2FA · Last login (relative time, exact on hover) · Created · Actions (⋯ menu).
- **Row actions**, each hidden without its permission: View · Edit · Change role · Activate/Deactivate · Send password reset · Delete.
- **Filters bar:**
  - Search (debounced 300 ms)
  - Role and Status selects
  - Designation (typeahead from distinct values)
  - Created and Last-login date ranges
  - "Clear filters"
  - **Filters are kept in the URL query string**, so views can be shared and survive a refresh
- **Header:** `Invite user` button (`users.invite`), plus a "Pending invitations (N)" link to `/invitations?status=INVITED`.
- **States:** skeleton rows, error with retry, and an empty state for "no staff yet" vs "no matches".

### 11.4 Invite user (drawer)
- **Fields:** First name*, Last name*, Email*, User ID*, Designation, Role* (only active roles within the actor's permissions, R5), Personal note (500 chars, live counter).
- **Preview line:** "They'll receive an email valid for 7 days."
- **On success:** a toast, the drawer closes, and the invitation appears at the top of the Invitations list.

### 11.5 Invitations list
- **Columns:** Invitee (name + email) · Role · Status badge (`INVITED` blue, `REGISTERED` green, `EXPIRED` amber, `REVOKED` grey) · Invited by · Invited at · Expires at ("in 3 days" / "expired 2 days ago") · Registered at · Actions.
- **Actions follow §9.2:** INVITED → Resend, Revoke · EXPIRED → Resend, Revoke · REVOKED → Resend · REGISTERED → View user.
- **Confirm dialogs** for Revoke, and for Resend ("the previous link will stop working").
- **Status tabs** across the top: All · Invited · Expired · Revoked · Registered, with counts.

### 11.6 Role details
**Header card**
- Name, key (monospace, copy button), description, and a status badge.
- Stat chips: **Users 8 · Permissions 12**.
- `Edit`, `Activate/Deactivate` and `Delete` buttons (disabled with a tooltip explaining why: system role, or "assigned to 8 users").

**Tabs**
1. **Overview:** description, created/updated by and when, recent audit events for this role.
2. **Permissions:** the permission editor (§11.7).
3. **Users:** paginated table of holders, with a link to each user and a "Change role" action.

### 11.7 Permission editor
```
Role: Catalog Manager                          12 of 48 selected   [Search permissions…]

▼ Catalog                                              7/11  [Select all] [Clear]
  ▼ Products                                           5/7
     ☑ View Products          Browse products and their details
     ☑ Create Products        Add new products and variants
     ☑ Edit Products          Update product details and pricing
     ☐ Delete Products  ⚠     Permanently remove products        (sensitive)
     …
▶ Sales                                                0/9
▶ Access control                                       0/12

                         [Discard changes]   [Save permissions (3 changes)]
```
- **Layout:** accordion by group → module, with a tri-state module checkbox (all / some / none).
- **Bulk actions:** "Select all" and "Clear" per group and module.
- **Search** filters by name, key or description and auto-expands matches.
- **Implied view:** ticking any action auto-ticks `view` with a hint. Unticking `view` unticks the module's other actions.
- **Protected permissions:** those the actor doesn't hold (R5) are disabled, with the tooltip "You can't grant a permission you don't have".
- **Sensitive** permissions show ⚠ and are listed in the save confirmation.
- **Unsaved changes:**
  - A dirty badge and change counter.
  - A sticky save bar.
  - Navigation is blocked (React Router `useBlocker` + `beforeunload`) with a "Discard changes?" dialog.
- **Saving:**
  - A confirmation modal summarises the diff ("Adding 3, removing 1").
  - The PUT is sent.
  - On success the baseline resets, and a toast shows "Permissions updated. Effective immediately for 8 users."
- `super_admin` shows a read-only notice ("Super Admin always has every permission").

### 11.8 Accept invitation (public page, admin app)
- **Verifying:** a spinner while the token is checked.
- **Valid:** "Hi Priya, you've been invited by John Doe to join ZYLO as **Catalog Manager**." The email is shown read-only, then Password and Confirm fields with the strength meter, then "Create account".
- **Invalid, expired or revoked:** a clear message plus "Ask your administrator to resend the invitation".
- **Already accepted:** "This invitation was already used", with a link to sign in.

### 11.9 New shared UI (packages/shared/src/ui)
These are reused by later modules:
- `Drawer`
- `ConfirmDialog`
- `Tabs`
- `DropdownMenu`
- `DateRangeField`
- `SearchInput` (debounced)
- `EmptyState`
- `useUrlFilters` hook (query-string ↔ filter state)
- `useUnsavedChangesGuard` hook

---

## 12. Audit Logging

Every mutation writes one audit record through `AuditService.log()`, with actor, target resource and a field-level diff.

| Event | Resource | `changes` example |
|---|---|---|
| `ROLE_CREATED` | ROLE | `name`, `key`, initial `permissions` |
| `ROLE_UPDATED` | ROLE | `{ field: 'status', from: 'ACTIVE', to: 'INACTIVE' }` |
| `ROLE_DELETED` | ROLE | snapshot of name, key, permissions |
| `ROLE_PERMISSIONS_UPDATED` | ROLE | `{ field: 'permissions', from: [...], to: [...] }` plus `metadata.added[]`, `metadata.removed[]` |
| `USER_CREATED` | USER | via invitation id |
| `USER_UPDATED` | USER | changed profile fields |
| `USER_ROLE_CHANGED` | USER | `roleIds` from → to |
| `USER_ACTIVATED` / `USER_DEACTIVATED` | USER | `status` |
| `USER_DELETED` | USER | snapshot |
| `USER_PASSWORD_RESET_SENT` | USER | — |
| `INVITATION_SENT` / `INVITATION_RESENT` / `INVITATION_REVOKED` / `INVITATION_ACCEPTED` / `INVITATION_EXPIRED` | INVITATION | status, role |
| `PERMISSION_DENIED` | — | the attempted route and permission (sampled, to spot probing) |

Example record:
```json
{
  "event": "ROLE_PERMISSIONS_UPDATED",
  "actorId": "…", "actorEmail": "john@zylo.com",
  "resourceType": "ROLE", "resourceId": "…", "resourceName": "Catalog Manager",
  "changes": [{ "field": "permissions", "from": ["products.view"], "to": ["products.view", "products.delete"] }],
  "metadata": { "added": ["products.delete"], "removed": [] },
  "ip": "203.0.113.7", "userAgent": "…", "createdAt": "2026-09-30T12:45:00Z"
}
```
The existing Security Logs page gains filters for **resource type**, **actor** and **event group** (Auth · Users · Roles · Invitations), plus a details drawer that renders the `changes` diff.
Viewing requires `audit_logs.view`; export (CSV, post-MVP) requires `audit_logs.export`.

---

## 13. Code Organisation

### 13.1 Server
```
server/src/
├── common/authorization/
│   ├── require-permissions.decorator.ts   @RequirePermissions / @RequireAnyPermission
│   ├── account-type.decorator.ts          @StaffOnly / @CustomerOnly
│   ├── permissions.guard.ts
│   ├── account-type.guard.ts
│   └── permission-resolver.service.ts     effective permissions + role cache
├── modules/permissions/
│   ├── catalog/permissions.catalog.ts     ← source of truth
│   ├── schemas/permission.schema.ts
│   ├── permission-sync.service.ts         catalog → DB (startup + seed)
│   ├── permissions.service.ts             read / group / validate keys
│   └── permissions.controller.ts          GET /admin/permissions
├── modules/roles/
│   ├── schemas/role.schema.ts
│   ├── dto/ (create-role, update-role, assign-permissions, role-query)
│   ├── roles.service.ts                   CRUD + R1–R5
│   ├── role-permissions.service.ts        diff, escalation check, cache bust
│   └── roles.controller.ts
├── modules/staff-users/
│   ├── dto/ (update-staff-user, assign-roles, staff-user-query)
│   ├── staff-users.service.ts             list/filter/update, R6, R7, R11
│   ├── staff-user-status.service.ts       activate / deactivate / delete + session revoke
│   └── staff-users.controller.ts
└── modules/invitations/
    ├── schemas/staff-invitation.schema.ts
    ├── dto/ (create-invitation, invitation-query, verify, accept)
    ├── invitations.service.ts             create, resend, revoke, list
    ├── invitation-acceptance.service.ts   verify + accept (atomic)
    ├── invitations.controller.ts          /admin/invitations
    └── public-invitations.controller.ts   /invitations/verify|accept
```
- Every service stays under 200 lines.
- `UsersService` remains the only data-access layer for the `users` collection.
- The prototype `modules/admin/` is dissolved into these modules (§14).

### 13.2 Admin app
```
apps/admin/src/
├── features/users/        UsersTable, UserFilters, InviteUserDrawer, EditUserDrawer, ChangeRoleDialog
├── features/roles/        RolesTable, RoleForm, RoleHeader, PermissionEditor/ (Accordion, ModuleGroup, useRolePermissionsDraft)
├── features/invitations/  InvitationsTable, InvitationStatusBadge, InvitationActions
├── services/              roles.service.ts, staffUsers.service.ts, invitations.service.ts, permissions.service.ts
└── pages/                 UsersPage, UserDetailsPage, RolesPage, RoleCreatePage, RoleDetailsPage,
                           InvitationsPage, AcceptInvitePage
```
Shared: `can()`, `<Can>`, the `ProtectedRoute` `permission` prop, generated `permissionKeys.ts`, and the new UI primitives (§11.9).

---

## 14. Migration From the Current Prototype

Run as a one-off, idempotent migration script (`seeds/migrations/2026-10-user-management.js`), plus code changes:

1. **Catalog & roles:** run the permission sync; seed the default roles (§6).
2. **Users:**
   - Customers: `accountType = CUSTOMER`.
   - Staff (`role ∈ {SUPPORT_AGENT, MANAGER, ADMIN, SUPER_ADMIN}`): `accountType = STAFF`, and `roleIds` mapped as SUPER_ADMIN → `super_admin`, ADMIN → `admin`, MANAGER → `operations_manager`, SUPPORT_AGENT → `customer_support`.
   - Split `name` into `firstName`/`lastName` (first space).
   - `status` from `isActive`.
3. **Per-user `customPermissions`:** users whose custom grants differ from their mapped role's permissions are listed in the migration report, so an admin can create a dedicated role for them. The field is then removed.
4. **Invitations:**
   - Status mapping: `PENDING` → `INVITED`, `ACCEPTED` → `REGISTERED`.
   - `role` enum → `roleIds` via the same mapping.
   - `name` is split.
   - Missing `userCode` becomes `LEGACY-<shortid>`.
5. **Permission keys:** map old keys to new ones (`catalog:view` → `products.view`, `categories.view`, `brands.view`, `inventory.view`; `catalog:manage` → the create/edit keys; …). The map lives in the migration file.
6. **Code:**
   - Replace `@Roles(UserRole.X)` on admin routes with `@RequirePermissions(...)`.
   - Replace portal checks (`isStaffRole`) with `accountType`.
   - Update `AuthProvider` role filtering to use `accountType`.
   - Delete `packages/shared/src/constants/permissions.ts` and the staff roles in `USER_ROLES`.
   - Existing routes: `/audit-logs` → `audit_logs.view`.
7. **Cleanup** (a later release, after verification): drop the `role` enum field and `customPermissions`.

The `/auth/login` vs `/auth/admin/login` split keeps working: it simply checks `accountType` instead of the role enum.

---

## 15. Delivery Phases & Acceptance Criteria

| Phase | Scope | Acceptance criteria |
|---|---|---|
| **P1: Foundation** | Permission catalog + sync; roles collection + seed; user schema fields; `PermissionResolverService`, `PermissionsGuard`, decorators; `/auth/me` permissions; migration script; the existing `/audit-logs` route moved to a permission | Seed is idempotent (run twice → no changes). A user without `audit_logs.view` gets 403 `PERMISSION_DENIED` on `/audit-logs`. Deactivating a role removes access on the next request. The "default deny" test covers every admin route |
| **P2: Roles** | Roles API; roles list, create, details (tabs), permission editor | R1–R5 covered by tests. The editor supports search, select/clear all, counts, implied view and an unsaved-changes guard. Diffs appear in audit logs |
| **P3: Users** | Users API; list with all filters (URL-synced), details, edit, change role, activate/deactivate, soft delete, reset password | R6, R7, R11 covered by tests. A deactivated user's open session gets 401 on the next request. Filters are shareable via URL |
| **P4: Invitations** | Invitations API; invite drawer, list with tabs and actions, email, accept page | Full invite → accept → login journey works. Resend kills the old link. Expired, revoked and used tokens show the right messages. Concurrent accept → exactly one success |
| **P5: Frontend gating & audit UI** | `can()`/`<Can>`, sidebar/actions gated by permission, `ProtectedRoute` permission prop; audit log resource filters + diff drawer | A role with only `orders.view` sees only the dashboard and orders. Hidden buttons' APIs still return 403 when called directly |
| **P6: Hardening** | E2E suite, docs (`08`, `11`, `07`), migration run on staging, remove the prototype | 0 TypeScript errors, lint clean, all services < 200 lines, docs updated, the `line-items.md` §1 RBAC items ticked |

Suggested order: P1 → P2 → P4 → P3 → P5 → P6. Invitations come before full user editing because they are how the first real staff accounts get created.

---

## 16. Testing Plan

**Unit (server)**
- Catalog validation: bad pattern, duplicate key, unknown action → startup fails.
- `PermissionResolverService`: union of roles, inactive role ignored, `*` expansion, deprecated keys dropped, implied `view`.
- Every guardrail R1–R13, including escalation with a crafted payload.
- Invitation state machine: every transition in §9.2 plus the invalid ones.

**API end-to-end** (extends the existing 57-check auth suite)
1. Super admin creates "Catalog Manager", assigns products.*, and invites a user.
2. Accept via the emailed token; the new user logs in and can `GET /products`, but gets 403 on `DELETE /products/:id` until `products.delete` is granted; after the grant it succeeds without re-login.
3. Resend → old token 400/410, new token works.
4. Revoke → accept returns `INVITATION_REVOKED`.
5. Expire (time travel) → `INVITATION_EXPIRED` and status persisted.
6. Two parallel accepts → one 200, one `INVITATION_ALREADY_ACCEPTED`.
7. Delete an in-use role → `ROLE_IN_USE`; deactivate works.
8. An admin without `settings.edit` tries to grant `settings.edit` → `PRIVILEGE_ESCALATION`.
9. The last super admin tries to deactivate themselves → `SELF_MODIFICATION_FORBIDDEN`; another admin tries to → `LAST_SUPER_ADMIN`.
10. Deactivate a signed-in user → their next request gets 401 and refresh fails.
11. Every mutation above produced exactly one audit record with the right diff.

**Frontend**
- Permission editor reducer: tri-state, implied view, select/clear all, dirty tracking.
- `can()` gating snapshot for each seeded role.
- Accept page: all five token states.

---

## 17. Post-MVP Backlog
- Multiple roles per user in the UI (the data model is ready: D4)
- **Enforce 2FA for all staff: scheduled right after launch** (policy flag; the first login forces setup)
- Bulk actions (activate/deactivate/delete) and bulk invitations
- CSV user import/export, CSV audit export
- Role cloning ("Start from role…" in create is in MVP; a full clone with users is later)
- Permission templates
- Per-user login history and active-sessions view, with admin "force logout"
- Scheduled job to expire invitations and purge soft-deleted users after the retention period
- Redis-backed permission cache invalidation for multi-instance deployments
- Record-level scopes (e.g. warehouse- or brand-scoped managers)

---

## 18. Resolved Decisions
Confirmed by the product owner on 2026-09-30.

| # | Question | Decision |
|---|---|---|
| Q1 | What is "User ID"? | A **reference code only** (`userCode`, e.g. `ZY-0042`), shown in lists and search. Staff **sign in with email + password**; the User ID is never a login credential |
| Q2 | Can customer accounts be staff? | **No.** Customers and admin users are completely separate: customers never appear in admin user management, and a customer's email can't be invited (R9) |
| Q3 | Invitation validity | **7 days** (`INVITATION_TTL=7d`) |
| Q4 | After accepting an invitation | **Send to the login page.** One code path through lockout, audit and 2FA |
| Q5 | System `admin` role | **Editable, but can't be deleted.** `super_admin` is neither editable nor deletable |
| Q6 | Enforce 2FA for staff | **Right after launch** (first post-MVP item, §17) |
