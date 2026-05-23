# 🎙️ MeetApp

> Platform meeting video call open-source berbasis **LiveKit** + **Quasar** — Self-hosted, Dockerized, Modular.

---

## ✨ Fitur

- 🎥 Video call multi-participant (WebRTC via LiveKit SFU)
- 🎙️ Audio conferencing dengan mute/unmute
- 🖥️ Screen sharing
- 💬 Text chat real-time (LiveKit Data Channel)
- 🔐 Room password-protected
- 📌 Pin participant
- 🌐 Fully self-hosted & open-source
- 🐳 Docker Compose ready

---

## 🚀 Quickstart

```bash
# 1. Clone & setup
git clone <repo-url> && cd meet

# 2. Setup environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# 3. Jalankan semua service
docker compose up --build -d

# 4. Buka browser
open http://localhost
```

---

## 📐 Arsitektur

```
Browser → Nginx (80) → Frontend (Quasar)
                     → Backend API (Fastify)
                     → LiveKit (WebRTC)
LiveKit → Coturn (TURN/STUN untuk NAT traversal)
API → PostgreSQL + Redis
```

---

## 📁 Struktur

| Path | Deskripsi |
|------|-----------|
| `services/livekit/` | LiveKit Server config |
| `services/coturn/` | TURN Server config |
| `services/api/` | Backend API (Fastify + TypeScript) |
| `frontend/` | Frontend (Quasar + Vue 3 + Tailwind) |
| `nginx/` | Reverse proxy |
| `SOP.md` | Standard Operating Procedures |

---

## 📖 Dokumentasi

Lihat [SOP.md](./SOP.md) untuk panduan lengkap:
- Setup environment
- Cara menambah modul baru
- Git workflow
- API reference
- Troubleshooting

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Media Server | LiveKit (SFU WebRTC) |
| TURN | Coturn |
| Frontend | Quasar + Vue 3 + Tailwind CSS |
| Backend | Fastify + Node.js + TypeScript |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Proxy | Nginx |
| Container | Docker Compose |

## ⚠️ Yang Perlu Diperhatikan Selanjutnya (Next Steps)

1. **Install Dependencies Frontend**:
   Karena baru saja menambahkan SDK LiveKit, jika Anda menjalankan environment tanpa docker untuk testing, jalankan:
   ```bash
   cd frontend
   npm install
   ```
2. **Setup IP Publik (Jika deploy ke server/production)**:
   Buka file `services/coturn/turnserver.conf`, uncomment dan isi `relay-ip` serta `external-ip` dengan IP Publik server Anda agar WebRTC bisa tembus NAT/Firewall.
3. **Buka Port Firewall Server**:
   Pastikan port berikut terbuka di server production Anda:
   - `80` (HTTP), `443` (HTTPS)
   - `7881` (TCP) - WebRTC LiveKit
   - `7882` (UDP) - WebRTC LiveKit
   - `3478` (TCP/UDP) - TURN Server Coturn
   - `5349` (TLS) - TURNS Coturn

---

## 📜 Lisensi

MIT — Open source, bebas digunakan dan dimodifikasi.
