import { PaginationParams } from './pagination';

export type FilterDefaultParams = {
  keyword?: string;
  initialDate?: string;
  endDate?: string;
};

type GuidelineFilterDefault = FilterDefaultParams & {
  deficiences?: string[];
};

export type ProjectFilter = FilterDefaultParams & PaginationParams;

export type GuidelineFilter = GuidelineFilterDefault & {
  isDeleted?: boolean | string;
};

export type GuidelineRequestFilter = GuidelineFilterDefault & {
  statusCode?: string;
  isRequest?: boolean | string;
};
