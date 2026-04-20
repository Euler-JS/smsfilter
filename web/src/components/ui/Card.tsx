interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`rounded-xl bg-surface p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-base font-semibold text-text">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: string
}

export function StatCard({ title, value, subtitle, icon, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="rounded-xl bg-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${color}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
        </div>
        <div className={`rounded-lg bg-surface-2 p-3 ${color}`}>{icon}</div>
      </div>
    </div>
  )
}
