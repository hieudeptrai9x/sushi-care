import { describe, expect, it } from 'vitest'
import journalSource from './JournalPage.tsx?raw'

describe('Journal mobile layout', () => {
  it('uses the Vietnam date and leaves room above the fixed navigation', () => {
    expect(journalSource).toContain('vietnamDate()')
    expect(journalSource).not.toContain('toISOString().slice(0, 10)')
    expect(journalSource).toContain('journal-page journal-safe-bottom')
  })
})
