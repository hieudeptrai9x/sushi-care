import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Activity } from '../types'

const filters = [['all', 'Tất cả'], ['feeding', 'Bú'], ['sleep', 'Ngủ'], ['diaper', 'Tã'], ['health', 'Sức khỏe'], ['note', 'Ghi chú']]

export function JournalPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const load = () => {
    setLoading(true)
    api.get<Activity[]>(`/api/activities/list.php?date=${date}&type=${filter}`).then(setItems).finally(() => setLoading(false))
  }
  useEffect(load, [date, filter])
  const remove = async (id: number) => {
    if (!confirm('Xóa mục nhật ký này?')) return
    await api.post('/api/activities/delete.php', { id })
    toast('Đã xóa nhật ký'); load()
  }
  const stop = async (activity: Activity) => {
    await api.post('/api/activities/stop.php', { id: activity.id })
    navigate(`/add/${activity.type}?activity=${activity.id}`)
  }
  return <div className="page-pad journal-page">
    <PageHeader title="Nhật ký của bé" subtitle="MỖI NGÀY MỘT CÂU CHUYỆN" />
    <input className="date-picker" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    <div className="filter-row">{filters.map(([key, label]) => <button className={filter === key ? 'active' : ''} onClick={() => setFilter(key)} key={key}>{label}</button>)}</div>
    {loading ? <Loading /> : items.length ? <div className="card timeline-card">{items.map((item) => <ActivityCard key={item.id} activity={item} onDelete={remove} onStop={stop} onComplete={(activity) => navigate(`/add/${activity.type}?activity=${activity.id}`)} />)}</div> : <EmptyState title="Một ngày thật nhẹ nhàng" text="Chưa có hoạt động nào trong ngày này." />}
  </div>
}
