import { describe, expect, it } from 'vitest'
import { calculateAge, durationMinutes, formatDuration } from './baby'

describe('calculateAge', () => {
  it('hiển thị ngày tuổi và tuần trong tháng đầu', () => {
    expect(calculateAge('2026-06-01', new Date('2026-06-14T12:00:00'))).toBe('13 ngày tuổi · Tuần 2')
  })

  it('hiển thị tháng và ngày từ ngày thứ 30', () => {
    expect(calculateAge('2026-04-10', new Date('2026-06-14T12:00:00'))).toBe('2 tháng 4 ngày')
  })
})

describe('duration helpers', () => {
  it('tính đúng khoảng thời gian qua nửa đêm', () => {
    expect(durationMinutes('2026-06-14T23:30', '2026-06-15T01:00')).toBe(90)
    expect(formatDuration(90)).toBe('1 giờ 30 phút')
  })
})
