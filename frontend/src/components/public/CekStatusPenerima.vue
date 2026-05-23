<template>
  <div class="w-full max-w-4xl mx-auto px-4" id="cek-status-section">
    <div class="relative bg-card rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 overflow-hidden group">
      <!-- Glow Effect Behind Card -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none"></div>
      
      <!-- Decorative Blobs -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-500 pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
          <Search class="w-8 h-8 text-primary" />
        </div>
        
        <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Cek Status Penerima Bantuan
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Masukkan Nomor Induk Kependudukan (NIK) Anda untuk melihat status pengajuan dan kelayakan program e-RTLH.
        </p>

        <!-- Search Form -->
        <form @submit.prevent="handleSearch" class="w-full max-w-2xl relative">
          <div class="relative flex items-center">
            <div class="absolute left-4 md:left-6 text-muted-foreground pointer-events-none">
              <CreditCard class="w-6 h-6" />
            </div>
            
            <input 
              v-model="nik"
              type="text" 
              placeholder="Masukkan 16 digit NIK..."
              class="w-full h-16 md:h-20 pl-14 md:pl-16 pr-32 md:pr-40 text-lg md:text-xl rounded-full bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 outline-none shadow-inner text-foreground placeholder:text-muted-foreground/60"
              :disabled="isLoading"
              maxlength="16"
            />
            
            <div class="absolute right-2 md:right-3">
              <Button 
                type="submit" 
                size="lg" 
                class="rounded-full h-12 md:h-14 px-6 md:px-8 text-base shadow-lg hover:shadow-primary/30 transition-all duration-300"
                :disabled="!isValidNik || isLoading"
              >
                <span v-if="!isLoading" class="flex items-center">
                  Cari Data <ArrowRight class="ml-2 w-4 h-4 hidden sm:block" />
                </span>
                <span v-else class="flex items-center">
                  <Loader2 class="w-5 h-5 animate-spin mr-2" /> Memproses...
                </span>
              </Button>
            </div>
          </div>
          
          <p v-if="nik && !isValidNik && nik.length > 0" class="absolute -bottom-6 left-6 text-sm text-destructive font-medium animate-fade-in">
            NIK harus terdiri dari 16 digit angka.
          </p>
        </form>

        <!-- Result Area: Ultra Premium ID Card Landscape -->
        <transition
          enter-active-class="transition duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from-class="opacity-0 translate-y-12 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-12"
        >
          <div v-if="searchResult" class="w-full max-w-2xl mt-16 relative group/card">
            
            <!-- FOUND: Blue Premium Card -->
            <div v-if="searchResult.status === 'success'" class="relative overflow-hidden rounded-[32px] p-1 shadow-[0_32px_64px_-12px_rgba(30,58,138,0.3)] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white border border-white/20">
               <!-- Decorative elements -->
               <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div class="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -ml-16 -mb-16"></div>

               <div class="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-8 p-8 md:p-10">
                  <!-- ID Photo / Avatar -->
                  <div class="flex-shrink-0">
                    <div class="w-32 h-40 md:w-40 md:h-52 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl group-hover/card:scale-105 transition-transform duration-500">
                      <svg viewBox="0 0 100 100" class="w-full h-full text-white/40 p-4">
                        <circle cx="50" cy="40" r="25" fill="currentColor" />
                        <path d="M10 90 Q50 60 90 90" stroke="currentColor" stroke-width="8" fill="none" />
                      </svg>
                    </div>
                  </div>

                  <!-- ID Details -->
                  <div class="flex-1 flex flex-col text-left justify-center space-y-4">
                    <div class="space-y-1">
                      <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Status Penerimaan</span>
                      <div class="flex items-center gap-2">
                        <h4 class="text-2xl md:text-3xl font-black tracking-tight">{{ searchResult.title }}</h4>
                        <CheckCircle class="w-6 h-6 text-green-400 fill-green-400/20" />
                      </div>
                    </div>

                    <div class="h-px w-full bg-gradient-to-r from-white/40 to-transparent"></div>

                    <div class="grid grid-cols-1 gap-4">
                      <div class="space-y-1">
                        <span class="text-[9px] font-black uppercase tracking-widest opacity-50">Nama Lengkap</span>
                        <p class="text-lg md:text-xl font-bold tracking-tight uppercase">{{ searchResult.nama }}</p>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <span class="text-[9px] font-black uppercase tracking-widest opacity-50">NIK Terdaftar</span>
                          <p class="text-sm md:text-base font-mono font-black tracking-tighter">{{ nik }}</p>
                        </div>
                        <div class="space-y-1">
                          <span class="text-[9px] font-black uppercase tracking-widest opacity-50">Wilayah</span>
                          <p class="text-[10px] md:text-[11px] font-black leading-tight uppercase">{{ searchResult.kelurahan }}, {{ searchResult.kecamatan }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] font-medium leading-relaxed opacity-90 italic">
                      {{ searchResult.message }}
                    </div>
                  </div>
               </div>

               <!-- Bottom Bar -->
               <div class="bg-white/5 border-t border-white/10 px-8 py-3 flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">E-RTLH KOTA PROBOLINGGO</span>
                  <div class="flex items-center gap-1.5">
                    <div :class="cn('h-1.5 w-1.5 rounded-full animate-pulse', searchResult.is_rtlh ? 'bg-green-400' : 'bg-yellow-400')"></div>
                    <span :class="cn('text-[9px] font-black uppercase tracking-widest', searchResult.is_rtlh ? 'text-green-400' : 'text-yellow-400')">
                      {{ searchResult.is_rtlh ? 'Data Valid & Terverifikasi' : 'Dalam Proses Evaluasi' }}
                    </span>
                  </div>
               </div>
            </div>

            <!-- NOT FOUND: Dark Audit Card -->
            <div v-else class="relative overflow-hidden rounded-[32px] p-1 shadow-2xl bg-slate-900 text-slate-300 border border-slate-800">
               <div class="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
               
               <div class="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-8 p-8 md:p-10">
                  <!-- Search Icon Display -->
                  <div class="flex-shrink-0">
                    <div class="w-32 h-40 md:w-40 md:h-52 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner">
                      <div class="relative">
                        <Search class="w-16 h-16 text-slate-600" />
                        <X class="w-10 h-10 text-red-500 absolute -top-2 -right-2 bg-slate-900 rounded-full border-2 border-red-500/50 p-1" />
                      </div>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 flex flex-col text-left justify-center space-y-6">
                    <div class="space-y-1">
                      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">Hasil Pencarian</span>
                      <h4 class="text-2xl md:text-3xl font-black tracking-tight text-white">{{ searchResult.title }}</h4>
                    </div>

                    <div class="h-px w-full bg-gradient-to-r from-slate-700 to-transparent"></div>

                    <div class="space-y-4">
                      <p class="text-lg text-slate-400 font-medium leading-relaxed">
                        {{ searchResult.message }}
                      </p>
                      <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                        <AlertCircle class="w-4 h-4" />
                        ID: {{ nik }} Tidak Terdaftar
                      </div>
                    </div>
                  </div>
               </div>

               <div class="bg-slate-800/50 border-t border-slate-800 px-8 py-3 flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">SISTEM AUDIT E-RTLH</span>
                  <span class="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Lakukan Pengecekan Ulang NIK Anda</span>
               </div>
            </div>

          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { api } from '@/boot/axios'
import { Search, CreditCard, ArrowRight, Loader2, CheckCircle, AlertCircle, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const nik = ref('')
const isLoading = ref(false)
const searchResult = ref(null)

const isValidNik = computed(() => {
  const nikStr = String(nik.value).trim()
  return nikStr.length === 16 && /^\d+$/.test(nikStr)
})

const handleSearch = async () => {
  if (!isValidNik.value) return
  
  isLoading.value = true
  searchResult.value = null
  
  try {
    const response = await api.get(`/api/public/cek-status?nik=${nik.value}`)
    const res = response.data
    
    if (res.success) {
      const d = res.data
      searchResult.value = {
        status: 'success',
        title: 'DATA DITEMUKAN!',
        nama: d.nama || 'Warga e-RTLH',
        kelurahan: d.kelurahan || '-',
        kecamatan: d.kecamatan || '-',
        is_rtlh: d.is_rtlh === '1',
        message: d.is_rtlh === '1' 
          ? `Warga telah terverifikasi sebagai penerima program peningkatan kualitas hunian.`
          : `Data terdaftar namun hasil verifikasi menyatakan belum memenuhi kriteria RTLH saat ini.`
      }
    }
  } catch (err) {
    searchResult.value = {
      status: 'error',
      title: 'DATA TIDAK ADA',
      message: `Sistem tidak menemukan kecocokan data untuk NIK yang Anda masukkan dalam periode anggaran tahun ini.`
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
