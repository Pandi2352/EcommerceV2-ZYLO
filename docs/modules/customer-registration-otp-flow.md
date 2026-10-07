# Amazon-Style Customer Registration & OTP Verification Flow

## Overview
Customer registration has been updated to follow Amazon's 2-step email verification pattern:
1. **Email-First Input**: Customer enters only their email address.
2. **Email OTP Verification & Account Creation**: Customer enters the 6-digit OTP sent to their email, provides their name, and creates their password in one smooth, secure step.
3. **Strict Cooldown Enforcement**: A 60-second cooldown timer is displayed and enforced on the verify page for resending OTPs.
4. **Instant Verification**: Accounts registered via OTP are immediately marked `isEmailVerified: true` and authenticated with active session cookies.

---

## API Endpoints

### 1. `POST /api/v1/auth/register/send-otp`
- **Request Body**: `{ email: string }`
- **Behavior**:
  - Checks if the email is already registered (`409 Conflict`).
  - Checks if an active OTP was requested within the last 60 seconds (`429 Too Many Requests`).
  - Generates a 6-digit numeric OTP and stores a SHA-256 hash in MongoDB (`registration_otps` collection with a 10-minute TTL index).
  - Sends the OTP to the email address in the background via `MailService`.
- **Response**:
  ```json
  {
    "message": "A verification code has been sent to your email.",
    "cooldownSeconds": 60
  }
  ```

### 2. `POST /api/v1/auth/register/verify-otp`
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "otp": "123456",
    "name": "Jane Doe",
    "password": "SecurePassword123!"
  }
  ```
- **Behavior**:
  - Validates password strength (minimum 8 characters, letters, and numbers).
  - Verifies the OTP hash against `registration_otps`.
  - Rejects invalid or expired codes.
  - Deletes the OTP record upon successful verification.
  - Creates the customer account with `isEmailVerified: true`.
  - Sets HttpOnly session cookies (`access_token`, `refresh_token`).
- **Response**:
  ```json
  {
    "mfaRequired": false,
    "user": { ... }
  }
  ```

---

## UI Components
- **Storefront Page**: [`apps/storefront/src/pages/customer/RegisterPage.tsx`](file:///d:/mern/ecommerceV2/apps/storefront/src/pages/customer/RegisterPage.tsx)
  - **Step 1**: Clean email input with instant format validation and "Continue" button.
  - **Step 2**:
    - "Verify email address" header with email notice and "(Change)" link.
    - 6-digit monospace OTP input.
    - 60-second countdown cooldown message ("Wait Xs before requesting a new OTP").
    - "Didn't receive the OTP? Resend OTP" action button once timer reaches 0.
    - Full name and password creation with show/hide password toggles.
    - "Create your ZYLO account" button.
