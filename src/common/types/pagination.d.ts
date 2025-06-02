type PartialPaginationResponse = {
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  offset: number;
};

type PaginationResponse = PartialPaginationResponse & {
  data: any[];
  total: number;
  limit: number;
};
