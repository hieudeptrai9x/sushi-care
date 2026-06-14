import { ArrowLeft, UserRoundPlus, Users } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'

type Caregiver = {
  id: number
  name: string
  email: string
  must_change_password: number
}

export function CaregiversPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [items, setItems] = useState<Caregiver[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const load = () => api.get<Caregiver[]>('/api/caregivers/list.php').then(setItems)
  useEffect(() => { void load() }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/api/caregivers/create.php', { name, email, password })
      toast('Đã tạo tài khoản người chăm sóc')
      setName(''); setEmail(''); setPassword('')
      await load()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể tạo tài khoản.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="page-pad form-page">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="form-illustration"><Users /></div><div><small>CHĂM BÉ CÙNG NHAU</small><h1>Người chăm sóc</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      <label className="field">Tên hiển thị<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label className="field">ID đăng nhập<input autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="field">Mật khẩu tạm<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <p className="soft-copy">Người chăm sóc được ghi, sửa và xem nhật ký chung. AI Settings và tải dữ liệu chỉ dành cho quản trị viên.</p>
      <button className="primary-button" disabled={busy}><UserRoundPlus /> {busy ? 'Đang tạo...' : 'Thêm người chăm sóc'}</button>
    </form>
    <section className="card caregiver-list"><h2>Tài khoản đang dùng chung</h2>{items.length ? items.map((item) => <article key={item.id}><span>{item.name.charAt(0)}</span><div><strong>{item.name}</strong><small>{item.email}{item.must_change_password ? ' · cần đổi mật khẩu' : ''}</small></div></article>) : <p className="soft-copy">Chưa có người chăm sóc khác.</p>}</section>
  </div>
}
