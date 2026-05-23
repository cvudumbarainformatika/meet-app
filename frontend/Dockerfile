# =============================================================
# frontend/Dockerfile — Production (Quasar build → Nginx)
# =============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Quasar SPA
RUN npm run build

# =============================================================
# Production Image — Nginx serve static files
# =============================================================
FROM nginx:alpine AS runner

# Copy built SPA
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Custom nginx config untuk SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
