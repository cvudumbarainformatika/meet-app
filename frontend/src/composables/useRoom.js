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

// Shared LiveKit Room instance at module level (Singleton Pattern)
const lkRoom = ref(null)
const error = ref(null)

export function useRoom() {
  const meetStore = useMeetStore()

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
          console.log('[LiveKit DataReceived]', data.type, data, 'from:', participant?.identity)
          if (data.type === 'chat') {
            meetStore.addMessage({
              sender: participant?.name ?? 'Unknown',
              senderId: participant?.identity ?? '',
              text: data.text,
            })
          } else if (data.type === 'file-share') {
            meetStore.addMessage({
              sender: participant?.name ?? 'Unknown',
              senderId: participant?.identity ?? '',
              file: data.file,
            })
            Notify.create({
              type: 'info',
              message: `${participant?.name ?? 'Seseorang'} membagikan berkas: ${data.file.name} 📁`,
              timeout: 4000,
              position: 'top-right'
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
          } else if (data.type === 'whiteboard-toggle') {
            meetStore.setWhiteboardActive(data.active)
            Notify.create({
              type: 'info',
              message: data.active
                ? `${participant?.name ?? 'Seseorang'} memulai kolaborasi Papan Tulis 🎨`
                : `Kolaborasi Papan Tulis dihentikan ⏹️`,
              timeout: 3000,
              position: 'top-right'
            })
          } else if (data.type === 'whiteboard-draw') {
            meetStore.addWhiteboardAction(data.action)
          } else if (data.type === 'whiteboard-clear') {
            meetStore.clearWhiteboardHistory()
            Notify.create({
              type: 'warning',
              message: `Papan tulis dibersihkan oleh ${participant?.name ?? 'Seseorang'} 🧹`,
              timeout: 3000,
              position: 'top-right'
            })
          } else if (data.type === 'whiteboard-sync-req') {
            if (meetStore.whiteboardHistory.length > 0) {
              sendWhiteboardSyncResponse(participant.identity)
            }
          } else if (data.type === 'whiteboard-sync-res') {
            if (data.target === room.localParticipant.identity && meetStore.whiteboardHistory.length === 0) {
              meetStore.whiteboardHistory = data.history
            }
          } else if (data.type === 'poll-create') {
            meetStore.addPoll(data.poll)
            Notify.create({
              type: 'info',
              message: `Jajak Pendapat Baru: "${data.poll.question}" 🗳️`,
              timeout: 4000,
              position: 'top-right'
            })
          } else if (data.type === 'poll-vote') {
            meetStore.votePoll(data.pollId, data.optionId, data.voter)
          } else if (data.type === 'poll-close') {
            meetStore.closePoll(data.pollId)
            Notify.create({
              type: 'warning',
              message: 'Sebuah Jajak Pendapat telah ditutup 🔒',
              timeout: 3000,
              position: 'top-right'
            })
          } else if (data.type === 'qna-ask') {
            meetStore.addQuestion(data.question)
            Notify.create({
              type: 'info',
              message: `Pertanyaan baru dari ${data.question.sender} 💬`,
              timeout: 4000,
              position: 'top-right'
            })
          } else if (data.type === 'qna-upvote') {
            meetStore.upvoteQuestion(data.questionId, data.identity)
          } else if (data.type === 'qna-answer') {
            meetStore.answerQuestion(data.questionId, data.answerText)
            Notify.create({
              type: 'positive',
              message: 'Pertanyaan Anda telah dijawab oleh Host! 🎉',
              timeout: 5000,
              position: 'top-right'
            })
          } else if (data.type === 'polls-sync-req') {
            if (meetStore.polls.length > 0) {
              sendPollsSyncResponse(participant.identity)
            }
          } else if (data.type === 'polls-sync-res') {
            if (data.target === room.localParticipant.identity && meetStore.polls.length === 0) {
              meetStore.polls = data.polls
            }
          } else if (data.type === 'qna-sync-req') {
            if (meetStore.qna.length > 0) {
              sendQnaSyncResponse(participant.identity)
            }
          } else if (data.type === 'qna-sync-res') {
            if (data.target === room.localParticipant.identity && meetStore.qna.length === 0) {
              meetStore.qna = data.qna
            }
          } else if (data.type === 'chat-sync-req') {
            if (meetStore.messages.length > 0) {
              sendChatSyncResponse(participant.identity)
            }
          } else if (data.type === 'chat-sync-res') {
            if (data.target === room.localParticipant.identity && meetStore.messages.length === 0) {
              meetStore.messages = data.messages
            }
          }
        } catch (err) {
          console.error('[LiveKit DataReceived Error]', err)
        }
      })

      // Safety check & dynamic translation for LiveKit WS URL before connecting
      let finalWsUrl = wsUrl
      if (finalWsUrl === 'undefined' || finalWsUrl === 'null' || !finalWsUrl) {
        finalWsUrl = meetStore.livekitUrl || '/livekit'
      }
      
      if (finalWsUrl.startsWith('/')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        finalWsUrl = `${protocol}//${window.location.host}${finalWsUrl}`
      } else if (finalWsUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        finalWsUrl = finalWsUrl.replace('localhost', window.location.hostname)
      } else if (finalWsUrl.includes('127.0.0.1') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        finalWsUrl = finalWsUrl.replace('127.0.0.1', window.location.hostname)
      } else if (finalWsUrl.includes('livekit') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !finalWsUrl.includes('.')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        finalWsUrl = `${protocol}//${window.location.host}/livekit`
      }
      
      console.log('[useRoom] Connecting to LiveKit with resolved WS URL:', finalWsUrl)

      // Connect!
      await room.connect(finalWsUrl, token)

      // Bungkus publishData untuk mencegah crash RTCDataChannel secara aman
      const originalPublish = room.localParticipant.publishData.bind(room.localParticipant)
      room.localParticipant.publishData = async (data, options) => {
        if (room.state !== 'connected') {
          console.warn('[LiveKit] Gagal mengirim: DataChannel tidak dalam status terhubung (state:', room.state, ')')
          return
        }
        try {
          return await originalPublish(data, options)
        } catch (err) {
          console.error('[LiveKit] publishData error terdeteksi & diamankan:', err)
        }
      }

      // Enable camera & mic sesuai store state & setelan resolusi terpilih
      await room.localParticipant.setMicrophoneEnabled(meetStore.isMicEnabled)
      const preset = VideoPresets[meetStore.cameraResolution] || VideoPresets.h540
      await room.localParticipant.setCameraEnabled(meetStore.isCameraEnabled, {
        resolution: preset.resolution
      })

      _syncParticipants()

      // Minta sinkronisasi gambar papan tulis, jajak pendapat, tanya jawab, dan chat jika baru bergabung
      setTimeout(async () => {
        await sendWhiteboardSyncRequest()
        await sendPollsSyncRequest()
        await sendQnaSyncRequest()
        await sendChatSyncRequest()
      }, 1000)
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
    _syncParticipants()
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
    _syncParticipants()
  }

  /** Change Camera Resolution seamless */
  async function changeCameraResolution(resName) {
    const preset = VideoPresets[resName]
    if (!preset) return

    meetStore.setCameraResolution(resName)

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

    if (!lkRoom.value) return

    if (meetStore.isCameraEnabled) {
      // Disable and enable seamlessly to re-publish with new resolution constraints
      await lkRoom.value.localParticipant.setCameraEnabled(false)
      await lkRoom.value.localParticipant.setCameraEnabled(true, {
        resolution: preset.resolution
      })
    }
    _syncParticipants()
  }

  /** Toggle screen share */
  async function toggleScreenShare() {
    if (!lkRoom.value) return
    try {
      const enabled = !meetStore.isScreenSharing
      await lkRoom.value.localParticipant.setScreenShareEnabled(enabled)
      meetStore.setScreenSharing(enabled)
      _syncParticipants() // Sinkronkan status UI lokal agar langsung menampilkan layar sendiri
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

  /** Kirim berkas sharing via Data Channel */
  async function sendFileShare(fileData) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({
      type: 'file-share',
      file: {
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        dataUrl: fileData.dataUrl
      }
    })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    
    // Tambahkan ke local messages
    meetStore.addMessage({
      sender: lkRoom.value.localParticipant.name ?? 'You',
      senderId: lkRoom.value.localParticipant.identity,
      file: {
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        dataUrl: fileData.dataUrl
      },
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

  /** Kirim status aktif Papan Tulis */
  async function sendWhiteboardToggle(active) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'whiteboard-toggle', active })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.setWhiteboardActive(active)
  }

  /** Kirim goresan/aksi menggambar Papan Tulis */
  async function sendWhiteboardDraw(action) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'whiteboard-draw', action })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.addWhiteboardAction(action)
  }

  /** Bersihkan kanvas Papan Tulis massal */
  async function sendWhiteboardClear() {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'whiteboard-clear' })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
    meetStore.clearWhiteboardHistory()
  }

  /** Kirim permintaan sinkronisasi gambar */
  async function sendWhiteboardSyncRequest() {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'whiteboard-sync-req' })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Balas permintaan sinkronisasi gambar */
  async function sendWhiteboardSyncResponse(targetIdentity) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({
      type: 'whiteboard-sync-res',
      target: targetIdentity,
      history: meetStore.whiteboardHistory
    })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Kirim pembuatan Jajak Pendapat */
  async function sendPollCreate(poll) {
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'poll-create', poll })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendPollCreate error:', e)
      }
    }
    meetStore.addPoll(poll)
  }

  /** Kirim vote Jajak Pendapat */
  async function sendPollVote(pollId, optionId) {
    const identity = lkRoom.value?.localParticipant?.identity || 'voter'
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'poll-vote', pollId, optionId, voter: identity })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendPollVote error:', e)
      }
    }
    meetStore.votePoll(pollId, optionId, identity)
  }

  /** Tutup Jajak Pendapat */
  async function sendPollClose(pollId) {
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'poll-close', pollId })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendPollClose error:', e)
      }
    }
    meetStore.closePoll(pollId)
  }

  /** Kirim pertanyaan Q&A baru */
  async function sendQnaAsk(question) {
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'qna-ask', question })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendQnaAsk error:', e)
      }
    }
    meetStore.addQuestion(question)
  }

  /** Kirim upvote Q&A */
  async function sendQnaUpvote(questionId) {
    const identity = lkRoom.value?.localParticipant?.identity || 'upvoter'
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'qna-upvote', questionId, identity })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendQnaUpvote error:', e)
      }
    }
    meetStore.upvoteQuestion(questionId, identity)
  }

  /** Kirim jawaban Q&A dari Host */
  async function sendQnaAnswer(questionId, answerText) {
    if (lkRoom.value?.localParticipant) {
      try {
        const payload = JSON.stringify({ type: 'qna-answer', questionId, answerText })
        await lkRoom.value.localParticipant.publishData(
          new TextEncoder().encode(payload),
          { reliable: true }
        )
      } catch (e) {
        console.error('[useRoom] sendQnaAnswer error:', e)
      }
    }
    meetStore.answerQuestion(questionId, answerText)
  }

  /** Kirim permintaan sinkronisasi Polls */
  async function sendPollsSyncRequest() {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'polls-sync-req' })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Balas sinkronisasi Polls */
  async function sendPollsSyncResponse(targetIdentity) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({
      type: 'polls-sync-res',
      target: targetIdentity,
      polls: meetStore.polls
    })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Kirim permintaan sinkronisasi Q&A */
  async function sendQnaSyncRequest() {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'qna-sync-req' })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Balas sinkronisasi Q&A */
  async function sendQnaSyncResponse(targetIdentity) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({
      type: 'qna-sync-res',
      target: targetIdentity,
      qna: meetStore.qna
    })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Kirim permintaan sinkronisasi Chat */
  async function sendChatSyncRequest() {
    if (!lkRoom.value) return
    const payload = JSON.stringify({ type: 'chat-sync-req' })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
  }

  /** Balas sinkronisasi Chat */
  async function sendChatSyncResponse(targetIdentity) {
    if (!lkRoom.value) return
    const payload = JSON.stringify({
      type: 'chat-sync-res',
      target: targetIdentity,
      messages: meetStore.messages
    })
    await lkRoom.value.localParticipant.publishData(
      new TextEncoder().encode(payload),
      { reliable: true }
    )
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
    sendWhiteboardToggle,
    sendWhiteboardDraw,
    sendWhiteboardClear,
    sendWhiteboardSyncRequest,
    sendWhiteboardSyncResponse,
    sendPollCreate,
    sendPollVote,
    sendPollClose,
    sendQnaAsk,
    sendQnaUpvote,
    sendQnaAnswer,
    sendPollsSyncRequest,
    sendPollsSyncResponse,
    sendQnaSyncRequest,
    sendQnaSyncResponse,
    sendFileShare,
    sendChatSyncRequest,
    sendChatSyncResponse,
  }
}
