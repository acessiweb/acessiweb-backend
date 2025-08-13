import { FilterDefaultParams, GuidelineFilter } from './filter';
import { PaginationParams } from './pagination';

export type GuidelineQuery = FilterDefaultParams &
  PaginationParams &
  GuidelineFilter & {
    userId?: string;
    isRequest?: boolean | string;
    statusCode?: string;
  };

export type ProjectQuery = FilterDefaultParams & PaginationParams;
