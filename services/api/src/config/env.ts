// =============================================================
// services/api/src/config/env.ts
// Environment variable loader & validator
// =============================================================

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(`❌ Missing required environment variable: ${key}`)
  }
  return value
}

export const config = {
  app: {
    env: getEnv('APP_ENV', 'development'),
    secret: getEnv('APP_SECRET', 'changeme_secret_panjang_minimal_32karakter'),
    port: parseInt(getEnv('API_PORT', '3000'), 10),
  },
  jwt: {
    secret: getEnv('JWT_SECRET', 'jwt_secret_panjang_minimal_32karakter'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  },
  database: {
    host: getEnv('POSTGRES_HOST', 'localhost'),
    port: parseInt(getEnv('POSTGRES_PORT', '5432'), 10),
    database: getEnv('POSTGRES_DB', 'meetapp'),
    user: getEnv('POSTGRES_USER', 'meetapp'),
    password: getEnv('POSTGRES_PASSWORD', 'meetapp_pass'),
  },
  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: parseInt(getEnv('REDIS_PORT', '6379'), 10),
    password: getEnv('REDIS_PASSWORD', '') || undefined,
  },
  livekit: {
    host: getEnv('LIVEKIT_HOST', 'localhost'),
    port: parseInt(getEnv('LIVEKIT_PORT', '7880'), 10),
    apiKey: getEnv('LIVEKIT_API_KEY', 'devkey'),
    apiSecret: getEnv('LIVEKIT_API_SECRET', 'devsecret_panjang_minimal_32karakter'),
    get wsUrl() {
      return `ws://${this.host}:${this.port}`
    },
  },
  isDev: getEnv('APP_ENV', 'development') === 'development',
}
