export type PartialPaginationResponse = {
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  offset: number;
};

export type PaginationResponse = PartialPaginationResponse & {
  data: any[];
  total: number;
  limit: number;
};

export type PaginationParams = {
  limit: number;
  offset: number;
};
