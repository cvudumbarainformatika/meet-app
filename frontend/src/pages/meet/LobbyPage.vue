<template>
  <!-- =========================================================
    LobbyPage — Halaman utama: welcome/join/buat room meeting
    Design: Dark glass morphism, animated blobs, modern layout
  ========================================================= -->
  <div class="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-200">
    
    <!-- Animated Background Blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>
    <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px] animate-blob animation-delay-4000 mix-blend-screen pointer-events-none"></div>

    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 border-b border-white/5 relative z-10 bg-slate-950/50 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Video class="h-5 w-5 text-white" />
        </div>
        <span class="text-white font-bold text-lg tracking-tight">MeetApp</span>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="auth.isLoggedIn" class="text-slate-400 text-sm hidden sm:block">
          Hai, <span class="text-white font-medium">{{ auth.user?.name }}</span>
        </span>
        <button
          v-if="auth.isLoggedIn"
          @click="handleLogout"
          class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all"
        >
          Keluar
        </button>
        <RouterLink
          v-else
          :to="{ path: '/login', query: $route.query }"
          class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
        >
          Masuk
        </RouterLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 w-full overflow-y-auto">
      <div class="w-full max-w-5xl flex flex-col items-center">

        <!-- Welcome View (Not Logged In) -->
        <div v-if="!auth.isLoggedIn" class="text-center max-w-2xl mx-auto animate-fade-in-up mt-10">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Meeting Open-Source
          </div>
          
          <h1 class="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-6 leading-tight">
            Komunikasi Tanpa Batas Ruang
          </h1>
          
          <p class="text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed">
            Bergabunglah dengan pengalaman meeting yang cepat, aman, dan privasi penuh. Buat room Anda sendiri atau bergabung ke meeting yang sudah ada.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RouterLink
              :to="{ path: '/login', query: $route.query }"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              Mulai Sekarang
              <ArrowRight class="h-5 w-5" />
            </RouterLink>
            <RouterLink
              :to="{ path: '/register', query: $route.query }"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-lg border border-white/10 transition-all flex items-center justify-center hover:-translate-y-0.5"
            >
              Buat Akun Gratis
            </RouterLink>
          </div>
        </div>

        <!-- Dashboard View (Logged In) -->
        <div v-else class="w-full animate-fade-in-up mt-6 sm:mt-0">
          
          <!-- Tab Navigation -->
          <div class="flex justify-center mb-8">
            <div class="bg-slate-900/50 p-1.5 rounded-2xl flex items-center gap-1 border border-white/5">
              <button 
                @click="activeTab = 'meeting'"
                :class="activeTab === 'meeting' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
                class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Video class="h-4 w-4" /> Mulai Meeting
              </button>
              <button 
                @click="activeTab = 'admin'"
                :class="activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
                class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <LayoutDashboard class="h-4 w-4" /> Administrasi
              </button>
            </div>
          </div>

          <!-- TAB 1: Mulai Meeting -->
          <div v-if="activeTab === 'meeting'" class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <!-- Card: Join Room -->
            <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-indigo-500/40 transition-all duration-300 group shadow-2xl shadow-black/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-4 mb-8">
                  <div class="h-12 w-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <LogIn class="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 class="text-white font-bold text-xl">Gabung Room</h2>
                    <p class="text-slate-400 text-sm mt-0.5">Punya kode undangan?</p>
                  </div>
                </div>

                <form @submit.prevent="handleJoinRoom" class="space-y-5">
                  <div class="group/input">
                    <label class="text-slate-400 text-xs font-bold mb-2 block uppercase tracking-wider">Kode / Slug Room</label>
                    <div class="relative">
                      <input
                        v-model="joinForm.slug"
                        type="text"
                        placeholder="contoh: meeting-tim-alpha"
                        class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div v-if="joinForm.showPassword" class="animate-fade-in-up">
                    <label class="text-slate-400 text-xs font-bold mb-2 block uppercase tracking-wider">Password Room</label>
                    <input
                      v-model="joinForm.password"
                      type="password"
                      placeholder="Masukkan password..."
                      class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    :disabled="joining"
                    class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:shadow-indigo-600/40"
                  >
                    <Loader2 v-if="joining" class="h-5 w-5 animate-spin" />
                    <ArrowRight v-else class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    {{ joining ? 'Menghubungkan...' : 'Gabung Sekarang' }}
                  </button>
                </form>
              </div>
            </div>

            <!-- Card: Create Room -->
            <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-emerald-500/40 transition-all duration-300 group shadow-2xl shadow-black/20 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-4 mb-8">
                  <div class="h-12 w-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus class="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 class="text-white font-bold text-xl">Buat Room Baru</h2>
                    <p class="text-slate-400 text-sm mt-0.5">Mulai meeting baru</p>
                  </div>
                </div>

                <form @submit.prevent="handleCreateRoom" class="space-y-5">
                  <div>
                    <label class="text-slate-400 text-xs font-bold mb-2 block uppercase tracking-wider">Nama / Topik Room</label>
                    <input
                      v-model="createForm.name"
                      type="text"
                      placeholder="contoh: Standup Harian"
                      class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label class="text-slate-400 text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                      Password
                      <span class="normal-case text-slate-500 font-normal bg-white/5 px-2 py-0.5 rounded text-[10px]">Opsional</span>
                    </label>
                    <input
                      v-model="createForm.password"
                      type="password"
                      placeholder="Biarkan kosong jika publik"
                      class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    :disabled="creating"
                    class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group-hover:shadow-emerald-600/40"
                  >
                    <Loader2 v-if="creating" class="h-5 w-5 animate-spin" />
                    <Plus v-else class="h-5 w-5" />
                    {{ creating ? 'Membuat Room...' : 'Mulai Meeting' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- TAB 2: Administrasi -->
          <div v-if="activeTab === 'admin'" class="w-full max-w-5xl mx-auto space-y-6">
            
            <!-- Rooms List -->
            <div class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <DoorOpen class="h-5 w-5 text-indigo-400" /> Daftar Room Anda
                  </h3>
                  <p class="text-sm text-slate-400">Kode/slug room yang pernah Anda buat</p>
                </div>
                <button @click="fetchAdminData" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                  <RefreshCw class="h-4 w-4" :class="{'animate-spin': loadingAdmin}" />
                </button>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                  <thead class="bg-white/5 text-slate-400 uppercase text-xs">
                    <tr>
                      <th class="px-4 py-3 rounded-l-lg">Nama Room</th>
                      <th class="px-4 py-3">Slug (Kode)</th>
                      <th class="px-4 py-3">Privasi</th>
                      <th class="px-4 py-3">Total Sesi</th>
                      <th class="px-4 py-3 rounded-r-lg">Rekor Peserta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingAdmin" class="animate-pulse">
                      <td colspan="5" class="px-4 py-4 text-center text-slate-500">Memuat data...</td>
                    </tr>
                    <tr v-else-if="myRooms.length === 0">
                      <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                        Anda belum pernah membuat room.
                      </td>
                    </tr>
                    <tr v-for="room in myRooms" :key="room.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td class="px-4 py-3 font-medium text-white">{{ room.name }}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <code class="bg-black/30 px-2 py-1 rounded text-indigo-300">{{ room.slug }}</code>
                          <button @click="copySlug(room.slug)" class="text-slate-500 hover:text-white" title="Salin Slug">
                            <Copy class="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span v-if="room.is_locked" class="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                          <Lock class="h-3 w-3" /> Password
                        </span>
                        <span v-else class="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          <Globe class="h-3 w-3" /> Publik
                        </span>
                      </td>
                      <td class="px-4 py-3">{{ room.total_sessions }} kali</td>
                      <td class="px-4 py-3">{{ room.max_participants_ever }} orang</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Meeting History / Sessions -->
            <div class="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <History class="h-5 w-5 text-emerald-400" /> Riwayat Sesi Rapat
                  </h3>
                  <p class="text-sm text-slate-400">Log waktu, durasi, dan notulen rapat</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                  <thead class="bg-white/5 text-slate-400 uppercase text-xs">
                    <tr>
                      <th class="px-4 py-3 rounded-l-lg">Waktu Mulai</th>
                      <th class="px-4 py-3">Room</th>
                      <th class="px-4 py-3">Peserta</th>
                      <th class="px-4 py-3">Durasi</th>
                      <th class="px-4 py-3 text-right rounded-r-lg">Notulen</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingAdmin" class="animate-pulse">
                      <td colspan="5" class="px-4 py-4 text-center text-slate-500">Memuat data...</td>
                    </tr>
                    <tr v-else-if="mySessions.length === 0">
                      <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                        Belum ada riwayat sesi rapat.
                      </td>
                    </tr>
                    <tr v-for="session in mySessions" :key="session.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td class="px-4 py-3">
                        <div class="font-medium text-white">{{ formatDate(session.started_at) }}</div>
                        <div class="text-xs text-slate-500">{{ formatTime(session.started_at) }}</div>
                      </td>
                      <td class="px-4 py-3">{{ session.room_name }}</td>
                      <td class="px-4 py-3">{{ session.participant_count }} orang</td>
                      <td class="px-4 py-3">
                        <span v-if="session.ended_at" class="text-slate-300">
                          {{ calculateDuration(session.started_at, session.ended_at) }}
                        </span>
                        <span v-else class="text-emerald-400 text-xs animate-pulse flex items-center gap-1">
                          <div class="h-1.5 w-1.5 rounded-full bg-emerald-400"></div> Berjalan
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button 
                          @click="openNotesDialog(session)"
                          class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors"
                        >
                          {{ session.notes ? 'Lihat/Edit Notulen' : '+ Tulis Notulen' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>

    <!-- Error Toast -->
    <Transition name="fade-slide-up">
      <div
        v-if="errorMsg"
        class="fixed bottom-6 right-6 z-50 bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4 rounded-xl text-sm flex items-center gap-3 shadow-2xl backdrop-blur-md"
      >
        <AlertCircle class="h-5 w-5 flex-shrink-0" />
        <span class="font-medium">{{ errorMsg }}</span>
        <button @click="errorMsg = ''" class="ml-2 text-red-400 hover:text-red-200 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>

    <!-- Modal Notulen -->
    <Transition name="fade">
      <div v-if="showNotesDialog" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" @click.stop>
          <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <FileText class="h-5 w-5 text-indigo-400" />
              Notulen Rapat
            </h3>
            <button @click="showNotesDialog = false" class="text-slate-400 hover:text-white">
              <X class="h-5 w-5" />
            </button>
          </div>
          
          <div class="p-6 flex-1">
            <div class="mb-4 text-sm text-slate-400">
              Menulis notulen untuk sesi <strong class="text-slate-200">{{ selectedSession?.room_name }}</strong> 
              pada {{ formatDate(selectedSession?.started_at) }}
            </div>
            <textarea
              v-model="notesContent"
              rows="8"
              class="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              placeholder="Tuliskan catatan, keputusan, atau poin penting rapat di sini..."
            ></textarea>
          </div>

          <div class="px-6 py-4 border-t border-white/5 bg-slate-800/50 flex justify-end gap-3">
            <button 
              @click="showNotesDialog = false"
              class="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
              Batal
            </button>
            <button 
              @click="saveNotes"
              :disabled="savingNotes"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-all flex items-center gap-2"
            >
              <Loader2 v-if="savingNotes" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              Simpan Notulen
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Video, LogIn, Plus, ArrowRight, Loader2, AlertCircle, X, 
  LayoutDashboard, DoorOpen, History, RefreshCw, Copy, Lock, Globe,
  FileText, Save
} from 'lucide-vue-next'
import { api as axios } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import { useMeetStore } from '@/stores/meet'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const meetStore = useMeetStore()

// --- State ---
const joining = ref(false)
const creating = ref(false)
const errorMsg = ref('')

const joinForm = ref({ slug: '', password: '', showPassword: false })
const createForm = ref({ name: '', password: '' })

// Admin State
const activeTab = ref('meeting') // 'meeting' | 'admin'
const loadingAdmin = ref(false)
const myRooms = ref([])
const mySessions = ref([])

// Notes State
const showNotesDialog = ref(false)
const selectedSession = ref(null)
const notesContent = ref('')
const savingNotes = ref(false)

onMounted(() => {
  if (route.query.join) {
    joinForm.value.slug = route.query.join
    // Jika sudah login, coba langsung gabung (auto-join)
    if (auth.isLoggedIn) {
      handleJoinRoom()
    }
  }
})

// Fetch admin data on mount or when tab changes
watch(activeTab, (val) => {
  if (val === 'admin' && myRooms.value.length === 0) {
    fetchAdminData()
  }
})

// Auto-ekstrak slug jika user mem-paste full URL ke dalam input
watch(() => joinForm.value.slug, (newVal) => {
  if (!newVal) return
  if (newVal.includes('?join=')) {
    const match = newVal.match(/[?&]join=([^&]+)/)
    if (match && match[1]) {
      joinForm.value.slug = match[1]
    }
  } else if (newVal.startsWith('http')) {
    // Kalau link berformat domain.com/room/slug
    const parts = newVal.split('/')
    const lastPart = parts.pop()
    if (lastPart) {
      joinForm.value.slug = lastPart.split('?')[0]
    }
  }
})

async function fetchAdminData() {
  if (!auth.isLoggedIn) return
  loadingAdmin.value = true
  try {
    const [roomsRes, sessionsRes] = await Promise.all([
      axios.get('/api/meetings/my-rooms'),
      axios.get('/api/meetings/history?page=1&perPage=50')
    ])
    
    if (roomsRes.data.success) {
      myRooms.value = roomsRes.data.data
    }
    if (sessionsRes.data.success) {
      mySessions.value = sessionsRes.data.data
    }
  } catch (err) {
    console.error('Failed to fetch admin data', err)
  } finally {
    loadingAdmin.value = false
  }
}

// Helpers
function copySlug(slug) {
  navigator.clipboard.writeText(slug)
  alert('Slug tersalin: ' + slug)
}

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

// Notes Logic
function openNotesDialog(session) {
  selectedSession.value = session
  notesContent.value = session.notes || ''
  showNotesDialog.value = true
}

async function saveNotes() {
  if (!selectedSession.value) return
  savingNotes.value = true
  try {
    const res = await axios.put(`/api/meetings/${selectedSession.value.id}/notes`, {
      notes: notesContent.value
    })
    if (res.data.success) {
      // Update local state
      const idx = mySessions.value.findIndex(s => s.id === selectedSession.value.id)
      if (idx !== -1) {
        mySessions.value[idx].notes = notesContent.value
      }
      showNotesDialog.value = false
    }
  } catch (err) {
    alert('Gagal menyimpan notulen')
  } finally {
    savingNotes.value = false
  }
}

// --- Join Room ---
async function handleJoinRoom() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  joining.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('/api/tokens/join', {
      room_slug: joinForm.value.slug.trim(),
      password: joinForm.value.password || undefined,
    })
    if (res.data.success) {
      const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || res.data.data.livekit_url
      meetStore.setRoom(res.data.data.room, res.data.data.token, publicLiveKitUrl, res.data.data.is_host)
      router.push(`/room/${joinForm.value.slug.trim()}`)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Gagal bergabung ke room'
    joinForm.value.showPassword = err.response?.status === 403
  } finally {
    joining.value = false
  }
}

// --- Create Room ---
async function handleCreateRoom() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  creating.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('/api/rooms', {
      name: createForm.value.name.trim(),
      password: createForm.value.password || undefined,
    })
    if (res.data.success) {
      const slug = res.data.data.slug
      // Auto join setelah buat (sertakan password jika ada)
      const tokenRes = await axios.post('/api/tokens/join', { 
        room_slug: slug,
        password: createForm.value.password || undefined
      })
      if (tokenRes.data.success) {
        const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || tokenRes.data.data.livekit_url
        meetStore.setRoom(tokenRes.data.data.room, tokenRes.data.data.token, publicLiveKitUrl, true)
        router.push(`/room/${slug}`)
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Gagal membuat room'
  } finally {
    creating.value = false
  }
}

function handleLogout() {
  auth.logout()
}
</script>

<style>
/* Custom animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
