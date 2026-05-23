# 📋 MeetApp — Standard Operating Procedures (SOP)

> Dokumen ini adalah panduan wajib untuk seluruh developer yang bekerja pada project MeetApp.

---

## 1. Setup Awal (Pertama Kali)

### 1.1 Clone & Setup Environment

```bash
# Clone project
git clone <repo-url>
cd meet

# Salin template env dan isi nilai yang sesuai
cp .env.example .env
```

### 1.2 Edit `.env` Minimal Ini:

```bash
# Wajib diganti di production:
APP_SECRET=             # min 32 karakter, random
JWT_SECRET=             # min 32 karakter, random
POSTGRES_PASSWORD=      # password database
LIVEKIT_API_SECRET=     # min 32 karakter, untuk LiveKit
TURN_PASSWORD=          # password TURN server
```

### 1.3 Jalankan Stack (Development)

```bash
# Start semua service dengan hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Atau jika sudah pernah di-build:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 1.4 Jalankan Stack (Production)

```bash
docker compose up --build -d
```

---

## 2. Struktur Direktori & Prinsip Modular

```
meet/
├── services/
│   ├── livekit/        # [MODULE] Konfigurasi LiveKit Server
│   ├── coturn/         # [MODULE] Konfigurasi TURN Server
│   └── api/            # [MODULE] Backend API (Fastify)
│       └── src/
│           ├── config/         # Environment & konfigurasi
│           ├── modules/        # ⭐ SATU FOLDER = SATU FITUR
│           │   ├── auth/
│           │   ├── rooms/
│           │   └── tokens/
│           ├── plugins/        # Koneksi DB, Redis, dsb
│           └── shared/         # Types & utilities bersama
├── frontend/           # [MODULE] Quasar Frontend
│   └── src/
│       ├── pages/
│       │   ├── meet/           # ⭐ Pages meeting
│       │   └── auth/           # ⭐ Pages autentikasi
│       ├── components/
│       │   └── meet/           # ⭐ Komponen meeting
│       ├── composables/        # ⭐ Logic reusable (useRoom, dll)
│       └── stores/             # ⭐ State management (Pinia)
└── nginx/              # [MODULE] Reverse proxy config
```

### Prinsip Modular yang WAJIB Diikuti:

> ⭐ **Satu modul = satu tanggung jawab**

1. **Tambah fitur backend baru** → buat folder di `services/api/src/modules/<nama>/`
2. **Tambah halaman frontend baru** → buat di `frontend/src/pages/<kategori>/`
3. **Logic yang dipakai di banyak tempat** → taruh di `composables/` atau `shared/`
4. **Jangan taruh business logic di route handler** → selalu pisahkan ke `*.service.ts`

---

## 3. Cara Menambah Modul Backend Baru

### Contoh: Menambah modul `recordings`

```bash
mkdir services/api/src/modules/recordings
```

Buat 3 file wajib:

```
recordings/
├── recordings.routes.ts    # HTTP handler (validasi input, panggil service)
├── recordings.service.ts   # Business logic (query DB, panggil LiveKit, dll)
└── recordings.schema.ts    # Zod schema validasi (opsional tapi dianjurkan)
```

Register di `src/index.ts`:

```typescript
import recordingsRoutes from './modules/recordings/recordings.routes.js'
await fastify.register(recordingsRoutes, { prefix: '/api/recordings' })
```

---

## 4. Cara Menambah Halaman Frontend Baru

### Contoh: Menambah halaman Settings

```bash
mkdir frontend/src/pages/settings
touch frontend/src/pages/settings/SettingsPage.vue
```

Register di `router/routes.js`:

```javascript
{
  path: '/settings',
  component: () => import('@/pages/settings/SettingsPage.vue'),
  meta: { title: 'Pengaturan', requiresAuth: true },
},
```

---

## 5. Git Workflow

```bash
# Buat branch dari main
git checkout -b feature/<nama-fitur>

# Commit dengan prefix yang jelas:
# feat:   fitur baru
# fix:    perbaikan bug
# docs:   perubahan dokumentasi
# refactor: refactoring tanpa perubahan fungsi
# chore:  maintenance

git commit -m "feat(rooms): tambah fitur password-protected room"

# Push & buat Pull Request ke main
git push origin feature/<nama-fitur>
```

---

## 6. API Endpoints Reference

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Info user saat ini |
| GET | `/api/rooms` | ❌ | List semua room |
| POST | `/api/rooms` | ✅ | Buat room baru |
| GET | `/api/rooms/:slug` | ❌ | Detail room |
| DELETE | `/api/rooms/:id` | ✅ | Hapus room (host only) |
| POST | `/api/tokens/join` | ✅ | Join room → dapat LiveKit token |
| GET | `/api/tokens/participants/:slug` | ✅ | List participant aktif |

---

## 7. Port Reference

| Service | Port | Akses |
|---------|------|-------|
| Nginx (entry point) | **80** | Public |
| LiveKit WS | 7880 | Via Nginx `/livekit` |
| LiveKit WebRTC TCP | 7881 | Direct (firewall buka) |
| LiveKit WebRTC UDP | 7882 | Direct (firewall buka) |
| TURN TCP/UDP | 3478 | Direct |
| TURNS (TLS) | 5349 | Direct |
| PostgreSQL | 5433 (dev only) | Internal |
| Redis | 6380 (dev only) | Internal |

---

## 8. Troubleshooting

### WebRTC tidak terkoneksi?
1. Pastikan port UDP 7882 terbuka di firewall server
2. Cek TURN server: `turnutils_uclient -T -u meetapp -W turnpass <IP>:3478`
3. Lihat log LiveKit: `docker compose logs livekit -f`

### Video tidak muncul di browser lain (NAT)?
- Pastikan `relay-ip` dan `external-ip` di `coturn/turnserver.conf` diisi dengan IP publik server

### Database error saat startup?
```bash
# Reset database
docker compose down -v
docker compose up postgres -d
docker compose up api
```

### Frontend tidak bisa hit API?
- Pastikan Nginx running: `docker compose ps`
- Cek proxy: `curl http://localhost/api/health`

---

## 9. Deployment Production Checklist

- [ ] Ganti semua secrets di `.env` (bukan nilai default)
- [ ] Set `APP_ENV=production`
- [ ] Isi `relay-ip` dan `external-ip` di `turnserver.conf` dengan IP publik
- [ ] Buka port di firewall: 80, 443, 7881 (TCP), 7882 (UDP), 3478 (UDP/TCP)
- [ ] Setup SSL (Certbot/Traefik) untuk production WebRTC
- [ ] Backup database secara berkala

---

*Dokumen ini harus diupdate setiap kali ada perubahan arsitektur signifikan.*
