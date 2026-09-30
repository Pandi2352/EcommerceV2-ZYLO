export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export function toPaginated<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export function skipFor(page: number, limit: number): number {
  return (page - 1) * limit;
}
