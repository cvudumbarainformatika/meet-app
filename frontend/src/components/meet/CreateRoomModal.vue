<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <!-- Modal Box -->
      <div 
        class="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" 
        @click.stop
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
          <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
            <Plus class="h-5 w-5 text-success" />
            Buat Room Baru
          </h3>
          <button @click="emit('close')" class="text-muted-foreground hover:text-foreground transition-colors">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <form @submit.prevent="emit('create')" class="p-6 space-y-5 text-left">
          <div>
            <label class="text-muted-foreground/90 text-xs font-bold mb-2 block uppercase tracking-wider">Nama / Topik Room</label>
            <input
              :value="createForm.name"
              @input="updateForm('name', $event.target.value)"
              type="text"
              placeholder="contoh: Standup Harian"
              class="w-full bg-background border border-border/80 hover:border-success/50 focus:border-success focus:ring-2 focus:ring-success/20 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label class="text-muted-foreground/90 text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
              Password
              <span class="normal-case text-muted-foreground/60 font-normal bg-white/5 px-2 py-0.5 rounded text-[10px]">Opsional</span>
            </label>
            <input
              :value="createForm.password"
              @input="updateForm('password', $event.target.value)"
              type="password"
              placeholder="Biarkan kosong jika publik"
              class="w-full bg-background border border-border/80 hover:border-success/50 focus:border-success focus:ring-2 focus:ring-success/20 rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none transition-all"
            />
          </div>

          <!-- Modal Footer (Actions) -->
          <div class="pt-4 border-t border-border bg-card/50 flex justify-end gap-3 -mx-6 -mb-6 p-6">
            <button 
              type="button"
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-medium transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              :disabled="creating"
              class="px-5 py-2.5 rounded-xl bg-success hover:bg-success/90 disabled:opacity-50 text-success-foreground font-semibold transition-all shadow-lg shadow-success/20 flex items-center justify-center gap-2 group-hover:shadow-success/40"
            >
              <Loader2 v-if="creating" class="h-4 w-4 animate-spin" />
              <Plus v-else class="h-4 w-4" />
              {{ creating ? 'Membuat Room...' : 'Mulai Meeting' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Plus, X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  createForm: Object,
  creating: Boolean
})

const emit = defineEmits(['close', 'create', 'update:createForm'])

function updateForm(field, value) {
  emit('update:createForm', { ...props.createForm, [field]: value })
}
</script>
