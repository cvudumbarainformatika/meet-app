<template>
  <!-- =========================================================
    ParticipantTile — Video tile untuk satu participant
  ========================================================= -->
  <div
    ref="tileEl"
    class="relative bg-black rounded-xl overflow-hidden group cursor-pointer border flex items-center justify-center"
    :class="[
      (participant.isSpeaking || isSpeakingFast) ? 'speaking ring-2 ring-emerald-400 border-emerald-400 shadow-lg shadow-emerald-500/50 transition-none' : 'border-border hover:border-primary/50 transition-all duration-300',
    ]"
    @click="$emit('pin')"
  >
    <!-- Audio Element (Hanya untuk remote participant agar tidak echo) -->
    <audio
      v-show="!participant.isLocal && participant.audioTrack"
      ref="audioEl"
      autoplay
    />

    <!-- Video Element -->
    <video
      v-show="participant.isCameraEnabled || participant.isScreenSharing"
      ref="videoEl"
      autoplay
      playsinline
      muted
      class="absolute inset-0 w-full h-full bg-black"
      :style="{ objectFit: isPinned ? 'contain' : 'cover' }"
    />

    <!-- Avatar Fallback (kamera off) -->
    <div
      v-show="!participant.isCameraEnabled && !participant.isScreenSharing"
      class="w-full h-full flex items-center justify-center bg-gradient-to-br"
      :class="avatarGradient"
    >
      <div class="h-16 w-16 rounded-full flex items-center justify-center ring-2 ring-white/10 bg-white/10 shadow-lg">
        <span class="text-white text-2xl font-bold">{{ initials }}</span>
      </div>
    </div>

    <!-- ── Hover Action Buttons (atas kanan) ── -->
    <div
      class="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      @click.stop
    >
      <!-- Tombol Picture-in-Picture -->
      <button
        v-if="participant.isCameraEnabled || participant.isScreenSharing"
        @click.stop="togglePiP"
        title="Picture in Picture"
        class="h-7 w-7 flex items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
      >
        <ExternalLink class="h-3.5 w-3.5" />
      </button>

      <!-- Tombol Fullscreen -->
      <button
        @click.stop="toggleFullscreen"
        :title="isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'"
        class="h-7 w-7 flex items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
      >
        <Minimize2 v-if="isFullscreen" class="h-3.5 w-3.5" />
        <Maximize2 v-else class="h-3.5 w-3.5" />
      </button>

      <!-- Tombol Pin / Unpin -->
      <button
        @click.stop="$emit('pin')"
        :title="isPinned ? 'Lepas Pin' : 'Pin Video'"
        class="h-7 w-7 flex items-center justify-center rounded-lg transition-all"
        :class="isPinned ? 'bg-primary/80 hover:bg-primary text-primary-foreground' : 'bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm'"
      >
        <PinOff v-if="isPinned" class="h-3.5 w-3.5" />
        <Pin v-else class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Fullscreen indicator badge -->
    <div v-if="isFullscreen" class="absolute top-2 left-2 z-10 flex items-center gap-1 bg-primary/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
      <Maximize2 class="h-2.5 w-2.5 text-primary-foreground" />
      <span class="text-primary-foreground text-[10px] font-medium">Fullscreen</span>
    </div>

    <!-- Raise Hand Badge (✋) -->
    <button
      v-if="participant.isHandRaised"
      @click.stop="isHost && !participant.isLocal ? $emit('lower-hand', participant.identity) : null"
      class="absolute top-3 left-3 z-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg shadow-primary/30 animate-bounce transition-all"
      :class="(isHost && !participant.isLocal) ? 'hover:bg-primary hover:scale-110 cursor-pointer h-9 w-9' : 'h-8 w-8 cursor-default'"
      :title="(isHost && !participant.isLocal) ? 'Turunkan Tangan' : 'Sedang Angkat Tangan'"
    >
      <span class="text-sm">✋</span>
    </button>

    <!-- Overlay Info -->
    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Signal Quality Icon -->
          <Signal
            class="h-3.5 w-3.5 transition-colors duration-300"
            :class="signalColor"
            :title="signalTitle"
          />
          <span class="text-white text-xs font-semibold truncate max-w-[120px]">
            {{ participant.name ?? participant.identity }}
            <span v-if="participant.isLocal" class="text-white/70 font-normal"> (Anda)</span>
          </span>
          <!-- Host Badge -->
          <span v-if="isHost" class="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ml-1">Host</span>
        </div>
        <div class="flex items-center gap-1">
          <!-- Mic status -->
          <div
            class="h-6 w-6 rounded-full flex items-center justify-center"
            :class="participant.isMicEnabled ? 'bg-white/10' : 'bg-red-500/80'"
          >
            <Mic v-if="participant.isMicEnabled" class="h-3 w-3 text-white" />
            <MicOff v-else class="h-3 w-3 text-white" />
          </div>
          <!-- Screen share badge -->
          <div v-if="participant.isScreenSharing" class="h-6 w-6 rounded-full bg-blue-500/80 flex items-center justify-center">
            <Monitor class="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Speaking indicator (hanya tampil jika tidak tertutup hand badge) -->
    <div v-if="!participant.isHandRaised" class="absolute top-3 left-3 z-10">
      <div class="h-3 w-3 rounded-full bg-emerald-400 opacity-0 group-[.speaking]:opacity-100 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Mic, MicOff, Monitor, Pin, PinOff, Maximize2, Minimize2, ExternalLink, Signal } from 'lucide-vue-next'

import { useMeetStore } from '@/stores/meet'

const props = defineProps({
  participant: { type: Object, required: true },
  isPinned: { type: Boolean, default: false },
})

defineEmits(['pin', 'lower-hand'])

const meetStore = useMeetStore()
const isHost = computed(() => {
  if (props.participant.isLocal) {
    return meetStore.isHost
  }
  return props.participant.identity === meetStore.room?.host_name
})

const tileEl = ref(null)
const videoEl = ref(null)
const audioEl = ref(null)
const isSpeakingFast = ref(false)
const isFullscreen = ref(false)
let audioPollTimer = null

// --- Signal Quality Badge ---
const signalColor = computed(() => {
  const q = props.participant.connectionQuality
  if (q === 'excellent') return 'text-emerald-400'
  if (q === 'good') return 'text-amber-400'
  if (q === 'poor') return 'text-red-500 animate-pulse'
  return 'text-slate-500' // unknown
})

const signalTitle = computed(() => {
  const q = props.participant.connectionQuality
  if (q === 'excellent') return 'Sinyal Sangat Baik'
  if (q === 'good') return 'Sinyal Baik'
  if (q === 'poor') return 'Sinyal Buruk'
  return 'Mendeteksi Kualitas Jaringan...'
})

// --- Picture-in-Picture (PiP) ---
async function togglePiP() {
  if (!videoEl.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoEl.value.requestPictureInPicture()
    }
  } catch (err) {
    console.error('[ParticipantTile] PiP error:', err)
  }
}

// ── Fullscreen API ──
async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Masuk fullscreen — fullscreen-kan tile container agar overlay info ikut tampil
    try {
      await tileEl.value?.requestFullscreen()
    } catch (e) {
      // Fallback: fullscreen langsung elemen video
      await videoEl.value?.requestFullscreen?.()
    }
  } else {
    await document.exitFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  // Saat masuk fullscreen, paksa object-fit contain agar video terlihat penuh
  if (videoEl.value) {
    videoEl.value.style.objectFit = document.fullscreenElement ? 'contain' : (props.isPinned ? 'contain' : 'cover')
  }
}

// Attach video track ke elemen <video>
watch(() => props.participant.screenTrack ?? props.participant.videoTrack, async (newTrack, oldTrack) => {
  await nextTick()
  if (oldTrack && videoEl.value) {
    oldTrack.detach(videoEl.value)
  }
  if (newTrack && videoEl.value) {
    newTrack.attach(videoEl.value)
  }
}, { immediate: true })

// Attach audio track ke elemen <audio> (Hanya remote)
watch(() => props.participant.audioTrack, async (newTrack, oldTrack) => {
  await nextTick()
  if (oldTrack && audioEl.value) {
    oldTrack.detach(audioEl.value)
  }
  if (newTrack && audioEl.value && !props.participant.isLocal) {
    newTrack.attach(audioEl.value)
  }
}, { immediate: true })

onMounted(() => {
  // Polling Real-time langsung dari obyek LiveKit Client (tanpa delay Network SFU)
  audioPollTimer = setInterval(() => {
    const raw = props.participant.rawParticipant
    if (raw) {
      isSpeakingFast.value = raw.isSpeaking || raw.audioLevel > 0.05
    }
  }, 100)

  // Dengarkan event fullscreen change secara global
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  if (audioPollTimer) clearInterval(audioPollTimer)
  document.removeEventListener('fullscreenchange', onFullscreenChange)

  // CLEANUP DOM SECARA MUTLAK (Mencegah Memory Leak)
  const vTrack = props.participant.screenTrack ?? props.participant.videoTrack
  if (vTrack && videoEl.value) vTrack.detach(videoEl.value)
  
  const aTrack = props.participant.audioTrack
  if (aTrack && audioEl.value) aTrack.detach(audioEl.value)
})

// Initials dari nama
const initials = computed(() => {
  const name = props.participant.name ?? props.participant.identity ?? '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

// Warna avatar berbeda per participant
const avatarGradients = [
  'from-blue-900 to-blue-700',
  'from-violet-900 to-violet-700',
  'from-emerald-900 to-emerald-700',
  'from-rose-900 to-rose-700',
  'from-amber-900 to-amber-700',
  'from-cyan-900 to-cyan-700',
]

const avatarGradient = computed(() => {
  const id = props.participant.identity ?? ''
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarGradients.length
  return avatarGradients[index]
})
</script>
