export interface PaginateOptions {
  page?: number;
  limit?: number;
}

export interface PaginateResult<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
    };
  };
}

/**
 * Calculates pagination for list endpoints.
 * @param items List of items for current page
 * @param total Total number of items in DB
 * @param options { page, limit }
 * @returns { data, meta.pagination }
 */
export function paginate<T>(
  items: T[],
  total: number,
  options: PaginateOptions = {},
): PaginateResult<T> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;

  return {
    data: items,
    meta: {
      pagination: {
        total,
        page,
        pageSize: limit,
      },
    },
  };
}
