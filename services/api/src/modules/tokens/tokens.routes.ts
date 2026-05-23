// =============================================================
// services/api/src/modules/tokens/tokens.routes.ts
// Route untuk generate LiveKit token
// =============================================================

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { TokensService } from './tokens.service.js'
import { RoomsService } from '../rooms/rooms.service.js'
import { ApiResponse } from '../../shared/types.js'

const joinSchema = z.object({
  room_slug: z.string().min(1),
  password: z.string().optional(),
})

export default async function tokensRoutes(fastify: FastifyInstance) {
  const tokensService = new TokensService()
  const roomsService = new RoomsService(fastify)

  // POST /api/tokens/join — Request token untuk join room (protected)
  fastify.post(
    '/join',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = joinSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      // Cari room berdasarkan slug
      const room = await roomsService.findBySlug(parsed.data.room_slug)
      if (!room) {
        return reply.status(404).send({
          success: false,
          message: 'Room tidak ditemukan',
        })
      }

      // Verifikasi password jika room terkunci
      if (room.is_locked) {
        if (!parsed.data.password) {
          return reply.status(403).send({
            success: false,
            message: 'Room ini memerlukan password',
          })
        }
        const valid = await roomsService.verifyPassword(room, parsed.data.password)
        if (!valid) {
          return reply.status(403).send({
            success: false,
            message: 'Password room salah',
          })
        }
      }

      const user = request.user as any
      const isHost = room.host_id === user.sub

      // Generate LiveKit JWT token
      const token = await tokensService.generateToken({
        roomName: room.slug,  // LiveKit room name = slug
        participantName: user.name,
        participantId: user.sub,
        isHost,
        metadata: JSON.stringify({ userId: user.sub, email: user.email }),
      })

      return reply.send({
        success: true,
        data: {
          token,
          room: {
            id: room.id,
            name: room.name,
            slug: room.slug,
          },
          is_host: isHost,
          livekit_url: process.env.LIVEKIT_WS_URL ?? `ws://${process.env.LIVEKIT_HOST}:${process.env.LIVEKIT_PORT}`,
        },
        message: 'Token berhasil dibuat',
      } as ApiResponse)
    }
  )

  // GET /api/tokens/participants/:roomSlug — Lihat participant aktif (protected)
  fastify.get<{ Params: { roomSlug: string } }>(
    '/participants/:roomSlug',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const participants = await tokensService.getRoomParticipants(request.params.roomSlug)
      return reply.send({
        success: true,
        data: { participants, count: participants.length },
      })
    }
  )
}
