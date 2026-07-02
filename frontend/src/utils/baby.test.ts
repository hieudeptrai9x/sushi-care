import { describe, expect, it } from 'vitest'
import { calculateAge, combineLocalInput, durationMinutes, feedingGuidance, formatDuration, splitLocalInput } from './baby'
import { parseLocaleDecimal } from './number'

describe('calculateAge', () => {
  it('hiển thị ngày tuổi và tuổi theo tuần/ngày trong tháng đầu', () => {
    expect(calculateAge('2026-06-01', new Date('2026-06-14T12:00:00'))).toBe('13 ngày tuổi · 1w6d')
    expect(calculateAge('2026-06-09', new Date('2026-07-02T12:00:00'))).toBe('23 ngày tuổi · 3w2d')
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

  it('làm tròn lên để timer ngắn vẫn ghi nhận thời lượng', () => {
    expect(durationMinutes('2026-06-14T10:00:00', '2026-06-14T10:00:10')).toBe(1)
  })
})

describe('local date and time fields', () => {
  it('splits and combines a datetime-local value', () => {
    expect(splitLocalInput('2026-06-14T14:30')).toEqual({ date: '2026-06-14', time: '14:30' })
    expect(combineLocalInput('2026-06-14', '14:30')).toBe('2026-06-14T14:30')
  })
})

describe('feedingGuidance', () => {
  it('ưu tiên lượng bú theo tuổi khi có hoặc không có cân nặng', () => {
    expect(feedingGuidance('2026-06-09', new Date('2026-06-14T12:00:00'), 2.7)).toMatchObject({
      bottleAmount: 'khoảng 30 ml/cữ',
      dailyAmount: '8–12 cữ/24 giờ',
      breastfeedingCadence: '8–12 cữ/24 giờ',
      source: 'Vinmec · Medlatec · Pharmacity · Long Châu',
    })
  })

  it('gợi ý 60-90 ml/cữ cho bé từ 2 tuần đến dưới 1 tháng', () => {
    expect(feedingGuidance('2026-06-09', new Date('2026-07-02T12:00:00'))).toMatchObject({
      bottleAmount: 'khoảng 60–90 ml/cữ',
      dailyAmount: '8–12 cữ/24 giờ',
    })
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
