<template>
  <!-- Login Page -->
  <div class="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
    
    <!-- Animated Background Blobs -->
    <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10 animate-fade-in-up">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primary/40">
          <Video class="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 class="text-foreground text-3xl font-extrabold tracking-tight">Selamat Datang Kembali</h1>
        <p class="text-muted-foreground text-sm mt-2">Masuk ke {{ settingsStore.appName }} untuk memulai meeting</p>
      </div>

      <!-- Card -->
      <div class="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        <form @submit.prevent="handleSubmit" class="space-y-6 relative z-10">
          <div class="space-y-1">
            <label class="text-muted-foreground text-xs uppercase tracking-widest font-bold ml-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="nama@email.com"
              class="w-full bg-background/50 border border-border rounded-xl px-5 py-4 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
              required
            />
          </div>
          <div class="space-y-1">
            <label class="text-muted-foreground text-xs uppercase tracking-widest font-bold ml-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Masukkan password"
              class="w-full bg-background/50 border border-border rounded-xl px-5 py-4 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
              required
            />
          </div>

          <Transition name="fade">
            <div v-if="error" class="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle class="h-4 w-4 flex-shrink-0 text-destructive" />
              {{ error }}
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
            <LogIn v-else class="h-5 w-5" />
            {{ loading ? 'Memproses...' : 'Masuk ke Dashboard' }}
          </button>
        </form>

        <div class="text-center text-muted-foreground text-sm mt-8 relative z-10 pt-6 border-t border-border">
          Belum punya akun?
          <RouterLink to="/register" class="text-primary hover:text-primary/80 font-semibold ml-1 transition-colors">
            Daftar Gratis
          </RouterLink>
        </div>
      </div>
      
      <!-- Back to home -->
      <div class="text-center mt-6">
        <RouterLink to="/" class="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2">
          <ArrowLeft class="h-4 w-4" />
          Kembali ke Beranda
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Video, Loader2, AlertCircle, LogIn, ArrowLeft } from 'lucide-vue-next'
import { api as axios } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const settingsStore = useSettingsStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/auth/login', form.value)
    if (res.data.success) {
      auth.setAuth(res.data.data.user, res.data.data.token)
      router.push({ path: '/', query: route.query })
    }
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Kredensial tidak valid'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
