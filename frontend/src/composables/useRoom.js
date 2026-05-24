// =============================================================
// frontend/src/composables/useRoom.js
// Composable utama: koneksi ke LiveKit Room
// =============================================================

import { ref, onUnmounted, markRaw } from 'vue'
import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
  LocalParticipant,
  RemoteParticipant,
  VideoPresets,
} from 'livekit-client'
import { useMeetStore } from '@/stores/meet'
import { Notify } from 'quasar'

export function useRoom() {
  const meetStore = useMeetStore()
  const lkRoom = ref(null)   // LiveKit Room instance (markRaw agar tidak reactive deep)
  const error = ref(null)

  /**
   * Connect ke LiveKit room
   * @param {string} wsUrl - ws://livekit-server:7880
   * @param {string} token - JWT dari backend
   */
  async function connect(wsUrl, token) {
    error.value = null
    meetStore.setConnectionState('connecting')

    try {
      const room = markRaw(new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
        },
      }))

      lkRoom.value = room

      // Event listeners
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        const map = {
          [ConnectionState.Connecting]: 'connecting',
          [ConnectionState.Connected]: 'connected',
          [ConnectionState.Reconnecting]: 'reconnecting',
          [ConnectionState.Disconnected]: 'disconnected',
        }
        meetStore.setConnectionState(map[state] ?? 'disconnected')
        _syncParticipants()
      })

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        Notify.create({
          type: 'info',
          message: `${participant.name || participant.identity} bergabung ke meeting`,
          icon: 'person_add',
          timeout: 3000,
          position: 'top-right'
        })
        _syncParticipants()
      })

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        Notify.create({
          type: 'warning',
          message: `${participant.name || participant.identity} meninggalkan meeting`,
          icon: 'person_remove',
          timeout: 3000,
          position: 'top-right'
        })
        _syncParticipants()
      })

      room.on(RoomEvent.TrackSubscribed, () => _syncParticipants())
      room.on(RoomEvent.TrackUnsubscribed, () => _syncParticipants())
      room.on(RoomEvent.TrackMuted, () => _syncParticipants())
      room.on(RoomEvent.TrackUnmuted, () => _syncParticipants())
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        console.log('[LiveKit] Active speakers changed:', speakers.map(s => s.identity))
        _syncParticipants()
      })

      room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        console.log(`[LiveKit] Connection quality changed for ${participant.identity}: ${quality}`)
        _syncParticipants()
      })

      // Data channel (chat + signals)
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const text = new TextDecoder().decode(payload)
          const data = JSON.parse(text)
          if (data.type === 'chat') {
            meetStore.addMessage({
              sender: participant?.name ?? 'Unknown',
              senderId: participant?.identity ?? '',
              text: data.text,
            })
          } else if (data.type === 'raise-hand') {
            meetStore.setHandRaised(participant?.identity || '', data.raised)
            _syncParticipants()
            Notify.create({
              type: data.raised ? 'info' : 'primary',
              message: `${participant?.name ?? 'Seseorang'} ${data.raised ? 'mengangkat tangan ✋' : 'menurunkan tangan'}`,
              timeout: 3000,
              position: 'top-right'
            })
          } else if (data.type === 'lower-hand') {
            meetStore.setHandRaised(data.target, false)
            _syncParticipants()
            if (data.target === room.localParticipant.identity) {
              Notify.create({
                type: 'info',
                message: 'Tangan Anda diturunkan oleh Host 🤚',
                timeout: 3000,
                position: 'top'
              })
            }
          } else if (data.type === 'reaction') {
            meetStore.reactions.push({
              id: Date.now() + Math.random(),
              emoji: data.emoji,
              sender: participant?.name ?? 'Seseorang',
              identity: participant?.identity || ''
            })
            // Auto remove reaction after 4 seconds
            const rId = meetStore.reactions[meetStore.reactions.length - 1].id
            setTimeout(() => {
              meetStore.reactions = meetStore.reactions.filter(r => r.id !== rId)
            }, 4000)
          } else if (data.type === 'recording') {
            meetStore.setRecording(data.active)
            Notify.create({
              type: data.active ? 'negative' : 'info',
              message: data.active ? 'Rekaman meeting telah dimulai 🔴' : 'Rekaman meeting dihentikan ⏹️',
              icon: 'fiber_manual_record',
              timeout: 4000,
              position: 'top'
            })
          } else if (data.type === 'mute-all') {
            if (!meetStore.isHost && room.localParticipant.identity !== data.exclude) {
              room.localParticipant.setMicrophoneEnabled(false)
              if (meetStore.isMicEnabled) {
                meetStore.toggleMic()
              }
              Notify.create({
                type: 'warning',
                message: 'Mikrofon Anda dimatikan oleh Host',
                icon: 'mic_off',
                timeout: 5000,
                position: 'top'
              })
            }
          } else if (data.type === 'mute-participant') {
            if (data.target === room.localParticipant.identity) {
              room.localParticipant.setMicrophoneEnabled(false)
              if (meetStore.isMicEnabled) {
                meetStore.toggleMic()
              }
              Notify.create({
                type: 'warning',
                message: 'Mikrofon Anda dimatikan oleh Host',
                icon: 'mic_off',
                timeout: 5000,
                position: 'top'
              })
            }
          }
        } catch {
          // ignore malformed messages
        }
      })

      // Connect!
      await room.connect(wsUrl, token)

      // Enable camera & mic sesuai store state & setelan resolusi terpilih
      await room.localParticipant.setMicrophoneEnabled(meetStore.isMicEnabled)
      const preset = VideoPresets[meetStore.cameraResolution] || VideoPresets.h540
      await room.localParticipant.setCameraEnabled(meetStore.isCameraEnabled, {
        resolution: preset.resolution
      })

      _syncParticipants()
    } catch (err) {
      error.value = err.message
      meetStore.setConnectionState('disconnected')
      console.error('[useRoom] Connect error:', err)
      throw err
    }
  }

  /** Disconnect dari room */
  async function disconnect() {
    if (lkRoom.value) {
      await lkRoom.value.disconnect()
      lkRoom.value = null
    }
    meetStore.clearRoom()
  }

  /** Toggle microphone */
  async function toggleMic() {
    if (!lkRoom.value) return
    const enabled = !meetStore.isMicEnabled
    await lkRoom.value.localParticipant.setMicrophoneEnabled(enabled)
    meetStore.toggleMic()
  }

  /** Toggle camera */
  async function toggleCamera() {
    if (!lkRoom.value) return
    const enabled = !meetStore.isCameraEnabled
    if (enabled) {
      const preset = VideoPresets[meetStore.cameraResolution] || VideoPresets.h540
      await lkRoom.value.localParticipant.setCameraEnabled(true, {
        resolution: preset.resolution
      })
    } else {
      await lkRoom.value.localParticipant.setCameraEnabled(false)
    }
    meetStore.toggleCamera()
  }

  /** Change Camera Resolution seamless */
  async function changeCameraResolution(resName) {
    if (!lkRoom.value) return
    const preset = VideoPresets[resName]
    if (!preset) return

    meetStore.setCameraResolution(resName)

    if (meetStore.isCameraEnabled) {
      // Disable and enable seamlessly to re-publish with new resolution constraints
      await lkRoom.value.localParticipant.setCameraEnabled(false)
      await lkRoom.value.localParticipant.setCameraEnabled(true, {
        resolution: preset.resolution
      })
    }

    Notify.create({
      type: 'positive',
      message: `Kualitas kamera diubah ke ${
        resName === 'h720' ? 'High Definition (720p)' :
        resName === 'h1080' ? 'Full HD (1080p)' :
        resName === 'h360' ? 'Hemat Data (360p)' : 'Standar (540p)'
      }`,
      timeout: 3000,
      position: 'top'
    })
  }

  /** Toggle screen share */
  async function toggleScreenShare() {
    if (!lkRoom.value) return
    try {
      const enabled = !meetStore.isScreenSharing
      await lkRoom.value.localParticipant.setScreenShareEnabled(enabled)
      meetStore.setScreenSharing(enabled)
    } catch (err) {
      console.error('[useRoom] Screen share error:', err)
    }
  }

  /** Kirim chat via Data Channel */
  async function sendChatMessage(text) {
    if (!lkRoom.value || !text.trim()) return
    const payload = JSON.stringify({ type: 'chat', text: text.trim() })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    // Tambahkan ke local messages
    meetStore.addMessage({
      sender: lkRoom.value.localParticipant.name ?? 'You',
      senderId: lkRoom.value.localParticipant.identity,
      text: text.trim(),
      isSelf: true,
    })
  }

  /** Kirim sinyal angkat tangan */
  async function sendRaiseHand(raised) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'raise-hand', raised })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.setHandRaised(lkRoom.value.localParticipant.identity, raised)
    _syncParticipants()
  }

  /** Kirim sinyal emoji reaction */
  async function sendReaction(emoji) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'reaction', emoji })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.reactions.push({
      id: Date.now() + Math.random(),
      emoji,
      sender: lkRoom.value.localParticipant.name ?? 'Anda',
      identity: lkRoom.value.localParticipant.identity
    })
    const rId = meetStore.reactions[meetStore.reactions.length - 1].id
    setTimeout(() => {
      meetStore.reactions = meetStore.reactions.filter(r => r.id !== rId)
    }, 4000)
  }

  /** Kirim status rekaman (hanya Host) */
  async function sendRecordingState(active) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'recording', active })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.setRecording(active)
    Notify.create({
      type: active ? 'negative' : 'info',
      message: active ? 'Rekaman meeting telah dimulai 🔴' : 'Rekaman meeting dihentikan ⏹️',
      icon: 'fiber_manual_record',
      timeout: 4000,
      position: 'top'
    })
  }

  /** Kirim perintah Mute All (hanya Host) */
  async function sendMuteAll(excludeIdentity = null) {
    if (!lkRoom.value || !meetStore.isHost) return
    const payload = JSON.stringify({ type: 'mute-all', exclude: excludeIdentity })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    Notify.create({
      type: 'positive',
      message: 'Sinyal mematikan semua mikrofon telah dikirim',
      icon: 'mic_off',
      timeout: 3000,
      position: 'top'
    })
  }

  /** Kirim perintah Mute Participant tertentu (hanya Host) */
  async function sendMuteParticipant(targetIdentity) {
    if (!lkRoom.value || !meetStore.isHost) return
    const payload = JSON.stringify({ type: 'mute-participant', target: targetIdentity })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Kirim sinyal menurunkan tangan peserta lain (hanya Host) */
  async function sendLowerHand(targetIdentity) {
    if (!lkRoom.value || !meetStore.isHost) return
    const payload = JSON.stringify({ type: 'lower-hand', target: targetIdentity })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.setHandRaised(targetIdentity, false)
    _syncParticipants()
  }

  /** Sync daftar participants ke store */
  function _syncParticipants() {
    if (!lkRoom.value) return
    const all = [
      lkRoom.value.localParticipant,
      ...Array.from(lkRoom.value.remoteParticipants.values()),
    ]
    meetStore.setParticipants(all.map(_serializeParticipant))
  }

  function _serializeParticipant(p) {
    const isLocal = p instanceof LocalParticipant
    const videoTrack = p.getTrackPublication(Track.Source.Camera)
    const screenTrack = p.getTrackPublication(Track.Source.ScreenShare)
    const audioTrack = p.getTrackPublication(Track.Source.Microphone)

    return {
      identity: p.identity,
      name: p.name,
      isLocal,
      isSpeaking: p.isSpeaking,
      isMicEnabled: p.isMicrophoneEnabled,
      isCameraEnabled: p.isCameraEnabled,
      isScreenSharing: p.isScreenShareEnabled,
      isHandRaised: meetStore.raisedHands[p.identity] || false,
      connectionQuality: p.connectionQuality,
      // raw track untuk attach ke <video> / <audio> (Gunakan markRaw agar tidak error Proxy!)
      videoTrack: videoTrack?.track ? markRaw(videoTrack.track) : null,
      screenTrack: screenTrack?.track ? markRaw(screenTrack.track) : null,
      audioTrack: audioTrack?.track ? markRaw(audioTrack.track) : null,
      // Pass raw participant object untuk fast-polling audio
      rawParticipant: markRaw(p)
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    lkRoom,
    error,
    connect,
    disconnect,
    toggleMic,
    toggleCamera,
    changeCameraResolution,
    toggleScreenShare,
    sendChatMessage,
    sendRaiseHand,
    sendReaction,
    sendRecordingState,
    sendMuteAll,
    sendMuteParticipant,
    sendLowerHand,
  }
}
