# Admin UI Kit: How Admin Screens Are Built

Reference implementation: **`apps/admin/src/pages/UsersPage.tsx`** and **`apps/admin/src/features/users/`**.
Every list/detail screen in the admin console follows this file's rules.

## 1. Visual language
| Token | Rule |
|---|---|
| Typeface | Inter (admin only), loaded in `apps/admin/index.html` |
| Page title | `text-xl font-semibold tracking-tight text-zinc-900` (via `PageHeader`) |
| Body / table cells | `text-[13px]`, `text-zinc-700`; secondary text `text-xs text-zinc-500` |
| Section headings in a page | `text-sm font-semibold text-zinc-900` |
| Labels | `text-[13px] font-medium text-zinc-800`; **no UPPERCASE + wide tracking labels** |
| Neutrals | `zinc` scale. Borders `border-zinc-200`, row dividers `border-zinc-100` |
| Accent | Brand navy (`Button variant="primary"`) only for the page's main action |
| Radius | `rounded-md` controls, `rounded-lg` cards/tables, `rounded-full` only filter chips & avatars |
| Elevation | Flat surfaces. Shadows only on floating layers (popover, menu, toast, drawer, dialog) |
| Numbers & dates | `tabular-nums`, `formatDateTime()` from `@shared/utils/format` |
| Spacing | Page header `mb-4`; toolbar `mb-3`; cards `p-4`/`p-5`; no stat-card rows unless the number drives a decision |

## 2. Components (`packages/shared/src/ui`, import via `@shared/ui/...`)
| Need | Use | Notes |
|---|---|---|
| Page title block | `PageHeader` | breadcrumbs, title + count, one-line description, actions |
| List table | `DataTable` | columns with `icon`, `sortKey`; `selectable`; `emptyState`; `footer` for pagination |
| Pagination | `Pagination` | `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange` |
| Select field | `Dropdown` | **Never use a native `<select>`.** `size="sm"` in toolbars, `label` in forms |
| Toolbar filter | `FilterDropdown` | chip "Role ▾" → "Role \| Admin ×" |
| Search | `SearchInput` | debounced; pass URL value |
| Row/overflow actions | `Menu` | items with `hidden` for permission gating, `danger`, `separatorBefore` |
| Record state | `StatusPill` | dot + label (Active / Inactive / Expired …) |
| Attribute / category | `Badge` | tones: neutral, success, warning, danger, info, highlight |
| Person | `Avatar` | initials with stable colour |
| Tabs | `Tabs` | with counts; arrow-key navigation |
| Empty list | `EmptyState` | say **why** it's empty + **one action** |
| Text input | `InputField fieldSize="sm"` | admin forms always use `fieldSize="sm"` |
| Side form | `Drawer` | create/edit forms; footer holds Cancel + primary |
| Confirmation | `ConfirmDialog` | consequential actions only |
| Feedback | `toast` from `@shared/ui/Toast` | see §4 |
| Buttons | `Button` | `size="sm"` in headers/toolbars, `size="xs"` inside table rows |

Hooks: `useQueryState` (URL-backed filters/sort/page), `useApiQuery` (load + reload), `useForm`.
Utils: `cn` (class names), `downloadCsv` (export), `formatDateTime`.

## 3. Page anatomy (list screens)
```
PageHeader   breadcrumbs · title + count · description · [primary action]
Toolbar      [FilterDropdown chips …] [Clear all]          [SearchInput] [secondary actions]
DataTable    icon headers · sortable columns · row actions (xs buttons + ⋯ Menu)
             footer: Pagination (rows per page · range · « ‹ 1 2 … › »)
```
- Filters, sort, page and page size live in the URL (`useQueryState`).
- Keep each file under 200 lines: page = composition; `features/<area>/hooks` hold data + actions; `features/<area>/components` hold columns, toolbars, row actions.

## 4. Toasts
```ts
toast.success('Details have been successfully updated.', {
  title: `"${name}" details updated`,
  actions: [{ label: 'View profile', onClick: () => navigate(`/users/${id}`) }],
});
```
- `title` = what happened to what; message = consequence. Max 2 actions.
- Offer **Undo** only for actions that are truly reversible (e.g. suspend ↔ reactivate).
- Errors: `toast.error(extractErrorMessage(err))`.

## 5. Rules
- Every control does something real; hide permission-gated actions with `can('…')`.
- No invented data, no placeholder metrics, no decorative icons/emoji, no fake view switchers.
- Loading = table skeleton; error = inline alert with retry; empty = cause + action.
- Keyboard: every dropdown, menu and tab works with arrows/Enter/Escape (built into the kit).
