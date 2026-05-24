<template>
  <Transition name="slide-chat">
    <div
      v-if="show"
      class="absolute top-0 right-0 bottom-0 w-[420px] max-w-full flex flex-col z-20 transition-all duration-300"
      :style="solid
        ? 'background: var(--background); border-left: 1px solid var(--border);'
        : 'background: hsl(var(--background) / 0.85); backdrop-filter: blur(20px); border-left: 1px solid var(--border);'"
    >
      <!-- Header Chat -->
      <div class="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <MessageSquare class="h-4 w-4 text-primary" />
          <h3 class="text-foreground text-sm font-semibold">Chat</h3>
          <span v-if="messages.length > 0" class="text-muted-foreground text-xs">({{ messages.length }})</span>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Toggle Blur/Solid -->
          <button
            @click="emit('update:solid', !solid)"
            :title="solid ? 'Aktifkan Blur' : 'Matikan Blur (Solid)'"
            class="h-7 w-7 flex items-center justify-center rounded-lg transition-all"
            :class="solid ? 'bg-primary/30 text-primary' : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground'"
          >
            <Layers2 class="h-3.5 w-3.5" />
          </button>
          <!-- Close -->
          <button
            @click="emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center pb-8">
          <MessageSquare class="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p class="text-muted-foreground text-xs">Belum ada pesan</p>
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="msg.isSelf ? 'items-end' : 'items-start'"
          class="flex flex-col"
        >
          <span class="text-muted-foreground text-[10px] mb-1 px-1">{{ msg.sender }}</span>
          <div
            :class="msg.isSelf
              ? 'bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-sm rounded-bl-2xl'
              : 'bg-card text-foreground border border-border rounded-tr-2xl rounded-tl-sm rounded-br-2xl'"
            class="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed"
          >
            {{ msg.text }}
          </div>
          <span class="text-muted-foreground/70 text-[9px] mt-1 px-1">
            {{ formatTime(msg.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-border flex-shrink-0">
        <div class="flex items-center gap-2 bg-background hover:bg-card rounded-xl px-4 py-2.5 transition-colors border border-border focus-within:border-primary/40">
          <input
            v-model="localInput"
            @keyup.enter="handleSend"
            type="text"
            placeholder="Ketik pesan..."
            class="flex-1 bg-transparent text-foreground text-sm placeholder-muted-foreground outline-none"
          />
          <button
            @click="handleSend"
            :disabled="!localInput.trim()"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground transition-all flex-shrink-0"
          >
            <Send class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { MessageSquare, Layers2, X, Send } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  solid: Boolean,
  messages: Array,
})

const emit = defineEmits(['close', 'update:solid', 'send'])

const localInput = ref('')
const messagesContainer = ref(null)

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function handleSend() {
  if (!localInput.value.trim()) return
  emit('send', localInput.value)
  localInput.value = ''
}

watch(() => props.messages.length, async () => {
  if (!props.show) return
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
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
