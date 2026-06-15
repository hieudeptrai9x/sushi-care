import { describe, expect, it } from 'vitest'
import { formatVietnameseDateTime, vietnamDate } from './dateTime'

describe('formatVietnameseDateTime', () => {
  it('chỉ hiển thị giờ và phút, không hiển thị giây', () => {
    expect(formatVietnameseDateTime('2026-06-14 13:26:00')).toBe('13:26 14/06/2026')
  })

  it('dùng đúng ngày Việt Nam trước 07:00 sáng', () => {
    expect(vietnamDate(new Date('2026-06-14T21:00:00.000Z'))).toBe('2026-06-15')
  })
})
