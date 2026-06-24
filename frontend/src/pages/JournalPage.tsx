import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import type { Activity } from '../types'
import { activityStatus } from '../utils/activity'
import { vietnamDate } from '../utils/dateTime'

const filters = [['all', 'Tất cả'], ['feeding', 'Bú'], ['sleep', 'Ngủ'], ['diaper', 'Tã'], ['health', 'Sức khỏe'], ['note', 'Ghi chú']]
const filterIcons = { all: '▦', feeding: '👶', sleep: '☾', diaper: '♡', health: '+', note: '▤' } as Record<string, string>

function longDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function JournalPage() {
  const navigate = useNavigate()
  const [today, setToday] = useState(vietnamDate)
  const [date, setDate] = useState(today)
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const load = () => {
    setLoading(true)
    api.get<Activity[]>(`/api/activities/list.php?date=${date}&type=${filter}`).then(setItems).finally(() => setLoading(false))
  }
  useEffect(load, [date, filter])
  useEffect(() => {
    const refreshDate = () => {
      const next = vietnamDate()
      setToday((previous) => {
        if (previous === next) return previous
        setDate((current) => current === previous ? next : current)
        return next
      })
    }
    const timer = window.setInterval(refreshDate, 60_000)
    document.addEventListener('visibilitychange', refreshDate)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshDate)
    }
  }, [])
  const stop = async (activity: Activity) => {
    await api.post('/api/activities/stop.php', { id: activity.id })
    navigate(`/add/${activity.type}?activity=${activity.id}`)
  }
  const remove = async (id: number) => {
    if (!confirm('Xóa mục nhật ký này?')) return
    await api.post('/api/activities/delete.php', { id })
    toast('Đã xóa nhật ký')
    load()
  }
  const edit = (activity: Activity) => navigate(activity.type === 'health' ? `/health?activity=${activity.id}` : `/add/${activity.type}?activity=${activity.id}`)
  return <div className="page-pad journal-page journal-safe-bottom">
    <PageHeader title="Nhật ký của bé" subtitle="MỖI NGÀY MỘT CÂU CHUYỆN" />
    <label className="journal-date-filter"><CalendarDays /><span>{longDate(date)}</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Chọn ngày nhật ký" /></label>
    <div className="filter-row journal-filter-row">{filters.map(([key, label]) => <button className={filter === key ? 'active' : ''} onClick={() => setFilter(key)} key={key}><i>{filterIcons[key]}</i>{label}</button>)}</div>
    {loading ? <Loading /> : items.length ? <div className="timeline-card journal-layout">{items.map((item) => <ActivityCard key={item.id} activity={item} onOpen={edit} onEdit={(activity) => activityStatus(activity) === 'running' ? navigate(`/add/${activity.type}?activity=${activity.id}&adjustStart=1`) : edit(activity)} onDelete={remove} onStop={stop} onComplete={edit} variant="journal" />)}</div> : <EmptyState title="Một ngày thật nhẹ nhàng" text="Chưa có hoạt động nào trong ngày này." />}
  </div>
}
