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

  // --- Participants ---
  const participants = ref([])
  const raisedHands = ref({})   // { identity: boolean }
  const isRecording = ref(false)
  const showParticipants = ref(false)
  const reactions = ref([])     // { id, emoji, sender, identity }

  // --- Chat ---
  const messages = ref([])

  // --- Computed ---
  const isConnected = computed(() => connectionState.value === 'connected')
  const participantCount = computed(() => participants.value.length)

  // --- Actions ---
  function setRoom(roomData, tokenData, livekitWsUrl, hostStatus) {
    room.value = roomData
    token.value = tokenData
    livekitUrl.value = livekitWsUrl
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

  return {
    // State
    room, token, livekitUrl, isHost, currentSessionId,
    connectionState, isMicEnabled, isCameraEnabled, isScreenSharing,
    participants, messages, raisedHands, isRecording, showParticipants, reactions,
    // Computed
    isConnected, participantCount,
    // Actions
    setRoom, clearRoom, setConnectionState, setSessionId, setParticipants,
    addMessage, toggleMic, toggleCamera, setScreenSharing,
    setHandRaised, setRecording,
  }
}, {
  persist: false, // Jangan persist — state meeting bersifat sementara
})
