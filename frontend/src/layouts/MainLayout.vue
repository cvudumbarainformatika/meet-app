<template>
  <SidebarProvider>
    <div class="flex min-h-screen w-full bg-background text-foreground">
      <!-- Sidebar -->
      <Sidebar>
        <SidebarHeader class="border-b border-border/30 px-4 py-4 flex flex-row items-center gap-3">
          <img src="/logo.png" alt="Logo" class="h-8 w-8 object-contain" />
          <div class="flex flex-col">
            <h2 class="text-sm font-bold tracking-tight text-sidebar-foreground">e-RTLH</h2>
            <p class="text-[10px] text-muted-foreground font-medium uppercase leading-none">Kota Probolinggo</p>
          </div>
        </SidebarHeader>
        
        <SidebarContent class="py-4">
          <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <router-link to="/app" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" exact-active-class="bg-accent text-accent-foreground">
                    <LayoutDashboard class="h-4 w-4" />
                    <span>Dashboard</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/entry" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/entry') }">
                    <FileText class="h-4 w-4" />
                    <span>Entry Data RTLH</span>
                  </router-link>
                </SidebarMenuItem>
                <!-- 
                <SidebarMenuItem>
                  <router-link to="/app/verifikasi-lpmk" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/verifikasi-lpmk') }">
                    <ClipboardCheck class="h-4 w-4" />
                    <span>Verifikasi LPMK</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/entry-perkim" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/entry-perkim') }">
                    <Building2 class="h-4 w-4" />
                    <span>Entry Dinas Perkim</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/entry-surveyor" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/entry-surveyor') }">
                    <MapPin class="h-4 w-4" />
                    <span>Entry Detail Surveyor</span>
                  </router-link>
                </SidebarMenuItem>
                -->
                <SidebarMenuItem>
                  <router-link to="/app/settings" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/settings') }">
                    <Settings class="h-4 w-4" />
                    <span>Pengaturan</span>
                  </router-link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <!-- Database & Laporan (Admin & Dinas) -->
          <SidebarGroup v-if="auth.isAdmin || auth.isDinas">
            <SidebarGroupLabel>Database & Laporan</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <!-- 
                <SidebarMenuItem>
                  <router-link to="/app/super-entry" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" exact-active-class="bg-accent text-accent-foreground">
                    <Key class="h-4 w-4" />
                    <span>Super Entry</span>
                  </router-link>
                </SidebarMenuItem>
                -->
                <SidebarMenuItem>
                  <router-link to="/app/rekap" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" exact-active-class="bg-accent text-accent-foreground">
                    <BarChart3 class="h-4 w-4" />
                    <span>Rekap e-RTLH</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/intervensi" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" exact-active-class="bg-accent text-accent-foreground">
                    <HelpingHand class="h-4 w-4" />
                    <span>Tambah Intervensi</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/activity-logs" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" exact-active-class="bg-accent text-accent-foreground">
                    <Activity class="h-4 w-4" />
                    <span>Audit Log Sistem</span>
                  </router-link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <!-- CMS Konten Publik (Admin & Dinas) -->
          <SidebarGroup v-if="auth.isAdmin || auth.isDinas">
            <SidebarGroupLabel>Konten Publik</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <router-link to="/app/cms/beranda" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/cms/beranda') }">
                    <LayoutTemplate class="h-4 w-4" />
                    <span>Kelola Beranda</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/cms/panduan" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/cms/panduan') }">
                    <BookOpen class="h-4 w-4" />
                    <span>Kelola Panduan</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/cms/galeri" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/cms/galeri') }">
                    <GalleryHorizontal class="h-4 w-4" />
                    <span>Kelola Galeri</span>
                  </router-link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <router-link to="/app/cms/syarat" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" :class="{ 'bg-accent text-accent-foreground': $route.path.startsWith('/app/cms/syarat') }">
                    <FileCheck class="h-4 w-4" />
                    <span>Kelola Syarat & Ketentuan</span>
                  </router-link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter class="border-t border-border/30 p-4 flex flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <User class="h-4 w-4 text-primary" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-xs font-semibold truncate">{{ auth.user?.nama || 'Admin User' }}</span>
              <span class="text-[10px] text-muted-foreground truncate">{{ auth.user?.username || 'admin' }}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" @click="handleLogout" title="Keluar">
            <LogOut class="h-4 w-4" />
          </Button>
        </SidebarFooter>
      </Sidebar>

      <!-- Main Content Area -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Top Navbar -->
        <header class="flex h-16 items-center border-b border-border/30 px-6 gap-4 bg-card/95 backdrop-blur-sm sticky top-0 z-10 w-full justify-between">
          <div class="flex items-center gap-4">
            <SidebarTrigger />
            <h1 class="text-sm font-bold md:text-base capitalize">{{ route.meta.title || 'Dashboard' }}</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle (Premium Subtle Icon) -->
            <button
              @click="toggleDarkMode"
              class="flex items-center justify-center h-8 w-8 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-full shadow-sm transition-all z-50 ml-2 border border-border"
              aria-label="Toggle theme"
            >
              <Sun v-if="isDark" class="h-4 w-4 text-yellow-500" />
              <Moon v-else class="h-4 w-4 text-slate-700" />
            </button>
          </div>
        </header>

        <!-- Dynamic Page Content -->
        <main class="flex-1 overflow-auto px-0 md:p-8 bg-muted/30">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
import { 
  LayoutDashboard, 
  User, 
  Sun, 
  Moon,
  LogOut,
  PenTool,
  FileText,
  ClipboardCheck,
  Building2,
  MapPin,
  CheckSquare,
  Settings,
  Key,
  BarChart3,
  HelpingHand,
  Wrench,
  Activity,
  BookOpen,
  GalleryHorizontal,
  FileCheck,
  LayoutTemplate
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const $q = useQuasar()
const isDark = ref(false)

onMounted(() => {
  isDark.value = $q.dark.isActive
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

const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>