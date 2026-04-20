import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Patterns } from './pages/Patterns'
import { Statistics } from './pages/Statistics'
import { Messages } from './pages/Messages'
import { Devices } from './pages/Devices'
import { Settings } from './pages/Settings'
import { ToastContainer } from './components/ui/Toast'

function ProtectedRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
