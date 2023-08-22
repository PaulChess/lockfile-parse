export function isTrueArray(arr: unknown) {
  return arr && Array.isArray(arr) && arr.length > 0
}
