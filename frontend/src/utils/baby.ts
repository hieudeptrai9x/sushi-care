const DAY = 86_400_000

export function calculateAge(birthDate: string, now = new Date()): string {
  const birth = new Date(`${birthDate}T00:00:00`)
  const days = Math.max(0, Math.floor((startOfDay(now).getTime() - birth.getTime()) / DAY))
  if (days < 30) return `${days} ngày tuổi · ${Math.floor(days / 7)}w${days % 7}d`

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
  const rule = milkByAge(days)
  return {
    bottleAmount: rule.amount,
    dailyAmount: rule.daily,
    bottleCadence: rule.cadence,
    breastfeedingCadence,
    note: weightKg && weightKg > 0
      ? `Ưu tiên theo tuổi; cân nặng ${weightKg} kg chỉ để tham khảo thêm. Theo tín hiệu đói/no, tã ướt và tăng cân, không ép bé bú hết.`
      : 'Ưu tiên theo tuổi vì cân nặng tại nhà có thể không chính xác. Theo tín hiệu đói/no, tã ướt và tăng cân, không ép bé bú hết.',
    source: 'Vinmec · Medlatec · Pharmacity · Long Châu',
  }
}

function milkByAge(days: number): { amount: string; daily: string; cadence: string } {
  if (days <= 0) return { amount: 'khoảng 5–7 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'ngày đầu sau sinh' }
  if (days === 1) return { amount: 'khoảng 14 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'ngày thứ 2' }
  if (days === 2) return { amount: 'khoảng 22–27 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'ngày thứ 3' }
  if (days >= 3 && days <= 5) return { amount: 'khoảng 30 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'ngày 4–6' }
  if (days === 6) return { amount: 'khoảng 35 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'ngày thứ 7' }
  if (days >= 7 && days < 14) return { amount: 'khoảng 45–60 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'mỗi 2–3 giờ hoặc theo nhu cầu' }
  if (days >= 14 && days < 30) return { amount: 'khoảng 60–90 ml/cữ', daily: '8–12 cữ/24 giờ', cadence: 'mỗi 2–3 giờ hoặc theo nhu cầu' }
  if (days < 60) return { amount: 'khoảng 60–120 ml/cữ', daily: '6–10 cữ/24 giờ', cadence: 'mỗi 2–3 giờ hoặc theo nhu cầu' }
  if (days < 90) return { amount: 'khoảng 90–120 ml/cữ', daily: '6–10 cữ/24 giờ', cadence: 'mỗi 2–3 giờ hoặc theo nhu cầu' }
  if (days < 180) return { amount: 'khoảng 90–150 ml/cữ', daily: '5–9 cữ/24 giờ', cadence: 'mỗi 3 giờ hoặc theo nhu cầu' }
  return { amount: 'khoảng 120–180 ml/cữ', daily: 'theo nhu cầu và ăn dặm', cadence: 'mỗi 3–4 giờ hoặc theo nhu cầu' }
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
