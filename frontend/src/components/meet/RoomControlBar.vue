<template>
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-4 bg-background/80 border-t border-border flex-shrink-0 z-20">

    <!-- Mic -->
    <ControlButton
      :active="isMicEnabled"
      :icon-on="Mic"
      :icon-off="MicOff"
      label="Mikrofon"
      color="default"
      @toggle="emit('toggle-mic')"
    />

    <!-- Camera -->
    <ControlButton
      :active="isCameraEnabled"
      :icon-on="Camera"
      :icon-off="CameraOff"
      label="Kamera"
      color="default"
      @toggle="emit('toggle-camera')"
    />

    <!-- Screen Share -->
    <ControlButton
      :active="!isScreenSharing"
      :icon-on="Monitor"
      :icon-off="MonitorOff"
      label="Screen Share"
      color="blue"
      @toggle="emit('toggle-screen-share')"
    />

    <!-- Spacer -->
    <div class="w-px h-8 bg-border/60 mx-1 shrink-0" />

    <!-- Raise Hand Button -->
    <button
      @click="emit('toggle-raise-hand')"
      class="h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
      :class="isHandRaised
        ? 'bg-primary border-primary text-white shadow-primary/30'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
    >
      <span class="text-lg">✋</span>
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        {{ isHandRaised ? 'Turunkan Tangan' : 'Angkat Tangan' }}
      </q-tooltip>
    </button>

    <!-- Emoji Reactions Popover Button -->
    <div class="relative">
      <button
        @click="showReactions = !showReactions"
        class="h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
        :class="showReactions ? 'border-primary bg-primary/10 text-primary' : 'bg-card hover:bg-card/80 text-foreground border-border'"
      >
        <Smile class="h-5 w-5" />
        
        <!-- Quasar Tooltip (Discord Style) -->
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
          Reaksi Emoji
        </q-tooltip>
      </button>
      
      <!-- Reaction Emojis Grid -->
      <Transition name="fade">
        <div
          v-if="showReactions"
          class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl p-2.5 shadow-2xl flex items-center gap-1.5 z-30 backdrop-blur-xl animate-none"
        >
          <button
            v-for="emoji in ['💖', '👍', '👏', '😂', '🎉', '😮']"
            :key="emoji"
            @click="handleReaction(emoji)"
            class="h-9 w-9 text-2xl hover:scale-125 transition-transform flex items-center justify-center rounded-lg hover:bg-white/5 active:scale-90 cursor-pointer"
          >
            {{ emoji }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Host Controls / Toggle Participants (Host Only) -->
    <button
      v-if="isHost"
      @click="emit('toggle-participants')"
      class="h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
      :class="showParticipants
        ? 'border-primary bg-primary/10 text-primary'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
    >
      <Shield class="h-5 w-5" />
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        Daftar Peserta (Host)
      </q-tooltip>
    </button>

    <!-- Whiteboard Button -->
    <button
      @click="emit('toggle-whiteboard')"
      class="h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
      :class="showWhiteboard
        ? 'border-primary bg-primary/10 text-primary'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
    >
      <Palette class="h-5 w-5" />
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        Papan Tulis Kolaboratif
      </q-tooltip>
    </button>

    <!-- Jajak Pendapat & Tanya Jawab Button -->
    <button
      @click="emit('toggle-polls-qna')"
      class="h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
      :class="showPollsQna
        ? 'border-primary bg-primary/10 text-primary'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
    >
      <Vote class="h-5 w-5" />
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        Jajak Pendapat & Tanya Jawab
      </q-tooltip>
    </button>

    <!-- Settings Button (Open Media Options) -->
    <button
      @click="emit('open-settings')"
      class="h-12 w-12 rounded-full border border-border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer bg-card hover:bg-card/80 text-foreground"
    >
      <Settings class="h-5 w-5" />
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        Pengaturan Media
      </q-tooltip>
    </button>

    <!-- Divider Spacer -->
    <div class="w-px h-8 bg-border/60 mx-1 shrink-0" />

    <!-- Leave Button -->
    <button
      @click="emit('leave')"
      class="h-12 w-12 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg shadow-destructive/20 cursor-pointer"
    >
      <PhoneOff class="h-5 w-5" />
      
      <!-- Quasar Tooltip (Discord Style) -->
      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="bg-card text-foreground border border-border shadow-xl text-xs font-semibold rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        Tinggalkan Rapat
      </q-tooltip>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  PhoneOff, Smile, Shield, Settings, Palette, Vote
} from 'lucide-vue-next'
import ControlButton from '@/components/meet/ControlButton.vue'

const props = defineProps({
  isMicEnabled: Boolean,
  isCameraEnabled: Boolean,
  isScreenSharing: Boolean,
  isHandRaised: Boolean,
  isHost: Boolean,
  isRecording: Boolean,
  showParticipants: Boolean,
  showWhiteboard: Boolean,
  showPollsQna: Boolean
})

const emit = defineEmits([
  'toggle-mic', 'toggle-camera', 'toggle-screen-share', 'toggle-raise-hand',
  'send-reaction', 'toggle-recording', 'mute-all', 'lower-all-hands', 'leave',
  'toggle-participants', 'open-settings', 'toggle-whiteboard', 'toggle-polls-qna'
])

const showReactions = ref(false)

function handleReaction(emoji) {
  emit('send-reaction', emoji)
  showReactions.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.95);
}
</style>
