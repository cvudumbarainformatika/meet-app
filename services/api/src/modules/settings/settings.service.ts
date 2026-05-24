import { FastifyInstance } from 'fastify'

export interface AppSettings {
  id: number
  app_name: string
  primary_color: string
  background_color: string
  sidebar_color: string
  card_color: string
  logo_url: string | null
  theme_mode: string
}

export class SettingsService {
  constructor(private fastify: FastifyInstance) {}

  async getSettings(): Promise<AppSettings> {
    const result = await this.fastify.pg.query<AppSettings>(
      'SELECT * FROM app_settings WHERE id = 1'
    )
    return result.rows[0]
  }

  async updateSettings(data: Omit<AppSettings, 'id'>): Promise<AppSettings> {
    const result = await this.fastify.pg.query<AppSettings>(
      `UPDATE app_settings
       SET app_name = $1,
           primary_color = $2,
           background_color = $3,
           sidebar_color = $4,
           card_color = $5,
           logo_url = $6,
           theme_mode = $7
       WHERE id = 1
       RETURNING *`,
      [
        data.app_name,
        data.primary_color,
        data.background_color,
        data.sidebar_color,
        data.card_color,
        data.logo_url || null,
        data.theme_mode || 'dark'
      ]
    )
    return result.rows[0]
  }
}
