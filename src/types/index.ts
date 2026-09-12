export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
