import { compareArrays } from './compare';

export function getIdsToRemove(
  currentIds: string[],
  newIds: string[],
): string[] {
  if (!compareArrays(newIds, currentIds)) {
    return currentIds.filter((id) => !newIds.includes(id));
  }
}

export function getIdsToAdd(currentIds: string[], newIds: string[]): string[] {
  if (!compareArrays(newIds, currentIds)) {
    return newIds.filter((id) => !currentIds.includes(id));
  }
}
