import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'

const icons = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error: <XCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-blue-400" />,
}

const borders = {
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg bg-surface p-4 shadow-xl ${borders[toast.type]} animate-in slide-in-from-right-5`}
        >
          <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
          <p className="flex-1 text-sm text-text">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-text-muted hover:text-text flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
