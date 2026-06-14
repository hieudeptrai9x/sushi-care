import { Baby, HeartPulse, MoonStar, StickyNote, Trash2 } from 'lucide-react'
import type { Activity } from '../types'
import { formatDuration } from '../utils/baby'

const labels: Record<string, string> = { feeding: 'Bú', sleep: 'Ngủ', diaper: 'Tã', health: 'Sức khỏe', note: 'Ghi chú' }
const icons = { feeding: Baby, sleep: MoonStar, diaper: HeartPulse, health: HeartPulse, note: StickyNote }

function detail(activity: Activity) {
  if (activity.type === 'feeding') return activity.amount_ml ? `${activity.amount_ml} ml` : formatDuration(activity.duration_minutes)
  if (activity.type === 'sleep') return formatDuration(activity.duration_minutes)
  if (activity.type === 'diaper') return ({ wet: 'Tã ướt', dirty: 'Tã bẩn', mixed: 'Tã lẫn' } as Record<string, string>)[activity.subtype ?? ''] ?? 'Đã thay tã'
  if (activity.subtype === 'weight') return `${activity.weight_kg} kg`
  if (activity.subtype === 'temperature') return `${activity.temperature} °C`
  return activity.note || 'Đã ghi nhận'
}

export function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete?: (id: number) => void }) {
  const Icon = icons[activity.type]
  const date = new Date(activity.start_time.replace(' ', 'T'))
  return <article className={`timeline-item ${activity.type}`}>
    <time>{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
    <div className="timeline-icon"><Icon /></div>
    <div className="timeline-copy"><strong>{labels[activity.type]}</strong><span>{detail(activity)}</span>{activity.note && activity.type !== 'note' && <small>{activity.note}</small>}</div>
    {onDelete && <button className="subtle-button danger-text" onClick={() => onDelete(activity.id)} aria-label="Xóa"><Trash2 /></button>}
  </article>
}
