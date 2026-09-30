import { createAppConfig } from '../../packages/shared/vite.base.ts';

// Host, port and API proxy come from CLIENT_URL / ADMIN_URL / PORT in the repo-root .env
export default createAppConfig('storefront');
