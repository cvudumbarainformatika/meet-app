import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { MeetingsService } from './meetings.service.js'

const startSchema = z.object({
  room_id: z.string().uuid(),
})

const endSchema = z.object({
  participant_count: z.number().min(0),
})

const notesSchema = z.object({
  notes: z.string(),
})

export default async function meetingsRoutes(fastify: FastifyInstance) {
  const meetingsService = new MeetingsService(fastify)

  // POST /api/meetings — Start a meeting session
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = startSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ success: false, errors: parsed.error.flatten().fieldErrors })
      }
      
      const session = await meetingsService.startSession(parsed.data.room_id)
      return reply.send({ success: true, data: session })
    }
  )

  // PUT /api/meetings/:id/end — End a meeting session
  fastify.put<{ Params: { id: string } }>(
    '/:id/end',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = endSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ success: false, errors: parsed.error.flatten().fieldErrors })
      }

      const session = await meetingsService.endSession(request.params.id, parsed.data.participant_count)
      if (!session) {
        return reply.status(404).send({ success: false, message: 'Session not found' })
      }
      return reply.send({ success: true, data: session })
    }
  )

  // PUT /api/meetings/:id/notes — Update meeting notes
  fastify.put<{ Params: { id: string } }>(
    '/:id/notes',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = notesSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ success: false, errors: parsed.error.flatten().fieldErrors })
      }

      const session = await meetingsService.updateNotes(request.params.id, parsed.data.notes)
      if (!session) {
        return reply.status(404).send({ success: false, message: 'Session not found' })
      }
      return reply.send({ success: true, data: session })
    }
  )

  // GET /api/meetings/my-rooms — Get rooms created by host with stats
  fastify.get(
    '/my-rooms',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as any
      const rooms = await meetingsService.getRoomsByHost(user.sub)
      return reply.send({ success: true, data: rooms })
    }
  )

  // GET /api/meetings/history — Get all sessions for the host's rooms
  fastify.get<{ Querystring: { page?: string, perPage?: string } }>(
    '/history',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as any
      const page = parseInt(request.query.page || '1', 10)
      const perPage = parseInt(request.query.perPage || '20', 10)
      
      const sessions = await meetingsService.getSessionsByHost(user.sub, page, perPage)
      return reply.send({ success: true, ...sessions })
    }
  )
}
