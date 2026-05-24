<template>
  <div class="max-w-md mx-auto w-full">
    <!-- Card: Join Room -->
    <div class="bg-card border border-border rounded-3xl p-6 sm:p-8 hover:border-primary/40 transition-all duration-300 group shadow-2xl shadow-black/20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div class="relative z-10">
        <div class="flex items-center gap-4 mb-8">
          <div class="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <LogIn class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-card-foreground font-bold text-xl">Gabung Room</h2>
            <p class="text-muted-foreground text-sm mt-0.5">Punya kode undangan?</p>
          </div>
        </div>

        <form @submit.prevent="emit('join')" class="space-y-5">
          <div class="group/input">
            <label class="text-muted-foreground/90 text-xs font-bold mb-2 block uppercase tracking-wider text-left">Kode / Slug Room</label>
            <div class="relative">
              <input
                :value="joinForm.slug"
                @input="updateJoinForm('slug', $event.target.value)"
                type="text"
                placeholder="contoh: meeting-tim-alpha"
                class="w-full bg-background border border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground/50 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div v-if="joinForm.showPassword" class="animate-fade-in-up">
            <label class="text-muted-foreground/90 text-xs font-bold mb-2 block uppercase tracking-wider text-left">Password Room</label>
            <input
              :value="joinForm.password"
              @input="updateJoinForm('password', $event.target.value)"
              type="password"
              placeholder="Masukkan password..."
              class="w-full bg-background border border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3.5 text-foreground placeholder-muted-foreground/50 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            :disabled="joining"
            class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group-hover:shadow-primary/40"
          >
            <Loader2 v-if="joining" class="h-5 w-5 animate-spin" />
            <ArrowRight v-else class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            {{ joining ? 'Menghubungkan...' : 'Gabung Sekarang' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LogIn, ArrowRight, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  joinForm: Object,
  joining: Boolean
})

const emit = defineEmits(['update:joinForm', 'join'])

function updateJoinForm(field, value) {
  emit('update:joinForm', { ...props.joinForm, [field]: value })
}
</script>
