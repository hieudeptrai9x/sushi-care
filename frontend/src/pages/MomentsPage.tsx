import { Camera, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Moment } from '../types'
import { toLocalInput } from '../utils/baby'

export function MomentsPage() {
  const [items, setItems] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [viewer, setViewer] = useState<Moment | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [milestone, setMilestone] = useState('')
  const [takenAt, setTakenAt] = useState(toLocalInput())
  const input = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const load = () => api.get<Moment[]>('/api/moments/list.php').then(setItems).finally(() => setLoading(false))
  useEffect(() => { void load() }, [])

  const upload = async () => {
    if (!file) return
    const body = new FormData()
    body.append('file', file); body.append('caption', caption); body.append('milestone_label', milestone); body.append('taken_at', takenAt)
    await api.post('/api/moments/upload.php', body)
    toast('Đã lưu một khoảnh khắc đẹp'); setOpen(false); setFile(null); setCaption(''); load()
  }
  const remove = async (item: Moment) => {
    if (!confirm('Xóa khoảnh khắc này?')) return
    await api.post('/api/moments/delete.php', { id: item.id }); setViewer(null); toast('Đã xóa khoảnh khắc'); load()
  }
  const edit = async (item: Moment) => {
    const next = prompt('Sửa lời nhắn cho khoảnh khắc:', item.caption ?? '')
    if (next === null) return
    await api.post('/api/moments/update.php', { ...item, caption: next }); setViewer(null); load()
  }
  return <div className="page-pad">
    <PageHeader title="Khoảnh khắc" subtitle="LỚN LÊN CÙNG YÊU THƯƠNG" action={<button className="circle-add" onClick={() => setOpen(true)}><Plus /></button>} />
    {loading ? <Loading /> : items.length ? <div className="moment-grid">{items.map((item) => <button key={item.id} onClick={() => setViewer(item)} className="moment-tile">{item.file_type === 'video' ? <video src={item.file_url} muted /> : <img src={item.file_url} alt={item.caption ?? 'Khoảnh khắc của bé'} loading="lazy" />}<span>{item.milestone_label || new Date(item.taken_at.replace(' ', 'T')).toLocaleDateString('vi-VN')}</span></button>)}</div> : <EmptyState title="Album đang chờ điều dễ thương" text="Thêm tấm ảnh hoặc video đầu tiên của bé." />}
    {open && <div className="modal-backdrop"><section className="modal-card"><button className="modal-close" onClick={() => setOpen(false)}><X /></button><div className="upload-drop" onClick={() => input.current?.click()}><Camera /><strong>{file?.name ?? 'Chọn ảnh hoặc video'}</strong><span>JPG, PNG, WebP, MP4 hoặc MOV</span></div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><label>Lời nhắn<input value={caption} onChange={(e) => setCaption(e.target.value)} /></label><label>Dấu mốc<input placeholder="Ngày thứ 3, Tuần 1..." value={milestone} onChange={(e) => setMilestone(e.target.value)} /></label><label>Thời gian<input type="datetime-local" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} /></label><button className="primary-button" disabled={!file} onClick={upload}>Thêm vào album</button></section></div>}
    {viewer && <div className="viewer"><button onClick={() => setViewer(null)}><X /></button>{viewer.file_type === 'video' ? <video src={viewer.file_url} controls autoPlay /> : <img src={viewer.file_url} alt={viewer.caption ?? ''} />}<div><strong>{viewer.milestone_label}</strong><p>{viewer.caption}</p><button onClick={() => edit(viewer)}><Pencil /> Sửa caption</button><button className="danger-text" onClick={() => remove(viewer)}><Trash2 /> Xóa</button></div></div>}
  </div>
}
