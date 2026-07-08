// Shared specialty/tag normalization helpers.
//
// Therapists type these freely (e.g. "anxiety ", "Anxiety", "ANXIETY",
// "Graphology"). Used in two places that must agree on the same rules:
//   1. Dashboard profile form — normalizes at the point of entry, so what's
//      actually stored in the DB is already clean.
//   2. Homepage directory filters — normalizes at read time too, as a
//      safety net for any older/legacy data saved before this existed.

export function normalizeSpecialtyKey(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function titleCaseLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

// Adds `raw` to `list` unless a normalized-equal entry already exists.
// Returns a new array (or the same reference if nothing changed, so callers
// can skip a re-render/state update when there's no actual change).
export function addNormalizedUnique(list: string[], raw: string): string[] {
  const clean = titleCaseLabel(raw)
  if (!clean) return list
  const key = normalizeSpecialtyKey(clean)
  if (list.some(s => normalizeSpecialtyKey(s) === key)) return list
  return [...list, clean]
}
