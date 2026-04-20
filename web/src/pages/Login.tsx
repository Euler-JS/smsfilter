import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import { authApi } from '../services/api'
import { t } from '../i18n'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { language } = useUiStore()

  const [email, setEmail] = useState('admin@optimusguard.com')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      setAuth(res.data.token, res.data.user, remember)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr?.response?.status === 401) {
        setError(t(language, 'invalidCredentials'))
      } else {
        setError(t(language, 'errorFetch'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Shield size={40} className="text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">OptimusGuard</h1>
            <p className="mt-1 text-sm text-text-muted">{t(language, 'loginTitle')}</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-surface p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label={t(language, 'email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">{t(language, 'password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-600 bg-surface-2 px-3 py-2.5 pr-10 text-sm text-text placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-surface-2 text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-text-muted">{t(language, 'rememberMe')}</span>
            </label>

            {error && (
              <p className="rounded-lg bg-red-900/30 border border-red-700 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              {t(language, 'login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
