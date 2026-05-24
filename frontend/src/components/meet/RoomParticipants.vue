<template>
  <Transition name="slide-chat">
    <div
      v-if="show"
      class="absolute top-0 right-0 bottom-0 w-[420px] max-w-full flex flex-col z-20 transition-all duration-300"
      :style="solid
        ? 'background: var(--background); border-left: 1px solid var(--border);'
        : 'background: hsl(var(--background) / 0.85); backdrop-filter: blur(20px); border-left: 1px solid var(--border);'"
    >
      <!-- Header Panel -->
      <div class="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <Users class="h-4 w-4 text-primary" />
          <h3 class="text-foreground text-sm font-semibold">Peserta</h3>
          <span class="text-muted-foreground text-xs">({{ participants.length }})</span>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Close -->
          <button
            @click="emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-4 border-b border-border flex-shrink-0">
        <div class="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border">
          <Search class="h-4 w-4 text-muted-foreground" />
          <input
            :value="search"
            @input="emit('update:search', $event.target.value)"
            type="text"
            placeholder="Cari peserta..."
            class="bg-transparent text-foreground text-xs outline-none flex-1 placeholder-muted-foreground"
          />
        </div>
      </div>

      <!-- Participants List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="p in filteredParticipants"
          :key="p.identity"
          class="flex items-center justify-between p-2.5 rounded-xl bg-card hover:bg-card/80 transition-colors border border-border group"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Avatar -->
            <div class="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center text-foreground text-xs font-semibold uppercase">
              {{ p.name ? p.name.substring(0, 2) : '?' }}
            </div>
            <!-- Name + Roles -->
            <div class="flex flex-col min-w-0">
              <span class="text-foreground text-xs font-medium truncate">
                {{ p.name || p.identity }}
                <span v-if="p.isLocal" class="text-muted-foreground text-[10px] font-normal"> (Anda)</span>
              </span>
              <!-- Badge host / raise hand -->
              <div class="flex items-center gap-1.5 mt-0.5">
                <span v-if="p.isLocal && isHost" class="text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded">Host</span>
                <span v-else-if="!p.isLocal && p.identity === hostName" class="text-[9px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded">Host</span>
                <span v-if="p.isHandRaised" class="text-[9px] font-medium bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <span>🙋</span> Angkat Tangan
                </span>
              </div>
            </div>
          </div>

          <!-- Participant Actions / Status -->
          <div class="flex items-center gap-2">
            <!-- Lower Hand button (only visible to Host for remote users when hand is raised) -->
            <button
              v-if="isHost && !p.isLocal && p.isHandRaised"
              @click="emit('lower-hand', p.identity)"
              class="h-6 w-6 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-500 flex items-center justify-center transition-all mr-1"
              title="Turunkan Tangan"
            >
              <span class="text-xs">🤚</span>
            </button>

            <!-- Mute button (only visible to Host for remote users) -->
            <button
              v-if="isHost && !p.isLocal"
              @click="emit('mute', p.identity)"
              class="h-6 w-6 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              title="Matikan Mikrofon"
            >
              <MicOff class="h-3.5 w-3.5" />
            </button>

            <!-- Status Icons (Mic/Cam) -->
            <div class="flex items-center gap-1">
              <Mic v-if="p.isMicEnabled" class="h-3.5 w-3.5 text-muted-foreground" />
              <MicOff v-else class="h-3.5 w-3.5 text-destructive/80" />
              
              <VideoIcon v-if="p.isCameraEnabled" class="h-3.5 w-3.5 text-muted-foreground" />
              <VideoOff v-else class="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Host Action (Mute All) -->
      <div
        v-if="isHost"
        class="p-4 border-t border-border flex-shrink-0 bg-background/50"
      >
        <button
          @click="emit('mute-all')"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 hover:border-transparent text-xs font-semibold transition-all mb-2"
        >
          <MicOff class="h-4 w-4" />
          Bisukan Semua Peserta
        </button>
        <button
          @click="emit('lower-all-hands')"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-transparent text-xs font-semibold transition-all"
        >
          <span class="text-sm">🤚</span>
          Turunkan Semua Tangan
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { Users, X, Search, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  solid: Boolean,
  participants: Array,
  isHost: Boolean,
  hostName: String,
  search: String,
})

const emit = defineEmits(['close', 'update:search', 'lower-hand', 'mute', 'mute-all', 'lower-all-hands'])

const filteredParticipants = computed(() => {
  if (!props.search.trim()) return props.participants
  const query = props.search.toLowerCase().trim()
  return props.participants.filter(p => {
    const name = (p.name || p.identity || '').toLowerCase()
    return name.includes(query)
  })
})
</script>

<style scoped>
.slide-chat-enter-active,
.slide-chat-leave-active {
  transition: all 0.25s ease;
}

.slide-chat-enter-from,
.slide-chat-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
