import { describe, expect, it } from 'vitest'
import quickInputSource from '../components/QuickAiInputCard.tsx?raw'
import homeSource from './HomePage.tsx?raw'

describe('Home dashboard layout', () => {
  it('places AI quick input immediately before reminders', () => {
    const quickInputIndex = homeSource.indexOf('<QuickAiInputCard')
    const remindersIndex = homeSource.indexOf('<h2>Lịch & nhắc nhở</h2>')

    expect(quickInputIndex).toBeGreaterThan(homeSource.indexOf('wellbeing-card'))
    expect(quickInputIndex).toBeLessThan(remindersIndex)
  })

  it('keeps quick input compact without the examples button', () => {
    expect(quickInputSource).not.toContain('Xem ví dụ')
    expect(quickInputSource).not.toContain('examplesOpen')
    expect(quickInputSource).toContain('rows={1}')
    expect(quickInputSource).not.toContain('AI sẽ hỏi lại nếu thông tin chưa rõ.')
  })

  it('marks the AI textarea as safe from iOS focus zoom', () => {
    expect(quickInputSource).toContain('className="ios-no-zoom-input"')
  })

  it('uses the Vietnam date for timeline and stats requests', () => {
    expect(homeSource).toContain('vietnamDate()')
    expect(homeSource).toContain('/api/stats/today.php?date=${today}')
    expect(homeSource).not.toContain('toISOString().slice(0, 10)')
  })
})
