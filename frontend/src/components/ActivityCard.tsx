import { Baby, CircleStop, Clock3, HeartPulse, MoonStar, Pencil, StickyNote, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'
import type { Activity } from '../types'
import { activityStatus, feedingLabel, pumpSummary, runningLabel } from '../utils/activity'
import { formatDuration } from '../utils/baby'

const labels: Record<string, string> = { feeding: 'Bú', sleep: 'Ngủ', diaper: 'Tã', health: 'Sức khỏe', note: 'Ghi chú' }
const icons = { feeding: Baby, sleep: MoonStar, diaper: HeartPulse, health: HeartPulse, note: StickyNote }

function title(activity: Activity) {
  if (activity.subtype === 'pump') return 'Hút sữa'
  if (activity.type === 'feeding') return feedingLabel(activity.subtype)
  if (activity.type === 'diaper') return ({ wet: 'Tã ướt', dirty: 'Tã bẩn', mixed: 'Tã lẫn' } as Record<string, string>)[activity.subtype ?? ''] ?? 'Tã'
  return labels[activity.type]
}

function detail(activity: Activity) {
  if (activity.subtype === 'pump') return pumpSummary(activity)
  if (activity.type === 'feeding') return activity.amount_ml ? `${activity.amount_ml} ml` : formatDuration(activity.duration_minutes)
  if (activity.type === 'sleep') return formatDuration(activity.duration_minutes)
  if (activity.type === 'diaper') return `Ghi lúc ${timeText(new Date(activity.start_time.replace(' ', 'T')))}`
  if (activity.subtype === 'weight') return `${activity.weight_kg} kg`
  if (activity.subtype === 'temperature') return `${activity.temperature} °C`
  return activity.note || 'Đã ghi nhận'
}

function finishDate(activity: Activity): Date {
  return new Date((activity.end_time || activity.start_time).replace(' ', 'T'))
}

function timeText(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function agoText(date: Date): string {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 1) return '0p trước'
  if (minutes < 60) return `${minutes}p trước`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}h${rest ? `${rest}p` : ''} trước`
}

export function ActivityCard({ activity, onDelete, onEdit, onStop, onComplete, onOpen, variant = 'default' }: {
  activity: Activity
  onDelete?: (id: number) => void
  onEdit?: (activity: Activity) => void
  onStop?: (activity: Activity) => void
  onComplete?: (activity: Activity) => void
  onOpen?: (activity: Activity) => void
  variant?: 'default' | 'journal'
}) {
  const Icon = icons[activity.type]
  const date = new Date(activity.start_time.replace(' ', 'T'))
  const status = activityStatus(activity)
  const [, tick] = useState(0)
  const [actionsOpen, setActionsOpen] = useState(false)
  useEffect(() => {
    const timer = window.setInterval(() => tick((value) => value + 1), 30_000)
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') tick((value) => value + 1)
    }
    document.addEventListener('visibilitychange', refreshOnVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshOnVisible)
    }
  }, [])
  const liveMinutes = status === 'running' ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000)) : activity.duration_minutes
  const doneAt = finishDate(activity)
  const titleText = status === 'running' ? runningLabel(activity) : `${title(activity)}${status === 'paused' ? ' · Chờ hoàn tất' : ''}`
  const detailText = status !== 'completed' ? formatDuration(liveMinutes) : detail(activity)
  const isJournal = variant === 'journal'
  const open = () => onOpen?.(activity)
  const stopClick = (event: MouseEvent, action?: () => void) => {
    event.stopPropagation()
    action?.()
  }
  return <article className={`timeline-item ${activity.type} ${status !== 'completed' ? `activity-${status}` : ''}${isJournal ? ' journal-card-item' : status === 'completed' ? ' no-actions' : ''}`} onClick={open}>
    <time>{timeText(date)}</time>
    <div className={`timeline-icon ${status === 'running' ? 'is-spinning' : ''}`}><Icon /></div>
    <div className="timeline-copy"><strong>{titleText}</strong>{detailText && <span>{detailText}</span>}{activity.creator_name && <small>{isJournal ? <><UserRound />Ghi bởi {activity.creator_name}</> : `Ghi bởi ${activity.creator_name}`}</small>}{activity.note && activity.type !== 'note' && <small>{activity.note}</small>}</div>
    {status === 'running' && onStop ? <div className="activity-actions running-actions">{onEdit && <button className="activity-control edit" onClick={(event) => stopClick(event, () => onEdit(activity))} aria-label="Sửa giờ bắt đầu"><Pencil /><span>Sửa giờ bắt đầu</span></button>}<button className="activity-control stop" onClick={(event) => stopClick(event, () => onStop(activity))} aria-label="Kết thúc"><CircleStop /><span>Kết thúc</span></button></div>
      : status === 'paused' && onComplete ? <button className="activity-control" onClick={(event) => stopClick(event, () => onComplete(activity))} aria-label="Hoàn tất"><Pencil /></button>
        : <div className="timeline-side no-menu"><div className="timeline-meta"><b>Xong lúc {timeText(doneAt)}</b><span><Clock3 />{agoText(doneAt)}</span></div>{isJournal && (onEdit || onDelete) && <div className="journal-action-wrap"><button className="activity-control edit journal-edit-button" onClick={(event) => stopClick(event, () => setActionsOpen((value) => !value))} aria-label="Tùy chọn"><Pencil /></button>{actionsOpen && <div className="journal-action-popover"><button onClick={(event) => stopClick(event, () => onEdit?.(activity))}><Pencil />Sửa</button><button className="danger-text" onClick={(event) => stopClick(event, () => onDelete?.(activity.id))}><Trash2 />Xóa</button></div>}</div>}</div>}
  </article>
}
