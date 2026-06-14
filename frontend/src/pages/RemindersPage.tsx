import { CalendarCheck, Check, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Reminder } from '../types'
import { toLocalInput } from '../utils/baby'

export function RemindersPage() {
  const [items, setItems] = useState<Reminder[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('vitamin')
  const [time, setTime] = useState(toLocalInput(new Date(Date.now() + 3_600_000)))
  const [repeat, setRepeat] = useState('none')
  const [note, setNote] = useState('')
  const toast = useToast()
  const load = () => api.get<Reminder[]>('/api/reminders/list.php').then(setItems)
  useEffect(() => { void load() }, [])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await api.post('/api/reminders/create.php', { title, reminder_type: type, reminder_time: time, repeat_rule: repeat, note })
    toast('Đã tạo nhắc nhở'); setOpen(false); setTitle(''); load()
  }
  const toggle = async (item: Reminder) => {
    await api.post('/api/reminders/update.php', { ...item, is_done: !item.is_done }); load()
  }
  const remove = async (id: number) => {
    if (!confirm('Xóa nhắc nhở này?')) return
    await api.post('/api/reminders/delete.php', { id }); load()
  }
  return <div className="page-pad">
    <PageHeader title="Lịch của bé" subtitle="ĐỂ MẸ KHÔNG PHẢI NHỚ MỘT MÌNH" action={<button className="circle-add" onClick={() => setOpen(true)}><Plus /></button>} />
    <div className="calendar-card"><div className="calendar-orb"><CalendarCheck /></div><div><small>NHẮC NHỞ SẮP TỚI</small><strong>{items.filter((item) => !item.is_done).length} việc đang chờ</strong><span>Mọi điều quan trọng đều ở đây</span></div></div>
    {items.length ? <div className="reminder-list">{items.map((item) => <article className={item.is_done ? 'done' : ''} key={item.id}><button className="check-button" onClick={() => toggle(item)}>{item.is_done ? <Check /> : null}</button><div><strong>{item.title}</strong><span>{new Date(item.reminder_time.replace(' ', 'T')).toLocaleString('vi-VN')}</span><small>{item.repeat_rule !== 'none' ? `Lặp lại: ${item.repeat_rule}` : item.note}</small></div><button className="subtle-button danger-text" onClick={() => remove(item.id)}><Trash2 /></button></article>)}</div> : <EmptyState title="Lịch đang thật thoáng" text="Tạo nhắc tiêm phòng, vitamin D hoặc tái khám." />}
    {open && <div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><button type="button" className="modal-close" onClick={() => setOpen(false)}><X /></button><h2>Tạo nhắc nhở</h2><label>Tiêu đề<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label><label>Loại<select value={type} onChange={(e) => setType(e.target.value)}><option value="vaccine">Tiêm phòng</option><option value="vitamin">Vitamin D</option><option value="appointment">Tái khám</option><option value="shopping">Mua đồ</option><option value="other">Khác</option></select></label><label>Ngày giờ<input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} required /></label><label>Lặp lại<select value={repeat} onChange={(e) => setRepeat(e.target.value)}><option value="none">Không lặp</option><option value="daily">Hằng ngày</option><option value="weekly">Hằng tuần</option><option value="monthly">Hằng tháng</option></select></label><label>Ghi chú<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label><button className="primary-button">Lưu nhắc nhở</button></form></div>}
  </div>
}
