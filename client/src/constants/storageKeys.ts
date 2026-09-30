/** Browser storage keys. Never store tokens here: sessions live in HttpOnly cookies. */
export const STORAGE_KEYS = {
  REMEMBERED_CUSTOMER_EMAIL: 'zylo_remembered_customer_email',
  REMEMBERED_ADMIN_EMAIL: 'zylo_remembered_admin_email',
} as const;
