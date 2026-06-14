const DAY = 86_400_000

export function calculateAge(birthDate: string, now = new Date()): string {
  const birth = new Date(`${birthDate}T00:00:00`)
  const days = Math.max(0, Math.floor((startOfDay(now).getTime() - birth.getTime()) / DAY))
  if (days < 30) return `${days} ngày tuổi · Tuần ${Math.floor(days / 7) + 1}`

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  let anchor = new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate())
  if (anchor > now) {
    months--
    anchor = new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate())
  }
  const remainingDays = Math.max(0, Math.floor((startOfDay(now).getTime() - startOfDay(anchor).getTime()) / DAY))
  return `${months} tháng${remainingDays ? ` ${remainingDays} ngày` : ''}`
}

export type FeedingGuidance = {
  amount: string
  cadence: string
  note: string
  source: string
}

export function feedingGuidance(birthDate: string, now = new Date()): FeedingGuidance {
  const birth = new Date(`${birthDate}T00:00:00`)
  const days = Math.max(0, Math.floor((startOfDay(now).getTime() - birth.getTime()) / DAY))

  if (days <= 7) {
    return {
      amount: '30–60 ml/cữ',
      cadence: 'mỗi 2–3 giờ',
      note: 'Mức tham khảo cho bé chỉ dùng sữa công thức trong những ngày đầu.',
      source: 'CDC',
    }
  }
  if (days < 21) {
    return {
      amount: 'Tăng dần theo nhu cầu',
      cadence: 'thường mỗi 3–4 giờ',
      note: 'Dạ dày bé đang lớn dần; hãy quan sát tín hiệu đói và no.',
      source: 'CDC',
    }
  }
  if (days < 45) {
    return {
      amount: '90–120 ml/cữ',
      cadence: 'thường mỗi 3–4 giờ',
      note: 'Mốc tham khảo khi gần cuối tháng đầu, không cần ép bé bú hết.',
      source: 'AAP',
    }
  }
  if (days < 165) {
    return {
      amount: 'Lượng tăng dần theo bé',
      cadence: 'thường mỗi 3–4 giờ',
      note: 'Theo dõi tăng trưởng, tã ướt và tín hiệu đói/no để điều chỉnh.',
      source: 'CDC · AAP',
    }
  }
  if (days < 210) {
    return {
      amount: '180–240 ml/cữ',
      cadence: 'khoảng 4–5 cữ/ngày',
      note: 'Mốc tham khảo quanh 6 tháng; nhu cầu từng bé có thể khác.',
      source: 'AAP',
    }
  }
  return {
    amount: 'Theo nhu cầu của bé',
    cadence: 'kết hợp lịch ăn dặm',
    note: 'Sữa mẹ hoặc sữa công thức vẫn quan trọng trong năm đầu đời.',
    source: 'CDC',
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function durationMinutes(start: string, end: string): number {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000))
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest} phút`
  return `${hours} giờ${rest ? ` ${rest} phút` : ''}`
}

export function toLocalInput(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function splitLocalInput(value: string): { date: string; time: string } {
  const [date = '', time = ''] = value.split('T')
  return { date, time: time.slice(0, 5) }
}

export function combineLocalInput(date: string, time: string): string {
  return date && time ? `${date}T${time}` : ''
}
