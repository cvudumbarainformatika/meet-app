// =============================================================
// services/api/src/modules/rooms/rooms.service.ts
// Business logic manajemen room meeting
// =============================================================

import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { Room } from '../../shared/types.js'

export class RoomsService {
  constructor(private fastify: FastifyInstance) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now().toString(36)
  }

  async create(
    name: string,
    hostId: string,
    options?: { description?: string; password?: string; maxParticipants?: number }
  ): Promise<Room> {
    const slug = this.generateSlug(name)
    const passwordHash = options?.password
      ? await bcrypt.hash(options.password, 10)
      : null

    const result = await this.fastify.pg.query<Room>(
      `INSERT INTO rooms (name, slug, description, host_id, is_locked, password_hash, max_participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        slug,
        options?.description ?? null,
        hostId,
        !!options?.password,
        passwordHash,
        options?.maxParticipants ?? 50,
      ]
    )
    return result.rows[0]
  }

  async findAll(page = 1, perPage = 20): Promise<{ rooms: Room[]; total: number }> {
    const offset = (page - 1) * perPage
    const [roomsResult, countResult] = await Promise.all([
      this.fastify.pg.query<Room>(
        `SELECT r.*, u.name as host_name 
         FROM rooms r 
         JOIN users u ON r.host_id = u.id
         ORDER BY r.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [perPage, offset]
      ),
      this.fastify.pg.query<{ count: string }>('SELECT COUNT(*) FROM rooms'),
    ])
    return {
      rooms: roomsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    }
  }

  async findBySlug(slug: string): Promise<Room | null> {
    const result = await this.fastify.pg.query<Room>(
      `SELECT r.*, u.name as host_name 
       FROM rooms r 
       JOIN users u ON r.host_id = u.id
       WHERE r.slug = $1`,
      [slug]
    )
    return result.rows[0] ?? null
  }

  async findById(id: string): Promise<Room | null> {
    const result = await this.fastify.pg.query<Room>(
      'SELECT * FROM rooms WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  }

  async verifyPassword(room: Room, password: string): Promise<boolean> {
    if (!room.password_hash) return true
    return bcrypt.compare(password, room.password_hash)
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.fastify.pg.query(
      'DELETE FROM rooms WHERE id = $1 AND host_id = $2',
      [id, userId]
    )
    return (result.rowCount ?? 0) > 0
  }
}
