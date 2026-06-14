import { useEffect, useState } from 'react'

export const quickAiExamples = [
  '7h bé ngủ, 9h30 dậy',
  '10h thay tã ướt nhiều',
  'hút sữa 30 phút được 50ml lúc 20h00',
  'bé bú sữa mẹ lúc 6h tối đến 6h30 tối',
  'bé bú bình 90ml lúc 8h30',
  'bé ọc sữa nhẹ sau bú lúc 11h',
  'bé sốt 37.8 độ lúc 21h',
]

export function AnimatedPlaceholder({ hidden }: { hidden: boolean }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % quickAiExamples.length), 2800)
    return () => window.clearInterval(timer)
  }, [])
  if (hidden) return null
  return <span key={index} className="animated-placeholder" aria-hidden="true">{quickAiExamples[index]}</span>
}
