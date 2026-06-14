export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

let csrfToken = ''
export const setCsrfToken = (token: string) => { csrfToken = token }

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const resolvedPath = path.startsWith('/api/') ? `${base}${path}` : path
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (csrfToken && (options.method ?? 'GET') !== 'GET') headers.set('X-CSRF-Token', csrfToken)
  const response = await fetch(resolvedPath, { credentials: 'include', ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || 'Không thể kết nối máy chủ.', response.status)
  }
  return payload.data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  }),
}
