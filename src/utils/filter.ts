export function filterByQuery<T>(items: T[] | undefined, query: string): T[] {
  if (!items) return [] as T[];
  const q = query?.trim().toLowerCase();
  if (!q) return items;
  try {
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  } catch {
    // Fallback: if stringify fails for any reason, return original list
    return items;
  }
}

