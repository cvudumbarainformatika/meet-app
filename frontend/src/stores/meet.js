// =============================================================
// frontend/src/stores/meet.js
// Pinia store untuk state meeting (room + LiveKit)
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMeetStore = defineStore('meet', () => {
  // --- Room Info ---
  const room = ref(null)       // { id, name, slug, is_locked, host_name }
  const token = ref('')        // LiveKit JWT token
  const livekitUrl = ref('')   // ws://...
  const isHost = ref(false)
  const currentSessionId = ref(null) // ID sesi rapat dari backend (khusus Host)

  // --- Connection State ---
  const connectionState = ref('disconnected') // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  // --- Media State ---
  const isMicEnabled = ref(true)
  const isCameraEnabled = ref(true)
  const isScreenSharing = ref(false)
  const cameraResolution = ref('h540') // default qHD (540p)
  const isNoiseSuppressionEnabled = ref(false)
  const isCrispVoiceEnabled = ref(false)
  const virtualBackground = ref('none') // 'none' | 'blur' | 'office' | 'nature'

  // --- Participants ---
  const participants = ref([])
  const raisedHands = ref({})   // { identity: boolean }
  const isRecording = ref(false)
  const showParticipants = ref(false)
  const reactions = ref([])     // { id, emoji, sender, identity }

  // --- Chat ---
  const messages = ref([])

  // --- Whiteboard State ---
  const isWhiteboardActive = ref(false)
  const whiteboardHistory = ref([])

  // --- Polls & Q&A State ---
  const polls = ref([])
  const qna = ref([])
  const showPollsQna = ref(false)

  // --- Computed ---
  const isConnected = computed(() => connectionState.value === 'connected')
  const participantCount = computed(() => participants.value.length)

  // --- Actions ---
  function setRoom(roomData, tokenData, livekitWsUrl, hostStatus) {
    room.value = roomData
    token.value = tokenData
    
    // Safety check: ignore invalid string values like "undefined" or "null" or empty strings
    let resolvedUrl = livekitWsUrl
    if (resolvedUrl === 'undefined' || resolvedUrl === 'null' || !resolvedUrl) {
      resolvedUrl = '/livekit' // Fallback to safe relative path
    }
    
    if (resolvedUrl) {
      if (resolvedUrl.startsWith('/')) {
        // Relative path
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        resolvedUrl = `${protocol}//${window.location.host}${resolvedUrl}`
      } else if (resolvedUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Rewrite localhost to the actual IP/hostname of this server
        resolvedUrl = resolvedUrl.replace('localhost', window.location.hostname)
      } else if (resolvedUrl.includes('127.0.0.1') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Rewrite 127.0.0.1 to the actual IP/hostname of this server
        resolvedUrl = resolvedUrl.replace('127.0.0.1', window.location.hostname)
      } else if (resolvedUrl.includes('livekit') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !resolvedUrl.includes('.')) {
        // Rewrite internal Docker hostname 'livekit' to the current domain and use path /livekit
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        resolvedUrl = `${protocol}//${window.location.host}/livekit`
      }
    }
    
    livekitUrl.value = resolvedUrl
    isHost.value = hostStatus
  }

  function clearRoom() {
    room.value = null
    token.value = ''
    livekitUrl.value = ''
    isHost.value = false
    currentSessionId.value = null
    connectionState.value = 'disconnected'
    participants.value = []
    messages.value = []
    isMicEnabled.value = true
    isCameraEnabled.value = true
    isScreenSharing.value = false
    raisedHands.value = {}
    isRecording.value = false
    showParticipants.value = false
    isNoiseSuppressionEnabled.value = false
    isCrispVoiceEnabled.value = false
    virtualBackground.value = 'none'
    isWhiteboardActive.value = false
    whiteboardHistory.value = []
    polls.value = []
    qna.value = []
    showPollsQna.value = false
  }

  function setConnectionState(state) {
    connectionState.value = state
  }

  function setSessionId(id) {
    currentSessionId.value = id
  }

  function setParticipants(list) {
    participants.value = list
  }

  function setHandRaised(identity, raised) {
    raisedHands.value = { ...raisedHands.value, [identity]: raised }
  }

  function setRecording(active) {
    isRecording.value = active
  }

  function addMessage(msg) {
    messages.value.push({
      ...msg,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
    })
    // Keep last 200 messages
    if (messages.value.length > 200) {
      messages.value.splice(0, messages.value.length - 200)
    }
  }

  function toggleMic() {
    isMicEnabled.value = !isMicEnabled.value
  }

  function toggleCamera() {
    isCameraEnabled.value = !isCameraEnabled.value
  }

  function setScreenSharing(val) {
    isScreenSharing.value = val
  }

  function setCameraResolution(res) {
    cameraResolution.value = res
  }

  function setNoiseSuppression(val) {
    isNoiseSuppressionEnabled.value = val
  }

  function setCrispVoice(val) {
    isCrispVoiceEnabled.value = val
  }

  function setVirtualBackground(val) {
    virtualBackground.value = val
  }

  function toggleWhiteboard() {
    isWhiteboardActive.value = !isWhiteboardActive.value
  }

  function setWhiteboardActive(val) {
    isWhiteboardActive.value = val
  }

  function addWhiteboardAction(act) {
    whiteboardHistory.value.push(act)
  }

  function clearWhiteboardHistory() {
    whiteboardHistory.value = []
  }

  // --- Polls & Q&A Actions ---
  function addPoll(poll) {
    if (!polls.value.some(p => p.id === poll.id)) {
      polls.value = [...polls.value, poll]
    }
  }

  function votePoll(pollId, optionId, identity) {
    polls.value = polls.value.map(p => {
      if (p.id !== pollId) return p
      
      const newOptions = p.options.map(opt => {
        let votes = opt.votes
        if (votes.includes(identity)) {
          votes = votes.filter(v => v !== identity)
        }
        if (opt.id === optionId) {
          votes = [...votes, identity]
        }
        return { ...opt, votes }
      })
      
      return { ...p, options: newOptions }
    })
  }

  function closePoll(pollId) {
    polls.value = polls.value.map(p => {
      if (p.id === pollId) {
        return { ...p, isClosed: true }
      }
      return p
    })
  }

  function addQuestion(question) {
    if (!qna.value.some(q => q.id === question.id)) {
      qna.value = [...qna.value, question]
    }
  }

  function upvoteQuestion(questionId, identity) {
    qna.value = qna.value.map(q => {
      if (q.id !== questionId) return q
      const hasVoted = q.upvotes.includes(identity)
      const upvotes = hasVoted 
        ? q.upvotes.filter(v => v !== identity)
        : [...q.upvotes, identity]
      return { ...q, upvotes }
    })
  }

  function answerQuestion(questionId, answerText) {
    qna.value = qna.value.map(q => {
      if (q.id === questionId) {
        return { ...q, isAnswered: true, answerText }
      }
      return q
    })
  }

  function setPollsQnaActive(val) {
    showPollsQna.value = val
  }

  return {
    // State
    room, token, livekitUrl, isHost, currentSessionId,
    connectionState, isMicEnabled, isCameraEnabled, isScreenSharing, cameraResolution,
    isNoiseSuppressionEnabled, isCrispVoiceEnabled, virtualBackground,
    isWhiteboardActive, whiteboardHistory,
    polls, qna, showPollsQna,
    participants, messages, raisedHands, isRecording, showParticipants, reactions,
    // Computed
    isConnected, participantCount,
    // Actions
    setRoom, clearRoom, setConnectionState, setSessionId, setParticipants,
    addMessage, toggleMic, toggleCamera, setScreenSharing, setCameraResolution,
    setNoiseSuppression, setCrispVoice, setVirtualBackground,
    toggleWhiteboard, setWhiteboardActive, addWhiteboardAction, clearWhiteboardHistory,
    setHandRaised, setRecording,
    addPoll, votePoll, closePoll, addQuestion, upvoteQuestion, answerQuestion, setPollsQnaActive,
  }
}, {
  persist: false, // Jangan persist — state meeting bersifat sementara
})
