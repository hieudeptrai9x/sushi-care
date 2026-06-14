import { describe, expect, it } from 'vitest'
import { parseMarkdown } from './markdown'

describe('parseMarkdown', () => {
  it('parses headings, bold text, and lists from AI replies', () => {
    expect(parseMarkdown([
      'Bé bú mẹ xong **không nhất thiết** là do chưa đủ no.',
      '',
      '### Làm sao biết bé bú đủ?',
      '1. **Theo dõi tã ướt**',
      '2. Bé thư giãn sau bú',
      '- Nghe bé nuốt sữa',
    ].join('\n'))).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', value: 'Bé bú mẹ xong ' },
          { type: 'strong', value: 'không nhất thiết' },
          { type: 'text', value: ' là do chưa đủ no.' },
        ],
      },
      {
        type: 'heading',
        level: 3,
        content: [{ type: 'text', value: 'Làm sao biết bé bú đủ?' }],
      },
      {
        type: 'ordered-list',
        items: [
          [
            { type: 'strong', value: 'Theo dõi tã ướt' },
          ],
          [
            { type: 'text', value: 'Bé thư giãn sau bú' },
          ],
        ],
      },
      {
        type: 'unordered-list',
        items: [
          [{ type: 'text', value: 'Nghe bé nuốt sữa' }],
        ],
      },
    ])
  })

  it('leaves unmatched markdown markers as ordinary text', () => {
    expect(parseMarkdown('Dấu ** chưa đóng')).toEqual([
      {
        type: 'paragraph',
        content: [{ type: 'text', value: 'Dấu ** chưa đóng' }],
      },
    ])
  })
})
