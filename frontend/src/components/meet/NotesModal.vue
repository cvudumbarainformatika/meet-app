<template>
  <Transition name="notes-modal">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="bg-card border border-border rounded-2xl w-full max-w-[96vw] h-[96vh] shadow-2xl flex flex-col overflow-hidden"
        @click.stop
      >
        <!-- ===== HEADER ===== -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-xl">
              <FileText class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 class="text-base font-bold text-foreground leading-tight">Notulen Rapat</h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                Sesi <strong class="text-foreground">{{ session?.room_name }}</strong>
                &mdash; {{ formatDate(session?.started_at) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Tombol Download PDF -->
            <button
              @click="downloadPdf"
              :disabled="downloading"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-semibold hover:bg-success/20 transition-all disabled:opacity-50"
              title="Download notulen sebagai PDF"
            >
              <Loader2 v-if="downloading" class="h-4 w-4 animate-spin" />
              <Download v-else class="h-4 w-4" />
              <span class="hidden sm:inline">Download PDF</span>
            </button>

            <button
              @click="emit('close')"
              class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- ===== TOOLBAR WYSIWYG ===== -->
        <div v-if="editor" class="px-4 py-2 border-b border-border bg-background/50 flex flex-wrap items-center gap-1 shrink-0">
          <!-- Heading -->
          <div class="flex items-center gap-0.5 border-r border-border/50 pr-2 mr-1">
            <button
              v-for="level in [1, 2, 3]"
              :key="level"
              @click="editor.chain().focus().toggleHeading({ level }).run()"
              :class="['toolbar-btn', editor.isActive('heading', { level }) ? 'toolbar-btn-active' : '']"
              :title="`Heading ${level}`"
            >H{{ level }}</button>
          </div>

          <!-- Format teks -->
          <div class="flex items-center gap-0.5 border-r border-border/50 pr-2 mr-1">
            <button
              @click="editor.chain().focus().toggleBold().run()"
              :class="['toolbar-btn', editor.isActive('bold') ? 'toolbar-btn-active' : '']"
              title="Bold"
            ><Bold class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleItalic().run()"
              :class="['toolbar-btn', editor.isActive('italic') ? 'toolbar-btn-active' : '']"
              title="Italic"
            ><Italic class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleUnderline().run()"
              :class="['toolbar-btn', editor.isActive('underline') ? 'toolbar-btn-active' : '']"
              title="Underline"
            ><UnderlineIcon class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleStrike().run()"
              :class="['toolbar-btn', editor.isActive('strike') ? 'toolbar-btn-active' : '']"
              title="Strikethrough"
            ><Strikethrough class="h-4 w-4" /></button>
          </div>

          <!-- List -->
          <div class="flex items-center gap-0.5 border-r border-border/50 pr-2 mr-1">
            <button
              @click="editor.chain().focus().toggleBulletList().run()"
              :class="['toolbar-btn', editor.isActive('bulletList') ? 'toolbar-btn-active' : '']"
              title="Bullet List"
            ><List class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleOrderedList().run()"
              :class="['toolbar-btn', editor.isActive('orderedList') ? 'toolbar-btn-active' : '']"
              title="Numbered List"
            ><ListOrdered class="h-4 w-4" /></button>
          </div>

          <!-- Blok -->
          <div class="flex items-center gap-0.5 border-r border-border/50 pr-2 mr-1">
            <button
              @click="editor.chain().focus().toggleBlockquote().run()"
              :class="['toolbar-btn', editor.isActive('blockquote') ? 'toolbar-btn-active' : '']"
              title="Blockquote"
            ><Quote class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleCode().run()"
              :class="['toolbar-btn', editor.isActive('code') ? 'toolbar-btn-active' : '']"
              title="Inline Code"
            ><Code class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().toggleCodeBlock().run()"
              :class="['toolbar-btn', editor.isActive('codeBlock') ? 'toolbar-btn-active' : '']"
              title="Code Block"
            ><FileCode2 class="h-4 w-4" /></button>
          </div>

          <!-- Alignment -->
          <div class="flex items-center gap-0.5 border-r border-border/50 pr-2 mr-1">
            <button
              @click="editor.chain().focus().setTextAlign('left').run()"
              :class="['toolbar-btn', editor.isActive({ textAlign: 'left' }) ? 'toolbar-btn-active' : '']"
              title="Rata Kiri"
            ><AlignLeft class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().setTextAlign('center').run()"
              :class="['toolbar-btn', editor.isActive({ textAlign: 'center' }) ? 'toolbar-btn-active' : '']"
              title="Rata Tengah"
            ><AlignCenter class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().setTextAlign('right').run()"
              :class="['toolbar-btn', editor.isActive({ textAlign: 'right' }) ? 'toolbar-btn-active' : '']"
              title="Rata Kanan"
            ><AlignRight class="h-4 w-4" /></button>
          </div>

          <!-- Lainnya -->
          <div class="flex items-center gap-0.5">
            <button
              @click="editor.chain().focus().setHorizontalRule().run()"
              class="toolbar-btn"
              title="Garis Pemisah"
            ><Minus class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().unsetAllMarks().clearNodes().run()"
              class="toolbar-btn"
              title="Hapus Format"
            ><RemoveFormatting class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().undo().run()"
              :disabled="!editor.can().chain().focus().undo().run()"
              class="toolbar-btn disabled:opacity-30"
              title="Undo"
            ><Undo2 class="h-4 w-4" /></button>
            <button
              @click="editor.chain().focus().redo().run()"
              :disabled="!editor.can().chain().focus().redo().run()"
              class="toolbar-btn disabled:opacity-30"
              title="Redo"
            ><Redo2 class="h-4 w-4" /></button>
          </div>
        </div>

        <!-- ===== AREA EDITOR ===== -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <!-- Container yang akan di-print sebagai PDF -->
          <div ref="pdfContent" class="pdf-wrapper">
            <!-- PDF Header (hanya terlihat saat cetak) -->
            <div class="pdf-header-only">
              <h1 class="pdf-title">Notulen Rapat — {{ session?.room_name }}</h1>
              <p class="pdf-meta">Tanggal: {{ formatDate(session?.started_at) }} | Durasi: {{ formatDuration(session?.started_at, session?.ended_at) }}</p>
              <hr class="pdf-divider" />
            </div>
            <!-- Tiptap editor -->
            <EditorContent :editor="editor" class="tiptap-editor-wrapper" />
          </div>
        </div>

        <!-- ===== FOOTER ===== -->
        <div class="px-6 py-4 border-t border-border bg-card/50 flex justify-between items-center gap-3 shrink-0">
          <div class="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Info class="h-3.5 w-3.5" />
            <span>Gunakan toolbar di atas untuk memformat teks notulen Anda</span>
          </div>
          <div class="flex items-center gap-3 ml-auto">
            <button
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-all text-sm"
            >
              Batal
            </button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold transition-all flex items-center gap-2 text-sm"
            >
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              Simpan Notulen
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useNotificationStore } from '@/stores/notification'

import {
  FileText, X, Loader2, Save, Download,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, FileCode2,
  AlignLeft, AlignCenter, AlignRight,
  Minus, RemoveFormatting, Undo2, Redo2, Info
} from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  session: Object,
  modelValue: String,
  saving: Boolean
})

const emit = defineEmits(['close', 'save', 'update:modelValue'])

const pdfContent = ref(null)
const downloading = ref(false)
const notificationStore = useNotificationStore()

// ===== Tiptap Editor =====
const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit.configure(),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({
      placeholder: 'Tuliskan catatan, keputusan, atau poin penting rapat di sini...',
    }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sinkronisasi konten saat modal dibuka (session baru / existing notes)
watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (val !== current) {
    editor.value.commands.setContent(val || '', false)
  }
})

// Hancurkan editor saat komponen di-unmount
onBeforeUnmount(() => {
  editor.value?.destroy()
})

function handleSave() {
  emit('save')
}

// ===== Download PDF =====
async function downloadPdf() {
  if (!pdfContent.value) return
  downloading.value = true
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const sessionName = props.session?.room_name || 'notulen'
    const dateStr = formatDate(props.session?.started_at).replace(/\s/g, '-')
    const filename = `Notulen-${sessionName}-${dateStr}.pdf`

    const opt = {
      margin: [15, 15, 15, 15],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }
    await html2pdf().set(opt).from(pdfContent.value).save()
    notificationStore.showSuccess('Unduh Sukses', 'Notulen rapat berhasil disimpan sebagai PDF.')
  } catch (e) {
    console.error('PDF error:', e)
    notificationStore.showError('Unduh Gagal', 'Gagal mengunduh notulen rapat sebagai PDF.')
  } finally {
    downloading.value = false
  }
}

// ===== Helpers =====
function formatDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(isoDate).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function formatDuration(start, end) {
  if (!start || !end) return 'Sedang Berlangsung'
  const diffMs = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 60) return `${mins} menit`
  const hrs = Math.floor(mins / 60)
  const rm = mins % 60
  return `${hrs} jam ${rm} menit`
}
</script>

<style scoped>
/* ===== TRANSISI MODAL ===== */
.notes-modal-enter-active,
.notes-modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.notes-modal-enter-from,
.notes-modal-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}

/* ===== TOOLBAR BUTTON ===== */
:deep(.toolbar-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}
:deep(.toolbar-btn:hover) {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}
:deep(.toolbar-btn-active) {
  background: hsl(var(--primary) / 0.15) !important;
  color: hsl(var(--primary)) !important;
}

/* ===== TIPTAP EDITOR AREA ===== */
.tiptap-editor-wrapper {
  padding: 2rem 2.5rem;
  min-height: 400px;
}

:deep(.tiptap) {
  outline: none;
  color: #1a1a1a;
  font-size: 0.9375rem;
  line-height: 1.75;
  font-family: 'Inter', 'Georgia', serif;
  min-height: 350px;
}

/* Placeholder */
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #9ca3af;
  float: left;
  height: 0;
  pointer-events: none;
}

/* Heading */
:deep(.tiptap h1) { font-size: 1.75rem; font-weight: 800; margin: 1.5rem 0 0.75rem; color: #111827; line-height: 1.2; }
:deep(.tiptap h2) { font-size: 1.375rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #111827; line-height: 1.3; }
:deep(.tiptap h3) { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.4rem; color: #111827; line-height: 1.4; }

/* Paragraf */
:deep(.tiptap p) { margin: 0.5rem 0; }
:deep(.tiptap p:first-child) { margin-top: 0; }

/* List */
:deep(.tiptap ul) { padding-left: 1.5rem; margin: 0.5rem 0; list-style-type: disc; }
:deep(.tiptap ol) { padding-left: 1.5rem; margin: 0.5rem 0; list-style-type: decimal; }
:deep(.tiptap li) { margin: 0.25rem 0; }
:deep(.tiptap li > p) { margin: 0; }

/* Blockquote */
:deep(.tiptap blockquote) {
  border-left: 4px solid #6366f1;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  background: #f0f0ff;
  border-radius: 0 8px 8px 0;
  color: #4b5563;
  font-style: italic;
}

/* Code */
:deep(.tiptap code) {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 0.15em 0.4em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85em;
  color: #4f46e5;
}
:deep(.tiptap pre) {
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  overflow-x: auto;
}
:deep(.tiptap pre code) {
  background: none;
  padding: 0;
  color: #1a1a1a;
  font-size: 0.875em;
}

/* HR */
:deep(.tiptap hr) {
  border: none;
  border-top: 2px solid #d1d5db;
  margin: 1.5rem 0;
}

/* Bold, Italic, etc */
:deep(.tiptap strong) { font-weight: 700; }
:deep(.tiptap em) { font-style: italic; }
:deep(.tiptap s) { text-decoration: line-through; }
:deep(.tiptap u) { text-decoration: underline; }

/* ===== PDF WRAPPER ===== */
/* Selalu putih seperti dokumen — konsisten dengan output PDF */
.pdf-wrapper {
  background: #ffffff;
  color: #1a1a1a;
  min-height: 100%;
}

/* Header PDF hanya muncul saat generate PDF, disembunyikan di screen */
.pdf-header-only {
  display: none;
}

/* ===== CUSTOM SCROLLBAR ===== */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.5); }
</style>
