import { Bell, BookHeart, CalendarDays, Home, Image, Menu, Plus, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const quickActions = [
  ['Bú', 'feeding', '🍼'],
  ['Ngủ', 'sleep', '🌙'],
  ['Tã', 'diaper', '☁️'],
  ['Sức khỏe', 'health', '💗'],
  ['Khoảnh khắc', 'moments', '📷'],
  ['Ghi chú', 'note', '✍️'],
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const go = (route: string) => {
    setOpen(false)
    navigate(route === 'moments' ? '/moments' : route === 'health' ? '/health' : `/add/${route}`)
  }
  return (
    <div className="app-frame">
      <div className="desktop-backdrop" />
      <main className="app-content">{children}</main>
      <button className="fab" aria-label="Ghi nhanh" onClick={() => setOpen(true)}><Plus /></button>
      <nav className="bottom-nav">
        <NavLink to="/"><Home /><span>Trang chủ</span></NavLink>
        <NavLink to="/journal"><BookHeart /><span>Nhật ký</span></NavLink>
        <NavLink to="/moments"><Image /><span>Khoảnh khắc</span></NavLink>
        <NavLink to="/reminders"><CalendarDays /><span>Lịch</span></NavLink>
        <NavLink to="/settings"><Menu /><span>Thêm</span></NavLink>
      </nav>
      {open && <div className="sheet-backdrop" onClick={() => setOpen(false)}>
        <section className="bottom-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="sheet-title"><div><small>Ghi lại một chút nhé</small><h2>Hôm nay bé thế nào?</h2></div><button className="icon-button" onClick={() => setOpen(false)}><X /></button></div>
          <div className="quick-grid">{quickActions.map(([label, route, emoji]) =>
            <button key={route} onClick={() => go(route)}><span>{emoji}</span>{label}</button>
          )}</div>
        </section>
      </div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <header className="page-header"><div><small>{subtitle}</small><h1>{title}</h1></div>{action ?? <button className="icon-button"><Bell /></button>}</header>
}
