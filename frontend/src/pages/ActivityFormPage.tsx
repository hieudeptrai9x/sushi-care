import { ArrowLeft, Baby, MoonStar, StickyNote } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DateTimeInput } from '../components/DateTimeInput'
import { api } from '../services/api'
import type { Activity } from '../types'
import { durationMinutes, toLocalInput } from '../utils/baby'
import { activityStatus, type ActivityStatus, usesRecordedDuration } from '../utils/activity'
import { useToast } from '../context/ToastContext'

const config = {
  feeding: { title: 'Nhật ký bú', icon: Baby },
  sleep: { title: 'Giấc ngủ của bé', icon: MoonStar },
  diaper: { title: 'Thay tã', icon: StickyNote },
  note: { title: 'Ghi chú nhanh', icon: StickyNote },
}

export function ActivityFormPage() {
  const { type = 'feeding' } = useParams()
  const [searchParams] = useSearchParams()
  const activityId = Number(searchParams.get('activity') || 0)
  const navigate = useNavigate()
  const toast = useToast()
  const current = config[type as keyof typeof config] ?? config.feeding
  const Icon = current.icon
  const [subtype, setSubtype] = useState(type === 'feeding' ? 'breast_direct' : type === 'diaper' ? 'wet' : '')
  const [start, setStart] = useState(toLocalInput())
  const [end, setEnd] = useState('')
  const [amount, setAmount] = useState('')
  const [leftAmount, setLeftAmount] = useState('')
  const [rightAmount, setRightAmount] = useState('')
  const [minutes, setMinutes] = useState('')
  const [side, setSide] = useState('both')
  const [wetLevel, setWetLevel] = useState('medium')
  const [poopColor, setPoopColor] = useState('yellow')
  const [poopTexture, setPoopTexture] = useState('soft')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadedStatus, setLoadedStatus] = useState<ActivityStatus>('completed')
  const [aiDraftLoaded, setAiDraftLoaded] = useState(false)
  const [draftMeta, setDraftMeta] = useState<Record<string, unknown>>({})
  const duration = useMemo(() => end ? durationMinutes(start, end) : Number(minutes || 0), [start, end, minutes])
  const recordedDuration = usesRecordedDuration(activityId, loadedStatus, end) || (aiDraftLoaded && end !== '')

  useEffect(() => {
    if (!activityId) {
      const raw = sessionStorage.getItem('sushi_ai_activity_draft')
      if (!raw) return
      sessionStorage.removeItem('sushi_ai_activity_draft')
      try {
        const draft = JSON.parse(raw)
        const nextSubtype = draft.type === 'pumping' ? 'pump' : draft.subtype === 'breastfeeding' ? 'breast_direct' : draft.subtype === 'bottle' ? 'breast_bottle' : draft.subtype
        setSubtype(nextSubtype || (type === 'feeding' ? 'breast_direct' : ''))
        setStart(draft.start_time?.replace(' ', 'T').slice(0, 16) || toLocalInput())
        setEnd(draft.end_time?.replace(' ', 'T').slice(0, 16) || '')
        setAmount(draft.amount_ml ? String(draft.amount_ml) : '')
        setMinutes(draft.duration_minutes ? String(draft.duration_minutes) : '')
        setSide(draft.side || 'both')
        setWetLevel(draft.wet_level || 'medium')
        setPoopColor(draft.poop_color || 'yellow')
        setPoopTexture(draft.poop_texture || 'soft')
        setNote(draft.note || '')
        const meta = draft.meta_json && typeof draft.meta_json === 'object' ? draft.meta_json : {}
        setDraftMeta(meta)
        setLeftAmount(meta.left_ml ? String(meta.left_ml) : '')
        setRightAmount(meta.right_ml ? String(meta.right_ml) : '')
        setAiDraftLoaded(true)
      } catch { /* Ignore invalid drafts and keep a clean manual form. */ }
      return
    }
    api.get<Activity>(`/api/activities/get.php?id=${activityId}`).then((activity) => {
      setLoadedStatus(activityStatus(activity))
      setSubtype(activity.subtype || (type === 'feeding' ? 'breast_direct' : ''))
      setStart(activity.start_time.replace(' ', 'T').slice(0, 16))
      setEnd(activity.end_time ? activity.end_time.replace(' ', 'T').slice(0, 16) : toLocalInput())
      setAmount(activity.amount_ml ? String(activity.amount_ml) : '')
      try {
        const meta = typeof activity.meta_json === 'string' ? JSON.parse(activity.meta_json) : activity.meta_json
        setLeftAmount(meta?.left_ml ? String(meta.left_ml) : '')
        setRightAmount(meta?.right_ml ? String(meta.right_ml) : '')
      } catch { /* Ignore malformed legacy metadata. */ }
      setMinutes(activity.duration_minutes ? String(activity.duration_minutes) : '')
      setSide(activity.side || 'both')
      setNote(activity.note || '')
    }).catch((error) => toast(error instanceof Error ? error.message : 'Không tải được hoạt động.'))
  }, [activityId, toast, type])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true)
    try {
      const pumpTotal = Number(leftAmount || 0) + Number(rightAmount || 0)
      const payload = {
        id: activityId || undefined,
        type, subtype: subtype || undefined, start_time: start, end_time: end || undefined,
        duration_minutes: duration, amount_ml: subtype === 'pump' ? pumpTotal : amount || undefined, side, wet_level: wetLevel,
        poop_color: poopColor, poop_texture: poopTexture, note,
        meta: { ...draftMeta, status: 'completed', ...(subtype === 'pump' ? { left_ml: Number(leftAmount || 0), right_ml: Number(rightAmount || 0) } : {}) },
      }
      await api.post(activityId ? '/api/activities/update.php' : '/api/activities/create.php', payload)
      toast('Đã lưu vào nhật ký của bé')
      navigate('/')
    } catch (error) { toast(error instanceof Error ? error.message : 'Không thể lưu.') } finally { setBusy(false) }
  }

  return <div className="page-pad form-page">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="form-illustration"><Icon /></div><div><small>GHI NHANH</small><h1>{current.title}</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      {type === 'feeding' && <>
        <Segment value={subtype} onChange={setSubtype} items={[['breast_direct', 'Bú trực tiếp'], ['breast_bottle', 'Sữa mẹ bình'], ['formula', 'Sữa công thức'], ['pump', 'Hút sữa']]} />
        {(subtype === 'formula' || subtype === 'breast_bottle') && <Field label="Lượng bé đã bú (ml)"><input type="number" inputMode="numeric" min="1" max="1000" value={amount} onChange={(e) => setAmount(e.target.value)} required /></Field>}
        {subtype === 'breast_direct' && <><Field label="Bên bú"><select value={side} onChange={(e) => setSide(e.target.value)}><option value="left">Bên trái</option><option value="right">Bên phải</option><option value="both">Cả hai bên</option></select></Field>
          {recordedDuration ? <div className="duration-chip">Thời gian bú tự tính: <strong>{duration} phút</strong></div> : <Field label="Tổng thời gian bú (phút)"><input type="number" inputMode="numeric" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} required /></Field>}</>}
        {subtype === 'breast_bottle' && <div className="feeding-note">Ghi đúng số ml sữa mẹ đã vắt mà bé thực sự bú. Không cần ép bé bú hết bình; tiếp tục theo dõi tín hiệu đói/no, tã ướt và tăng cân.</div>}
        {subtype === 'pump' && <>
          <div className="two-cols"><Field label="Bên trái (ml)"><input type="number" inputMode="numeric" min="0" value={leftAmount} onChange={(e) => setLeftAmount(e.target.value)} /></Field><Field label="Bên phải (ml)"><input type="number" inputMode="numeric" min="0" value={rightAmount} onChange={(e) => setRightAmount(e.target.value)} /></Field></div>
          {recordedDuration ? <div className="duration-chip">Thời gian hút tự tính: <strong>{duration} phút</strong></div> : <Field label="Thời gian hút (phút)"><input type="number" inputMode="numeric" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} required /></Field>}
          <div className="duration-chip pump-total">Tổng lượng: <strong>{Number(leftAmount || 0) + Number(rightAmount || 0)} ml</strong></div>
        </>}
      </>}
      {type === 'diaper' && <>
        <Segment value={subtype} onChange={setSubtype} items={[['wet', 'Tã ướt'], ['dirty', 'Tã bẩn'], ['mixed', 'Tã lẫn']]} />
        <Field label="Mức độ ướt"><select value={wetLevel} onChange={(e) => setWetLevel(e.target.value)}><option value="low">Ít</option><option value="medium">Vừa</option><option value="high">Nhiều</option></select></Field>
        {subtype !== 'wet' && <div className="two-cols"><Field label="Màu phân"><select value={poopColor} onChange={(e) => setPoopColor(e.target.value)}><option value="yellow">Vàng</option><option value="green">Xanh</option><option value="brown">Nâu</option><option value="black">Đen</option><option value="red">Đỏ</option></select></Field><Field label="Kết cấu"><select value={poopTexture} onChange={(e) => setPoopTexture(e.target.value)}><option value="soft">Sệt</option><option value="liquid">Lỏng</option><option value="hard">Cứng</option><option value="mucus">Có nhầy</option></select></Field></div>}
      </>}
      <Field label={type === 'sleep' ? 'Giờ bắt đầu' : 'Thời gian'}><DateTimeInput value={start} onChange={setStart} required /></Field>
      {type === 'feeding' && recordedDuration && <Field label="Thời gian kết thúc"><DateTimeInput value={end} onChange={setEnd} required /></Field>}
      {type === 'sleep' && <><Field label="Giờ thức dậy"><DateTimeInput value={end} onChange={setEnd} required /></Field><div className="duration-chip">Tổng thời gian: <strong>{duration} phút</strong></div></>}
      <Field label="Ghi chú"><textarea rows={3} placeholder="Bé có điều gì đặc biệt không?" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <button className="primary-button" disabled={busy}>{busy ? 'Đang lưu...' : activityId ? loadedStatus === 'paused' ? 'Hoàn tất nhật ký' : 'Cập nhật nhật ký' : 'Lưu nhật ký'}</button>
    </form>
  </div>
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field">{label}{children}</label>
}

function Segment({ value, onChange, items }: { value: string; onChange: (next: string) => void; items: string[][] }) {
  return <div className="segment">{items.map(([key, label]) => <button type="button" className={value === key ? 'active' : ''} key={key} onClick={() => onChange(key)}>{label}</button>)}</div>
}
