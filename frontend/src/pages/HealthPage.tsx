import { ArrowLeft, Thermometer, Weight } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Field } from './ActivityFormPage'
import { DateTimeInput } from '../components/DateTimeInput'
import { api } from '../services/api'
import { toLocalInput } from '../utils/baby'
import { useToast } from '../context/ToastContext'
import { decimalPayload } from '../utils/number'
import type { Activity } from '../types'

type WeightPoint = { id: number; day: string; weight_kg: number }

export function HealthPage() {
  const navigate = useNavigate(), toast = useToast()
  const [searchParams] = useSearchParams()
  const activityId = Number(searchParams.get('activity') || 0)
  const [tab, setTab] = useState('weight')
  const [value, setValue] = useState('')
  const [time, setTime] = useState(toLocalInput())
  const [note, setNote] = useState('')
  const [position, setPosition] = useState('armpit')
  const [draftMeta, setDraftMeta] = useState<Record<string, unknown>>({})
  const [weights, setWeights] = useState<WeightPoint[]>([])
  const load = () => api.get<WeightPoint[]>('/api/stats/weight.php').then(setWeights)
  useEffect(() => { load() }, [])
  useEffect(() => {
    if (!activityId) {
      const raw = sessionStorage.getItem('sushi_ai_activity_draft')
      if (!raw) return
      sessionStorage.removeItem('sushi_ai_activity_draft')
      try {
        const draft = JSON.parse(raw)
        setTab(draft.subtype === 'spit_up' ? 'spitup' : draft.subtype || 'weight')
        setValue(String(draft.weight_kg ?? draft.temperature ?? ''))
        setTime(draft.start_time?.replace(' ', 'T').slice(0, 16) || toLocalInput())
        setNote(draft.note || '')
        const meta = draft.meta_json && typeof draft.meta_json === 'object' ? draft.meta_json : {}
        setDraftMeta(meta)
        setPosition(String(meta.position || 'armpit'))
      } catch { /* Ignore invalid drafts. */ }
      return
    }
    api.get<Activity>(`/api/activities/get.php?id=${activityId}`).then((activity) => {
      setTab(activity.subtype || 'weight')
      setValue(String(activity.weight_kg ?? activity.temperature ?? ''))
      setTime(activity.start_time.replace(' ', 'T').slice(0, 16))
      setNote(activity.note || '')
      try {
        const meta = typeof activity.meta_json === 'string' ? JSON.parse(activity.meta_json) : activity.meta_json
        setPosition(String(meta?.position || 'armpit'))
      } catch { /* Ignore malformed legacy metadata. */ }
    }).catch((error) => toast(error instanceof Error ? error.message : 'Không tải được chỉ số.'))
  }, [activityId, toast])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if ((tab === 'weight' || tab === 'temperature') && decimalPayload(value) === undefined) {
      toast('Vui lòng nhập số hợp lệ, ví dụ 2,7')
      return
    }
    await api.post(activityId ? '/api/activities/update.php' : '/api/activities/create.php', {
      id: activityId || undefined,
      type: 'health', subtype: tab, start_time: time,
      weight_kg: tab === 'weight' ? decimalPayload(value) : undefined,
      temperature: tab === 'temperature' ? decimalPayload(value) : undefined,
      meta: { ...draftMeta, position }, note,
    })
    toast(activityId ? 'Đã cập nhật chỉ số sức khỏe' : 'Đã lưu chỉ số sức khỏe')
    if (activityId) navigate('/journal')
    else { setValue(''); if (tab === 'weight') load() }
  }
  return <div className="page-pad form-page health-page">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div><small>THEO DÕI NHẸ NHÀNG</small><h1>Sức khỏe của bé</h1></div></header>
    <div className="filter-row"><button className={tab === 'weight' ? 'active' : ''} onClick={() => setTab('weight')}><Weight /> Cân nặng</button><button className={tab === 'temperature' ? 'active' : ''} onClick={() => setTab('temperature')}><Thermometer /> Nhiệt độ</button><button className={tab === 'spitup' ? 'active' : ''} onClick={() => setTab('spitup')}>Ọc sữa</button></div>
    <form className="card entry-form" onSubmit={submit}>
      {tab === 'weight' && <Field label="Cân nặng (kg)"><input type="text" inputMode="decimal" placeholder="Ví dụ 2,7" value={value} onChange={(e) => setValue(e.target.value)} required /></Field>}
      {tab === 'temperature' && <><Field label="Nhiệt độ (°C)"><input type="text" inputMode="decimal" placeholder="Ví dụ 37,2" value={value} onChange={(e) => setValue(e.target.value)} required /></Field><Field label="Vị trí đo"><select value={position} onChange={(e) => setPosition(e.target.value)}><option value="armpit">Nách</option><option value="ear">Tai</option><option value="forehead">Trán</option><option value="rectal">Hậu môn</option></select></Field></>}
      {tab === 'spitup' && <div className="safety-callout">Nếu bé ọc sữa kèm khó thở, tím tái, sặc nhiều hoặc lừ đừ, hãy liên hệ bác sĩ/cấp cứu ngay.</div>}
      <Field label="Ngày giờ"><DateTimeInput value={time} onChange={setTime} required /></Field>
      <Field label="Ghi chú"><textarea value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <button className="primary-button">{activityId ? 'Cập nhật chỉ số' : 'Lưu chỉ số'}</button>
    </form>
    {tab === 'weight' && weights.length > 1 && <section className="card chart-card"><h2>Biểu đồ cân nặng</h2><ResponsiveContainer width="100%" height={220}><LineChart data={weights}><CartesianGrid strokeDasharray="3 3" stroke="#f4dfe6" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis domain={['dataMin - 0.3', 'dataMax + 0.3']} tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="weight_kg" stroke="#ff5f8f" strokeWidth={3} dot={{ fill: '#ff5f8f' }} /></LineChart></ResponsiveContainer></section>}
    <p className="medical-disclaimer">Thông tin chỉ để theo dõi và tham khảo. Nếu bé có dấu hiệu bất thường, hãy liên hệ bác sĩ.</p>
  </div>
}
