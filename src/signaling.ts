import WebSocket from 'ws'
import uuid from 'short-uuid'

type RTCHandshakeType = 'offer' | 'answer' | 'candidate'
type BroadcastType = 'peer-joined' | 'peer-updated' | 'peer-left'

export default class SignalingService {
  rooms = new Map()
  clients: Map<
    WebSocket,
    {
      uid?: string
      userName?: string
      roomName?: string
      mute?: boolean
    }
  > = new Map()

  sendToPeer(
    type: RTCHandshakeType,
    ws: WebSocket,
    payload: { [x: string]: any; uid: string }
  ) {
    const sender = this.clients.get(ws)

    if (!sender) return

    this.clients.forEach((client, clientWS) => {
      if (client.roomName === sender.roomName && client.uid === payload.uid) {
        clientWS.send(
          JSON.stringify({
            type,
            payload: {
              ...sender,
              [type]: payload[type],
            },
          })
        )
      }

      console.info(
        `[Send] '${sender.uid}' sent '${type}' to user '${payload.uid}'`
      )
    })
  }

  broadcastToRoomPeers(
    type: BroadcastType,
    ws: WebSocket,
    payload: {
      uid?: string
      userName?: string
      roomName?: string
      mute?: boolean
    }
  ) {
    const sender = this.clients.get(ws)

    if (!sender) return

    this.clients.forEach((client, clientWS) => {
      if (client.roomName === sender.roomName && client.uid !== sender.uid) {
        clientWS.send(
          JSON.stringify({
            type,
            payload: {
              ...sender,
              ...payload,
            },
          })
        )
      }
    })

    console.info(
      `[Broadcast] '${sender.uid}' broadcasted '${type}' to all peers in room '${sender.roomName}'.`
    )
  }

  onMessage(ws: WebSocket, message: string) {
    const { type, payload } = JSON.parse(message)
    this[`onClient${type[0].toUpperCase() + type.slice(1)}`](ws, payload)
  }

  addClient(ws: WebSocket) {
    this.clients.set(ws, null)
  }

  deleteClient(ws: WebSocket) {
    this.broadcastToRoomPeers('peer-left', ws, {})
    this.clients.delete(ws)
  }

  onClientJoin(
    ws: WebSocket,
    payload: { userName: string; roomName: string; mute: boolean }
  ) {
    const uid = uuid.generate()
    const { userName, roomName, mute } = payload

    // Store the client
    this.clients.set(ws, {
      uid,
      userName,
      roomName,
      mute,
    })

    // If the room is the new created, then stores room info
    if (!this.rooms.has(roomName)) {
      console.info(`create new room: ${roomName}`)
      this.rooms.set(roomName, {
        roomCreatedTime: new Date(),
      })
    }

    // Send vaild uid back to client
    ws.send(
      JSON.stringify({
        type: 'user-joined',
        payload: {
          uid,
          userName,
          roomName,
          roomCreatedTime: this.rooms.get(roomName).roomCreatedTime,
        },
      })
    )

    this.broadcastToRoomPeers('peer-joined', ws, {})
  }

  onClientUpdate(ws: WebSocket, payload: { userName: string; mute: boolean }) {
    // Merge new payload data to original client (partial update)
    this.clients.set(ws, { ...this.clients.get(ws), ...payload })
    this.broadcastToRoomPeers('peer-updated', ws, payload)
  }

  onClientOffer(ws: WebSocket, payload: any) {
    this.sendToPeer('offer', ws, payload)
  }

  onClientAnswer(ws: WebSocket, payload: any) {
    this.sendToPeer('answer', ws, payload)
  }

  onClientCandidate(ws: WebSocket, payload: any) {
    this.sendToPeer('candidate', ws, payload)
  }
}
