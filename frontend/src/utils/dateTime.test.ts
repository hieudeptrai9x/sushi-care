import { describe, expect, it } from 'vitest'
import { formatVietnameseDateTime } from './dateTime'

describe('formatVietnameseDateTime', () => {
  it('chỉ hiển thị giờ và phút, không hiển thị giây', () => {
    expect(formatVietnameseDateTime('2026-06-14 13:26:00')).toBe('13:26 14/06/2026')
  })
})
