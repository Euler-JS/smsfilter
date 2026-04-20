import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthStore {
  token: string | null
  user: User | null
  rememberMe: boolean
  isAuthenticated: boolean
  setAuth: (token: string, user: User, remember: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      rememberMe: false,
      isAuthenticated: false,
      setAuth: (token, user, remember) =>
        set({ token, user, rememberMe: remember, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'optimusguard-auth',
      partialize: (state) =>
        state.rememberMe
          ? { token: state.token, user: state.user, rememberMe: state.rememberMe, isAuthenticated: state.isAuthenticated }
          : {},
    }
  )
)
