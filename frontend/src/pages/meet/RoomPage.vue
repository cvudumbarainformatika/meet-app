<template>
  <!-- =========================================================
    RoomPage — Halaman meeting video call
    Layout: Video grid fullscreen + sidebar chat + control bar
    Refactored to Modular Clean Architecture
  ========================================================= -->
  <div class="h-screen bg-background flex flex-col overflow-hidden text-foreground">

    <!-- ── Header Bar ── -->
    <div class="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-card/80 border-b border-border flex-shrink-0 gap-2">
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Video class="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 class="text-foreground text-sm font-semibold leading-none">{{ meetStore.room?.name ?? 'Meeting' }}</h1>
          <span class="text-muted-foreground text-xs">{{ meetStore.participantCount }} peserta</span>
        </div>
      </div>

      <!-- Center section: REC + Timer -->
      <div class="flex items-center gap-3">
        <!-- REC Blinking Indicator -->
        <div
          v-if="meetStore.isRecording"
          class="flex items-center gap-1.5 bg-destructive/10 border border-destructive/25 px-2.5 py-1 rounded-full text-destructive text-xs font-semibold animate-pulse"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-destructive animate-ping"></span>
          <span>REC {{ formatDuration(recordingDuration) }}</span>
        </div>
        
        <!-- Meeting Timer -->
        <div class="flex items-center gap-1.5 bg-white/5 border border-border px-2.5 py-1 rounded-full text-muted-foreground text-xs font-medium">
          <Clock class="h-3.5 w-3.5 text-primary" />
          <span>{{ formatDuration(meetingDuration) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Copy link -->
        <button
          @click="copyRoomLink"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all"
          title="Bagikan"
        >
          <Copy class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Bagikan</span>
        </button>

        <!-- Connection status -->
        <div class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg" :class="statusClass" :title="statusText">
          <div class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></div>
          <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">{{ statusText }}</span>
        </div>

        <!-- Toggle participants list -->
        <button
          @click="toggleParticipantsPanel"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all"
          :class="{ 'bg-primary/20 text-primary': meetStore.showParticipants }"
          title="Peserta"
        >
          <Users class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Peserta</span>
        </button>

        <!-- Toggle chat -->
        <button
          @click="showChat = !showChat"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all"
          :class="{ 'bg-primary/20 text-primary': showChat }"
          title="Chat"
        >
          <MessageSquare class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Chat</span>
          <span v-if="unreadCount > 0" class="bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 ml-0.5">
            {{ unreadCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Main Area: Video + Chat ── -->
    <div class="flex-1 flex overflow-hidden min-h-0 relative">

      <!-- Video Grid -->
      <div class="flex-1 p-3 overflow-hidden flex flex-col min-h-0 min-w-0">
        <!-- Connecting state -->
        <div
          v-if="!meetStore.isConnected"
          class="flex-1 flex flex-col items-center justify-center text-center"
        >
          <div class="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
            <Video class="h-8 w-8 text-primary" />
          </div>
          <p class="text-foreground font-semibold mb-1">{{ meetStore.connectionState === 'connecting' ? 'Menghubungkan...' : 'Terputus' }}</p>
          <p class="text-muted-foreground text-sm">Mohon tunggu sebentar</p>
          <button
            v-if="meetStore.connectionState === 'disconnected' && connectionAttempted"
            @click="reconnect"
            class="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Participants Grid -->
        <div
          v-else
          class="flex-1 h-full flex flex-col gap-3 min-h-0 w-full"
        >
          <!-- Area Video Pinned -->
          <div v-if="pinnedParticipant" class="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
            <!-- Wrapper utama video yang dipin -->
            <div class="flex-1 overflow-hidden min-h-0 rounded-xl flex flex-col">
              <ParticipantTile
                :participant="pinnedParticipant"
                :is-pinned="true"
                class="flex-1 w-full h-full"
                @pin="pinnedId = null"
              />
            </div>
            
            <!-- Sidebar / Horizontal bar untuk pinned mode -->
            <div class="w-full md:w-[240px] flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pr-1 pb-1">
              <ParticipantTile
                v-for="p in unpinnedParticipants"
                :key="p.identity"
                :participant="p"
                :is-pinned="false"
                class="w-[160px] md:w-full aspect-video flex-shrink-0"
                @pin="pinnedId = p.identity"
              />
            </div>
          </div>

          <!-- Area Unpinned (Gallery + Pagination) -->
          <div
            v-else
            class="flex-1 flex flex-col min-h-0 w-full relative"
          >
            <!-- Tombol Prev Page -->
            <button
              v-if="totalPages > 1"
              @click="prevPage"
              :disabled="currentPage === 1"
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-8 flex items-center justify-center bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-r-lg transition-all"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>

            <!-- Tombol Next Page -->
            <button
              v-if="totalPages > 1"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-8 flex items-center justify-center bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-l-lg transition-all"
            >
              <ChevronRight class="h-5 w-5" />
            </button>

            <!-- Gallery Grid Paginated -->
            <div class="flex-1 flex overflow-hidden p-2">
              <div class="m-auto w-full flex flex-wrap justify-center gap-3">
                <TransitionGroup name="tile-fade">
                  <ParticipantTile
                    v-for="p in paginatedParticipants"
                    :key="p.identity"
                    :participant="p"
                    :is-pinned="false"
                    class="aspect-video shadow-lg rounded-xl overflow-hidden transition-all duration-300 bg-card border border-border"
                    :style="getTileStyle(paginatedParticipants.length)"
                    @pin="pinnedId = p.identity"
                  />
                </TransitionGroup>
              </div>
            </div>

            <!-- Page Indicator -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-2">
              <div
                v-for="i in totalPages"
                :key="i"
                @click="currentPage = i"
                class="h-1.5 rounded-full cursor-pointer transition-all duration-300"
                :class="currentPage === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Overlay -->
      <RoomChat
        :show="showChat"
        v-model:solid="chatSolid"
        :messages="meetStore.messages"
        @close="showChat = false"
        @send="sendChat"
      />

      <!-- Panel Daftar Peserta Overlay -->
      <RoomParticipants
        :show="meetStore.showParticipants"
        :solid="chatSolid"
        :participants="meetStore.participants"
        :is-host="meetStore.isHost"
        :host-name="meetStore.room?.host_name"
        v-model:search="participantSearch"
        @close="meetStore.showParticipants = false"
        @lower-hand="lowerRemoteHand"
        @mute="muteRemoteParticipant"
        @mute-all="muteAllParticipants"
        @lower-all-hands="lowerAllHands"
      />

      <!-- Floating Emoji Reactions container -->
      <div class="fixed bottom-24 left-6 z-50 pointer-events-none flex flex-col gap-2">
        <TransitionGroup name="float-up">
          <div
            v-for="reaction in meetStore.reactions"
            :key="reaction.id"
            class="flex items-center gap-2 bg-card/90 border border-border rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md animate-reaction-float"
          >
            <span class="text-xl">{{ reaction.emoji }}</span>
            <span class="text-foreground text-[10px] font-medium pr-1">{{ reaction.sender }}</span>
          </div>
        </TransitionGroup>
      </div>
    </div>


    <!-- ── Control Bar ── -->
    <RoomControlBar
      :is-mic-enabled="meetStore.isMicEnabled"
      :is-camera-enabled="meetStore.isCameraEnabled"
      :is-screen-sharing="meetStore.isScreenSharing"
      :is-hand-raised="myHandRaised"
      :is-host="meetStore.isHost"
      :is-recording="meetStore.isRecording"
      @toggle-mic="roomComposable.toggleMic"
      @toggle-camera="roomComposable.toggleCamera"
      @toggle-screen-share="roomComposable.toggleScreenShare"
      @toggle-raise-hand="toggleRaiseHand"
      @send-reaction="sendReactionEmoji"
      @toggle-recording="toggleRecording"
      @mute-all="muteAllParticipants"
      @lower-all-hands="lowerAllHands"
      @leave="leaveRoom"
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Video, Copy, MessageSquare, Clock, Users, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { useMeetStore } from '@/stores/meet'
import { useRoom } from '@/composables/useRoom'
import ParticipantTile from '@/components/meet/ParticipantTile.vue'
import RoomChat from '@/components/meet/RoomChat.vue'
import RoomParticipants from '@/components/meet/RoomParticipants.vue'
import RoomControlBar from '@/components/meet/RoomControlBar.vue'
import { useNotificationStore } from '@/stores/notification'
import { api as axios } from '@/boot/axios'

const router = useRouter()
const route = useRoute()
const meetStore = useMeetStore()
const notificationStore = useNotificationStore()
const roomComposable = useRoom()

// --- State ---
const showChat = ref(false)
const pinnedId = ref(null)
const connectionAttempted = ref(false)
const unreadCount = ref(0)
const currentPage = ref(1)
const chatSolid = ref(false)

// --- State Profesional Tambahan ---
const participantSearch = ref('')
const meetingDuration = ref(0)
const recordingDuration = ref(0)
let timerInterval = null

const pinnedParticipant = computed(() => {
  if (!pinnedId.value) return null
  return meetStore.participants.find(p => p.identity === pinnedId.value) || null
})

const unpinnedParticipants = computed(() => {
  if (!pinnedId.value) return meetStore.participants
  return meetStore.participants.filter(p => p.identity !== pinnedId.value)
})

// --- Pagination ---
const tilesPerPage = computed(() => {
  const count = unpinnedParticipants.value.length
  if (count <= 4) return count      // sedikit: tampil semua
  if (count <= 9) return 9          // max 9 (3x3)
  return 12                          // max 12 (4x3)
})

const totalPages = computed(() => {
  return Math.ceil(unpinnedParticipants.value.length / tilesPerPage.value) || 1
})

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * tilesPerPage.value
  return unpinnedParticipants.value.slice(start, start + tilesPerPage.value)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Reset ke halaman 1 jika jumlah participant berubah
watch(() => unpinnedParticipants.value.length, () => {
  currentPage.value = 1
})

// --- Responsive Flexbox Gallery Layout (Discord/Meet Style) ---
function getTileStyle(count) {
  if (count === 1) return { width: '100%', maxWidth: '1000px' }
  if (count === 2) return { width: 'calc(50% - 0.5rem)', maxWidth: '800px' }
  if (count === 3 || count === 4) return { width: 'calc(50% - 0.5rem)', maxWidth: '600px' }
  if (count >= 5 && count <= 6) return { width: 'calc(33.333% - 0.66rem)', maxWidth: '500px' }
  if (count >= 7 && count <= 8) return { width: 'calc(25% - 0.75rem)' }
  if (count >= 9 && count <= 12) return { width: 'calc(25% - 0.75rem)' } 
  return { width: 'calc(20% - 0.8rem)' }
}

// --- Connection Status ---
const statusClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-success/10 text-success'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-500/10 text-amber-500'
  return 'bg-destructive/10 text-destructive'
})

const statusDotClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-success animate-pulse'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-500 animate-pulse'
  return 'bg-destructive'
})

const statusText = computed(() => {
  const map = {
    connected: 'Terhubung',
    connecting: 'Menghubungkan',
    reconnecting: 'Menyambung ulang',
    disconnected: 'Terputus',
  }
  return map[meetStore.connectionState] ?? 'Unknown'
})

// --- Computed Profesional ---
const localParticipant = computed(() => meetStore.participants.find(p => p.isLocal))
const myHandRaised = computed(() => {
  return localParticipant.value?.isHandRaised || false
})

// --- Connect & Timer saat halaman dibuka (Ditambahkan logika restore token otomatis & delay transisi) ---
onMounted(async () => {
  window.addEventListener('beforeunload', handleWindowUnload)
  // Tunggu transisi halaman router selesai (0.3s) agar Vue Transition engine tidak mengalami DOM collision/blank screen
  setTimeout(async () => {
    // Jika token atau livekitUrl kosong (misal karena direct visit/reload), coba restore token secara dinamis
    if (!meetStore.token || !meetStore.livekitUrl) {
      const slug = route.params.slug
      if (slug) {
        try {
          const res = await axios.post('/api/tokens/join', {
            room_slug: slug.trim()
          })
          if (res.data.success) {
            const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || res.data.data.livekit_url
            meetStore.setRoom(res.data.data.room, res.data.data.token, publicLiveKitUrl, res.data.data.is_host)
          } else {
            notificationStore.showError('Gagal', 'Gagal memulihkan sesi room.')
            router.push(`/?join=${slug}`)
            return
          }
        } catch (err) {
          // Jika butuh password (403), lempar kembali ke lobi agar user bisa memasukkan password
          if (err.response?.status === 403) {
            notificationStore.showWarning('Perlu Password', 'Room ini dilindungi sandi. Silakan bergabung melalui lobi.')
            router.push(`/?join=${slug}`)
          } else {
            notificationStore.showError('Gagal', err.response?.data?.message ?? 'Sesi room tidak ditemukan.')
            router.push('/')
          }
          return
        }
      } else {
        router.push('/')
        return
      }
    }

    connectionAttempted.value = true
    try {
      await roomComposable.connect(meetStore.livekitUrl, meetStore.token)
      
      if (meetStore.isHost && meetStore.room?.id) {
        try {
          const res = await axios.post('/api/meetings', { room_id: meetStore.room.id })
          if (res.data.success && res.data.data) {
            meetStore.setSessionId(res.data.data.id)
          }
        } catch (err) {
          console.error('Failed to start meeting session:', err)
        }
      }
    } catch (err) {
      notificationStore.showError('Koneksi Gagal', `Gagal terhubung: ${err.message}`)
    }

    timerInterval = setInterval(() => {
      meetingDuration.value++
      if (meetStore.isRecording) {
        recordingDuration.value++
      } else {
        recordingDuration.value = 0
      }
    }, 1000)
  }, 400)
})

watch(() => meetStore.messages.length, () => {
  if (!showChat.value) {
    unreadCount.value++
  }
})

watch(showChat, (val) => {
  if (val) {
    meetStore.showParticipants = false
    unreadCount.value = 0
  }
})

watch(() => meetStore.showParticipants, (val) => {
  if (val) {
    showChat.value = false
  }
})

// --- Actions ---
async function sendChat(text) {
  await roomComposable.sendChatMessage(text)
}

async function leaveRoom() {
  if (meetStore.isHost && meetStore.currentSessionId) {
    try {
      await axios.put(`/api/meetings/${meetStore.currentSessionId}/end`, {
        participant_count: Math.max(1, meetStore.participantCount)
      })
    } catch (err) {
      console.error('Failed to end meeting session:', err)
    }
  }
  await roomComposable.disconnect()
  router.push('/')
}

async function reconnect() {
  await roomComposable.connect(meetStore.livekitUrl, meetStore.token)
}

function copyRoomLink() {
  const url = `${window.location.origin}/?join=${meetStore.room?.slug}`
  navigator.clipboard.writeText(url)
  notificationStore.showSuccess('Berhasil', 'Link room tersalin!')
}

async function toggleRaiseHand() {
  const raised = !myHandRaised.value
  await roomComposable.sendRaiseHand(raised)
}

async function sendReactionEmoji(emoji) {
  await roomComposable.sendReaction(emoji)
}

async function toggleRecording() {
  const active = !meetStore.isRecording
  await roomComposable.sendRecordingState(active)
}

function toggleParticipantsPanel() {
  meetStore.showParticipants = !meetStore.showParticipants
}

async function muteRemoteParticipant(identity) {
  await roomComposable.sendMuteParticipant(identity)
  notificationStore.showSuccess('Berhasil', `Sinyal mute telah dikirim ke peserta`)
}

async function lowerRemoteHand(identity) {
  await roomComposable.sendLowerHand(identity)
  notificationStore.showSuccess('Berhasil', `Sinyal menurunkan tangan telah dikirim ke peserta`)
}

async function muteAllParticipants() {
  await roomComposable.sendMuteAll(pinnedId.value)
}

async function lowerAllHands() {
  const raised = meetStore.participants.filter(p => p.isHandRaised && !p.isLocal)
  for (const p of raised) {
    await roomComposable.sendLowerHand(p.identity)
  }
  notificationStore.showSuccess('Berhasil', `Semua tangan peserta telah diturunkan`)
}

function formatDuration(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  const paddedHrs = String(hrs).padStart(2, '0')
  const paddedMins = String(mins).padStart(2, '0')
  const paddedSecs = String(secs).padStart(2, '0')
  
  if (hrs > 0) {
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`
  }
  return `${paddedMins}:${paddedSecs}`
}

function handleWindowUnload() {
  if (meetStore.isHost && meetStore.currentSessionId) {
    // Sinyal penutupan sesi rapat sinkron saat browser ditutup / di-reload
    const url = `/api/meetings/${meetStore.currentSessionId}/end`
    const payload = JSON.stringify({
      participant_count: Math.max(1, meetStore.participantCount)
    })
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
    } catch (e) {
      console.error('Failed to send unload beacon:', e)
    }
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleWindowUnload)
  if (timerInterval) clearInterval(timerInterval)
  if (meetStore.isConnected) {
    if (meetStore.isHost && meetStore.currentSessionId) {
      // Jika keluar rute secara internal SPA, akhiri sesi via Axios
      axios.put(`/api/meetings/${meetStore.currentSessionId}/end`, {
        participant_count: Math.max(1, meetStore.participantCount)
      }).catch(err => console.error('Failed to end session on unmount:', err))
    }
    roomComposable.disconnect()
  }
})
</script>

<style scoped>
/* Tile pagination transition */
.tile-fade-enter-active,
.tile-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tile-fade-enter-from,
.tile-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.tile-fade-move {
  transition: transform 0.3s ease;
}

/* Reactions Floating Animation */
@keyframes reaction-float {
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  15% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(-80px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-120px) scale(0.9);
    opacity: 0;
  }
}

.animate-reaction-float {
  animation: reaction-float 4s forwards cubic-bezier(0.1, 0.8, 0.3, 1);
}
</style>
