import { describe, expect, it } from 'vitest'
import { calculateAge, combineLocalInput, durationMinutes, feedingGuidance, formatDuration, splitLocalInput } from './baby'
import { parseLocaleDecimal } from './number'

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

describe('local date and time fields', () => {
  it('splits and combines a datetime-local value', () => {
    expect(splitLocalInput('2026-06-14T14:30')).toEqual({ date: '2026-06-14', time: '14:30' })
    expect(combineLocalInput('2026-06-14', '14:30')).toBe('2026-06-14T14:30')
  })
})

describe('feedingGuidance', () => {
  it('hướng dẫn 30-60 ml trong những ngày đầu', () => {
    expect(feedingGuidance('2026-06-11', new Date('2026-06-14T12:00:00'))).toMatchObject({
      amount: '30–60 ml/cữ',
      cadence: 'mỗi 2–3 giờ',
    })
  })

  it('hướng dẫn 90-120 ml khi gần hết tháng đầu', () => {
    expect(feedingGuidance('2026-05-16', new Date('2026-06-14T12:00:00')).amount).toBe('90–120 ml/cữ')
  })

  it('hướng dẫn 180-240 ml khi bé khoảng 6 tháng', () => {
    expect(feedingGuidance('2025-12-14', new Date('2026-06-14T12:00:00')).amount).toBe('180–240 ml/cữ')
  })
})

describe('parseLocaleDecimal', () => {
  it('chấp nhận dấu phẩy thập phân tiếng Việt', () => {
    expect(parseLocaleDecimal('2,7')).toBe(2.7)
  })

  it('chấp nhận dấu chấm và bỏ khoảng trắng', () => {
    expect(parseLocaleDecimal(' 50.5 ')).toBe(50.5)
  })
})
