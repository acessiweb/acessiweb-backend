import { PartialPaginationResponse } from 'src/types/pagination';

export function getPagination(
  offset: number,
  limit: number,
  total: number,
): PartialPaginationResponse {
  const totalPages = Math.ceil(total / limit);
  let newOffset = offset + limit;
  let hasPrev = false;
  let hasNext = true;

  if (offset > 0 && offset < total) {
    hasPrev = true;
  }

  if (newOffset >= total) {
    hasNext = false;
    newOffset = offset;
  }

  return {
    offset: newOffset,
    totalPages,
    hasNext,
    hasPrev,
  };
}
