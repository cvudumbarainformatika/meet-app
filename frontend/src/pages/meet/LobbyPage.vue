<template>
  <!-- =========================================================
    LobbyPage — Windows 11 Floating Dock Layout
    Navigation: Floating bottom dock (Win11 Taskbar style)
    Profile: Fixed bottom-left card (DIKUNCI - tidak berubah)
  ========================================================= -->
  <div class="min-h-screen bg-background flex relative overflow-hidden text-foreground w-full">

    <!-- Animated Background Blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>
    <div class="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-success/10 blur-[100px] animate-blob animation-delay-4000 mix-blend-screen pointer-events-none"></div>

    <!-- ── KONDISI 1: BELUM LOGIN (Welcome View Full Screen) ── -->
    <div v-if="!auth.isLoggedIn" class="flex-1 flex flex-col min-h-screen relative z-10">
      <header class="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Video class="h-5 w-5 text-primary-foreground" />
          </div>
          <span class="text-foreground font-bold text-lg tracking-tight">{{ settingsStore.appName }}</span>
        </div>
        <div>
          <RouterLink
            :to="{ path: '/login', query: $route.query }"
            class="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all shadow-lg shadow-primary/20"
          >
            Masuk
          </RouterLink>
        </div>
      </header>
      <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 w-full overflow-y-auto">
        <div class="w-full max-w-5xl flex flex-col items-center">
          <LobbyWelcome />
        </div>
      </main>
    </div>

    <!-- ── KONDISI 2: SUDAH LOGIN (Windows 11 Layout) ── -->
    <template v-else>

      <!-- ===== MOBILE HEADER (Hanya muncul di Mobile) ===== -->
      <header class="flex sm:hidden items-center justify-between px-4 py-3 border-b border-border/40 bg-card/75 backdrop-blur-md fixed top-0 left-0 right-0 z-30 shadow-sm">
        <div class="flex items-center gap-2">
          <!-- Logo & App Name -->
          <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Video class="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span class="text-foreground font-bold text-sm truncate max-w-[160px]">{{ settingsStore.appName }}</span>
        </div>
        
        <!-- Profile Avatar Trigger -->
        <button
          @click="showMobileProfileSheet = true"
          class="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm uppercase select-none cursor-pointer hover:bg-primary/30 active:scale-95 transition-all shadow-sm"
          :title="auth.user?.name"
        >
          {{ auth.user?.name ? auth.user.name[0] : 'U' }}
        </button>
      </header>

      <!-- ===== AREA KONTEN UTAMA (Full Width) ===== -->
      <main class="flex-1 flex flex-col h-screen overflow-y-auto bg-background relative z-10 w-full px-4 sm:px-8 pt-16 sm:pt-8 pb-24 sm:pb-32 custom-scrollbar">
        <div class="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center relative">

          <!-- TAB 1: Gabung Meeting -->
          <div v-if="activeTab === 'meeting'" class="flex-1 flex items-center justify-center py-8">
            <LobbyMeetingTab
              v-model:joinForm="joinForm"
              :joining="joining"
              @join="handleJoinRoom"
            />
          </div>

          <!-- TAB 2: Daftar Room Detail -->
          <div v-else-if="activeTab === 'rooms'" class="w-full animate-fade-in-up py-4">
            <LobbyRoomsTab
              :rooms="myRooms"
              :loading="loadingAdmin"
              @refresh="fetchAdminData"
              @copy="copySlug"
              @create-room-clicked="openCreateRoomDialog"
              @view-history="handleViewRoomHistory"
            />
          </div>

          <!-- TAB 3: Riwayat Sesi Rapat -->
          <div v-else-if="activeTab === 'history'" class="w-full animate-fade-in-up py-4">
            <LobbyHistoryTab
              :sessions="mySessions"
              :rooms="myRooms"
              :loading="loadingAdmin"
              v-model:filterRoomName="filterRoomName"
              @refresh="fetchAdminData"
              @open-notes="openNotesDialog"
              @join-active-room="handleSelectSidebarRoomBySlug"
              @end-active-session="handleEndActiveSession"
            />
          </div>

          <!-- TAB 4: Kustomisasi Tema (Owner Only) -->
          <div v-else-if="activeTab === 'appearance' && auth.user?.email === 'pharyyady@gmail.com'" class="w-full animate-fade-in-up py-4">
            <LobbyAppearanceTab />
          </div>

        </div>
      </main>

      <!-- ===== PROFILE CARD — Fixed Bottom Left (DIKUNCI untuk Desktop) ===== -->
      <div class="hidden sm:flex fixed bottom-6 left-6 z-30 p-3 bg-black/20 items-center gap-2.5 rounded-2xl backdrop-blur-sm border border-border/60 shadow-xl">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <!-- Avatar Bulat & Dot Hijau Aktif -->
          <div class="relative shrink-0 select-none">
            <div class="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-extrabold text-sm uppercase">
              {{ auth.user?.name ? auth.user.name[0] : 'U' }}
            </div>
            <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card"></div>
          </div>
          <!-- Detail Username -->
          <div class="flex flex-col overflow-hidden text-left">
            <span class="text-sm font-bold text-foreground truncate tracking-tight leading-tight">
              {{ auth.user?.name || 'User' }}
            </span>
            <span class="text-[10px] text-success/80 font-bold tracking-wider uppercase leading-none mt-1">
              Online
            </span>
          </div>
        </div>
      </div>

      <!-- ===== QUICK CONTROLS — Fixed Bottom Right ===== -->
      <div class="hidden sm:flex fixed bottom-6 right-6 z-30 p-2 bg-black/20 items-center gap-1 rounded-2xl backdrop-blur-sm border border-border/60 shadow-xl">
        <button
          @click="isMuted = !isMuted"
          :class="isMuted ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' : 'text-success hover:bg-white/5'"
          class="p-2 rounded-xl transition-colors cursor-pointer"
          :title="isMuted ? 'Aktifkan Suara Mic (Unmute)' : 'Matikan Suara Mic (Mute)'"
        >
          <MicOff v-if="isMuted" class="h-5 w-5" />
          <Mic v-else class="h-5 w-5" />
        </button>
        <button
          @click="isCameraOff = !isCameraOff"
          :class="isCameraOff ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' : 'text-success hover:bg-white/5'"
          class="p-2 rounded-xl transition-colors cursor-pointer"
          :title="isCameraOff ? 'Aktifkan Kamera' : 'Matikan Kamera'"
        >
          <VideoOff v-if="isCameraOff" class="h-5 w-5" />
          <Video v-else class="h-5 w-5" />
        </button>
        <div class="w-px h-6 bg-border/50 mx-0.5"></div>
        <button
          @click="handleLogout"
          class="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Keluar"
        >
          <LogOut class="h-5 w-5" />
        </button>
      </div>

      <!-- ===== OVERLAY — Tutup popup saat klik di luar ===== -->
      <div
        v-if="showRoomsPopup"
        @click="showRoomsPopup = false"
        class="fixed inset-0 z-30 sm:z-20 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
      ></div>

      <!-- ===== ROOMS POPUP PANEL (Win11 Start Menu Style - Desktop) ===== -->
      <Transition name="popup">
        <div
          v-if="showRoomsPopup"
          class="hidden sm:flex fixed bottom-[5.5rem] left-1/2 -translate-x-1/2 z-30 w-[540px] max-w-[94vw] max-h-[75vh] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex-col"
          @click.stop
        >
          <!-- Popup Header -->
          <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h3 class="font-bold text-foreground">Room Saya</h3>
              <p class="text-[11px] text-muted-foreground mt-0.5">{{ myRooms.length }} room tersedia</p>
            </div>
            <button
              @click="openCreateRoomDialog(); showRoomsPopup = false"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
            >
              <Plus class="h-3.5 w-3.5" />
              Buat Room
            </button>
          </div>

          <!-- Search & View Toggle Bar -->
          <div class="px-4 py-2.5 border-b border-border bg-card/40 flex items-center gap-2 shrink-0">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                v-model="roomSearch"
                type="text"
                placeholder="Cari nama room..."
                class="w-full bg-background/60 border border-border rounded-xl pl-9 pr-8 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1.5 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              <button
                v-if="roomSearch"
                @click="roomSearch = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X class="h-3 w-3" />
              </button>
            </div>
            <div class="flex items-center gap-0.5 bg-background/60 border border-border rounded-xl p-0.5 shrink-0">
              <button
                @click="roomViewMode = 'list'"
                :class="roomViewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'"
                class="p-1.5 rounded-lg transition-all cursor-pointer"
                title="Tampilan List"
              >
                <List class="h-3.5 w-3.5" />
              </button>
              <button
                @click="roomViewMode = 'grid'"
                :class="roomViewMode === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'"
                class="p-1.5 rounded-lg transition-all cursor-pointer"
                title="Tampilan Thumbnail"
              >
                <LayoutGrid class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Room List (Win11 style) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">

            <!-- Loading -->
            <div v-if="loadingAdmin && filteredRooms.length === 0" class="flex flex-col items-center py-10 text-muted-foreground">
              <div class="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
              <span class="text-xs">Memuat room...</span>
            </div>

            <!-- Empty (No Rooms at all) -->
            <div v-else-if="myRooms.length === 0" class="flex flex-col items-center py-10 text-muted-foreground">
              <LayoutGrid class="h-12 w-12 mb-3 opacity-20" />
              <span class="text-sm font-medium">Belum ada room</span>
              <span class="text-xs mt-1 opacity-60">Klik "Buat Room" untuk mulai</span>
            </div>

            <!-- Empty (Search No Results) -->
            <div v-else-if="filteredRooms.length === 0 && roomSearch" class="flex flex-col items-center py-12 text-muted-foreground">
              <Search class="h-12 w-12 mb-3 opacity-20" />
              <span class="text-sm font-medium">Tidak ada hasil ditemukan</span>
              <span class="text-xs mt-1 opacity-60">Coba kata kunci pencarian yang lain</span>
            </div>

            <!-- Win11 List Style -->
            <div v-else-if="roomViewMode === 'list'" class="p-2">
              <button
                v-for="room in filteredRooms"
                :key="room.id"
                @click="handleSelectSidebarRoom(room); showRoomsPopup = false"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all group cursor-pointer text-left"
              >
                <!-- Room Icon -->
                <div class="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all shrink-0 relative">
                  <Video class="h-4.5 w-4.5 text-primary" />
                  <Lock v-if="room.is_locked" class="h-2.5 w-2.5 text-amber-400 absolute -bottom-1 -right-1 bg-card rounded-full p-0.5 border border-border" />
                </div>
                <!-- Room Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-foreground truncate">{{ room.name }}</div>
                  <div class="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span v-if="room.is_locked" class="text-amber-400">🔒 Butuh password</span>
                    <span v-else class="text-success">● Publik</span>
                  </div>
                </div>
                <!-- Arrow -->
                <ChevronRight class="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            <!-- Win11 Grid/Thumbnail Style -->
            <div v-else-if="roomViewMode === 'grid'" class="p-3 grid grid-cols-3 gap-2.5">
              <button
                v-for="room in filteredRooms"
                :key="room.id"
                @click="handleSelectSidebarRoom(room); showRoomsPopup = false"
                class="flex flex-col rounded-xl border border-border/60 bg-muted/20 hover:bg-primary/[0.04] hover:border-primary/30 transition-all duration-200 group cursor-pointer text-left overflow-hidden relative p-2 h-28 justify-between"
              >
                <!-- Thumbnail Visual Area -->
                <div class="h-14 w-full rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-indigo-500/10 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-200">
                  <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                  <Video class="h-5 w-5 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                  
                  <!-- Lock Indicator overlay -->
                  <div v-if="room.is_locked" class="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Lock class="h-2.5 w-2.5 text-amber-400" />
                  </div>
                  <div v-else class="absolute top-1 right-1 h-2 w-2 rounded-full bg-success"></div>
                </div>

                <!-- Room Title -->
                <div class="mt-1 w-full">
                  <div class="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {{ room.name }}
                  </div>
                  <div class="text-[9px] text-muted-foreground truncate mt-0.5">
                    {{ room.is_locked ? 'Locked' : 'Public' }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Popup Footer -->
          <div class="px-5 py-3 border-t border-border bg-card/50 shrink-0">
            <button
              @click="selectRoomsTab(); showRoomsPopup = false"
              class="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1 group cursor-pointer"
            >
              <span>Kelola Semua Room →</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ===== MOBILE ROOMS BOTTOM SHEET ===== -->
      <Transition name="slide-up">
        <div
          v-if="showRoomsPopup"
          class="flex sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-[2rem] border-t border-border/80 shadow-2xl overflow-hidden flex-col max-h-[85vh]"
          @click.stop
        >
          <!-- Bottom Sheet Handle Bar -->
          <div class="w-12 h-1 bg-muted-foreground/20 rounded-full mx-auto my-3 shrink-0"></div>

          <!-- Popup Header -->
          <div class="px-5 pb-3 flex items-center justify-between shrink-0">
            <div>
              <h3 class="font-bold text-foreground text-base">Room Saya</h3>
              <p class="text-[10px] text-muted-foreground mt-0.5">{{ myRooms.length }} room tersedia</p>
            </div>
            <button
              @click="openCreateRoomDialog(); showRoomsPopup = false"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
            >
              <Plus class="h-3.5 w-3.5" />
              Buat Room
            </button>
          </div>

          <!-- Search & View Toggle Bar -->
          <div class="px-4 py-2.5 border-b border-border bg-card/40 flex items-center gap-2 shrink-0">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                v-model="roomSearch"
                type="text"
                placeholder="Cari nama room..."
                class="w-full bg-background/60 border border-border rounded-xl pl-9 pr-8 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1.5 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              <button
                v-if="roomSearch"
                @click="roomSearch = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X class="h-3 w-3" />
              </button>
            </div>
            <div class="flex items-center gap-0.5 bg-background/60 border border-border rounded-xl p-0.5 shrink-0">
              <button
                @click="roomViewMode = 'list'"
                :class="roomViewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'"
                class="p-1.5 rounded-lg transition-all cursor-pointer"
                title="Tampilan List"
              >
                <List class="h-3.5 w-3.5" />
              </button>
              <button
                @click="roomViewMode = 'grid'"
                :class="roomViewMode === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'"
                class="p-1.5 rounded-lg transition-all cursor-pointer"
                title="Tampilan Thumbnail"
              >
                <LayoutGrid class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- Room List (Win11 style) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">

            <!-- Loading -->
            <div v-if="loadingAdmin && filteredRooms.length === 0" class="flex flex-col items-center py-10 text-muted-foreground">
              <div class="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
              <span class="text-xs">Memuat room...</span>
            </div>

            <!-- Empty (No Rooms at all) -->
            <div v-else-if="myRooms.length === 0" class="flex flex-col items-center py-10 text-muted-foreground">
              <LayoutGrid class="h-12 w-12 mb-3 opacity-20" />
              <span class="text-sm font-medium">Belum ada room</span>
              <span class="text-xs mt-1 opacity-60">Klik "Buat Room" untuk mulai</span>
            </div>

            <!-- Empty (Search No Results) -->
            <div v-else-if="filteredRooms.length === 0 && roomSearch" class="flex flex-col items-center py-12 text-muted-foreground">
              <Search class="h-12 w-12 mb-3 opacity-20" />
              <span class="text-sm font-medium">Tidak ada hasil ditemukan</span>
              <span class="text-xs mt-1 opacity-60">Coba kata kunci pencarian yang lain</span>
            </div>

            <!-- Win11 List Style -->
            <div v-else-if="roomViewMode === 'list'" class="p-2">
              <button
                v-for="room in filteredRooms"
                :key="room.id"
                @click="handleSelectSidebarRoom(room); showRoomsPopup = false"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all group cursor-pointer text-left"
              >
                <!-- Room Icon -->
                <div class="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all shrink-0 relative">
                  <Video class="h-4.5 w-4.5 text-primary" />
                  <Lock v-if="room.is_locked" class="h-2.5 w-2.5 text-amber-400 absolute -bottom-1 -right-1 bg-card rounded-full p-0.5 border border-border" />
                </div>
                <!-- Room Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-foreground truncate">{{ room.name }}</div>
                  <div class="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span v-if="room.is_locked" class="text-amber-400">🔒 Butuh password</span>
                    <span v-else class="text-success">● Publik</span>
                  </div>
                </div>
                <!-- Arrow -->
                <ChevronRight class="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            <!-- Win11 Grid/Thumbnail Style -->
            <div v-else-if="roomViewMode === 'grid'" class="p-3 grid grid-cols-3 gap-2.5">
              <button
                v-for="room in filteredRooms"
                :key="room.id"
                @click="handleSelectSidebarRoom(room); showRoomsPopup = false"
                class="flex flex-col rounded-xl border border-border/60 bg-muted/20 hover:bg-primary/[0.04] hover:border-primary/30 transition-all duration-200 group cursor-pointer text-left overflow-hidden relative p-2 h-28 justify-between"
              >
                <!-- Thumbnail Visual Area -->
                <div class="h-14 w-full rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-indigo-500/10 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-200">
                  <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                  <Video class="h-5 w-5 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                  
                  <!-- Lock Indicator overlay -->
                  <div v-if="room.is_locked" class="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Lock class="h-2.5 w-2.5 text-amber-400" />
                  </div>
                  <div v-else class="absolute top-1 right-1 h-2 w-2 rounded-full bg-success"></div>
                </div>

                <!-- Room Title -->
                <div class="mt-1 w-full">
                  <div class="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {{ room.name }}
                  </div>
                  <div class="text-[9px] text-muted-foreground truncate mt-0.5">
                    {{ room.is_locked ? 'Locked' : 'Public' }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Popup Footer -->
          <div class="px-5 py-3.5 border-t border-border bg-card/50 shrink-0">
            <button
              @click="selectRoomsTab(); showRoomsPopup = false"
              class="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1 group cursor-pointer"
            >
              <span>Kelola Semua Room →</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ===== WIN11 FLOATING DOCK — Bottom Center ===== -->
      <nav class="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-30 items-center gap-1 bg-card/90 backdrop-blur-md border border-border/80 shadow-2xl shadow-black/30 rounded-2xl px-2 py-2">

        <!-- Gabung Meeting -->
        <button
          @click="activeTab = 'meeting'; showRoomsPopup = false"
          class="dock-item"
          :class="activeTab === 'meeting' && !showRoomsPopup ? 'dock-item--active' : ''"
          title="Gabung Rapat"
        >
          <div class="dock-icon">
            <Video class="h-6 w-6" />
          </div>
          <span class="dock-label hidden sm:block">Gabung</span>
          <span v-if="activeTab === 'meeting' && !showRoomsPopup" class="dock-dot"></span>
        </button>

        <!-- Room Saya (popup trigger) -->
        <button
          @click.stop="toggleRoomsPopup()"
          class="dock-item"
          :class="showRoomsPopup || activeTab === 'rooms' ? 'dock-item--active' : ''"
          title="Room Saya"
        >
          <div class="dock-icon">
            <LayoutGrid class="h-6 w-6" />
          </div>
          <span class="dock-label hidden sm:block">Room</span>
          <span v-if="showRoomsPopup || activeTab === 'rooms'" class="dock-dot"></span>
        </button>

        <!-- Divider -->
        <div class="h-8 w-px bg-border/50 mx-1 hidden sm:block"></div>

        <!-- Riwayat -->
        <button
          @click="selectHistoryTab(); showRoomsPopup = false"
          class="dock-item"
          :class="activeTab === 'history' && !showRoomsPopup ? 'dock-item--active' : ''"
          title="Riwayat Sesi"
        >
          <div class="dock-icon">
            <History class="h-6 w-6" />
          </div>
          <span class="dock-label hidden sm:block">Riwayat</span>
          <span v-if="activeTab === 'history' && !showRoomsPopup" class="dock-dot"></span>
        </button>

        <!-- Tema (Owner Only) -->
        <button
          v-if="auth.user?.email === 'pharyyady@gmail.com'"
          @click="activeTab = 'appearance'; showRoomsPopup = false"
          class="dock-item"
          :class="activeTab === 'appearance' && !showRoomsPopup ? 'dock-item--active' : ''"
          title="Kustomisasi Tema"
        >
          <div class="dock-icon">
            <Palette class="h-6 w-6" />
          </div>
          <span class="dock-label hidden sm:block">Tema</span>
          <span v-if="activeTab === 'appearance' && !showRoomsPopup" class="dock-dot"></span>
        </button>

      </nav>

      <!-- ===== MOBILE BOTTOM NAVIGATION BAR (Hanya muncul di Mobile) ===== -->
      <nav class="flex sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/60 py-2.5 px-4 justify-around items-center shadow-lg">
        <!-- Gabung Meeting -->
        <button
          @click="activeTab = 'meeting'; showRoomsPopup = false"
          class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer"
          :class="activeTab === 'meeting' && !showRoomsPopup ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <Video class="h-5.5 w-5.5" />
          <span class="text-[9px] font-semibold mt-1">Gabung</span>
          <span v-if="activeTab === 'meeting' && !showRoomsPopup" class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"></span>
        </button>

        <!-- Room Saya (popup trigger) -->
        <button
          @click.stop="toggleRoomsPopup()"
          class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer"
          :class="showRoomsPopup || activeTab === 'rooms' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <LayoutGrid class="h-5.5 w-5.5" />
          <span class="text-[9px] font-semibold mt-1">Room</span>
          <span v-if="showRoomsPopup || activeTab === 'rooms'" class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"></span>
        </button>

        <!-- Riwayat -->
        <button
          @click="selectHistoryTab(); showRoomsPopup = false"
          class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer"
          :class="activeTab === 'history' && !showRoomsPopup ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <History class="h-5.5 w-5.5" />
          <span class="text-[9px] font-semibold mt-1">Riwayat</span>
          <span v-if="activeTab === 'history' && !showRoomsPopup" class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"></span>
        </button>

        <!-- Tema (Owner Only) -->
        <button
          v-if="auth.user?.email === 'pharyyady@gmail.com'"
          @click="activeTab = 'appearance'; showRoomsPopup = false"
          class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer"
          :class="activeTab === 'appearance' && !showRoomsPopup ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
        >
          <Palette class="h-5.5 w-5.5" />
          <span class="text-[9px] font-semibold mt-1">Tema</span>
          <span v-if="activeTab === 'appearance' && !showRoomsPopup" class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"></span>
        </button>
      </nav>

    </template>

    <!-- Error Toast Notification -->
    <Transition name="fade-slide-up">
      <div
        v-if="errorMsg"
        class="fixed bottom-24 right-6 z-50 bg-destructive/10 border border-destructive/30 text-destructive px-5 py-4 rounded-xl text-sm flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in-up"
      >
        <AlertCircle class="h-5 w-5 flex-shrink-0" />
        <span class="font-medium">{{ errorMsg }}</span>
        <button @click="errorMsg = ''" class="ml-2 text-destructive hover:text-red-200 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>

    <!-- Backdrop Overlay untuk Mobile Bottom Sheet -->
    <Transition name="fade">
      <div
        v-if="showMobileProfileSheet"
        @click="showMobileProfileSheet = false"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
      ></div>
    </Transition>

    <!-- Mobile Bottom Sheet (Slide-up menu) -->
    <Transition name="slide-up">
      <div
        v-if="showMobileProfileSheet"
        class="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2rem] border-t border-border/80 shadow-2xl p-6 pb-8 flex flex-col sm:hidden max-h-[85vh] overflow-y-auto"
        @click.stop
      >
        <!-- Bottom Sheet Handle Bar -->
        <div class="w-12 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-6 shrink-0"></div>

        <!-- Profil Info -->
        <div class="flex flex-col items-center text-center mb-6 shrink-0">
          <div class="relative select-none mb-3">
            <div class="h-16 w-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-extrabold text-2xl uppercase shadow-md">
              {{ auth.user?.name ? auth.user.name[0] : 'U' }}
            </div>
            <div class="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-success border-3 border-card"></div>
          </div>
          <h4 class="text-base font-bold text-foreground tracking-tight">{{ auth.user?.name || 'User' }}</h4>
          <span class="text-xs text-muted-foreground mt-0.5">{{ auth.user?.email || 'user@email.com' }}</span>
          
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 border border-success/20 text-success text-[10px] font-bold uppercase tracking-wider mt-3">
            <span class="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
            Online
          </div>
        </div>

        <div class="w-full h-px bg-border/60 my-2 shrink-0"></div>

        <!-- Menu Opsi Ramping & Premium -->
        <div class="space-y-2.5 mt-2">
          
          <!-- Opsi 1: Mikrofon (Mic) -->
          <button
            @click="isMuted = !isMuted"
            class="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border/40 hover:border-primary/20 transition-all duration-200 text-left bg-muted/20 hover:bg-muted/40 cursor-pointer group"
          >
            <div class="flex items-center gap-3.5">
              <div
                :class="isMuted ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'"
                class="h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <MicOff v-if="isMuted" class="h-5 w-5" />
                <Mic v-else class="h-5 w-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-foreground">Mikrofon</div>
                <div class="text-[10px] text-muted-foreground mt-0.5">
                  {{ isMuted ? 'Senyap / Muted' : 'Aktif / Bersuara' }}
                </div>
              </div>
            </div>
            <div
              :class="isMuted ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              {{ isMuted ? 'Muted' : 'On' }}
            </div>
          </button>

          <!-- Opsi 2: Kamera -->
          <button
            @click="isCameraOff = !isCameraOff"
            class="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border/40 hover:border-primary/20 transition-all duration-200 text-left bg-muted/20 hover:bg-muted/40 cursor-pointer group"
          >
            <div class="flex items-center gap-3.5">
              <div
                :class="isCameraOff ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'"
                class="h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <VideoOff v-if="isCameraOff" class="h-5 w-5" />
                <Video v-else class="h-5 w-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-foreground">Kamera</div>
                <div class="text-[10px] text-muted-foreground mt-0.5">
                  {{ isCameraOff ? 'Kamera Mati' : 'Kamera Aktif' }}
                </div>
              </div>
            </div>
            <div
              :class="isCameraOff ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              {{ isCameraOff ? 'Off' : 'On' }}
            </div>
          </button>

          <!-- Opsi 3: Keluar (Logout) -->
          <button
            @click="handleLogout(); showMobileProfileSheet = false"
            class="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-destructive/10 hover:border-destructive/30 transition-all duration-200 text-left bg-destructive/[0.03] hover:bg-destructive/[0.08] cursor-pointer group mt-4"
          >
            <div class="flex items-center gap-3.5">
              <div class="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <LogOut class="h-5 w-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-destructive">Keluar</div>
                <div class="text-[10px] text-destructive/65 mt-0.5">Keluar dari sesi akun Anda</div>
              </div>
            </div>
            <ChevronRight class="h-4 w-4 text-destructive/40 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      </div>
    </Transition>

    <!-- Modal Notulen Rapat -->
    <NotesModal
      :show="showNotesDialog"
      :session="selectedSession"
      v-model="notesContent"
      :saving="savingNotes"
      @close="showNotesDialog = false"
      @save="saveNotes"
    />

    <!-- Dialog / Modal Buat Room Baru -->
    <CreateRoomModal
      :show="showCreateModal"
      v-model:createForm="createForm"
      :creating="creating"
      @close="showCreateModal = false"
      @create="handleCreateRoom"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Video,
  AlertCircle,
  X,
  Lock,
  Mic,
  LogOut,
  Plus,
  MicOff,
  VideoOff,
  Palette,
  LayoutGrid,
  History,
  ChevronRight,
  Search,
  List
} from 'lucide-vue-next'
import { api as axios } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import { useMeetStore } from '@/stores/meet'
import { useSettingsStore } from '@/stores/settings'

// Import modular components
import LobbyWelcome from '@/components/meet/LobbyWelcome.vue'
import LobbyMeetingTab from '@/components/meet/LobbyMeetingTab.vue'
import LobbyRoomsTab from '@/components/meet/LobbyRoomsTab.vue'
import LobbyHistoryTab from '@/components/meet/LobbyHistoryTab.vue'
import LobbyAppearanceTab from '@/components/meet/LobbyAppearanceTab.vue'
import NotesModal from '@/components/meet/NotesModal.vue'
import CreateRoomModal from '@/components/meet/CreateRoomModal.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const meetStore = useMeetStore()
const settingsStore = useSettingsStore()

// --- State Utama ---
const joining = ref(false)
const creating = ref(false)
const errorMsg = ref('')

// State Kontrol Cepat Audio/Video (Default: Mati/Muted)
const isMuted = ref(true)
const isCameraOff = ref(true)

const joinForm = ref({ slug: '', password: '', showPassword: false })
const createForm = ref({ name: '', password: '' })

// State Layar Utama
const activeTab = ref('meeting') // 'meeting' | 'rooms' | 'history' | 'appearance'
const loadingAdmin = ref(false)
const myRooms = ref([])
const mySessions = ref([])
const filterRoomName = ref('') // Filter nama room untuk riwayat sesi

// State Win11 Dock & Popup
const showRoomsPopup = ref(false)
const roomSearch = ref('')
const roomViewMode = ref('list') // 'list' | 'grid'
const showMobileProfileSheet = ref(false) // Slide-up menu di mobile

const filteredRooms = computed(() => {
  if (!roomSearch.value.trim()) return myRooms.value
  const term = roomSearch.value.toLowerCase().trim()
  return myRooms.value.filter(room => room.name.toLowerCase().includes(term))
})

// Dialog Modals State
const showNotesDialog = ref(false)
const showCreateModal = ref(false)
const selectedSession = ref(null)
const notesContent = ref('')
const savingNotes = ref(false)

onMounted(() => {
  if (route.query.join) {
    joinForm.value.slug = route.query.join
    if (auth.isLoggedIn) {
      handleJoinRoom()
    }
  }
  if (auth.isLoggedIn) {
    fetchAdminData()
  }
})

// Pemuatan data administrasi otomatis saat tab berganti
watch(activeTab, (val) => {
  if ((val === 'rooms' || val === 'history') && myRooms.value.length === 0) {
    fetchAdminData()
  }
})

// Auto-ekstrak slug jika user mem-paste full URL ke dalam input
watch(() => joinForm.value.slug, (newVal) => {
  if (!newVal) return
  if (newVal.includes('?join=')) {
    const match = newVal.match(/[?&]join=([^&]+)/)
    if (match && match[1]) {
      joinForm.value.slug = match[1]
    }
  } else if (newVal.startsWith('http')) {
    const parts = newVal.split('/')
    const lastPart = parts.pop()
    if (lastPart) {
      joinForm.value.slug = lastPart.split('?')[0]
    }
  }
})

// Mengambil data kamar & sesi riwayat dari server
async function fetchAdminData() {
  if (!auth.isLoggedIn) return
  loadingAdmin.value = true
  try {
    const [roomsRes, sessionsRes] = await Promise.all([
      axios.get('/api/meetings/my-rooms'),
      axios.get('/api/meetings/history?page=1&perPage=50')
    ])
    if (roomsRes.data.success) {
      myRooms.value = roomsRes.data.data
    }
    if (sessionsRes.data.success) {
      mySessions.value = sessionsRes.data.data
    }
  } catch (err) {
    console.error('Failed to fetch admin data', err)
  } finally {
    loadingAdmin.value = false
  }
}

function copySlug(slug) {
  navigator.clipboard.writeText(slug)
  alert('Slug tersalin: ' + slug)
}

// Toggle popup Room & fetch jika belum ada data
function toggleRoomsPopup() {
  showRoomsPopup.value = !showRoomsPopup.value
  if (showRoomsPopup.value) {
    roomSearch.value = '' // Reset search input saat dibuka
    if (myRooms.value.length === 0) {
      fetchAdminData()
    }
  }
}

// Navigasi tab
function selectRoomsTab() {
  activeTab.value = 'rooms'
  if (myRooms.value.length === 0) fetchAdminData()
}

function selectHistoryTab() {
  filterRoomName.value = ''
  activeTab.value = 'history'
  if (mySessions.value.length === 0) fetchAdminData()
}

// Aksi melihat riwayat spesifik dari baris Daftar Room
function handleViewRoomHistory(roomName) {
  filterRoomName.value = roomName
  activeTab.value = 'history'
}

// Buka dialog untuk buat room baru
function openCreateRoomDialog() {
  createForm.value = { name: '', password: '' }
  showCreateModal.value = true
}

// Handler pemilihan room lewat popup (Win11 style quick-connect)
function handleSelectSidebarRoom(room) {
  joinForm.value.slug = room.slug
  activeTab.value = 'meeting'
  showRoomsPopup.value = false
  if (room.is_locked) {
    joinForm.value.showPassword = true
  } else {
    handleJoinRoom()
  }
}

function handleSelectSidebarRoomBySlug(slug) {
  const room = myRooms.value.find(r => r.slug === slug)
  if (room) {
    handleSelectSidebarRoom(room)
  } else {
    joinForm.value.slug = slug
    activeTab.value = 'meeting'
    showRoomsPopup.value = false
    handleJoinRoom()
  }
}

async function handleEndActiveSession(sessionId) {
  try {
    const res = await axios.put(`/api/meetings/${sessionId}/end`, {
      participant_count: 0
    })
    if (res.data.success) {
      await fetchAdminData()
    }
  } catch (err) {
    console.error('Gagal mengakhiri sesi', err)
    alert('Gagal mengakhiri sesi aktif')
  }
}

// Logic Menulis Notulen
function openNotesDialog(session) {
  selectedSession.value = session
  notesContent.value = session.notes || ''
  showNotesDialog.value = true
}

async function saveNotes() {
  if (!selectedSession.value) return
  savingNotes.value = true
  try {
    const res = await axios.put(`/api/meetings/${selectedSession.value.id}/notes`, {
      notes: notesContent.value
    })
    if (res.data.success) {
      const idx = mySessions.value.findIndex(s => s.id === selectedSession.value.id)
      if (idx !== -1) {
        mySessions.value[idx].notes = notesContent.value
      }
      showNotesDialog.value = false
    }
  } catch (err) {
    alert('Gagal menyimpan notulen')
  } finally {
    savingNotes.value = false
  }
}

// --- Join Room ---
async function handleJoinRoom() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  joining.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('/api/tokens/join', {
      room_slug: joinForm.value.slug.trim(),
      password: joinForm.value.password || undefined,
    })
    if (res.data.success) {
      const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || res.data.data.livekit_url
      meetStore.setRoom(res.data.data.room, res.data.data.token, publicLiveKitUrl, res.data.data.is_host)
      router.push(`/room/${joinForm.value.slug.trim()}`)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Gagal bergabung ke room'
    joinForm.value.showPassword = err.response?.status === 403
  } finally {
    joining.value = false
  }
}

// --- Create Room ---
async function handleCreateRoom() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  creating.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('/api/rooms', {
      name: createForm.value.name.trim(),
      password: createForm.value.password || undefined,
    })
    if (res.data.success) {
      const slug = res.data.data.slug
      showCreateModal.value = false
      fetchAdminData()
      const tokenRes = await axios.post('/api/tokens/join', {
        room_slug: slug,
        password: createForm.value.password || undefined
      })
      if (tokenRes.data.success) {
        const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || tokenRes.data.data.livekit_url
        meetStore.setRoom(tokenRes.data.data.room, tokenRes.data.data.token, publicLiveKitUrl, true)
        router.push(`/room/${slug}`)
      }
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Gagal membuat room'
  } finally {
    creating.value = false
  }
}

function handleLogout() {
  auth.logout()
}
</script>

<style>
/* Custom animations & transitions */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom modern scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ===== WIN11 FLOATING DOCK ===== */
.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: transparent;
  border: none;
  color: hsl(var(--muted-foreground));
  min-width: 60px;
}
.dock-item:hover {
  background: hsl(var(--muted) / 0.6);
  color: hsl(var(--foreground));
}
.dock-item--active {
  color: hsl(var(--primary));
}
.dock-item--active:hover {
  background: hsl(var(--primary) / 0.1);
}
.dock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  transition: all 0.2s ease;
}
.dock-item:hover .dock-icon {
  transform: scale(1.1);
}
.dock-item--active .dock-icon {
  background: hsl(var(--primary) / 0.12);
}
.dock-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
/* Win11 style active dot indicator */
.dock-dot {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(var(--primary));
}

/* ===== ROOMS POPUP TRANSITION ===== */
.popup-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.popup-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px) scale(0.95);
}
.popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.97);
}

/* Slide up transition for Mobile Bottom Sheet */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0.9;
}
</style>
