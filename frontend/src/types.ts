export type User = {
  id: number
  name: string
  email: string
  role: 'admin' | 'caregiver'
  must_change_password: number
  csrf_token: string
}

export type Baby = {
  id: number
  name: string
  nickname?: string
  birth_date: string
  gender: string
  avatar_url?: string
  birth_weight?: number
  birth_length?: number
  note?: string
}

export type Activity = {
  id: number
  type: 'feeding' | 'sleep' | 'diaper' | 'health' | 'note'
  subtype?: string
  start_time: string
  end_time?: string
  duration_minutes: number
  amount_ml?: number
  side?: string
  wet_level?: string
  poop_color?: string
  poop_texture?: string
  temperature?: number
  weight_kg?: number
  meta_json?: string | Record<string, unknown>
  note?: string
}

export type TodayStats = {
  feeding: { count: number; total_ml: number; minutes: number }
  sleep: { count: number; minutes: number }
  diaper: { wet: number; dirty: number }
  weight: { current: number | null; change: number | null }
}

export type Reminder = {
  id: number
  title: string
  reminder_type: string
  reminder_time: string
  repeat_rule: string
  note?: string
  is_done: number
}
