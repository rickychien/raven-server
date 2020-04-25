import WebSocket from 'ws'
import SignalingService from './signaling.js'

const wss = new WebSocket.Server({ port: 5001 })
const signalingService = new SignalingService()

wss.on('connection', function (ws) {
  ws.on('open', function () {
    signalingService.addClient(ws)
  })

  ws.on('close', function () {
    signalingService.deleteClient(ws)
  })

  ws.on('message', function (message) {
    if (typeof message === 'string') {
      signalingService.onMessage(ws, message)
    }
  })
})