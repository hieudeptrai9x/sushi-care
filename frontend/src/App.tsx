import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Loading } from './components/Loading'
import { useAuth } from './context/AuthContext'
import { ActivityFormPage } from './pages/ActivityFormPage'
import { AiChatPage } from './pages/AiChatPage'
import { AiSettingsPage } from './pages/AiSettingsPage'
import { BabyProfilePage } from './pages/BabyProfilePage'
import { HealthPage } from './pages/HealthPage'
import { HomePage } from './pages/HomePage'
import { JournalPage } from './pages/JournalPage'
import { LoginPage } from './pages/LoginPage'
import { MomentsPage } from './pages/MomentsPage'
import { RemindersPage } from './pages/RemindersPage'
import { SettingsPage } from './pages/SettingsPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <div className="startup"><Loading /><span>Đang chuẩn bị góc nhỏ của bé...</span></div>
  if (!user) return <Navigate to="/login" replace />
  return <AppShell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/journal" element={<JournalPage />} />
    <Route path="/moments" element={<MomentsPage />} />
    <Route path="/reminders" element={<RemindersPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/baby" element={<BabyProfilePage />} />
    <Route path="/change-password" element={<ChangePasswordPage />} />
    <Route path="/add/:type" element={<ActivityFormPage />} />
    <Route path="/health" element={<HealthPage />} />
    <Route path="/ai" element={<AiChatPage />} />
    <Route path="/ai-settings" element={<AiSettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AppShell>
}

export default function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Protected />} /></Routes>
}
