<template>
  <!-- =========================================================
    RoomPage — Halaman meeting video call
    Layout: Video grid fullscreen + sidebar chat + control bar
  ========================================================= -->
  <div class="h-screen bg-slate-950 flex flex-col overflow-hidden">

    <!-- ── Header Bar ── -->
    <div class="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-slate-900/80 border-b border-white/5 flex-shrink-0 gap-2">
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
          <Video class="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h1 class="text-white text-sm font-semibold leading-none">{{ meetStore.room?.name ?? 'Meeting' }}</h1>
          <span class="text-slate-500 text-xs">{{ meetStore.participantCount }} peserta</span>
        </div>
      </div>

      <!-- Center section: REC + Timer -->
      <div class="flex items-center gap-3">
        <!-- REC Blinking Indicator -->
        <div
          v-if="meetStore.isRecording"
          class="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full text-red-500 text-xs font-semibold animate-pulse"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
          <span>REC {{ formatDuration(recordingDuration) }}</span>
        </div>
        
        <!-- Meeting Timer -->
        <div class="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-slate-400 text-xs font-medium">
          <Clock class="h-3.5 w-3.5 text-indigo-400" />
          <span>{{ formatDuration(meetingDuration) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Copy link -->
        <button
          @click="copyRoomLink"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all"
          title="Bagikan"
        >
          <Copy class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Bagikan</span>
        </button>

        <!-- Connection status -->
        <div class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg" :class="statusClass" :title="statusText">
          <div class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></div>
          <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">{{ statusText }}</span>
        </div>

        <!-- Toggle participants list -->
        <button
          @click="toggleParticipantsPanel"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all"
          :class="{ 'bg-indigo-600/20 text-indigo-400': meetStore.showParticipants }"
          title="Peserta"
        >
          <Users class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Peserta</span>
        </button>

        <!-- Toggle chat -->
        <button
          @click="showChat = !showChat"
          class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-all"
          :class="{ 'bg-indigo-600/20 text-indigo-400': showChat }"
          title="Chat"
        >
          <MessageSquare class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Chat</span>
          <span v-if="unreadCount > 0" class="bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5 ml-0.5">
            {{ unreadCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Main Area: Video + Chat ── -->
    <div class="flex-1 flex overflow-hidden min-h-0 relative">

      <!-- Video Grid -->
      <div class="flex-1 p-3 overflow-hidden flex flex-col min-h-0 min-w-0">
        <!-- Connecting state -->
        <div
          v-if="!meetStore.isConnected"
          class="flex-1 flex flex-col items-center justify-center text-center"
        >
          <div class="h-16 w-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4 animate-pulse">
            <Video class="h-8 w-8 text-indigo-400" />
          </div>
          <p class="text-white font-semibold mb-1">{{ meetStore.connectionState === 'connecting' ? 'Menghubungkan...' : 'Terputus' }}</p>
          <p class="text-slate-500 text-sm">Mohon tunggu sebentar</p>
          <button
            v-if="meetStore.connectionState === 'disconnected' && connectionAttempted"
            @click="reconnect"
            class="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Participants Grid -->
        <div
          v-else
          class="flex-1 h-full flex flex-col gap-3 min-h-0 w-full"
        >
          <!-- Area Video Pinned -->
          <div v-if="pinnedParticipant" class="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
            <!-- Wrapper utama video yang dipin -->
            <div class="flex-1 overflow-hidden min-h-0 rounded-xl flex flex-col">
              <ParticipantTile
                :participant="pinnedParticipant"
                :is-pinned="true"
                class="flex-1 w-full h-full"
                @pin="pinnedId = null"
              />
            </div>
            
            <!-- Sidebar / Horizontal bar untuk pinned mode -->
            <div class="w-full md:w-[240px] flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pr-1 pb-1">
              <ParticipantTile
                v-for="p in unpinnedParticipants"
                :key="p.identity"
                :participant="p"
                :is-pinned="false"
                class="w-[160px] md:w-full aspect-video flex-shrink-0"
                @pin="pinnedId = p.identity"
              />
            </div>
          </div>

          <!-- Area Unpinned (Gallery + Pagination) -->
          <div
            v-else
            class="flex-1 flex flex-col min-h-0 w-full relative"
          >
            <!-- Tombol Prev Page -->
            <button
              v-if="totalPages > 1"
              @click="prevPage"
              :disabled="currentPage === 1"
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-8 flex items-center justify-center bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-r-lg transition-all"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>

            <!-- Tombol Next Page -->
            <button
              v-if="totalPages > 1"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-8 flex items-center justify-center bg-black/50 hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-l-lg transition-all"
            >
              <ChevronRight class="h-5 w-5" />
            </button>

            <!-- Gallery Grid Paginated -->
            <div class="flex-1 flex overflow-hidden p-2">
              <div class="m-auto w-full flex flex-wrap justify-center gap-3">
                <TransitionGroup name="tile-fade">
                  <ParticipantTile
                    v-for="p in paginatedParticipants"
                    :key="p.identity"
                    :participant="p"
                    :is-pinned="false"
                    class="aspect-video shadow-lg rounded-xl overflow-hidden transition-all duration-300"
                    :style="getTileStyle(paginatedParticipants.length)"
                    @pin="pinnedId = p.identity"
                  />
                </TransitionGroup>
              </div>
            </div>

            <!-- Page Indicator -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-2">
              <div
                v-for="i in totalPages"
                :key="i"
                @click="currentPage = i"
                class="h-1.5 rounded-full cursor-pointer transition-all duration-300"
                :class="currentPage === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Overlay (floating di atas video, bukan mendorong) -->
      <Transition name="slide-chat">
        <div
          v-if="showChat"
          class="absolute top-0 right-0 bottom-0 w-[420px] max-w-full flex flex-col z-20 transition-all duration-300"
          :style="chatSolid
            ? 'background: rgb(10,15,30); border-left: 1px solid rgba(255,255,255,0.08);'
            : 'background: rgba(15,23,42,0.85); backdrop-filter: blur(20px); border-left: 1px solid rgba(255,255,255,0.08);'"
        >
          <!-- Header Chat -->
          <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
              <MessageSquare class="h-4 w-4 text-indigo-400" />
              <h3 class="text-white text-sm font-semibold">Chat</h3>
              <span v-if="meetStore.messages.length > 0" class="text-slate-500 text-xs">({{ meetStore.messages.length }})</span>
            </div>
            <div class="flex items-center gap-1.5">
              <!-- Toggle Blur/Solid -->
              <button
                @click="chatSolid = !chatSolid"
                :title="chatSolid ? 'Aktifkan Blur' : 'Matikan Blur (Solid)'"
                class="h-7 w-7 flex items-center justify-center rounded-lg transition-all"
                :class="chatSolid ? 'bg-indigo-600/30 text-indigo-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'"
              >
                <Layers2 class="h-3.5 w-3.5" />
              </button>
              <!-- Close -->
              <button
                @click="showChat = false"
                class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="meetStore.messages.length === 0" class="flex flex-col items-center justify-center h-full text-center pb-8">
              <MessageSquare class="h-8 w-8 text-slate-700 mb-2" />
              <p class="text-slate-600 text-xs">Belum ada pesan</p>
            </div>
            <div
              v-for="msg in meetStore.messages"
              :key="msg.id"
              :class="msg.isSelf ? 'items-end' : 'items-start'"
              class="flex flex-col"
            >
              <span class="text-slate-500 text-[10px] mb-1 px-1">{{ msg.sender }}</span>
              <div
                :class="msg.isSelf
                  ? 'bg-indigo-600 text-white rounded-tl-2xl rounded-tr-sm rounded-bl-2xl'
                  : 'bg-white/10 text-slate-200 rounded-tr-2xl rounded-tl-sm rounded-br-2xl'"
                class="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed"
              >
                {{ msg.text }}
              </div>
              <span class="text-slate-600 text-[9px] mt-1 px-1">
                {{ formatTime(msg.timestamp) }}
              </span>
            </div>
          </div>

          <!-- Input -->
          <div class="p-4 border-t border-white/5 flex-shrink-0">
            <div class="flex items-center gap-2 bg-white/5 hover:bg-white/8 rounded-xl px-4 py-2.5 transition-colors border border-white/5 focus-within:border-indigo-500/40">
              <input
                v-model="chatInput"
                @keyup.enter="sendChat"
                type="text"
                placeholder="Ketik pesan..."
                class="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
              />
              <button
                @click="sendChat"
                :disabled="!chatInput.trim()"
                class="h-7 w-7 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all flex-shrink-0"
              >
                <Send class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Panel Daftar Peserta Overlay -->
      <Transition name="slide-chat">
        <div
          v-if="meetStore.showParticipants"
          class="absolute top-0 right-0 bottom-0 w-[420px] max-w-full flex flex-col z-20 transition-all duration-300"
          :style="chatSolid
            ? 'background: rgb(10,15,30); border-left: 1px solid rgba(255,255,255,0.08);'
            : 'background: rgba(15,23,42,0.85); backdrop-filter: blur(20px); border-left: 1px solid rgba(255,255,255,0.08);'"
        >
          <!-- Header Panel -->
          <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-indigo-400" />
              <h3 class="text-white text-sm font-semibold">Peserta</h3>
              <span class="text-slate-500 text-xs">({{ meetStore.participants.length }})</span>
            </div>
            <div class="flex items-center gap-1.5">
              <!-- Close -->
              <button
                @click="meetStore.showParticipants = false"
                class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="p-4 border-b border-white/5 flex-shrink-0">
            <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
              <Search class="h-4 w-4 text-slate-500" />
              <input
                v-model="participantSearch"
                type="text"
                placeholder="Cari peserta..."
                class="bg-transparent text-white text-xs outline-none flex-1 placeholder-slate-500"
              />
            </div>
          </div>

          <!-- Participants List -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="p in filteredParticipants"
              :key="p.identity"
              class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <!-- Avatar -->
                <div class="h-8 w-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-white text-xs font-semibold uppercase">
                  {{ p.name ? p.name.substring(0, 2) : '?' }}
                </div>
                <!-- Name + Roles -->
                <div class="flex flex-col min-w-0">
                  <span class="text-slate-200 text-xs font-medium truncate">
                    {{ p.name || p.identity }}
                    <span v-if="p.isLocal" class="text-slate-400 text-[10px] font-normal"> (Anda)</span>
                  </span>
                  <!-- Badge host / raise hand -->
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span v-if="p.isLocal && meetStore.isHost" class="text-[9px] font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Host</span>
                    <span v-else-if="!p.isLocal && p.identity === meetStore.room?.host_name" class="text-[9px] font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Host</span>
                    <span v-if="p.isHandRaised" class="text-[9px] font-medium bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <span>🙋</span> Angkat Tangan
                    </span>
                  </div>
                </div>
              </div>

              <!-- Participant Actions / Status -->
              <div class="flex items-center gap-2">
                <!-- Lower Hand button (only visible to Host for remote users when hand is raised) -->
                <button
                  v-if="meetStore.isHost && !p.isLocal && p.isHandRaised"
                  @click="lowerRemoteHand(p.identity)"
                  class="h-6 w-6 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 flex items-center justify-center transition-all mr-1"
                  title="Turunkan Tangan"
                >
                  <span class="text-xs">🤚</span>
                </button>

                <!-- Mute button (only visible to Host for remote users) -->
                <button
                  v-if="meetStore.isHost && !p.isLocal"
                  @click="muteRemoteParticipant(p.identity)"
                  class="h-6 w-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Matikan Mikrofon"
                >
                  <MicOff class="h-3.5 w-3.5" />
                </button>

                <!-- Status Icons (Mic/Cam) -->
                <div class="flex items-center gap-1">
                  <Mic v-if="p.isMicEnabled" class="h-3.5 w-3.5 text-slate-400" />
                  <MicOff v-else class="h-3.5 w-3.5 text-red-500/80" />
                  
                  <Video v-if="p.isCameraEnabled" class="h-3.5 w-3.5 text-slate-400" />
                  <VideoOff v-else class="h-3.5 w-3.5 text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Host Action (Mute All) -->
          <div
            v-if="meetStore.isHost"
            class="p-4 border-t border-white/5 flex-shrink-0 bg-slate-900/50"
          >
            <button
              @click="muteAllParticipants"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-transparent text-xs font-semibold transition-all mb-2"
            >
              <MicOff class="h-4 w-4" />
              Bisukan Semua Peserta
            </button>
            <button
              @click="lowerAllHands"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 hover:border-transparent text-xs font-semibold transition-all"
            >
              <span class="text-sm">🤚</span>
              Turunkan Semua Tangan
            </button>
          </div>
        </div>
      </Transition>

      <!-- Floating Emoji Reactions container -->
      <div class="fixed bottom-24 left-6 z-50 pointer-events-none flex flex-col gap-2">
        <TransitionGroup name="float-up">
          <div
            v-for="reaction in meetStore.reactions"
            :key="reaction.id"
            class="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md animate-reaction-float"
          >
            <span class="text-xl">{{ reaction.emoji }}</span>
            <span class="text-white text-[10px] font-medium pr-1">{{ reaction.sender }}</span>
          </div>
        </TransitionGroup>
      </div>
    </div>


    <!-- ── Control Bar ── -->
    <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2 sm:px-6 py-2 sm:py-4 bg-slate-900/80 border-t border-white/5 flex-shrink-0 z-20">

      <!-- Mic -->
      <ControlButton
        :active="meetStore.isMicEnabled"
        :icon-on="Mic"
        :icon-off="MicOff"
        label="Mikrofon"
        color="default"
        @toggle="roomComposable.toggleMic"
      />

      <!-- Camera -->
      <ControlButton
        :active="meetStore.isCameraEnabled"
        :icon-on="Camera"
        :icon-off="CameraOff"
        label="Kamera"
        color="default"
        @toggle="roomComposable.toggleCamera"
      />

      <!-- Screen Share -->
      <ControlButton
        :active="!meetStore.isScreenSharing"
        :icon-on="Monitor"
        :icon-off="MonitorOff"
        label="Screen Share"
        color="blue"
        @toggle="roomComposable.toggleScreenShare"
      />

      <!-- Raise Hand Button -->
      <button
        @click="toggleRaiseHand"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-lg"
        :class="myHandRaised
          ? 'bg-amber-600 border-amber-500 hover:bg-amber-500 text-white font-semibold shadow-amber-600/20'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-white/5'"
        title="Angkat atau turunkan tangan"
      >
        <span class="text-sm">🙋</span>
        <span class="text-xs font-semibold hidden md:inline">
          {{ myHandRaised ? 'Turunkan Tangan' : 'Angkat Tangan' }}
        </span>
      </button>

      <!-- Emoji Reactions Popover Button -->
      <div class="relative">
        <button
          @click="showReactions = !showReactions"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-lg"
          :class="showReactions ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400' : 'border-white/5'"
          title="Kirim emoji reaksi ke peserta lain"
        >
          <Smile class="h-4 w-4" />
          <span class="text-xs font-semibold hidden md:inline">Reaksi</span>
        </button>
        
        <!-- Reaction Emojis Grid -->
        <Transition name="fade">
          <div
            v-if="showReactions"
            class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-2xl p-2.5 shadow-2xl flex items-center gap-1.5 z-30 backdrop-blur-xl"
          >
            <button
              v-for="emoji in ['💖', '👍', '👏', '😂', '🎉', '😮']"
              :key="emoji"
              @click="sendReactionEmoji(emoji)"
              class="h-9 w-9 text-2xl hover:scale-125 transition-transform flex items-center justify-center rounded-lg hover:bg-white/5 active:scale-90"
            >
              {{ emoji }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Recording Button (Host Only) -->
      <button
        v-if="meetStore.isHost"
        @click="toggleRecording"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-lg"
        :class="meetStore.isRecording
          ? 'bg-red-600 border-red-500 hover:bg-red-500 text-white font-semibold animate-pulse shadow-red-600/20'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-white/5'"
        title="Mulai/Hentikan Rekam Meeting"
      >
        <div class="h-2 w-2 rounded-full bg-red-500" :class="{ 'bg-white animate-ping': meetStore.isRecording }" />
        <span class="text-xs font-semibold hidden md:inline">
          {{ meetStore.isRecording ? 'Hentikan Rekam' : 'Rekam' }}
        </span>
      </button>

      <!-- Mute All & Lower Hands Dropdown (Host Only) -->
      <div v-if="meetStore.isHost" class="relative group hidden sm:block">
        <button
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-white/5 transition-all shadow-lg"
          title="Kontrol Host"
        >
          <Shield class="h-4 w-4 text-indigo-400" />
          <span class="text-xs font-semibold hidden md:inline">Host</span>
        </button>
        
        <!-- Dropdown Menu -->
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1 z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 backdrop-blur-xl">
          <button
            @click="muteAllParticipants"
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-xs font-medium w-full text-left"
          >
            <MicOff class="h-4 w-4" />
            Bisukan Semua
          </button>
          <button
            @click="lowerAllHands"
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors text-xs font-medium w-full text-left"
          >
            <span class="text-base">🤚</span>
            Turunkan Semua Tangan
          </button>
        </div>
      </div>

      <!-- Spacer -->
      <div class="hidden sm:block w-px h-8 bg-white/10 mx-1 sm:mx-2" />

      <!-- Leave Button -->
      <button
        @click="leaveRoom"
        class="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/20"
        title="Tinggalkan Meeting"
      >
        <PhoneOff class="h-4 w-4" />
        <span class="hidden sm:inline">Tinggalkan</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Video, Copy, MessageSquare, X, Send, Mic, MicOff,
  Camera, CameraOff, Monitor, MonitorOff, PhoneOff,
  ChevronLeft, ChevronRight, Layers2, Users, Search, Smile, Clock, VideoOff, Shield
} from 'lucide-vue-next'
import { useMeetStore } from '@/stores/meet'
import { useRoom } from '@/composables/useRoom'
import ParticipantTile from '@/components/meet/ParticipantTile.vue'
import ControlButton from '@/components/meet/ControlButton.vue'
import { useNotificationStore } from '@/stores/notification'
import { api as axios } from '@/boot/axios'

const router = useRouter()
const route = useRoute()
const meetStore = useMeetStore()
const notificationStore = useNotificationStore()
const roomComposable = useRoom()

// --- State ---
const showChat = ref(false)
const chatInput = ref('')
const messagesContainer = ref(null)
const pinnedId = ref(null)
const connectionAttempted = ref(false)
const unreadCount = ref(0)
const currentPage = ref(1)
const chatSolid = ref(false)

// --- State Profesional Tambahan ---
const participantSearch = ref('')
const showReactions = ref(false)
const meetingDuration = ref(0)
const recordingDuration = ref(0)
let timerInterval = null

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
  // Lebar menyesuaikan jumlah agar bisa bertingkat dan terpusat (center)
  // Aspect ratio 16/9 dipertahankan oleh class 'aspect-video' di HTML
  if (count === 1) return { width: '100%', maxWidth: '1000px' }
  if (count === 2) return { width: 'calc(50% - 0.5rem)', maxWidth: '800px' } // 2 sejajar
  if (count === 3 || count === 4) return { width: 'calc(50% - 0.5rem)', maxWidth: '600px' } // 2 sejajar, otomatis baris ke-2 terpusat
  if (count >= 5 && count <= 6) return { width: 'calc(33.333% - 0.66rem)', maxWidth: '500px' } // 3 sejajar
  if (count >= 7 && count <= 8) return { width: 'calc(25% - 0.75rem)' } // 4 sejajar
  if (count >= 9 && count <= 12) return { width: 'calc(25% - 0.75rem)' } 
  // 13+ peserta (Thumbnail mode)
  return { width: 'calc(20% - 0.8rem)' } // 5 sejajar
}

// --- Connection Status ---
const statusClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-emerald-500/10 text-emerald-400'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
})

const statusDotClass = computed(() => {
  const state = meetStore.connectionState
  if (state === 'connected') return 'bg-emerald-400 animate-pulse'
  if (state === 'connecting' || state === 'reconnecting') return 'bg-amber-400 animate-pulse'
  return 'bg-red-400'
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

const filteredParticipants = computed(() => {
  if (!participantSearch.value.trim()) return meetStore.participants
  const query = participantSearch.value.toLowerCase().trim()
  return meetStore.participants.filter(p => {
    const name = (p.name || p.identity || '').toLowerCase()
    return name.includes(query)
  })
})

// --- Connect & Timer saat halaman dibuka ---
onMounted(async () => {
  // Pastikan ada token (dari store atau redirect dari lobby)
  if (!meetStore.token || !meetStore.livekitUrl) {
    notificationStore.showError('Gagal', 'Sesi room tidak ditemukan. Silakan join ulang.')
    router.push('/')
    return
  }

  connectionAttempted.value = true
  try {
    await roomComposable.connect(meetStore.livekitUrl, meetStore.token)
    
    // Mulai session di backend jika ini adalah host
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
  } catch (err) {
    notificationStore.showError('Koneksi Gagal', `Gagal terhubung: ${err.message}`)
  }

  // Timer interval durasi meeting
  timerInterval = setInterval(() => {
    meetingDuration.value++
    if (meetStore.isRecording) {
      recordingDuration.value++
    } else {
      recordingDuration.value = 0
    }
  }, 1000)
})

// --- Auto scroll chat ke bawah ---
watch(() => meetStore.messages.length, async () => {
  if (!showChat.value) {
    unreadCount.value++
    return
  }
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
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
async function sendChat() {
  if (!chatInput.value.trim()) return
  await roomComposable.sendChatMessage(chatInput.value)
  chatInput.value = ''
}

async function leaveRoom() {
  if (meetStore.isHost && meetStore.currentSessionId) {
    try {
      // Akhiri sesi dan simpan participant_count saat host keluar
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

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// --- Actions Profesional Baru ---
async function toggleRaiseHand() {
  const raised = !myHandRaised.value
  await roomComposable.sendRaiseHand(raised)
}

async function sendReactionEmoji(emoji) {
  await roomComposable.sendReaction(emoji)
  showReactions.value = false
}

async function toggleRecording() {
  const active = !meetStore.isRecording
  await roomComposable.sendRecordingState(active)
}

function toggleParticipantsPanel() {
  meetStore.showParticipants = !meetStore.showParticipants
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

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (meetStore.isConnected) {
    roomComposable.disconnect()
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

/* Fade Transition for Popover */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.95);
}
</style>
