import { describe, expect, it } from 'vitest'
import source from './RemindersPage.tsx?raw'

describe('Reminder editing', () => {
  it('opens an existing reminder in the shared form and updates it', () => {
    expect(source).toContain('setEditingId(item.id)')
    expect(source).toContain("editingId ? '/api/reminders/update.php' : '/api/reminders/create.php'")
    expect(source).toContain('Sửa nhắc nhở')
  })
})
