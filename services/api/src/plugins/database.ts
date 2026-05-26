// =============================================================
// services/api/src/plugins/database.ts
// PostgreSQL plugin untuk Fastify + migrasi schema awal
// =============================================================

import fp from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'

const MIGRATION_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(100) NOT NULL UNIQUE,
  description       TEXT,
  host_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash     VARCHAR(255),
  max_participants  INTEGER NOT NULL DEFAULT 50,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Sessions table
CREATE TABLE IF NOT EXISTS meeting_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  participant_count INTEGER NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meeting_sessions_updated_at ON meeting_sessions;
CREATE TRIGGER update_meeting_sessions_updated_at
  BEFORE UPDATE ON meeting_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id                INT PRIMARY KEY DEFAULT 1,
  app_name          VARCHAR(255) NOT NULL DEFAULT 'MeetApp',
  primary_color     VARCHAR(50) NOT NULL DEFAULT '#5865f2',
  background_color  VARCHAR(50) NOT NULL DEFAULT '#313338',
  sidebar_color     VARCHAR(50) NOT NULL DEFAULT '#1e1f22',
  card_color        VARCHAR(50) NOT NULL DEFAULT '#2b2d31',
  logo_url          TEXT,
  theme_mode        VARCHAR(50) NOT NULL DEFAULT 'dark',
  CONSTRAINT single_row CHECK (id = 1)
);

-- Ensure theme_mode column exists for older database migrations
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(50) NOT NULL DEFAULT 'dark';

-- Seed default settings if not exists
INSERT INTO app_settings (id, app_name, primary_color, background_color, sidebar_color, card_color, theme_mode)
VALUES (1, 'MeetApp', '#5865f2', '#313338', '#1e1f22', '#2b2d31', 'dark')
ON CONFLICT (id) DO NOTHING;
`

export default fp(async (fastify) => {
  await fastify.register(fastifyPostgres, {
    connectionString: `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`,
  })

  // Jalankan migrasi saat startup
  const client = await fastify.pg.connect()
  try {
    await client.query(MIGRATION_SQL)
    fastify.log.info('✅ Database migration completed')

    // Seed Owner Account (pharyyady@gmail.com / harry141312)
    const ownerEmail = 'pharyyady@gmail.com'
    const checkOwner = await client.query('SELECT id FROM users WHERE email = $1', [ownerEmail])
    if (checkOwner.rows.length === 0) {
      const passwordHash = await bcrypt.hash('harry141312', 12)
      await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)`,
        ['Hariyadi', ownerEmail, passwordHash]
      )
      fastify.log.info('👤 Owner account (pharyyady@gmail.com) seeded successfully')
    }
  } catch (err) {
    fastify.log.error(err, '❌ Database migration failed:')
    throw err
  } finally {
    client.release()
  }
}, {
  name: 'database',
})
