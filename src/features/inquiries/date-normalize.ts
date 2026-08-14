/**
 * Normalize a `datetime-local` form value ("YYYY-MM-DDTHH:mm" / "...:ss") into a
 * strict ISO 8601 timestamp accepted by the Zod `.datetime()` schemas. Treated
 * as UTC for simplicity. Pure — no I/O, safe to share across server actions.
 */
export function toIsoDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00Z`
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}Z`
  return value
}
