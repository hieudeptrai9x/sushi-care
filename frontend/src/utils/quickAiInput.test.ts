import { describe, expect, it } from 'vitest'
import { appendClarification } from './quickAiInput'

describe('appendClarification', () => {
  it('combines the original input and selected clarification for immediate parsing', () => {
    expect(appendClarification('bé bú lúc 8h', 'Bên trái')).toBe('bé bú lúc 8h Bên trái')
  })
})
