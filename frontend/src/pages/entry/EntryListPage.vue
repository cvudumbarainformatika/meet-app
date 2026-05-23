<template>
  <div class="space-y-6">

    <DataTablePremium
      title="Daftar Entry RTLH"
      description="Kelola Data Usulan Rumah Tidak Layak Huni."
      :items="surveys"
      :columns="columns"
      :loading="loading"
      :server-side="true"
      :total-items="meta.total"
      :page-size="meta.per_page"
      search-placeholder="Cari nama KK atau NIK..."
      @change="onTableChange"
      @row-click="(item) => $router.push('/app/entry/' + item.id)"
    >
      <template #add-button>
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="handleExportExcel" 
            :disabled="exporting"
            class="shadow-sm border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Download v-if="!exporting" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Download Excel
          </Button>
          <Button size="sm" @click="$router.push('/app/entry/form')" class="shadow-sm">
            <Plus class="h-4 w-4 mr-2" />
            Tambah Entry Baru
          </Button>
        </div>
      </template>

      <!-- Custom Filters (sama persis dengan UserManagement) -->
      <template #filters="{ handleFilterChange }">
        <!-- Filter Kecamatan (Admin & Dinas Only) -->
        <div v-if="auth.isAdmin || auth.isDinas" class="w-full md:w-[150px] space-y-1 text-left">
          <Label class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Kecamatan</Label>
          <FilterCombobox
            v-model="filters.kecamatan"
            :options="kecamatanList.map(k => ({ value: k, label: k }))"
            placeholder="Kecamatan"
            defaultOptionText="Semua"
            @update:modelValue="() => { filters.kelurahan = ''; currentPage = 1; fetchSurveys() }"
          />
        </div>

        <!-- Filter Kelurahan (Admin & Dinas Only) -->
        <div v-if="auth.isAdmin || auth.isDinas" class="w-full md:w-[150px] space-y-1 text-left">
          <Label class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Kelurahan</Label>
          <FilterCombobox
            v-model="filters.kelurahan"
            :options="filteredKelurahanList.map(k => ({ value: k, label: k }))"
            placeholder="Kelurahan"
            defaultOptionText="Semua"
            @update:modelValue="() => { currentPage = 1; fetchSurveys() }"
          />
        </div>

        <!-- Filter Status -->
        <div class="w-full md:w-[180px] space-y-1 text-left">
          <Label class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Status Berkas</Label>
          <FilterCombobox
            v-model="filters.status"
            :options="[
              { value: 'draft', label: '1. Draft (PENGUSUL)' },
              { value: 'pending_lpmk', label: '2. Menunggu Kelurahan' },
              { value: 'pending_perkim', label: '3. Menunggu Kecamatan' },
              { value: 'pending_surveyor', label: '4. Proses Dinas' },
              { value: 'history_verif_perkim', label: '5. Selesai (RTLH)' },
              { value: 'intervened', label: '6. RTLH (TERINTERVENSI)' },
              { value: 'rejected_kelurahan', label: 'X. DIKEMBALIKAN KE PENGUSUL OLEH KELURAHAN' },
              { value: 'rejected_kecamatan', label: 'Y. DIKEMBALIKAN KE PENGUSUL OLEH KECAMATAN' },
              { value: 'non_rtlh', label: 'Z. Final: NON-RTLH' }
            ]"
            placeholder="Semua Status"
            defaultOptionText="Semua Status"
            @update:modelValue="onFilterChange"
          />
        </div>

        <!-- Reset Filter (Icon Only to save space) -->
        <div class="pt-5">
          <Button
            variant="outline"
            size="icon"
            class="h-10 w-10 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive rounded-xl transition-all shadow-sm"
            @click="resetFilters(); handleFilterChange()"
            title="Reset Semua Filter"
          >
            <RotateCcw class="h-4 w-4" />
          </Button>
        </div>
      </template>

      <!-- Cell: Nama KK -->
      <template #cell-nama_lengkap_kepkel_rt="{ item }">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center ring-1 ring-border/50">
            <span class="text-[10px] font-bold text-primary">{{ getInitials(item.nama_lengkap_kepkel_rt) }}</span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs sm:text-sm font-semibold text-foreground">{{ item.nama_lengkap_kepkel_rt }}</span>
            <span class="text-[9px] sm:text-[10px] text-muted-foreground font-mono">{{ item.nik_kepkel }}</span>
          </div>
        </div>
      </template>

      <!-- Cell: Wilayah -->
      <template #cell-kelurahan="{ item }">
        <div class="flex flex-col text-left">
          <span class="text-xs font-medium text-foreground">{{ item.kelurahan || '-' }}</span>
          <span class="text-[10px] text-muted-foreground">{{ item.kecamatan || '-' }}</span>
        </div>
      </template>

      <!-- Cell: Status -->
      <template #cell-status="{ item }">
        <Badge :class="getStatusClass(item)" class="text-[9px] sm:text-[10px] py-1 px-2.5 border shadow-none font-bold uppercase tracking-tight">
          {{ getStatusLabel(item) }}
        </Badge>
      </template>

      <!-- Cell: Terakhir Diupdate -->
      <template #cell-updated_at="{ item }">
        <div class="flex flex-col text-right">
          <span class="text-[11px] font-bold text-foreground">{{ formatDate(item.updated_at) }}</span>
          <span class="text-[9px] text-muted-foreground uppercase tracking-tighter">{{ formatTime(item.updated_at) }}</span>
        </div>
      </template>

      <!-- Actions (Gmail-style hover) -->
      <template #actions="{ item }">
        <Button
          v-if="(auth.isAdmin || auth.isDinas) && item.latitude && item.longitude"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-emerald-600 hover:bg-emerald-600/20 rounded-full"
          @click.stop="openNavigation(item)"
          title="Buka Navigasi Maps"
        >
          <MapPin class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-primary hover:bg-primary/20 rounded-full"
          @click.stop="$router.push('/app/entry/' + item.id)"
          title="Lihat Detail"
        >
          <Eye class="h-3.5 w-3.5" />
        </Button>
        <Button
          v-if="!auth.isSurveyor"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-amber-500 hover:bg-amber-500/20 rounded-full"
          @click.stop="$router.push('/app/entry/form?id=' + item.id)"
          title="Edit Entry"
        >
          <Edit2 class="h-3.5 w-3.5" />
        </Button>
        <Button
          v-if="!auth.isSurveyor"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-destructive hover:bg-destructive/20 rounded-full"
          @click.stop="confirmDelete(item)"
          title="Hapus Entry"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </Button>
      </template>
    </DataTablePremium>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api as axios } from '@/boot/axios'
import { Plus, Eye, Edit2, Trash2, RotateCcw, MapPin, Download, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import DataTablePremium from '@/components/DataTablePremium.vue'
import FilterCombobox from '@/components/FilterCombobox.vue'

const auth = useAuthStore()

// --- State ---
const surveys = ref([])
const loading = ref(true)
const meta = ref({ total: 0, per_page: 15, current_page: 1 })
const currentPage = ref(1)
const searchQuery = ref('')

const filters = ref({
  kecamatan: '',
  kelurahan: '',
  status: ''
})

// --- Wilayah Options (populated from data) ---
const kecamatanList = ref([])
const kelurahanMap = ref({}) // { kecamatan: [kelurahan, ...] }

const filteredKelurahanList = computed(() => {
  if (!filters.value.kecamatan) return Object.values(kelurahanMap.value).flat()
  return kelurahanMap.value[filters.value.kecamatan] || []
})

// --- Columns Definition (Global Standard) ---
const columns = [
  { key: 'nama_lengkap_kepkel_rt', label: 'Nama Kepala Keluarga', align: 'left' },
  { key: 'kelurahan', label: 'Kecamatan / Kelurahan', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'updated_at', label: 'Terakhir Diupdate', align: 'right', isAction: true }
]

// --- Fetch Data ---
async function fetchSurveys() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: meta.value.per_page,
      search: searchQuery.value || undefined,
      kecamatan: filters.value.kecamatan || undefined,
      kelurahan: filters.value.kelurahan || undefined,
      status: filters.value.status || undefined,
    }

    const response = await axios.get('/api/surveys', {
      params: { ...params, user_id: auth.user?.id }
    })

    if (response.data.success) {
      const data = response.data.data
      surveys.value = data.data || []
      meta.value = {
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page
      }
    }
  } catch (err) {
    console.error('Failed to fetch surveys', err)
  } finally {
    loading.value = false
  }
}

async function fetchWilayah() {
  try {
    const response = await axios.get('/api/kelurahan')
    if (response.data.success) {
      const data = response.data.data
      const kecSet = new Set()
      const kelMap = {}
      data.forEach(item => {
        if (item.kecamatan) {
          kecSet.add(item.kecamatan)
          if (!kelMap[item.kecamatan]) kelMap[item.kecamatan] = new Set()
          if (item.kelurahan) kelMap[item.kecamatan].add(item.kelurahan)
        }
      })
      kecamatanList.value = [...kecSet].sort()
      kelurahanMap.value = Object.fromEntries(
        Object.entries(kelMap).map(([k, v]) => [k, [...v].sort()])
      )
    }
  } catch (err) {
    console.error('Failed to fetch master wilayah', err)
  }
}

// --- Event Handlers from DataTablePremium ---
function onTableChange({ page, search }) {
  currentPage.value = page
  searchQuery.value = search
  fetchSurveys()
}

function onFilterChange() {
  // Reset kelurahan jika kecamatan berubah
  if (!filteredKelurahanList.value.includes(filters.value.kelurahan)) {
    filters.value.kelurahan = ''
  }
  currentPage.value = 1
  fetchSurveys()
}

function resetFilters() {
  filters.value = { kecamatan: '', kelurahan: '', status: '' }
  currentPage.value = 1
  fetchSurveys()
}

// --- Delete Handler ---
function confirmDelete(item) {
  if (confirm(`Hapus entry "${item.nama_lengkap_kepkel_rt}"? Aksi ini tidak bisa dibatalkan.`)) {
    deleteEntry(item.id)
  }
}

async function deleteEntry(id) {
  try {
    await axios.delete(`/api/surveys/${id}`)
    fetchSurveys()
  } catch (err) {
    console.error('Failed to delete', err)
  }
}

// --- Navigation Handler ---
function openNavigation(item) {
  if (!item.latitude || !item.longitude) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
  window.open(url, '_blank')
}

// --- Helper: Avatar Initials ---
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// --- Helper: Date Formatters ---
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// --- Helper: Status Logic (Dynamic based on completion) ---
function getStatusLabel(item) {
  // Logika Ditolak (is_rtlh = '0')
  if (item.is_rtlh === '0') {
    const penolak = item.oleh_user_penolak || '';
    if (penolak.includes('Kecamatan')) return 'DIKEMBALIKAN KE PENGUSUL OLEH KECAMATAN'
    if (penolak.includes('Kelurahan') || penolak.includes('LPMK')) return 'DIKEMBALIKAN KE PENGUSUL OLEH KELURAHAN'
    if (penolak.includes('Perkim') || penolak.includes('Dinas') || penolak.includes('Admin') || penolak.includes('Super')) return 'NON-RTLH'

    // Fallback jika oleh_user_penolak kosong (data lama)
    const timePerkim = item.input_perkim ? new Date(item.input_perkim).getTime() : 0;
    const timeSurveyor = item.input_surveyor ? new Date(item.input_surveyor).getTime() : 0;
    const timeKelurahan = item.input_kelurahan ? new Date(item.input_kelurahan).getTime() : 0;

    if (timePerkim > 0 && timePerkim >= timeSurveyor && timePerkim >= timeKelurahan) return 'NON-RTLH'
    if (item.input_surveyor) return 'DIKEMBALIKAN KE PENGUSUL OLEH KECAMATAN'
    if (item.input_kelurahan) return 'DIKEMBALIKAN KE PENGUSUL OLEH KELURAHAN'
    return 'DITOLAK'
  }

  // Logika Lulus (Workflow)
  if (item.is_intervened === 1) return 'RTLH (TERINTERVENSI)'
  if (item.verif_perkim) return 'RTLH'
  if (item.input_surveyor) return 'PROSES DINAS'
  if (item.input_kelurahan) return 'MENUNGGU KECAMATAN'
  if (item.input_lpm) return 'MENUNGGU KELURAHAN'
  return 'DRAFT (PENGUSUL)'
}

function getStatusClass(item) {
  if (item.is_rtlh === '0') {
    // Jika ditolak Dinas (NON-RTLH), pakai warna HIJAU EMERALD (Layak Huni)
    const label = getStatusLabel(item)
    if (label === 'NON-RTLH') return 'bg-emerald-500 text-white border-emerald-600'
    return 'bg-destructive/10 text-destructive border-destructive/20'
  }

  // PRIORITAS UTAMA: Jika sudah terintervensi, wajib Hijau Solid (Sudah Layak)
  if (item.is_intervened === 1) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'

  // Jika RTLH (Sudah Verifikasi Dinas tapi belum intervensi), wajib MERAH
  if (item.verif_perkim) return 'bg-destructive text-white border-destructive shadow-sm shadow-destructive/20'
  if (item.input_surveyor) return 'bg-purple-50 text-purple-700 border-purple-200'
  if (item.input_kelurahan) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (item.input_lpm) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

const exporting = ref(false)
const handleExportExcel = () => {
  exporting.value = true
  const params = new URLSearchParams()
  if (filters.value.status) params.append('status', filters.value.status)
  if (filters.value.kecamatan) params.append('kecamatan', filters.value.kecamatan)
  if (filters.value.kelurahan) params.append('kelurahan', filters.value.kelurahan)
  if (searchQuery.value) params.append('search', searchQuery.value)
  
  // Tambahkan Token untuk Otorisasi via Query (window.open)
  if (auth.accessToken) params.append('token', auth.accessToken)
  
  window.open(`/api/laporan/export-excel?${params.toString()}`, '_blank')
  
  setTimeout(() => {
    exporting.value = false
  }, 2000)
}

onMounted(() => {
  fetchWilayah()
  fetchSurveys()
})
</script>
