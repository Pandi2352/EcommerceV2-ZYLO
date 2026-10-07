# Customer Account & Address Book Implementation Plan

## 1. Objectives & Scope
This module implements complete self-service account management and address book capabilities for customer storefront shoppers:
- View profile details (Name, email, phone, avatar, account creation date).
- Update profile details (Name, phone, avatar) with immediate session reflection.
- Address book CRUD:
  - List all saved shipping addresses with default badge.
  - Add new shipping address with strict field validation (Street, city, state, postal code, phone).
  - Edit existing shipping address.
  - Delete address with confirmation dialog.
  - Set default shipping address.
- Unified customer account layout shell linking Profile, Address Book, Security, and Orders.

---

## 2. Line Items Checklist
- [ ] View account profile
- [ ] Update profile details (Name, phone, avatar)
- [x] Change password (Authenticated - already implemented in AccountSecuritySections)
- [ ] View saved addresses list
- [ ] Add new shipping address
- [ ] Edit existing address
- [ ] Delete address
- [ ] Set default shipping address
- [ ] Address validation (City, state, postal code, phone)

---

## 3. Backend Architecture (`server`)
- **Module**: `CustomerAccountModule` or extend `UsersModule`.
- **Controller**: `server/src/modules/users/customer-account.controller.ts` with route prefix `/account`:
  - `GET /account/profile`: Retrieve user profile info.
  - `PATCH /account/profile`: Update name, firstName, lastName, phone, avatarUrl.
  - `GET /account/addresses`: Return `user.addresses`.
  - `POST /account/addresses`: Add address with validation and default handling.
  - `PUT /account/addresses/:id`: Update address.
  - `DELETE /account/addresses/:id`: Remove address.
  - `PATCH /account/addresses/:id/default`: Mark address as default.
- **Service**: Implement corresponding methods in `users.service.ts`.
- **DTOs**:
  - `update-profile.dto.ts`
  - `address.dto.ts`

---

## 4. Shared API Client & Types (`packages/shared`)
- **Types**: `packages/shared/src/types/account.ts`:
  - `CustomerAddress`, `CustomerProfile`, `AddressDto`, `UpdateProfileDto`.
- **Service**: `packages/shared/src/api/account.service.ts`:
  - `getProfile()`, `updateProfile()`, `getAddresses()`, `addAddress()`, `updateAddress()`, `deleteAddress()`, `setDefaultAddress()`.

---

## 5. Storefront Frontend Architecture (`apps/storefront`)
- **Shared Layout**: `CustomerAccountLayout.tsx` providing a unified sidebar navigation (Profile, Addresses, Security, Orders) with breadcrumbs and user avatar badge.
- **Profile Page**: `apps/storefront/src/pages/account/CustomerProfilePage.tsx`:
  - Profile card with avatar preview.
  - Full name, phone, and email fields.
  - Synchronizes with `AuthContext` to update header greeting instantly.
- **Addresses Page**: `apps/storefront/src/pages/account/CustomerAddressesPage.tsx`:
  - Grid of address cards with "DEFAULT" badge.
  - "Add Address" drawer/dialog with structured input validation.
  - Edit address modal.
  - Delete confirm dialog.
  - Quick "Set as Default" one-click action.
- **Navigation & Routing**:
  - Add Profile & Address book links to `AccountMenu.tsx`.
  - Remove from `CUSTOMER_ACCOUNT_PLANNED` in `plannedRoutes.ts`.
  - Wire into `AppRoutes.tsx` under `<ProtectedRoute>`.

---

## 6. Aesthetics & Constraints
- Strictly `shadow-none`.
- Uniform `rounded-md` borders.
- Slate-200 borders, amber accents, deep navy primary buttons.
