import { Bell, BookHeart, CalendarDays, Home, Menu, Plus, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const quickActions = [
  ['Bú', 'feeding', '🍼'],
  ['Ngủ', 'sleep', '🌙'],
  ['Tã', 'diaper', '☁️'],
  ['Sức khỏe', 'health', '💗'],
  ['Ghi chú', 'note', '✍️'],
]

const focusRoutes = ['/health', '/baby', '/change-password', '/ai', '/ai-settings']

export function isFocusRoute(pathname: string) {
  return pathname.startsWith('/add/') || focusRoutes.includes(pathname)
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const focused = isFocusRoute(pathname)
  const go = (route: string) => {
    setOpen(false)
    navigate(route === 'health' ? '/health' : `/add/${route}`)
  }
  return (
    <div className="app-frame">
      <div className="desktop-backdrop" />
      <main className={`app-content${focused ? ' app-content-focus' : ''}`}>{children}</main>
      {!focused && <>
        <button className="fab" aria-label="Ghi nhanh" onClick={() => setOpen(true)}><Plus /></button>
        <nav className="bottom-nav">
          <NavLink to="/"><Home /><span>Trang chủ</span></NavLink>
          <NavLink to="/journal"><BookHeart /><span>Nhật ký</span></NavLink>
          <span className="nav-action-space" aria-hidden="true" />
          <NavLink to="/reminders"><CalendarDays /><span>Lịch</span></NavLink>
          <NavLink to="/settings"><Menu /><span>Thêm</span></NavLink>
        </nav>
      </>}
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
