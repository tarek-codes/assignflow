export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  isAscending?: boolean;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
