<template>
  <div class="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
    <!-- Navbar (Glassmorphism) -->
    <header 
      class="fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b"
      :class="[
        isScrolled 
          ? 'bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-border/40 shadow-sm py-3' 
          : 'bg-transparent border-transparent py-5'
      ]"
    >
      <div class="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="relative w-10 h-10 overflow-hidden rounded-xl bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
            <img src="/logo.png" alt="Logo e-RTLH" class="w-full h-full object-contain" />
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">e-RTLH</span>
            <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">Kota Probolinggo</span>
          </div>
        </router-link>

        <!-- Desktop Menu -->
        <nav class="hidden lg:flex items-center gap-1">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:text-primary hover:bg-primary/5"
            exact-active-class="text-primary bg-primary/10 font-semibold"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Right Side (Login & Theme) -->
        <div class="hidden lg:flex items-center gap-3">
          <button
            @click="toggleDarkMode"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-yellow-500 transition-transform duration-500 rotate-0 scale-100" />
            <Moon v-else class="w-5 h-5 text-slate-700 transition-transform duration-500 rotate-0 scale-100" />
          </button>


        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Menu Dropdown -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMobileMenuOpen" class="lg:hidden absolute top-full left-0 right-0 bg-slate-50 dark:bg-slate-950 border-b border-border shadow-lg">
          <nav class="flex flex-col p-4 gap-2">
            <router-link 
              v-for="item in menuItems" 
              :key="item.path"
              :to="item.path"
              @click="isMobileMenuOpen = false"
              class="px-4 py-3 text-base font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              exact-active-class="bg-primary/10 text-primary font-semibold"
            >
              {{ item.name }}
            </router-link>
            
            <div class="h-px bg-border my-2"></div>
            
            <div class="flex items-center justify-between px-4 py-2">
              <span class="text-sm font-medium">Tema Gelap</span>
              <button
                @click="toggleDarkMode"
                class="p-2 rounded-full bg-muted text-muted-foreground"
              >
                <Sun v-if="isDark" class="w-5 h-5 text-yellow-500" />
                <Moon v-else class="w-5 h-5 text-slate-700" />
              </button>
            </div>

          </nav>
        </div>
      </transition>
    </header>

    <!-- Main Content Area with Route Transitions -->
    <main class="flex-1 w-full relative">
      <router-view v-slot="{ Component }">
        <transition 
          name="page" 
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Simple Footer -->
    <footer class="border-t border-border bg-card/50 py-8 md:py-12 mt-auto">
      <div class="container mx-auto px-4 text-center">
        <p class="text-muted-foreground text-sm">
          &copy; {{ new Date().getFullYear() }} Sistem Informasi e-RTLH Kota Probolinggo. <br class="md:hidden" />Dikelola oleh Dinas Perumahan dan Kawasan Permukiman.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const $q = useQuasar()
const isDark = ref(false)
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const menuItems = [
  { name: 'Beranda', path: '/' },
  { name: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
  { name: 'Galeri', path: '/galeri' },
  { name: 'Panduan', path: '/panduan' },
  // { name: 'Informasi', path: '/informasi' }, // Belum ada konfirmasi
  { name: 'Cek DTSN', path: '/cek-dtsn' },
  { name: 'Web GIS', path: '/web-gis' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  isDark.value = $q.dark.isActive
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function toggleDarkMode() {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive
  
  // Sync with Tailwind/Global CSS Variables
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
