import { Bell, Bot, CalendarDays, ChevronRight, Droplets, Info, Milk, MoonStar, Scale } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { Loading } from '../components/Loading'
import { api } from '../services/api'
import type { Activity, Baby, Reminder, TodayStats } from '../types'
import { calculateAge, feedingGuidance, formatDuration } from '../utils/baby'
import { useToast } from '../context/ToastContext'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    const today = new Date().toISOString().slice(0, 10)
    return Promise.all([
      api.get<Baby>('/api/baby/get.php'),
      api.get<TodayStats>('/api/stats/today.php'),
      api.get<Activity[]>(`/api/activities/list.php?date=${today}&type=all`),
      api.get<Reminder[]>('/api/reminders/list.php'),
    ]).then(([babyData, statsData, activityData, reminderData]) => {
      setBaby(babyData); setStats(statsData); setActivities(activityData); setReminders(reminderData)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { void load() }, [location.key])

  const start = async (type: 'feeding' | 'sleep') => {
    const result = await api.post<{ id: number; already_running: boolean }>('/api/activities/start.php', { type })
    toast(result.already_running ? 'Hoạt động này đang được theo dõi' : type === 'feeding' ? 'Đã bắt đầu cữ bú' : 'Đã bắt đầu giấc ngủ')
    await load()
  }
  const stop = async (activity: Activity) => {
    await api.post('/api/activities/stop.php', { id: activity.id })
    navigate(`/add/${activity.type}?activity=${activity.id}`)
  }

  if (loading) return <div className="page-pad"><Loading cards={5} /></div>
  const currentWeight = stats?.weight.current ?? baby?.birth_weight
  const milkGuide = baby ? feedingGuidance(baby.birth_date, new Date(), currentWeight ?? undefined) : null
  return <>
    <header className="home-hero">
      <div className="home-top"><div className="baby-avatar">{baby?.avatar_url ? <img src={baby.avatar_url} /> : '🍣'}</div><div><small>Chào buổi sáng</small><h1>{baby?.name ?? 'Bé Sushi'}</h1><p>{baby ? calculateAge(baby.birth_date) : ''}</p></div><button className="icon-button glass notification-button" onClick={() => navigate('/reminders')} aria-label="Mở nhắc nhở"><Bell />{reminders.some((item) => !item.is_done) && <i />}</button></div>
      {milkGuide && <div className="feeding-guide">
        <div className="feeding-guide-icon"><Milk /></div>
        <div><small>THEO CÂN NẶNG {currentWeight ? `${currentWeight} KG` : 'HIỆN TẠI'}</small><strong>{baby?.name}: {milkGuide.bottleAmount}</strong><span>{milkGuide.dailyAmount} · {milkGuide.bottleCadence}</span></div>
        <a className="feeding-source" href="https://tudu.com.vn/vn/suc-khoe-cua-be/bao-nhieu-sua-hang-ngay-thi-du-cho-be/" target="_blank" rel="noreferrer" aria-label="Xem nguồn hướng dẫn của Bệnh viện Từ Dũ"><Info /></a>
        <p><b>Áp dụng khi bú bình</b> bằng sữa mẹ vắt ra hoặc sữa công thức. <b>Bú mẹ trực tiếp:</b> {milkGuide.breastfeedingCadence}, không quy đổi chính xác thành ml. {milkGuide.note} Nguồn {milkGuide.source}.</p>
      </div>}
    </header>
    <div className="page-pad home-body">
      <section>
        <div className="section-title"><div><small>NHỊP ĐIỆU CỦA BÉ</small><h2>Tổng quan hôm nay</h2></div><span className="live-pill">Hôm nay</span></div>
        <div className="stats-grid">
          <Stat icon="🍼" tone="pink" label="Bú" value={`${stats?.feeding.count ?? 0} lần`} sub={`${stats?.feeding.total_ml ?? 0} ml`} onClick={() => start('feeding')} />
          <Stat icon={<MoonStar />} tone="blue" label="Ngủ" value={formatDuration(stats?.sleep.minutes ?? 0)} sub={`${stats?.sleep.count ?? 0} giấc`} onClick={() => start('sleep')} />
          <Stat icon={<Droplets />} tone="mint" label="Tã" value={`${stats?.diaper.wet ?? 0} ướt`} sub={`${stats?.diaper.dirty ?? 0} bẩn`} onClick={() => navigate('/add/diaper')} />
          <Stat icon={<Scale />} tone="yellow" label="Cân nặng" value={stats?.weight.current ? `${stats.weight.current} kg` : 'Chưa có'} sub={stats?.weight.change ? `${stats.weight.change > 0 ? '+' : ''}${stats.weight.change} kg` : 'Ghi lần đầu'} onClick={() => navigate('/health')} />
        </div>
      </section>
      <button className="ai-banner" onClick={() => navigate('/ai')}>
        <div className="robot-orb"><Bot /></div><div><small>TRỢ LÝ RIÊNG CỦA MẸ</small><strong>AI hỏi nhanh 24/7</strong><span>Hỏi về giấc ngủ, dinh dưỡng và chăm sóc bé...</span></div><ChevronRight />
      </button>
      <section>
        <div className="section-title"><h2>Dòng thời gian</h2><button onClick={() => navigate('/journal')}>Xem tất cả</button></div>
        <div className="card timeline-card">{activities.length ? activities.slice(0, 5).map((activity) => <ActivityCard key={activity.id} activity={activity} onStop={stop} onComplete={(item) => navigate(`/add/${item.type}?activity=${item.id}`)} />) : <p className="soft-copy">Chưa có hoạt động hôm nay. Chạm một thẻ phía trên để bắt đầu.</p>}</div>
      </section>
      <section className="card wellbeing-card">
        <div className="wellbeing-icon">💗</div><div><small>BÉ HÔM NAY THẾ NÀO?</small><p>Hôm nay bé bú <b>{stats?.feeding.count ?? 0} lần</b>, ngủ <b>{formatDuration(stats?.sleep.minutes ?? 0)}</b> và có <b>{(stats?.diaper.wet ?? 0) + (stats?.diaper.dirty ?? 0)} lượt tã</b>. Chưa ghi nhận dấu hiệu bất thường.</p></div>
      </section>
      <section>
        <div className="section-title"><h2>Lịch & nhắc nhở</h2><button onClick={() => navigate('/reminders')}>Mở lịch</button></div>
        <div className="reminder-strip">{reminders.filter((item) => !item.is_done).slice(0, 3).map((item) => <article key={item.id}><CalendarDays /><div><strong>{item.title}</strong><span>{new Date(item.reminder_time.replace(' ', 'T')).toLocaleString('vi-VN')}</span></div></article>)}
          {!reminders.length && <p className="soft-copy">Chưa có lịch nhắc sắp tới.</p>}
        </div>
      </section>
    </div>
  </>
}

function Stat({ icon, tone, label, value, sub, onClick }: { icon: React.ReactNode; tone: string; label: string; value: string; sub: string; onClick: () => void }) {
  return <button className={`stat-card ${tone}`} onClick={onClick}><span className="stat-icon">{icon}</span><span className="stat-copy"><small>{label}</small><strong>{value}</strong><span>{sub}</span></span></button>
}
