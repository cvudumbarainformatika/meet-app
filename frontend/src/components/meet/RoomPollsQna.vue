<template>
  <Transition name="slide-polls">
    <div
      v-if="show"
      class="absolute top-0 right-0 bottom-0 w-[420px] max-w-full flex flex-col z-20 transition-all duration-300"
      :style="solid
        ? 'background: var(--background); border-left: 1px solid var(--border);'
        : 'background: hsl(var(--background) / 0.85); backdrop-filter: blur(20px); border-left: 1px solid var(--border);'"
    >
      <!-- Header Sidebar -->
      <div class="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-1.5">
          <Vote class="h-4 w-4 text-primary" />
          <h3 class="text-foreground text-sm font-semibold">Interaksi Premium</h3>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Toggle Blur/Solid -->
          <button
            @click="emit('update:solid', !solid)"
            :title="solid ? 'Aktifkan Blur' : 'Matikan Blur (Solid)'"
            class="h-7 w-7 flex items-center justify-center rounded-lg transition-all"
            :class="solid ? 'bg-primary/30 text-primary' : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground'"
          >
            <Layers2 class="h-3.5 w-3.5" />
          </button>
          <!-- Close -->
          <button
            @click="emit('close')"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Tab Selector -->
      <div class="flex border-b border-border bg-white/5 flex-shrink-0">
        <button
          @click="activeTab = 'polls'"
          class="flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all"
          :class="activeTab === 'polls' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          <Vote class="h-3.5 w-3.5" />
          Jajak Pendapat
        </button>
        <button
          @click="activeTab = 'qna'"
          class="flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all"
          :class="activeTab === 'qna' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          <HelpCircle class="h-3.5 w-3.5" />
          Tanya Jawab
          <span v-if="unansweredQnaCount > 0" class="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <!-- ==================== TAB 1: JAJAK PENDAPAT ==================== -->
        <div v-if="activeTab === 'polls'" class="space-y-4">
          <!-- Tombol Buat Baru (Host Only) -->
          <div v-if="meetStore.isHost && !isCreatingPoll" class="flex justify-center pb-2">
            <button
              @click="startCreatingPoll"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-semibold text-xs"
            >
              <Plus class="h-4 w-4" />
              Buat Jajak Pendapat Baru
            </button>
          </div>

          <!-- Formulir Pembuatan Polling (Host Only) -->
          <div
            v-if="isCreatingPoll"
            class="p-4 rounded-xl border border-border/80 bg-card/40 backdrop-blur-md space-y-3.5 transition-all"
          >
            <div class="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Plus class="h-3.5 w-3.5 text-primary" />
              Baru Jajak Pendapat
            </div>

            <div>
              <label class="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Pertanyaan</label>
              <textarea
                v-model="newPoll.question"
                rows="2"
                placeholder="Apa yang ingin Anda tanyakan?"
                class="w-full text-sm bg-background border border-border hover:border-primary/40 focus:border-primary rounded-lg p-2.5 outline-none text-foreground transition-all resize-none"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase font-bold text-muted-foreground block">Pilihan Opsi</label>
              <div v-for="(opt, idx) in newPoll.options" :key="idx" class="flex items-center gap-2">
                <input
                  v-model="newPoll.options[idx]"
                  type="text"
                  :placeholder="`Opsi ${idx + 1}`"
                  class="flex-1 text-xs bg-background border border-border hover:border-primary/40 focus:border-primary rounded-lg px-2.5 py-2 outline-none text-foreground transition-all"
                />
                <button
                  v-if="newPoll.options.length > 2"
                  @click="removePollOption(idx)"
                  class="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 border border-border/50 hover:border-red-500/40 transition-all flex-shrink-0"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                v-if="newPoll.options.length < 6"
                @click="addPollOption"
                class="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline mt-1 bg-transparent border-none cursor-pointer"
              >
                <Plus class="h-3.5 w-3.5" /> Tambah Pilihan
              </button>
            </div>

            <!-- Toggle Anonim -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-xs text-muted-foreground">Kirim sebagai Anonim</span>
              <q-toggle
                v-model="newPoll.isAnonymous"
                dense
                color="primary"
              />
            </div>

            <div class="flex items-center gap-2 pt-2">
              <button
                @click="cancelCreatingPoll"
                class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground border border-border transition-all"
              >
                Batal
              </button>
              <button
                @click="launchPoll"
                :disabled="!isPollValid"
                class="flex-1 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Luncurkan 🚀
              </button>
            </div>
          </div>

          <!-- List Jajak Pendapat -->
          <div v-if="meetStore.polls.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <Vote class="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground text-xs">Belum ada Jajak Pendapat aktif</p>
          </div>

          <div
            v-for="poll in sortedPolls"
            :key="poll.id"
            class="p-4 rounded-xl border border-border/60 bg-card/25 backdrop-blur-md space-y-3"
          >
            <!-- Badge & Info -->
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase"
                :class="poll.isClosed ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-green-500/20 text-green-500 border border-green-500/20 animate-pulse'"
              >
                {{ poll.isClosed ? 'Selesai' : 'Aktif' }}
              </span>
              <span class="text-[10px] text-muted-foreground flex items-center gap-1">
                <LockKeyhole v-if="poll.isAnonymous" class="h-3 w-3" />
                {{ poll.isAnonymous ? 'Anonim' : `Oleh: ${poll.creator}` }}
              </span>
            </div>

            <!-- Pertanyaan -->
            <div class="text-sm font-semibold text-foreground break-words leading-relaxed">
              {{ poll.question }}
            </div>

            <!-- TV Show Premium Vertical Bar Chart -->
            <div
              v-if="hasVoted(poll) || poll.isClosed"
              class="relative h-44 bg-black/40 border border-white/5 rounded-2xl p-4 flex items-end justify-around gap-2.5 overflow-hidden group shadow-inner"
            >
              <!-- Background Grid Lines layaknya TV kuis -->
              <div class="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                <div class="border-b border-white/40 w-full h-0"></div>
                <div class="border-b border-white/40 w-full h-0"></div>
                <div class="border-b border-white/40 w-full h-0"></div>
                <div class="border-b border-white/40 w-full h-0"></div>
              </div>

              <!-- Bar per opsi -->
              <div
                v-for="(opt, oIdx) in poll.options"
                :key="opt.id"
                class="flex flex-col items-center justify-end h-full flex-1 min-w-0 z-10"
              >
                <!-- Crown/Star Icon for Winner -->
                <div class="h-5 flex items-center justify-center mb-1">
                  <Crown
                    v-if="isWinner(poll, opt.id) && getTotalVotes(poll) > 0"
                    class="h-4.5 w-4.5 text-amber-400 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  />
                </div>

                <!-- Persentase Melayang -->
                <div class="text-[10px] font-extrabold text-foreground mb-1.5 transition-all duration-500 scale-95 group-hover:scale-100">
                  {{ getPercentage(poll, opt) }}%
                </div>

                <!-- Batang Vertikal Kuis TV (Elastic Transition) -->
                <div class="w-full max-w-[28px] bg-white/5 border border-white/10 rounded-t-xl relative overflow-hidden flex items-end h-[68%]">
                  <div
                    class="w-full rounded-t-lg bg-gradient-to-t from-primary/45 to-primary transition-all duration-[1200ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-[0_-4px_15px_rgba(var(--q-primary),0.4)] relative"
                    :style="{ height: `${getPercentage(poll, opt)}%` }"
                  >
                    <!-- Efek Gelombang Kilatan Cahaya Vertikal -->
                    <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>

                <!-- Label Pendek di Bawah -->
                <div
                  class="text-[9px] text-muted-foreground/80 font-bold mt-2 truncate w-full text-center"
                  :class="{ 'text-primary font-extrabold': userSelectedOptionId(poll) === opt.id }"
                >
                  Opsi {{ oIdx + 1 }}
                </div>
              </div>
            </div>

            <!-- List Opsi / Progres Suara -->
            <div class="space-y-2">
              <div v-for="opt in poll.options" :key="opt.id" class="relative overflow-hidden rounded-xl border transition-all duration-300">
                <!-- Progress Bar Background (Animasi Smooth Width) -->
                <div
                  v-if="hasVoted(poll) || poll.isClosed"
                  class="absolute top-0 left-0 bottom-0 bg-primary/15 transition-all duration-700 ease-out"
                  :style="{ width: `${getPercentage(poll, opt)}%` }"
                ></div>

                <!-- Tampilan Konten Opsi -->
                <div class="relative px-3.5 py-3 flex items-center justify-between gap-3 text-xs">
                  <!-- Mode Belum Memilih & Terbuka: Tombol Klik Vote -->
                  <button
                    v-if="!hasVoted(poll) && !poll.isClosed"
                    @click="handleVote(poll.id, opt.id)"
                    class="w-full text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between"
                  >
                    <span>{{ opt.text }}</span>
                    <span class="opacity-0 group-hover:opacity-100 text-[10px] text-primary">Klik Pilih &rarr;</span>
                  </button>

                  <!-- Mode Sudah Memilih / Tertutup: Tampilkan Progres -->
                  <template v-else>
                    <div class="flex items-center gap-2 font-medium text-foreground min-w-0">
                      <Check
                        v-if="userSelectedOptionId(poll) === opt.id"
                        class="h-3.5 w-3.5 text-primary flex-shrink-0"
                      />
                      <span class="truncate">{{ opt.text }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0 font-bold text-muted-foreground">
                      <span class="text-foreground text-xs">{{ getPercentage(poll, opt) }}%</span>
                      <span class="text-[10px] text-muted-foreground/60">({{ opt.votes.length }})</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Total Suara & Tombol Tutup (Host Only) -->
            <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div class="text-[11px] text-muted-foreground font-semibold">
                Total Suara: {{ getTotalVotes(poll) }}
              </div>
              <button
                v-if="meetStore.isHost && !poll.isClosed"
                @click="handleClosePoll(poll.id)"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 text-[10px] font-bold transition-all ml-auto"
              >
                <Lock class="h-3 w-3" />
                Tutup Voting
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== TAB 2: TANYA JAWAB (Q&A) ==================== -->
        <div v-else-if="activeTab === 'qna'" class="space-y-4 pb-20">
          <div v-if="meetStore.qna.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle class="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground text-xs">Belum ada pertanyaan</p>
          </div>

          <div
            v-for="item in sortedQna"
            :key="item.id"
            class="p-4 rounded-xl border border-border/60 bg-card/25 backdrop-blur-md space-y-3 transition-all"
          >
            <!-- Info Pengirim -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-foreground leading-tight">{{ item.sender }}</span>
                <span class="text-[9px] text-muted-foreground/70">{{ formatTime(item.timestamp) }}</span>
              </div>

              <!-- Tombol Upvote -->
              <button
                @click="handleUpvote(item.id)"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
                :class="hasUpvoted(item)
                  ? 'bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/20'
                  : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border-border'"
              >
                <ThumbsUp class="h-3.5 w-3.5" />
                <span>{{ item.upvotes.length }}</span>
              </button>
            </div>

            <!-- Isi Pertanyaan -->
            <p class="text-xs text-foreground/95 break-words leading-relaxed pl-0.5">
              {{ item.text }}
            </p>

            <!-- Tampilan Jawaban Host jika sudah dijawab -->
            <div
              v-if="item.isAnswered"
              class="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1.5 animate-fade-in"
            >
              <div class="flex items-center gap-1.5 text-[10px] font-extrabold text-primary uppercase tracking-wide">
                <Check class="h-3.5 w-3.5" />
                Telah Dijawab Live
              </div>
              <p class="text-xs text-foreground/90 leading-relaxed italic">
                "{{ item.answerText }}"
              </p>
            </div>

            <!-- Panel Aksi Jawab Host (Host Only & belum dijawab) -->
            <div v-else-if="meetStore.isHost" class="pt-1.5">
              <div v-if="answeringQuestionId !== item.id">
                <button
                  @click="openAnswerForm(item.id)"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-extrabold transition-all"
                >
                  <MessageSquare class="h-3 w-3" />
                  Jawab Pertanyaan Ini
                </button>
              </div>

              <!-- Input Jawaban -->
              <div v-else class="space-y-2 bg-background/50 p-2.5 rounded-lg border border-border/80">
                <input
                  v-model="answerInput"
                  type="text"
                  placeholder="Ketik jawaban Anda..."
                  class="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-2 outline-none text-foreground focus:border-primary transition-all"
                  @keyup.enter="submitAnswer(item.id)"
                />
                <div class="flex items-center gap-1.5 justify-end">
                  <button
                    @click="closeAnswerForm"
                    class="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all bg-transparent border-none cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    @click="submitAnswer(item.id)"
                    :disabled="!answerInput.trim()"
                    class="px-3 py-1 text-[10px] font-extrabold bg-primary text-primary-foreground rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Area Tulis Pertanyaan Baru (Khusus Tab Q&A) -->
      <div v-if="activeTab === 'qna'" class="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background flex-shrink-0 z-10">
        <div class="flex items-center gap-2 bg-background hover:bg-card rounded-xl px-4 py-2.5 transition-colors border border-border focus-within:border-primary/40">
          <input
            v-model="questionInput"
            @keyup.enter="handleAsk"
            type="text"
            placeholder="Tanyakan sesuatu..."
            class="flex-1 bg-transparent text-foreground text-sm placeholder-muted-foreground outline-none"
          />
          <button
            @click="handleAsk"
            :disabled="!questionInput.trim()"
            class="h-7 w-7 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground transition-all flex-shrink-0"
          >
            <Send class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMeetStore } from '@/stores/meet'
import { useRoom } from '@/composables/useRoom'
import { Vote, HelpCircle, Layers2, X, Plus, Trash2, ThumbsUp, Lock, Check, Send, LockKeyhole, MessageSquare, Crown } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  solid: Boolean,
})

const emit = defineEmits(['close', 'update:solid'])

const meetStore = useMeetStore()
const roomServices = useRoom()

const activeTab = ref('polls')

// ==================== STATE JAJAK PENDAPAT ====================
const isCreatingPoll = ref(false)
const newPoll = ref({
  question: '',
  options: ['', ''],
  isAnonymous: false
})

const sortedPolls = computed(() => {
  // Yang aktif di atas, disusul yang ditutup
  return [...meetStore.polls].sort((a, b) => {
    if (a.isClosed !== b.isClosed) {
      return a.isClosed ? 1 : -1
    }
    return b.id - a.id // Terbaru di atas
  })
})

const isPollValid = computed(() => {
  if (!newPoll.value.question.trim()) return false
  const validOpts = newPoll.value.options.filter(o => o.trim())
  return validOpts.length >= 2
})

function startCreatingPoll() {
  newPoll.value = {
    question: '',
    options: ['', ''],
    isAnonymous: false
  }
  isCreatingPoll.value = true
}

function cancelCreatingPoll() {
  isCreatingPoll.value = false
}

function addPollOption() {
  if (newPoll.value.options.length < 6) {
    newPoll.value.options.push('')
  }
}

function removePollOption(index) {
  if (newPoll.value.options.length > 2) {
    newPoll.value.options.splice(index, 1)
  }
}

async function launchPoll() {
  if (!isPollValid.value) return

  const creatorName = roomServices.lkRoom.value?.localParticipant?.name || 'Host'
  const poll = {
    id: Date.now(),
    creator: creatorName,
    question: newPoll.value.question.trim(),
    options: newPoll.value.options
      .filter(o => o.trim())
      .map((txt, idx) => ({
        id: `opt-${idx}-${Date.now()}`,
        text: txt.trim(),
        votes: []
      })),
    isClosed: false,
    isAnonymous: newPoll.value.isAnonymous
  }

  await roomServices.sendPollCreate(poll)
  isCreatingPoll.value = false
}

function handleVote(pollId, optionId) {
  roomServices.sendPollVote(pollId, optionId)
}

function handleClosePoll(pollId) {
  roomServices.sendPollClose(pollId)
}

// Helpers Jajak Pendapat
const getLocalIdentity = computed(() => {
  return roomServices.lkRoom.value?.localParticipant?.identity || ''
})

function hasVoted(poll) {
  const me = getLocalIdentity.value
  return poll.options.some(opt => opt.votes.includes(me))
}

function userSelectedOptionId(poll) {
  const me = getLocalIdentity.value
  const found = poll.options.find(opt => opt.votes.includes(me))
  return found ? found.id : null
}

function getTotalVotes(poll) {
  return poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
}

function getPercentage(poll, option) {
  const total = getTotalVotes(poll)
  if (total === 0) return 0
  return Math.round((option.votes.length / total) * 100)
}

function isWinner(poll, optionId) {
  const maxVotes = Math.max(...poll.options.map(o => o.votes.length))
  if (maxVotes === 0) return false
  const option = poll.options.find(o => o.id === optionId)
  return option && option.votes.length === maxVotes
}

// ==================== STATE TANYA JAWAB (Q&A) ====================
const questionInput = ref('')
const answeringQuestionId = ref(null)
const answerInput = ref('')

const sortedQna = computed(() => {
  // Diurutkan berdasarkan jumlah upvotes terbanyak, lalu timestamp
  return [...meetStore.qna].sort((a, b) => {
    if (a.upvotes.length !== b.upvotes.length) {
      return b.upvotes.length - a.upvotes.length
    }
    return new Date(a.timestamp) - new Date(b.timestamp)
  })
})

const unansweredQnaCount = computed(() => {
  return meetStore.qna.filter(q => !q.isAnswered).length
})

async function handleAsk() {
  if (!questionInput.value.trim()) return

  const senderName = roomServices.lkRoom.value?.localParticipant?.name || 'User'
  const senderId = getLocalIdentity.value

  const question = {
    id: `qna-${Date.now()}`,
    sender: senderName,
    senderId: senderId,
    text: questionInput.value.trim(),
    upvotes: [],
    isAnswered: false,
    answerText: '',
    timestamp: new Date()
  }

  await roomServices.sendQnaAsk(question)
  questionInput.value = ''
}

function handleUpvote(questionId) {
  roomServices.sendQnaUpvote(questionId)
}

function hasUpvoted(qnaItem) {
  const me = getLocalIdentity.value
  return qnaItem.upvotes.includes(me)
}

function openAnswerForm(questionId) {
  answeringQuestionId.value = questionId
  answerInput.value = ''
}

function closeAnswerForm() {
  answeringQuestionId.value = null
  answerInput.value = ''
}

async function submitAnswer(questionId) {
  if (!answerInput.value.trim()) return
  await roomServices.sendQnaAnswer(questionId, answerInput.value.trim())
  closeAnswerForm()
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.slide-polls-enter-active,
.slide-polls-leave-active {
  transition: all 0.25s ease;
}

.slide-polls-enter-from,
.slide-polls-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 3s infinite linear;
}
</style>
