<template>
  <div class="w-full max-w-5xl mx-auto">
    <!-- Rooms List Card -->
    <div class="bg-card border border-border rounded-3xl p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-foreground flex items-center gap-2">
            <DoorOpen class="h-5 w-5 text-primary" /> Daftar Room Anda
          </h3>
          <p class="text-sm text-muted-foreground text-left">Daftar room rapat yang pernah Anda buat</p>
        </div>
        <div class="flex items-center gap-2 justify-end">
          <button 
            @click="emit('create-room-clicked')"
            class="px-4 py-2.5 rounded-xl bg-success hover:bg-success/90 text-success-foreground text-sm font-semibold transition-all shadow-lg shadow-success/20 flex items-center gap-2 shrink-0"
          >
            <Plus class="h-4 w-4" /> Buat Room Baru
          </button>
          <button 
            @click="emit('refresh')" 
            class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
            title="Refresh data"
          >
            <RefreshCw class="h-4 w-4" :class="{'animate-spin': loading}" />
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left text-sm text-muted-foreground min-w-[600px]">
          <thead class="bg-white/5 text-muted-foreground uppercase text-xs">
            <tr>
              <th class="px-4 py-3 rounded-l-lg">Nama Room</th>
              <th class="px-4 py-3">Slug (Kode)</th>
              <th class="px-4 py-3">Privasi</th>
              <th class="px-4 py-3">Total Sesi</th>
              <th class="px-4 py-3">Rekor Peserta</th>
              <th class="px-4 py-3 text-right rounded-r-lg">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-4 py-4 text-center text-muted-foreground">Memuat data...</td>
            </tr>
            <tr v-else-if="rooms.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                Anda belum pernah membuat room. Klik tombol "Buat Room Baru" untuk memulai!
              </td>
            </tr>
            <tr v-for="room in rooms" :key="room.id" class="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3 font-medium text-foreground">{{ room.name }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <code class="bg-black/30 px-2 py-1 rounded text-primary">{{ room.slug }}</code>
                  <button @click="emit('copy', room.slug)" class="text-muted-foreground hover:text-foreground" title="Salin Slug">
                    <Copy class="h-3 w-3" />
                  </button>
                </div>
              </td>
              <td class="px-4 py-3">
                <span v-if="room.is_locked" class="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  <Lock class="h-3 w-3" /> Password
                </span>
                <span v-else class="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <Globe class="h-3 w-3" /> Publik
                </span>
              </td>
              <td class="px-4 py-3">{{ room.total_sessions }} kali</td>
              <td class="px-4 py-3">{{ room.max_participants_ever }} orang</td>
              <td class="px-4 py-3 text-right">
                <button 
                  @click="emit('view-history', room.name)" 
                  class="ml-auto px-3 py-1.5 rounded-lg bg-white/5 hover:bg-success/20 text-success text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Lihat Riwayat Sesi Room Ini"
                >
                  <History class="h-3.5 w-3.5" /> Riwayat
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DoorOpen, RefreshCw, Copy, Lock, Globe, History, Plus } from 'lucide-vue-next'

const props = defineProps({
  rooms: Array,
  loading: Boolean
})

const emit = defineEmits(['refresh', 'copy', 'create-room-clicked', 'view-history'])
</script>
