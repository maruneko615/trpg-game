import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { execFile } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PROMPTS: Record<string, string> = {
  coc: `你是克蘇魯的呼喚 TRPG 的 GM。使用繁體中文，第二人稱，洛夫克拉夫特恐怖風格。
技能檢定加 [ROLL:技能:難度]，恐怖事物加 [SAN:數值]，受傷加 [DMG:數值]，物品加 [ITEM:名]，線索加 [CLUE:內容]。
可用技能：偵查、圖書館、聆聽、閃避、說服、心理學、急救、神秘學、撬鎖、潛行、格鬥、射擊。難度：普通、困難、極難。
控制200字內，結尾問「你想做什麼？」，不替玩家決定，只回覆敘述文字不用工具。
背景：1920年代美國阿卡姆鎮，玩家是調查員。`,

  kaidan: `你是日式都市怪談 TRPG 的 GM。使用繁體中文，第二人稱，日式恐怖風格（安靜中的不對勁、暗示性恐怖）。
技能檢定加 [ROLL:技能:難度]，恐怖事物加 [SAN:數值]，受傷加 [DMG:數值]，物品加 [ITEM:名]，線索加 [CLUE:內容]。
可用技能：觀察、聆聽、搜索、說服、冷靜、逃跑、靈感、急救、電子設備、駕駛。難度：普通、困難、極難。
控制200字內，結尾問「你想做什麼？」，不替玩家決定，只回覆敘述文字不用工具。
背景：現代日本東京，玩家是普通人捲入超自然事件。`,
};

const OPENING_PROMPTS: Record<string, string> = {
  coc: `請為克蘇魯的呼喚 TRPG 生成一個全新的開場場景。要求：
- 繁體中文，第二人稱
- 1920年代美國背景，洛夫克拉夫特恐怖風格
- 包含：時間地點、玩家身份、事件起因、當前場景描述
- 營造神秘不安的氛圍
- 結尾問「你想做什麼？」
- 每次要不同的故事（不要教授失蹤案）
- 控制在200字以內
- 只回覆開場敘述文字，不要使用任何工具`,

  kaidan: `請為日式都市怪談 TRPG 生成一個全新的開場場景。要求：
- 繁體中文，第二人稱
- 現代日本東京背景，日式恐怖風格
- 包含：時間地點、玩家身份、事件起因、當前場景描述
- 營造安靜中的不對勁感
- 結尾問「你想做什麼？」
- 每次要不同的故事
- 控制在200字以內
- 只回覆開場敘述文字，不要使用任何工具`,
};

interface Room {
  id: string;
  scenario: string;
  messages: Array<{role: string; text: string; player?: string}>;
  players: Map<string, string>; // socketId -> playerName
}

const rooms = new Map<string, Room>();

function callKiro(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    execFile('kiro-cli', ['chat', '--no-interactive', '--wrap', 'never', '--trust-tools=', prompt], {
      timeout: 60000, maxBuffer: 1024 * 1024,
    }, (error, stdout) => {
      if (error) { resolve('（GM 暫時無法回應，請再試一次）'); return; }
      const lines = stdout.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[\?[0-9]*[hl]/g, '').replace(/\x1b\[[\d]*G/g, '').split('\n');
      let response = '';
      let capture = false;
      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('> ')) { capture = true; response += t.substring(2) + '\n'; }
        else if (capture && t.length > 0 && !t.includes('Time:') && !t.includes('▸')) { response += t + '\n'; }
      }
      if (!response.trim()) {
        response = lines.filter(l => { const t = l.trim(); return t.length > 0 && !t.includes('tools are now') && !t.includes('Learn more') && !t.includes('kiro.dev') && !t.includes('Time:') && !t.includes('▸') && !t.includes('WARNING') && !t.includes('Agents can sometimes'); }).join('\n');
      }
      resolve(response.trim() || '（GM 思考中...請再試一次）');
    });
  });
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('join-room', async ({ roomId, scenario, playerName }: { roomId: string; scenario: string; playerName: string }) => {
    socket.join(roomId);
    let room = rooms.get(roomId);

    if (!room) {
      // New room — generate dynamic opening
      room = { id: roomId, scenario, messages: [], players: new Map() };
      rooms.set(roomId, room);
      room.players.set(socket.id, playerName);

      io.to(roomId).emit('system', { text: `${playerName} 加入了房間。正在生成開場...` });

      const openingPrompt = OPENING_PROMPTS[scenario] || OPENING_PROMPTS.coc;
      const opening = await callKiro(openingPrompt);
      room.messages.push({ role: 'gm', text: opening });
      io.to(roomId).emit('gm-message', { text: opening });
      io.to(roomId).emit('players', Array.from(room.players.values()));
    } else {
      // Existing room — send history and add player
      room.players.set(socket.id, playerName);
      socket.emit('history', room.messages);
      io.to(roomId).emit('system', { text: `${playerName} 加入了房間。` });
      io.to(roomId).emit('players', Array.from(room.players.values()));
    }
  });

  socket.on('player-action', async ({ roomId, text }: { roomId: string; text: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const playerName = room.players.get(socket.id) || '???';

    // Broadcast player action to all
    room.messages.push({ role: 'player', text, player: playerName });
    io.to(roomId).emit('player-message', { player: playerName, text });

    // Generate GM response
    io.to(roomId).emit('gm-thinking', true);
    const systemPrompt = PROMPTS[room.scenario] || PROMPTS.coc;
    const conversation = room.messages.map(m =>
      m.role === 'player' ? `[${m.player || '玩家'}]: ${m.text}` : `[GM]: ${m.text}`
    ).join('\n');
    const prompt = `${systemPrompt}\n\n對話記錄：\n${conversation}\n\n請以GM身份回應。只回覆敘述文字。`;

    const reply = await callKiro(prompt);
    room.messages.push({ role: 'gm', text: reply });
    io.to(roomId).emit('gm-message', { text: reply });
    io.to(roomId).emit('gm-thinking', false);
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        const name = room.players.get(socket.id);
        room.players.delete(socket.id);
        io.to(roomId).emit('system', { text: `${name} 離開了房間。` });
        io.to(roomId).emit('players', Array.from(room.players.values()));
        if (room.players.size === 0) { rooms.delete(roomId); }
      }
    }
  });
});

// Keep REST endpoint as fallback
app.post('/api/gm', async (req, res) => {
  const { messages, scenario } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });
  const systemPrompt = PROMPTS[scenario || 'coc'] || PROMPTS.coc;
  const conversation = messages.map((m: any) => m.role === 'player' ? `[玩家]: ${m.text}` : `[GM]: ${m.text}`).join('\n');
  const reply = await callKiro(`${systemPrompt}\n\n${conversation}\n\n請以GM身份回應。只回覆敘述文字。`);
  res.json({ reply });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`TRPG server (multiplayer) on port ${PORT}`));
