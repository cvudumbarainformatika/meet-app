// =============================================================
// services/api/src/shared/types.ts
// Shared TypeScript types
// =============================================================

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  avatar_url?: string
  created_at: Date
  updated_at: Date
}

export interface Room {
  id: string
  name: string
  slug: string          // URL-friendly identifier
  description?: string
  host_id: string       // User ID yang buat room
  is_locked: boolean
  password_hash?: string
  max_participants: number
  created_at: Date
  updated_at: Date
}

export interface TokenPayload {
  sub: string           // User ID
  email: string
  name: string
  iat?: number
  exp?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface MeetingSession {
  id: string
  room_id: string
  started_at: Date
  ended_at?: Date
  participant_count: number
  notes?: string
  created_at: Date
  updated_at: Date
}
