// PostgREST corta cada respuesta en "Max rows" (Supabase → Project Settings →
// Data API, 1000 por defecto) sin dar error: un select sin paginar devuelve las
// primeras N filas y nada más. Todo lo que suma filas (totales, reportes) tiene
// que traerlas todas, así que pagina con este helper. Sirve igual con el
// cliente del browser y con el de la service role.

/** Filas pedidas por página. Igual al "Max rows" por defecto de Supabase. */
export const PAGE_SIZE = 1000;

type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
  count: number | null;
};

export type FetchAllResult<T> = { data: T[]; error: null } | { data: null; error: { message: string } };

/**
 * Trae todas las filas de un select paginando con `.range()`.
 *
 * `page(from, to)` arma la query de una página y tiene que:
 * - pedir el total con `.select(cols, { count: "exact" })`, y
 * - ordenar por una columna única (`.order("id")`), o terminar el orden en una
 *   (`.order("entry_date").order("id")`): sin orden total, Postgres no
 *   garantiza que dos páginas no repitan o salteen filas.
 *
 * Avanza por la cantidad de filas que llegaron, no por el tamaño pedido: si el
 * "Max rows" del proyecto fuera menor que PAGE_SIZE, cada página llega
 * recortada y aun así no se saltea nada. Termina cuando ya tiene el total que
 * informó PostgREST o cuando una página llega vacía.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<FetchAllResult<T>> {
  const rows: T[] = [];
  for (;;) {
    const { data, error, count } = await page(rows.length, rows.length + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const batch = data ?? [];
    for (const row of batch) rows.push(row);
    if (batch.length === 0 || (count != null && rows.length >= count)) {
      return { data: rows, error: null };
    }
  }
}
