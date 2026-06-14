import { combineLocalInput, splitLocalInput } from '../utils/baby'

export function DateTimeInput({ value, onChange, required = false }: {
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const { date, time } = splitLocalInput(value)
  return <div className="date-time-grid">
    <input aria-label="Ngày" type="date" value={date} required={required} onChange={(event) => onChange(combineLocalInput(event.target.value, time))} />
    <input aria-label="Giờ" type="time" value={time} required={required} onChange={(event) => onChange(combineLocalInput(date, event.target.value))} />
  </div>
}
