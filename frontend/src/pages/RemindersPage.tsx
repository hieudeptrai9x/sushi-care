import { CalendarCheck, Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { DateTimeInput } from '../components/DateTimeInput'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Reminder } from '../types'
import { toLocalInput } from '../utils/baby'
import { formatVietnameseDateTime } from '../utils/dateTime'

export function RemindersPage() {
  const [items, setItems] = useState<Reminder[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('vitamin')
  const [time, setTime] = useState(toLocalInput(new Date(Date.now() + 3_600_000)))
  const [repeat, setRepeat] = useState('none')
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDone, setEditingDone] = useState(0)
  const toast = useToast()
  const load = () => api.get<Reminder[]>('/api/reminders/list.php').then(setItems)
  useEffect(() => { void load() }, [])
  const resetForm = () => {
    setTitle('')
    setType('vitamin')
    setTime(toLocalInput(new Date(Date.now() + 3_600_000)))
    setRepeat('none')
    setNote('')
    setEditingId(null)
    setEditingDone(0)
  }
  const openCreate = () => {
    resetForm()
    setOpen(true)
  }
  const openEdit = (item: Reminder) => {
    setEditingId(item.id)
    setEditingDone(item.is_done)
    setTitle(item.title)
    setType(item.reminder_type)
    setTime(item.reminder_time.replace(' ', 'T').slice(0, 16))
    setRepeat(item.repeat_rule)
    setNote(item.note ?? '')
    setOpen(true)
  }
  const closeForm = () => {
    setOpen(false)
    resetForm()
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const endpoint = editingId ? '/api/reminders/update.php' : '/api/reminders/create.php'
    await api.post(endpoint, { id: editingId, title, reminder_type: type, reminder_time: time, repeat_rule: repeat, note, is_done: editingDone })
    toast(editingId ? 'Đã cập nhật nhắc nhở' : 'Đã tạo nhắc nhở')
    closeForm()
    load()
  }
  const toggle = async (item: Reminder) => {
    await api.post('/api/reminders/update.php', { ...item, is_done: !item.is_done }); load()
  }
  const remove = async (id: number) => {
    if (!confirm('Xóa nhắc nhở này?')) return
    await api.post('/api/reminders/delete.php', { id }); load()
  }
  return <div className="page-pad">
    <PageHeader title="Lịch của bé" subtitle="ĐỂ MẸ KHÔNG PHẢI NHỚ MỘT MÌNH" action={<button className="circle-add" onClick={openCreate}><Plus /></button>} />
    <div className="calendar-card"><div className="calendar-orb"><CalendarCheck /></div><div><small>NHẮC NHỞ SẮP TỚI</small><strong>{items.filter((item) => !item.is_done).length} việc đang chờ</strong><span>Mọi điều quan trọng đều ở đây</span></div></div>
    {items.length ? <div className="reminder-list">{items.map((item) => <article className={`reminder-row compact-reminder-row${item.is_done ? ' done' : ''}`} key={item.id}><button className="check-button" onClick={() => toggle(item)}>{item.is_done ? <Check /> : null}</button><div><strong>{item.title}</strong><span>{formatVietnameseDateTime(item.reminder_time)}</span><small>{item.repeat_rule !== 'none' ? `Lặp lại: ${item.repeat_rule}` : item.note}</small></div><div className="reminder-actions"><button className="subtle-button" onClick={() => openEdit(item)} aria-label="Sửa"><Pencil /></button><button className="subtle-button danger-text" onClick={() => remove(item.id)} aria-label="Xóa"><Trash2 /></button></div></article>)}</div> : <EmptyState title="Lịch đang thật thoáng" text="Tạo nhắc tiêm phòng, vitamin D hoặc tái khám." />}
    {open && <div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><button type="button" className="modal-close" onClick={closeForm}><X /></button><h2>{editingId ? 'Sửa nhắc nhở' : 'Tạo nhắc nhở'}</h2><label>Tiêu đề<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label><label>Loại<select value={type} onChange={(e) => setType(e.target.value)}><option value="vaccine">Tiêm phòng</option><option value="vitamin">Vitamin D</option><option value="appointment">Tái khám</option><option value="shopping">Mua đồ</option><option value="other">Khác</option></select></label><label>Ngày giờ<DateTimeInput value={time} onChange={setTime} required /></label><label>Lặp lại<select value={repeat} onChange={(e) => setRepeat(e.target.value)}><option value="none">Không lặp</option><option value="daily">Hằng ngày</option><option value="weekly">Hằng tuần</option><option value="monthly">Hằng tháng</option></select></label><label>Ghi chú<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label><button className="primary-button">{editingId ? 'Cập nhật nhắc nhở' : 'Lưu nhắc nhở'}</button></form></div>}
  </div>
}
