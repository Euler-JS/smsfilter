import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LangKey } from '../i18n'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface UiStore {
  sidebarCollapsed: boolean
  language: LangKey
  toasts: Toast[]
  toggleSidebar: () => void
  setLanguage: (lang: LangKey) => void
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      language: 'pt',
      toasts: [],
      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setLanguage: (language) => set({ language }),
      addToast: (type, message) => {
        const id = Math.random().toString(36).slice(2)
        set({ toasts: [...get().toasts, { id, type, message }] })
        setTimeout(() => {
          set({ toasts: get().toasts.filter((t) => t.id !== id) })
        }, 4000)
      },
      removeToast: (id) =>
        set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: 'optimusguard-ui',
      partialize: (state) => ({ language: state.language, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
