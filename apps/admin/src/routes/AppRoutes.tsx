import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import ProtectedRoute from '@shared/auth/ProtectedRoute';
import PublicOnlyRoute from '@shared/auth/PublicOnlyRoute';
import MfaVerifyPage from '@shared/auth/pages/MfaVerifyPage';
import ForgotPasswordPage from '@shared/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@shared/auth/pages/ResetPasswordPage';
import NotFoundPage from '@shared/pages/NotFoundPage';
import ComingSoonPage from '@shared/pages/ComingSoonPage';
import PageLoader from '@shared/ui/PageLoader';
import { USER_ROLES } from '@shared/constants/roles';
import { ROUTES } from './routePaths';
import { MANAGER_PLANNED, STAFF_PLANNED, type PlannedRoute } from './plannedRoutes';

import { AppLayout } from '../layouts/AppLayout';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminChangePasswordPage from '../pages/AdminChangePasswordPage';
import AdminSecurityPage from '../pages/AdminSecurityPage';
import AdminAuditLogsPage from '../pages/AdminAuditLogsPage';
import AcceptInvitePage from '../pages/AcceptInvitePage';
import UsersPage from '../pages/UsersPage';
import UserManagementOverviewPage from '../pages/UserManagementOverviewPage';
import UserDetailsPage from '../pages/UserDetailsPage';
import RolesPage from '../pages/RolesPage';
import RoleDetailsPage from '../pages/RoleDetailsPage';
import InvitationsPage from '../pages/InvitationsPage';
import LoginActivityPage from '../pages/LoginActivityPage';
import CategoriesPage from '../pages/CategoriesPage';
import CategoriesOverviewPage from '../pages/CategoriesOverviewPage';
import BrandsPage from '../pages/BrandsPage';
import ProductsOverviewPage from '../pages/ProductsOverviewPage';
import ProductsPage from '../pages/ProductsPage';
import BusinessSettingsPage from '../pages/BusinessSettingsPage';
import OrdersPage from '../pages/OrdersPage';
import CouponsPage from '../pages/CouponsPage';
import ReviewsPage from '../pages/ReviewsPage';
import CustomersPage from '../pages/CustomersPage';
import InventoryPage from '../pages/InventoryPage';
import ReturnsPage from '../pages/ReturnsPage';
import EmailTemplatesListPage from '../pages/email-templates/EmailTemplatesListPage';
import EmailTemplateCanvasEditorPage from '../pages/email-templates/EmailTemplateCanvasEditorPage';
import WarehousesPage from '../pages/warehouses/WarehousesPage';
import BundlesPage from '../pages/bundles/BundlesPage';
import AbandonedCartsPage from '../pages/abandoned-carts/AbandonedCartsPage';
import PurchaseOrdersPage from '../pages/purchase-orders/PurchaseOrdersPage';
import ShippingDispatchPage from '../pages/shipping-dispatch/ShippingDispatchPage';

const renderPlanned = (routes: PlannedRoute[]) =>
  routes.map(({ path, title }) => (
    <Route
      key={path}
      path={path}
      element={<ComingSoonPage title={title} backTo={ROUTES.DASHBOARD} backLabel="Back to Dashboard" />}
    />
  ));

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader variant="mascot" size="md" text="Loading console..." fullScreen={true} />;
  }

  return (
    <Routes>
      {/* 1. SIGN-IN (no registration: staff accounts are provisioned internally) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.LOGIN} element={<AdminLoginPage />} />
        <Route path={ROUTES.LOGIN_VERIFY} element={<MfaVerifyPage />} />
      </Route>

      {/* 2. EMAILED LINKS */}
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.ACCEPT_INVITE} element={<AcceptInvitePage />} />

      {/* 3. CONSOLE (any staff role; the AuthProvider only admits staff sessions) */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.CHANGE_PASSWORD} element={<AdminChangePasswordPage />} />

        {/* Dedicated Full-Screen Canvas Email Template Studio */}
        <Route path={ROUTES.EMAIL_TEMPLATE_EDITOR} element={<EmailTemplateCanvasEditorPage />} />
        <Route path={ROUTES.EMAIL_TEMPLATE_NEW} element={<EmailTemplateCanvasEditorPage />} />

        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.DASHBOARDS_ECOMMERCE} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ACCOUNT} element={<AdminSecurityPage />} />
          {renderPlanned(STAFF_PLANNED)}

          <Route element={<ProtectedRoute role={USER_ROLES.ADMIN} />}>
            <Route path={ROUTES.AUDIT_LOGS} element={<AdminAuditLogsPage />} />
            {renderPlanned(MANAGER_PLANNED)}
          </Route>

          {/* User Management & RBAC with Granular Permission Guards */}
          <Route element={<ProtectedRoute permission="users.view" />}>
            <Route path={ROUTES.USER_MANAGEMENT_OVERVIEW} element={<UserManagementOverviewPage />} />
            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />
            <Route path={ROUTES.STAFF} element={<Navigate to={ROUTES.USERS} replace />} />
            <Route path={ROUTES.INVITATIONS} element={<InvitationsPage />} />
            <Route path={ROUTES.USERS_INVITES} element={<InvitationsPage />} />
            <Route path={ROUTES.LOGIN_ACTIVITY} element={<LoginActivityPage />} />
            <Route path={ROUTES.USERS_LOGIN_ACTIVITY} element={<LoginActivityPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="roles.view" />}>
            <Route path={ROUTES.ROLES} element={<RolesPage />} />
            <Route path={ROUTES.ROLE_DETAILS} element={<RoleDetailsPage />} />
            <Route path={ROUTES.USERS_ROLES} element={<RolesPage />} />
            <Route path={ROUTES.USERS_PERMISSIONS} element={<RolesPage />} />
          </Route>

          {/* Catalog: Products & Inventory */}
          <Route element={<ProtectedRoute permission="products.view" />}>
            <Route path={ROUTES.PRODUCTS_OVERVIEW} element={<ProductsOverviewPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
            <Route path={ROUTES.BUNDLES} element={<BundlesPage />} />
          </Route>

          {/* Catalog: Categories */}
          <Route element={<ProtectedRoute permission="categories.view" />}>
            <Route path={ROUTES.CATEGORIES_OVERVIEW} element={<CategoriesOverviewPage />} />
            <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          </Route>

          {/* Catalog: Brands */}
          <Route element={<ProtectedRoute permission="brands.view" />}>
            <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
          </Route>

          {/* Sales & Fulfillment: Orders & Returns */}
          <Route element={<ProtectedRoute permission="orders.view" />}>
            <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="returns.view" />}>
            <Route path={ROUTES.RETURNS} element={<ReturnsPage />} />
          </Route>

          {/* Warehouses & Fulfillment Centers & Transfers */}
          <Route path={ROUTES.WAREHOUSES} element={<WarehousesPage />} />
          <Route path={ROUTES.STOCK_TRANSFERS} element={<WarehousesPage />} />

          {/* Suppliers, Procurement & Purchase Orders */}
          <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrdersPage />} />
          <Route path={ROUTES.SUPPLIERS} element={<PurchaseOrdersPage />} />
          <Route path={ROUTES.RECEIVING_DOCK} element={<PurchaseOrdersPage />} />

          {/* Shipping Dispatch & Courier Manifests */}
          <Route path={ROUTES.SHIPPING_DISPATCH} element={<ShippingDispatchPage />} />
          <Route path={ROUTES.DISPATCH_MANIFESTS} element={<ShippingDispatchPage />} />
          <Route path={ROUTES.COURIER_WEBHOOKS} element={<ShippingDispatchPage />} />

          {/* Marketing & Discounts: Coupons & Abandoned Carts */}
          <Route element={<ProtectedRoute permission="coupons.view" />}>
            <Route path={ROUTES.COUPONS} element={<CouponsPage />} />
            <Route path={ROUTES.ABANDONED_CARTS} element={<AbandonedCartsPage />} />
          </Route>

          {/* Customers & Community: Customers */}
          <Route element={<ProtectedRoute permission="customers.view" />}>
            <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
          </Route>

          {/* Customers & Community: Reviews */}
          <Route element={<ProtectedRoute permission="reviews.view" />}>
            <Route path={ROUTES.REVIEWS} element={<ReviewsPage />} />
          </Route>

          {/* Store & Business Settings */}
          <Route element={<ProtectedRoute permission="settings.view" />}>
            <Route path={ROUTES.SETTINGS} element={<BusinessSettingsPage />} />
          </Route>

          {/* Email Templates Studio & Management */}
          <Route path={ROUTES.EMAIL_TEMPLATES} element={<EmailTemplatesListPage />} />
          <Route path={ROUTES.EMAIL_TEMPLATE_EDITOR} element={<EmailTemplateCanvasEditorPage />} />
          <Route path={ROUTES.EMAIL_TEMPLATE_NEW} element={<EmailTemplateCanvasEditorPage />} />

          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage homeLabel="Back to Dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
