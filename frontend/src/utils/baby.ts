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
