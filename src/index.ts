import WebSocket from 'ws'
import SignalingService from './signaling.js'

const port = Number(process.env.PORT) || 5001
const signalingService = new SignalingService()
const wss = new WebSocket.Server({ port }, () => {
  console.info(`Signaling server is running on port ${port}.`)
})

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
    } else {
      console.info(`Detected an unknown ${typeof message} message.`)
    }
  })
})
