# Raven Server

The Raven's signaling server.

Raven's server is extremely lightweight signaling service which is running on [Node.js] with a blazing fast [websockets/ws] WebSocket library.

Signaling server is serving on [Heroku] and listening Raven client's websocket message.

- Public signaling server: [wss://raven-server.herokuapp.com]

## Development

#### Install npm packages

```bash
npm install
```

#### To run the server for development, run:

```bash
npm run dev
```

#### To build the server for production, run:

```bash
npm run start
```

[node.js]: https://nodejs.org/
[websockets/ws]: https://github.com/websockets/ws
[heroku]: https://heroku.com
[wss://raven-server.herokuapp.com]: wss://raven-server.herokuapp.com
