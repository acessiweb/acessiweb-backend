import { transformDateToDatetime } from './date';

describe('date', () => {
  it('should return a valid Date object in UTC when given a valid date string', () => {
    const input = '2025-08-07';
    const result = transformDateToDatetime(input);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2025-08-07T00:00:00.000Z');
  });

  it('should return undefined when given an invalid date string', () => {
    const input = 'invalid-date';
    const result = transformDateToDatetime(input);

    expect(result).toBeUndefined();
  });

  it('should correctly parse edge case dates like 1970-01-01', () => {
    const input = '1970-01-01';
    const result = transformDateToDatetime(input);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });
});
