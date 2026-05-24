<template>
  <!-- =========================================================
    RoomPage — Halaman meeting video call
    Layout: Video grid fullscreen + sidebar chat + control bar
    Refactored to Modular Clean Architecture
  ========================================================= -->
  <div class="h-screen bg-background flex flex-col overflow-hidden text-foreground">
    <!-- Fase 1: Green Room Pre-flight Lobby -->
    <div v-if="!hasJoined" class="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-primary/5 select-none relative">
      <!-- Background ambient glowing orbs -->
      <div class="absolute right-10 top-10 w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6000ms]"></div>
      <div class="absolute left-10 bottom-10 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]"></div>

      <!-- Main Container (Premium Grid Layout & Responsive) -->
      <div class="w-full max-w-5xl bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 sm:p-8 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
        
        <!-- Kolom Kiri: Video Preview & Audio Tester (col-span-7) -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <!-- Video preview card with soft container zoom hover effect (resolves mirroring flip issue) -->
          <div class="w-full aspect-video bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative shadow-inner shadow-black/50 transition-all duration-300 hover:scale-[1.005] group">
            
            <!-- Slow pulsing subtle glowing ring around the video -->
            <div class="absolute inset-0 border border-primary/20 rounded-3xl pointer-events-none group-hover:border-primary/40 transition-colors duration-500"></div>
            
            <!-- Local video element (Mirror always scale-x-[-1]) -->
            <video
              v-show="tempCameraEnabled"
              ref="localVideoEl"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover scale-x-[-1]"
            ></video>

            <!-- Video Muted Fallback -->
            <div v-if="!tempCameraEnabled" class="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-lg">
              <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-xl transition-transform duration-300 group-hover:scale-105">
                <CameraOff class="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground animate-pulse" />
              </div>
              <span class="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider">Kamera Dinonaktifkan</span>
            </div>

            <!-- Quick Control Overlay (Over the video, Google Meet premium style) -->
            <div class="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-white/10 shadow-2xl transition-all duration-300 hover:bg-black/70">
              <!-- Mic button -->
              <button
                @click="toggleTempMic"
                class="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                :class="tempMicEnabled ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-destructive border border-destructive text-destructive-foreground hover:bg-destructive/95'"
              >
                <component :is="tempMicEnabled ? Mic : MicOff" class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                <q-tooltip class="bg-card text-foreground border border-border shadow-2xl text-xs font-semibold rounded-xl px-3 py-2 backdrop-blur-md">
                  {{ tempMicEnabled ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon' }}
                </q-tooltip>
              </button>

              <!-- Camera button -->
              <button
                @click="toggleTempCamera"
                class="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                :class="tempCameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-destructive border border-destructive text-destructive-foreground hover:bg-destructive/95'"
              >
                <component :is="tempCameraEnabled ? Camera : CameraOff" class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                <q-tooltip class="bg-card text-foreground border border-border shadow-2xl text-xs font-semibold rounded-xl px-3 py-2 backdrop-blur-md">
                  {{ tempCameraEnabled ? 'Matikan Kamera' : 'Nyalakan Kamera' }}
                </q-tooltip>
              </button>
            </div>
          </div>

          <!-- Tester Audio (Premium Segmented Equalizer style) -->
          <div class="flex flex-col gap-2 bg-white/5 border border-white/5 px-4 sm:px-5 py-3 sm:py-4 rounded-3xl shadow-lg relative overflow-hidden group">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <Mic class="h-4.5 w-4.5 text-primary" />
                <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tes Input Suara</span>
              </div>
              <span class="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">Mikrofon Aktif</span>
            </div>

            <!-- Segmented indicators -->
            <div class="flex items-center gap-1.5 h-3.5 mt-2 bg-black/20 rounded-full p-1 border border-white/5">
              <div
                v-for="i in 16"
                :key="i"
                class="flex-1 h-full rounded-full transition-all duration-75"
                :class="[
                  tempMicEnabled && (audioLevel >= (i / 16) * 100)
                    ? (i <= 11 ? 'bg-primary shadow-[0_0_8px_rgba(var(--q-primary),0.6)]' : i <= 14 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]')
                    : 'bg-white/10'
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Rapat Info & Hardware Selectors (col-span-5) -->
        <div class="lg:col-span-5 flex flex-col justify-between self-stretch py-1 gap-6">
          <div class="flex flex-col gap-6">
            <!-- Header Rapat -->
            <div class="text-left">
              <h2 class="text-foreground font-bold text-2xl sm:text-3xl tracking-tight">Siap Bergabung?</h2>
              <p class="text-xs text-muted-foreground mt-1">Atur perangkat keras Anda dengan sempurna sebelum masuk rapat.</p>
            </div>

            <!-- Meeting Info Card -->
            <div class="p-4 sm:p-5 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-2.5 relative overflow-hidden group hover:bg-white/10 transition-all duration-300 shadow-lg">
              <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-300"></div>
              <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-left">Nama Rapat</span>
              <span class="text-lg sm:text-xl font-bold text-foreground text-left leading-none tracking-tight">{{ meetStore.room?.name ?? 'Loading Rapat...' }}</span>
              
              <!-- Participants count badge -->
              <div class="flex items-center gap-2 mt-2 self-start bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 duration-200">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>{{ meetStore.participantCount }} Peserta Aktif</span>
              </div>
            </div>

            <!-- Perangkat Keras Dropdowns (Menggunakan UI AppSelect Premium yang Ada) -->
            <div class="flex flex-col gap-4 text-left">
              <!-- Dropdown Kamera -->
              <AppSelect
                id="camera-select"
                label="Pilih Kamera"
                v-model="selectedCameraId"
                :options="cameraOptions"
                text-key="label"
                value-key="deviceId"
                :disabled="!tempCameraEnabled"
                @update:model-value="startLocalPreview"
              />

              <!-- Dropdown Mikrofon -->
              <AppSelect
                id="microphone-select"
                label="Pilih Mikrofon"
                v-model="selectedMicrophoneId"
                :options="microphoneOptions"
                text-key="label"
                value-key="deviceId"
                :disabled="!tempMicEnabled"
                @update:model-value="startLocalPreview"
              />
            </div>
          </div>

          <!-- Tombol Join (Menggunakan UI Button Premium yang Ada) -->
          <Button
            @click="joinMeeting"
            size="lg"
            class="w-full py-6 sm:py-7 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-primary-foreground font-bold text-base transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-primary/45 active:scale-[0.98] duration-200 mt-4 lg:mt-6"
          >
            <span>Gabung Rapat</span>
            <ArrowRight class="h-5 w-5" />
          </Button>
        </div>

      </div>
    </div>

    <!-- Fase 2: Rapat Aktif -->
    <template v-else>
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
          <div v-if="meetStore.isRecording" class="flex items-center gap-1.5 bg-destructive/10 border border-destructive/25 px-2.5 py-1 rounded-full text-destructive text-xs font-semibold animate-pulse">
            <span class="h-1.5 w-1.5 rounded-full bg-destructive animate-ping"></span>
            <span>REC {{ formatDuration(recordingDuration) }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-white/5 border border-border px-2.5 py-1 rounded-full text-muted-foreground text-xs font-medium">
            <Clock class="h-3.5 w-3.5 text-primary" />
            <span>{{ formatDuration(meetingDuration) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <button @click="copyRoomLink" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all">
            <Copy class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Bagikan</span>
          </button>
          <div class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg" :class="statusClass">
            <div class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></div>
            <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">{{ statusText }}</span>
          </div>
          <button @click="toggleParticipantsPanel" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all" :class="{ 'bg-primary/20 text-primary': meetStore.showParticipants }">
            <Users class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Peserta</span>
          </button>
          <button @click="showChat = !showChat" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all" :class="{ 'bg-primary/20 text-primary': showChat }">
            <MessageSquare class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Chat</span>
            <span v-if="unreadCount > 0" class="bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 ml-0.5">{{ unreadCount }}</span>
          </button>
        </div>
      </div>

      <!-- ── Main Area ── -->
      <div class="flex-1 flex overflow-hidden min-h-0 relative">
        <div class="flex-1 p-3 overflow-hidden flex flex-col min-h-0 min-w-0">
          <div class="flex-1 h-full flex flex-col gap-3 min-h-0 w-full">
            <div class="flex-1 flex flex-col min-h-0 w-full relative">
              <div class="flex-1 flex overflow-hidden p-2">
                <div class="m-auto w-full flex flex-wrap justify-center gap-3">
                  <ParticipantTile v-for="p in meetStore.participants" :key="p.identity" :participant="p" :style="getTileStyle(meetStore.participants.length)" class="aspect-video shadow-lg rounded-xl overflow-hidden bg-card border border-border" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RoomChat :show="showChat" v-model:solid="chatSolid" :messages="meetStore.messages" @close="showChat = false" @send="sendChat" />
        <RoomParticipants :show="meetStore.showParticipants" :solid="chatSolid" :participants="meetStore.participants" :is-host="meetStore.isHost" @close="meetStore.showParticipants = false" @lower-hand="lowerRemoteHand" @mute="muteRemoteParticipant" @mute-all="muteAllParticipants" @lower-all-hands="lowerAllHands" />

        <!-- Dialog Pengaturan Media -->
        <q-dialog v-model="showSettingsDialog">
          <q-card class="w-[480px] max-w-[90vw] bg-card/90 backdrop-blur-xl border border-border text-foreground rounded-2xl overflow-hidden shadow-2xl">
            <div class="px-5 py-4 border-b border-border flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Settings class="h-5 w-5 text-primary" />
                <h3 class="text-base font-semibold">Pengaturan Media</h3>
              </div>
              <button @click="showSettingsDialog = false" class="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
                <X class="h-4.5 w-4.5" />
              </button>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div class="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Kualitas Video (Resolusi Kamera)</div>
              <div class="flex flex-col gap-2">
                <div @click="changeResolution('h360')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h360' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold">🍃 Hemat Data (360p)</span>
                    <span class="text-xs text-muted-foreground mt-0.5">Cocok untuk koneksi lambat.</span>
                  </div>
                  <Check v-if="meetStore.cameraResolution === 'h360'" class="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div @click="changeResolution('h540')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h540' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold">📺 Kualitas Standar (540p)</span>
                    <span class="text-xs text-muted-foreground mt-0.5">Keseimbangan terbaik.</span>
                  </div>
                  <Check v-if="meetStore.cameraResolution === 'h540'" class="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div @click="changeResolution('h720')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h720' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold">✨ High Definition (720p)</span>
                    <span class="text-xs text-muted-foreground mt-0.5">Gambar HD tajam.</span>
                  </div>
                  <Check v-if="meetStore.cameraResolution === 'h720'" class="h-4 w-4 shrink-0 text-primary" />
                </div>
              </div>
            </div>
            <div class="px-5 py-3.5 border-t border-border flex items-center justify-end bg-card/50">
              <button @click="showSettingsDialog = false" class="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">Selesai</button>
            </div>
          </q-card>
        </q-dialog>

        <!-- Floating Emoji Reactions -->
        <div class="fixed bottom-24 left-6 z-50 pointer-events-none flex flex-col gap-2">
          <TransitionGroup name="float-up">
            <div v-for="reaction in meetStore.reactions" :key="reaction.id" class="flex items-center gap-2 bg-card/90 border border-border rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md">
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
      :show-participants="meetStore.showParticipants"
      @toggle-mic="roomComposable.toggleMic"
      @toggle-camera="roomComposable.toggleCamera"
      @toggle-screen-share="roomComposable.toggleScreenShare"
      @toggle-raise-hand="toggleRaiseHand"
      @send-reaction="sendReactionEmoji"
      @toggle-recording="toggleRecording"
      @mute-all="muteAllParticipants"
      @lower-all-hands="lowerAllHands"
      @leave="leaveRoom"
      @toggle-participants="toggleParticipantsPanel"
      @open-settings="showSettingsDialog = true"
    />
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Video, Copy, MessageSquare, Clock, Users, ChevronLeft, ChevronRight, Settings, Check, X,
  Mic, MicOff, Camera, CameraOff, ArrowRight, ChevronDown
} from 'lucide-vue-next'
import { useMeetStore } from '@/stores/meet'
import { useRoom } from '@/composables/useRoom'
import ParticipantTile from '@/components/meet/ParticipantTile.vue'
import RoomChat from '@/components/meet/RoomChat.vue'
import RoomParticipants from '@/components/meet/RoomParticipants.vue'
import RoomControlBar from '@/components/meet/RoomControlBar.vue'
import { useNotificationStore } from '@/stores/notification'
import { api as axios } from '@/boot/axios'
import AppSelect from '@/components/AppSelect.vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()
const meetStore = useMeetStore()
const notificationStore = useNotificationStore()
const roomComposable = useRoom()

// --- State Green Room Pre-flight Lobby ---
const hasJoined = ref(false)
const localStream = ref(null)
const audioLevel = ref(0)
const cameras = ref([])
const microphones = ref([])
const selectedCameraId = ref('')
const selectedMicrophoneId = ref('')
const localVideoEl = ref(null)

const tempMicEnabled = ref(true)
const tempCameraEnabled = ref(true)

let audioContext = null
let analyser = null
let animationFrameId = null

// --- State UI Meeting ---
const showChat = ref(false)
const pinnedId = ref(null)
const connectionAttempted = ref(false)
const unreadCount = ref(0)
const currentPage = ref(1)
const chatSolid = ref(false)
const showSettingsDialog = ref(false)

// --- State Profesional Tambahan ---
const participantSearch = ref('')
const meetingDuration = ref(0)
const recordingDuration = ref(0)
let timerInterval = null

// --- Computeds ---
const cameraOptions = computed(() => {
  return cameras.value.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || `Kamera ${index + 1}`
  }))
})

const microphoneOptions = computed(() => {
  return microphones.value.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || `Mikrofon ${index + 1}`
  }))
})

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

// --- Green Room Functions ---

async function loadDevices() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Minta izin dasar terlebih dahulu agar label perangkat terisi lengkap
      if (tempCameraEnabled.value || tempMicEnabled.value) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: tempCameraEnabled.value,
            audio: tempMicEnabled.value
          })
          tempStream.getTracks().forEach(t => t.stop())
        } catch (e) {
          console.warn('Izin perangkat ditolak atau tidak tersedia:', e)
        }
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      cameras.value = devices.filter(d => d.kind === 'videoinput')
      microphones.value = devices.filter(d => d.kind === 'audioinput')

      // Pilih default kamera pertama jika belum terpilih
      if (cameras.value.length > 0 && !selectedCameraId.value) {
        selectedCameraId.value = cameras.value[0].deviceId
      }
      // Pilih default mikrofon pertama jika belum terpilih
      if (microphones.value.length > 0 && !selectedMicrophoneId.value) {
        selectedMicrophoneId.value = microphones.value[0].deviceId
      }
    }
  } catch (err) {
    console.error('Gagal memuat daftar perangkat keras:', err)
  }
}

function toggleTempMic() {
  tempMicEnabled.value = !tempMicEnabled.value
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = tempMicEnabled.value
    }
  }
}

function toggleTempCamera() {
  tempCameraEnabled.value = !tempCameraEnabled.value
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = tempCameraEnabled.value
    }
  }
}

async function startLocalPreview() {
  stopLocalPreview()

  try {
    const constraints = {
      video: {
        deviceId: selectedCameraId.value ? { exact: selectedCameraId.value } : undefined,
        width: { ideal: 960 },
        height: { ideal: 540 } // Resolusi ideal 540p di lobi
      },
      audio: {
        deviceId: selectedMicrophoneId.value ? { exact: selectedMicrophoneId.value } : undefined
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStream.value = stream

    // Terapkan status enabled awal sesuai tombol di lobi
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = tempCameraEnabled.value
    }

    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = tempMicEnabled.value
    }

    if (localVideoEl.value) {
      localVideoEl.value.srcObject = stream
    }

    setupAudioTester(stream)
  } catch (err) {
    console.error('Gagal memuat pratinjau media lokal:', err)
  }
}

function stopLocalPreview() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (audioContext) {
    try {
      audioContext.close()
    } catch (e) {
      console.error('Gagal menutup AudioContext:', e)
    }
    audioContext = null
  }
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => {
      track.stop()
    })
    localStream.value = null
  }
  if (localVideoEl.value) {
    localVideoEl.value.srcObject = null
  }
  audioLevel.value = 0
}

function setupAudioTester(stream) {
  const audioTracks = stream.getAudioTracks()
  if (!audioTracks || audioTracks.length === 0) {
    audioLevel.value = 0
    return
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkVolume = () => {
      if (!tempMicEnabled.value || !localStream.value || !analyser) {
        audioLevel.value = 0
        animationFrameId = requestAnimationFrame(checkVolume)
        return
      }

      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength
      // Konversi rata-rata amplitudo ke skala persentase 0-100
      audioLevel.value = Math.min(100, Math.round((average / 128) * 100))

      animationFrameId = requestAnimationFrame(checkVolume)
    }

    checkVolume()
  } catch (err) {
    console.error('Error saat inisialisasi tester audio:', err)
    audioLevel.value = 0
  }
}

async function joinMeeting() {
  stopLocalPreview()

  // Sinkronkan ke store sebelum connect agar track LiveKit terbit sesuai setelan lobi
  if (meetStore.isMicEnabled !== tempMicEnabled.value) {
    meetStore.toggleMic()
  }
  if (meetStore.isCameraEnabled !== tempCameraEnabled.value) {
    meetStore.toggleCamera()
  }

  hasJoined.value = true
  connectionAttempted.value = true

  try {
    await roomComposable.connect(meetStore.livekitUrl, meetStore.token)

    // Switch perangkat di LiveKit secara seamless sesuai pilihan lobi
    if (roomComposable.lkRoom.value) {
      if (tempCameraEnabled.value && selectedCameraId.value) {
        await roomComposable.lkRoom.value.switchActiveDevice('videoinput', selectedCameraId.value)
      }
      if (tempMicEnabled.value && selectedMicrophoneId.value) {
        await roomComposable.lkRoom.value.switchActiveDevice('audioinput', selectedMicrophoneId.value)
      }
    }

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

    // Mulai durasi rapat & rekaman
    timerInterval = setInterval(() => {
      meetingDuration.value++
      if (meetStore.isRecording) {
        recordingDuration.value++
      } else {
        recordingDuration.value = 0
      }
    }, 1000)

    notificationStore.showSuccess('Berhasil', 'Anda telah bergabung ke dalam rapat!')
  } catch (err) {
    notificationStore.showError('Koneksi Gagal', `Gagal terhubung ke server rapat: ${err.message}`)
    hasJoined.value = false
    await loadDevices()
    await startLocalPreview()
  }
}

// --- Lifecycle & Restore Sesi ---
onMounted(async () => {
  window.addEventListener('beforeunload', handleWindowUnload)
  
  setTimeout(async () => {
    // Jalankan restorasi token jika reload atau navigasi langsung
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

    // Inisialisasi awal switch lobby
    tempMicEnabled.value = meetStore.isMicEnabled
    tempCameraEnabled.value = meetStore.isCameraEnabled

    await loadDevices()
    await startLocalPreview()
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

async function changeResolution(presetName) {
  await roomComposable.changeCameraResolution(presetName)
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
  stopLocalPreview()
  if (meetStore.isConnected) {
    if (meetStore.isHost && meetStore.currentSessionId) {
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

/* Custom select reset & styling for professional Carets */
.select-style {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: none !important;
}
.select-style::-ms-expand {
  display: none !important;
}
.select-style option {
  background-color: #1e1f22 !important;
  color: #f3f4f6 !important;
  font-weight: 600;
  padding: 12px;
}
</style>
