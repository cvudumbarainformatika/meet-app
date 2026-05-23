// =============================================================
// services/api/src/modules/auth/auth.service.ts
// Business logic untuk autentikasi
// =============================================================

import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { User } from '../../shared/types.js'

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async register(name: string, email: string, password: string): Promise<User> {
    // Cek email sudah ada
    const existing = await this.fastify.pg.query<User>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (existing.rows.length > 0) {
      throw new Error('Email sudah terdaftar')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const result = await this.fastify.pg.query<User>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, avatar_url, created_at, updated_at`,
      [name, email.toLowerCase(), passwordHash]
    )
    return result.rows[0]
  }

  async login(email: string, password: string): Promise<User> {
    const result = await this.fastify.pg.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    const user = result.rows[0]
    if (!user) throw new Error('Email atau password salah')

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw new Error('Email atau password salah')

    return user
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.fastify.pg.query<User>(
      'SELECT id, name, email, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  }

  generateToken(user: User): string {
    return this.fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    })
  }
}
