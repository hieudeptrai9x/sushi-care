export function appendClarification(current: string, suggestion: string) {
  return `${current.trim()} ${suggestion.trim()}`.trim()
}
