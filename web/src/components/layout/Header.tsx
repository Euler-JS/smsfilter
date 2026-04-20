import { LogOut, Globe } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { t } from '../../i18n'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuthStore()
  const { language, setLanguage } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-700/50 bg-surface px-6">
      <div />
      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
          title={language === 'pt' ? t(language, 'english') : t(language, 'portuguese')}
        >
          <Globe size={15} />
          {language.toUpperCase()}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="text-sm font-medium text-text hidden sm:block">{user?.name ?? 'Admin'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted hover:bg-surface-2 hover:text-red-400 transition-colors"
          title={t(language, 'logout')}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{t(language, 'logout')}</span>
        </button>
      </div>
    </header>
  )
}
