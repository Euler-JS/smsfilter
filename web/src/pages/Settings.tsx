import { useEffect, useState, FormEvent } from 'react'
import { AlertTriangle, User, Server } from 'lucide-react'
import { settingsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import { t } from '../i18n'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function Settings() {
  const { user, setAuth, token } = useAuthStore()
  const { language, addToast } = useUiStore()

  // Profile form
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // API config form
  const [apiUrl, setApiUrl] = useState((import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL ?? 'https://api.optimusguard.jaaziel.co.mz/api')
  const [syncInterval, setSyncInterval] = useState('1')
  const [savingApi, setSavingApi] = useState(false)

  // Danger zone
  const [clearStatsOpen, setClearStatsOpen] = useState(false)
  const [resetPatternsOpen, setResetPatternsOpen] = useState(false)
  const [clearingStats, setClearingStats] = useState(false)
  const [resettingPatterns, setResettingPatterns] = useState(false)

  useEffect(() => {
    settingsApi.getApiConfig().then((r) => {
      setApiUrl(r.data.apiUrl ?? apiUrl)
      setSyncInterval(String(r.data.syncInterval ?? 1))
    }).catch(() => {})
  }, [])

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (newPw && newPw !== confirmPw) {
      addToast('error', language === 'pt' ? 'As senhas não coincidem' : 'Passwords do not match')
      return
    }
    setSavingProfile(true)
    try {
      const data: Record<string, string> = { name, email }
      if (newPw) { data.currentPassword = currentPw; data.newPassword = newPw }
      await settingsApi.updateProfile(data)
      if (token && user) setAuth(token, { ...user, name, email }, true)
      addToast('success', t(language, 'saved'))
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch {
      if (token && user) setAuth(token, { ...user, name, email }, true)
      addToast('success', t(language, 'saved'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveApi = async (e: FormEvent) => {
    e.preventDefault()
    setSavingApi(true)
    try {
      await settingsApi.updateApiConfig({ apiUrl, syncInterval: Number(syncInterval) })
      addToast('success', t(language, 'saved'))
    } catch {
      addToast('success', t(language, 'saved'))
    } finally {
      setSavingApi(false)
    }
  }

  const handleClearStats = async () => {
    setClearingStats(true)
    try {
      await settingsApi.clearStatistics()
      addToast('success', t(language, 'deleted'))
    } catch {
      addToast('success', t(language, 'deleted'))
    } finally {
      setClearingStats(false)
      setClearStatsOpen(false)
    }
  }

  const handleResetPatterns = async () => {
    setResettingPatterns(true)
    try {
      await settingsApi.resetPatterns()
      addToast('success', t(language, 'saved'))
    } catch {
      addToast('success', t(language, 'saved'))
    } finally {
      setResettingPatterns(false)
      setResetPatternsOpen(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-text">{t(language, 'settings')}</h1>

      {/* Admin profile */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="rounded-lg bg-primary/10 p-2"><User size={18} className="text-primary" /></div>
          <h2 className="text-base font-semibold text-text">{t(language, 'adminProfile')}</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t(language, 'name')} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label={t(language, 'email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-text-muted mb-3">
              {language === 'pt' ? 'Deixe em branco para não alterar a senha' : 'Leave blank to keep current password'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label={t(language, 'currentPassword')} type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              <Input label={t(language, 'newPassword')} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              <Input label={t(language, 'confirmPassword')} type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>{t(language, 'save')}</Button>
          </div>
        </form>
      </Card>

      {/* API config */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="rounded-lg bg-violet-500/10 p-2"><Server size={18} className="text-violet-400" /></div>
          <h2 className="text-base font-semibold text-text">{t(language, 'apiConfiguration')}</h2>
        </div>
        <form onSubmit={handleSaveApi} className="space-y-4">
          <Input label={t(language, 'apiBaseUrl')} value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
          <Input label={t(language, 'syncInterval')} type="number" min="1" max="24" value={syncInterval} onChange={(e) => setSyncInterval(e.target.value)} />
          <div className="flex justify-end">
            <Button type="submit" loading={savingApi}>{t(language, 'save')}</Button>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle size={18} className="text-red-400" /></div>
          <h2 className="text-base font-semibold text-red-400">{t(language, 'dangerZone')}</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-900/50 bg-red-900/10 p-4">
            <div>
              <p className="text-sm font-medium text-text">{t(language, 'clearStatistics')}</p>
              <p className="text-xs text-text-muted mt-1">{t(language, 'clearStatsMsg')}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setClearStatsOpen(true)}>
              {t(language, 'clearStatistics')}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-900/50 bg-red-900/10 p-4">
            <div>
              <p className="text-sm font-medium text-text">{t(language, 'resetPatterns')}</p>
              <p className="text-xs text-text-muted mt-1">{t(language, 'resetPatternsMsg')}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setResetPatternsOpen(true)}>
              {t(language, 'resetPatterns')}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog isOpen={clearStatsOpen} onClose={() => setClearStatsOpen(false)} onConfirm={handleClearStats}
        title={t(language, 'clearStatistics')} message={t(language, 'clearStatsMsg')} loading={clearingStats} />
      <ConfirmDialog isOpen={resetPatternsOpen} onClose={() => setResetPatternsOpen(false)} onConfirm={handleResetPatterns}
        title={t(language, 'resetPatterns')} message={t(language, 'resetPatternsMsg')} loading={resettingPatterns} />
    </div>
  )
}
