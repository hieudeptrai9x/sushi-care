import { Baby, HeartPulse, MoonStar, Pencil, Square, StickyNote, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Activity } from '../types'
import { activityStatus, feedingLabel, pumpSummary } from '../utils/activity'
import { formatDuration } from '../utils/baby'

const labels: Record<string, string> = { feeding: 'Bú', sleep: 'Ngủ', diaper: 'Tã', health: 'Sức khỏe', note: 'Ghi chú' }
const icons = { feeding: Baby, sleep: MoonStar, diaper: HeartPulse, health: HeartPulse, note: StickyNote }

function detail(activity: Activity) {
  if (activity.subtype === 'pump') return pumpSummary(activity)
  if (activity.type === 'feeding') return activity.amount_ml ? `${feedingLabel(activity.subtype)} · ${activity.amount_ml} ml` : `${feedingLabel(activity.subtype)} · ${formatDuration(activity.duration_minutes)}`
  if (activity.type === 'sleep') return formatDuration(activity.duration_minutes)
  if (activity.type === 'diaper') return ({ wet: 'Tã ướt', dirty: 'Tã bẩn', mixed: 'Tã lẫn' } as Record<string, string>)[activity.subtype ?? ''] ?? 'Đã thay tã'
  if (activity.subtype === 'weight') return `${activity.weight_kg} kg`
  if (activity.subtype === 'temperature') return `${activity.temperature} °C`
  return activity.note || 'Đã ghi nhận'
}

export function ActivityCard({ activity, onDelete, onStop, onComplete }: {
  activity: Activity
  onDelete?: (id: number) => void
  onStop?: (activity: Activity) => void
  onComplete?: (activity: Activity) => void
}) {
  const Icon = icons[activity.type]
  const date = new Date(activity.start_time.replace(' ', 'T'))
  const status = activityStatus(activity)
  const [, tick] = useState(0)
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setInterval(() => tick((value) => value + 1), 30_000)
    return () => window.clearInterval(timer)
  }, [status])
  const liveMinutes = status === 'running' ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000)) : activity.duration_minutes
  return <article className={`timeline-item ${activity.type} ${status !== 'completed' ? `activity-${status}` : ''}`}>
    <time>{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
    <div className={`timeline-icon ${status === 'running' ? 'is-spinning' : ''}`}><Icon /></div>
    <div className="timeline-copy"><strong>{labels[activity.type]}{status === 'running' ? ' · Đang chạy' : status === 'paused' ? ' · Chờ hoàn tất' : ''}</strong><span>{status !== 'completed' ? formatDuration(liveMinutes) : detail(activity)}</span>{activity.note && activity.type !== 'note' && <small>{activity.note}</small>}</div>
    {status === 'running' && onStop ? <button className="activity-control stop" onClick={() => onStop(activity)} aria-label="Dừng"><Square /></button>
      : status === 'paused' && onComplete ? <button className="activity-control" onClick={() => onComplete(activity)} aria-label="Hoàn tất"><Pencil /></button>
        : onDelete && <button className="subtle-button danger-text" onClick={() => onDelete(activity.id)} aria-label="Xóa"><Trash2 /></button>}
  </article>
}
