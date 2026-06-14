import { ArrowLeft, Baby, MoonStar, StickyNote } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { durationMinutes, toLocalInput } from '../utils/baby'
import { useToast } from '../context/ToastContext'

const config = {
  feeding: { title: 'Nhật ký bú', icon: Baby },
  sleep: { title: 'Giấc ngủ của bé', icon: MoonStar },
  diaper: { title: 'Thay tã', icon: StickyNote },
  note: { title: 'Ghi chú nhanh', icon: StickyNote },
}

export function ActivityFormPage() {
  const { type = 'feeding' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const current = config[type as keyof typeof config] ?? config.feeding
  const Icon = current.icon
  const [subtype, setSubtype] = useState(type === 'feeding' ? 'breast' : type === 'diaper' ? 'wet' : '')
  const [start, setStart] = useState(toLocalInput())
  const [end, setEnd] = useState('')
  const [amount, setAmount] = useState('')
  const [minutes, setMinutes] = useState('')
  const [side, setSide] = useState('both')
  const [wetLevel, setWetLevel] = useState('medium')
  const [poopColor, setPoopColor] = useState('yellow')
  const [poopTexture, setPoopTexture] = useState('soft')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const duration = useMemo(() => end ? durationMinutes(start, end) : Number(minutes || 0), [start, end, minutes])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true)
    try {
      await api.post('/api/activities/create.php', {
        type, subtype: subtype || undefined, start_time: start, end_time: end || undefined,
        duration_minutes: duration, amount_ml: amount || undefined, side, wet_level: wetLevel,
        poop_color: poopColor, poop_texture: poopTexture, note,
      })
      toast('Đã lưu vào nhật ký của bé')
      navigate('/')
    } catch (error) { toast(error instanceof Error ? error.message : 'Không thể lưu.') } finally { setBusy(false) }
  }

  return <div className="page-pad form-page">
    <header className="form-header"><button className="icon-button" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="form-illustration"><Icon /></div><div><small>GHI NHANH</small><h1>{current.title}</h1></div></header>
    <form className="card entry-form" onSubmit={submit}>
      {type === 'feeding' && <>
        <Segment value={subtype} onChange={setSubtype} items={[['breast', 'Bú mẹ'], ['formula', 'Sữa công thức'], ['pump', 'Hút sữa']]} />
        {subtype === 'formula' && <Field label="Lượng sữa (ml)"><input type="number" min="1" max="1000" value={amount} onChange={(e) => setAmount(e.target.value)} required /></Field>}
        {subtype !== 'formula' && <><Field label="Bên bú / hút"><select value={side} onChange={(e) => setSide(e.target.value)}><option value="left">Bên trái</option><option value="right">Bên phải</option><option value="both">Cả hai bên</option></select></Field>
          <Field label={subtype === 'pump' ? 'Tổng lượng hút (ml)' : 'Tổng thời gian (phút)'}><input type="number" min="1" value={subtype === 'pump' ? amount : minutes} onChange={(e) => subtype === 'pump' ? setAmount(e.target.value) : setMinutes(e.target.value)} required /></Field></>}
      </>}
      {type === 'diaper' && <>
        <Segment value={subtype} onChange={setSubtype} items={[['wet', 'Tã ướt'], ['dirty', 'Tã bẩn'], ['mixed', 'Tã lẫn']]} />
        <Field label="Mức độ ướt"><select value={wetLevel} onChange={(e) => setWetLevel(e.target.value)}><option value="low">Ít</option><option value="medium">Vừa</option><option value="high">Nhiều</option></select></Field>
        {subtype !== 'wet' && <div className="two-cols"><Field label="Màu phân"><select value={poopColor} onChange={(e) => setPoopColor(e.target.value)}><option value="yellow">Vàng</option><option value="green">Xanh</option><option value="brown">Nâu</option><option value="black">Đen</option><option value="red">Đỏ</option></select></Field><Field label="Kết cấu"><select value={poopTexture} onChange={(e) => setPoopTexture(e.target.value)}><option value="soft">Sệt</option><option value="liquid">Lỏng</option><option value="hard">Cứng</option><option value="mucus">Có nhầy</option></select></Field></div>}
      </>}
      <Field label={type === 'sleep' ? 'Giờ bắt đầu' : 'Thời gian'}><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required /></Field>
      {type === 'sleep' && <><Field label="Giờ thức dậy"><input type="datetime-local" min={start} value={end} onChange={(e) => setEnd(e.target.value)} required /></Field><div className="duration-chip">Tổng thời gian: <strong>{duration} phút</strong></div></>}
      <Field label="Ghi chú"><textarea rows={3} placeholder="Bé có điều gì đặc biệt không?" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <button className="primary-button" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu nhật ký'}</button>
    </form>
  </div>
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field">{label}{children}</label>
}

function Segment({ value, onChange, items }: { value: string; onChange: (next: string) => void; items: string[][] }) {
  return <div className="segment">{items.map(([key, label]) => <button type="button" className={value === key ? 'active' : ''} key={key} onClick={() => onChange(key)}>{label}</button>)}</div>
}
