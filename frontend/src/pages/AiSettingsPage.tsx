import { ArrowLeft, Eye, EyeOff, FlaskConical } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../components/Loading'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'

type AiSettings = {
  enabled: string; provider: string; base_url: string; model: string; api_key: string
  system_prompt: string; max_tokens: string; temperature: string
}

export function AiSettingsPage() {
  const navigate = useNavigate(), toast = useToast()
  const [data, setData] = useState<AiSettings | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  useEffect(() => { api.get<AiSettings>('/api/ai/settings.php').then(setData) }, [])
  if (!data) return <div className="page-pad"><Loading /></div>
  const update = (key: keyof AiSettings, value: string) => setData({ ...data, [key]: value })
  const save = async (event: FormEvent) => {
    event.preventDefault(); await api.post('/api/ai/settings_update.php', { ...data, enabled: data.enabled === '1' }); toast('Đã lưu cấu hình AI')
  }
  const test = async () => {
    setTesting(true)
    try { const result = await api.post<{ message: string }>('/api/ai/test.php', data); toast(result.message) } catch (error) { toast(error instanceof Error ? error.message : 'Kết nối thất bại') } finally { setTesting(false) }
  }
  return <div className="page-pad">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div><small>QUẢN TRỊ AN TOÀN</small><h1>Cấu hình AI</h1></div></header>
    <form className="card entry-form" onSubmit={save}>
      <label className="toggle-row"><div><strong>Bật trợ lý AI</strong><span>Cho phép sử dụng tính năng hỏi nhanh</span></div><input type="checkbox" checked={data.enabled === '1'} onChange={(e) => update('enabled', e.target.checked ? '1' : '0')} /></label>
      <label>Provider<select value={data.provider} onChange={(e) => update('provider', e.target.value)}><option value="openai-compatible">OpenAI-compatible</option><option value="openai">OpenAI</option><option value="openrouter">OpenRouter</option><option value="custom">Custom</option></select></label>
      <label>Base URL<input value={data.base_url} onChange={(e) => update('base_url', e.target.value)} /></label>
      <label>Model<input value={data.model} onChange={(e) => update('model', e.target.value)} /></label>
      <label>API Key<div className="password-field"><input type={showKey ? 'text' : 'password'} value={data.api_key} onFocus={() => { if (data.api_key.includes('*')) update('api_key', '') }} onChange={(e) => update('api_key', e.target.value)} placeholder="Nhập key mới" /><button type="button" onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff /> : <Eye />}</button></div></label>
      <label>System Prompt<textarea rows={7} value={data.system_prompt} onChange={(e) => update('system_prompt', e.target.value)} /></label>
      <div className="two-cols"><label>Max tokens<input type="number" value={data.max_tokens} onChange={(e) => update('max_tokens', e.target.value)} /></label><label>Temperature<input type="number" min="0" max="2" step=".1" value={data.temperature} onChange={(e) => update('temperature', e.target.value)} /></label></div>
      <button type="button" className="secondary-button" onClick={test} disabled={testing}><FlaskConical /> {testing ? 'Đang kiểm tra...' : 'Test kết nối'}</button>
      <button className="primary-button">Lưu cấu hình</button>
      <p className="privacy-note">API key được mã hóa phía máy chủ và không bao giờ trả nguyên bản về trình duyệt.</p>
    </form>
  </div>
}
