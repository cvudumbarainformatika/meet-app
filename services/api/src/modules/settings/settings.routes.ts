import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { SettingsService } from './settings.service.js'

const settingsSchema = z.object({
  app_name: z.string().min(1).max(100),
  primary_color: z.string().min(4).max(50),
  background_color: z.string().min(4).max(50),
  sidebar_color: z.string().min(4).max(50),
  card_color: z.string().min(4).max(50),
  logo_url: z.string().nullable().optional(),
  theme_mode: z.enum(['dark', 'light']).optional(),
})

export default async function settingsRoutes(fastify: FastifyInstance) {
  const settingsService = new SettingsService(fastify)

  // GET /api/settings — Public endpoint
  fastify.get('/', async (request, reply) => {
    const settings = await settingsService.getSettings()
    return reply.send({ success: true, data: settings })
  })

  // PUT /api/settings — Protected endpoint (Hanya untuk pharyyady@gmail.com)
  fastify.put(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request: any, reply) => {
      const user = request.user as any
      
      // Hak Akses Khusus: Hanya pharyyady@gmail.com
      if (user.email !== 'pharyyady@gmail.com') {
        return reply.status(403).send({ 
          success: false, 
          message: 'Hanya pemilik utama (owner) yang dapat merubah pengaturan penampilan aplikasi' 
        })
      }

      const parsed = settingsSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ 
          success: false, 
          errors: parsed.error.flatten().fieldErrors 
        })
      }

      try {
        const updated = await settingsService.updateSettings({
          app_name: parsed.data.app_name,
          primary_color: parsed.data.primary_color,
          background_color: parsed.data.background_color,
          sidebar_color: parsed.data.sidebar_color,
          card_color: parsed.data.card_color,
          logo_url: parsed.data.logo_url ?? null,
          theme_mode: parsed.data.theme_mode ?? 'dark'
        })
        return reply.send({ success: true, data: updated })
      } catch (err) {
        fastify.log.error(err, 'Gagal memperbarui pengaturan aplikasi:')
        return reply.status(500).send({ 
          success: false, 
          message: 'Gagal memperbarui pengaturan penampilan aplikasi' 
        })
      }
    }
  )
}
