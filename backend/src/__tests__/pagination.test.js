const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

describe('parsePagination', () => {
  it('defaults to page 1, limit 20 when unspecified', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20 });
  });

  it('parses valid page/limit from query strings', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({
      page: 3,
      limit: 10,
    });
  });

  it('falls back to defaults on invalid/negative values', () => {
    expect(parsePagination({ page: '-5', limit: 'abc' })).toEqual({
      page: 1,
      limit: 20,
    });
  });

  it('caps limit at maxLimit', () => {
    expect(parsePagination({ limit: '500' })).toEqual({ page: 1, limit: 100 });
  });
});

describe('buildPaginatedResult', () => {
  it('computes totalPages correctly', () => {
    const result = buildPaginatedResult({
      items: [1, 2],
      total: 45,
      page: 2,
      limit: 20,
    });

    expect(result.pagination).toEqual({
      total: 45,
      page: 2,
      limit: 20,
      totalPages: 3,
    });
  });
});
