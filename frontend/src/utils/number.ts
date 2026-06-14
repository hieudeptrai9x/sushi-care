export function parseLocaleDecimal(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const normalized = String(value).trim().replace(/\s+/g, '').replace(',', '.')
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function decimalPayload(value: string): number | undefined {
  return parseLocaleDecimal(value) ?? undefined
}
