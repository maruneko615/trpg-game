import { v4 as uuid } from 'uuid';
import { GameSession, Character } from '@trpg/shared';

const sessions = new Map<string, GameSession>();

export function createSession(name: string): GameSession {
  const session: GameSession = {
    id: uuid(), name, players: [],
    currentScene: null, gameLog: [], state: 'lobby',
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function joinSession(sessionId: string, player: Character): GameSession | undefined {
  const session = sessions.get(sessionId);
  if (!session || session.state === 'ended') return undefined;
  if (!session.players.find(p => p.id === player.id)) session.players.push(player);
  return session;
}

export function leaveSession(sessionId: string, playerId: string): GameSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  session.players = session.players.filter(p => p.id !== playerId);
  return session;
}

export function updateSessionState(sessionId: string, state: GameSession['state']): GameSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  session.state = state;
  return session;
}
