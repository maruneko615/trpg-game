import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import { DiceType, ChatMessage, SOCKET_EVENTS } from '@trpg/shared';
import { rollDice } from './game/dice';
import { createCharacter, getCharacter } from './game/character';
import { createSession, getSession, joinSession, leaveSession } from './game/session';
import { rollInitiative, nextTurn, resolveCombatAction, CombatActionInput } from './game/combat';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- REST API ---

app.post('/api/sessions', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  res.json(createSession(name));
});

app.get('/api/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'session not found' });
  res.json(session);
});

app.post('/api/characters', (req, res) => {
  const { name, stats } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  res.json(createCharacter(name, stats));
});

app.get('/api/characters/:id', (req, res) => {
  const char = getCharacter(req.params.id);
  if (!char) return res.status(404).json({ error: 'character not found' });
  res.json(char);
});

// --- WebSocket Events ---

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on(SOCKET_EVENTS.JOIN_SESSION, ({ sessionId, characterId }: { sessionId: string; characterId: string }) => {
    const char = getCharacter(characterId);
    if (!char) return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Character not found' });
    const session = joinSession(sessionId, char);
    if (!session) return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot join session' });
    socket.join(sessionId);
    io.to(sessionId).emit(SOCKET_EVENTS.PLAYER_JOINED, { character: char, session });
  });

  socket.on(SOCKET_EVENTS.LEAVE_SESSION, ({ sessionId, characterId }: { sessionId: string; characterId: string }) => {
    const session = leaveSession(sessionId, characterId);
    if (!session) return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot leave session' });
    socket.leave(sessionId);
    io.to(sessionId).emit(SOCKET_EVENTS.PLAYER_LEFT, { characterId, session });
  });

  socket.on(SOCKET_EVENTS.ROLL_DICE, ({ sessionId, die, count, modifier }: { sessionId: string; die: DiceType; count?: number; modifier?: number }) => {
    const result = rollDice(die, count, modifier);
    io.to(sessionId).emit(SOCKET_EVENTS.DICE_RESULT, { playerId: socket.id, result });
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, ({ sessionId, sender, content }: { sessionId: string; sender: string; content: string }) => {
    const msg: ChatMessage = { id: uuid(), sender, content, timestamp: Date.now(), type: 'chat' };
    io.to(sessionId).emit(SOCKET_EVENTS.CHAT_MESSAGE, msg);
  });

  socket.on(SOCKET_EVENTS.COMBAT_ACTION, ({ sessionId, action }: { sessionId: string; action: CombatActionInput }) => {
    const session = getSession(sessionId);
    if (!session || session.state !== 'combat') return socket.emit(SOCKET_EVENTS.ERROR, { message: 'No active combat' });
    const result = resolveCombatAction(action);
    io.to(sessionId).emit(SOCKET_EVENTS.COMBAT_UPDATE, { action, result });
  });

  socket.on(SOCKET_EVENTS.SCENE_UPDATE, ({ sessionId, scene }: { sessionId: string; scene: unknown }) => {
    io.to(sessionId).emit(SOCKET_EVENTS.SCENE_UPDATE, { scene });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`TRPG server listening on port ${PORT}`));
