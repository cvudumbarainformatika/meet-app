// =============================================================
// services/api/src/modules/rooms/rooms.routes.ts
// Route handler untuk manajemen room
// =============================================================

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { RoomsService } from './rooms.service.js'
import { ApiResponse } from '../../shared/types.js'

const createRoomSchema = z.object({
  name: z.string().min(3, 'Nama room minimal 3 karakter').max(100),
  description: z.string().max(500).optional(),
  password: z.string().min(4).optional(),
  max_participants: z.number().int().min(2).max(500).optional(),
})

export default async function roomsRoutes(fastify: FastifyInstance) {
  const roomsService = new RoomsService(fastify)

  // GET /api/rooms — List semua room (public)
  fastify.get(
    '/',
    async (request, reply) => {
      const query = request.query as { page?: string; per_page?: string }
      const page = parseInt(query.page ?? '1', 10)
      const perPage = parseInt(query.per_page ?? '20', 10)

      const { rooms, total } = await roomsService.findAll(page, perPage)
      return reply.send({
        success: true,
        data: {
          data: rooms.map(sanitizeRoom),
          total,
          page,
          per_page: perPage,
          total_pages: Math.ceil(total / perPage),
        },
      } as ApiResponse)
    }
  )

  // POST /api/rooms — Buat room baru (protected)
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = createRoomSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      const user = request.user as any
      const room = await roomsService.create(
        parsed.data.name,
        user.sub,
        {
          description: parsed.data.description,
          password: parsed.data.password,
          maxParticipants: parsed.data.max_participants,
        }
      )

      return reply.status(201).send({
        success: true,
        data: sanitizeRoom(room),
        message: 'Room berhasil dibuat',
      } as ApiResponse)
    }
  )

  // GET /api/rooms/:slug — Detail room by slug (public)
  fastify.get<{ Params: { slug: string } }>(
    '/:slug',
    async (request, reply) => {
      const room = await roomsService.findBySlug(request.params.slug)
      if (!room) {
        return reply.status(404).send({ success: false, message: 'Room tidak ditemukan' })
      }
      return reply.send({ success: true, data: sanitizeRoom(room) })
    }
  )

  // DELETE /api/rooms/:id — Hapus room (protected, host only)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as any
      const deleted = await roomsService.delete(request.params.id, user.sub)
      if (!deleted) {
        return reply.status(403).send({
          success: false,
          message: 'Room tidak ditemukan atau Anda bukan host',
        })
      }
      return reply.send({ success: true, message: 'Room berhasil dihapus' })
    }
  )
}

function sanitizeRoom(room: any) {
  const { password_hash, ...safe } = room
  return { ...safe, is_locked: !!safe.is_locked }
}
