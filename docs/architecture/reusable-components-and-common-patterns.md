# Common & Reusable Components Checklist (FE & BE)

## 1. Frontend: Common UI Components (`@shared/ui/`)
- [x] **`Button`**: Primary, secondary, outline, ghost, danger, social (`whitespace-nowrap`, `leftIcon`, `rightIcon`, sizes `xs`-`lg`)
- [x] **`Dropdown`**: Custom searchable select (universal replacement for native `<select>`)
- [x] **`Pagination`**: Page navigation with configurable page sizes (`5, 10, 15, 20, 50`) aligned right (`ml-auto`)
- [x] **`PageHeader`**: Title, counter badge, subtitle, and right-aligned action buttons
- [x] **`KpiMetricsGrid`**: 4-column metric cards grid with `react-icons/fc` flat color icons
- [x] **`TagInput`**: Chip/tag input for keywords, search facets, and badges
- [x] **`SeoSnippetPreview`**: Google SERP search result preview card
- [x] **`Drawer`**: Slide-over drawer panel for create/edit forms
- [x] **`Tabs`**: Single-line horizontal tab switcher
- [x] **`Alert`**: Inline message banner (`error`, `success`, `warning`, `info`)
- [x] **`InputField`**: Text, email, number, URL input with helper text & error states
- [x] **`PasswordField`**: Password input with visibility toggle & strength meter
- [x] **`DataTable`**: Generic data table with custom column renderers
- [x] **`ConfirmDialog`**: Action confirmation modal
- [x] **`StatusPill`**: Active/inactive status indicator
- [x] **`SearchInput`**: Debounced search input with clear button
- [x] **`FilterDropdown`**: Toolbar dropdown filter pill
- [x] **`PageLoader` & `ApiLoader`**: Full-screen mascot loader and scoped content loader
- [x] **`Toast` & `Toaster`**: Global toast notification system
- [x] **`Avatar`**: User/entity avatar with initials fallback
- [x] **`Badge`**: Status badge and numerical counter pill
- [x] **`Checkbox`**: Accessible custom checkbox

## 2. Frontend: Common Hooks & Utilities (`@shared/`)
- [x] **`useAuth`**: Auth state, user profile, role & permission checks (`can(permission)`)
- [x] **`ProtectedRoute`**: Route protection by role or permission
- [x] **`extractErrorMessage`**: Axios error message extractor
- [x] **`cn`**: Tailwind class merger (`clsx` + `tailwind-merge`)
- [x] **`csv`**: CSV export and import parsing helpers

## 3. Backend: Common Security & Authorization (`server/src/common/`)
- [x] **`JwtAuthGuard`**: JWT access token verification
- [x] **`RolesGuard`**: Hierarchical role verification (`@Roles(...)`)
- [x] **`PermissionsGuard`**: Granular permission verification (`@RequirePermissions(...)`)
- [x] **`AccountTypeGuard`**: Account isolation (`@StaffOnly()`, `@CustomerOnly()`)
- [x] **`ThrottlerGuard`**: Rate limiting
- [x] **`@Public()`**: Bypass auth guard for public endpoints
- [x] **`@CurrentUser()`**: Injects authenticated user into controller methods

## 4. Backend: Common DTOs, Schemas & Utilities (`server/src/common/`)
- [x] **`generateUniqueSlug`**: Universal collision-proof MongoDB slug generator (`common/utils/slug.util.ts`)
- [x] **`SeoDto`**: Common SEO DTO (`common/dto/seo.dto.ts`)
- [x] **`SeoMetadata` & `SeoSchema`**: Common Mongoose SEO subdocument (`common/schemas/seo.schema.ts`)
- [x] **`PaginationQueryDto`**: Base pagination query with `page` and `limit`
- [x] **`crypto.util.ts`**: AES-256-GCM encryption at rest
- [x] **`duration.util.ts`**: Milliseconds and time parsing helpers

---

## 5. Still To Make Common (Next Up)

### Frontend (FE)
- [ ] **`MediaUrlWithPreview`**: URL input + live aspect-ratio image preview + clear button
- [ ] **`DataTableToolbar`**: Wrapper for search input, status dropdown filters, and clear button
- [ ] **`GenericDeleteDialog`**: Universal delete confirmation modal for all entities
- [ ] **`useDataTableQuery`**: Hook managing `page`, `pageSize`, `search`, filters, and sorting
- [ ] **Modular Drawer Tabs**: Break 600+ line drawer files into individual tab components (`GeneralTab`, `MediaTab`, `MerchandisingTab`, `SeoTab`)

### Backend (BE)
- [ ] **`BaseFilterQueryDto`**: Standard query DTO combining `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`
- [ ] **`BaseCatalogService<T>`**: Shared CRUD service methods (`toggleStatus`, `findById`, `softDelete`)
- [ ] **`@AuditAction(event, entity)`**: Method decorator to automate audit logging
