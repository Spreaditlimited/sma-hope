// Read complete repository pages so reporting totals never silently stop at 1,000 rows.
export async function allRows<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await fetchPage(offset, offset + 999);
    if (result.error) throw new Error(result.error.message);
    rows.push(...(result.data || []));
    if (!result.data || result.data.length < 1000) return rows;
  }
}
