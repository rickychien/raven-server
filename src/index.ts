import http from 'http'
import express from 'express'
import WebSocket from 'ws'
import SignalingService from './signaling.js'

const PORT = 5001
const app = express()
const signalingService = new SignalingService()

app.use(express.static('/'))
const server = http.createServer(app)
server.listen(PORT)
console.log('Server is listening on port %d', PORT)

const wss = new WebSocket.Server({ server })

wss.on('connection', function (ws) {
  const id = setInterval(function () {
    ws.send(JSON.stringify(new Date()), function () {})
  }, 1000)

  ws.on('open', function () {
    signalingService.addClient(ws)
  })

  ws.on('close', function () {
    clearInterval(id)
    signalingService.deleteClient(ws)
  })

  ws.on('message', function (message) {
    if (typeof message === 'string') {
      signalingService.onMessage(ws, message)
    }
  })
})
