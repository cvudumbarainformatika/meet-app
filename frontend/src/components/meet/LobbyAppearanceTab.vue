<template>
  <div class="w-full max-w-5xl mx-auto animate-fade-in-up">
    <!-- Main Card Settings -->
    <div class="bg-card border border-border rounded-3xl p-6 relative overflow-hidden">
      <!-- Glow Effect Behind -->
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none"></div>

      <!-- Heading -->
      <div class="mb-8 border-b border-border/40 pb-5">
        <h3 class="text-xl font-extrabold text-foreground flex items-center gap-2.5">
          <Palette class="h-6 w-6 text-primary" /> Pengaturan Penampilan Global
        </h3>
        <p class="text-xs text-muted-foreground mt-1 text-left">
          Kustomisasi penamaan instansi (white-label) dan skema warna dasar aplikasi secara global untuk seluruh pengguna.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- FORM PENGATURAN (Lg: 7 cols) -->
        <div class="lg:col-span-7 space-y-6 text-left">
          <!-- 1. Pelabelan Aplikasi -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Nama Aplikasi / Lembaga</label>
            <div class="relative">
              <input 
                v-model="form.app_name"
                type="text" 
                placeholder="Masukkan nama aplikasi..."
                class="w-full bg-background border border-border/80 focus:border-primary/80 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
              />
              <Sparkles class="absolute right-4 top-3.5 h-4 w-4 text-primary/50" />
            </div>
          </div>

          <!-- 2. Mode Tampilan Global -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Mode Tampilan Global</label>
            <div class="flex gap-4">
              <button 
                @click="form.theme_mode = 'dark'"
                class="flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                :class="[
                  form.theme_mode === 'dark'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-white/5'
                ]"
              >
                <Moon class="h-4.5 w-4.5" />
                <span>Mode Gelap (Dark)</span>
              </button>
              
              <button 
                @click="form.theme_mode = 'light'"
                class="flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                :class="[
                  form.theme_mode === 'light'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-white/5'
                ]"
              >
                <Sun class="h-4.5 w-4.5" />
                <span>Mode Terang (Light)</span>
              </button>
            </div>
          </div>

          <!-- 3. Skema Warna -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider mb-2">Pilih Warna Global</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Warna Primer -->
              <div class="bg-background/40 border border-border/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="text-left">
                  <div class="text-xs font-bold text-foreground">Warna Primer</div>
                  <div class="text-[10px] text-muted-foreground">Aksen tombol & tautan</div>
                </div>
                <input 
                  type="color" 
                  v-model="form.primary_color"
                  class="h-9 w-14 rounded-lg cursor-pointer border border-border bg-transparent focus:outline-none"
                />
              </div>

              <!-- Warna Latar Belakang -->
              <div class="bg-background/40 border border-border/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="text-left">
                  <div class="text-xs font-bold text-foreground">Latar Belakang</div>
                  <div class="text-[10px] text-muted-foreground">Dasar halaman utama</div>
                </div>
                <input 
                  type="color" 
                  v-model="form.background_color"
                  class="h-9 w-14 rounded-lg cursor-pointer border border-border bg-transparent focus:outline-none"
                />
              </div>

              <!-- Warna Sidebar -->
              <div class="bg-background/40 border border-border/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="text-left">
                  <div class="text-xs font-bold text-foreground">Warna Sidebar</div>
                  <div class="text-[10px] text-muted-foreground">Panel navigasi samping</div>
                </div>
                <input 
                  type="color" 
                  v-model="form.sidebar_color"
                  class="h-9 w-14 rounded-lg cursor-pointer border border-border bg-transparent focus:outline-none"
                />
              </div>

              <!-- Warna Kartu/Panel -->
              <div class="bg-background/40 border border-border/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="text-left">
                  <div class="text-xs font-bold text-foreground">Warna Kartu/Card</div>
                  <div class="text-[10px] text-muted-foreground">Kotak konten & formulir</div>
                </div>
                <input 
                  type="color" 
                  v-model="form.card_color"
                  class="h-9 w-14 rounded-lg cursor-pointer border border-border bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- 3. Preset Tema Populer -->
          <div class="space-y-3 pt-2">
            <h4 class="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Pilih Preset Tema Siap Pakai</h4>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="preset in presets" 
                :key="preset.name"
                @click="applyPreset(preset)"
                class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5"
                :class="[
                  isCurrentPreset(preset) 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-white/5 border-border hover:bg-white/10 text-foreground'
                ]"
              >
                <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: preset.primary_color }"></div>
                {{ preset.name }}
              </button>
            </div>
          </div>

          <!-- Aksi Tombol -->
          <div class="flex items-center gap-3 pt-6 border-t border-border/40">
            <button 
              @click="saveChanges"
              :disabled="saving"
              class="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save v-if="!saving" class="h-4.5 w-4.5" />
              <Loader2 v-else class="h-4.5 w-4.5 animate-spin" />
              <span>{{ saving ? 'Menyimpan...' : 'Simpan Kustomisasi' }}</span>
            </button>
            
            <button 
              @click="resetForm"
              :disabled="saving"
              class="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- LIVE PREVIEW DINAMIS (Lg: 5 cols) -->
        <div class="lg:col-span-5 flex flex-col justify-start">
          <div class="sticky top-6">
            <h4 class="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider mb-3 text-left">Live Preview Tema</h4>
            
            <!-- Simulasi Layar Aplikasi Mini -->
            <div 
              class="w-full aspect-[4/3] rounded-3xl border border-white/10 overflow-hidden flex shadow-2xl relative transition-all duration-300"
              :class="{'theme-light': form.theme_mode === 'light'}"
              :style="{ backgroundColor: form.background_color }"
            >
              <!-- 1. Mini Sidebar -->
              <div 
                class="w-1/3 h-full border-r border-white/5 flex flex-col justify-between p-2.5 transition-all duration-300 select-none"
                :style="{ backgroundColor: form.sidebar_color }"
              >
                <div>
                  <div class="flex items-center gap-1 mb-4">
                    <div class="h-4 w-4 rounded bg-primary/20 flex items-center justify-center scale-90">
                      <Sparkles class="h-2.5 w-2.5 text-primary" :style="{ color: form.primary_color }" />
                    </div>
                    <span class="text-[8px] font-black text-foreground uppercase tracking-tight truncate leading-none">
                      {{ form.app_name }}
                    </span>
                  </div>
                  <!-- Simulasi Menu Saluran -->
                  <div class="space-y-1">
                    <div class="h-4 rounded bg-primary/15 flex items-center px-1.5 gap-1 select-none" :style="{ backgroundColor: form.primary_color + '26' }">
                      <span class="text-[8px] font-bold text-primary" :style="{ color: form.primary_color }"># lobi-utama</span>
                    </div>
                    <div class="h-4 rounded hover:bg-white/5 flex items-center px-1.5 gap-1 select-none">
                      <span class="text-[8px] text-muted-foreground"># riwayat-rapat</span>
                    </div>
                  </div>
                </div>

                <!-- Mini Profil -->
                <div class="h-7 bg-black/10 rounded-lg flex items-center justify-between p-1 select-none">
                  <div class="flex items-center gap-1">
                    <div class="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-bold uppercase text-primary" :style="{ backgroundColor: form.primary_color + '33', color: form.primary_color }">H</div>
                    <span class="text-[6px] font-bold text-foreground truncate max-w-[30px]">Hariyadi</span>
                  </div>
                  <LogOut class="h-2.5 w-2.5 text-muted-foreground scale-80" />
                </div>
              </div>

              <!-- 2. Mini Content Area -->
              <div class="flex-1 h-full p-4 flex flex-col justify-center items-center">
                <div 
                  class="w-full max-w-[160px] p-3 rounded-2xl border border-white/5 shadow-xl transition-all duration-300"
                  :style="{ backgroundColor: form.card_color }"
                >
                  <div class="h-2 w-12 rounded bg-muted-foreground/30 mb-2 mx-auto"></div>
                  <div class="h-1.5 w-20 rounded bg-muted-foreground/20 mb-3 mx-auto"></div>
                  <!-- Simulasi Tombol Primer -->
                  <div 
                    class="h-5 w-full rounded-lg bg-primary flex items-center justify-center text-[7px] font-extrabold text-primary-foreground shadow-sm transition-all duration-300"
                    :style="{ backgroundColor: form.primary_color }"
                  >
                    Gabung Rapat
                  </div>
                </div>
              </div>
            </div>
            
            <p class="text-[10px] text-muted-foreground mt-3 italic text-center">
              * Tampilan mini di atas mencerminkan skema warna yang Anda pilih secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Toast Notification (Custom) -->
    <Transition name="fade-slide-up">
      <div 
        v-if="toast.show" 
        class="fixed bottom-6 right-6 z-50 border px-5 py-4 rounded-xl text-sm flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in-up"
        :class="[
          toast.success 
            ? 'bg-success/10 border-success/30 text-success' 
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        ]"
      >
        <CheckCircle2 v-if="toast.success" class="h-5 w-5" />
        <AlertTriangle v-else class="h-5 w-5" />
        <span class="font-medium">{{ toast.message }}</span>
        <button @click="toast.show = false" class="ml-2 hover:opacity-80 transition-opacity">
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { 
  Palette, 
  Sparkles, 
  Save, 
  Loader2, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Moon,
  Sun
} from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const form = ref({
  app_name: 'MeetApp',
  primary_color: '#5865f2',
  background_color: '#313338',
  sidebar_color: '#1e1f22',
  card_color: '#2b2d31',
  logo_url: null,
  theme_mode: 'dark'
})

const saving = ref(false)
const toast = ref({ show: false, success: true, message: '' })

// Daftar Preset Tema Menawan (Solid Discord flat design)
const presets = [
  {
    name: 'Ultra-Dark Premium (Default)',
    primary_color: '#5865f2',
    background_color: '#101113',
    sidebar_color: '#0c0d0e',
    card_color: '#17181c',
    theme_mode: 'dark'
  },
  {
    name: 'Discord Dark Asli',
    primary_color: '#5865f2',
    background_color: '#313338',
    sidebar_color: '#1e1f22',
    card_color: '#2b2d31',
    theme_mode: 'dark'
  },
  {
    name: 'Midnight Ocean',
    primary_color: '#0284c7',
    background_color: '#0b132b',
    sidebar_color: '#050814',
    card_color: '#1c2541',
    theme_mode: 'dark'
  },
  {
    name: 'Forest Green',
    primary_color: '#2e7d32',
    background_color: '#121e15',
    sidebar_color: '#090e0a',
    card_color: '#1b291d',
    theme_mode: 'dark'
  },
  {
    name: 'Tangerine Orange',
    primary_color: '#f97316',
    background_color: '#1a0f05',
    sidebar_color: '#0f0903',
    card_color: '#28180c',
    theme_mode: 'dark'
  },
  {
    name: 'Volcanic Red',
    primary_color: '#ef4444',
    background_color: '#1a0505',
    sidebar_color: '#0f0303',
    card_color: '#2b0c0c',
    theme_mode: 'dark'
  },
  {
    name: 'Golden Amber',
    primary_color: '#f59e0b',
    background_color: '#140f03',
    sidebar_color: '#0a0802',
    card_color: '#221907',
    theme_mode: 'dark'
  },
  {
    name: 'Cyberpunk Neon',
    primary_color: '#ff007f',
    background_color: '#0d0211',
    sidebar_color: '#050007',
    card_color: '#17051f',
    theme_mode: 'dark'
  },
  {
    name: 'Midnight Rose',
    primary_color: '#ec4899',
    background_color: '#1c0a13',
    sidebar_color: '#0f050a',
    card_color: '#2d1120',
    theme_mode: 'dark'
  },
  {
    name: 'Classic Light ☀️',
    primary_color: '#3b82f6',
    background_color: '#f3f4f6',
    sidebar_color: '#ffffff',
    card_color: '#ffffff',
    theme_mode: 'light'
  },
  {
    name: 'Forest Light 🍃',
    primary_color: '#2e7d32',
    background_color: '#f0f7f1',
    sidebar_color: '#ffffff',
    card_color: '#ffffff',
    theme_mode: 'light'
  },
  {
    name: 'Orange Light 🍊',
    primary_color: '#f97316',
    background_color: '#fffaf5',
    sidebar_color: '#ffffff',
    card_color: '#ffffff',
    theme_mode: 'light'
  }
]

onMounted(() => {
  resetForm()
})

// Auto-switch warna cerdas saat beralih antara Mode Gelap & Mode Terang
watch(() => form.value.theme_mode, (newMode) => {
  if (newMode === 'light') {
    // Jika beralih ke light, dan warna saat ini masih gelap,
    // kita set ke default light (Classic Light) agar tidak terlihat "lucu"
    if (form.value.background_color === '#101113' || form.value.background_color === '#313338' || form.value.background_color === '#121e15' || form.value.background_color === '#0b132b' || form.value.background_color === '#1a0f05' || form.value.background_color === '#1a0505') {
      form.value.primary_color = '#3b82f6'
      form.value.background_color = '#f3f4f6'
      form.value.sidebar_color = '#ffffff'
      form.value.card_color = '#ffffff'
    }
  } else {
    // Jika beralih ke dark, dan warna saat ini masih terang,
    // kita kembalikan ke default dark (Ultra-Dark Premium)
    if (form.value.background_color === '#f3f4f6' || form.value.background_color === '#ffffff' || form.value.background_color === '#f0f7f1' || form.value.background_color === '#fffaf5') {
      form.value.primary_color = '#5865f2'
      form.value.background_color = '#101113'
      form.value.sidebar_color = '#0c0d0e'
      form.value.card_color = '#17181c'
    }
  }
})

function resetForm() {
  form.value = {
    app_name: settingsStore.appName,
    primary_color: settingsStore.primaryColor,
    background_color: settingsStore.backgroundColor,
    sidebar_color: settingsStore.sidebarColor,
    card_color: settingsStore.cardColor,
    logo_url: settingsStore.logoUrl,
    theme_mode: settingsStore.themeMode || 'dark'
  }
}

function applyPreset(preset) {
  form.value.primary_color = preset.primary_color
  form.value.background_color = preset.background_color
  form.value.sidebar_color = preset.sidebar_color
  form.value.card_color = preset.card_color
  form.value.theme_mode = preset.theme_mode || 'dark'
}

function isCurrentPreset(preset) {
  return form.value.primary_color.toLowerCase() === preset.primary_color.toLowerCase() &&
         form.value.background_color.toLowerCase() === preset.background_color.toLowerCase() &&
         form.value.sidebar_color.toLowerCase() === preset.sidebar_color.toLowerCase() &&
         form.value.card_color.toLowerCase() === preset.card_color.toLowerCase() &&
         form.value.theme_mode === preset.theme_mode
}

async function saveChanges() {
  if (!form.value.app_name.trim()) {
    showToast(false, 'Nama aplikasi / lembaga tidak boleh kosong')
    return
  }
  
  saving.value = true
  const res = await settingsStore.updateGlobalSettings({
    app_name: form.value.app_name.trim(),
    primary_color: form.value.primary_color,
    background_color: form.value.background_color,
    sidebar_color: form.value.sidebar_color,
    card_color: form.value.card_color,
    logo_url: form.value.logo_url,
    theme_mode: form.value.theme_mode
  })

  if (res.success) {
    showToast(true, 'Pengaturan penampilan global berhasil disimpan & diterapkan!')
  } else {
    showToast(false, res.message || 'Gagal menyimpan pengaturan')
  }
  saving.value = false
}

function showToast(success, message) {
  toast.value = {
    show: true,
    success,
    message
  }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}
</script>

<style scoped>
/* Transisi micro animations */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.9);
}
</style>
