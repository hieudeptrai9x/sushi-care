import { ArrowLeft, KeyRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'

export function ChangePasswordPage() {
  const navigate = useNavigate(), toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (next !== confirm) return toast('Mật khẩu nhập lại chưa khớp')
    try {
      await api.post('/api/auth/change_password.php', { current_password: current, new_password: next })
      toast('Đã đổi mật khẩu'); navigate('/settings')
    } catch (error) { toast(error instanceof Error ? error.message : 'Không thể đổi mật khẩu') }
  }
  return <div className="page-pad">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="form-illustration"><KeyRound /></div><div><small>BẢO VỆ GIA ĐÌNH</small><h1>Đổi mật khẩu</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      <label>Mật khẩu hiện tại<input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required /></label>
      <label>Mật khẩu mới<input type="password" autoComplete="new-password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} required /></label>
      <label>Nhập lại mật khẩu mới<input type="password" autoComplete="new-password" minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></label>
      <button className="primary-button">Lưu mật khẩu mới</button>
    </form>
  </div>
}
