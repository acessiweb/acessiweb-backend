import { LIMIT_DEFAULT, OFFSET_DEFAULT } from '../constants/pagination';
import { getPagination } from './pagination';

describe('Pagination (unit)', () => {
  describe('getPagination()', () => {
    it('should return correct pagination given params', () => {
      const total = 100;
      const limit = LIMIT_DEFAULT;
      const offset = OFFSET_DEFAULT;

      const totalPages = 5;
      let newOffset = 21;
      let hasPrev = false;
      let hasNext = true;

      const pagination = getPagination(offset, limit, total);

      expect(pagination).toEqual({
        offset: newOffset,
        totalPages,
        hasNext,
        hasPrev,
      });
    });
  });
});
