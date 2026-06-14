import { describe, expect, it } from 'vitest'
import { activityStatus, feedingLabel, pumpSummary, runningLabel } from './activity'
import type { Activity } from '../types'

const activity = (meta_json?: string): Activity => ({
  id: 1,
  type: 'feeding',
  subtype: 'breast_direct',
  start_time: '2026-06-14 08:00:00',
  duration_minutes: 0,
  meta_json,
})

describe('activityStatus', () => {
  it('recognizes running and paused activities from meta JSON', () => {
    expect(activityStatus(activity('{"status":"running"}'))).toBe('running')
    expect(activityStatus(activity('{"status":"paused"}'))).toBe('paused')
  })

  it('treats invalid or missing metadata as completed', () => {
    expect(activityStatus(activity())).toBe('completed')
    expect(activityStatus(activity('{oops'))).toBe('completed')
  })
})

describe('feedingLabel', () => {
  it('distinguishes direct breastfeeding and expressed breast milk', () => {
    expect(feedingLabel('breast_direct')).toBe('Bú mẹ trực tiếp')
    expect(feedingLabel('breast_bottle')).toBe('Sữa mẹ vắt ra')
    expect(feedingLabel('formula')).toBe('Sữa công thức')
  })
})

describe('pumpSummary', () => {
  it('shows duration and milk from each side', () => {
    expect(pumpSummary({
      id: 2,
      type: 'feeding',
      subtype: 'pump',
      start_time: '2026-06-14 09:00:00',
      duration_minutes: 18,
      amount_ml: 75,
      meta_json: '{"left_ml":40,"right_ml":35}',
    })).toBe('18 phút · Trái 40 ml · Phải 35 ml · Tổng 75 ml')
  })
})

describe('runningLabel', () => {
  it('uses the actual care action instead of a generic running label', () => {
    expect(runningLabel(activity())).toBe('Đang bú')
    expect(runningLabel({ ...activity(), subtype: 'pump' })).toBe('Đang hút sữa')
    expect(runningLabel({ ...activity(), type: 'sleep' })).toBe('Đang ngủ')
  })
})
