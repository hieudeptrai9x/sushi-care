import { describe, expect, it } from 'vitest'
import { isFocusRoute } from './AppShell'

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
