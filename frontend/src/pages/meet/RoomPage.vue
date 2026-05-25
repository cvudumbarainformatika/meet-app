<template>
  <!-- =========================================================
    RoomPage — Halaman meeting video call
    Layout: Video grid fullscreen + sidebar chat + control bar
    Refactored to Modular Clean Architecture
  ========================================================= -->
  <div class="h-screen bg-background flex flex-col overflow-hidden text-foreground">
    <!-- Fase 1: Green Room Pre-flight Lobby -->
    <div v-if="!hasJoined" class="flex-1 flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5 select-none relative overflow-hidden">
      <!-- Background ambient glowing orbs -->
      <div class="absolute right-10 top-10 w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6000ms]"></div>
      <div class="absolute left-10 bottom-10 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]"></div>

      <!-- ═══ MOBILE LAYOUT (fullscreen, no-scroll) ═══ -->
      <div class="flex lg:hidden flex-col h-full relative z-10">
        
        <!-- Mobile Top Bar: Room name + participant count -->
        <div class="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2 flex-shrink-0">
          <div class="flex flex-col">
            <span class="text-[9px] text-primary font-bold uppercase tracking-widest">Siap Bergabung?</span>
            <h1 class="text-base font-extrabold text-foreground tracking-tight leading-tight">{{ meetStore.room?.name ?? 'Loading...' }}</h1>
          </div>
          <div class="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span class="text-[10px] font-bold">{{ meetStore.participantCount }} aktif</span>
          </div>
        </div>

        <!-- Mobile Video Preview (fills all available space) -->
        <div class="flex-1 px-3 pb-2 min-h-0">
          <div class="w-full h-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative shadow-inner shadow-black/50 group">
            <div class="absolute inset-0 border border-primary/20 rounded-2xl pointer-events-none"></div>
            <video
              v-show="tempCameraEnabled"
              ref="localVideoMobileEl"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover scale-x-[-1]"
            ></video>
            <div v-if="!tempCameraEnabled" class="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-lg">
              <div class="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 shadow-xl">
                <CameraOff class="h-7 w-7 text-muted-foreground animate-pulse" />
              </div>
              <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Kamera Dinonaktifkan</span>
            </div>

            <!-- Audio level mini-bar overlay (top-right corner) -->
            <div v-if="tempMicEnabled" class="absolute top-3 right-3 flex items-end gap-[2px] h-5 bg-black/50 backdrop-blur-md rounded-lg px-1.5 py-1 border border-white/10">
              <div v-for="i in 5" :key="'m'+i" class="w-[3px] rounded-full transition-all duration-75" :style="{ height: (audioLevel >= (i / 5) * 100) ? '100%' : '20%' }" :class="audioLevel >= (i / 5) * 100 ? 'bg-primary' : 'bg-white/20'"></div>
            </div>
          </div>
        </div>

        <!-- Mobile Bottom Controls Bar (compact, no scroll) -->
        <div class="flex-shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),8px)] flex flex-col gap-2">
          <!-- Row 1: Mic, Camera, Effects/Settings buttons -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleTempMic"
              class="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer text-xs font-bold"
              :class="tempMicEnabled ? 'bg-white/10 text-white border border-white/10' : 'bg-destructive text-destructive-foreground border border-destructive'"
            >
              <component :is="tempMicEnabled ? Mic : MicOff" class="h-4 w-4" />
              <span>{{ tempMicEnabled ? 'Mic On' : 'Mic Off' }}</span>
            </button>
            <button
              @click="toggleTempCamera"
              class="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer text-xs font-bold"
              :class="tempCameraEnabled ? 'bg-white/10 text-white border border-white/10' : 'bg-destructive text-destructive-foreground border border-destructive'"
            >
              <component :is="tempCameraEnabled ? Camera : CameraOff" class="h-4 w-4" />
              <span>{{ tempCameraEnabled ? 'Cam On' : 'Cam Off' }}</span>
            </button>
            <button
              @click="showSettingsDialog = true"
              class="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer bg-white/10 text-white border border-white/10 flex-shrink-0"
            >
              <Sparkles class="h-4 w-4 text-primary" />
            </button>
          </div>

          <!-- Row 2: Join Button (always visible) -->
          <Button
            @click="joinMeeting"
            size="lg"
            class="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] duration-200"
          >
            <span>Gabung Rapat</span>
            <ArrowRight class="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      <!-- ═══ DESKTOP LAYOUT (unchanged, original 2-column grid) ═══ -->
      <div class="hidden lg:flex flex-1 justify-center items-center p-6 md:p-8">
        <div class="w-full max-w-5xl bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl grid grid-cols-12 gap-12 items-stretch relative z-10">

          <!-- Kolom Kiri: Video Preview & Audio Tester & Effects (col-span-7) -->
          <div class="col-span-7 flex flex-col gap-6">
            <!-- Video preview card -->
            <div class="w-full aspect-video bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative shadow-inner shadow-black/50 transition-all duration-300 hover:scale-[1.005] group">
              <div class="absolute inset-0 border border-primary/20 rounded-3xl pointer-events-none group-hover:border-primary/40 transition-colors duration-500"></div>
              <video
                v-show="tempCameraEnabled"
                ref="localVideoEl"
                autoplay
                playsinline
                muted
                class="w-full h-full object-cover scale-x-[-1]"
              ></video>
              <div v-if="!tempCameraEnabled" class="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-lg">
                <div class="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-xl transition-transform duration-300 group-hover:scale-105">
                  <CameraOff class="h-10 w-10 text-muted-foreground animate-pulse" />
                </div>
                <span class="text-sm text-muted-foreground font-bold uppercase tracking-wider">Kamera Dinonaktifkan</span>
              </div>
              <!-- Quick Control Overlay -->
              <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10 shadow-2xl transition-all duration-300 hover:bg-black/70">
                <button
                  @click="toggleTempMic"
                  class="h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                  :class="tempMicEnabled ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-destructive border border-destructive text-destructive-foreground hover:bg-destructive/95'"
                >
                  <component :is="tempMicEnabled ? Mic : MicOff" class="h-5 w-5" />
                  <q-tooltip class="bg-card text-foreground border border-border shadow-2xl text-xs font-semibold rounded-xl px-3 py-2 backdrop-blur-md">
                    {{ tempMicEnabled ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon' }}
                  </q-tooltip>
                </button>
                <button
                  @click="toggleTempCamera"
                  class="h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                  :class="tempCameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-destructive border border-destructive text-destructive-foreground hover:bg-destructive/95'"
                >
                  <component :is="tempCameraEnabled ? Camera : CameraOff" class="h-5 w-5" />
                  <q-tooltip class="bg-card text-foreground border border-border shadow-2xl text-xs font-semibold rounded-xl px-3 py-2 backdrop-blur-md">
                    {{ tempCameraEnabled ? 'Matikan Kamera' : 'Nyalakan Kamera' }}
                  </q-tooltip>
                </button>
              </div>
            </div>

            <!-- Tester Audio (Desktop Only) -->
            <div class="flex flex-col gap-2 bg-white/5 border border-white/5 px-5 py-4 rounded-3xl shadow-lg relative overflow-hidden group">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <Mic class="h-4.5 w-4.5 text-primary" />
                  <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tes Input Suara</span>
                </div>
                <span class="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">Mikrofon Aktif</span>
              </div>
              <div class="flex items-center gap-1.5 h-3.5 mt-2 bg-black/20 rounded-full p-1 border border-white/5">
                <div
                  v-for="i in 16"
                  :key="i"
                  class="flex-1 h-full rounded-full transition-all duration-75"
                  :class="[
                    tempMicEnabled && (audioLevel >= (i / 16) * 100)
                      ? (i <= 11 ? 'bg-primary shadow-[0_0_8px_rgba(var(--q-primary),0.6)]' : i <= 14 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]')
                      : 'bg-white/10'
                  ]"
                ></div>
              </div>
            </div>

            <!-- Efek Video & Audio Premium (Desktop Only) -->
            <div class="flex flex-col gap-4 bg-white/5 border border-white/5 px-5 py-4 rounded-3xl shadow-lg relative overflow-hidden group">
              <div class="flex items-center gap-2">
                <Sparkles class="h-4.5 w-4.5 text-primary animate-pulse" />
                <span class="text-xs text-muted-foreground font-bold uppercase tracking-wider">Efek Media Premium</span>
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-left">Latar Belakang Kamera</span>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="bg in [
                      { id: 'none', label: 'Biasa', icon: Camera },
                      { id: 'blur', label: 'Buram', icon: Sliders },
                      { id: 'office', label: 'Kantor', icon: Video },
                      { id: 'nature', label: 'Alam', icon: Sparkles }
                    ]"
                    :key="bg.id"
                    @click="meetStore.setVirtualBackground(bg.id)"
                    class="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    :class="meetStore.virtualBackground === bg.id ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-white/5 bg-white/5 text-muted-foreground hover:text-foreground'"
                  >
                    <component :is="bg.icon" class="h-4 w-4 mb-1" />
                    <span class="text-[10px] font-bold tracking-tight">{{ bg.label }}</span>
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2.5 border-t border-white/5 pt-3">
                <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-left">Pembersih Suara Pintar</span>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="meetStore.setNoiseSuppression(!meetStore.isNoiseSuppressionEnabled)"
                    class="flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                    :class="meetStore.isNoiseSuppressionEnabled ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-white/5 bg-white/5 text-muted-foreground hover:text-foreground'"
                  >
                    <div class="flex flex-col">
                      <span class="text-xs font-bold">Peredam Bising</span>
                      <span class="text-[9px] text-muted-foreground mt-0.5">Krisp-style DSP</span>
                    </div>
                    <div class="h-5 w-5 rounded-full flex items-center justify-center" :class="meetStore.isNoiseSuppressionEnabled ? 'bg-primary text-primary-foreground' : 'bg-white/10'">
                      <Check v-if="meetStore.isNoiseSuppressionEnabled" class="h-3 w-3" />
                    </div>
                  </button>
                  <button
                    @click="meetStore.setCrispVoice(!meetStore.isCrispVoiceEnabled)"
                    class="flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                    :class="meetStore.isCrispVoiceEnabled ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-white/5 bg-white/5 text-muted-foreground hover:text-foreground'"
                  >
                    <div class="flex flex-col">
                      <span class="text-xs font-bold">Vokal Studio</span>
                      <span class="text-[9px] text-muted-foreground mt-0.5">Kompresor HD</span>
                    </div>
                    <div class="h-5 w-5 rounded-full flex items-center justify-center" :class="meetStore.isCrispVoiceEnabled ? 'bg-primary text-primary-foreground' : 'bg-white/10'">
                      <Check v-if="meetStore.isCrispVoiceEnabled" class="h-3 w-3" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan: Rapat Info & Hardware Selectors (col-span-5) -->
          <div class="col-span-5 flex flex-col justify-between self-stretch py-1 gap-6">
            <div class="flex flex-col gap-6">
              <div class="text-left">
                <h2 class="text-foreground font-bold text-2xl sm:text-3xl tracking-tight">Siap Bergabung?</h2>
                <p class="text-xs text-muted-foreground mt-1">Atur perangkat keras Anda dengan sempurna sebelum masuk rapat.</p>
              </div>
              <div class="flex p-5 bg-white/5 border border-white/5 rounded-3xl flex-col gap-2.5 relative overflow-hidden group hover:bg-white/10 transition-all duration-300 shadow-lg">
                <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-300"></div>
                <span class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-left">Nama Rapat</span>
                <span class="text-xl font-bold text-foreground text-left leading-none tracking-tight">{{ meetStore.room?.name ?? 'Loading Rapat...' }}</span>
                <div class="flex items-center gap-2 mt-2 self-start bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 duration-200">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span>{{ meetStore.participantCount }} Peserta Aktif</span>
                </div>
              </div>
              <div class="flex flex-col gap-4 text-left">
                <AppSelect
                  id="camera-select"
                  label="Pilih Kamera"
                  v-model="selectedCameraId"
                  :options="cameraOptions"
                  text-key="label"
                  value-key="deviceId"
                  :disabled="!tempCameraEnabled"
                  @update:model-value="startLocalPreview"
                />
                <AppSelect
                  id="microphone-select"
                  label="Pilih Mikrofon"
                  v-model="selectedMicrophoneId"
                  :options="microphoneOptions"
                  text-key="label"
                  value-key="deviceId"
                  :disabled="!tempMicEnabled"
                  @update:model-value="startLocalPreview"
                />
              </div>
            </div>
            <Button
              @click="joinMeeting"
              class="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-primary-foreground font-bold text-base transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-primary/45 active:scale-[0.98] duration-200 mt-6"
            >
              <span>Gabung Rapat</span>
              <ArrowRight class="h-5 w-5" />
            </Button>
          </div>

        </div>
      </div>
    </div>

    <!-- Fase 2: Rapat Aktif -->
    <template v-else>
      <!-- ── Header Bar ── -->
      <div class="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-card/80 border-b border-border flex-shrink-0 gap-2">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Video class="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 class="text-foreground text-sm font-semibold leading-none">{{ meetStore.room?.name ?? 'Meeting' }}</h1>
            <span class="text-muted-foreground text-xs">{{ meetStore.participantCount }} peserta</span>
          </div>
        </div>

        <!-- Center section: REC + Timer -->
        <div class="flex items-center gap-3">
          <div v-if="meetStore.isRecording" class="flex items-center gap-1.5 bg-destructive/10 border border-destructive/25 px-2.5 py-1 rounded-full text-destructive text-xs font-semibold animate-pulse">
            <span class="h-1.5 w-1.5 rounded-full bg-destructive animate-ping"></span>
            <span>REC {{ formatDuration(recordingDuration) }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-white/5 border border-border px-2.5 py-1 rounded-full text-muted-foreground text-xs font-medium">
            <Clock class="h-3.5 w-3.5 text-primary" />
            <span>{{ formatDuration(meetingDuration) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <button @click="copyRoomLink" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all">
            <Copy class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Bagikan</span>
          </button>
          <div class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg" :class="statusClass">
            <div class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></div>
            <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">{{ statusText }}</span>
          </div>
          <button @click="toggleParticipantsPanel" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all" :class="{ 'bg-primary/20 text-primary': meetStore.showParticipants }">
            <Users class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Peserta</span>
          </button>
          <button @click="showChat = !showChat" class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs transition-all" :class="{ 'bg-primary/20 text-primary': showChat }">
            <MessageSquare class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Chat</span>
            <span v-if="unreadCount > 0" class="bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 ml-0.5">{{ unreadCount }}</span>
          </button>
        </div>
      </div>

      <!-- ── Main Area ── -->
      <div class="flex-1 flex overflow-hidden min-h-0 relative">
        
        <!-- Whiteboard Area -->
        <RoomWhiteboard
          v-if="meetStore.isWhiteboardActive"
          @close="roomComposable.sendWhiteboardToggle(false)"
          @draw="roomComposable.sendWhiteboardDraw"
          @clear="roomComposable.sendWhiteboardClear"
          class="flex-1 min-w-0 min-h-0 border border-border bg-card rounded-2xl overflow-hidden m-3 shadow-2xl relative"
        />

        <!-- Video Grid Area -->
        <div 
          v-show="!meetStore.isWhiteboardActive || (meetStore.isWhiteboardActive && !isMobile)"
          class="overflow-hidden flex flex-col min-h-0 min-w-0 transition-all duration-300"
          :class="meetStore.isWhiteboardActive ? 'w-72 border-l border-border bg-background/50 backdrop-blur-sm p-3 shrink-0' : 'flex-1 p-3'"
        >
          <div class="flex-1 h-full flex flex-col gap-3 min-h-0 w-full">
            <div class="flex-1 flex flex-col min-h-0 w-full relative">
              <div class="flex-1 flex overflow-hidden p-2">
                <div 
                  class="m-auto w-full flex justify-center gap-3"
                  :class="meetStore.isWhiteboardActive ? 'flex-col overflow-y-auto max-h-[80vh] custom-scrollbar p-1' : 'flex-wrap'"
                >
                  <ParticipantTile 
                    v-for="p in meetStore.participants" 
                    :key="p.identity" 
                    :participant="p" 
                    :style="meetStore.isWhiteboardActive ? { width: '100%', aspectRatio: '16/9' } : getTileStyle(meetStore.participants.length)" 
                    class="aspect-video shadow-lg rounded-xl overflow-hidden bg-card border border-border shrink-0 animate-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RoomChat :show="showChat" v-model:solid="chatSolid" :messages="meetStore.messages" @close="showChat = false" @send="sendChat" />
        <RoomParticipants :show="meetStore.showParticipants" :solid="chatSolid" :participants="meetStore.participants" :is-host="meetStore.isHost" @close="meetStore.showParticipants = false" @lower-hand="lowerRemoteHand" @mute="muteRemoteParticipant" @mute-all="muteAllParticipants" @lower-all-hands="lowerAllHands" />

        <!-- Floating Emoji Reactions -->
        <div class="fixed bottom-24 left-6 z-50 pointer-events-none flex flex-col gap-2">
          <TransitionGroup name="float-up">
            <div v-for="reaction in meetStore.reactions" :key="reaction.id" class="flex items-center gap-2 bg-card/90 border border-border rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md">
              <span class="text-xl">{{ reaction.emoji }}</span>
              <span class="text-foreground text-[10px] font-medium pr-1">{{ reaction.sender }}</span>
            </div>
          </TransitionGroup>
        </div>
      </div>




    <!-- ── Control Bar ── -->
    <RoomControlBar
      :is-mic-enabled="meetStore.isMicEnabled"
      :is-camera-enabled="meetStore.isCameraEnabled"
      :is-screen-sharing="meetStore.isScreenSharing"
      :is-hand-raised="myHandRaised"
      :is-host="meetStore.isHost"
      :is-recording="meetStore.isRecording"
      :show-participants="meetStore.showParticipants"
      :show-whiteboard="meetStore.isWhiteboardActive"
      @toggle-mic="roomComposable.toggleMic"
      @toggle-camera="roomComposable.toggleCamera"
      @toggle-screen-share="roomComposable.toggleScreenShare"
      @toggle-raise-hand="toggleRaiseHand"
      @send-reaction="sendReactionEmoji"
      @toggle-recording="toggleRecording"
      @mute-all="muteAllParticipants"
      @lower-all-hands="lowerAllHands"
      @leave="leaveRoom"
      @toggle-participants="toggleParticipantsPanel"
      @toggle-whiteboard="toggleWhiteboardPanel"
      @open-settings="showSettingsDialog = true"
    />
    </template>

    <!-- Dialog Pengaturan Media (Global) -->
    <q-dialog v-model="showSettingsDialog">
      <q-card class="w-[500px] max-w-[90vw] bg-card/95 backdrop-blur-xl border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
        <div class="px-6 py-5 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            <h3 class="text-base font-bold tracking-tight">Pengaturan Media & Efek</h3>
          </div>
          <button @click="showSettingsDialog = false" class="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <X class="h-4.5 w-4.5" />
          </button>
        </div>
        <div class="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          
          <!-- Kualitas Video -->
          <div>
            <div class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Kualitas Video (Resolusi)</div>
            <div class="flex flex-col gap-2">
              <div @click="changeResolution('h360')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h360' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                <div class="flex flex-col text-left">
                  <span class="text-xs font-semibold">🍃 Hemat Data (360p)</span>
                  <span class="text-[10px] text-muted-foreground mt-0.5">Cocok untuk koneksi lambat.</span>
                </div>
                <Check v-if="meetStore.cameraResolution === 'h360'" class="h-4 w-4 shrink-0 text-primary" />
              </div>
              <div @click="changeResolution('h540')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h540' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                <div class="flex flex-col text-left">
                  <span class="text-xs font-semibold">📺 Kualitas Standar (540p)</span>
                  <span class="text-[10px] text-muted-foreground mt-0.5">Keseimbangan terbaik.</span>
                </div>
                <Check v-if="meetStore.cameraResolution === 'h540'" class="h-4 w-4 shrink-0 text-primary" />
              </div>
              <div @click="changeResolution('h720')" class="flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer hover:bg-white/5 select-none" :class="meetStore.cameraResolution === 'h720' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card/40'">
                <div class="flex flex-col text-left">
                  <span class="text-xs font-semibold">✨ High Definition (720p)</span>
                  <span class="text-[10px] text-muted-foreground mt-0.5">Gambar HD tajam.</span>
                </div>
                <Check v-if="meetStore.cameraResolution === 'h720'" class="h-4 w-4 shrink-0 text-primary" />
              </div>
            </div>
          </div>

          <!-- Efek Latar Belakang -->
          <div>
            <div class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Latar Belakang Kamera</div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="bg in [
                  { id: 'none', label: 'Biasa', icon: Camera },
                  { id: 'blur', label: 'Buram', icon: Sliders },
                  { id: 'office', label: 'Kantor', icon: Video },
                  { id: 'nature', label: 'Alam', icon: Sparkles }
                ]"
                :key="bg.id"
                @click="meetStore.setVirtualBackground(bg.id)"
                class="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                :class="meetStore.virtualBackground === bg.id ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'"
              >
                <component :is="bg.icon" class="h-4 w-4 mb-1" />
                <span class="text-[10px] font-bold tracking-tight">{{ bg.label }}</span>
              </button>
            </div>
          </div>

          <!-- Pembersih Suara -->
          <div>
            <div class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Pembersih Suara Pintar (DSP)</div>
            <div class="grid grid-cols-2 gap-3">
              <!-- Noise Suppression -->
              <button
                @click="meetStore.setNoiseSuppression(!meetStore.isNoiseSuppressionEnabled)"
                class="flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                :class="meetStore.isNoiseSuppressionEnabled ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'"
              >
                <div class="flex flex-col">
                  <span class="text-xs font-bold">Peredam Bising</span>
                  <span class="text-[9px] text-muted-foreground mt-0.5">Krisp-style DSP</span>
                </div>
                <div class="h-5 w-5 rounded-full flex items-center justify-center" :class="meetStore.isNoiseSuppressionEnabled ? 'bg-primary text-primary-foreground' : 'bg-white/10'">
                  <Check v-if="meetStore.isNoiseSuppressionEnabled" class="h-3 w-3" />
                </div>
              </button>

              <!-- Crisp Voice -->
              <button
                @click="meetStore.setCrispVoice(!meetStore.isCrispVoiceEnabled)"
                class="flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                :class="meetStore.isCrispVoiceEnabled ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--q-primary),0.25)]' : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'"
              >
                <div class="flex flex-col">
                  <span class="text-xs font-bold">Vokal Studio</span>
                  <span class="text-[9px] text-muted-foreground mt-0.5">Kompresor HD</span>
                </div>
                <div class="h-5 w-5 rounded-full flex items-center justify-center" :class="meetStore.isCrispVoiceEnabled ? 'bg-primary text-primary-foreground' : 'bg-white/10'">
                  <Check v-if="meetStore.isCrispVoiceEnabled" class="h-3 w-3" />
                </div>
              </button>
            </div>
          </div>

        </div>
        <div class="px-6 py-4.5 border-t border-border flex items-center justify-end bg-card/50">
          <button @click="showSettingsDialog = false" class="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer active:scale-95">Selesai</button>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Video, Copy, MessageSquare, Clock, Users, ChevronLeft, ChevronRight, Settings, Check, X,
  Mic, MicOff, Camera, CameraOff, ArrowRight, ChevronDown, Sliders, Sparkles
} from 'lucide-vue-next'
import { useMeetStore } from '@/stores/meet'
import { useRoom } from '@/composables/useRoom'
import ParticipantTile from '@/components/meet/ParticipantTile.vue'
import RoomChat from '@/components/meet/RoomChat.vue'
import RoomParticipants from '@/components/meet/RoomParticipants.vue'
import RoomControlBar from '@/components/meet/RoomControlBar.vue'
import RoomWhiteboard from '@/components/meet/RoomWhiteboard.vue'
import { useNotificationStore } from '@/stores/notification'
import { api as axios } from '@/boot/axios'
import AppSelect from '@/components/AppSelect.vue'
import { Button } from '@/components/ui/button'
import { RoomEvent, Track } from 'livekit-client'

const router = useRouter()
const route = useRoute()
const meetStore = useMeetStore()
const notificationStore = useNotificationStore()
const roomComposable = useRoom()

// --- State Green Room Pre-flight Lobby ---
const hasJoined = ref(false)
const localStream = ref(null)
const audioLevel = ref(0)
const cameras = ref([])
const microphones = ref([])
const selectedCameraId = ref('')
const selectedMicrophoneId = ref('')
const localVideoEl = ref(null)
const localVideoMobileEl = ref(null)

const tempMicEnabled = ref(true)
const tempCameraEnabled = ref(true)

// --- State UI Meeting ---
const showChat = ref(false)
const pinnedId = ref(null)
const connectionAttempted = ref(false)
const unreadCount = ref(0)
const chatSolid = ref(false)
const showSettingsDialog = ref(false)

const isMobile = ref(false)
function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}
function toggleWhiteboardPanel() {
  const nextState = !meetStore.isWhiteboardActive
  roomComposable.sendWhiteboardToggle(nextState)
}

// --- State Profesional Tambahan ---
const participantSearch = ref('')
const meetingDuration = ref(0)
const recordingDuration = ref(0)
let timerInterval = null

// --- Computeds ---
const cameraOptions = computed(() => {
  return cameras.value.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || `Kamera ${index + 1}`
  }))
})

const microphoneOptions = computed(() => {
  return microphones.value.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || `Mikrofon ${index + 1}`
  }))
})

const pinnedParticipant = computed(() => {
  if (!pinnedId.value) return null
  return meetStore.participants.find(p => p.identity === pinnedId.value) || null
})

const unpinnedParticipants = computed(() => {
  if (!pinnedId.value) return meetStore.participants
  return meetStore.participants.filter(p => p.identity !== pinnedId.value)
})

// --- Pagination ---
const tilesPerPage = computed(() => {
  const count = unpinnedParticipants.value.length
  if (count <= 4) return count      // sedikit: tampil semua
  if (count <= 9) return 9          // max 9 (3x3)
  return 12                          // max 12 (4x3)
})

const totalPages = computed(() => {
  return Math.ceil(unpinnedParticipants.value.length / tilesPerPage.value) || 1
})

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * tilesPerPage.value
  return unpinnedParticipants.value.slice(start, start + tilesPerPage.value)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Reset ke halaman 1 jika jumlah participant berubah
watch(() => unpinnedParticipants.value.length, () => {
  currentPage.value = 1
})

// --- Responsive Flexbox Gallery Layout (Discord/Meet Style) ---
function getTileStyle(count) {
  if (count === 1) return { width: '100%', maxWidth: '1000px' }
  if (count === 2) return { width: 'calc(50% - 0.5rem)', maxWidth: '800px' }
  if (count === 3 || count === 4) return { width: 'calc(50% - 0.5rem)', maxWidth: '600px' }
  if (count >= 5 && count <= 6) return { width: 'calc(33.333% - 0.66rem)', maxWidth: '500px' }
  if (count >= 7 && count <= 8) return { width: 'calc(25% - 0.75rem)' }
  if (count >= 9 && count <= 12) return { width: 'calc(25% - 0.75rem)' } 
  return { width: 'calc(20% - 0.8rem)' }
}

// --- Connection Status ---
const statusClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-success/10 text-success'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-500/10 text-amber-500'
  return 'bg-destructive/10 text-destructive'
})

const statusDotClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-success animate-pulse'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-500 animate-pulse'
  return 'bg-destructive'
})

const statusText = computed(() => {
  const map = {
    connected: 'Terhubung',
    connecting: 'Menghubungkan',
    reconnecting: 'Menyambung ulang',
    disconnected: 'Terputus',
  }
  return map[meetStore.connectionState] ?? 'Unknown'
})

// --- Computed Profesional ---
const localParticipant = computed(() => meetStore.participants.find(p => p.isLocal))
const myHandRaised = computed(() => {
  return localParticipant.value?.isHandRaised || false
})

// --- Green Room Functions ---

async function loadDevices() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Minta izin dasar terlebih dahulu agar label perangkat terisi lengkap
      if (tempCameraEnabled.value || tempMicEnabled.value) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: tempCameraEnabled.value,
            audio: tempMicEnabled.value
          })
          tempStream.getTracks().forEach(t => t.stop())
        } catch (e) {
          console.warn('Izin perangkat ditolak atau tidak tersedia:', e)
        }
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      cameras.value = devices.filter(d => d.kind === 'videoinput')
      microphones.value = devices.filter(d => d.kind === 'audioinput')

      // Pilih default kamera pertama jika belum terpilih
      if (cameras.value.length > 0 && !selectedCameraId.value) {
        selectedCameraId.value = cameras.value[0].deviceId
      }
      // Pilih default mikrofon pertama jika belum terpilih
      if (microphones.value.length > 0 && !selectedMicrophoneId.value) {
        selectedMicrophoneId.value = microphones.value[0].deviceId
      }
    }
  } catch (err) {
    console.error('Gagal memuat daftar perangkat keras:', err)
  }
}

function toggleTempMic() {
  tempMicEnabled.value = !tempMicEnabled.value
  if (localStream.value) {
    const audioTrack = localStream.value.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = tempMicEnabled.value
    }
  }
}

function toggleTempCamera() {
  tempCameraEnabled.value = !tempCameraEnabled.value
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = tempCameraEnabled.value
    }
  }
}

// --- Media Processing Variables ---
let selfieSegmentation = null
const isMediaPipeLoaded = ref(false)
const outputCanvas = document.createElement('canvas')
const personCanvas = document.createElement('canvas')
let rawVideoEl = null
let renderLoopActive = false
let rawStream = null

let officeBgImage = null
let natureBgImage = null

// Audio DSP Nodes
let audioCtx = null
let audioSourceNode = null
let highpassNode = null
let lowpassNode = null
let compressorNode = null
let audioDestinationNode = null
let analyser = null
let animationFrameId = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function preloadBackgroundImages() {
  officeBgImage = new Image()
  officeBgImage.crossOrigin = 'anonymous'
  officeBgImage.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'

  natureBgImage = new Image()
  natureBgImage.crossOrigin = 'anonymous'
  natureBgImage.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
}

async function initSelfieSegmentation() {
  if (selfieSegmentation) return
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js')
    selfieSegmentation = new window.SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    })
    selfieSegmentation.setOptions({
      modelSelection: 1, // landscape (faster and optimized for closer webcam framing)
      selfieMode: false
    })
    selfieSegmentation.onResults(onSelfieResults)
    isMediaPipeLoaded.value = true
  } catch (err) {
    console.error('Gagal memuat MediaPipe Selfie Segmentation:', err)
  }
}

function onSelfieResults(results) {
  if (!outputCanvas || !personCanvas) return
  const ctx = outputCanvas.getContext('2d')
  const personCtx = personCanvas.getContext('2d')
  const w = outputCanvas.width
  const h = outputCanvas.height

  // 1. Gambar siluet orang di personCanvas dengan komposit source-in
  personCtx.save()
  personCtx.clearRect(0, 0, w, h)
  personCtx.globalCompositeOperation = 'copy'
  personCtx.drawImage(results.segmentationMask, 0, 0, w, h)
  personCtx.globalCompositeOperation = 'source-in'
  personCtx.drawImage(results.image, 0, 0, w, h)
  personCtx.restore()

  // 2. Gambar background di outputCanvas
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  const bgType = meetStore.virtualBackground

  if (bgType === 'blur') {
    ctx.filter = 'blur(16px)'
    ctx.drawImage(results.image, 0, 0, w, h)
    ctx.filter = 'none'
  } else if (bgType === 'office') {
    if (officeBgImage && officeBgImage.complete) {
      ctx.drawImage(officeBgImage, 0, 0, w, h)
    } else {
      ctx.fillStyle = '#1e1f22'
      ctx.fillRect(0, 0, w, h)
    }
  } else if (bgType === 'nature') {
    if (natureBgImage && natureBgImage.complete) {
      ctx.drawImage(natureBgImage, 0, 0, w, h)
    } else {
      ctx.fillStyle = '#1e1f22'
      ctx.fillRect(0, 0, w, h)
    }
  } else {
    ctx.drawImage(results.image, 0, 0, w, h)
  }

  // 3. Gambar orang di atas background virtual
  if (bgType !== 'none') {
    ctx.drawImage(personCanvas, 0, 0, w, h)
  }
  ctx.restore()
}

function startCanvasRenderLoop() {
  const renderFrame = async () => {
    if (!renderLoopActive || !rawVideoEl) return

    if (rawVideoEl.readyState >= 2 && rawVideoEl.videoWidth > 0) {
      const w = rawVideoEl.videoWidth
      const h = rawVideoEl.videoHeight

      if (outputCanvas.width !== w || outputCanvas.height !== h) {
        outputCanvas.width = w
        outputCanvas.height = h
        personCanvas.width = w
        personCanvas.height = h
      }

      const bgType = meetStore.virtualBackground
      if (bgType === 'none') {
        const ctx = outputCanvas.getContext('2d')
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(rawVideoEl, 0, 0, w, h)
      } else {
        if (isMediaPipeLoaded.value && selfieSegmentation) {
          try {
            await selfieSegmentation.send({ image: rawVideoEl })
          } catch (e) {
            console.error('MediaPipe send error:', e)
            const ctx = outputCanvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)
            ctx.drawImage(rawVideoEl, 0, 0, w, h)
          }
        } else {
          const ctx = outputCanvas.getContext('2d')
          ctx.clearRect(0, 0, w, h)
          ctx.drawImage(rawVideoEl, 0, 0, w, h)
        }
      }
    }

    requestAnimationFrame(renderFrame)
  }

  renderFrame()
}

function setupAudioDSP(stream) {
  cleanupAudioDSP()

  const audioTracks = stream.getAudioTracks()
  if (!audioTracks || audioTracks.length === 0) return null

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    audioSourceNode = audioCtx.createMediaStreamSource(stream)

    // Filter Bandpass (Highpass + Lowpass kombinasi yang natural)
    highpassNode = audioCtx.createBiquadFilter()
    highpassNode.type = 'highpass'
    highpassNode.frequency.value = 150 // Redam gemuruh bising frekuensi rendah (<150Hz)

    lowpassNode = audioCtx.createBiquadFilter()
    lowpassNode.type = 'lowpass'
    lowpassNode.frequency.value = 4000 // Redam desis frekuensi tinggi (>4000Hz)

    // Dynamics Compressor untuk Vokal Studio Bulat & Tebal
    compressorNode = audioCtx.createDynamicsCompressor()
    compressorNode.threshold.value = -24
    compressorNode.knee.value = 30
    compressorNode.ratio.value = 12
    compressorNode.attack.value = 0.003
    compressorNode.release.value = 0.25

    // Destination
    audioDestinationNode = audioCtx.createMediaStreamDestination()

    updateAudioDSPConnections()

    // Analyser untuk visualisasi mikrofon reaktif di lobi
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256

    const finalSource = audioCtx.createMediaStreamSource(audioDestinationNode.stream)
    finalSource.connect(analyser)

    startVolumeCheckLoop()

    return audioDestinationNode.stream.getAudioTracks()[0]
  } catch (err) {
    console.error('Error inisialisasi Audio DSP:', err)
    return audioTracks[0]
  }
}

function updateAudioDSPConnections() {
  if (!audioCtx || !audioSourceNode) return

  try {
    audioSourceNode.disconnect()
    highpassNode.disconnect()
    lowpassNode.disconnect()
    compressorNode.disconnect()
  } catch (e) {
    // Abaikan jika node belum terhubung
  }

  let currentNode = audioSourceNode

  // 1. Noise Suppression: Highpass + Lowpass vokal bandpass
  if (meetStore.isNoiseSuppressionEnabled) {
    currentNode.connect(highpassNode)
    highpassNode.connect(lowpassNode)
    currentNode = lowpassNode
  }

  // 2. Crisp Voice: Dynamics Compressor
  if (meetStore.isCrispVoiceEnabled) {
    currentNode.connect(compressorNode)
    currentNode = compressorNode
  }

  currentNode.connect(audioDestinationNode)
}

function cleanupAudioDSP() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (audioCtx) {
    try {
      audioCtx.close()
    } catch (e) {
      console.error('Gagal menutup AudioContext:', e)
    }
    audioCtx = null
  }
  audioSourceNode = null
  highpassNode = null
  lowpassNode = null
  compressorNode = null
  audioDestinationNode = null
  analyser = null
}

function startVolumeCheckLoop() {
  if (!analyser) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const checkVolume = () => {
    if (!tempMicEnabled.value || !localStream.value || !analyser) {
      audioLevel.value = 0
      animationFrameId = requestAnimationFrame(checkVolume)
      return
    }

    analyser.getByteFrequencyData(dataArray)
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength
    audioLevel.value = Math.min(100, Math.round((average / 128) * 100))

    animationFrameId = requestAnimationFrame(checkVolume)
  }

  checkVolume()
}

async function startMediaProcessor() {
  stopMediaProcessor()

  try {
    // Resolusi kamera berdasarkan store state
    const idealWidth = meetStore.cameraResolution === 'h720' ? 1280 : meetStore.cameraResolution === 'h1080' ? 1920 : meetStore.cameraResolution === 'h360' ? 640 : 960
    const idealHeight = meetStore.cameraResolution === 'h720' ? 720 : meetStore.cameraResolution === 'h1080' ? 1080 : meetStore.cameraResolution === 'h360' ? 360 : 540

    const constraints = {
      video: {
        deviceId: selectedCameraId.value ? { exact: selectedCameraId.value } : undefined,
        width: { ideal: idealWidth },
        height: { ideal: idealHeight }
      },
      audio: {
        deviceId: selectedMicrophoneId.value ? { exact: selectedMicrophoneId.value } : undefined,
        echoCancellation: true,
        noiseSuppression: false // Handled in High-Fidelity DSP
      }
    }

    rawStream = await navigator.mediaDevices.getUserMedia(constraints)

    // Set up Raw Video untuk pengolahan
    const rawVideoTrack = rawStream.getVideoTracks()[0]
    if (rawVideoTrack) {
      rawVideoEl = document.createElement('video')
      rawVideoEl.autoplay = true
      rawVideoEl.playsinline = true
      rawVideoEl.muted = true
      rawVideoEl.srcObject = new MediaStream([rawVideoTrack])
      rawVideoEl.play().catch(e => console.error('Play raw video failed:', e))

      renderLoopActive = true
      startCanvasRenderLoop()
    }

    // Set up Audio DSP
    const rawAudioTrack = rawStream.getAudioTracks()[0]
    let finalAudioTrack = null
    if (rawAudioTrack) {
      finalAudioTrack = setupAudioDSP(rawStream)
    }

    // Capture processed Video track dari Canvas
    const processedVideoTrack = outputCanvas.captureStream(30).getVideoTracks()[0]
    if (processedVideoTrack) {
      processedVideoTrack.enabled = tempCameraEnabled.value
    }
    if (finalAudioTrack) {
      finalAudioTrack.enabled = tempMicEnabled.value
    }

    const finalStream = new MediaStream()
    if (processedVideoTrack) finalStream.addTrack(processedVideoTrack)
    if (finalAudioTrack) finalStream.addTrack(finalAudioTrack)

    localStream.value = finalStream

    if (localVideoEl.value) {
      localVideoEl.value.srcObject = finalStream
    }
    if (localVideoMobileEl.value) {
      localVideoMobileEl.value.srcObject = finalStream
    }

    // Pasang instan ke LiveKit jika sudah dalam rapat aktif
    if (hasJoined.value) {
      await applyProcessedTracksToLiveKit()
    }

  } catch (err) {
    console.error('Gagal menjalankan media processor:', err)
  }
}

function stopMediaProcessor() {
  renderLoopActive = false
  cleanupAudioDSP()

  if (rawStream) {
    rawStream.getTracks().forEach(t => t.stop())
    rawStream = null
  }
  if (rawVideoEl) {
    rawVideoEl.srcObject = null
    rawVideoEl = null
  }
  if (localStream.value) {
    localStream.value.getTracks().forEach(t => t.stop())
    localStream.value = null
  }
  if (localVideoEl.value) {
    localVideoEl.value.srcObject = null
  }
  if (localVideoMobileEl.value) {
    localVideoMobileEl.value.srcObject = null
  }
  audioLevel.value = 0
}

async function startLocalPreview() {
  await startMediaProcessor()
}

function stopLocalPreview() {
  stopMediaProcessor()
}

async function applyProcessedTracksToLiveKit() {
  const room = roomComposable.lkRoom.value
  if (!room) return

  try {
    // 1. Ganti Video Track di LiveKit secara Zero-Blink
    const videoPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
    if (videoPub && videoPub.track) {
      const processedVideoTrack = outputCanvas.captureStream(30).getVideoTracks()[0]
      if (processedVideoTrack) {
        const defaultTrack = videoPub.track.mediaStreamTrack
        await videoPub.track.replaceTrack(processedVideoTrack)
        if (defaultTrack && defaultTrack !== processedVideoTrack) {
          defaultTrack.stop() // Bersihkan track default duplikat untuk hemat resource
        }
        console.log('[MediaProcessor] Video track berhasil digantikan ke Canvas Stream (Zero-Blink)')
      }
    }

    // 2. Ganti Audio Track di LiveKit ke DSP Stream
    const audioPub = room.localParticipant.getTrackPublication(Track.Source.Microphone)
    if (audioPub && audioPub.track) {
      const processedAudioTrack = audioDestinationNode?.stream?.getAudioTracks()[0]
      if (processedAudioTrack) {
        const defaultTrack = audioPub.track.mediaStreamTrack
        await audioPub.track.replaceTrack(processedAudioTrack)
        if (defaultTrack && defaultTrack !== processedAudioTrack) {
          defaultTrack.stop() // Bersihkan track default duplikat
        }
        console.log('[MediaProcessor] Audio track berhasil digantikan ke DSP Stream')
      }
    }
  } catch (err) {
    console.error('Gagal menerapkan processed tracks ke LiveKit:', err)
  }
}

async function joinMeeting() {
  // Jangan hentikan media processor, melainkan transisikan secara zero-blink!
  if (meetStore.isMicEnabled !== tempMicEnabled.value) {
    meetStore.toggleMic()
  }
  if (meetStore.isCameraEnabled !== tempCameraEnabled.value) {
    meetStore.toggleCamera()
  }

  hasJoined.value = true
  connectionAttempted.value = true

  try {
    await roomComposable.connect(meetStore.livekitUrl, meetStore.token)

    // Pasang listeners reaktif di LiveKit Room untuk hot-swap track otomatis saat mute/unmute
    const room = roomComposable.lkRoom.value
    if (room) {
      // Sinkronkan device id
      if (tempCameraEnabled.value && selectedCameraId.value) {
        await room.switchActiveDevice('videoinput', selectedCameraId.value)
      }
      if (tempMicEnabled.value && selectedMicrophoneId.value) {
        await room.switchActiveDevice('audioinput', selectedMicrophoneId.value)
      }

      room.on(RoomEvent.LocalVideoTrackPublished, async (publication) => {
        const processedVideoTrack = outputCanvas.captureStream(30).getVideoTracks()[0]
        if (processedVideoTrack && publication.track) {
          const defaultTrack = publication.track.mediaStreamTrack
          await publication.track.replaceTrack(processedVideoTrack)
          if (defaultTrack && defaultTrack !== processedVideoTrack) {
            defaultTrack.stop()
          }
        }
      })

      room.on(RoomEvent.LocalAudioTrackPublished, async (publication) => {
        const processedAudioTrack = audioDestinationNode?.stream?.getAudioTracks()[0]
        if (processedAudioTrack && publication.track) {
          const defaultTrack = publication.track.mediaStreamTrack
          await publication.track.replaceTrack(processedAudioTrack)
          if (defaultTrack && defaultTrack !== processedAudioTrack) {
            defaultTrack.stop()
          }
        }
      })
    }

    // Lakukan replace track pertama kali pasca-koneksi
    setTimeout(async () => {
      await applyProcessedTracksToLiveKit()
    }, 1200)

    if (meetStore.isHost && meetStore.room?.id) {
      try {
        const res = await axios.post('/api/meetings', { room_id: meetStore.room.id })
        if (res.data.success && res.data.data) {
          meetStore.setSessionId(res.data.data.id)
        }
      } catch (err) {
        console.error('Failed to start meeting session:', err)
      }
    }

    // Mulai durasi rapat & rekaman
    timerInterval = setInterval(() => {
      meetingDuration.value++
      if (meetStore.isRecording) {
        recordingDuration.value++
      } else {
        recordingDuration.value = 0
      }
    }, 1000)

    notificationStore.showSuccess('Berhasil', 'Anda telah bergabung ke dalam rapat!')
  } catch (err) {
    notificationStore.showError('Koneksi Gagal', `Gagal terhubung ke server rapat: ${err.message}`)
    hasJoined.value = false
    await loadDevices()
    await startMediaProcessor()
  }
}

// --- Lifecycle & Restore Sesi ---
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('beforeunload', handleWindowUnload)
  preloadBackgroundImages()

  setTimeout(async () => {
    // Jalankan restorasi token jika reload atau navigasi langsung
    if (!meetStore.token || !meetStore.livekitUrl) {
      const slug = route.params.slug
      if (slug) {
        try {
          const res = await axios.post('/api/tokens/join', {
            room_slug: slug.trim()
          })
          if (res.data.success) {
            const publicLiveKitUrl = import.meta.env.VITE_LIVEKIT_URL || res.data.data.livekit_url
            meetStore.setRoom(res.data.data.room, res.data.data.token, publicLiveKitUrl, res.data.data.is_host)
          } else {
            notificationStore.showError('Gagal', 'Gagal memulihkan sesi room.')
            router.push(`/?join=${slug}`)
            return
          }
        } catch (err) {
          if (err.response?.status === 403) {
            notificationStore.showWarning('Perlu Password', 'Room ini dilindungi sandi. Silakan bergabung melalui lobi.')
            router.push(`/?join=${slug}`)
          } else {
            notificationStore.showError('Gagal', err.response?.data?.message ?? 'Sesi room tidak ditemukan.')
            router.push('/')
          }
          return
        }
      } else {
        router.push('/')
        return
      }
    }

    // Inisialisasi awal switch lobby
    tempMicEnabled.value = meetStore.isMicEnabled
    tempCameraEnabled.value = meetStore.isCameraEnabled

    // Load segmentasi secara proaktif jika background awal bukan none
    if (meetStore.virtualBackground !== 'none') {
      await initSelfieSegmentation()
    }

    await loadDevices()
    await startMediaProcessor()
  }, 400)
})

// Watchers untuk efek media
watch(() => meetStore.virtualBackground, async (newVal) => {
  if (newVal !== 'none' && !isMediaPipeLoaded.value) {
    await initSelfieSegmentation()
  }
})

watch(() => meetStore.isNoiseSuppressionEnabled, () => {
  updateAudioDSPConnections()
})

watch(() => meetStore.isCrispVoiceEnabled, () => {
  updateAudioDSPConnections()
})

watch(() => meetStore.cameraResolution, async () => {
  // Mulai ulang processor untuk meresolusi kamera baru baik di lobi maupun rapat aktif
  await startMediaProcessor()
})

watch(() => meetStore.messages.length, () => {
  if (!showChat.value) {
    unreadCount.value++
  }
})

watch(showChat, (val) => {
  if (val) {
    meetStore.showParticipants = false
    unreadCount.value = 0
  }
})

watch(() => meetStore.showParticipants, (val) => {
  if (val) {
    showChat.value = false
  }
})

// --- Actions ---
async function sendChat(text) {
  await roomComposable.sendChatMessage(text)
}

async function leaveRoom() {
  if (meetStore.isHost && meetStore.currentSessionId) {
    try {
      await axios.put(`/api/meetings/${meetStore.currentSessionId}/end`, {
        participant_count: Math.max(1, meetStore.participantCount)
      })
    } catch (err) {
      console.error('Failed to end meeting session:', err)
    }
  }
  await roomComposable.disconnect()
  router.push('/')
}

async function reconnect() {
  await roomComposable.connect(meetStore.livekitUrl, meetStore.token)
}

function copyRoomLink() {
  const url = `${window.location.origin}/?join=${meetStore.room?.slug}`
  navigator.clipboard.writeText(url)
  notificationStore.showSuccess('Berhasil', 'Link room tersalin!')
}

async function toggleRaiseHand() {
  const raised = !myHandRaised.value
  await roomComposable.sendRaiseHand(raised)
}

async function sendReactionEmoji(emoji) {
  await roomComposable.sendReaction(emoji)
}

async function toggleRecording() {
  const active = !meetStore.isRecording
  await roomComposable.sendRecordingState(active)
}

function toggleParticipantsPanel() {
  meetStore.showParticipants = !meetStore.showParticipants
}

async function changeResolution(presetName) {
  await roomComposable.changeCameraResolution(presetName)
}

async function muteRemoteParticipant(identity) {
  await roomComposable.sendMuteParticipant(identity)
  notificationStore.showSuccess('Berhasil', `Sinyal mute telah dikirim ke peserta`)
}

async function lowerRemoteHand(identity) {
  await roomComposable.sendLowerHand(identity)
  notificationStore.showSuccess('Berhasil', `Sinyal menurunkan tangan telah dikirim ke peserta`)
}

async function muteAllParticipants() {
  await roomComposable.sendMuteAll(pinnedId.value)
}

async function lowerAllHands() {
  const raised = meetStore.participants.filter(p => p.isHandRaised && !p.isLocal)
  for (const p of raised) {
    await roomComposable.sendLowerHand(p.identity)
  }
  notificationStore.showSuccess('Berhasil', `Semua tangan peserta telah diturunkan`)
}

function formatDuration(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  const paddedHrs = String(hrs).padStart(2, '0')
  const paddedMins = String(mins).padStart(2, '0')
  const paddedSecs = String(secs).padStart(2, '0')
  
  if (hrs > 0) {
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`
  }
  return `${paddedMins}:${paddedSecs}`
}

function handleWindowUnload() {
  if (meetStore.isHost && meetStore.currentSessionId) {
    const url = `/api/meetings/${meetStore.currentSessionId}/end`
    const payload = JSON.stringify({
      participant_count: Math.max(1, meetStore.participantCount)
    })
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
    } catch (e) {
      console.error('Failed to send unload beacon:', e)
    }
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('beforeunload', handleWindowUnload)
  if (timerInterval) clearInterval(timerInterval)
  stopLocalPreview()
  if (meetStore.isConnected) {
    if (meetStore.isHost && meetStore.currentSessionId) {
      axios.put(`/api/meetings/${meetStore.currentSessionId}/end`, {
        participant_count: Math.max(1, meetStore.participantCount)
      }).catch(err => console.error('Failed to end session on unmount:', err))
    }
    roomComposable.disconnect()
  }
})
</script>

<style scoped>
/* Tile pagination transition */
.tile-fade-enter-active,
.tile-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tile-fade-enter-from,
.tile-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.tile-fade-move {
  transition: transform 0.3s ease;
}

/* Reactions Floating Animation */
@keyframes reaction-float {
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  15% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(-80px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-120px) scale(0.9);
    opacity: 0;
  }
}

.animate-reaction-float {
  animation: reaction-float 4s forwards cubic-bezier(0.1, 0.8, 0.3, 1);
}

/* Custom select reset & styling for professional Carets */
.select-style {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: none !important;
}
.select-style::-ms-expand {
  display: none !important;
}
.select-style option {
  background-color: #1e1f22 !important;
  color: #f3f4f6 !important;
  font-weight: 600;
  padding: 12px;
}
</style>
