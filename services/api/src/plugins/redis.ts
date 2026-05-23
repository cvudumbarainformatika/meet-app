// =============================================================
// services/api/src/plugins/redis.ts
// Redis plugin untuk session caching
// =============================================================

import fp from 'fastify-plugin'
import fastifyRedis from '@fastify/redis'
import { config } from '../config/env.js'

export default fp(async (fastify) => {
  await fastify.register(fastifyRedis, {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    closeClient: true,
  })

  fastify.log.info('✅ Redis connected')
}, {
  name: 'redis',
})
