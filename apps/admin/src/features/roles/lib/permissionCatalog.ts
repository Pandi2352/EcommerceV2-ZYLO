import type { GroupedPermissionDomain, ModulePermissions } from '../../../services/permissions.service';

export interface PermissionMeta {
  module: string;
  action: string;
  isSensitive: boolean;
  /** The `view` key of the same module, if the module has one */
  viewKey?: string;
  /** Every key in the same module */
  moduleKeys: string[];
}

/** key → module context, used for the implied-view rules. */
export function indexCatalog(catalog: GroupedPermissionDomain[]): Map<string, PermissionMeta> {
  const index = new Map<string, PermissionMeta>();
  for (const group of catalog) {
    for (const mod of group.modules) {
      const moduleKeys = mod.permissions.map((p) => p.key);
      const viewKey = mod.permissions.find((p) => p.action === 'view')?.key;
      for (const p of mod.permissions) {
        index.set(p.key, { module: mod.module, action: p.action, isSensitive: p.isSensitive, viewKey, moduleKeys });
      }
    }
  }
  return index;
}

/** Keep permissions whose name, key or description matches; drop empty modules and groups. */
export function filterCatalog(catalog: GroupedPermissionDomain[], search: string): GroupedPermissionDomain[] {
  const term = search.trim().toLowerCase();
  if (!term) return catalog;
  return catalog
    .map((group) => ({
      ...group,
      modules: group.modules
        .map((mod) => ({
          ...mod,
          permissions: mod.permissions.filter((p) =>
            `${p.name} ${p.key} ${p.description}`.toLowerCase().includes(term),
          ),
        }))
        .filter((mod) => mod.permissions.length > 0),
    }))
    .filter((group) => group.modules.length > 0);
}

export const moduleKeys = (mod: ModulePermissions) => mod.permissions.map((p) => p.key);

export const groupKeys = (group: GroupedPermissionDomain) => group.modules.flatMap(moduleKeys);

/** "products" / "staff_users" → "Products" / "Staff users" */
export const humanizeModule = (value: string) => {
  const text = value.replace(/[_-]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
