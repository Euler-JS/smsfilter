import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  MessageSquareX,
  Smartphone,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useUiStore as useUI } from '../../store/uiStore'
import { t } from '../../i18n'

const navItems = [
  { to: '/', icon: LayoutDashboard, key: 'overview' as const, end: true },
  { to: '/patterns', icon: ShieldAlert, key: 'patterns' as const },
  { to: '/statistics', icon: BarChart3, key: 'statistics' as const },
  { to: '/messages', icon: MessageSquareX, key: 'messages' as const },
  { to: '/devices', icon: Smartphone, key: 'devices' as const },
  { to: '/settings', icon: Settings, key: 'settings' as const },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const lang = useUI((s) => s.language)

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-slate-700/50 bg-surface transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
          <Shield size={22} className="text-primary" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-bold tracking-wide text-text">
            OptimusGuard
          </span>
        )}
      </div>

      <hr className="border-slate-700/50" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map(({ to, icon: Icon, key, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
            title={sidebarCollapsed ? t(lang, key) : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && t(lang, key)}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface border border-slate-700 p-1 text-text-muted hover:text-text transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
