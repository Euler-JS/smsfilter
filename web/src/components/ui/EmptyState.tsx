import { ShieldOff } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-2 p-6 text-text-muted">
        {icon ?? <ShieldOff size={40} />}
      </div>
      <p className="text-base text-text-muted">{message}</p>
    </div>
  )
}
