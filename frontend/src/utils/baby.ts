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
  dailyAmount: string
  bottleCadence: string
  breastfeedingCadence: string
  note: string
  source: string
}

export function feedingGuidance(birthDate: string, now = new Date(), weightKg?: number): FeedingGuidance {
  const birth = new Date(`${birthDate}T00:00:00`)
  const days = Math.max(0, Math.floor((startOfDay(now).getTime() - birth.getTime()) / DAY))
  const breastfeedingCadence = days < 45 ? '8–12 cữ/24 giờ' : 'theo nhu cầu của bé'
  if (weightKg && weightKg > 0) {
    const daily = Math.round(weightKg * 150)
    const lowPerFeed = Math.round(daily / 12)
    const highPerFeed = Math.round(daily / 8)
    return {
      bottleAmount: `khoảng ${lowPerFeed}–${highPerFeed} ml/cữ`,
      dailyAmount: `khoảng ${daily} ml/24 giờ`,
      bottleCadence: 'nếu chia 8–12 cữ/ngày',
      breastfeedingCadence,
      note: 'Ước tính theo cân nặng hiện tại; theo tín hiệu đói/no, tã ướt và tăng cân, không ép bé bú hết.',
      source: 'BV Từ Dũ · BV Nhi Đồng 1',
    }
  }
  return {
    bottleAmount: 'Cần cân nặng hiện tại',
    dailyAmount: 'Ghi cân nặng để tính theo 150 ml/kg/24 giờ',
    bottleCadence: 'theo nhu cầu của bé',
    breastfeedingCadence,
    note: 'Không dùng bảng tuổi cứng khi chưa có cân nặng để cá thể hóa.',
    source: 'BV Từ Dũ · BV Nhi Đồng 1',
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function durationMinutes(start: string, end: string): number {
  return Math.max(0, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 60_000))
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
