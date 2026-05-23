<template>
  <div class="min-h-screen bg-background pb-40 transition-colors duration-300">
    <!-- GLASSMORPHISM HEADER (SYNCED WITH MAIN TOP NAV) -->
    <div class="sticky top-0 z-40 w-full backdrop-blur-sm bg-card/95 border-b border-border/30 shadow-sm">
      <div class="w-full px-3 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div class="flex items-center gap-2 md:gap-6">
          <Button variant="ghost" size="icon" @click="$router.push('/app/entry')" class="rounded-xl hover:bg-accent transition-colors">
            <ArrowLeft class="h-5 w-5 md:h-6 md:h-6 text-foreground" />
          </Button>
          <div class="truncate">
            <h2 class="text-sm md:text-xl font-bold text-foreground tracking-tight leading-tight truncate">
              {{ isVerifikasiPath ? 'Verifikasi Berkas' : 'Detail Survey Terpadu' }}
            </h2>
          </div>
        </div>
        
        <div class="flex items-center gap-1.5">
           <!-- Tombol Edit Premium -->
           <Button
             v-if="!authStore.isSurveyor"
             variant="outline"
             size="sm"
             class="h-8 md:h-10 px-3 md:px-5 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all"
             @click="$router.push('/app/entry/form?id=' + route.params.id)"
           >
             <Edit2 class="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
             Edit Data
           </Button>

           <Badge v-if="data" :class="statusBadgeClass" class="px-2 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[11px] font-black shadow-lg rounded-full border-none whitespace-nowrap">
             {{ statusText }}
           </Badge>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="w-full px-2 md:px-6 py-4 md:py-10 space-y-6 md:space-y-10">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-40 space-y-6">
        <div class="relative h-16 w-16 md:h-20 md:w-20 text-primary">
          <Loader2 class="w-full h-full animate-spin opacity-20" />
        </div>
        <p class="text-muted-foreground font-bold tracking-widest uppercase text-[10px] animate-pulse">Menghubungkan Data...</p>
      </div>

      <!-- Content Area -->
      <div v-else-if="data" class="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
        
        <!-- LEFT COLUMN -->
        <div class="xl:col-span-8 space-y-6 md:space-y-10">
          
          <!-- SMART STATUS TRACKER -->
          <Card class="overflow-hidden border-none shadow-2xl bg-slate-900 dark:bg-slate-950 text-white rounded-[24px]">
            <CardContent class="p-6 md:p-8">
              <div class="flex items-center gap-3 mb-8 md:mb-10">
                <div class="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                   <Activity class="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                   <h3 class="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-indigo-200">Tracking Alur Birokrasi</h3>
                   <p class="text-[9px] md:text-[10px] text-slate-400 font-medium italic">Validasi Triple-Filter Terpusat</p>
                </div>
              </div>
              
              <div class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-2 px-2 md:px-6">
                <div class="hidden md:block absolute top-6 left-12 right-12 h-1 bg-white/5 z-0 rounded-full"></div>
                <div class="hidden md:block absolute top-6 left-12 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 z-0 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" :style="{ width: progressWidth, maxWidth: 'calc(100% - 6rem)' }"></div>
                <div class="md:hidden absolute top-6 left-7 bottom-6 w-1 bg-white/5 z-0 rounded-full"></div>
                <div class="md:hidden absolute top-6 left-7 w-1 bg-gradient-to-b from-indigo-500 to-indigo-400 transition-all duration-1000 z-0 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" :style="{ height: progressHeight, maxHeight: 'calc(100% - 3rem)' }"></div>

                <div v-for="(step, index) in timelineSteps" :key="index" class="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-4 group w-full md:w-24">
                  <div class="h-10 w-10 md:h-12 md:w-12 rounded-[14px] md:rounded-[16px] flex-shrink-0 flex items-center justify-center border-2 transition-all duration-500" :class="getStepClass(index + 1)">
                    <component :is="getStepIcon(index + 1, step.icon)" class="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div class="flex flex-col md:items-center">
                    <span class="text-[10px] md:text-[10px] font-black uppercase tracking-tight leading-tight" :class="isStepActive(index + 1) ? 'text-white' : 'text-slate-600'">
                      {{ step.label }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-10 md:mt-12 p-4 md:p-5 rounded-[20px] bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4 md:gap-5">
                <div class="p-2 md:p-3 rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-white/10 shrink-0">
                  <Lightbulb class="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h4 class="text-sm md:text-base font-bold text-indigo-200">{{ bannerTitle }}</h4>
                  <p class="text-[10px] md:text-xs text-slate-300 mt-1 leading-relaxed opacity-80">{{ bannerDesc }}</p>
                  <div v-if="data.is_rtlh === '0' && data.alasan_penolakan" class="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/25 text-left text-destructive">
                    <span class="block text-[8px] uppercase tracking-[0.2em] text-destructive/80 font-black mb-1.5">Dikembalikan / Ditolak Oleh:</span>
                    <span class="block text-xs font-extrabold text-rose-200 mb-2">{{ data.oleh_user_penolak || 'Petugas Verifikasi' }}</span>
                    <span class="block text-[8px] uppercase tracking-[0.2em] text-destructive/80 font-black mb-1">Alasan Penolakan:</span>
                    <p class="text-xs italic text-slate-100 font-medium">"{{ data.alasan_penolakan }}"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- GRID DATA UTAMA -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
             <Card class="border-none shadow-xl bg-card rounded-[24px] overflow-hidden">
                <div class="bg-muted/30 px-6 py-5 border-b border-border/50 flex items-center gap-3">
                   <div class="p-2 rounded-lg bg-primary/10 text-primary">
                      <UserCircle class="h-5 w-5" />
                   </div>
                   <span class="text-sm font-black uppercase tracking-widest text-foreground/80">Profil Kepala Keluarga</span>
                </div>
                <CardContent class="p-8 space-y-8">
                   <div class="flex flex-col">
                      <span class="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1.5">Nama Lengkap</span>
                      <span class="text-xl font-bold text-foreground leading-tight">{{ data.nama_lengkap_kepkel_rt }}</span>
                   </div>
                   <div class="space-y-6">
                      <div class="flex flex-col p-4 bg-muted/40 rounded-2xl border border-border/30">
                         <span class="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1">NIK</span>
                         <span class="text-lg font-mono font-bold text-foreground tracking-widest">{{ data.nik_kepkel }}</span>
                      </div>
                      <div class="flex flex-col p-4 bg-muted/40 rounded-2xl border border-border/30">
                         <span class="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1">Nomor KK</span>
                         <span class="text-lg font-mono font-bold text-foreground tracking-widest">{{ data.nomor_kk }}</span>
                      </div>
                   </div>
                   <div class="grid grid-cols-2 gap-6 text-sm pt-2">
                      <div class="space-y-1.5">
                         <span class="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Pekerjaan</span>
                         <p class="font-bold text-foreground/90">{{ data.pekerjaan_kepkel || '-' }}</p>
                      </div>
                      <div class="space-y-1.5">
                         <span class="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Pendidikan</span>
                         <p class="font-bold text-foreground/90">{{ data.pendidikan_terakhir_kepkel || '-' }}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card class="border-none shadow-xl bg-card rounded-[24px] overflow-hidden">
                <div class="bg-muted/30 px-6 py-5 border-b border-border/50 flex items-center gap-3">
                   <div class="p-2 rounded-lg bg-primary/10 text-primary">
                      <HomeIcon class="h-5 w-5" />
                   </div>
                   <span class="text-sm font-black uppercase tracking-widest text-foreground/80">Informasi Hunian</span>
                </div>
                <CardContent class="p-8 space-y-6">
                   <div class="flex flex-col">
                      <span class="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1.5">Alamat Lengkap</span>
                      <span class="text-foreground/90 text-sm font-bold leading-relaxed">{{ data.alamat_jalan_rumah }}, No.{{ data.alamat_nomor_rumah }}, RT.{{ data.alamat_rt_rumah }} / RW.{{ data.alamat_rw_rumah }}</span>
                      <p class="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{{ data.kelurahan }}, {{ data.kecamatan }}</p>
                   </div>
                   <div class="grid grid-cols-2 gap-4">
                      <div class="bg-muted/50 p-4 rounded-[16px] border border-border/50">
                         <span class="text-[9px] uppercase font-black text-muted-foreground block mb-1">Status Rumah</span>
                         <span class="text-xs font-black text-foreground">{{ data.status_kepemilikan_rumah || '-' }}</span>
                      </div>
                      <div class="bg-muted/50 p-4 rounded-[16px] border border-border/50">
                         <span class="text-[9px] uppercase font-black text-muted-foreground block mb-1">Status Tanah</span>
                         <span class="text-xs font-black text-foreground">{{ data.status_kepemilikan_tanah || '-' }}</span>
                      </div>
                   </div>
                   <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                         <span class="text-[10px] uppercase font-black text-muted-foreground">Penghasilan</span>
                         <p class="font-black text-primary text-sm">{{ data.penghasilan_perbulan || '-' }}</p>
                      </div>
                      <div class="space-y-1 text-right">
                         <span class="text-[10px] uppercase font-black text-muted-foreground">Luas Rumah</span>
                         <p class="font-black text-foreground text-sm">{{ data.luas_rumah }} m²</p>
                      </div>
                   </div>
                   <Separator class="bg-border/50" />
                   <div class="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/10">
                      <span class="text-[10px] font-black text-primary uppercase">Jumlah Penghuni</span>
                      <span class="font-black text-primary">{{ data.jumlah_penghuni }} Jiwa</span>
                   </div>
                </CardContent>
             </Card>
          </div>

          <!-- DATA KOMPREHENSIF -->
          <div class="space-y-6">
             <div class="flex items-center gap-3 px-2">
                <div class="h-px flex-1 bg-border/50"></div>
                <span class="text-[11px] font-black uppercase text-muted-foreground tracking-[0.4em]">Rincian Data Komprehensif</span>
                <div class="h-px flex-1 bg-border/50"></div>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <Card class="border-none shadow-lg bg-card rounded-[24px] overflow-hidden">
                   <div class="bg-muted px-6 py-4 border-b border-border/50">
                      <h4 class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         <UserIcon class="h-4 w-4 text-primary" /> Sosial & Kependudukan
                      </h4>
                   </div>
                   <CardContent class="p-6 space-y-4">
                      <div v-for="item in sosialExtra" :key="item.key" class="flex justify-between items-center text-sm">
                         <span class="text-muted-foreground">{{ item.label }}</span>
                         <span class="font-bold text-foreground text-right ml-4">{{ data[item.key] || '-' }}</span>
                      </div>
                   </CardContent>
                </Card>
                <Card class="border-none shadow-lg bg-card rounded-[24px] overflow-hidden">
                   <div class="bg-muted px-6 py-4 border-b border-border/50">
                      <h4 class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         <Building2 class="h-4 w-4 text-primary" /> Utilitas & Sanitasi
                      </h4>
                   </div>
                   <CardContent class="p-6 space-y-4">
                      <div v-for="item in utilitasExtra" :key="item.key" class="flex justify-between items-center text-sm">
                         <span class="text-muted-foreground">{{ item.label }}</span>
                         <span class="font-bold text-foreground text-right ml-4">{{ data[item.key] || '-' }}</span>
                      </div>
                   </CardContent>
                </Card>
                <Card class="border-none shadow-lg bg-card rounded-[24px] overflow-hidden md:col-span-2">
                   <div class="bg-muted px-6 py-4 border-b border-border/50 flex justify-between items-center">
                      <h4 class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         <Wrench class="h-4 w-4 text-primary" /> Spesifikasi Teknis Bangunan
                      </h4>
                      <Badge variant="outline" class="text-[9px] uppercase font-bold border-primary/20 text-primary">Detail Konstruksi</Badge>
                   </div>
                   <CardContent class="p-0">
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                         <div class="p-6 space-y-4">
                            <p class="text-[10px] font-black uppercase text-primary mb-2">I. Struktur Utama</p>
                            <div v-for="item in strukturItems" :key="item.key" class="flex justify-between items-center text-xs py-1">
                               <span class="text-muted-foreground">{{ item.label }}</span>
                               <span class="font-bold text-foreground">{{ data[item.key] || '-' }}</span>
                            </div>
                         </div>
                         <div class="p-6 space-y-4">
                            <p class="text-[10px] font-black uppercase text-primary mb-2">II. Material & Kondisi</p>
                            <div v-for="item in arsitekturFull" :key="item.key" class="flex justify-between items-center text-xs py-1">
                               <span class="text-muted-foreground">{{ item.label }}</span>
                               <span class="font-bold text-foreground">{{ data[item.key] || '-' }}</span>
                            </div>
                         </div>
                         <div class="p-6 space-y-4">
                            <p class="text-[10px] font-black uppercase text-primary mb-2">III. Kawasan & Tata Ruang</p>
                            <div v-for="item in kawasanItems" :key="item.key" class="flex justify-between items-center text-xs py-1">
                               <span class="text-muted-foreground">{{ item.label }}</span>
                               <span class="font-bold text-foreground text-right ml-2">{{ data[item.key] || '-' }}</span>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="xl:col-span-4 space-y-6 md:space-y-10">
          
          <!-- GEOSPASIAL (WITH FULLSCREEN CAPABILITY) -->
          <Card class="border-none shadow-xl bg-card rounded-[24px] overflow-hidden xl:sticky xl:top-28">
            <CardHeader class="p-6 bg-card border-b border-border/50">
              <div class="flex items-center justify-between">
                 <div class="flex items-center gap-3">
                    <NavigationIcon class="h-5 w-5 text-primary" />
                    <CardTitle class="text-sm font-black uppercase tracking-widest">Titik Geospasial</CardTitle>
                 </div>
                 <Badge variant="outline" class="text-[9px] font-mono font-bold px-2">{{ data.latitude }}, {{ data.longitude }}</Badge>
              </div>
            </CardHeader>
            <CardContent class="p-0 relative group">
               <div class="h-64 md:h-80 w-full relative overflow-hidden">
                  <l-map
                    v-if="showMap"
                    :zoom="16"
                    :center="[parseFloat(data.latitude), parseFloat(data.longitude)]"
                    :use-global-leaflet="false"
                    class="h-full w-full z-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  >
                    <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <l-marker :lat-lng="[parseFloat(data.latitude), parseFloat(data.longitude)]" />
                  </l-map>
                  <div v-else class="h-full w-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                     <Loader2 class="h-8 w-8 mb-3 animate-spin opacity-20" />
                     <span class="text-[10px] font-black uppercase tracking-widest">Memuat Peta...</span>
                  </div>
                  
                  <!-- FULLSCREEN TRIGGER OVERLAY -->
                  <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px] z-10" @click="isMapFullscreen = true">
                     <div class="bg-white/90 p-3 rounded-2xl shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 class="text-primary h-8 w-8" />
                     </div>
                  </div>
               </div>
            </CardContent>
            
            <CardHeader class="p-6 bg-card border-b border-border/50">
              <div class="flex items-center gap-3">
                <ImageIcon class="h-5 w-5 text-primary" />
                <CardTitle class="text-sm font-black uppercase tracking-widest text-foreground/80">Dokumentasi Visual</CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-6 space-y-6 bg-muted/20">
               <div class="grid grid-cols-2 gap-4">
                  <div v-for="img in galleryItems" :key="img.key" class="space-y-3">
                     <p class="text-[9px] font-black text-muted-foreground uppercase text-center tracking-tighter">{{ img.label }}</p>
                     <div class="aspect-square rounded-[20px] overflow-hidden border-4 border-background shadow-lg bg-muted group relative">
                        <img v-if="data[img.key]" :src="backendUrl(data[img.key])" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" @error="handleImageError" />
                        <div v-else class="w-full h-full flex items-center justify-center bg-muted/50"><CameraOff class="h-8 w-8 text-muted-foreground/30" /></div>
                        <div v-if="data[img.key]" class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm" @click="zoomImage(data[img.key])">
                           <Maximize2 class="text-white h-8 w-8 drop-shadow-lg" />
                        </div>
                     </div>
                  </div>
               </div>
               <div class="space-y-3 mt-6">
                  <p class="text-[9px] font-black text-muted-foreground uppercase tracking-tighter text-center">Identitas Resmi (KTP/KK)</p>
                  <div class="w-full rounded-[20px] overflow-hidden border-4 border-background shadow-lg bg-muted aspect-[16/9] group relative">
                     <img v-if="data.file_foto_ktp" :src="backendUrl(data.file_foto_ktp)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" @error="handleImageError" />
                     <div v-if="data.file_foto_ktp" class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm" @click="zoomImage(data.file_foto_ktp)">
                        <Maximize2 class="text-white h-8 w-8 drop-shadow-lg" />
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <!-- PREMIUM FLOATING ACTION BAR (RESPONSIVE POS) -->
      <div v-if="data && (
        isVerifikasiPath || 
        ((authStore.isKelurahan || authStore.isAdmin) && !data.input_kelurahan) ||
        ((authStore.isSurveyor || authStore.isAdmin) && data.input_kelurahan && !data.input_surveyor) ||
        ((authStore.isDinas || authStore.isAdmin) && data.input_surveyor && !data.verif_perkim)
      )" 
        class="fixed bottom-10 left-1/2 -translate-x-1/2 xl:left-auto xl:right-10 xl:translate-x-0 w-[95%] sm:w-auto sm:min-w-[450px] z-50 animate-in slide-in-from-bottom-12 duration-500"
      >
        <div class="bg-card/70 backdrop-blur-md border border-border/50 shadow-2xl rounded-[24px] p-4 md:p-5 flex items-center gap-4">
          <Button 
            class="flex-1 h-14 md:h-16 rounded-2xl bg-secondary hover:bg-destructive/10 hover:text-destructive text-secondary-foreground font-black uppercase tracking-widest transition-all border-none group" 
            variant="outline" 
            :disabled="submitting" 
            @click="submitVerifikasi(0)"
          >
            <XCircle class="w-5 h-5 md:w-6 md:h-6 mr-2 transition-transform group-hover:scale-110" /> 
            <span class="text-[10px] md:text-xs">
              {{ !data.input_surveyor ? 'Dikembalikan Ke Pengusul' : 'Tidak Layak' }}
            </span>
          </Button>
          
          <Button 
            class="flex-[1.5] h-14 md:h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-black uppercase tracking-widest transition-all border-none group" 
            :disabled="submitting" 
            @click="submitVerifikasi(1)"
          >
            <Trophy v-if="!data.input_surveyor ? false : true" class="w-5 h-5 md:w-6 md:h-6 mr-2 animate-bounce" />
            <CheckCircle2 v-else class="w-5 h-5 md:w-6 md:h-6 mr-2 transition-transform group-hover:scale-110" /> 
            <span class="text-[10px] md:text-xs">
              Verifikasi {{ !data.input_kelurahan ? 'Kelurahan' : (!data.input_surveyor ? 'Kecamatan' : 'Dinas (Final)') }}
            </span>
          </Button>
        </div>
      </div>
    </div>

    <!-- ZOOM IMAGE MODAL -->
    <div v-if="zoomedImg" class="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center p-8 animate-in fade-in" @click="zoomedImg = null">
       <img :src="backendUrl(zoomedImg)" class="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-2xl" @click.stop />
       <Button variant="ghost" size="icon" class="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full" @click="zoomedImg = null">
          <X class="h-8 w-8" />
       </Button>
    </div>

    <!-- FULLSCREEN MAP MODAL (INTERACTIVE) -->
    <div v-if="isMapFullscreen" class="fixed inset-0 z-[9999] bg-black animate-in fade-in flex flex-col">
       <div class="absolute top-6 right-6 z-[10000] flex gap-3">
          <Badge variant="secondary" class="bg-white/90 text-primary font-mono font-bold px-4 py-2 rounded-xl shadow-xl">
             {{ data.latitude }}, {{ data.longitude }}
          </Badge>
          <Button variant="destructive" size="icon" class="h-12 w-12 rounded-xl shadow-2xl" @click="isMapFullscreen = false">
             <X class="h-6 w-6" />
          </Button>
       </div>
       
       <div class="flex-1 w-full h-full overflow-hidden">
          <l-map
            :zoom="18"
            :center="[parseFloat(data.latitude), parseFloat(data.longitude)]"
            :use-global-leaflet="false"
            class="h-full w-full"
          >
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[parseFloat(data.latitude), parseFloat(data.longitude)]">
               <l-popup><b>Titik Survey #{{ data.id }}</b><br/>{{ data.nama_lengkap_kepkel_rt }}</l-popup>
            </l-marker>
          </l-map>
       </div>
       
       <div class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-3xl z-[10000] text-center shadow-2xl">
          <p class="text-white font-black uppercase tracking-widest text-[10px] md:text-xs">Mode Pantau Geospasial Interaktif</p>
          <p class="text-white/60 text-[9px] mt-1">{{ data.alamat_jalan_rumah }}</p>
       </div>
    </div>

    <!-- PREMIUM SOP-COMPLIANT CONFIRMATION MODAL -->
    <AlertDialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
      <AlertDialogContent class="rounded-[24px] border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-8 max-w-[400px]">
        <AlertDialogHeader>
          <div class="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
             <component :is="confirmType === 1 ? CheckCircle2 : XCircle" class="h-8 w-8" />
          </div>
          <AlertDialogTitle class="text-xl font-black uppercase tracking-tight text-foreground">
            Konfirmasi {{ confirmType === 1 ? 'Verifikasi' : 'Penolakan' }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-muted-foreground leading-relaxed pt-2">
            Apakah Anda yakin ingin {{ confirmType === 1 ? 'memverifikasi' : 'menolak' }} data survey ini? 
            <span v-if="confirmType === 1" class="block mt-1">Tindakan ini akan memproses berkas ke tahap administratif selanjutnya.</span>
            <span v-else class="block mt-1">Tindakan ini akan mengembalikan usulan ke pengusul. Silakan berikan alasan penolakan di bawah ini.</span>
          </AlertDialogDescription>

          <!-- Input alasan penolakan jika confirmType === 0 -->
          <div v-if="confirmType === 0" class="mt-5 space-y-2 text-left">
            <Label class="text-[10px] uppercase font-black tracking-wider text-foreground/80">Alasan Penolakan / Pengembalian</Label>
            <Textarea 
              v-model="alasanPenolakanInput" 
              placeholder="Contoh: Dokumen KTP kurang jelas, koordinat lokasi tidak sesuai, atau kondisi rumah masih layak..." 
              rows="3" 
              class="w-full resize-none text-xs rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter class="mt-8 gap-3">
          <AlertDialogCancel class="rounded-xl h-12 border-none bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold px-6">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            class="rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20"
            :disabled="confirmType === 0 && !alasanPenolakanInput.trim()"
            @click="executeVerifikasi"
          >
            Ya, Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api as axios } from '@/boot/axios'
import { 
  ArrowLeft, CheckCircle2, XCircle, MapPin, 
  Activity, CheckSquare, ClipboardCheck, Trophy, 
  Lightbulb, UserCircle, Home as HomeIcon, Building2,
  Wrench, Maximize2, X, CameraOff, FileText, Navigation as NavigationIcon, Edit2,
  User as UserIcon, ImageIcon, Loader2
} from 'lucide-vue-next'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'

// Leaflet Components
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"
import "leaflet/dist/leaflet.css"

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const isVerifikasiPath = route.path.includes('verifikasi-lpmk')
const loading = ref(true)
const submitting = ref(false)
const data = ref(null)
const zoomedImg = ref(null)
const showMap = ref(false)
const isMapFullscreen = ref(false)
const showConfirmDialog = ref(false)
const confirmType = ref(1) // 1 for verif, 0 for reject
const alasanPenolakanInput = ref('')

const sosialExtra = [
  { label: 'Umur Kepala Keluarga', key: 'umur_kepkel' },
  { label: 'Jenis Kelamin', key: 'jenis_kelamin_kepkel' },
  { label: 'Jumlah Tanggungan', key: 'jumlah_kepkel' },
  { label: 'Status Desil', key: 'desil' },
  { label: 'Tgl Penetapan Desil', key: 'tgl_penetapan_desil' },
  { label: 'Aset Rumah Lain', key: 'aset_rumah_tempat_lain' },
  { label: 'Aset Tanah Lain', key: 'aset_tanah_tempat_lain' }
]
const utilitasExtra = [
  { label: 'Sumber Penerangan', key: 'sumber_penerangan' },
  { label: 'Sumber Air Minum', key: 'sumber_air_minum' },
  { label: 'Jarak Septic Tank', key: 'jarak_sam_tpa_tinja' },
  { label: 'Jenis Kloset', key: 'jenis_kloset' },
  { label: 'Jenis TPA Tinja', key: 'jenis_tpa_tinja' },
  { label: 'Sanitasi (KM/Jamban)', key: 'km_dan_jamban' }
]
const strukturItems = [
  { label: 'Fondasi Utama', key: 'fondasi' },
  { label: 'Kolom Struktur', key: 'kolom' },
  { label: 'Rangka Atap', key: 'rangka' },
  { label: 'Balok Struktur', key: 'balok' },
  { label: 'Sloof Bangunan', key: 'sloof' },
  { label: 'Plafon', key: 'plafon' }
]
const arsitekturFull = [
  { label: 'Material Lantai', key: 'material_lantai' },
  { label: 'Kondisi Lantai', key: 'kondisi_lantai' },
  { label: 'Material Dinding', key: 'material_dinding' },
  { label: 'Kondisi Dinding', key: 'kondisi_dinding' },
  { label: 'Material Atap', key: 'material_atap' },
  { label: 'Kondisi Atap', key: 'kondisi_atap' },
  { label: 'Jendela', key: 'jendela' },
  { label: 'Ventilasi', key: 'ventilasi' }
]
const kawasanItems = [
  { label: 'Jenis Kawasan', key: 'jenis_kawasan' },
  { label: 'Fungsi Ruang', key: 'fungsi_ruang' },
  { label: 'Bantuan Perumahan', key: 'bantuan_perumahan' },
  { label: 'Luas Tanah', key: 'luas_tanah' }
]
const galleryItems = [
  { label: 'Fasad Rumah', key: 'file_foto_rumah' },
  { label: 'Tampak Depan', key: 'file_foto_depan' },
  { label: 'Bersama Pemilik', key: 'file_foto_pemilik' },
  { label: 'Dokumen Lain', key: 'file_foto_dokumen' }
]
const timelineSteps = [
  { label: 'ENTRY PENGUSUL', icon: UserIcon },
  { label: 'Verifikasi Kelurahan', icon: CheckSquare },
  { label: 'Verifikasi Kecamatan', icon: ClipboardCheck },
  { label: 'Verifikasi Dinas', icon: Trophy }
]

const penolak = computed(() => data.value?.oleh_user_penolak || '')

const isRejectedKelurahan = computed(() => {
  if (data.value?.is_rtlh !== '0') return false
  if (penolak.value.includes('Kelurahan') || penolak.value.includes('LPMK')) return true
  
  // Fallback data lama
  if (!penolak.value) {
    const timePerkim = data.value?.input_perkim ? new Date(data.value.input_perkim).getTime() : 0
    const timeSurveyor = data.value?.input_surveyor ? new Date(data.value.input_surveyor).getTime() : 0
    const timeKelurahan = data.value?.input_kelurahan ? new Date(data.value.input_kelurahan).getTime() : 0
    if (timeKelurahan > 0 && !(timeSurveyor > 0) && !(timePerkim >= timeKelurahan)) {
      return true
    }
  }
  return false
})

const isRejectedKecamatan = computed(() => {
  if (data.value?.is_rtlh !== '0') return false
  if (penolak.value.includes('Kecamatan')) return true
  
  // Fallback data lama
  if (!penolak.value) {
    const timePerkim = data.value?.input_perkim ? new Date(data.value.input_perkim).getTime() : 0
    const timeSurveyor = data.value?.input_surveyor ? new Date(data.value.input_surveyor).getTime() : 0
    const timeKelurahan = data.value?.input_kelurahan ? new Date(data.value.input_kelurahan).getTime() : 0
    if (timeSurveyor > 0 && !(timePerkim >= timeSurveyor)) {
      return true
    }
  }
  return false
})

const isRejectedDinas = computed(() => {
  if (data.value?.is_rtlh !== '0') return false
  if (penolak.value.includes('Perkim') || penolak.value.includes('Dinas') || penolak.value.includes('Admin') || penolak.value.includes('Super')) return true
  
  // Fallback data lama
  if (!penolak.value) {
    const timePerkim = data.value?.input_perkim ? new Date(data.value.input_perkim).getTime() : 0
    const timeSurveyor = data.value?.input_surveyor ? new Date(data.value.input_surveyor).getTime() : 0
    const timeKelurahan = data.value?.input_kelurahan ? new Date(data.value.input_kelurahan).getTime() : 0
    if (timePerkim > 0 && timePerkim >= timeSurveyor && timePerkim >= timeKelurahan) {
      return true
    }
  }
  return false
})

const step1Active = computed(() => !!data.value?.input_lpm)
const step2Active = computed(() => !!data.value?.input_kelurahan)
const step3Active = computed(() => !!data.value?.input_surveyor && !isRejectedKelurahan.value)
const step4Active = computed(() => !!data.value?.verif_perkim && !isRejectedKelurahan.value && !isRejectedKecamatan.value)

const isStepActive = (step) => {
  if (step === 1) return step1Active.value
  if (step === 2) return step2Active.value
  if (step === 3) return step3Active.value
  if (step === 4) return step4Active.value
  return false
}

const getStepClass = (step) => {
  const active = isStepActive(step)
  
  // Cek apakah ditolak di tahap ini
  const isRejectedHere = (step === 2 && isRejectedKelurahan.value) ||
                         (step === 3 && isRejectedKecamatan.value) ||
                         (step === 4 && isRejectedDinas.value)

  if (isRejectedHere) return 'bg-destructive border-destructive text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
  if (active) return 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
  
  const prevActive = isStepActive(step - 1)
  if (prevActive && !active && data.value?.is_rtlh !== '0') return 'bg-slate-800 border-amber-500/50 animate-pulse text-amber-500'
  return 'bg-slate-800 border-slate-700 text-slate-600'
}

const getStepIcon = (step, defaultIcon) => {
  const isRejectedHere = (step === 2 && isRejectedKelurahan.value) ||
                         (step === 3 && isRejectedKecamatan.value) ||
                         (step === 4 && isRejectedDinas.value)
  return isRejectedHere ? XCircle : defaultIcon
}

const progressWidth = computed(() => {
  if (isRejectedDinas.value) return '100%'
  if (isRejectedKecamatan.value) return '66%'
  if (isRejectedKelurahan.value) return '33%'
  
  if (step4Active.value) return '100%'
  if (step3Active.value) return '66%'
  if (step2Active.value) return '33%'
  return '0%'
})

const progressHeight = computed(() => {
  if (isRejectedDinas.value) return '100%'
  if (isRejectedKecamatan.value) return '75%'
  if (isRejectedKelurahan.value) return '50%'

  if (step4Active.value) return '100%'
  if (step3Active.value) return '75%'
  if (step2Active.value) return '50%'
  if (step1Active.value) return '25%'
  return '0%'
})

const statusText = computed(() => {
  if (data.value?.is_rtlh === '0') {
    if (isRejectedDinas.value) return 'NON-RTLH'
    if (isRejectedKecamatan.value) return 'DIKEMBALIKAN KE PENGUSUL OLEH KECAMATAN'
    if (isRejectedKelurahan.value) return 'DIKEMBALIKAN KE PENGUSUL OLEH KELURAHAN'
    return 'DITOLAK'
  }
  if (data.value?.is_intervened === 1) return 'RTLH (TERINTERVENSI)'
  if (step4Active.value) return 'RTLH'
  if (step3Active.value) return 'PROSES DINAS'
  if (step2Active.value) return 'ANTREAN VERIFIKASI KECAMATAN'
  return 'ANTREAN VERIFIKASI KELURAHAN'
})

const statusBadgeClass = computed(() => {
  if (data.value?.is_rtlh === '0') {
    if (isRejectedDinas.value) return 'bg-emerald-600 text-white'
    return 'bg-destructive text-white shadow-destructive/20'
  }
  if (data.value?.is_intervened === 1) return 'bg-emerald-600 text-white shadow-emerald-500/20'
  if (step4Active.value) return 'bg-destructive text-white shadow-destructive/20'
  if (step3Active.value) return 'bg-primary text-primary-foreground'
  return 'bg-amber-500 text-white'
})

const bannerTitle = computed(() => {
  if (data.value?.is_rtlh === '0') return 'Usulan Dikembalikan ke Pengusul'
  if (step4Active.value) return 'Siklus Validasi Selesai'
  if (step3Active.value) return 'Verifikasi Akhir Dinas'
  if (step2Active.value) return 'Verifikasi Lapangan Kecamatan'
  return 'Pengecekan Berkas Kelurahan'
})

const bannerDesc = computed(() => {
  if (data.value?.is_rtlh === '0') {
    if (isRejectedDinas.value) return 'Dinas menyatakan usulan ini masuk kategori NON-RTLH.'
    if (isRejectedKecamatan.value) return 'Kecamatan mengembalikan usulan ini ke pengusul.'
    if (isRejectedKelurahan.value) return 'Kelurahan mengembalikan usulan ini ke pengusul.'
    return 'Usulan ini tidak lolos kriteria verifikasi.'
  }
  if (step4Active.value) return 'Seluruh tahapan triple-verification telah dilalui dengan sukses.'
  if (step3Active.value) return 'Survey lapangan kecamatan telah divalidasi. Menunggu tinjauan akhir Dinas.'
  if (step2Active.value) return 'Lurah telah menyetujui berkas. Menunggu validasi teknis Kecamatan.'
  return 'Data diajukan PENGUSUL. Dalam antrean verifikasi Kelurahan.'
})

function backendUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : ''
  return `${base}/${path.replace(/^\//, '')}`
}
function handleImageError(e) {
  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
}
function zoomImage(path) { zoomedImg.value = path }

async function fetchDetail() {
  loading.value = true
  try {
    const res = await axios.get(`/api/surveys/${route.params.id}`)
    data.value = res.data.data
    if (data.value.latitude && data.value.longitude && parseFloat(data.value.latitude) !== 0) {
      showMap.value = true
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi data.' })
    router.push('/app/entry')
  } finally {
    loading.value = false
  }
}

async function submitVerifikasi(isRtlhValue) {
  confirmType.value = isRtlhValue
  showConfirmDialog.value = true
}

async function executeVerifikasi() {
  submitting.value = true
  try {
    const payload = { 
      id: data.value.id, 
      status: confirmType.value, 
      id_verifikator: authStore.user?.id,
      alasan: confirmType.value === 0 ? alasanPenolakanInput.value : ''
    }
    const res = await axios.post('/api/verifikasi-lpmk/verify', payload)
    if (res.data.success) {
      $q.notify({ type: 'positive', message: 'Data berhasil diverifikasi!' })
      router.push('/app/entry')
    }
  } catch (err) {
    console.error(err)
    let errMsg = 'Gagal melakukan verifikasi.'
    if (err.response?.data) {
      const resData = err.response.data
      if (resData.message) {
        errMsg = resData.message
        if (resData.errors) {
          errMsg += `: ${resData.errors}`
        }
      } else if (resData.errors) {
        errMsg = resData.errors
      }
    }
    $q.notify({ type: 'negative', message: errMsg })
  } finally {
    submitting.value = false
    showConfirmDialog.value = false
    alasanPenolakanInput.value = ''
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
