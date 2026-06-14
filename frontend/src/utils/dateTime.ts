export function formatVietnameseDateTime(value: string): string {
  return new Date(value.replace(' ', 'T')).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
