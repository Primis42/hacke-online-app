const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

function parseCorsOrigins(raw) {
  if (!raw || raw.trim() === '*') return '*';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  return list.length ? list : '*';
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true, service: 'hacke-online', ts: Date.now() }));
});

const io = new Server(server, {
  cors: {
    origin: parseCorsOrigins(CORS_ORIGIN),
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function createRoom(hostSocketId, hostName) {
  let code = randomRoomCode();
  while (rooms.has(code)) code = randomRoomCode();

  rooms.set(code, {
    code,
    hostSocketId,
    state: null,
    players: [{ socketId: hostSocketId, name: hostName || 'Host' }],
    createdAt: Date.now()
  });

  return rooms.get(code);
}

function sanitizeRoom(room) {
  return {
    code: room.code,
    hostSocketId: room.hostSocketId,
    players: room.players.map(p => ({ socketId: p.socketId, name: p.name })),
    hasState: !!room.state,
    createdAt: room.createdAt
  };
}

function broadcastRoomMeta(code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit('room:meta', sanitizeRoom(room));
}

io.on('connection', (socket) => {
  socket.on('room:create', ({ playerName }, ack) => {
    const room = createRoom(socket.id, (playerName || '').trim());
    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.playerName = playerName || 'Host';
    if (typeof ack === 'function') ack({ ok: true, roomCode: room.code, room: sanitizeRoom(room) });
    broadcastRoomMeta(room.code);
  });

  socket.on('room:join', ({ roomCode, playerName }, ack) => {
    const code = String(roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Raum nicht gefunden.' });
      return;
    }

    const name = (playerName || '').trim() || 'Spieler';
    if (!room.players.some(p => p.socketId === socket.id)) {
      room.players.push({ socketId: socket.id, name });
    }

    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = name;

    if (typeof ack === 'function') {
      ack({
        ok: true,
        roomCode: code,
        room: sanitizeRoom(room),
        state: room.state
      });
    }
    broadcastRoomMeta(code);
  });

  socket.on('state:sync', ({ roomCode, state }, ack) => {
    const code = String(roomCode || socket.data.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Raum nicht gefunden.' });
      return;
    }

    room.state = state;
    io.to(code).emit('state:update', {
      from: socket.id,
      state
    });
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('room:request_state', ({ roomCode }, ack) => {
    const code = String(roomCode || socket.data.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Raum nicht gefunden.' });
      return;
    }
    if (typeof ack === 'function') ack({ ok: true, state: room.state, room: sanitizeRoom(room) });
  });

  socket.on('prompt:answer', ({ roomCode, promptId, playerId, value }, ack) => {
    const code = String(roomCode || socket.data.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Raum nicht gefunden.' });
      return;
    }
    io.to(code).emit('prompt:answer', {
      from: socket.id,
      roomCode: code,
      promptId,
      playerId,
      value
    });
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('trick:play', ({ roomCode, playerId, cardIndex }, ack) => {
    const code = String(roomCode || socket.data.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Raum nicht gefunden.' });
      return;
    }
    io.to(code).emit('trick:play', {
      from: socket.id,
      roomCode: code,
      playerId,
      cardIndex
    });
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    room.players = room.players.filter(p => p.socketId !== socket.id);
    if (room.hostSocketId === socket.id) {
      room.hostSocketId = room.players[0]?.socketId || null;
    }

    if (!room.players.length) {
      rooms.delete(code);
      return;
    }

    broadcastRoomMeta(code);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hacke online server listening on :${PORT}`);
});
