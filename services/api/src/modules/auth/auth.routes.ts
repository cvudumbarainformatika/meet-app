// =============================================================
// services/api/src/modules/auth/auth.routes.ts
// Route handler untuk autentikasi
// =============================================================

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from './auth.service.js'
import { ApiResponse, User } from '../../shared/types.js'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify)

  // POST /api/auth/register
  fastify.post<{ Body: z.infer<typeof registerSchema> }>(
    '/register',
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        } as ApiResponse)
      }

      try {
        const user = await authService.register(
          parsed.data.name,
          parsed.data.email,
          parsed.data.password
        )
        const token = authService.generateToken(user)
        return reply.status(201).send({
          success: true,
          data: { user: sanitizeUser(user), token },
          message: 'Registrasi berhasil',
        } as ApiResponse)
      } catch (err: any) {
        return reply.status(409).send({
          success: false,
          message: err.message,
        } as ApiResponse)
      }
    }
  )

  // POST /api/auth/login
  fastify.post<{ Body: z.infer<typeof loginSchema> }>(
    '/login',
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ success: false, message: 'Input tidak valid' })
      }

      try {
        const user = await authService.login(parsed.data.email, parsed.data.password)
        const token = authService.generateToken(user)
        return reply.send({
          success: true,
          data: { user: sanitizeUser(user), token },
          message: 'Login berhasil',
        } as ApiResponse)
      } catch (err: any) {
        return reply.status(401).send({
          success: false,
          message: err.message,
        } as ApiResponse)
      }
    }
  )

  // GET /api/auth/me (protected)
  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const payload = request.user as any
      const user = await authService.findById(payload.sub)
      if (!user) {
        return reply.status(404).send({ success: false, message: 'User tidak ditemukan' })
      }
      return reply.send({ success: true, data: sanitizeUser(user) })
    }
  )
}

function sanitizeUser(user: User) {
  const { password_hash, ...safe } = user
  return safe
}
