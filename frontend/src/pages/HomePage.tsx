import { Bell, Bot, CalendarDays, ChevronRight, Droplets, Info, Milk, MoonStar, Scale } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { Loading } from '../components/Loading'
import { api } from '../services/api'
import type { Activity, Baby, Reminder, TodayStats } from '../types'
import { calculateAge, feedingGuidance, formatDuration } from '../utils/baby'

export function HomePage() {
  const navigate = useNavigate()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      api.get<Baby>('/api/baby/get.php'),
      api.get<TodayStats>('/api/stats/today.php'),
      api.get<Activity[]>(`/api/activities/list.php?date=${today}&type=all`),
      api.get<Reminder[]>('/api/reminders/list.php'),
    ]).then(([babyData, statsData, activityData, reminderData]) => {
      setBaby(babyData); setStats(statsData); setActivities(activityData); setReminders(reminderData)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-pad"><Loading cards={5} /></div>
  const milkGuide = baby ? feedingGuidance(baby.birth_date) : null
  return <>
    <header className="home-hero">
      <div className="home-top"><div className="baby-avatar">{baby?.avatar_url ? <img src={baby.avatar_url} /> : '🍣'}</div><div><small>Chào buổi sáng</small><h1>{baby?.name ?? 'Bé Sushi'}</h1><p>{baby ? calculateAge(baby.birth_date) : ''}</p></div><button className="icon-button glass"><Bell /></button></div>
      {milkGuide && <div className="feeding-guide">
        <div className="feeding-guide-icon"><Milk /></div>
        <div><small>GỢI Ý SỮA CÔNG THỨC THEO TUỔI</small><strong>{milkGuide.amount}</strong><span>{milkGuide.cadence} · Nguồn {milkGuide.source}</span></div>
        <a className="feeding-source" href="https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/how-much-and-how-often.html" target="_blank" rel="noreferrer" aria-label="Xem nguồn hướng dẫn của CDC"><Info /></a>
        <p>{milkGuide.note} Ưu tiên tín hiệu đói/no và hướng dẫn của bác sĩ.</p>
      </div>}
    </header>
    <div className="page-pad home-body">
      <section>
        <div className="section-title"><div><small>NHỊP ĐIỆU CỦA BÉ</small><h2>Tổng quan hôm nay</h2></div><span className="live-pill">Hôm nay</span></div>
        <div className="stats-grid">
          <Stat icon="🍼" tone="pink" label="Bú" value={`${stats?.feeding.count ?? 0} lần`} sub={`${stats?.feeding.total_ml ?? 0} ml`} />
          <Stat icon={<MoonStar />} tone="blue" label="Ngủ" value={formatDuration(stats?.sleep.minutes ?? 0)} sub={`${stats?.sleep.count ?? 0} giấc`} />
          <Stat icon={<Droplets />} tone="mint" label="Tã" value={`${stats?.diaper.wet ?? 0} ướt`} sub={`${stats?.diaper.dirty ?? 0} bẩn`} />
          <Stat icon={<Scale />} tone="yellow" label="Cân nặng" value={stats?.weight.current ? `${stats.weight.current} kg` : 'Chưa có'} sub={stats?.weight.change ? `${stats.weight.change > 0 ? '+' : ''}${stats.weight.change} kg` : 'Ghi lần đầu'} />
        </div>
      </section>
      <button className="ai-banner" onClick={() => navigate('/ai')}>
        <div className="robot-orb"><Bot /></div><div><small>TRỢ LÝ RIÊNG CỦA MẸ</small><strong>AI hỏi nhanh 24/7</strong><span>Hỏi về giấc ngủ, dinh dưỡng và chăm sóc bé...</span></div><ChevronRight />
      </button>
      <section>
        <div className="section-title"><h2>Dòng thời gian</h2><button onClick={() => navigate('/journal')}>Xem tất cả</button></div>
        <div className="card timeline-card">{activities.length ? activities.slice(0, 5).map((activity) => <ActivityCard key={activity.id} activity={activity} />) : <p className="soft-copy">Chưa có hoạt động hôm nay. Chạm dấu + để ghi hoạt động đầu tiên.</p>}</div>
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

function Stat({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: string; label: string; value: string; sub: string }) {
  return <article className={`stat-card ${tone}`}><span className="stat-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div></article>
}
