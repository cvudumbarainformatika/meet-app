<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div class="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" @click.stop>
        <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
          <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            Notulen Rapat
          </h3>
          <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="p-6 flex-1">
          <div class="mb-4 text-sm text-muted-foreground">
            Menulis notulen untuk sesi <strong class="text-foreground">{{ session?.room_name }}</strong> 
            pada {{ formatDate(session?.started_at) }}
          </div>
          <textarea
            :value="modelValue"
            @input="emit('update:modelValue', $event.target.value)"
            rows="8"
            class="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            placeholder="Tuliskan catatan, keputusan, atau poin penting rapat di sini..."
          ></textarea>
        </div>

        <div class="px-6 py-4 border-t border-border bg-card/50 flex justify-end gap-3">
          <button 
            @click="emit('close')"
            class="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-medium transition-all"
          >
            Batal
          </button>
          <button 
            @click="emit('save')"
            :disabled="saving"
            class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium transition-all flex items-center gap-2"
          >
            <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            Simpan Notulen
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { FileText, X, Loader2, Save } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  session: Object,
  modelValue: String,
  saving: Boolean
})

const emit = defineEmits(['close', 'save', 'update:modelValue'])

function formatDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(isoDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
