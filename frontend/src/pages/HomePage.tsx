import {
  Baby as BabyIcon,
  Bell,
  Bot,
  CalendarDays,
  ChevronRight,
  Clock3,
  Droplets,
  Info,
  Milk,
  MoonStar,
  Scale,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { Loading } from '../components/Loading'
import { QuickAiInputCard } from '../components/QuickAiInputCard'
import { api } from '../services/api'
import type { Activity, Baby, FeedingPrediction, Reminder, TodayStats } from '../types'
import { calculateAge, feedingGuidance, formatDuration } from '../utils/baby'
import { useToast } from '../context/ToastContext'
import { formatVietnameseDateTime, vietnamDate } from '../utils/dateTime'

type WeeklyStat = {
  day: string
  feeding_count: number | string
  feeding_ml: number | string
  sleep_minutes: number | string
  diaper_count: number | string
}

type PredictionResponse = {
  prediction: FeedingPrediction | null
  reminder_enabled: boolean
  minutes_before: number
}

const dayLabel = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T')
}

const timeLabel = (value?: string) => value
  ? new Date(value.replace(' ', 'T')).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  : '--:--'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [weekly, setWeekly] = useState<WeeklyStat[]>([])
  const [prediction, setPrediction] = useState<FeedingPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(vietnamDate)

  const load = () => Promise.all([
    api.get<Baby>('/api/baby/get.php'),
    api.get<TodayStats>(`/api/stats/today.php?date=${today}`),
    api.get<Activity[]>(`/api/activities/list.php?date=${today}&type=all`),
    api.get<Reminder[]>('/api/reminders/list.php'),
    api.get<WeeklyStat[]>('/api/stats/weekly.php').catch(() => []),
    api.get<PredictionResponse>('/api/feeding/prediction.php').catch(() => null),
  ]).then(([babyData, statsData, activityData, reminderData, weeklyData, predictionData]) => {
    setBaby(babyData)
    setStats(statsData)
    setActivities(activityData)
    setReminders(reminderData)
    setWeekly(weeklyData)
    setPrediction(predictionData?.prediction ?? null)
  }).finally(() => setLoading(false))

  useEffect(() => {
    const refreshDate = () => setToday(vietnamDate())
    const timer = window.setInterval(refreshDate, 60_000)
    document.addEventListener('visibilitychange', refreshDate)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshDate)
    }
  }, [])
  useEffect(() => { void load() }, [location.key, today])

  const start = async (type: 'feeding' | 'sleep') => {
    const result = await api.post<{ id: number; already_running: boolean }>('/api/activities/start.php', { type })
    toast(result.already_running ? 'Hoạt động này đang được theo dõi' : type === 'feeding' ? 'Đã bắt đầu cữ bú' : 'Đã bắt đầu giấc ngủ')
    await load()
  }
  const stop = async (activity: Activity) => {
    await api.post('/api/activities/stop.php', { id: activity.id })
    navigate(`/add/${activity.type}?activity=${activity.id}`)
  }

  const weeklySummary = useMemo(() => {
    const rows = weekly.map((item) => ({
      ...item,
      feeding_count: Number(item.feeding_count),
      feeding_ml: Number(item.feeding_ml),
      sleep_minutes: Number(item.sleep_minutes),
      diaper_count: Number(item.diaper_count),
    }))
    const totalFeeds = rows.reduce((sum, item) => sum + item.feeding_count, 0)
    const totalMilk = rows.reduce((sum, item) => sum + item.feeding_ml, 0)
    const longestSleep = rows.reduce((max, item) => Math.max(max, item.sleep_minutes), 0)
    return {
      rows,
      averageMilk: totalFeeds ? Math.round(totalMilk / totalFeeds) : 0,
      longestSleep,
    }
  }, [weekly])

  if (loading) return <div className="page-pad"><Loading cards={5} /></div>
  const currentWeight = stats?.weight.current ?? baby?.birth_weight
  const milkGuide = baby ? feedingGuidance(baby.birth_date, new Date(), currentWeight ?? undefined) : null
  const upcoming = reminders.filter((item) => Number(item.is_done) === 0).slice(0, 2)

  return <div className="home-v4">
    <header className="home-v4-hero">
      <i className="home-v4-glow glow-one" />
      <i className="home-v4-glow glow-two" />
      <div className="home-v4-profile">
        <button className="home-v4-avatar" onClick={() => navigate('/baby')} aria-label="Mở hồ sơ bé">
          {baby?.avatar_url ? <img src={baby.avatar_url} alt={baby.name} /> : <span>🍣</span>}
        </button>
        <div><h1>{baby?.name ?? 'Bé Sushi'} <span>♥</span></h1><p>{baby ? calculateAge(baby.birth_date) : ''}</p></div>
        <button className="home-v4-bell" onClick={() => navigate('/reminders')} aria-label="Mở nhắc nhở"><Bell />{upcoming.length > 0 && <i />}</button>
      </div>

      <section className="home-v4-summary">
        <div className="home-v4-section-heading"><h2>Tổng quan hôm nay</h2><span>Hôm nay</span></div>
        <div className="home-v4-stats">
          <Stat icon={<Milk />} tone="pink" label="Bú" value={`${stats?.feeding.count ?? 0} lần`} sub={`${stats?.feeding.total_ml ?? 0} ml`} onClick={() => start('feeding')} />
          <Stat icon={<MoonStar />} tone="blue" label="Ngủ" value={`${stats?.sleep.count ?? 0} giấc`} sub={formatDuration(stats?.sleep.minutes ?? 0)} onClick={() => start('sleep')} />
          <Stat icon={<Droplets />} tone="mint" label="Tã" value={`${(stats?.diaper.wet ?? 0) + (stats?.diaper.dirty ?? 0)} lượt`} sub={`${stats?.diaper.wet ?? 0} ướt · ${stats?.diaper.dirty ?? 0} bẩn`} onClick={() => navigate('/add/diaper')} />
          <Stat icon={<Scale />} tone="orange" label="Cân nặng" value={stats?.weight.current ? `${stats.weight.current} kg` : 'Chưa có'} sub={stats?.weight.change ? `${stats.weight.change > 0 ? '+' : ''}${stats.weight.change} kg` : 'Ghi lần đầu'} onClick={() => navigate('/health')} />
        </div>
      </section>
    </header>

    <main className="home-v4-body">
      <section className="home-v4-feature-grid">
        <button className="home-v4-feature feed-feature" onClick={() => start('feeding')}>
          <div className="home-v4-feature-title"><span>Gợi ý cữ bú tiếp theo</span><ChevronRight /></div>
          <div className="home-v4-feed-main">
            <span className="home-v4-bottle"><Milk /></span>
            <div><small>Theo cân nặng hiện tại</small><strong>{milkGuide?.bottleAmount.replace('khoảng ', '') ?? '-- ml/cữ'}</strong>
              <span className="home-v4-next-feed"><Clock3 /> Cữ tiếp theo khoảng <b>{timeLabel(prediction?.predicted_time)}</b></span>
            </div>
          </div>
          <span className="home-v4-source">Công thức theo cân nặng · BV Từ Dũ <Info /></span>
        </button>
        <button className="home-v4-feature ai-feature" onClick={() => navigate('/ai')}>
          <div className="home-v4-feature-title"><span>Sushi AI</span><Sparkles /></div>
          <div className="home-v4-ai-orb"><Bot /></div>
          <p>Hỏi nhanh về bú, ngủ, tã và sức khỏe của bé.</p>
          <span className="home-v4-ai-button">Chat ngay <ChevronRight /></span>
        </button>
      </section>

      <section className="home-v4-section">
        <div className="home-v4-section-heading"><h2>Dòng thời gian hôm nay</h2><button onClick={() => navigate('/journal')}>Xem tất cả</button></div>
        <div className="home-v4-timeline card timeline-card">
          {activities.length ? activities.slice(0, 5).map((activity) =>
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={(item) => navigate(`/add/${item.type}?activity=${item.id}&adjustStart=1`)}
              onStop={stop}
              onComplete={(item) => navigate(`/add/${item.type}?activity=${item.id}`)}
            />
          ) : <p className="soft-copy">Chưa có hoạt động hôm nay. Chạm một thẻ phía trên để bắt đầu.</p>}
        </div>
      </section>

      <section className="home-v4-section home-v4-weekly">
        <div className="home-v4-section-heading"><h2>Nhịp bé tuần này</h2><button onClick={() => navigate('/journal')}>Xem chi tiết</button></div>
        <div className="home-v4-chart-grid">
          <MiniLineCard title="Cữ bú trung bình" value={`${weeklySummary.averageMilk} ml`} rows={weeklySummary.rows} valueKey="feeding_ml" color="#ff5f8f" />
          <MiniBarCard title="Giấc ngủ dài nhất" value={formatDuration(weeklySummary.longestSleep)} rows={weeklySummary.rows} />
          <RhythmCard rows={weeklySummary.rows} />
        </div>
      </section>

      {baby && <QuickAiInputCard babyId={baby.id} onSaved={load} />}

      <section className="home-v4-section home-v4-reminders">
        <div className="home-v4-section-heading"><h2>Lịch & nhắc nhở</h2><button onClick={() => navigate('/reminders')}>Xem tất cả</button></div>
        <div className="home-v4-reminder-list">
          {upcoming.map((item) => <button key={item.id} onClick={() => navigate('/reminders')}><CalendarDays /><span><strong>{item.title}</strong><small>{formatVietnameseDateTime(item.reminder_time)}</small></span><ChevronRight /></button>)}
          {!upcoming.length && <p className="soft-copy">Chưa có lịch nhắc sắp tới.</p>}
        </div>
      </section>
    </main>
  </div>
}

function Stat({ icon, tone, label, value, sub, onClick }: { icon: React.ReactNode; tone: string; label: string; value: string; sub: string; onClick: () => void }) {
  return <button className={`home-v4-stat ${tone}`} onClick={onClick}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{sub}</em></div></button>
}

function MiniLineCard({ title, value, rows, valueKey, color }: { title: string; value: string; rows: Array<WeeklyStat & Record<string, number | string>>; valueKey: 'feeding_ml'; color: string }) {
  const values = rows.map((item) => Number(item[valueKey]))
  const max = Math.max(...values, 1)
  const points = values.map((item, index) => `${8 + index * (84 / Math.max(values.length - 1, 1))},${39 - (item / max) * 27}`).join(' ')
  return <article className="home-v4-chart-card"><small>{title}</small><strong>{value}</strong><svg viewBox="0 0 100 48" role="img" aria-label={`${title}: ${value}`}><polyline points={points || '8,38 92,38'} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />{values.map((item, index) => <circle key={index} cx={8 + index * (84 / Math.max(values.length - 1, 1))} cy={39 - (item / max) * 27} r="2.2" fill={color} />)}</svg><div className="home-v4-chart-labels">{rows.map((item) => <span key={item.day}>{dayLabel(item.day)}</span>)}</div></article>
}

function MiniBarCard({ title, value, rows }: { title: string; value: string; rows: Array<WeeklyStat & Record<string, number | string>> }) {
  const max = Math.max(...rows.map((item) => Number(item.sleep_minutes)), 1)
  return <article className="home-v4-chart-card"><small>{title}</small><strong className="blue-value">{value}</strong><div className="home-v4-bars">{rows.map((item, index) => <span key={item.day} style={{ '--bar': `${Math.max(12, Number(item.sleep_minutes) / max * 100)}%` } as React.CSSProperties}><i className={index === rows.length - 1 ? 'active' : ''} /></span>)}</div><div className="home-v4-chart-labels">{rows.map((item) => <span key={item.day}>{dayLabel(item.day)}</span>)}</div></article>
}

function RhythmCard({ rows }: { rows: Array<WeeklyStat & Record<string, number | string>> }) {
  const feeds = rows.map((item) => Number(item.feeding_count))
  const max = Math.max(...feeds, 1)
  const points = feeds.map((item, index) => `${8 + index * (84 / Math.max(feeds.length - 1, 1))},${39 - (item / max) * 25}`).join(' ')
  return <article className="home-v4-chart-card rhythm-card"><small>Nhịp bú 7 ngày</small><strong>{feeds.reduce((a, b) => a + b, 0)} cữ</strong><svg viewBox="0 0 100 48" role="img" aria-label="Nhịp bú trong bảy ngày"><path d="M8 39 C20 8, 30 42, 43 22 S68 10, 92 31" fill="none" stroke="#ffc2d3" strokeWidth="2" strokeDasharray="4 3" /><polyline points={points || '8,38 92,38'} fill="none" stroke="#ff5f8f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="home-v4-chart-labels">{rows.map((item) => <span key={item.day}>{dayLabel(item.day)}</span>)}</div></article>
}
