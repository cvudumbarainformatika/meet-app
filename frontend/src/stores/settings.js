import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api as axios } from '@/boot/axios'

export const useSettingsStore = defineStore('settings', () => {
  const appName = ref('MeetApp')
  const primaryColor = ref('#5865f2')
  const backgroundColor = ref('#313338')
  const sidebarColor = ref('#1e1f22')
  const cardColor = ref('#2b2d31')
  const logoUrl = ref(null)
  const themeMode = ref('dark')
  const loading = ref(false)

  // Fungsi pembantu untuk mengonversi kode HEX ke format HSL mentah (Tailwind friendly)
  function hexToHsl(hex) {
    if (!hex) return '0 0% 0%'
    // Bersihkan karakter '#' jika ada
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    
    // Parse r, g, b
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    h = Math.round(h * 360)
    s = Math.round(s * 100)
    const roundedL = Math.round(l * 100)

    return `${h} ${s}% ${roundedL}%`
  }

  // Injeksi CSS variables ke DOM secara dinamis dan instan
  function applyGlobalTheme(settings) {
    if (!settings) return
    appName.value = settings.app_name || 'MeetApp'
    primaryColor.value = settings.primary_color || '#5865f2'
    backgroundColor.value = settings.background_color || '#313338'
    sidebarColor.value = settings.sidebar_color || '#1e1f22'
    cardColor.value = settings.card_color || '#2b2d31'
    logoUrl.value = settings.logo_url || null
    themeMode.value = settings.theme_mode || 'dark'

    const root = document.documentElement
    
    // Terapkan Class Light Mode / Dark Mode secara dinamis di root DOM
    if (themeMode.value === 'light') {
      root.classList.add('theme-light')
    } else {
      root.classList.remove('theme-light')
    }

    // Konversi HEX ke HSL agar Tailwind dapat membacanya dengan sempurna!
    root.style.setProperty('--primary', hexToHsl(primaryColor.value))
    root.style.setProperty('--background', hexToHsl(backgroundColor.value))
    root.style.setProperty('--sidebar', hexToHsl(sidebarColor.value))
    root.style.setProperty('--card', hexToHsl(cardColor.value))
    
    // Perbarui judul tab browser jika halaman lobi sedang dibuka
    if (document.title && document.title.includes(' — ')) {
      const parts = document.title.split(' — ')
      if (parts.length > 1) {
        document.title = `${parts[0]} — ${appName.value}`
      }
    } else {
      document.title = appName.value
    }
  }

  // Ambil pengaturan aplikasi secara publik (Public endpoint)
  async function fetchGlobalSettings() {
    loading.value = true
    try {
      const res = await axios.get('/api/settings')
      if (res.data.success && res.data.data) {
        applyGlobalTheme(res.data.data)
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan penampilan global:', err)
    } finally {
      loading.value = false
    }
  }

  // Perbarui pengaturan aplikasi (Hanya Owner pharyyady@gmail.com)
  async function updateGlobalSettings(payload) {
    loading.value = true
    try {
      const res = await axios.put('/api/settings', payload)
      if (res.data.success && res.data.data) {
        applyGlobalTheme(res.data.data)
        return { success: true }
      }
      return { success: false, message: 'Gagal memperbarui pengaturan' }
    } catch (err) {
      console.error('Gagal memperbarui pengaturan penampilan global:', err)
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui pengaturan'
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  return {
    appName,
    primaryColor,
    backgroundColor,
    sidebarColor,
    cardColor,
    logoUrl,
    themeMode,
    loading,
    fetchGlobalSettings,
    updateGlobalSettings
  }
})
