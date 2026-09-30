# UI / UX Design System & Guidelines

## 1. Aesthetic Identity & Styling Foundations
ZYLO employs a clean, modern, and accessible design system optimized for high readability, trustworthy commerce transactions, and rapid browsing.

### 1.1 Color Palette Tokens (Tailwind CSS)
- **Primary Brand**:
  - `indigo-600` (`#4F46E5`): Primary call to actions, interactive links.
  - `indigo-700` (`#4338CA`): Button hover and active states.
  - `indigo-50` (`#EEF2FF`): Subtle accent backgrounds and icon containers.
- **Neutrals & Typography**:
  - `slate-900` (`#0F172A`): Headings, primary titles, active text.
  - `slate-600` (`#475569`): Body copy, descriptive text.
  - `slate-400` (`#94A3B8`): Placeholder text, disabled labels.
  - `slate-200` (`#E2E8F0`): Card borders, table dividers.
  - `slate-50` (`#F8FAFC`): Global app background, muted panels.
- **Feedback & Semantics**:
  - **Success**: `emerald-600` (In stock, order confirmed, applied discount).
  - **Warning**: `amber-500` (Low stock warning, pending payment).
  - **Danger**: `rose-600` (Out of stock, order cancelled, validation error).

### 1.2 Typography
- **Font Family**: Modern sans-serif stack (`Inter`, system-ui, -apple-system, sans-serif).
- **Scale**:
  - H1 (Hero / Page Title): `text-3xl font-extrabold tracking-tight text-slate-900`
  - H2 (Section Title): `text-xl font-bold text-slate-900`
  - H3 (Card Title): `text-base font-semibold text-slate-900`
  - Body: `text-sm text-slate-600 leading-relaxed`
  - Small / Badge: `text-xs font-medium`

---

## 2. Core UI Component Specifications

### 2.1 Buttons
- **Primary Action**: Solid background (`bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm rounded-lg px-4 py-2 font-medium transition`).
- **Secondary Action**: White with border (`bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-4 py-2 font-medium`).
- **Danger Action**: Rose accent (`bg-rose-600 text-white hover:bg-rose-700 rounded-lg px-4 py-2 font-medium`).
- **Loading State**: Displays an animated SVG spinner and disables mouse clicks.

### 2.2 Product Card (E-Commerce Standard)
- Image container with fixed aspect ratio (`aspect-square` or `aspect-[4/3]`) with subtle zoom on hover (`group-hover:scale-105 transition-transform duration-300`).
- Category label tag in `text-xs text-indigo-600 font-semibold uppercase tracking-wider`.
- Product title clamped to 2 lines (`line-clamp-2`).
- Price row displaying bold current price alongside strikethrough original price if discounted.
- "Quick Add" button visible on card hover.

### 2.3 Status Badges
```tsx
const statusColorMap: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};
```

---

## 3. Responsive Breakpoints
- **Mobile (< 640px)**: Single column layouts, sticky bottom checkout/cart action bars, collapsible filter drawer.
- **Tablet (640px – 1024px)**: 2-column product grid, compact admin navigation.
- **Desktop (1024px+)**: 3 to 4-column product grid, persistent sidebar filters, split PDP layout (sticky gallery left, buy-box right).

---

## 4. Accessibility & Micro-Interactions
- High contrast ratios meeting WCAG AA standards.
- Visible focus rings (`focus:ring-2 focus:ring-indigo-500 focus:outline-none`) for all keyboard navigators.
- Accessible form labels connected via `htmlFor` and `aria-describedby`.
- Skeleton loaders matching exact component geometry during loading states to prevent layout shifts (CLS).
