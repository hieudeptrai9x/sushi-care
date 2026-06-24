import { api } from './api'
import { vietnamDate } from '../utils/dateTime'

export type QuickActivity = {
  type: 'feeding' | 'sleep' | 'diaper' | 'health' | 'pumping' | 'note'
  subtype?: string | null
  start_time: string
  end_time?: string | null
  duration_minutes?: number
  amount_ml?: number | null
  side?: string | null
  wet_level?: string | null
  poop_color?: string | null
  poop_texture?: string | null
  temperature?: number | null
  weight_kg?: number | null
  meta_json?: Record<string, unknown>
  note?: string
}

export type QuickParseResult = {
  success: boolean
  confidence?: number
  needs_confirmation?: boolean
  needs_clarification?: boolean
  activity?: QuickActivity
  human_summary?: string
  warning?: string | null
  question?: string
  suggestions?: string[]
}

export const quickAiService = {
  parseQuickInput: (text: string, babyId: number) => api.post<QuickParseResult>('/api/ai/quick_parse.php', {
    baby_id: babyId,
    text,
    timezone: 'Asia/Ho_Chi_Minh',
    today: vietnamDate(),
  }),
  createActivityFromAi: (activity: QuickActivity, originalText: string, babyId: number) => api.post<{ id: number; prediction?: import('../types').FeedingPrediction }>('/api/activities/create_from_ai.php', {
    baby_id: babyId,
    activity,
    original_text: originalText,
  }),
}
