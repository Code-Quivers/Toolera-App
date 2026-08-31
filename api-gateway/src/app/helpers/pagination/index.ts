import { Request } from 'express';
import { PAGINATION_DEFAULTS } from '../../constants/pagination';

export function parsePagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Number(req.query.limit) || PAGINATION_DEFAULTS.limit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}
