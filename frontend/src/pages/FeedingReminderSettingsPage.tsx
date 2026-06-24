import { ArrowLeft, Mail, Milk, Send } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'

type Settings = {
  enabled: string; minutes_before: string; emails: string
  smtp_host?: string; smtp_port?: string; smtp_username?: string; smtp_password?: string
  smtp_encryption?: string; from_email?: string; from_name?: string
}

export function FeedingReminderSettingsPage() {
  const navigate = useNavigate(), toast = useToast(), { user } = useAuth()
  const [data, setData] = useState<Settings | null>(null)
  const [testing, setTesting] = useState(false)
  useEffect(() => { api.get<Settings>('/api/feeding/settings.php').then(setData) }, [])
  if (!data) return <div className="page-pad"><Loading /></div>
  const update = (key: keyof Settings, value: string) => setData({ ...data, [key]: value })
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await api.post('/api/feeding/settings_update.php', { ...data, enabled: data.enabled === '1' })
    toast('Đã lưu nhắc hâm sữa')
  }
  const testEmail = async () => {
    setTesting(true)
    try {
      await api.post('/api/feeding/settings_update.php', { ...data, enabled: data.enabled === '1' })
      const result = await api.post<{ sent: string[] }>('/api/feeding/test_email.php')
      toast(`Đã gửi email test tới ${result.sent.join(', ')}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Gửi email test thất bại')
    } finally {
      setTesting(false)
    }
  }
  return <div className="page-pad form-page">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="form-illustration"><Milk /></div><div><small>CHUẨN BỊ NHẸ NHÀNG</small><h1>Nhắc hâm sữa</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      <label className="toggle-row"><div><strong>Bật nhắc hâm sữa</strong><span>Gửi email trước cữ bú dự kiến</span></div><input type="checkbox" checked={data.enabled === '1'} onChange={(e) => update('enabled', e.target.checked ? '1' : '0')} /></label>
      <label>Nhắc trước<select value={data.minutes_before} onChange={(e) => update('minutes_before', e.target.value)}>{[5, 10, 15, 20].map((value) => <option value={value} key={value}>{value} phút</option>)}</select></label>
      <label>Email nhận thông báo<div className="field-with-icon"><Mail /><input type="text" inputMode="email" value={data.emails} onChange={(e) => update('emails', e.target.value)} placeholder="a@gmail.com, b@gmail.com" /></div></label>
      <p className="soft-copy">Có thể nhập nhiều email, cách nhau bằng dấu phẩy. Bú mẹ trực tiếp sẽ không gửi nhắc hâm sữa.</p>
      {user?.role === 'admin' && <fieldset className="smtp-settings"><legend>SMTP gửi email</legend>
        <label>SMTP Host<input value={data.smtp_host ?? ''} onChange={(e) => update('smtp_host', e.target.value)} /></label>
        <div className="two-cols"><label>Port<input type="number" value={data.smtp_port ?? '465'} onChange={(e) => update('smtp_port', e.target.value)} /></label><label>Mã hóa<select value={data.smtp_encryption ?? 'ssl'} onChange={(e) => update('smtp_encryption', e.target.value)}><option value="ssl">SSL</option><option value="tls">TLS</option><option value="none">Không</option></select></label></div>
        <label>SMTP Username<input value={data.smtp_username ?? ''} onChange={(e) => update('smtp_username', e.target.value)} /></label>
        <label>SMTP Password<input type="password" value={data.smtp_password ?? ''} onFocus={() => { if (data.smtp_password?.includes('*')) update('smtp_password', '') }} onChange={(e) => update('smtp_password', e.target.value)} /></label>
        <div className="two-cols"><label>Email gửi<input type="email" value={data.from_email ?? ''} onChange={(e) => update('from_email', e.target.value)} /></label><label>Tên người gửi<input value={data.from_name ?? ''} onChange={(e) => update('from_name', e.target.value)} /></label></div>
      </fieldset>}
      <button className="primary-button">Lưu cài đặt</button>
      {user?.role === 'admin' && <button type="button" className="secondary-button" onClick={testEmail} disabled={testing}><Send /> {testing ? 'Đang gửi email test...' : 'Gửi email test'}</button>}
    </form>
  </div>
}
