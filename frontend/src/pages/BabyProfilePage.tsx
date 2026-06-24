import { ArrowLeft, Camera } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../components/Loading'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Baby } from '../types'
import { decimalPayload } from '../utils/number'

export function BabyProfilePage() {
  const navigate = useNavigate(), toast = useToast()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [birthWeight, setBirthWeight] = useState('')
  const [birthLength, setBirthLength] = useState('')
  const [uploading, setUploading] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    api.get<Baby>('/api/baby/get.php').then((data) => {
      setBaby(data)
      setBirthWeight(data.birth_weight ? String(data.birth_weight).replace('.', ',') : '')
      setBirthLength(data.birth_length ? String(data.birth_length).replace('.', ',') : '')
    })
  }, [])
  if (!baby) return <div className="page-pad"><Loading /></div>
  const change = (key: keyof Baby, value: string | number) => setBaby({ ...baby, [key]: value })
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await api.post('/api/baby/update.php', {
      ...baby,
      birth_weight: decimalPayload(birthWeight),
      birth_length: decimalPayload(birthLength),
    })
    toast('Đã lưu hồ sơ bé')
  }
  const uploadAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('avatar', file)
      const result = await api.post<{ avatar_url: string }>('/api/baby/avatar.php', body)
      setBaby({ ...baby, avatar_url: result.avatar_url })
      toast('Đã cập nhật ảnh đại diện')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }
  return <div className="page-pad">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div><small>THÔNG TIN CỦA BÉ</small><h1>Hồ sơ bé</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      <div className="avatar-editor">
        <button type="button" className="avatar-picker" aria-label="Đổi ảnh đại diện cho bé" onClick={() => avatarInput.current?.click()}>
          {baby.avatar_url ? <img src={baby.avatar_url} alt={`Ảnh ${baby.name}`} /> : <span>🍣</span>}
          <i><Camera /></i>
        </button>
        <strong>{baby.name}</strong>
        <small>{uploading ? 'Đang tải ảnh...' : 'Chạm để đổi ảnh đại diện'}</small>
        <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => uploadAvatar(event.target.files?.[0])} />
      </div>
      <label>Tên bé<input value={baby.name} onChange={(e) => change('name', e.target.value)} required /></label>
      <label>Biệt danh<input value={baby.nickname ?? ''} onChange={(e) => change('nickname', e.target.value)} /></label>
      <label>Ngày sinh<input type="date" value={baby.birth_date} onChange={(e) => change('birth_date', e.target.value)} required /></label>
      <label>Giới tính<select value={baby.gender} onChange={(e) => change('gender', e.target.value)}><option value="female">Bé gái</option><option value="male">Bé trai</option><option value="other">Khác</option></select></label>
      <label>Loại nuôi<select value={baby.feeding_type ?? 'mixed'} onChange={(e) => change('feeding_type', e.target.value)}><option value="breast_direct">Bú mẹ trực tiếp</option><option value="breast_bottle">Sữa mẹ hút ra bình</option><option value="formula">Sữa công thức</option><option value="mixed">Kết hợp</option></select></label>
      <div className="two-cols"><label>Cân nặng lúc sinh (kg)<input type="text" inputMode="decimal" placeholder="Ví dụ 2,7" value={birthWeight} onChange={(e) => setBirthWeight(e.target.value)} /></label><label>Chiều dài (cm)<input type="text" inputMode="decimal" placeholder="Ví dụ 50,5" value={birthLength} onChange={(e) => setBirthLength(e.target.value)} /></label></div>
      <label>Ghi chú<textarea value={baby.note ?? ''} onChange={(e) => change('note', e.target.value)} /></label>
      <button className="primary-button">Lưu hồ sơ</button>
    </form>
  </div>
}
