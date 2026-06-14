import type { Activity } from '../types'

export type ActivityStatus = 'running' | 'paused' | 'completed'

export function activityStatus(activity: Activity): ActivityStatus {
  if (!activity.meta_json) return 'completed'
  try {
    const meta = typeof activity.meta_json === 'string' ? JSON.parse(activity.meta_json) : activity.meta_json
    return meta?.status === 'running' || meta?.status === 'paused' ? meta.status : 'completed'
  } catch {
    return 'completed'
  }
}

export function feedingLabel(subtype?: string): string {
  return ({
    breast: 'Bú mẹ trực tiếp',
    breast_direct: 'Bú mẹ trực tiếp',
    breast_bottle: 'Sữa mẹ vắt ra',
    formula: 'Sữa công thức',
    pump: 'Hút sữa',
  } as Record<string, string>)[subtype ?? ''] ?? 'Bú'
}

export function runningLabel(activity: Activity): string {
  if (activity.subtype === 'pump') return 'Đang hút sữa'
  if (activity.type === 'feeding') return 'Đang bú'
  if (activity.type === 'sleep') return 'Đang ngủ'
  return 'Đang theo dõi'
}

export function activityMeta(activity: Activity): Record<string, unknown> {
  if (!activity.meta_json) return {}
  try {
    const meta = typeof activity.meta_json === 'string' ? JSON.parse(activity.meta_json) : activity.meta_json
    return meta && typeof meta === 'object' ? meta : {}
  } catch {
    return {}
  }
}

export function pumpSummary(activity: Activity): string {
  const meta = activityMeta(activity)
  const left = Number(meta.left_ml || 0)
  const right = Number(meta.right_ml || 0)
  return `${activity.duration_minutes} phút · Trái ${left} ml · Phải ${right} ml · Tổng ${activity.amount_ml || left + right} ml`
}
