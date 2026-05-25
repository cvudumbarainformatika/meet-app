<template>
  <div class="w-full max-w-5xl mx-auto">
    <!-- Meeting History / Sessions Card -->
    <div class="bg-card border border-border rounded-3xl p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-foreground flex items-center gap-2">
            <History class="h-5 w-5 text-success" /> Riwayat Sesi Rapat
          </h3>
          <p class="text-sm text-muted-foreground text-left">Log waktu, durasi, dan notulen rapat</p>
        </div>

        <!-- Filter Dropdown Room -->
        <div class="flex items-center gap-3 justify-end shrink-0">
          <div class="flex items-center gap-2">
            <Filter class="h-4 w-4 text-muted-foreground" />
            <select 
              v-model="selectedRoom"
              class="bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
            >
              <option value="">Semua Room</option>
              <option v-for="room in rooms" :key="room.id" :value="room.name">
                {{ room.name }}
              </option>
            </select>
          </div>
          
          <button 
            @click="emit('refresh')" 
            class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
            title="Refresh data"
          >
            <RefreshCw class="h-4 w-4" :class="{'animate-spin': loading}" />
          </button>
        </div>
      </div>

      <!-- Filter Active Badge -->
      <div v-if="selectedRoom" class="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl text-xs text-primary max-w-fit mb-5 animate-fade-in-up">
        <span>Menampilkan sesi untuk room: <strong>{{ selectedRoom }}</strong></span>
        <button @click="selectedRoom = ''" class="hover:text-foreground text-primary/60 transition-colors p-0.5 rounded" title="Hapus filter">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Table Sesi Rapat -->
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left text-sm text-muted-foreground min-w-[600px]">
          <thead class="bg-white/5 text-muted-foreground uppercase text-xs">
            <tr>
              <th class="px-4 py-3 rounded-l-lg">Waktu Mulai</th>
              <th class="px-4 py-3">Room</th>
              <th class="px-4 py-3">Peserta</th>
              <th class="px-4 py-3">Durasi</th>
              <th class="px-4 py-3 text-right rounded-r-lg">Notulen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-4 py-4 text-center text-muted-foreground">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredSessions.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                Belum ada riwayat sesi rapat{{ selectedRoom ? ' untuk room ini' : '' }}.
              </td>
            </tr>
            <tr v-for="session in paginatedSessions" :key="session.id" class="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <div class="font-medium text-foreground">{{ formatDate(session.started_at) }}</div>
                <div class="text-xs text-muted-foreground">{{ formatTime(session.started_at) }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="font-semibold text-foreground bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  {{ session.room_name }}
                </span>
              </td>
              <td class="px-4 py-3">{{ session.participant_count }} orang</td>
              <td class="px-4 py-3">
                <span v-if="session.ended_at" class="text-foreground font-medium">
                  {{ calculateDuration(session.started_at, session.ended_at) }}
                </span>
                <span v-else class="text-success text-xs flex flex-wrap items-center gap-2 font-semibold">
                  <span class="animate-pulse flex items-center gap-1 shrink-0">
                    <div class="h-2 w-2 rounded-full bg-success"></div> Berjalan
                  </span>
                  <div class="flex items-center gap-1.5">
                    <button 
                      @click="emit('join-active-room', session.room_slug)"
                      class="px-2 py-0.5 rounded bg-success/20 hover:bg-success/35 text-[10px] text-success transition-all font-bold tracking-wide flex items-center gap-0.5 border border-success/30 cursor-pointer"
                      title="Gabung kembali ke room aktif ini"
                    >
                      Masuk
                    </button>
                    <button 
                      @click="emit('end-active-session', session.id)"
                      class="px-2 py-0.5 rounded bg-destructive/10 hover:bg-destructive/20 text-[10px] text-destructive transition-all font-bold tracking-wide flex items-center gap-0.5 border border-destructive/20 cursor-pointer"
                      title="Akhiri sesi rapat ini secara paksa langsung dari sini"
                    >
                      Akhiri
                    </button>
                  </div>
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button 
                  v-if="session.notes"
                  @click="emit('open-notes', session)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-semibold hover:bg-success/20 transition-all cursor-pointer ml-auto"
                  title="Lihat atau edit notulen rapat ini"
                >
                  <FileText class="h-3.5 w-3.5" />
                  <span>Lihat/Edit Notulen</span>
                </button>
                <button 
                  v-else
                  @click="emit('open-notes', session)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer ml-auto"
                  title="Tulis notulen rapat baru untuk sesi ini"
                >
                  <Plus class="h-3.5 w-3.5" />
                  <span>Tulis Notulen</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-border/40 pt-4 animate-fade-in-up">
        <span class="text-xs text-muted-foreground font-medium">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredSessions.length) }} dari {{ filteredSessions.length }} sesi
        </span>
        <div class="flex items-center gap-2">
          <!-- First Page -->
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="h-9 w-9 rounded-xl border border-border bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
            title="Halaman Pertama"
          >
            <ChevronsLeft class="h-3.5 w-3.5" />
          </button>

          <!-- Previous Page -->
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="h-9 px-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Sebelumnya</span>
          </button>

          <!-- Current Page Info -->
          <div class="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold tracking-wide shrink-0">
            {{ currentPage }} / {{ totalPages }}
          </div>

          <!-- Next Page -->
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="h-9 px-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            <span class="hidden sm:inline">Selanjutnya</span>
            <ChevronRight class="h-3.5 w-3.5" />
          </button>

          <!-- Last Page -->
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="h-9 w-9 rounded-xl border border-border bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 transition-all text-xs font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
            title="Halaman Terakhir"
          >
            <ChevronsRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { History, RefreshCw, Filter, X, Plus, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps({
  sessions: Array,
  rooms: Array,
  loading: Boolean,
  filterRoomName: String
})

const emit = defineEmits(['refresh', 'open-notes', 'update:filterRoomName', 'join-active-room', 'end-active-session'])

const selectedRoom = ref(props.filterRoomName || '')

// Sinkronisasi jika nilai prop berubah dari luar
watch(() => props.filterRoomName, (newVal) => {
  selectedRoom.value = newVal || ''
})

// Sinkronisasi ke luar jika filter berubah di dalam select
watch(selectedRoom, (newVal) => {
  emit('update:filterRoomName', newVal)
})

const filteredSessions = computed(() => {
  if (!selectedRoom.value) return props.sessions
  return props.sessions.filter(s => s.room_name.toLowerCase() === selectedRoom.value.toLowerCase())
})

// --- Pagination Logic ---
const currentPage = ref(1)
const itemsPerPage = 8

const totalPages = computed(() => {
  return Math.ceil(filteredSessions.value.length / itemsPerPage) || 1
})

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredSessions.value.slice(start, start + itemsPerPage)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Reset halaman ke 1 jika filter berubah
watch(selectedRoom, () => {
  currentPage.value = 1
})

watch(() => props.sessions, () => {
  currentPage.value = 1
})

function formatDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(isoDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(isoDate) {
  if (!isoDate) return '-'
  return new Date(isoDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function calculateDuration(start, end) {
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 60) return `${mins} mnt`
  const hrs = Math.floor(mins / 60)
  const rm = mins % 60
  return `${hrs}j ${rm}m`
}
</script>
