export default function normalizeUsername(name?: string) {
  return name
    ? name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .substring(0, 25)
    : 'Usuario';
}
