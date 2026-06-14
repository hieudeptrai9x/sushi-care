import { Baby, Bell, Bot, ChevronRight, CircleHelp, Database, Info, KeyRound, LogOut, Settings2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'

const groups = [
  [{ label: 'Hồ sơ bé', icon: Baby, route: '/baby' }, { label: 'Người chăm sóc', icon: Users }, { label: 'Đổi mật khẩu', icon: KeyRound, route: '/change-password' }, { label: 'Cài đặt nhắc nhở', icon: Bell, route: '/reminders' }],
  [{ label: 'AI Settings', icon: Bot, route: '/ai-settings' }, { label: 'Sao lưu & đồng bộ', icon: Database }, { label: 'Cài đặt chung', icon: Settings2 }],
  [{ label: 'Trợ giúp & Liên hệ', icon: CircleHelp }, { label: 'Giới thiệu ứng dụng', icon: Info }],
]

export function SettingsPage() {
  const navigate = useNavigate(), { user, logout } = useAuth()
  return <div className="page-pad">
    <PageHeader title="Thêm" subtitle="GÓC NHỎ CỦA GIA ĐÌNH" />
    <div className="profile-mini"><div>{user?.name.charAt(0)}</div><span><strong>{user?.name}</strong><small>{user?.email}</small></span></div>
    {groups.map((group, groupIndex) => <div className="settings-group" key={groupIndex}>{group.map(({ label, icon: Icon, route }) => <button onClick={() => route && navigate(route)} key={label}><span className="settings-icon"><Icon /></span><strong>{label}</strong><ChevronRight /></button>)}</div>)}
    <button className="logout-button" onClick={logout}><LogOut /> Đăng xuất</button>
    <p className="version">Sushi Care 1.0.0 · Làm bằng sự dịu dàng</p>
  </div>
}
