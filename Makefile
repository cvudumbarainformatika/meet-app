.PHONY: help up down restart logs build ps clean dev-up dev-down dev-logs api-dev front-dev

# ==============================================================================
# BANTUAN
# ==============================================================================
help: ## Menampilkan panduan Makefile ini
	@echo "Perintah yang tersedia:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ==============================================================================
# DOCKER PRODUCTION / FULL STACK
# ==============================================================================
up: ## Menjalankan seluruh kontainer (Production) di background
	docker compose up -d

down: ## Mematikan dan menghapus kontainer (Production)
	docker compose down

restart: ## Merestart seluruh kontainer
	docker compose restart

logs: ## Melihat log semua kontainer secara realtime
	docker compose logs -f

build: ## Membangun ulang image Docker jika ada perubahan (API/Frontend)
	docker compose build

ps: ## Melihat status kontainer yang sedang berjalan
	docker compose ps

clean: ## Mematikan kontainer dan menghapus SEMUA volume data (Awas data hilang!)
	docker compose down -v

# ==============================================================================
# DOCKER DEVELOPMENT (Hanya Service Infrastruktur)
# ==============================================================================
# Mode dev: Hanya menjalankan Postgres, Redis, Coturn, dan LiveKit.
# API dan Frontend dijalankan secara native menggunakan npm run dev di terminal terpisah.

dev-up: ## Menjalankan infrastruktur untuk development (DB, Redis, LiveKit, dll)
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

dev-down: ## Mematikan infrastruktur development
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs: ## Melihat log infrastruktur development
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# ==============================================================================
# LOCAL DEVELOPMENT (Node.js & Frontend)
# ==============================================================================
api-dev: ## Menjalankan Backend API dalam mode watch (Development)
	@echo "Menjalankan Backend API..."
	cd services/api && npm install && npm run dev

front-dev: ## Menjalankan Frontend Vue/Quasar dalam mode watch (Development)
	@echo "Menjalankan Frontend..."
	cd frontend && npm install && npm run dev
