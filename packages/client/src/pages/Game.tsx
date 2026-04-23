import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Props { id: string; scenario: string; onBack: () => void; }
interface Stats { [key: string]: number; strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; }
export interface GameChar { name: string; hp: number; maxHp: number; san: number; maxSan: number; stats: Stats; items: string[]; skills: Record<string, number>; }
interface Msg { role: 'gm' | 'player' | 'system'; text: string; player?: string; }

const COC_SKILLS: Record<string, number> = { '偵查': 25, '圖書館': 20, '聆聽': 20, '閃避': 20, '說服': 10, '心理學': 10, '急救': 30, '神秘學': 5, '撬鎖': 1, '潛行': 20, '格鬥': 25, '射擊': 20 };
const KAIDAN_SKILLS: Record<string, number> = { '觀察': 25, '聆聽': 20, '搜索': 20, '說服': 15, '冷靜': 20, '逃跑': 25, '靈感': 10, '急救': 30, '電子設備': 15, '駕駛': 20 };
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

const SERVER = import.meta.env.VITE_SERVER_URL || 'https://flatness-multiply-hatchback.ngrok-free.dev';

const loadChar = (scenario: string): GameChar => {
  const skills = scenario === 'kaidan' ? { ...KAIDAN_SKILLS } : { ...COC_SKILLS };
  try {
    const saved = localStorage.getItem('trpg-character');
    if (saved) {
      const c = JSON.parse(saved);
      return { name: c.name || '調查員', hp: c.maxHp || 10, maxHp: c.maxHp || 10, san: 65, maxSan: 99, stats: c.stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, items: scenario === 'kaidan' ? ['手機', '錢包', '鑰匙'] : ['手電筒', '筆記本', '鋼筆'], skills };
    }
  } catch {}
  return { name: '調查員', hp: 10, maxHp: 10, san: 65, maxSan: 99, stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, items: scenario === 'kaidan' ? ['手機', '錢包', '鑰匙'] : ['手電筒', '筆記本', '鋼筆'], skills };
};

function parseGmTags(text: string, char: GameChar, setChar: (fn: (c: GameChar) => GameChar) => void): { clean: string; systemMsgs: string[] } {
  const systemMsgs: string[] = [];
  let clean = text;
  let match;

  const rollRegex = /\[ROLL:(.+?):(.+?)\]/g;
  while ((match = rollRegex.exec(text)) !== null) {
    const skill = match[1], difficulty = match[2];
    const baseVal = char.skills[skill] || 25;
    let target = baseVal;
    if (difficulty === '困難') target = Math.floor(baseVal / 2);
    else if (difficulty === '極難') target = Math.floor(baseVal / 5);
    const roll = rollD100();
    const critSuccess = roll <= 5, fumble = roll >= 96, success = roll <= target;
    let result = `🎲 ${skill}檢定（${difficulty} ${target}%）：擲出 ${roll}`;
    if (critSuccess) result += ' → ⭐ 大成功！';
    else if (fumble) result += ' → 💀 大失敗！';
    else if (success) result += ' → ✅ 成功';
    else result += ' → ❌ 失敗';
    systemMsgs.push(result);
  }
  clean = clean.replace(rollRegex, '');

  const sanRegex = /\[SAN:(\d+(?:d\d+)?)\]/g;
  while ((match = sanRegex.exec(text)) !== null) {
    const val = match[1];
    let loss = val.includes('d') ? (() => { const [n, s] = val.split('d').map(Number); let t = 0; for (let i = 0; i < (n||1); i++) t += Math.floor(Math.random()*s)+1; return t; })() : parseInt(val);
    systemMsgs.push(`🧠 SAN -${loss}`);
    setChar(c => ({ ...c, san: Math.max(0, c.san - loss) }));
  }
  clean = clean.replace(sanRegex, '');

  const dmgRegex = /\[DMG:(\d+)\]/g;
  while ((match = dmgRegex.exec(text)) !== null) {
    const loss = parseInt(match[1]);
    systemMsgs.push(`💔 HP -${loss}`);
    setChar(c => ({ ...c, hp: Math.max(0, c.hp - loss) }));
  }
  clean = clean.replace(dmgRegex, '');

  const itemRegex = /\[ITEM:(.+?)\]/g;
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1];
    systemMsgs.push(`🎒 獲得：${item}`);
    setChar(c => ({ ...c, items: [...c.items, item] }));
  }
  clean = clean.replace(itemRegex, '');

  const clueRegex = /\[CLUE:(.+?)\]/g;
  while ((match = clueRegex.exec(text)) !== null) { systemMsgs.push(`🔍 線索：${match[1]}`); }
  clean = clean.replace(clueRegex, '');

  return { clean: clean.trim(), systemMsgs };
}

export default function Game({ id, scenario, onBack }: Props) {
  const [char, setChar] = useState<GameChar>(() => loadChar(scenario));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const socket = io(SERVER);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { roomId: id, scenario, playerName: char.name });
    });

    socket.on('gm-message', ({ text }: { text: string }) => {
      const { clean, systemMsgs } = parseGmTags(text, char, setChar);
      setMessages(prev => [...prev, ...systemMsgs.map(s => ({ role: 'system' as const, text: s })), { role: 'gm', text: clean }]);
      setLoading(false);
    });

    socket.on('player-message', ({ player, text }: { player: string; text: string }) => {
      setMessages(prev => [...prev, { role: 'player', text, player }]);
    });

    socket.on('system', ({ text }: { text: string }) => {
      setMessages(prev => [...prev, { role: 'system', text }]);
    });

    socket.on('history', (history: Array<{role: string; text: string; player?: string}>) => {
      setMessages(history.map(m => ({ role: m.role as Msg['role'], text: m.text, player: m.player })));
      setLoading(false);
    });

    socket.on('players', (list: string[]) => { setPlayers(list); });
    socket.on('gm-thinking', (thinking: boolean) => { setLoading(thinking); });

    return () => { socket.disconnect(); };
  }, []);

  const send = () => {
    if (!input.trim() || loading || !socketRef.current) return;
    socketRef.current.emit('player-action', { roomId: id, text: input.trim() });
    setInput('');
  };

  const hpPct = (char.hp / char.maxHp) * 100;
  const sanPct = (char.san / char.maxSan) * 100;
  const title = scenario === 'kaidan' ? '👻 都市怪談' : '🐙 克蘇魯的呼喚';

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
        <h2>{title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>👥 {players.length} 人 | 房間: {id}</span>
          <button onClick={onBack} style={{ background: 'var(--bg-card)' }}>← 返回</button>
        </div>
      </header>
      <div className="game-layout">
        <div className="game-main">
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem', minHeight: 400, maxHeight: '70vh', overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1rem', padding: '0.6rem', borderRadius: 8, background: m.role === 'gm' ? 'var(--bg-card)' : m.role === 'system' ? 'var(--bg-primary)' : 'transparent', borderLeft: m.role === 'player' ? '3px solid var(--accent)' : 'none' }}>
                {m.role === 'gm' && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>🎭 GM</span>}
                {m.role === 'player' && <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>🧑 {m.player || char.name}</span>}
                {m.role === 'system' && <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>⚙️ 系統</span>}
                <p style={{ marginTop: '0.3rem', lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: m.role === 'system' ? '0.9rem' : '1rem' }}>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div style={{ padding: '0.6rem', borderRadius: 8, background: 'var(--bg-card)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>🎭 GM</span>
                <p style={{ marginTop: '0.3rem', color: 'var(--text-secondary)' }}>正在思考...</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input style={{ flex: 1 }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="輸入你想做的事..." disabled={loading} />
            <button onClick={send} disabled={loading}>{loading ? '...' : '送出'}</button>
          </div>
        </div>
        <div className="game-sidebar">
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
            <h3>📜 {char.name}</h3>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>❤️ HP</span><span>{char.hp}/{char.maxHp}</span></div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 8, marginTop: 2 }}>
                <div style={{ background: hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#fbbf24' : '#f87171', width: `${hpPct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>🧠 SAN</span><span>{char.san}/{char.maxSan}</span></div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 8, marginTop: 2 }}>
                <div style={{ background: sanPct > 50 ? '#a78bfa' : sanPct > 25 ? '#fbbf24' : '#f87171', width: `${sanPct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginTop: '0.5rem' }}>
              {Object.entries(char.stats).map(([k, v]) => (
                <span key={k} style={{ fontSize: '0.8rem' }}>{k.slice(0, 3).toUpperCase()}: {v as number}</span>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
            <h3>🎯 技能</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem', marginTop: '0.5rem' }}>
              {Object.entries(char.skills).map(([k, v]) => (
                <span key={k} style={{ fontSize: '0.8rem' }}>{k}: {v}%</span>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
            <h3>👥 玩家 ({players.length})</h3>
            {players.map((p, i) => <p key={i} style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>🧑 {p}</p>)}
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
            <h3>🎒 物品</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
              {char.items.map((item, i) => (
                <span key={i} style={{ fontSize: '0.8rem', background: 'var(--bg-card)', borderRadius: 4, padding: '0.15rem 0.5rem' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
