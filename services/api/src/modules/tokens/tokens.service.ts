// =============================================================
// services/api/src/modules/tokens/tokens.service.ts
// Generator LiveKit JWT token untuk participant
// =============================================================

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'
import { config } from '../../config/env.js'

export interface TokenOptions {
  roomName: string
  participantName: string
  participantId: string
  isHost?: boolean
  metadata?: string
}

export class TokensService {
  private roomService: RoomServiceClient

  constructor() {
    this.roomService = new RoomServiceClient(
      config.livekit.wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'),
      config.livekit.apiKey,
      config.livekit.apiSecret
    )
  }

  async generateToken(options: TokenOptions): Promise<string> {
    const token = new AccessToken(
      config.livekit.apiKey,
      config.livekit.apiSecret,
      {
        identity: options.participantId,
        name: options.participantName,
        metadata: options.metadata,
        ttl: '8h',  // Token berlaku 8 jam
      }
    )

    token.addGrant({
      room: options.roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // Host memiliki permission tambahan
      roomAdmin: options.isHost ?? false,
      roomCreate: options.isHost ?? false,
    })

    return await token.toJwt()
  }

  async getRoomParticipants(roomName: string) {
    try {
      const participants = await this.roomService.listParticipants(roomName)
      return participants
    } catch {
      return []
    }
  }

  async removeParticipant(roomName: string, participantId: string) {
    await this.roomService.removeParticipant(roomName, participantId)
  }
}
