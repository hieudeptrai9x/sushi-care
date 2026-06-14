import { Pencil, Sparkles, X } from 'lucide-react'
import type { QuickActivity } from '../services/quickAiService'
import { formatDuration } from '../utils/baby'

const typeLabels: Record<string, string> = {
  feeding: 'Bú',
  sleep: 'Ngủ',
  diaper: 'Tã',
  health: 'Sức khỏe',
  pumping: 'Hút sữa',
  note: 'Ghi chú',
}

const subtypeLabels: Record<string, string> = {
  breastfeeding: 'Bú mẹ',
  bottle: 'Sữa mẹ bú bình',
  formula: 'Sữa công thức',
  wet: 'Tã ướt',
  dirty: 'Tã bẩn',
  mixed: 'Tã lẫn',
  temperature: 'Nhiệt độ',
  spit_up: 'Ọc sữa',
  cough: 'Ho',
}

function clock(value?: string | null) {
  return value ? value.slice(11, 16) : 'Chưa có'
}

export function AiParseConfirmSheet({ activity, summary, warning, saving, onSave, onEdit, onCancel }: {
  activity: QuickActivity
  summary?: string
  warning?: string | null
  saving: boolean
  onSave: () => void
  onEdit: () => void
  onCancel: () => void
}) {
  return <div className="sheet-backdrop ai-sheet-backdrop" onClick={onCancel}>
    <section className="bottom-sheet ai-confirm-sheet" onClick={(event) => event.stopPropagation()}>
      <div className="sheet-handle" />
      <div className="ai-sheet-title"><div className="ai-sheet-icon"><Sparkles /></div><div><small>AI ĐÃ HIỂU</small><h2>Xác nhận nhật ký</h2></div><button className="icon-button" onClick={onCancel}><X /></button></div>
      <div className="ai-confirm-rows">
        <Row label="Loại" value={`${typeLabels[activity.type]}${activity.subtype ? ` · ${subtypeLabels[activity.subtype] ?? activity.subtype}` : ''}`} />
        <Row label="Bắt đầu" value={`${clock(activity.start_time)} hôm nay`} />
        {activity.end_time && <Row label="Kết thúc" value={`${clock(activity.end_time)} hôm nay`} />}
        {!!activity.duration_minutes && <Row label="Tổng thời gian" value={formatDuration(activity.duration_minutes)} />}
        {!!activity.amount_ml && <Row label="Lượng sữa" value={`${activity.amount_ml} ml`} />}
        {activity.temperature != null && <Row label="Nhiệt độ" value={`${activity.temperature} °C`} />}
        <Row label="Ghi chú" value={activity.note || 'Để trống'} />
      </div>
      {summary && <p className="ai-human-summary">{summary}</p>}
      {warning && <p className="ai-warning">{warning}</p>}
      <button className="primary-button" onClick={onSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu nhật ký'}</button>
      <button className="secondary-button" onClick={onEdit}><Pencil /> Chỉnh sửa</button>
      <button className="ai-cancel-button" onClick={onCancel}>Hủy</button>
    </section>
  </div>
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>
}
