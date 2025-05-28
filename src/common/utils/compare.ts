export function compareArrays(array1: string[], array2: string[]): boolean {
  if (array1.length !== array2.length) return false;
  const array1Sorted = [...array1].sort();
  const array2Sorted = [...array2].sort();
  return array1Sorted.every((v, i) => v === array2Sorted[i]);
}
