<template>
  <!-- =========================================================
    LobbyPage — Halaman utama: welcome/join/buat room meeting
    Design: Premium Discord-Style Layout (Sidebar + Pinned Profile)
    Refactored to Modular Clean Architecture & Premium Aesthetics
  ========================================================= -->
  <div class="min-h-screen bg-background flex relative overflow-hidden text-foreground w-full">
    
    <!-- Animated Background Blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>
    <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-success/10 blur-[100px] animate-blob animation-delay-4000 mix-blend-screen pointer-events-none"></div>

    <!-- ── KONDISI 1: BELUM LOGIN (Welcome View Full Screen) ── -->
    <div v-if="!auth.isLoggedIn" class="flex-1 flex flex-col min-h-screen relative z-10">
      <!-- Welcome Header -->
      <header class="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Video class="h-5 w-5 text-primary-foreground" />
          </div>
          <span class="text-foreground font-bold text-lg tracking-tight">{{ settingsStore.appName }}</span>
        </div>

        <div>
          <RouterLink
            :to="{ path: '/login', query: $route.query }"
            class="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all shadow-lg shadow-primary/20"
          >
            Masuk
          </RouterLink>
        </div>
      </header>

      <!-- Welcome Content -->
      <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 w-full overflow-y-auto">
        <div class="w-full max-w-5xl flex flex-col items-center">
          <LobbyWelcome />
        </div>
      </main>
    </div>

    <!-- ── KONDISI 2: SUDAH LOGIN (Discord-Style Layout dengan Sidebar & Profil) ── -->
    <template v-else>
      <!-- Tombol Hamburger untuk Mobile -->
      <button 
        @click="sidebarOpen = !sidebarOpen" 
        class="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-white/5 transition-all shadow-xl"
        title="Buka Menu"
      >
        <Menu class="h-5 w-5" />
      </button>

      <!-- Sidebar (Terinspirasi layout Discord SS3) -->
      <aside 
        :class="[
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'fixed md:static inset-y-0 left-0 w-72 bg-sidebar border-r border-border flex flex-col h-screen shrink-0 z-30 transition-transform duration-300 ease-in-out'
        ]"
      >
        <!-- Top Header Sidebar (Nama Server Rapat) -->
        <div class="px-5 py-4 border-b border-border flex items-center justify-between bg-sidebar">
          <div class="flex items-center gap-2.5 overflow-hidden w-full">
            <div class="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles class="h-4 w-4 text-primary" />
            </div>
            <span class="text-foreground font-black text-sm tracking-tight truncate uppercase leading-none m-0">
              {{ auth.user?.name ? `${auth.user.name}'s server` : `${settingsStore.appName} Server` }}
            </span>
          </div>
          <button 
            @click="sidebarOpen = false" 
            class="md:hidden p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- List Saluran / Navigasi (Menu & Room List) -->
        <div class="flex-1 overflow-y-auto p-3 space-y-6 select-none custom-scrollbar">
          <!-- Seksi Menu Utama -->
          <div class="space-y-1">
            <div class="px-3 mb-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-left">Menu Utama</div>
            
            <button 
              @click="activeTab = 'meeting'; sidebarOpen = false"
              :class="[
                activeTab === 'meeting' ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              ]"
              class="w-full px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 text-left group"
            >
              <Hash class="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>gabung-room</span>
            </button>

            <!-- Menu Daftar Room Terpisah -->
            <button 
              @click="selectRoomsTab"
              :class="[
                activeTab === 'rooms' ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              ]"
              class="w-full px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 text-left group"
            >
              <Hash class="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>daftar-room</span>
            </button>

            <!-- Menu Riwayat Sesi Terpisah -->
            <button 
              @click="selectHistoryTab"
              :class="[
                activeTab === 'history' ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              ]"
              class="w-full px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 text-left group"
            >
              <Hash class="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>riwayat-sesi</span>
            </button>

            <!-- Menu Kustomisasi Tema Khusus Owner pharyyady@gmail.com -->
            <button 
              v-if="auth.user?.email === 'pharyyady@gmail.com'"
              @click="activeTab = 'appearance'; sidebarOpen = false"
              :class="[
                activeTab === 'appearance' ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              ]"
              class="w-full px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 text-left group"
            >
              <Palette class="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-primary" />
              <span>kustomisasi-tema</span>
            </button>
          </div>

          <!-- Seksi Room Aktif (Discord Voice Channel Style) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between px-3 mb-1">
              <span class="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-left">Room Aktif Anda</span>
              <button 
                @click="openCreateRoomDialog"
                class="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-white/5" 
                title="Buat Room Baru"
              >
                <Plus class="h-3.5 w-3.5" />
              </button>
            </div>

            <!-- Loader / Empty State Room -->
            <div v-if="loadingAdmin && myRooms.length === 0" class="px-3 py-2 text-xs text-muted-foreground animate-pulse text-left">
              Memuat daftar room...
            </div>
            
            <div v-else-if="myRooms.length === 0" class="px-3 py-2.5 text-xs text-muted-foreground/50 italic text-left">
              Belum ada room dibuat.
            </div>

            <!-- Saluran Room Rapat -->
            <button 
              v-for="room in myRooms" 
              :key="room.id"
              @click="handleSelectSidebarRoom(room)"
              class="w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center justify-between text-left group"
            >
              <div class="flex items-center gap-2.5 overflow-hidden">
                <Volume2 class="h-4 w-4 shrink-0 text-success/80" />
                <span class="truncate">{{ room.name }}</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Lock v-if="room.is_locked" class="h-3 w-3 text-amber-400" />
                <Plus class="h-3.5 w-3.5 text-primary hover:scale-120 transition-all" title="Instan masuk ke room ini" />
              </div>
            </button>
          </div>
        </div>

        <!-- Profil Pengguna di Bawah Kiri (Discord Style Avatar Profile) -->
        <div class="p-3 border-t border-border bg-black/20 flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <!-- Avatar Bulat & Dot Hijau Aktif -->
            <div class="relative shrink-0 select-none">
              <div class="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-extrabold text-sm uppercase">
                {{ auth.user?.name ? auth.user.name[0] : 'U' }}
              </div>
              <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card"></div>
            </div>

            <!-- Detail Username -->
            <div class="flex flex-col overflow-hidden text-left">
              <span class="text-sm font-bold text-foreground truncate tracking-tight leading-tight">
                {{ auth.user?.name || 'User' }}
              </span>
              <span class="text-[10px] text-success/80 font-bold tracking-wider uppercase leading-none mt-1">
                Online
              </span>
            </div>
          </div>

          <!-- Aksi Kontrol Cepat -->
          <div class="flex items-center gap-0.5 shrink-0">
            <!-- Tombol Mic -->
            <button 
              @click="isMuted = !isMuted"
              :class="isMuted ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' : 'text-success hover:bg-white/5'"
              class="p-1.5 rounded-lg transition-colors cursor-pointer" 
              :title="isMuted ? 'Aktifkan Suara Mic (Unmute)' : 'Matikan Suara Mic (Mute)'"
            >
              <MicOff v-if="isMuted" class="h-4 w-4" />
              <Mic v-else class="h-4 w-4" />
            </button>

            <!-- Tombol Kamera -->
            <button 
              @click="isCameraOff = !isCameraOff"
              :class="isCameraOff ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' : 'text-success hover:bg-white/5'"
              class="p-1.5 rounded-lg transition-colors cursor-pointer" 
              :title="isCameraOff ? 'Aktifkan Kamera' : 'Matikan Kamera'"
            >
              <VideoOff v-if="isCameraOff" class="h-4 w-4" />
              <Video v-else class="h-4 w-4" />
            </button>

            <!-- Tombol Keluar (Logout) -->
            <button 
              @click="handleLogout" 
              class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer" 
              title="Keluar"
            >
              <LogOut class="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Area Konten Utama Rapat -->
      <main class="flex-1 flex flex-col h-screen overflow-y-auto bg-background relative z-10 w-full p-4 sm:p-8 pt-16 md:pt-8 custom-scrollbar">
        <div class="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center relative">
          
          <!-- TAB 1: Mulai Meeting (Hanya Menampilkan Gabung Room di Tengah) -->
          <div v-if="activeTab === 'meeting'" class="flex-1 flex items-center justify-center py-8">
            <LobbyMeetingTab
              v-model:joinForm="joinForm"
              :joining="joining"
              @join="handleJoinRoom"
            />
          </div>

          <!-- TAB 2: Daftar Room Anda -->
          <div v-else-if="activeTab === 'rooms'" class="w-full animate-fade-in-up py-4">
            <LobbyRoomsTab
              :rooms="myRooms"
              :loading="loadingAdmin"
              @refresh="fetchAdminData"
              @copy="copySlug"
              @create-room-clicked="openCreateRoomDialog"
              @view-history="handleViewRoomHistory"
            />
          </div>

          <!-- TAB 3: Riwayat Sesi Rapat -->
          <div v-else-if="activeTab === 'history'" class="w-full animate-fade-in-up py-4">
            <LobbyHistoryTab
              :sessions="mySessions"
              :rooms="myRooms"
              :loading="loadingAdmin"
              v-model:filterRoomName="filterRoomName"
              @refresh="fetchAdminData"
              @open-notes="openNotesDialog"
              @join-active-room="handleSelectSidebarRoomBySlug"
              @end-active-session="handleEndActiveSession"
            />
          </div>

          <!-- TAB 4: Kustomisasi Tema Global (Khusus Owner pharyyady@gmail.com) -->
          <div v-else-if="activeTab === 'appearance' && auth.user?.email === 'pharyyady@gmail.com'" class="w-full animate-fade-in-up py-4">
            <LobbyAppearanceTab />
          </div>

        </div>
      </main>
    </template>

    <!-- Overlay Background saat Sidebar Mobile Terbuka -->
    <div 
      v-if="sidebarOpen && auth.isLoggedIn" 
      @click="sidebarOpen = false" 
      class="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
    ></div>

    <!-- Error Toast Notification -->
    <Transition name="fade-slide-up">
      <div
        v-if="errorMsg"
        class="fixed bottom-6 right-6 z-50 bg-destructive/10 border border-destructive/30 text-destructive px-5 py-4 rounded-xl text-sm flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in-up"
      >
        <AlertCircle class="h-5 w-5 flex-shrink-0" />
        <span class="font-medium">{{ errorMsg }}</span>
        <button @click="errorMsg = ''" class="ml-2 text-destructive hover:text-red-200 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>

    <!-- Modal Notulen Rapat -->
    <NotesModal
      :show="showNotesDialog"
      :session="selectedSession"
      v-model="notesContent"
      :saving="savingNotes"
      @close="showNotesDialog = false"
      @save="saveNotes"
    />

    <!-- Dialog / Modal Buat Room Baru (Diaktifkan lewat administrasi) -->
    <CreateRoomModal
      :show="showCreateModal"
      v-model:createForm="createForm"
      :creating="creating"
      @close="showCreateModal = false"
      @create="handleCreateRoom"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Video, 
  AlertCircle, 
  X, 
  Sparkles, 
  Hash, 
  Lock, 
  Volume2, 
  Mic, 
  Headphones, 
  LogOut, 
  Menu,
  Plus,
  MicOff,
  VideoOff,
  VolumeX,
  Palette
} from 'lucide-vue-next'
import { api as axios } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import { useMeetStore } from '@/stores/meet'
import { useSettingsStore } from '@/stores/settings'

// Import modular components
import LobbyWelcome from '@/components/meet/LobbyWelcome.vue'
import LobbyMeetingTab from '@/components/meet/LobbyMeetingTab.vue'
import LobbyRoomsTab from '@/components/meet/LobbyRoomsTab.vue'
import LobbyHistoryTab from '@/components/meet/LobbyHistoryTab.vue'
import LobbyAppearanceTab from '@/components/meet/LobbyAppearanceTab.vue'
import NotesModal from '@/components/meet/NotesModal.vue'
import CreateRoomModal from '@/components/meet/CreateRoomModal.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const meetStore = useMeetStore()
const settingsStore = useSettingsStore()

// --- State Utama ---
const joining = ref(false)
const creating = ref(false)
const errorMsg = ref('')

// State Kontrol Cepat Audio/Video (Default: Mati/Muted)
const isMuted = ref(true)
const isCameraOff = ref(true)

const joinForm = ref({ slug: '', password: '', showPassword: false })
const createForm = ref({ name: '', password: '' })

// State Layar Utama & Responsive Sidebar
const sidebarOpen = ref(false)
const activeTab = ref('meeting') // 'meeting' | 'rooms' | 'history'
const loadingAdmin = ref(false)
const myRooms = ref([])
const mySessions = ref([])
const filterRoomName = ref('') // Filter nama room untuk riwayat sesi

// Dialog Modals State
const showNotesDialog = ref(false)
const showCreateModal = ref(false)
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

  // Muat data room & riwayat jika user sudah terotentikasi
  if (auth.isLoggedIn) {
    fetchAdminData()
  }
})

// Pemuatan data administrasi otomatis saat tab berganti
watch(activeTab, (val) => {
  if ((val === 'rooms' || val === 'history') && myRooms.value.length === 0) {
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
    const parts = newVal.split('/')
    const lastPart = parts.pop()
    if (lastPart) {
      joinForm.value.slug = lastPart.split('?')[0]
    }
  }
})

// Mengambil data kamar & sesi riwayat dari server
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

function copySlug(slug) {
  navigator.clipboard.writeText(slug)
  alert('Slug tersalin: ' + slug)
}

// Navigasi & aksi sidebar menu
function selectRoomsTab() {
  activeTab.value = 'rooms'
  sidebarOpen.value = false
}

function selectHistoryTab() {
  filterRoomName.value = '' // Reset filter agar menampilkan semua riwayat
  activeTab.value = 'history'
  sidebarOpen.value = false
}

// Aksi melihat riwayat spesifik dari baris Daftar Room
function handleViewRoomHistory(roomName) {
  filterRoomName.value = roomName // Set filter ke room tertentu
  activeTab.value = 'history' // Pindah ke tab riwayat
}

// Buka dialog untuk buat room baru
function openCreateRoomDialog() {
  createForm.value = { name: '', password: '' }
  showCreateModal.value = true
}

// Handler pemilihan room lewat sidebar (Discord style quick-connect)
function handleSelectSidebarRoom(room) {
  joinForm.value.slug = room.slug
  activeTab.value = 'meeting'
  sidebarOpen.value = false
  
  if (room.is_locked) {
    joinForm.value.showPassword = true
  } else {
    handleJoinRoom()
  }
}

function handleSelectSidebarRoomBySlug(slug) {
  const room = myRooms.value.find(r => r.slug === slug)
  if (room) {
    handleSelectSidebarRoom(room)
  } else {
    joinForm.value.slug = slug
    activeTab.value = 'meeting'
    sidebarOpen.value = false
    handleJoinRoom()
  }
}

async function handleEndActiveSession(sessionId) {
  try {
    const res = await axios.put(`/api/meetings/${sessionId}/end`, {
      participant_count: 0
    })
    if (res.data.success) {
      await fetchAdminData()
    }
  } catch (err) {
    console.error('Gagal mengakhiri sesi', err)
    alert('Gagal mengakhiri sesi aktif')
  }
}

// Logic Menulis Notulen
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
      showCreateModal.value = false // Tutup modal sesudah sukses
      
      // Muat ulang daftar room di sidebar secara background
      fetchAdminData()

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
/* Custom animations & transitions */
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

/* Custom modern scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
