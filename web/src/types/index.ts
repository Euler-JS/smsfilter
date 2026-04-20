export type Platform = 'android' | 'ios'
export type Severity = 'low' | 'medium' | 'high'
export type PatternType = 'keyword' | 'url' | 'regex'
export type Language = 'pt' | 'en' | 'both'
export type PatternStatus = 'active' | 'inactive'
export type DeviceStatus = 'active' | 'expired'

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export interface PhishingPattern {
  id: string
  pattern: string
  type: PatternType
  language: Language
  severity: Severity
  status: PatternStatus
  matchCount: number
  createdAt: string
  updatedAt: string
}

export interface BlockedMessage {
  id: string
  deviceId: string
  sender: string
  patternId: string
  patternText: string
  severity: Severity
  platform: Platform
  appVersion: string
  blockedAt: string
  rawContent?: string
}

export interface Device {
  id: string
  deviceId: string
  platform: Platform
  appVersion: string
  totalBlocked: number
  lastActive: string
  status: DeviceStatus
}

export interface OverviewStats {
  totalBlocked: number
  activeDevices: number
  activePatterns: number
  blockedLast24h: number
}

export interface BlocksPerDay {
  date: string
  count: number
}

export interface BlocksByPlatform {
  platform: Platform
  count: number
}

export interface TopPattern {
  patternId: string
  patternText: string
  severity: Severity
  count: number
  lastMatched: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  status: number
}
