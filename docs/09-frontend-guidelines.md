# Frontend Engineering Guidelines

## 1. General Principles
- **Strict TypeScript**: Avoid `any`. All props, states, and API responses must have explicit interfaces or shared DTO types.
- **Component Decomposition**: Break screens into small, cohesive subcomponents (< 200 lines).
- **Client Routing**: Use declarative routing via **React Router DOM v7+** with layout routes, loaders, and navigation guards (`ProtectedRoute`, `AdminRoute`).
- **HTTP Client**: Use **Axios** with centralized interceptors for automatic token refresh, cookie handling, and unified error parsing.
- **Styling**: Rely purely on **Tailwind CSS** with cohesive design tokens, responsive modifiers, and micro-interactions.

---

## 2. Axios Client Setup & NestJS Integration

```typescript
// client/src/services/api.ts
import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Send HttpOnly JWT cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: automatically handles 401 token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return apiClient(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 3. React Router DOM v7 Navigation Patterns

```tsx
// client/src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { HomePage } from '../pages/public/HomePage';
import { ShopPage } from '../pages/public/ShopPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRoutes = () => (
  <Routes>
    {/* Public & Customer Routes with Main Storefront Layout */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
    </Route>

    {/* Protected Admin Routes with Admin Sidebar Layout */}
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>
    </Route>
  </Routes>
);
```

---

## 4. Four Mandatory Screen States
Every data-driven page or widget MUST explicitly implement the 4 core states:
1. **Loading State**: Render high-fidelity skeleton placeholders rather than generic spinners.
2. **Error State**: User-friendly error message accompanied by a "Try Again" / "Refresh" action button. Never display raw backend stack traces.
3. **Empty State**: Friendly graphic or icon, clear description (e.g., "Your cart is currently empty"), and an actionable button (e.g., "Explore Products").
4. **Success / Content State**: The interactive, polished UI.

---

## 5. Form Handling (React Hook Form + Tailwind)
```tsx
import { useForm } from 'react-hook-form';

interface LoginInput {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    // Invoke auth service with Axios
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Email Address</label>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  );
};
```
