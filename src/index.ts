import http from 'http'
import WebSocket from 'ws'
import SignalingService from './signaling.js'

const PORT = 5001
const server = http.createServer()
const wss = new WebSocket.Server({ server })
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

server.listen(PORT)
console.log('Server is listening on port %d', PORT)
