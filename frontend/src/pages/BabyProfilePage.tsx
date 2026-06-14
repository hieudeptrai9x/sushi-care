import { ArrowLeft } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../components/Loading'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Baby } from '../types'

export function BabyProfilePage() {
  const navigate = useNavigate(), toast = useToast()
  const [baby, setBaby] = useState<Baby | null>(null)
  useEffect(() => { api.get<Baby>('/api/baby/get.php').then(setBaby) }, [])
  if (!baby) return <div className="page-pad"><Loading /></div>
  const change = (key: keyof Baby, value: string | number) => setBaby({ ...baby, [key]: value })
  const submit = async (event: FormEvent) => {
    event.preventDefault(); await api.post('/api/baby/update.php', baby); toast('Đã lưu hồ sơ bé')
  }
  return <div className="page-pad">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div><small>THÔNG TIN CỦA BÉ</small><h1>Hồ sơ bé</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      <div className="avatar-editor">🍣<span>{baby.name}</span></div>
      <label>Tên bé<input value={baby.name} onChange={(e) => change('name', e.target.value)} required /></label>
      <label>Biệt danh<input value={baby.nickname ?? ''} onChange={(e) => change('nickname', e.target.value)} /></label>
      <label>Ngày sinh<input type="date" value={baby.birth_date} onChange={(e) => change('birth_date', e.target.value)} required /></label>
      <label>Giới tính<select value={baby.gender} onChange={(e) => change('gender', e.target.value)}><option value="female">Bé gái</option><option value="male">Bé trai</option><option value="other">Khác</option></select></label>
      <div className="two-cols"><label>Cân nặng lúc sinh (kg)<input type="number" step=".01" value={baby.birth_weight ?? ''} onChange={(e) => change('birth_weight', Number(e.target.value))} /></label><label>Chiều dài (cm)<input type="number" step=".1" value={baby.birth_length ?? ''} onChange={(e) => change('birth_length', Number(e.target.value))} /></label></div>
      <label>Ghi chú<textarea value={baby.note ?? ''} onChange={(e) => change('note', e.target.value)} /></label>
      <button className="primary-button">Lưu hồ sơ</button>
    </form>
  </div>
}
