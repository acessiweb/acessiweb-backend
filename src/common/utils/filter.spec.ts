import { getIdsToAdd, getIdsToRemove } from './filter';

describe('filter', () => {
  it('should return ids to remove', () => {
    const currentIds = ['hello', 'hello2'];
    const newIds = ['hello'];

    const idsToRemove = getIdsToRemove(currentIds, newIds);

    expect(idsToRemove).toEqual(['hello2']);
  });

  it('should return ids to add', () => {
    const currentIds = ['hello', 'hello2'];
    const newIds = currentIds.concat(['hello3']);

    const idsToAdd = getIdsToAdd(currentIds, newIds);

    expect(idsToAdd).toEqual(['hello3']);
  });
});
