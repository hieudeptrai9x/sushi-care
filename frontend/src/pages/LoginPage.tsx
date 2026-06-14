import { Baby, Heart, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError('')
    try { await login(email, password) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập.') } finally { setBusy(false) }
  }
  return <main className="login-page">
    <section className="login-hero">
      <div className="brand-mark"><Baby /><Heart className="mini-heart" /></div>
      <p className="eyebrow">Nhẹ nhàng bên con mỗi ngày</p>
      <h1>Sushi Care</h1>
      <p>Nhật ký chăm sóc bé gọn gàng, ấm áp và luôn trong tầm tay.</p>
    </section>
    <form className="login-card" onSubmit={submit}>
      <div><small>Chào mừng trở lại</small><h2>Đăng nhập</h2></div>
      <label>ID đăng nhập<input type="text" autoCapitalize="none" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Mật khẩu<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      <p className="privacy-note"><ShieldCheck /> Dữ liệu gia đình được bảo vệ bằng phiên đăng nhập riêng tư.</p>
    </form>
  </main>
}
