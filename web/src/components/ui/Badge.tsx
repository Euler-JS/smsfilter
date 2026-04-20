import type { Severity, PatternStatus, DeviceStatus, Platform } from '../../types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'severity' | 'status' | 'platform' | 'default'
  severity?: Severity
  status?: PatternStatus | DeviceStatus
  platform?: Platform
}

const severityColors: Record<Severity, string> = {
  low: 'bg-green-900/50 text-green-400 border border-green-700',
  medium: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  high: 'bg-red-900/50 text-red-400 border border-red-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700',
  inactive: 'bg-slate-700/50 text-slate-400 border border-slate-600',
  expired: 'bg-orange-900/50 text-orange-400 border border-orange-700',
}

export function Badge({ children, severity, status, platform }: BadgeProps) {
  let cls = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium '

  if (severity) cls += severityColors[severity]
  else if (status) cls += statusColors[status]
  else if (platform === 'android') cls += 'bg-green-900/50 text-green-400 border border-green-700'
  else if (platform === 'ios') cls += 'bg-blue-900/50 text-blue-400 border border-blue-700'
  else cls += 'bg-slate-700 text-slate-300'

  return <span className={cls}>{children}</span>
}
