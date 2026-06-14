export type InlinePart = {
  type: 'text' | 'strong'
  value: string
}

export type MarkdownBlock =
  | { type: 'paragraph'; content: InlinePart[] }
  | { type: 'heading'; level: number; content: InlinePart[] }
  | { type: 'ordered-list'; items: InlinePart[][] }
  | { type: 'unordered-list'; items: InlinePart[][] }

function parseInline(value: string): InlinePart[] {
  const parts: InlinePart[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let cursor = 0
  let match = pattern.exec(value)

  while (match) {
    if (match.index > cursor) {
      parts.push({ type: 'text', value: value.slice(cursor, match.index) })
    }
    parts.push({ type: 'strong', value: match[1] })
    cursor = match.index + match[0].length
    match = pattern.exec(value)
  }

  if (cursor < value.length) {
    parts.push({ type: 'text', value: value.slice(cursor) })
  }

  return parts.length ? parts : [{ type: 'text', value }]
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) })
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        content: parseInline(heading[2]),
      })
      continue
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/)
    if (ordered) {
      flushParagraph()
      const previous = blocks[blocks.length - 1]
      if (previous?.type === 'ordered-list') {
        previous.items.push(parseInline(ordered[1]))
      } else {
        blocks.push({ type: 'ordered-list', items: [parseInline(ordered[1])] })
      }
      continue
    }

    const unordered = line.match(/^[-*]\s+(.+)$/)
    if (unordered) {
      flushParagraph()
      const previous = blocks[blocks.length - 1]
      if (previous?.type === 'unordered-list') {
        previous.items.push(parseInline(unordered[1]))
      } else {
        blocks.push({ type: 'unordered-list', items: [parseInline(unordered[1])] })
      }
      continue
    }

    paragraph.push(line)
  }

  flushParagraph()
  return blocks
}
