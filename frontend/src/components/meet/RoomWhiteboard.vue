<template>
  <div class="w-full h-full flex flex-col relative bg-background select-none">
    
    <!-- Header/Toolbar Papan Tulis (Glassmorphism Modern) -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-3 px-4 py-2.5 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl z-30 max-w-[95vw]">
      
      <!-- Opsi Alat (Tools) -->
      <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        <button
          v-for="t in tools"
          :key="t.id"
          @click="currentTool = t.id"
          class="h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
          :class="currentTool === t.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'"
          :title="t.label"
        >
          <component :is="t.icon" class="h-4 w-4" />
        </button>
      </div>

      <div class="w-px h-6 bg-border/60 shrink-0" />

      <!-- Ketebalan Kuas (Brush Size) -->
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">Ukuran</span>
        <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            v-for="sz in [2, 4, 8, 12]"
            :key="sz"
            @click="brushSize = sz"
            class="h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
            :class="brushSize === sz ? 'bg-primary text-primary-foreground font-bold text-xs' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs'"
            :title="sz + 'px'"
          >
            <div class="rounded-full bg-current" :style="{ width: sz + 'px', height: sz + 'px' }"></div>
          </button>
        </div>
      </div>

      <div class="w-px h-6 bg-border/60 shrink-0" />

      <!-- Palet Warna (Colors) -->
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">Warna</span>
        <div class="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
          <button
            v-for="c in colors"
            :key="c.value"
            @click="selectedColor = c.value"
            class="h-5.5 w-5.5 rounded-full border transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            :style="{ backgroundColor: c.value, borderColor: selectedColor === c.value ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)' }"
            :class="{ 'scale-115 ring-2 ring-primary/45': selectedColor === c.value }"
            :title="c.label"
          >
            <Check v-if="selectedColor === c.value" class="h-3 w-3" :class="c.value === '#ffffff' ? 'text-black' : 'text-white'" />
          </button>
        </div>
      </div>

      <div class="w-px h-6 bg-border/60 shrink-0" />

      <!-- Aksi Papan Tulis (Actions) -->
      <div class="flex items-center gap-1.5">
        <button
          @click="showClearConfirm = true"
          class="h-8 px-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95"
          title="Bersihkan Papan Tulis"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span class="hidden md:inline">Bersihkan</span>
        </button>

        <button
          @click="downloadCanvas"
          class="h-8 px-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95"
          title="Unduh Gambar Papan Tulis"
        >
          <Download class="h-3.5 w-3.5" />
          <span class="hidden md:inline">Unduh PNG</span>
        </button>

        <button
          @click="emit('close')"
          class="h-8 w-8 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-95 ml-1"
          title="Tutup Papan Tulis"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Area Kanvas Utama (Canvas) -->
    <div class="flex-1 w-full h-full overflow-hidden relative" ref="canvasContainer">
      <!-- Kanvas Utama -->
      <canvas
        ref="canvasEl"
        class="w-full h-full cursor-crosshair touch-none"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing"
      ></canvas>

      <!-- Label Status Indicator (bottom-left corner) -->
      <div class="absolute bottom-4 left-4 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 pointer-events-none select-none">
        <div class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
        <div class="h-2 w-2 rounded-full bg-emerald-500 absolute left-4"></div>
        <span class="text-[10px] text-white/80 font-bold uppercase tracking-wider">Kolaborasi Aktif</span>
      </div>
    </div>

    <!-- Glassmorphic Dialog Konfirmasi Clear Board -->
    <q-dialog v-model="showClearConfirm" backdrop-filter="blur(4px)">
      <q-card class="bg-card/95 border border-border text-foreground rounded-3xl p-6 w-[360px] max-w-[90vw] shadow-2xl backdrop-blur-md">
        <div class="flex flex-col items-center text-center">
          <div class="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4 text-destructive shadow-xl">
            <Trash2 class="h-5 w-5" />
          </div>
          <h4 class="text-base font-bold tracking-tight">Bersihkan Papan Tulis?</h4>
          <p class="text-xs text-muted-foreground mt-2 leading-relaxed">Aksi ini akan menghapus seluruh isi gambar di layar kanvas untuk **semua** peserta rapat secara instan. Tindakan ini tidak dapat dibatalkan.</p>
          <div class="flex items-center gap-3 w-full mt-6">
            <button
              @click="showClearConfirm = false"
              class="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="confirmClear"
              class="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-destructive/20"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  Pencil, Eraser, Minus, Square, Circle, Trash2, Download, X, Check
} from 'lucide-vue-next'
import { useMeetStore } from '@/stores/meet'
import { useSettingsStore } from '@/stores/settings'

const emit = defineEmits(['close', 'draw', 'clear'])

const meetStore = useMeetStore()
const settingsStore = useSettingsStore()

// State Internal
const canvasEl = ref(null)
const canvasContainer = ref(null)
const currentTool = ref('brush') // 'brush' | 'eraser' | 'line' | 'rect' | 'circle'
const brushSize = ref(4)
const selectedColor = ref(settingsStore.primaryColor || '#3b82f6')
const showClearConfirm = ref(false)

let ctx = null
let isDrawing = false
let startX = 0
let startY = 0
let currentPoints = []

// Preset Data Semantik (Dark Mode Harmonious)
const tools = [
  { id: 'brush', label: 'Pensil / Kuas', icon: Pencil },
  { id: 'eraser', label: 'Penghapus', icon: Eraser },
  { id: 'line', label: 'Garis Lurus', icon: Minus },
  { id: 'rect', label: 'Kotak / Persegi', icon: Square },
  { id: 'circle', label: 'Lingkaran', icon: Circle }
]

// Palet warna cerdas yang terintegrasi dengan warna brand primer secara modular (white-label)
const colors = computed(() => {
  const list = []
  if (settingsStore.primaryColor) {
    list.push({ value: settingsStore.primaryColor, label: 'Warna Brand' })
  }
  list.push(
    { value: '#ffffff', label: 'Putih' },
    { value: '#3b82f6', label: 'Biru' },
    { value: '#ef4444', label: 'Merah' },
    { value: '#10b981', label: 'Hijau' },
    { value: '#f59e0b', label: 'Kuning' },
    { value: '#a855f7', label: 'Ungu' },
    { value: '#4b5563', label: 'Abu-abu' }
  )
  
  // Hilangkan duplikasi warna jika warna brand sama dengan warna preset lainnya
  const uniqueList = []
  const seen = new Set()
  for (const c of list) {
    const val = c.value.toLowerCase()
    if (!seen.has(val)) {
      seen.add(val)
      uniqueList.push(c)
    }
  }
  return uniqueList
})

// Monitor perubahan riwayat dari server / peserta lain untuk redraw
watch(() => meetStore.whiteboardHistory, () => {
  redrawCanvas()
}, { deep: true })

let resizeObserver = null

onMounted(() => {
  initCanvas()
  
  // Gunakan ResizeObserver untuk memantau perubahan ukuran container secara real-time (presisi transisi layout)
  if (window.ResizeObserver && canvasContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(canvasContainer.value)
  } else {
    window.addEventListener('resize', handleResize)
  }

  // Tunggu container termount lalu resize canvas agar pas presisi
  nextTick(() => {
    handleResize()
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', handleResize)
})

function initCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
}

function handleResize() {
  const canvas = canvasEl.value
  const container = canvasContainer.value
  if (!canvas || !container || !ctx) return

  // Simpan isi canvas saat ini ke image data sebelum resize
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.drawImage(canvas, 0, 0)

  // Atur ulang ukuran kanvas sesuai parent container secara real-time
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight

  // Redraw semua histori setelah ukuran diubah agar tidak buram
  redrawCanvas()
}

// --- LOGIKA MENGGAMBAR (DENGAN SKALA KOORDINAT PIXEL-PERFECT) ---

function getCoordinates(event) {
  const canvas = canvasEl.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  
  // Lakukan penskalaan koordinat antara ukuran CSS (rect) dan resolusi piksel internal canvas (canvas.width)
  // Ini 100% mencegah offset cursor meskipun canvas diregangkan/dipersempit oleh CSS layout.
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  }
}

function startDrawing(e) {
  isDrawing = true
  const coords = getCoordinates(e)
  startX = coords.x
  startY = coords.y

  // Inisialisasi poin untuk coretan kuas/penghapus
  const normX = coords.x / canvasEl.value.width
  const normY = coords.y / canvasEl.value.height
  currentPoints = [{ x: normX, y: normY }]
  
  ctx.beginPath()
  ctx.moveTo(coords.x, coords.y)
}

function startDrawingTouch(e) {
  if (e.touches.length === 0) return
  isDrawing = true
  const touch = e.touches[0]
  const rect = canvasEl.value.getBoundingClientRect()
  
  // Gunakan rumus penskalaan yang sama untuk layar sentuh
  startX = ((touch.clientX - rect.left) / rect.width) * canvasEl.value.width
  startY = ((touch.clientY - rect.top) / rect.height) * canvasEl.value.height

  const normX = startX / canvasEl.value.width
  const normY = startY / canvasEl.value.height
  currentPoints = [{ x: normX, y: normY }]

  ctx.beginPath()
  ctx.moveTo(startX, startY)
}

function draw(e) {
  if (!isDrawing) return
  const coords = getCoordinates(e)
  handleDrawingMove(coords.x, coords.y)
}

function drawTouch(e) {
  if (!isDrawing || e.touches.length === 0) return
  const touch = e.touches[0]
  const rect = canvasEl.value.getBoundingClientRect()
  
  const x = ((touch.clientX - rect.left) / rect.width) * canvasEl.value.width
  const y = ((touch.clientY - rect.top) / rect.height) * canvasEl.value.height
  handleDrawingMove(x, y)
}

function handleDrawingMove(x, y) {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return

  const normX = x / canvas.width
  const normY = y / canvas.height

  if (currentTool.value === 'brush' || currentTool.value === 'eraser') {
    // Gambar goresan lokal secara real-time
    ctx.lineWidth = brushSize.value
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = currentTool.value === 'eraser' ? (settingsStore.backgroundColor || '#101113') : selectedColor.value

    ctx.lineTo(x, y)
    ctx.stroke()

    currentPoints.push({ x: normX, y: normY })
  } else {
    // Untuk bentuk geometris, kita harus redraw semua histori terdahulu,
    // lalu gambar preview bentuk tersebut secara real-time.
    redrawCanvas()
    ctx.lineWidth = brushSize.value
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = selectedColor.value
    ctx.beginPath()

    if (currentTool.value === 'line') {
      ctx.moveTo(startX, startY)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (currentTool.value === 'rect') {
      ctx.strokeRect(startX, startY, x - startX, y - startY)
    } else if (currentTool.value === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Catat/perbarui titik akhir bentuk geometris ke dalam array poin
    currentPoints[1] = { x: normX, y: normY }
  }
}

function stopDrawing() {
  if (!isDrawing) return
  isDrawing = false

  const canvas = canvasEl.value
  if (!canvas) return

  // Buat payload aksi gambar
  const action = {
    tool: currentTool.value,
    color: currentTool.value === 'eraser' ? (settingsStore.backgroundColor || '#101113') : selectedColor.value,
    thickness: brushSize.value,
    startX: startX / canvas.width,
    startY: startY / canvas.height,
    points: currentPoints
  }

  // Pastikan coretan atau bentuk geometris memiliki minimal 2 titik untuk digambar
  if (currentPoints.length < 2) {
    return
  }

  // Kirim aksi gambar ke LiveKit Data Channel & masukkan ke local store
  emit('draw', action)
}

// --- REDRAW KANVAS UTAMA ---

function redrawCanvas() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return

  // Bersihkan layar canvas dengan warna background yang dinamis (semantic & white-label)
  ctx.fillStyle = settingsStore.backgroundColor || '#101113'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const w = canvas.width
  const h = canvas.height

  // Iterasi semua histori gambar dan render ulang berdasarkan ukuran lokal
  meetStore.whiteboardHistory.forEach(action => {
    ctx.lineWidth = action.thickness
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // Untuk kuas penghapus, gunakan warna background lokal penerima secara dinamis
    ctx.strokeStyle = action.tool === 'eraser' ? (settingsStore.backgroundColor || '#101113') : action.color
    ctx.beginPath()

    if (action.tool === 'brush' || action.tool === 'eraser') {
      if (!action.points || action.points.length === 0) return
      
      const startPt = action.points[0]
      ctx.moveTo(startPt.x * w, startPt.y * h)
      
      for (let i = 1; i < action.points.length; i++) {
        const pt = action.points[i]
        ctx.lineTo(pt.x * w, pt.y * h)
      }
      ctx.stroke()
    } else if (action.tool === 'line') {
      ctx.moveTo(action.startX * w, action.startY * h)
      const lastPt = action.points[action.points.length - 1]
      if (lastPt) {
        ctx.lineTo(lastPt.x * w, lastPt.y * h)
        ctx.stroke()
      }
    } else if (action.tool === 'rect') {
      const lastPt = action.points[action.points.length - 1]
      if (lastPt) {
        const sx = action.startX * w
        const sy = action.startY * h
        ctx.strokeRect(sx, sy, (lastPt.x * w) - sx, (lastPt.y * h) - sy)
      }
    } else if (action.tool === 'circle') {
      const lastPt = action.points[action.points.length - 1]
      if (lastPt) {
        const sx = action.startX * w
        const sy = action.startY * h
        const ex = lastPt.x * w
        const ey = lastPt.y * h
        const radius = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2))
        ctx.arc(sx, sy, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }
  })
}

// --- AKSI CLEAR & UNDUH ---

function confirmClear() {
  showClearConfirm.value = false
  emit('clear')
}

function downloadCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return

  // Buat elemen anchor sementara
  const link = document.createElement('a')
  link.download = `MeetApp-Whiteboard-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
/* Transisi popover */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}
</style>
