// =============================================================
// services/api/src/index.ts
// Entry point — Fastify server setup
// =============================================================

import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import { config } from './config/env.js'
import databasePlugin from './plugins/database.js'
import redisPlugin from './plugins/redis.js'
import authRoutes from './modules/auth/auth.routes.js'
import roomsRoutes from './modules/rooms/rooms.routes.js'
import tokensRoutes from './modules/tokens/tokens.routes.js'
import meetingsRoutes from './modules/meetings/meetings.routes.js'

// =============================================================
// Inisialisasi Fastify
// =============================================================
const fastify = Fastify({
  logger: {
    level: config.isDev ? 'debug' : 'info',
  },
})

// =============================================================
// Register Plugins
// =============================================================
await fastify.register(helmet, {
  contentSecurityPolicy: false,  // Frontend handles this
})

await fastify.register(cors, {
  origin: config.isDev ? true : process.env.ALLOWED_ORIGINS?.split(',') ?? false,
  credentials: true,
})

await fastify.register(jwt, {
  secret: config.jwt.secret,
  sign: { expiresIn: config.jwt.expiresIn },
})

// Dekorasi: middleware autentikasi yang bisa dipakai di route
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ success: false, message: 'Token tidak valid atau sudah expired' })
  }
})

// Register database & redis plugins
await fastify.register(databasePlugin)
await fastify.register(redisPlugin)

// =============================================================
// Register Routes (dengan prefix /api)
// =============================================================
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(roomsRoutes, { prefix: '/api/rooms' })
await fastify.register(tokensRoutes, { prefix: '/api/tokens' })
await fastify.register(meetingsRoutes, { prefix: '/api/meetings' })

// =============================================================
// Health Check
// =============================================================
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
}))

// =============================================================
// Start Server
// =============================================================
try {
  await fastify.listen({ port: config.app.port, host: '0.0.0.0' })
  fastify.log.info(`🚀 MeetApp API running on port ${config.app.port}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
