export enum EmailTemplateType {
  USER_INVITATION = 'USER_INVITATION',
  SEND_OTP = 'SEND_OTP',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_STATUS = 'MFA_STATUS',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  RETURN_STATUS_UPDATE = 'RETURN_STATUS_UPDATE',
  WELCOME_CUSTOMER = 'WELCOME_CUSTOMER',
}

export interface TemplateVariableDefinition {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface TemplateTypeMeta {
  type: EmailTemplateType;
  label: string;
  category: 'AUTH' | 'ORDERS' | 'INVENTORY' | 'STAFF' | 'CUSTOMER';
  description: string;
  defaultSubject: string;
  allowedVariables: TemplateVariableDefinition[];
}

export const EMAIL_TEMPLATE_TYPES_META: Record<EmailTemplateType, TemplateTypeMeta> = {
  [EmailTemplateType.USER_INVITATION]: {
    type: EmailTemplateType.USER_INVITATION,
    label: 'User Invitation Email',
    category: 'STAFF',
    description: 'Sent when an administrator invites new staff to join the admin portal',
    defaultSubject: "You're invited to join {{company_name}}",
    allowedVariables: [
      { name: 'name', description: "Invitee's name", required: true, example: 'John' },
      { name: 'email', description: "Invitee's email address", required: true, example: 'john@example.com' },
      { name: 'sender_name', description: 'Name of person who sent the invitation', required: true, example: 'Admin' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO Commerce' },
      { name: 'groups', description: 'Departments or groups assigned', required: true, example: 'Operations, Catalog' },
      { name: 'roles', description: 'Roles assigned to the user', required: true, example: 'Catalog Manager' },
      { name: 'invitation_link', description: 'URL to accept invitation', required: true, example: 'http://127.0.0.1:5175/accept-invite?token=xxx' },
      { name: 'expiry_date', description: 'Invitation expiry date', required: true, example: 'Dec 31, 2026' },
      { name: 'expiry_days', description: 'Days until invitation expires', required: true, example: '7' },
      { name: 'support_email', description: 'Support contact email address', required: true, example: 'support@zylo.com' },
      { name: 'login_url', description: 'URL to login page', required: true, example: 'http://127.0.0.1:5175/login' },
      { name: 'current_year', description: 'Current year for copyright', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.SEND_OTP]: {
    type: EmailTemplateType.SEND_OTP,
    label: 'OTP Verification Code',
    category: 'AUTH',
    description: 'Sent when a customer or staff requests a one-time verification passcode (OTP)',
    defaultSubject: '{{otp}} is your {{company_name}} verification code',
    allowedVariables: [
      { name: 'name', description: "Recipient's name", required: false, example: 'Alex' },
      { name: 'email', description: "Recipient's email address", required: true, example: 'alex@example.com' },
      { name: 'otp', description: '6-digit verification passcode', required: true, example: '849201' },
      { name: 'expiry_minutes', description: 'Minutes before OTP expires', required: true, example: '10' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email address', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current calendar year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.EMAIL_VERIFICATION]: {
    type: EmailTemplateType.EMAIL_VERIFICATION,
    label: 'Email Address Verification',
    category: 'AUTH',
    description: 'Sent to new registrants to verify ownership of their email address',
    defaultSubject: 'Verify your {{company_name}} email address',
    allowedVariables: [
      { name: 'name', description: "User's display name", required: true, example: 'Alex Customer' },
      { name: 'email', description: "User's email", required: true, example: 'alex@example.com' },
      { name: 'verification_link', description: 'Verification activation link', required: true, example: 'http://localhost:5176/verify-email?token=xxx' },
      { name: 'company_name', description: 'Store name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.PASSWORD_RESET]: {
    type: EmailTemplateType.PASSWORD_RESET,
    label: 'Password Reset Request',
    category: 'AUTH',
    description: 'Sent when a user requests a secure password reset link',
    defaultSubject: 'Reset your {{company_name}} password',
    allowedVariables: [
      { name: 'name', description: "User's display name", required: true, example: 'Alex Customer' },
      { name: 'email', description: "User's email", required: true, example: 'alex@example.com' },
      { name: 'reset_link', description: 'One-time secure password reset link', required: true, example: 'http://localhost:5176/reset-password?token=xxx' },
      { name: 'expiry_hours', description: 'Hours before reset link expires', required: true, example: '1' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.PASSWORD_CHANGED]: {
    type: EmailTemplateType.PASSWORD_CHANGED,
    label: 'Password Changed Confirmation',
    category: 'AUTH',
    description: 'Security notice sent after account password has been successfully altered',
    defaultSubject: 'Security Notice: Your {{company_name}} password was changed',
    allowedVariables: [
      { name: 'name', description: "User's name", required: true, example: 'Alex' },
      { name: 'email', description: "User's email", required: true, example: 'alex@example.com' },
      { name: 'change_time', description: 'Timestamp when password was modified', required: true, example: 'Oct 8, 2026, 12:45 PM' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.MFA_STATUS]: {
    type: EmailTemplateType.MFA_STATUS,
    label: '2FA Security Status Update',
    category: 'AUTH',
    description: 'Notification sent when Two-Factor Authentication is enabled or disabled',
    defaultSubject: 'Two-Factor Authentication {{mfa_status}} on {{company_name}}',
    allowedVariables: [
      { name: 'name', description: "User's name", required: true, example: 'Alex' },
      { name: 'email', description: "User's email", required: true, example: 'alex@example.com' },
      { name: 'mfa_status', description: 'State: enabled or disabled', required: true, example: 'enabled' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.ORDER_CONFIRMATION]: {
    type: EmailTemplateType.ORDER_CONFIRMATION,
    label: 'Order Confirmation',
    category: 'ORDERS',
    description: 'Sent to customer immediately upon placing an order with item breakdown and invoice details',
    defaultSubject: 'Order Confirmed: #{{order_number}} - {{company_name}}',
    allowedVariables: [
      { name: 'name', description: "Customer's full name", required: true, example: 'Alex Customer' },
      { name: 'email', description: "Customer's email address", required: true, example: 'alex@example.com' },
      { name: 'order_number', description: 'Unique order identifier', required: true, example: 'ZYLO-2026-981245' },
      { name: 'order_date', description: 'Date the order was placed', required: true, example: 'Oct 8, 2026' },
      { name: 'grand_total', description: 'Grand total formatted with currency', required: true, example: '$2,875.75' },
      { name: 'subtotal', description: 'Subtotal before tax & shipping', required: true, example: '$2,697.00' },
      { name: 'shipping_fee', description: 'Shipping fee', required: true, example: 'FREE' },
      { name: 'tax_amount', description: 'Estimated tax amount', required: true, example: '$215.76' },
      { name: 'discount_amount', description: 'Discount applied if any', required: false, example: '$50.00' },
      { name: 'payment_method', description: 'Payment method utilized', required: true, example: 'Cash on Delivery (COD)' },
      { name: 'shipping_address', description: 'Shipping street and city destination', required: true, example: '123 Market St, San Francisco, CA' },
      { name: 'tracking_link', description: 'URL to track order in customer portal', required: true, example: 'http://localhost:5176/account/orders/ZYLO-2026-981245' },
      { name: 'company_name', description: 'Store name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support contact email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.ORDER_STATUS_UPDATE]: {
    type: EmailTemplateType.ORDER_STATUS_UPDATE,
    label: 'Order Status & Tracking Update',
    category: 'ORDERS',
    description: 'Sent when order status changes to Shipped, Out for Delivery, or Delivered',
    defaultSubject: 'Update on Order #{{order_number}}: {{status_label}} - {{company_name}}',
    allowedVariables: [
      { name: 'name', description: "Customer's name", required: true, example: 'Alex Customer' },
      { name: 'email', description: "Customer's email", required: true, example: 'alex@example.com' },
      { name: 'order_number', description: 'Order number', required: true, example: 'ZYLO-2026-981245' },
      { name: 'status_label', description: 'Human readable status (e.g. Shipped, Delivered)', required: true, example: 'Order Shipped' },
      { name: 'courier_name', description: 'Fulfillment courier partner', required: false, example: 'FedEx Express' },
      { name: 'tracking_number', description: 'Package tracking number', required: false, example: 'FX-88910293847' },
      { name: 'carrier_tracking_url', description: 'Direct carrier tracking URL', required: false, example: 'https://www.fedex.com/tracking' },
      { name: 'tracking_link', description: 'Customer portal order link', required: true, example: 'http://localhost:5176/account/orders/ZYLO-2026-981245' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.LOW_STOCK_ALERT]: {
    type: EmailTemplateType.LOW_STOCK_ALERT,
    label: 'Low Stock Inventory Alert',
    category: 'INVENTORY',
    description: 'Internal alert dispatched to store admin when product stock reaches or falls below threshold',
    defaultSubject: '[Inventory Alert] Low Stock: {{product_name}} ({{remaining_stock}} units left)',
    allowedVariables: [
      { name: 'product_name', description: 'Product title', required: true, example: 'Sony WH-1000XM5 Headphones' },
      { name: 'sku', description: 'Stock keeping unit (SKU)', required: true, example: 'SONY-WH1000XM5-BLK' },
      { name: 'variant_title', description: 'Variant details if applicable', required: false, example: 'Midnight Black' },
      { name: 'remaining_stock', description: 'Current inventory quantity left', required: true, example: '2' },
      { name: 'threshold', description: 'Configured low-stock alert threshold', required: true, example: '5' },
      { name: 'admin_url', description: 'Link to admin products management', required: true, example: 'http://127.0.0.1:5175/products' },
      { name: 'company_name', description: 'Store name', required: true, example: 'ZYLO' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.RETURN_STATUS_UPDATE]: {
    type: EmailTemplateType.RETURN_STATUS_UPDATE,
    label: 'Return Request Status Update',
    category: 'ORDERS',
    description: 'Sent when customer return request is Approved, Rejected, or Refunded',
    defaultSubject: 'Return Request #{{return_number}} Update: {{status_label}} - {{company_name}}',
    allowedVariables: [
      { name: 'name', description: "Customer's name", required: true, example: 'Alex Customer' },
      { name: 'email', description: "Customer's email", required: true, example: 'alex@example.com' },
      { name: 'return_number', description: 'Return request ID', required: true, example: 'RET-2026-441209' },
      { name: 'order_number', description: 'Associated order number', required: true, example: 'ZYLO-2026-981245' },
      { name: 'status_label', description: 'Status (Approved, Refund Processed, Rejected)', required: true, example: 'Approved' },
      { name: 'refund_amount', description: 'Approved refund amount with currency', required: true, example: '$198.00' },
      { name: 'refund_transaction_id', description: 'Gateway refund transaction reference', required: false, example: 'STRIPE-REF-992144' },
      { name: 'admin_note', description: 'Admin or staff review note', required: false, example: 'Items approved for pickup.' },
      { name: 'portal_link', description: 'Link to view order details', required: true, example: 'http://localhost:5176/account/orders/ZYLO-2026-981245' },
      { name: 'company_name', description: 'Company name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },

  [EmailTemplateType.WELCOME_CUSTOMER]: {
    type: EmailTemplateType.WELCOME_CUSTOMER,
    label: 'Welcome Customer Onboarding',
    category: 'CUSTOMER',
    description: 'Welcome email sent when a new customer registers on the storefront',
    defaultSubject: 'Welcome to {{company_name}}, {{name}}! 🛍️',
    allowedVariables: [
      { name: 'name', description: "Customer's name", required: true, example: 'Alex' },
      { name: 'email', description: "Customer's email", required: true, example: 'alex@example.com' },
      { name: 'shop_url', description: 'Storefront shop link', required: true, example: 'http://localhost:5176/shop' },
      { name: 'company_name', description: 'Store name', required: true, example: 'ZYLO' },
      { name: 'support_email', description: 'Support email', required: true, example: 'support@zylo.com' },
      { name: 'current_year', description: 'Current year', required: true, example: '2026' },
    ],
  },
};
