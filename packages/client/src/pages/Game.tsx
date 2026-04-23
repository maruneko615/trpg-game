import { useState, useRef, useEffect } from 'react';

interface Props { id: string; onBack: () => void; }
interface Stats { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; }
interface GameChar { name: string; hp: number; maxHp: number; san: number; maxSan: number; stats: Stats; items: string[]; skills: Record<string, number>; }
interface Msg { role: 'gm' | 'player' | 'system'; text: string; }

const COC_SKILLS: Record<string, number> = { '偵查': 25, '圖書館': 20, '聆聽': 20, '閃避': 20, '說服': 10, '心理學': 10, '急救': 30, '神秘學': 5, '撬鎖': 1, '潛行': 20, '攀爬': 20, '游泳': 20, '格鬥': 25, '射擊': 20 };
const rollD100 = () => Math.floor(Math.random() * 100) + 1;

const loadChar = (): GameChar => {
  try {
    const saved = localStorage.getItem('trpg-character');
    if (saved) {
      const c = JSON.parse(saved);
      const hp = c.maxHp || 10;
      return { name: c.name || '調查員', hp, maxHp: hp, san: 65, maxSan: 99, stats: c.stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, items: ['手電筒', '筆記本', '鋼筆'], skills: { ...COC_SKILLS } };
    }
  } catch {}
  return { name: '調查員', hp: 10, maxHp: 10, san: 65, maxSan: 99, stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, items: ['手電筒', '筆記本', '鋼筆'], skills: { ...COC_SKILLS } };
};

const OPENING = `🐙 **克蘇魯的呼喚**

1925年，美國麻薩諸塞州，阿卡姆鎮。

你是一名私家偵探。三天前，你的老友——米斯卡塔尼克大學的考古學教授亨利·阿米蒂奇——寄來一封信，信中語氣急切：

「我發現了不該發現的東西。那些符號...它們在我夢中低語。請來找我，在我還清醒的時候。」

然而當你趕到阿卡姆時，教授已經失蹤了。他的辦公室一片狼藉，桌上散落著奇怪的筆記和一本皮革封面的古書。窗戶大開，夜風吹動窗簾。

現在是深夜11點。你站在教授空無一人的辦公室裡。月光透過窗戶灑在地板上，照亮了地上的一灘...是墨水嗎？還是別的什麼？

空氣中瀰漫著一股奇異的腥味。

**你想做什麼？**`;

function parseGmTags(text: string, char: GameChar, setChar: (fn: (c: GameChar) => GameChar) => void): { clean: string; systemMsgs: string[] } {
  const systemMsgs: string[] = [];
  let clean = text;

  // Process [ROLL:skill:difficulty]
  const rollRegex = /\[ROLL:(.+?):(.+?)\]/g;
  let match;
  while ((match = rollRegex.exec(text)) !== null) {
    const skill = match[1];
    const difficulty = match[2];
    const baseVal = char.skills[skill] || 25;
    let target = baseVal;
    if (difficulty === '困難') target = Math.floor(baseVal / 2);
    else if (difficulty === '極難') target = Math.floor(baseVal / 5);
    const roll = rollD100();
    const success = roll <= target;
    const critSuccess = roll <= 5;
    const fumble = roll >= 96;
    let result = `🎲 ${skill}檢定（${difficulty} ${target}%）：擲出 ${roll}`;
    if (critSuccess) result += ' → ⭐ 大成功！';
    else if (fumble) result += ' → 💀 大失敗！';
    else if (success) result += ' → ✅ 成功';
    else result += ' → ❌ 失敗';
    systemMsgs.push(result);
  }
  clean = clean.replace(rollRegex, '');

  // Process [SAN:value]
  const sanRegex = /\[SAN:(\d+(?:d\d+)?)\]/g;
  while ((match = sanRegex.exec(text)) !== null) {
    const val = match[1];
    let loss: number;
    if (val.includes('d')) {
      const [n, sides] = val.split('d').map(Number);
      loss = 0;
      for (let i = 0; i < (n || 1); i++) loss += Math.floor(Math.random() * sides) + 1;
    } else {
      loss = parseInt(val);
    }
    systemMsgs.push(`🧠 SAN -${loss}`);
    setChar(c => ({ ...c, san: Math.max(0, c.san - loss) }));
  }
  clean = clean.replace(sanRegex, '');

  // Process [DMG:value]
  const dmgRegex = /\[DMG:(\d+)\]/g;
  while ((match = dmgRegex.exec(text)) !== null) {
    const loss = parseInt(match[1]);
    systemMsgs.push(`💔 HP -${loss}`);
    setChar(c => ({ ...c, hp: Math.max(0, c.hp - loss) }));
  }
  clean = clean.replace(dmgRegex, '');

  // Process [ITEM:name]
  const itemRegex = /\[ITEM:(.+?)\]/g;
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1];
    systemMsgs.push(`🎒 獲得：${item}`);
    setChar(c => ({ ...c, items: [...c.items, item] }));
  }
  clean = clean.replace(itemRegex, '');

  // Process [CLUE:content]
  const clueRegex = /\[CLUE:(.+?)\]/g;
  while ((match = clueRegex.exec(text)) !== null) {
    systemMsgs.push(`🔍 線索：${match[1]}`);
  }
  clean = clean.replace(clueRegex, '');

  return { clean: clean.trim(), systemMsgs };
}

export default function Game({ id, onBack }: Props) {
  const [char, setChar] = useState<GameChar>(loadChar);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'gm', text: OPENING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Keep conversation history for API
  const apiHistory = useRef<Array<{role: string; text: string}>>([{ role: 'gm', text: OPENING }]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const playerText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'player', text: playerText }]);
    apiHistory.current.push({ role: 'player', text: playerText });
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/gm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiHistory.current }),
      });
      const data = await res.json();
      const rawReply = data.reply || 'GM 沉默了...';

      const { clean, systemMsgs } = parseGmTags(rawReply, char, setChar);

      const newMsgs: Msg[] = [];
      systemMsgs.forEach(s => newMsgs.push({ role: 'system', text: s }));
      newMsgs.push({ role: 'gm', text: clean });

      setMessages(prev => [...prev, ...newMsgs]);
      apiHistory.current.push({ role: 'gm', text: clean });
    } catch {
      setMessages(prev => [...prev, { role: 'system', text: '⚠️ 連線錯誤，請重試' }]);
    }
    setLoading(false);
  };

  const hpPct = (char.hp / char.maxHp) * 100;
  const sanPct = (char.san / char.maxSan) * 100;

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
        <h2>🐙 克蘇魯的呼喚</h2>
        <button onClick={onBack} style={{ background: 'var(--bg-card)' }}>← 返回</button>
      </header>
      <div className="game-layout">
        <div className="game-main">
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem', minHeight: 400, maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: '1rem', padding: '0.6rem', borderRadius: 8, background: m.role === 'gm' ? 'var(--bg-card)' : m.role === 'system' ? 'var(--bg-primary)' : 'transparent', borderLeft: m.role === 'player' ? '3px solid var(--accent)' : 'none' }}>
                  {m.role === 'gm' && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>🎭 GM</span>}
                  {m.role === 'player' && <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>🧑 {char.name}</span>}
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
