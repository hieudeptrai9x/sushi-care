import { Baby, Bell, Bot, ChevronRight, CircleHelp, Database, Info, KeyRound, LogOut, Milk, Settings2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

type SettingItem = {
  label: string
  icon: typeof Baby
  route?: string
  action?: 'backup' | 'help' | 'about'
  disabled?: boolean
}

export function SettingsPage() {
  const navigate = useNavigate(), { user, logout } = useAuth()
  const toast = useToast()
  const groups: SettingItem[][] = [
    [{ label: 'Hồ sơ bé', icon: Baby, route: '/baby' }, ...(user?.role === 'admin' ? [{ label: 'Người chăm sóc', icon: Users, route: '/caregivers' }] : []), { label: 'Đổi mật khẩu', icon: KeyRound, route: '/change-password' }, { label: 'Cài đặt nhắc nhở', icon: Bell, route: '/reminders' }, { label: 'Nhắc hâm sữa', icon: Milk, route: '/feeding-reminders' }],
    [...(user?.role === 'admin' ? [{ label: 'AI Settings', icon: Bot, route: '/ai-settings' }, { label: 'Tải bản sao dữ liệu', icon: Database, action: 'backup' as const }] : []), { label: 'Cài đặt chung', icon: Settings2, disabled: true }],
    [{ label: 'Trợ giúp & Liên hệ', icon: CircleHelp, action: 'help' }, { label: 'Giới thiệu ứng dụng', icon: Info, action: 'about' }],
  ]
  const runAction = (action?: string) => {
    if (action === 'backup') window.location.href = `${import.meta.env.BASE_URL}api/settings/export.php`
    if (action === 'help') window.location.href = 'mailto:codex@leminhhieu.com?subject=Hỗ trợ Sushi Care'
    if (action === 'about') toast('Sushi Care 1.1 · Nhật ký riêng của bé Sushi')
  }
  return <div className="page-pad">
    <PageHeader title="Thêm" subtitle="GÓC NHỎ CỦA GIA ĐÌNH" />
    <div className="profile-mini"><div>{user?.name.charAt(0)}</div><span><strong>{user?.name}</strong><small>{user?.email}</small></span></div>
    {groups.map((group, groupIndex) => <div className="settings-group" key={groupIndex}>{group.map(({ label, icon: Icon, route, action, disabled }) => <button disabled={disabled} onClick={() => route ? navigate(route) : runAction(action)} key={label}><span className="settings-icon"><Icon /></span><strong>{label}</strong>{disabled ? <em>Sắp có</em> : <ChevronRight />}</button>)}</div>)}
    <button className="logout-button" onClick={logout}><LogOut /> Đăng xuất</button>
    <p className="version">Sushi Care 1.1 · Làm bằng sự dịu dàng</p>
  </div>
}
