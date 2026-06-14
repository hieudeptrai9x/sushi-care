import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request } from './api'

afterEach(() => vi.unstubAllGlobals())

describe('request', () => {
  it('trả data từ response thành công', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 1 } }),
    }))
    await expect(request<{ id: number }>('/api/test')).resolves.toEqual({ id: 1 })
  })

  it('ném ApiError có status và message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'Vui lòng đăng nhập.' }),
    }))
    await expect(request('/api/test')).rejects.toEqual(new ApiError('Vui lòng đăng nhập.', 401))
  })
})
