import { FastifyInstance } from 'fastify'
import { MeetingSession, PaginatedResponse } from '../../shared/types.js'

export class MeetingsService {
  constructor(private fastify: FastifyInstance) {}

  // Mulai sesi baru
  async startSession(roomId: string): Promise<MeetingSession> {
    const result = await this.fastify.pg.query<MeetingSession>(
      `INSERT INTO meeting_sessions (room_id, started_at)
       VALUES ($1, NOW())
       RETURNING *`,
      [roomId]
    )
    return result.rows[0]
  }

  // Akhiri sesi dan catat peserta
  async endSession(sessionId: string, participantCount: number): Promise<MeetingSession | null> {
    const result = await this.fastify.pg.query<MeetingSession>(
      `UPDATE meeting_sessions 
       SET ended_at = NOW(), participant_count = $2
       WHERE id = $1
       RETURNING *`,
      [sessionId, participantCount]
    )
    return result.rows[0] ?? null
  }

  // Simpan / update notulen
  async updateNotes(sessionId: string, notes: string): Promise<MeetingSession | null> {
    const result = await this.fastify.pg.query<MeetingSession>(
      `UPDATE meeting_sessions 
       SET notes = $2
       WHERE id = $1
       RETURNING *`,
      [sessionId, notes]
    )
    return result.rows[0] ?? null
  }

  // Ambil histori sesi untuk sebuah room
  async getSessionsByRoom(roomId: string, page = 1, perPage = 20): Promise<PaginatedResponse<MeetingSession>> {
    const offset = (page - 1) * perPage
    const [sessionsResult, countResult] = await Promise.all([
      this.fastify.pg.query<MeetingSession>(
        `SELECT * FROM meeting_sessions
         WHERE room_id = $1
         ORDER BY started_at DESC 
         LIMIT $2 OFFSET $3`,
        [roomId, perPage, offset]
      ),
      this.fastify.pg.query<{ count: string }>(
        'SELECT COUNT(*) FROM meeting_sessions WHERE room_id = $1',
        [roomId]
      ),
    ])

    const total = parseInt(countResult.rows[0].count, 10)
    return {
      data: sessionsResult.rows,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    }
  }

  // Ambil semua sesi untuk ruangan-ruangan milik Host tertentu (Admin Dashboard)
  async getSessionsByHost(hostId: string, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage
    const [sessionsResult, countResult] = await Promise.all([
      this.fastify.pg.query(
        `SELECT ms.*, r.name as room_name, r.slug as room_slug
         FROM meeting_sessions ms
         JOIN rooms r ON ms.room_id = r.id
         WHERE r.host_id = $1
         ORDER BY ms.started_at DESC 
         LIMIT $2 OFFSET $3`,
        [hostId, perPage, offset]
      ),
      this.fastify.pg.query<{ count: string }>(
        `SELECT COUNT(ms.id) 
         FROM meeting_sessions ms
         JOIN rooms r ON ms.room_id = r.id
         WHERE r.host_id = $1`,
        [hostId]
      ),
    ])

    const total = parseInt(countResult.rows[0].count, 10)
    return {
      data: sessionsResult.rows,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    }
  }

  // Ambil list rooms milik Host beserta statistik dasar
  async getRoomsByHost(hostId: string) {
    const result = await this.fastify.pg.query(
      `SELECT 
         r.id, r.name, r.slug, r.is_locked, r.created_at,
         COUNT(ms.id) as total_sessions,
         COALESCE(MAX(ms.participant_count), 0) as max_participants_ever
       FROM rooms r
       LEFT JOIN meeting_sessions ms ON r.id = ms.room_id
       WHERE r.host_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [hostId]
    )
    return result.rows
  }
}
