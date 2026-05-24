<template>
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2 sm:px-6 py-2 sm:py-4 bg-background/80 border-t border-border flex-shrink-0 z-20">

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

    <!-- Raise Hand Button -->
    <button
      @click="emit('toggle-raise-hand')"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-lg"
      :class="isHandRaised
        ? 'bg-amber-500 border-amber-500 hover:bg-amber-600 text-white font-semibold shadow-amber-500/20'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
      title="Angkat atau turunkan tangan"
    >
      <span class="text-sm">🙋</span>
      <span class="text-xs font-semibold hidden md:inline">
        {{ isHandRaised ? 'Turunkan Tangan' : 'Angkat Tangan' }}
      </span>
    </button>

    <!-- Emoji Reactions Popover Button -->
    <div class="relative">
      <button
        @click="showReactions = !showReactions"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card hover:bg-card/80 text-foreground transition-all shadow-lg"
        :class="showReactions ? 'border-primary bg-primary/10 text-primary' : 'border-border'"
        title="Kirim emoji reaksi ke peserta lain"
      >
        <Smile class="h-4 w-4" />
        <span class="text-xs font-semibold hidden md:inline">Reaksi</span>
      </button>
      
      <!-- Reaction Emojis Grid -->
      <Transition name="fade">
        <div
          v-if="showReactions"
          class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl p-2.5 shadow-2xl flex items-center gap-1.5 z-30 backdrop-blur-xl"
        >
          <button
            v-for="emoji in ['💖', '👍', '👏', '😂', '🎉', '😮']"
            :key="emoji"
            @click="handleReaction(emoji)"
            class="h-9 w-9 text-2xl hover:scale-125 transition-transform flex items-center justify-center rounded-lg hover:bg-white/5 active:scale-90"
          >
            {{ emoji }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Recording Button (Host Only) -->
    <button
      v-if="isHost"
      @click="emit('toggle-recording')"
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-lg"
      :class="isRecording
        ? 'bg-destructive border-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold animate-pulse shadow-destructive/20'
        : 'bg-card hover:bg-card/80 text-foreground border-border'"
      title="Mulai/Hentikan Rekam Meeting"
    >
      <div class="h-2 w-2 rounded-full bg-destructive" :class="{ 'bg-white animate-ping': isRecording }" />
      <span class="text-xs font-semibold hidden md:inline">
        {{ isRecording ? 'Hentikan Rekam' : 'Rekam' }}
      </span>
    </button>

    <!-- Mute All & Lower Hands Dropdown (Host Only) -->
    <div v-if="isHost" class="relative group hidden sm:block">
      <button
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card hover:bg-card/80 text-foreground border-border transition-all shadow-lg"
        title="Kontrol Host"
      >
        <Shield class="h-4 w-4 text-primary" />
        <span class="text-xs font-semibold hidden md:inline">Host</span>
      </button>
      
      <!-- Dropdown Menu -->
      <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl p-2 shadow-2xl flex flex-col gap-1 z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 backdrop-blur-xl">
        <button
          @click="emit('mute-all')"
          class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-xs font-medium w-full text-left"
        >
          <MicOff class="h-4 w-4" />
          Bisukan Semua
        </button>
        <button
          @click="emit('lower-all-hands')"
          class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors text-xs font-medium w-full text-left"
        >
          <span class="text-base">🤚</span>
          Turunkan Semua Tangan
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="hidden sm:block w-px h-8 bg-border mx-1 sm:mx-2" />

    <!-- Leave Button -->
    <button
      @click="emit('leave')"
      class="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-sm transition-all shadow-lg shadow-destructive/20"
      title="Tinggalkan Meeting"
    >
      <PhoneOff class="h-4 w-4" />
      <span class="hidden sm:inline">Tinggalkan</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  PhoneOff, Smile, Shield
} from 'lucide-vue-next'
import ControlButton from '@/components/meet/ControlButton.vue'

const props = defineProps({
  isMicEnabled: Boolean,
  isCameraEnabled: Boolean,
  isScreenSharing: Boolean,
  isHandRaised: Boolean,
  isHost: Boolean,
  isRecording: Boolean
})

const emit = defineEmits([
  'toggle-mic', 'toggle-camera', 'toggle-screen-share', 'toggle-raise-hand',
  'send-reaction', 'toggle-recording', 'mute-all', 'lower-all-hands', 'leave'
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
