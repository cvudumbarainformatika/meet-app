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
          <h3 class="text-foreground text-sm font-semibold">Chat & Berbagi File</h3>
          <span v-if="messages.length > 0" class="text-muted-foreground text-xs">({{ messages.length }})</span>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Toggle Blur/Solid -->
          <button
            @click="emit('update:solid', !solid)"
            :title="solid ? 'Aktifkan Blur' : 'Matikan Blur (Solid)'"
            class="h-7 w-7 flex items-center justify-center rounded-lg transition-all cursor-pointer"
            :class="solid ? 'bg-primary/30 text-primary' : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground'"
          >
            <Layers2 class="h-3.5 w-3.5" />
          </button>
          <!-- Close -->
          <button
            @click="emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 relative custom-scrollbar"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onFileDropped"
      >
        <!-- Drag & Drop Glassmorphic Overlay -->
        <div
          v-if="isDragging"
          class="absolute inset-2 bg-primary/10 backdrop-blur-md border-2 border-dashed border-primary/45 rounded-2xl z-10 flex flex-col items-center justify-center text-center p-6 gap-3 transition-all duration-300 pointer-events-none"
        >
          <div class="p-4 bg-primary/20 rounded-full text-primary shadow-lg shadow-primary/10 animate-bounce">
            <Upload class="h-7 w-7" />
          </div>
          <div>
            <p class="text-sm font-bold text-foreground">Lepaskan berkas di sini...</p>
            <p class="text-[10px] text-muted-foreground mt-1.5 max-w-[200px]">Maks 2MB (PDF, Gambar, Word, Excel, PPT)</p>
          </div>
        </div>

        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center pb-8">
          <MessageSquare class="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p class="text-muted-foreground text-xs">Belum ada pesan atau file</p>
          <p class="text-[10px] text-muted-foreground/60 mt-1 max-w-[200px]">Ketik pesan atau drop file di sini untuk dibagikan</p>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="msg.isSelf ? 'items-end' : 'items-start'"
          class="flex flex-col w-full"
        >
          <span class="text-muted-foreground text-[10px] mb-1 px-1">{{ msg.sender }}</span>
          
          <!-- Standard Text Message -->
          <div
            v-if="!msg.file"
            :class="msg.isSelf
              ? 'bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-sm rounded-bl-2xl'
              : 'bg-card text-foreground border border-border rounded-tr-2xl rounded-tl-sm rounded-br-2xl'"
            class="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
          >
            {{ msg.text }}
          </div>

          <!-- Premium File Attachment Card -->
          <div
            v-else
            :class="msg.isSelf
              ? 'bg-primary/[0.08] border border-primary/20 text-foreground rounded-tl-2xl rounded-tr-sm rounded-bl-2xl'
              : 'bg-card text-foreground border border-border rounded-tr-2xl rounded-tl-sm rounded-br-2xl'"
            class="max-w-[85%] p-3.5 flex flex-col gap-3 shadow-md shadow-black/5"
          >
            <div class="flex items-center gap-3">
              <!-- File Icon based on extension -->
              <div
                class="p-2.5 rounded-xl flex items-center justify-center shrink-0 border border-border/40"
                :class="getFileIconClasses(msg.file.name, msg.file.type)"
              >
                <component :is="getFileIcon(msg.file.name, msg.file.type)" class="h-4.5 w-4.5" />
              </div>

              <!-- File Info -->
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold truncate text-foreground/95" :title="msg.file.name">
                  {{ msg.file.name }}
                </p>
                <p class="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                  {{ formatFileSize(msg.file.size) }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5 border-t border-border/40 pt-2.5">
              <button
                v-if="canPreview(msg.file.name, msg.file.type)"
                @click="previewFile(msg.file)"
                class="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-transparent text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye class="h-3 w-3" />
                Pratinjau
              </button>
              <button
                @click="downloadFile(msg.file)"
                class="py-1.5 rounded-lg border text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
                :class="canPreview(msg.file.name, msg.file.type)
                  ? 'px-3 border-border hover:bg-foreground/5 text-muted-foreground hover:text-foreground'
                  : 'flex-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-transparent'"
              >
                <Download class="h-3 w-3" />
                Unduh
              </button>
            </div>
          </div>

          <span class="text-muted-foreground/70 text-[9px] mt-1 px-1">
            {{ formatTime(msg.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Input Area & Attach Button -->
      <div class="p-4 border-t border-border flex-shrink-0 bg-card/20">
        <!-- Hidden File Input -->
        <input
          type="file"
          ref="fileInput"
          @change="onFileSelected"
          class="hidden"
          accept=".pdf,image/*,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt"
        />

        <div class="flex items-center gap-2 bg-background hover:bg-card/50 rounded-xl px-3 py-2.5 transition-colors border border-border focus-within:border-primary/40 shadow-inner">
          <!-- Clip Attachment Button -->
          <button
            @click="triggerFileSelect"
            class="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all flex-shrink-0 cursor-pointer"
            title="Bagikan file (Maks 2MB)"
          >
            <Paperclip class="h-4 w-4" />
          </button>
          
          <input
            v-model="localInput"
            @keyup.enter="handleSend"
            type="text"
            placeholder="Ketik pesan atau drag file..."
            class="flex-1 bg-transparent text-foreground text-sm placeholder-muted-foreground outline-none px-1"
          />
          <button
            @click="handleSend"
            :disabled="!localInput.trim()"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground transition-all flex-shrink-0 cursor-pointer"
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
import { 
  MessageSquare, Layers2, X, Send, Paperclip, Upload, Eye, Download, 
  FileText, Image, FileSpreadsheet, Presentation
} from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  show: Boolean,
  solid: Boolean,
  messages: Array,
})

const emit = defineEmits(['close', 'update:solid', 'send', 'send-file', 'preview-file'])

const localInput = ref('')
const messagesContainer = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)

const notificationStore = useNotificationStore()

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function handleSend() {
  if (!localInput.value.trim()) return
  emit('send', localInput.value)
  localInput.value = ''
}

// ===== Drag & Drop & Select File =====
function triggerFileSelect() {
  fileInput.value?.click()
}

function onDragLeave(e) {
  if (e.currentTarget.contains(e.relatedTarget)) return
  isDragging.value = false
}

function onFileSelected(e) {
  const files = e.target.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

function onFileDropped(e) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Jaga rasio aspek gambar
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Kompresi ke format JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileUpload(file) {
  const isImage = file.type.startsWith('image/')
  
  if (isImage) {
    // Tampilkan notifikasi kompresi
    notificationStore.showInfo('Mengompresi Gambar', 'Sedang mengompresi gambar agar pengiriman kilat & lancar...')
    
    try {
      const compressedDataUrl = await compressImage(file)
      // Hitung perkiraan ukuran byte dari base64 string
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4)
      
      emit('send-file', {
        name: file.name.replace(/\.[^/.]+$/, "") + ".jpg", // Force ekstensi .jpg pasca-kompresi
        size: compressedSize,
        type: 'image/jpeg',
        dataUrl: compressedDataUrl
      })
      notificationStore.showSuccess('Gambar Dikirim', `Gambar ${file.name} berhasil dikompresi dan dikirim.`)
    } catch (err) {
      console.error('Gagal mengompresi gambar:', err)
      notificationStore.showError('Gagal', 'Gagal mengompresi gambar untuk pengiriman.')
    }
  } else {
    // Batasan ketat 150KB untuk non-gambar (WebRTC DataChannel limit)
    const maxSizeBytes = 150 * 1024
    if (file.size > maxSizeBytes) {
      notificationStore.showError(
        'File Terlalu Besar', 
        'Ukuran dokumen maksimal adalah 150KB demi kestabilan transfer real-time tanpa server. Untuk gambar besar akan dikompresi otomatis.'
      )
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      emit('send-file', {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target.result
      })
      notificationStore.showSuccess('File Dikirim', `Berkas ${file.name} berhasil dibagikan ke rapat.`)
    }
    reader.readAsDataURL(file)
  }
}

// ===== File Helpers =====
function getFileIcon(name, type) {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return FileText
  if (type.startsWith('image/')) return Image
  if (['xlsx', 'xls', 'csv'].includes(ext)) return FileSpreadsheet
  if (['pptx', 'ppt'].includes(ext)) return Presentation
  return FileText
}

function getFileIconClasses(name, type) {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'text-red-500 bg-red-500/10 border-red-500/20'
  if (type.startsWith('image/')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'text-green-600 bg-green-600/10 border-green-600/20'
  if (['pptx', 'ppt'].includes(ext)) return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  if (['docx', 'doc'].includes(ext)) return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  return 'text-muted-foreground bg-muted/20 border-border/40'
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function canPreview(name, type) {
  const ext = name.split('.').pop().toLowerCase()
  return ext === 'pdf' || type.startsWith('image/')
}

function previewFile(file) {
  emit('preview-file', file)
}

function downloadFile(file) {
  const link = document.createElement('a')
  link.href = file.dataUrl
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  notificationStore.showSuccess('Unduh Sukses', `${file.name} berhasil diunduh.`)
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

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
</style>
