import { ADMIN_NAV_SECTIONS, SIDEBAR_DIMENSIONS } from './sidebarStyles';

/**
 * Unit sanity tests verifying sidebar configuration and styling tokens
 */
export function runSidebarTests(): boolean {
  // Test 1: Navigation sections exist
  if (!ADMIN_NAV_SECTIONS || ADMIN_NAV_SECTIONS.length === 0) {
    throw new Error('Admin navigation sections must not be empty');
  }

  // Test 2: Core modules are registered
  const groupIds = ADMIN_NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.id));
  const expectedModules = ['dashboards', 'catalog', 'orders', 'customers', 'marketing', 'security', 'settings'];
  for (const mod of expectedModules) {
    if (!groupIds.includes(mod)) {
      throw new Error(`Expected module "${mod}" is missing from sidebar configuration`);
    }
  }

  // Test 3: Dimensions follow compact constraints
  if (SIDEBAR_DIMENSIONS.collapsedWidth !== 'w-[60px]') {
    throw new Error('Collapsed sidebar width must be exactly 60px');
  }
  if (SIDEBAR_DIMENSIONS.expandedWidth !== 'w-[224px]') {
    throw new Error('Expanded sidebar width must be exactly 224px');
  }

  return true;
}

// Auto-run sanity check on module evaluation in development
if (import.meta.env?.DEV) {
  runSidebarTests();
}

export default runSidebarTests;
