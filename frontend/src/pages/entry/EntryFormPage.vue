<template>
  <div class="px-2 py-4 space-y-6 max-w-6xl mx-auto pb-20">
    <div class="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="icon" 
        @click="$router.push('/app/entry')" 
        class="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm transition-all active:scale-90"
        title="Kembali ke Daftar"
      >
        <ArrowLeft class="h-5 w-5 stroke-[3]" />
      </Button>
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Entry Data RTLH Terpadu</h2>
        <p class="text-muted-foreground text-sm">Input data lengkap (Identitas, Perkim, Teknis, Dokumentasi, & Geospasial).</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <Tabs v-model="activeTab" class="w-full">
        <div class="bg-primary border-x border-t rounded-t-xl overflow-hidden shadow-lg">
          <TabsList class="flex w-full h-auto p-1.5 bg-primary overflow-x-auto no-scrollbar gap-1.5">
            <TabsTrigger value="identitas" class="flex-1 py-3 gap-2 text-white/70 shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 rounded-lg hover:text-white">
              <UserIcon class="h-4 w-4" />
              <span class="hidden md:inline font-bold tracking-tight">1. Identitas & Alamat</span>
              <span class="md:hidden font-bold">1. Identitas</span>
            </TabsTrigger>
            <TabsTrigger value="perkim" class="flex-1 py-3 gap-2 text-white/70 shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 rounded-lg hover:text-white">
              <HomeIcon class="h-4 w-4" />
              <span class="hidden md:inline font-bold tracking-tight">2. Administrasi Perkim</span>
              <span class="md:hidden font-bold">2. Perkim</span>
            </TabsTrigger>
            <TabsTrigger value="teknis" class="flex-1 py-3 gap-2 text-white/70 shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 rounded-lg hover:text-white">
              <WrenchIcon class="h-4 w-4" />
              <span class="hidden md:inline font-bold tracking-tight">3. Detail Teknis</span>
              <span class="md:hidden font-bold">3. Teknis</span>
            </TabsTrigger>
            <TabsTrigger value="foto" class="flex-1 py-3 gap-2 text-white/70 shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 rounded-lg hover:text-white">
              <CameraIcon class="h-4 w-4" />
              <span class="hidden md:inline font-bold tracking-tight">4. Dokumentasi</span>
              <span class="md:hidden font-bold">4. Foto</span>
            </TabsTrigger>
            <TabsTrigger value="lokasi" class="flex-1 py-3 gap-2 text-white/70 shadow-none data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 rounded-lg hover:text-white">
              <MapIcon class="h-4 w-4" />
              <span class="hidden md:inline font-bold tracking-tight">5. Geospasial</span>
              <span class="md:hidden font-bold">5. Lokasi</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div class="bg-card border-x border-b rounded-b-xl shadow-sm min-h-[500px]">
          <!-- TABS CONTENT: IDENTITAS -->
          <TabsContent value="identitas" class="p-6 space-y-6 mt-0">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
              <div class="space-y-2">
                <Label>Kelurahan</Label>
                <FilterCombobox 
                  v-model="form.kode_wilayah" 
                  :options="kelurahans.map(o => ({ label: o.kelurahan, value: o.kode_wilayah }))"
                  placeholder="Pilih Kelurahan..."
                  :disabled="auth.isLpmk || auth.isKelurahan"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>NIK Kepala Keluarga</Label>
                <Input 
                  v-model="form.nik_kepkel" 
                  placeholder="16 Digit NIK" 
                  maxlength="16" 
                  :disabled="isLocked || nikChecking"
                  :class="{ 'border-destructive ring-destructive/20': isNikInvalid || isNikDuplicate }"
                  @blur="handleNikBlur"
                  @input="isNikDuplicate = false"
                />
                <p v-if="isNikInvalid" class="text-[10px] text-destructive font-bold italic anim-pulse">NIK harus 16 digit (Saat ini: {{ (form.nik_kepkel || '').length }})</p>
                <p v-if="isNikDuplicate" class="text-[10px] text-destructive font-bold italic anim-pulse">NIK ini sudah terdaftar di database!</p>
              </div>
              <div class="space-y-2">
                <Label>Nama Lengkap (Sesuai KTP)</Label>
                <Input v-model="form.nama_lengkap_kepkel_rt" placeholder="Input nama lengkap..." :disabled="isLocked" class="uppercase" />
              </div>
              <div class="space-y-2">
                <Label>Nomor Kartu Keluarga</Label>
                <Input 
                  v-model="form.nomor_kk" 
                  placeholder="16 Digit No. KK" 
                  maxlength="16" 
                  :disabled="isLocked" 
                  :class="{ 'border-destructive ring-destructive/20': isKkInvalid }"
                />
                <p v-if="isKkInvalid" class="text-[10px] text-destructive font-bold italic anim-pulse">No. KK harus 16 digit (Saat ini: {{ (form.nomor_kk || '').length }})</p>
              </div>
              <div class="space-y-2">
                <Label>Umur</Label>
                <Input v-model="form.umur_kepkel" type="number" :disabled="isLocked" />
              </div>
              <div class="space-y-2">
                <Label>Jenis Kelamin</Label>
                <FilterCombobox 
                  v-model="form.jenis_kelamin_kepkel" 
                  :options="getOptions('jenis_kelamin')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Pendidikan Terakhir</Label>
                <FilterCombobox 
                  v-model="form.pendidikan_terakhir_kepkel" 
                  :options="getOptions('pendidikan_terakhir')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Pekerjaan</Label>
                <FilterCombobox 
                  v-model="form.pekerjaan_kepkel" 
                  :options="getOptions('pekerjaan')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Jumlah Kepala Keluarga dlm Rumah</Label>
                <Input v-model="form.jumlah_kepkel" type="number" :disabled="!!isLocked" />
              </div>
              <div class="space-y-2">
                <Label>Desil (Pilihan 1-4)</Label>
                <FilterCombobox 
                  v-model="form.desil" 
                  :options="['1', '2', '3', '4']"
                  placeholder="Pilih Desil..."
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Tanggal Penetapan DESIL</Label>
                <DatePicker v-model="form.tgl_penetapan_desil" :disabled="!!isLocked" />
              </div>
            </div>

            <Separator />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
              <!-- Kolom Kiri: Alamat Lengkap -->
              <div class="space-y-6">
                <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Alamat Lengkap</h4>
                
                <div class="space-y-2">
                  <Label class="text-xs font-semibold">Dusun / Jalan / Nama Jalan</Label>
                  <Textarea v-model="form.alamat_jalan_rumah" placeholder="Jl. Mawar No. X, Dusun Y..." rows="3" class="w-full resize-none uppercase" :disabled="isLocked" />
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">No. Rumah</Label>
                    <Input v-model="form.alamat_nomor_rumah" placeholder="Ex: 12A" :disabled="isLocked" class="uppercase" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">RT</Label>
                    <Input v-model="form.alamat_rt_rumah" type="text" placeholder="000" :disabled="isLocked" class="uppercase" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">RW</Label>
                    <Input v-model="form.alamat_rw_rumah" type="text" placeholder="000" :disabled="isLocked" class="uppercase" />
                  </div>
                </div>
              </div>

              <!-- Kolom Kanan: Status Aset -->
              <div class="space-y-6">
                <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Status Aset & Kepemilikan</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">Status Kepemilikan Rumah</Label>
                    <FilterCombobox 
                      v-model="form.status_kepemilikan_rumah" 
                      :options="getOptions('status_kepemilikan_rumah')"
                      :disabled="!!isLocked"
                      :show-all="false"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">Status Kepemilikan Tanah</Label>
                    <FilterCombobox 
                      v-model="form.status_kepemilikan_tanah" 
                      :options="getOptions('status_kepemilikan_tanah')"
                      :disabled="!!isLocked"
                      :show-all="false"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">Aset Rumah di Tempat Lain</Label>
                    <FilterCombobox 
                      v-model="form.aset_rumah_tempat_lain" 
                      :options="getOptions('aset_rumah_ditempat_lain')"
                      :disabled="!!isLocked"
                      :show-all="false"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-semibold">Aset Tanah di Tempat Lain</Label>
                    <FilterCombobox 
                      v-model="form.aset_tanah_tempat_lain" 
                      :options="getOptions('aset_tanah_ditempat_lain')"
                      :disabled="!!isLocked"
                      :show-all="false"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <Button type="button" @click="activeTab = 'perkim'" class="gap-2">
                Selanjutnya: Administrasi Perkim
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <!-- TABS CONTENT: PERKIM -->
          <TabsContent value="perkim" class="p-6 space-y-6 mt-0">
            <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Kriteria Perumahan & Sanitasi</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               <div class="space-y-2">
                <Label>Penghasilan Perbulan</Label>
                <FilterCombobox 
                  v-model="form.penghasilan_perbulan" 
                  :options="getOptions('penghasilan_perbulan')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Pernah Dapat Bantuan Perumahan?</Label>
                <FilterCombobox 
                  v-model="form.bantuan_perumahan" 
                  :options="getOptions('bantuan_perumahan')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Jenis Kawasan</Label>
                <FilterCombobox 
                  v-model="form.jenis_kawasan" 
                  :options="getOptions('jenis_kawasan')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Fungsi Tata Ruang</Label>
                <FilterCombobox 
                  v-model="form.fungsi_ruang" 
                  :options="getOptions('fungsi_ruang')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Sumber Penerangan</Label>
                <FilterCombobox 
                  v-model="form.sumber_penerangan" 
                  :options="getOptions('sumber_penerangan')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
            </div>

            <Separator />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div class="space-y-2">
                <Label>Sumber Air Minum</Label>
                <FilterCombobox 
                  v-model="form.sumber_air_minum" 
                  :options="getOptions('sumber_air_minum')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Jarak SAM ke TPA Tinja</Label>
                <FilterCombobox 
                  v-model="form.jarak_sam_tpa_tinja" 
                  :options="getOptions('jarak_sam_tpa_tinja')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Fasilitas Mandi & Jamban</Label>
                <FilterCombobox 
                  v-model="form.km_dan_jamban" 
                  :options="getOptions('km_dan_jamban')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Jenis Kloset</Label>
                <FilterCombobox 
                  v-model="form.jenis_kloset" 
                  :options="getOptions('jenis_kloset')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
              <div class="space-y-2">
                <Label>Jenis TPA Tinja</Label>
                <FilterCombobox 
                  v-model="form.jenis_tpa_tinja" 
                  :options="getOptions('jenis_tpa_tinja')"
                  :disabled="!!isLocked"
                  :show-all="false"
                />
              </div>
            </div>

            <div class="flex justify-between pt-6 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                class="font-bold border-2 border-slate-400 text-foreground hover:bg-slate-100 px-6 shadow-sm"
                @click="activeTab = 'identitas'"
              >
                KEMBALI
              </Button>
              <Button type="button" @click="activeTab = 'teknis'" class="gap-2">
                Selanjutnya: Detail Teknis
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <!-- TABS CONTENT: TEKNIS -->
          <TabsContent value="teknis" class="p-6 space-y-8 mt-0">
            <div class="space-y-6">
              <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Dimensi & Kapasitas</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <div class="space-y-2">
                  <Label>Luas Rumah (Luas Bangunan m²)</Label>
                  <Input v-model="form.luas_rumah" type="number" :disabled="isLocked" />
                </div>
                <div class="space-y-2">
                  <Label>Luas Tanah (m²)</Label>
                  <Input v-model="form.luas_tanah" type="number" :disabled="isLocked" />
                </div>
                <div class="space-y-2">
                  <Label>Jumlah Penghuni (Jiwa)</Label>
                  <Input v-model="form.jumlah_penghuni" type="number" :disabled="isLocked" />
                </div>
              </div>
            </div>

            <Separator />

            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
              <!-- Struktur -->
              <div class="space-y-6">
                <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">1. STRUKTUR</h4>
                <div class="space-y-4">
                  <div v-for="field in fieldsStruktur" :key="field.id" class="space-y-1.5 px-1">
                    <Label class="text-[11px] font-semibold text-slate-600">{{ field.label }}</Label>
                    <FilterCombobox 
                      v-model="form[field.id]" 
                      :options="getOptions(field.id)"
                      compact
                      :show-all="false"
                      :disabled="!!isLocked"
                    />
                  </div>
                </div>
              </div>
              <!-- Arsitektur -->
              <div class="space-y-6">
                <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">2. ARSITEKTUR</h4>
                <div class="space-y-4">
                  <div v-for="field in fieldsArsitektur" :key="field.id" class="space-y-1.5 px-1">
                    <Label class="text-[11px] font-semibold text-slate-600">{{ field.label }}</Label>
                    <FilterCombobox 
                      v-model="form[field.id]" 
                      :options="getOptions(field.id)"
                      compact
                      :show-all="false"
                      :disabled="!!isLocked"
                    />
                  </div>
                </div>
              </div>
              <!-- Kondisi Penutup -->
              <div class="space-y-6">
                <h4 class="text-sm font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-3">3. PENUTUP & BUKAAN</h4>
                <div class="space-y-4">
                  <div v-for="field in fieldsPenutup" :key="field.id" class="space-y-1.5 px-1">
                    <Label class="text-[11px] font-semibold text-slate-600">{{ field.label }}</Label>
                    <FilterCombobox 
                      v-model="form[field.id]" 
                      :options="getOptions(field.id)"
                      compact
                      :show-all="false"
                      :disabled="!!isLocked"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between pt-6 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                class="font-bold border-2 border-slate-400 text-foreground hover:bg-slate-100 px-6 shadow-sm"
                @click="activeTab = 'perkim'"
              >
                KEMBALI
              </Button>
              <Button type="button" @click="activeTab = 'foto'" class="gap-2">
                Selanjutnya: Dokumentasi
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <!-- TABS CONTENT: FOTO -->
          <TabsContent value="foto" class="p-6 space-y-6 mt-0">
             <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 items-center">
              <ImageIcon class="h-5 w-5 text-amber-500" />
              <p class="text-xs text-amber-800">Unggah foto-foto kondisi rumah sebagai bukti fisik untuk verifikasi lanjutan.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <ImageUpload 
                  v-model="form.file_foto_ktp" 
                  label="1. Foto KTP / KK (Identitas)" 
                  upload-substorage="file_foto_ktp"
                  @update:uploading="uploading['file_foto_ktp'] = $event"
                  :disabled="isLocked"
                />
              </div>
              <div class="space-y-3">
                <ImageUpload 
                  v-model="form.file_foto_rumah" 
                  label="2. Foto Kondisi Rumah (Utuh)" 
                  upload-substorage="rumah"
                  @update:uploading="uploading['file_foto_rumah'] = $event"
                  :disabled="isLocked"
                />
              </div>
              <div class="space-y-3">
                <ImageUpload 
                  v-model="form.file_foto_depan" 
                  label="3. Foto Depan Rumah + Pemilik" 
                  upload-substorage="depan"
                  @update:uploading="uploading['file_foto_depan'] = $event"
                  :disabled="isLocked"
                />
              </div>
              <div class="space-y-3">
                <ImageUpload 
                  v-model="form.file_foto_pemilik" 
                  label="4. Foto Kondisi Dalam / Detail Kerusakan" 
                  upload-substorage="detail"
                  @update:uploading="uploading['file_foto_pemilik'] = $event"
                  :disabled="isLocked"
                />
              </div>
              <div class="space-y-3">
                <ImageUpload 
                  v-model="form.file_foto_dokumen" 
                  label="5. Foto Dokumen Pendukung Lainnya" 
                  upload-substorage="dokumen"
                  @update:uploading="uploading['file_foto_dokumen'] = $event"
                  :disabled="isLocked"
                />
              </div>
            </div>

            <div class="flex justify-between pt-6 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                class="font-bold border-2 border-slate-400 text-foreground hover:bg-slate-100 px-6 shadow-sm"
                @click="activeTab = 'teknis'"
              >
                KEMBALI
              </Button>
              <Button type="button" @click="activeTab = 'lokasi'" class="gap-2">
                Selanjutnya: Geospasial
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <!-- TABS CONTENT: LOKASI -->
          <TabsContent value="lokasi" class="p-6 space-y-6 mt-0">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold flex items-center gap-2">
                  <MapPinIcon class="h-4 w-4 text-primary" />
                  Titik Koordinat Geospasial
                </h4>
                <p class="text-xs text-muted-foreground mt-1">Gunakan GPS atau klik pada peta untuk menentukan lokasi rumah.</p>
              </div>
              <div class="flex gap-2">
                <Badge variant="outline" class="font-mono text-[10px] bg-muted/50 border-dashed">LAT: {{ form.latitude || '-' }}</Badge>
                <Badge variant="outline" class="font-mono text-[10px] bg-muted/50 border-dashed">LONG: {{ form.longitude || '-' }}</Badge>
              </div>
            </div>

            <div class="h-[400px] w-full rounded-lg border-2 border-primary/20 overflow-hidden shadow-inner relative">
              <l-map
                v-if="showMap"
                ref="map"
                :zoom="15"
                :center="[form.latitude, form.longitude]"
                :use-global-leaflet="false"
                class="z-0"
                @click="onMapClick"
              >
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <l-marker v-if="form.latitude && form.longitude" :lat-lng="[form.latitude, form.longitude]" />
              </l-map>
              
              <div class="absolute bottom-4 right-4 z-[1000]">
                <Button type="button" size="sm" class="gap-2 shadow-lg" @click="getCurrentLocation">
                  <NavigationIcon class="h-4 w-4" />
                  Gunakan Lokasi Saat Ini
                </Button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Latitude</Label>
                <Input v-model="form.latitude" type="number" step="any" readonly class="bg-muted" />
              </div>
              <div class="space-y-2">
                <Label>Longitude</Label>
                <Input v-model="form.longitude" type="number" step="any" readonly class="bg-muted" />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <!-- PERSISTENT FOOTER: BANNER & ACTIONS (Always Visible) -->
      <div class="mt-10 space-y-4 max-w-5xl mx-auto">
        <!-- PREMIUM INFO BANNER (MODERN UX - EYE FRIENDLY) -->
        <div 
          class="p-5 rounded-2xl border transition-all duration-500 shadow-sm flex gap-4 items-start"
          :class="isFormComplete 
            ? 'bg-emerald-50/80 border-emerald-200/60 ring-1 ring-emerald-500/10' 
            : 'bg-amber-50/80 border-amber-200/60 ring-1 ring-amber-500/10'"
        >
          <div 
            class="p-3 rounded-xl shadow-sm shrink-0"
            :class="isFormComplete ? 'bg-emerald-500 shadow-emerald-200' : 'bg-amber-500 shadow-amber-200'"
          >
            <CheckCircle2 v-if="isFormComplete" class="h-6 w-6 text-white" />
            <AlertCircle v-else class="h-6 w-6 text-white" />
          </div>
          <div class="flex-1 pt-0.5">
            <h5 
              class="font-extrabold text-sm tracking-tight mb-1"
              :class="isFormComplete ? 'text-emerald-900' : 'text-amber-900'"
            >
              {{ isFormComplete ? 'Data Terverifikasi Lengkap' : 'Status Pengisian: Belum Lengkap' }}
            </h5>
            <p class="text-[12px] leading-snug font-medium mb-3" :class="isFormComplete ? 'text-emerald-700/80' : 'text-amber-700/80'">
              {{ isFormComplete 
                  ? 'Selamat! Seluruh 54 parameter SOP telah terisi. Data siap untuk dikunci dan dikirim ke tahap verifikasi.' 
                  : `Masih ada ${missingFields.length} kolom yang kosong. Lengkapi semuanya untuk mengaktifkan fitur Kunci Data.` 
              }}
            </p>
            
            <div v-if="!isFormComplete && missingFields.length > 0" class="flex flex-wrap gap-1.5 px-0.5">
              <Badge v-for="tag in missingFields.slice(0, 8)" :key="tag" variant="secondary" class="bg-white/80 border-amber-100/50 text-[10px] text-amber-800 font-bold px-2.5 py-0.5 shadow-sm">
                {{ tag }}
              </Badge>
              <Badge v-if="missingFields.length > 8" variant="outline" class="bg-amber-100/30 border-amber-200 text-amber-900 text-[10px] font-bold">
                + {{ missingFields.length - 8 }} lagi
              </Badge>
            </div>
          </div>
        </div>

        <!-- STICKY ACTIONS BAR (GLOBAL THEME CONSISTENT) -->
        <div class="flex justify-between items-center py-5 px-6 bg-background/95 backdrop-blur-md rounded-2xl border-2 border-border shadow-xl shadow-primary/5 sticky bottom-4 z-50 transition-all">
          <div class="flex gap-2">
             <Button 
               type="button" 
               variant="outline" 
               class="font-black text-foreground border-2 border-slate-400 hover:bg-slate-100 transition-all shadow-md px-6"
               @click="activeTab = 'identitas'" 
               v-if="activeTab !== 'identitas'"
             >
               KEMBALI KE AWAL
             </Button>
          </div>
          
          <div class="flex gap-4">
            <!-- TAMPILAN UNTUK PEJABAT / DINAS / KELURAHAN (Bypass Workflow) -->
            <template v-if="auth.isAdmin || auth.isDinas || auth.isKelurahan || auth.isSurveyor">
              <Button 
                type="button" 
                class="bg-primary shadow-lg hover:scale-[1.03] transition-all active:scale-95 px-10 font-black ring-offset-2 hover:ring-2 ring-primary/20"
                :disabled="submitting"
                @click="handleSubmit(false)"
              >
                <RefreshCw v-if="submitting" class="h-4 w-4 animate-spin" />
                <Save v-else class="h-5 w-5" />
                SIMPAN PERUBAHAN
              </Button>
            </template>

            <!-- TAMPILAN UNTUK LPMK (Workflow Berjenjang) -->
            <template v-else>
              <!-- Tombol Draft -->
              <Button 
                v-if="!isLocked"
                type="button" 
                variant="outline" 
                class="bg-card border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 px-8 font-extrabold shadow-md transition-all active:scale-95"
                :disabled="submitting"
                @click="handleSubmit(false)"
              >
                <RefreshCw v-if="submitting" class="h-4 w-4 animate-spin" />
                <Save v-else class="h-5 w-5" />
                SIMPAN DRAFT
              </Button>

              <!-- Tombol Kirim & Kunci (Hanya jika lengkap & belum locked) -->
              <Button 
                v-if="!isLocked && isFormComplete"
                type="submit" 
                class="gap-2 bg-primary shadow-lg hover:scale-[1.03] transition-all active:scale-95 px-8 ring-offset-2 hover:ring-2 ring-primary/20"
                :disabled="submitting"
                @click.prevent="handleSubmit(true)"
              >
                <RefreshCw v-if="submitting" class="h-4 w-4 animate-spin" />
                <Lock v-else class="h-4 w-4 text-white/90" />
                Kirim & Kunci Data Kini
              </Button>

              <!-- Status Locked -->
              <div v-if="isLocked" class="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 flex items-center gap-2 text-sm font-bold shadow-inner">
                <Lock class="h-4 w-4" />
                DATA TERKUNCI (TELAH TERKIRIM)
              </div>
            </template>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api as axios } from '@/boot/axios'
import { 
  ArrowLeft, ArrowRight, Save, Loader2, 
  User as UserIcon, 
  Home as HomeIcon, 
  Wrench as WrenchIcon, 
  Camera as CameraIcon, 
  Map as MapIcon, 
  Building2, 
  Image as ImageIcon,
  MapPin as MapPinIcon,
  Navigation as NavigationIcon,
  RefreshCw,
  Lock,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import FilterCombobox from '@/components/FilterCombobox.vue'
import ImageUpload from '@/components/custom/ImageUpload.vue'
import DatePicker from '@/components/custom/DatePicker.vue'

// Leaflet
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"
import "leaflet/dist/leaflet.css"

import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notification = useNotificationStore()

const activeTab = ref('identitas')
const submitting = ref(false)
const masterData = ref({})
const kelurahans = ref([])
const uploading = ref({})
const showMap = ref(false)
const nikChecking = ref(false)
const isNikDuplicate = ref(false)

// Logic Locking
const isLocked = computed(() => {
  // Master Key: Admin/Dinas tidak pernah terkunci
  if (auth.isAdmin || auth.isDinas) return false
  
  // Jika sudah ada input_lpm (timestamp), berarti sudah dikunci
  return !!(!!form.input_lpm && auth.user?.id_lpmk)
})

// Payload Utama sesuai SOP Super Entry (52 Fields)
const form = reactive({
  id: null,
  // Tab 1: Identitas & Alamat (19 Fields)
  kode_wilayah: '', 
  nik_kepkel: '',
  nama_lengkap_kepkel_rt: '',
  nomor_kk: '',
  umur_kepkel: null,
  jenis_kelamin_kepkel: '',
  pendidikan_terakhir_kepkel: '',
  pekerjaan_kepkel: '',
  jumlah_kepkel: 1,
  alamat_jalan_rumah: '',
  alamat_nomor_rumah: '',
  alamat_rt_rumah: '',
  alamat_rw_rumah: '',
  alamat_dusun_rumah: '-',
  status_kepemilikan_rumah: '',
  status_kepemilikan_tanah: '',
  aset_rumah_tempat_lain: '',
  aset_tanah_tempat_lain: '',
  desil: '',
  tgl_penetapan_desil: '',
  
  // Tab 2: Administrasi Perkim (10 Fields)
  penghasilan_perbulan: '',
  bantuan_perumahan: '',
  jenis_kawasan: '',
  fungsi_ruang: '',
  sumber_penerangan: '',
  sumber_air_minum: '',
  jarak_sam_tpa_tinja: '',
  km_dan_jamban: '',
  jenis_kloset: '',
  jenis_tpa_tinja: '',
  
  // Tab 3: Detail Teknis (17 Fields)
  luas_rumah: 0,
  luas_tanah: 0,
  jumlah_penghuni: 1,
  // Struktur (5)
  fondasi: '',
  kolom: '',
  rangka: '',
  balok: '',
  sloof: '',
  // Arsitektur (6)
  material_lantai: '',
  kondisi_lantai: '',
  material_dinding: '',
  kondisi_dinding: '',
  material_atap: '',
  kondisi_atap: '',
  // Penutup & Bukaan (3)
  plafon: '',
  jendela: '',
  ventilasi: '',
  
  // Tab 4: Dokumentasi (5 Fields)
  file_foto_ktp: '',
  file_foto_rumah: '',
  file_foto_pemilik: '',
  file_foto_depan: '',
  file_foto_dokumen: '',
  
  // Tab 5: Geospasial (2 Fields)
  latitude: -7.75,
  longitude: 113.22,
  
  // Meta Workflow
  input_lpm: null,
  id_lpmk: auth.user?.id,
  is_rtlh: '1'
})

// Watcher to automatically capitalize text inputs (excluding files, coordinates, select, and numbers)
watch(() => [
  form.nama_lengkap_kepkel_rt,
  form.alamat_jalan_rumah,
  form.alamat_nomor_rumah,
  form.alamat_rt_rumah,
  form.alamat_rw_rumah
], ([
  nama, jalan, nomor, rt, rw
]) => {
  if (nama && nama !== nama.toUpperCase()) form.nama_lengkap_kepkel_rt = nama.toUpperCase()
  if (jalan && jalan !== jalan.toUpperCase()) form.alamat_jalan_rumah = jalan.toUpperCase()
  if (nomor && nomor !== nomor.toUpperCase()) form.alamat_nomor_rumah = nomor.toUpperCase()
  if (rt && rt !== rt.toUpperCase()) form.alamat_rt_rumah = rt.toUpperCase()
  if (rw && rw !== rw.toUpperCase()) form.alamat_rw_rumah = rw.toUpperCase()
})

const fieldsStruktur = [
  { id: 'fondasi', label: 'Fondasi Utama' },
  { id: 'kolom', label: 'Kolom Struktur' },
  { id: 'rangka', label: 'Rangka Atap' },
  { id: 'balok', label: 'Balok Struktur' },
  { id: 'sloof', label: 'Sloof Bangunan' }
]

const fieldsArsitektur = [
  { id: 'material_lantai', label: 'Material Lantai' },
  { id: 'kondisi_lantai', label: 'Kondisi Lantai' },
  { id: 'material_dinding', label: 'Material Dinding' },
  { id: 'kondisi_dinding', label: 'Kondisi Dinding' },
  { id: 'material_atap', label: 'Material Atap' },
  { id: 'kondisi_atap', label: 'Kondisi Atap' }
]

const fieldsPenutup = [
  { id: 'plafon', label: 'Plafon / Langit-langit' },
  { id: 'jendela', label: 'PINTU' },
  { id: 'ventilasi', label: 'JENDELA' }
]

// Helpers
function getOptions(kategori) {
  if (!masterData.value || !masterData.value[kategori]) return []
  return masterData.value[kategori].map(item => item.opsi)
}

function onMapClick(e) {
  if (isLocked.value || !e.latlng) return
  form.latitude = e.latlng.lat
  form.longitude = e.latlng.lng
}

function getCurrentLocation() {
  if (isLocked.value) return
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      form.latitude = pos.coords.latitude
      form.longitude = pos.coords.longitude
    })
  }
}

// LOGIKA KELENGKAPAN (52 Field SOP)
const missingFields = computed(() => {
  const missing = []
  
  // Tab 1: Identitas
  if (!form.kode_wilayah) missing.push("Kelurahan")
  if (String(form.nik_kepkel || "").length !== 16) missing.push("NIK (16 Digit)")
  if (String(form.nomor_kk || "").length !== 16) missing.push("Nomor KK (16 Digit)")
  if (!form.nama_lengkap_kepkel_rt) missing.push("Nama Lengkap")
  if (!form.umur_kepkel) missing.push("Umur")
  if (!form.jenis_kelamin_kepkel) missing.push("Jenis Kelamin")
  if (!form.pendidikan_terakhir_kepkel) missing.push("Pendidikan")
  if (!form.pekerjaan_kepkel) missing.push("Pekerjaan")
  if (!form.alamat_jalan_rumah) missing.push("Alamat Jalan")
  if (!form.desil) missing.push("Angka DESIL")
  if (!form.tgl_penetapan_desil) missing.push("Tgl Penetapan DESIL")
  
  // Tab 2: Perkim
  if (!form.penghasilan_perbulan) missing.push("Penghasilan")
  if (!form.sumber_penerangan) missing.push("Penerangan")
  if (!form.sumber_air_minum) missing.push("Air Minum")
  if (!form.km_dan_jamban) missing.push("Fasilitas KM/Jamban")
  
  // Tab 3: Teknis (Sample Mandatory)
  if (!form.luas_rumah || form.luas_rumah == 0) missing.push("Luas Bangunan")
  if (!form.fondasi) missing.push("Data Fondasi")
  if (!form.kondisi_lantai) missing.push("Kondisi Lantai")
  
  // Tab 4: Foto
  if (!form.file_foto_ktp) missing.push("Foto KTP/KK")
  if (!form.file_foto_rumah) missing.push("Foto Rumah")
  if (!form.file_foto_depan) missing.push("Foto Depan + Pemilik")
  
  // Tab 5: Lokasi
  if (!form.latitude || form.latitude === -7.75) missing.push("Koordinat Lokasi")
  
  return missing
})

const isNikInvalid = computed(() => {
  const val = String(form.nik_kepkel || "")
  return val.length > 0 && val.length !== 16
})

const isKkInvalid = computed(() => {
  const val = String(form.nomor_kk || "")
  return val.length > 0 && val.length !== 16
})

const isFormComplete = computed(() => missingFields.value.length === 0)

const canSave = computed(() => {
  // Validasi Dasar untuk Draft: NIK/KK jika diisi harus 16 digit
  const nik = String(form.nik_kepkel || "")
  const kk = String(form.nomor_kk || "")
  const isNikOk = nik === "" || nik.length === 16
  const isKkOk = kk === "" || kk.length === 16
  const isUploading = Object.values(uploading.value).some(v => v)
  return isNikOk && isKkOk && !isUploading && !nikChecking.value
})

async function handleNikBlur() {
  const nik = String(form.nik_kepkel || "")
  if (nik.length !== 16) return
  
  // Jika sedang Edit Mode, jangan cek jika NIK tidak berubah (SOP Efisiensi)
  // Tapi untuk keamanan, kita cek saja jika bukan ID yang sama
  
  nikChecking.value = true
  try {
    const res = await axios.get(`/api/surveys/check-nik/${nik}`)
    if (res.data.success && res.data.data.exists) {
      const existing = res.data.data
      // Jika ini data lain (ID berbeda)
      if (form.id === null || Number(existing.id) !== Number(form.id)) {
        isNikDuplicate.value = true
        notification.showError(
          'NIK Sudah Terdaftar!', 
          `NIK ini sudah digunakan oleh ${existing.nama}. Silakan periksa kembali atau cari data tersebut di list.`
        )
      }
    }
  } catch (err) {
    console.error('NIK check failed', err)
  } finally {
    nikChecking.value = false
  }
}

async function loadInitialData() {
  try {
    const [masterRes, kelRes] = await Promise.all([
      axios.get('/api/master-data'),
      axios.get('/api/kelurahan')
    ])
    masterData.value = masterRes.data.data
    kelurahans.value = kelRes.data.data
    
    // Auto fill kelurahan only if user is strictly LPMK or Kelurahan officer
    if (auth.isLpmk) {
      form.kode_wilayah = auth.user.is_lpmk
    } else if (auth.isKelurahan) {
      form.kode_wilayah = auth.user.is_kelurahan
    }

    // CHECK EDIT MODE
    const editId = route.query.id
    if (editId) {
       const res = await axios.get(`/api/surveys/${editId}`)
       if (res.data.success) {
         const data = res.data.data
         // Fallback coordinates if null (SOP Anti-Crash)
         if (!data.latitude || data.latitude === null) data.latitude = -7.75
         if (!data.longitude || data.longitude === null) data.longitude = 113.22
         
         Object.assign(form, data)
       }
    }
  } catch (err) {
    console.error('Gagal memuat data awal', err)
  }
}

async function handleSubmit(isKunci = false) {
  // Validasi Kunci: Harus lengkap
  if (isKunci && !isFormComplete.value) {
    notification.showError('Data Belum Lengkap', 'Silakan lengkapi seluruh field wajib sebelum melakukan Kunci Data.')
    return
  }

  // Validasi Format (Draft & Kunci): NIK/KK
  if (!canSave.value) {
    notification.showError('Kesalahan Format', 'NIK/KK harus berjumlah 16 digit.')
    return
  }

  submitting.value = true
  try {
    const response = await axios.post('/api/super-entry', { ...form, is_kunci: isKunci })
    if (response.data.success) {
        notification.showSuccess('Berhasil!', response.data.message || 'Data telah disimpan.')
        router.push('/app/entry')
    }
  } catch (err) {
    notification.showError('Gagal Menyimpan', err.response?.data?.message || 'Terjadi kesalahan sistem.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadInitialData()
  // Delay map rendering for stability
  setTimeout(() => { showMap.value = true }, 500)
})
</script>

<style scoped>
/* SOP Compliance: Custom styles for premium look */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
