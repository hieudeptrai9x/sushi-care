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
  bottleAmount: string
  bottleCadence: string
  breastfeedingCadence: string
  note: string
  source: string
}

export function feedingGuidance(birthDate: string, now = new Date()): FeedingGuidance {
  const birth = new Date(`${birthDate}T00:00:00`)
  const days = Math.max(0, Math.floor((startOfDay(now).getTime() - birth.getTime()) / DAY))

  if (days <= 2) {
    return {
      bottleAmount: '30–60 ml/cữ',
      bottleCadence: 'theo tín hiệu đói, thường 8–12 cữ/ngày',
      breastfeedingCadence: '8–12 cữ/24 giờ',
      note: 'Lượng bú bình tham khảo trong 2–3 ngày đầu; không dùng ml để đánh giá một cữ bú mẹ trực tiếp.',
      source: 'AAP · CDC',
    }
  }
  if (days < 21) {
    return {
      bottleAmount: '60–90 ml/cữ',
      bottleCadence: 'thường mỗi 3–4 giờ',
      breastfeedingCadence: '8–12 cữ/24 giờ',
      note: 'Lượng bú bình là mốc tham khảo sau vài ngày đầu; bú mẹ trực tiếp đánh giá bằng dấu hiệu nuốt, tã và tăng cân.',
      source: 'AAP · CDC',
    }
  }
  if (days < 45) {
    return {
      bottleAmount: '90–120 ml/cữ',
      bottleCadence: 'thường mỗi 3–4 giờ',
      breastfeedingCadence: '8–12 cữ/24 giờ',
      note: 'Mốc bú bình tham khảo gần cuối tháng đầu; không cần ép bé bú hết.',
      source: 'AAP · CDC',
    }
  }
  if (days < 165) {
    return {
      bottleAmount: 'Tăng dần theo nhu cầu',
      bottleCadence: 'thường mỗi 3–4 giờ',
      breastfeedingCadence: 'theo nhu cầu của bé',
      note: 'Theo dõi tăng trưởng, tã ướt và tín hiệu đói/no để điều chỉnh.',
      source: 'AAP · CDC',
    }
  }
  if (days < 210) {
    return {
      bottleAmount: '180–240 ml/cữ',
      bottleCadence: 'khoảng 4–5 cữ/ngày',
      breastfeedingCadence: 'theo nhu cầu của bé',
      note: 'Mốc tham khảo quanh 6 tháng; nhu cầu từng bé có thể khác.',
      source: 'AAP · CDC',
    }
  }
  return {
    bottleAmount: 'Theo nhu cầu của bé',
    bottleCadence: 'kết hợp lịch ăn dặm',
    breastfeedingCadence: 'theo nhu cầu của bé',
    note: 'Sữa mẹ hoặc sữa công thức vẫn quan trọng trong năm đầu đời.',
    source: 'AAP · CDC',
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
