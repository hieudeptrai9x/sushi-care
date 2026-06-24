import { describe, expect, it } from 'vitest'
import { homeRefreshState, isFocusRoute } from './AppShell'

describe('isFocusRoute', () => {
  it.each([
    '/add/feeding',
    '/add/sleep',
    '/add/diaper',
    '/health',
    '/baby',
    '/change-password',
    '/ai-settings',
    '/ai',
    '/feeding-reminders',
  ])('hides the main navigation on %s', (pathname) => {
    expect(isFocusRoute(pathname)).toBe(true)
  })

  it.each(['/', '/journal', '/reminders', '/settings'])(
    'keeps the main navigation on %s',
    (pathname) => {
      expect(isFocusRoute(pathname)).toBe(false)
    },
  )
})

describe('homeRefreshState', () => {
  it('tạo navigation state mới để Home tải lại sau khi bắt đầu task', () => {
    expect(homeRefreshState(1234)).toEqual({ refreshAt: 1234 })
  })
})
