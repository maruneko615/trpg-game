import { useState } from 'react';
import type { GameChar } from '../pages/Game';

interface Choice {
  id: string;
  text: string;
  nextSceneId?: string;
  failSceneId?: string;
  check?: { stat: string; dc: number };
}
interface SceneEffect { damage?: number; heal?: number; items?: string[]; exp?: number; }
interface Scene { id: string; description: string; choices: Choice[]; effect?: SceneEffect; }

interface Props {
  char: GameChar;
  addLog?: (msg: string) => void;
  takeDamage?: (dmg: number) => void;
  heal?: (amount: number) => void;
  addItem?: (item: string) => void;
  gainExp?: (exp: number) => void;
}

const SCENES: Scene[] = [
  {
    id: 'start',
    description: '你站在一座古老城堡的入口前，空氣中瀰漫著神秘的氣息...',
    choices: [
      { id: '1', text: '推開大門', nextSceneId: 'hall' },
      { id: '2', text: '繞到後方', nextSceneId: 'garden' },
      { id: '3', text: '嘗試攀爬城牆', nextSceneId: 'wall_success', failSceneId: 'wall_fail', check: { stat: 'DEX', dc: 12 } },
    ],
  },
  {
    id: 'wall_success',
    description: '你靈巧地攀上城牆，從高處俯瞰城堡內部。你發現了一條隱密的通道直通塔樓！',
    choices: [
      { id: '1', text: '走隱密通道', nextSceneId: 'tower' },
      { id: '2', text: '跳下去進入大廳', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'wall_fail',
    description: '你試圖攀爬城牆，但石頭太滑了！你摔了下來，受了點輕傷。',
    effect: { damage: 2 },
    choices: [
      { id: '1', text: '改走大門', nextSceneId: 'hall' },
      { id: '2', text: '繞到後方', nextSceneId: 'garden' },
    ],
  },
  {
    id: 'hall',
    description: '你走進了一座宏偉的大廳。火把在牆上搖曳，照亮了兩條走廊。左邊傳來微弱的哭聲，右邊則有金屬碰撞的聲音。',
    choices: [
      { id: '1', text: '走向左邊（哭聲）', nextSceneId: 'prison' },
      { id: '2', text: '走向右邊（金屬聲）', nextSceneId: 'armory' },
      { id: '3', text: '仔細觀察大廳（感知檢定）', nextSceneId: 'statue', failSceneId: 'hall_nothing', check: { stat: 'WIS', dc: 10 } },
    ],
  },
  {
    id: 'hall_nothing',
    description: '你環顧四周，但沒有發現什麼特別的東西。也許該選一條走廊前進。',
    choices: [
      { id: '1', text: '走向左邊（哭聲）', nextSceneId: 'prison' },
      { id: '2', text: '走向右邊（金屬聲）', nextSceneId: 'armory' },
    ],
  },
  {
    id: 'garden',
    description: '你繞到城堡後方，發現了一座荒廢的花園。枯萎的藤蔓中隱約可見一口古井，旁邊有一扇上鎖的側門。',
    choices: [
      { id: '1', text: '查看古井', nextSceneId: 'well' },
      { id: '2', text: '撬開側門的鎖（敏捷檢定）', nextSceneId: 'kitchen', failSceneId: 'garden_locked', check: { stat: 'DEX', dc: 13 } },
    ],
  },
  {
    id: 'garden_locked',
    description: '你嘗試撬鎖，但鎖太堅固了，撬鎖工具斷了。看來只能找別的路了。',
    choices: [
      { id: '1', text: '查看古井', nextSceneId: 'well' },
      { id: '2', text: '回到城堡正門', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'prison',
    description: '你來到一間地牢。一位被鎖鏈束縛的老人看到你：「冒險者！請救救我，我知道城堡的秘密！」',
    choices: [
      { id: '1', text: '用蠻力扯開鎖鏈（力量檢定）', nextSceneId: 'rescue', failSceneId: 'prison_stuck', check: { stat: 'STR', dc: 14 } },
      { id: '2', text: '嘗試巧妙開鎖（敏捷檢定）', nextSceneId: 'rescue', failSceneId: 'prison_stuck', check: { stat: 'DEX', dc: 11 } },
      { id: '3', text: '先詢問城堡的秘密', nextSceneId: 'secret' },
    ],
  },
  {
    id: 'prison_stuck',
    description: '你試了好幾次，但鎖鏈紋絲不動。老人嘆了口氣：「也許你可以在武器庫找到工具...」',
    choices: [
      { id: '1', text: '去武器庫找工具', nextSceneId: 'armory' },
      { id: '2', text: '先聽聽城堡的秘密', nextSceneId: 'secret' },
    ],
  },
  {
    id: 'rescue',
    description: '你成功打開了鎖鏈！老人感激地握住你的手：「城堡的主人是一位墮落的巫師，他的力量來源在塔樓。拿著這把鑰匙！」',
    effect: { items: ['古老鑰匙'], exp: 20 },
    choices: [
      { id: '1', text: '前往塔樓', nextSceneId: 'tower' },
      { id: '2', text: '回大廳探索更多', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'secret',
    description: '老人壓低聲音：「大廳的雕像藏著通往密室的機關，密室裡有能對抗巫師的聖劍。轉動雕像的眼睛就能打開。」',
    choices: [
      { id: '1', text: '去檢查大廳的雕像', nextSceneId: 'statue' },
      { id: '2', text: '先救出老人', nextSceneId: 'prison' },
    ],
  },
  {
    id: 'armory',
    description: '你走進武器庫。一隻骷髏兵突然從角落站起來，舉起生鏽的劍向你衝來！',
    choices: [
      { id: '1', text: '⚔️ 拔劍迎戰（力量檢定）', nextSceneId: 'combat_win', failSceneId: 'combat_lose', check: { stat: 'STR', dc: 11 } },
      { id: '2', text: '🛡️ 閃避攻擊（敏捷檢定）', nextSceneId: 'combat_dodge', failSceneId: 'combat_hit', check: { stat: 'DEX', dc: 12 } },
      { id: '3', text: '🏃 轉身逃跑', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'combat_win',
    description: '你一劍劈碎了骷髏兵！在碎骨中你發現了一瓶發光的藥水。',
    effect: { items: ['生命藥水'], exp: 30 },
    choices: [
      { id: '1', text: '搜索武器庫', nextSceneId: 'find_armor' },
      { id: '2', text: '回到大廳', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'combat_lose',
    description: '骷髏兵的攻擊比你想像的快！你被劍刃劃傷了手臂。但你趁機反擊，最終還是將它擊碎了。',
    effect: { damage: 3, exp: 30 },
    choices: [
      { id: '1', text: '搜索武器庫', nextSceneId: 'find_armor' },
      { id: '2', text: '回到大廳', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'combat_dodge',
    description: '你靈巧地閃過骷髏兵的攻擊，繞到它身後一腳將它踢散！漂亮的身手！',
    choices: [
      { id: '1', text: '搜索武器庫', nextSceneId: 'find_armor' },
    ],
  },
  {
    id: 'combat_hit',
    description: '你沒能完全閃開，肩膀被劃了一道傷口。你咬牙反擊，終於將骷髏兵擊倒。',
    effect: { damage: 4, exp: 30 },
    choices: [
      { id: '1', text: '搜索武器庫', nextSceneId: 'find_armor' },
    ],
  },
  {
    id: 'find_armor',
    description: '你在武器庫深處找到了一套保存完好的鎖子甲。穿上它，防禦力大幅提升！',
    effect: { items: ['鎖子甲'] },
    choices: [{ id: '1', text: '回到大廳', nextSceneId: 'hall' }],
  },
  {
    id: 'statue',
    description: '大廳中央的雕像是一位手持法杖的魔法師。底座刻著：「智者之眼能看見隱藏之門。」雕像的眼睛似乎可以轉動。',
    choices: [
      { id: '1', text: '轉動雕像的眼睛（智力檢定）', nextSceneId: 'secret_room', failSceneId: 'statue_fail', check: { stat: 'INT', dc: 10 } },
      { id: '2', text: '回到走廊', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'statue_fail',
    description: '你轉動了眼睛，但似乎轉錯了方向。雕像噴出一陣煙霧，嗆得你直咳嗽。也許該換個方向試試？',
    choices: [
      { id: '1', text: '再試一次（智力檢定）', nextSceneId: 'secret_room', failSceneId: 'statue_fail2', check: { stat: 'INT', dc: 8 } },
      { id: '2', text: '放棄，去別處探索', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'statue_fail2',
    description: '又失敗了...雕像似乎在嘲笑你。還是先去別處看看吧。',
    choices: [{ id: '1', text: '回到大廳', nextSceneId: 'hall' }],
  },
  {
    id: 'secret_room',
    description: '雕像的眼睛轉動後，地板出現了一道暗門！你走下階梯，來到密室。牆上掛著一把散發聖光的劍！',
    effect: { items: ['聖光之劍'], exp: 50 },
    choices: [{ id: '1', text: '帶著聖劍前往塔樓', nextSceneId: 'tower' }],
  },
  {
    id: 'well',
    description: '你往古井裡望去，深不見底。井壁上有可以攀爬的石階。',
    choices: [
      { id: '1', text: '爬下古井（體質檢定）', nextSceneId: 'underground', failSceneId: 'well_fall', check: { stat: 'CON', dc: 11 } },
      { id: '2', text: '回到花園', nextSceneId: 'garden' },
    ],
  },
  {
    id: 'well_fall',
    description: '石階太滑了，你腳一滑摔進了水裡！好在水不深，但你全身濕透了。',
    effect: { damage: 2 },
    choices: [
      { id: '1', text: '繼續探索地下', nextSceneId: 'underground' },
      { id: '2', text: '爬回地面', nextSceneId: 'garden' },
    ],
  },
  {
    id: 'underground',
    description: '你來到地下洞穴。河對岸閃爍著寶箱的光芒，但河中有什麼東西在游動...',
    choices: [
      { id: '1', text: '游過去（力量檢定）', nextSceneId: 'treasure', failSceneId: 'river_monster', check: { stat: 'STR', dc: 13 } },
      { id: '2', text: '沿河岸走', nextSceneId: 'river_path' },
      { id: '3', text: '爬回地面', nextSceneId: 'garden' },
    ],
  },
  {
    id: 'river_monster',
    description: '河中的生物是一條水蛇！它咬了你一口。你奮力游到對岸，總算拿到了寶箱。',
    effect: { damage: 3, items: ['智慧護符'], exp: 20 },
    choices: [{ id: '1', text: '回到地面', nextSceneId: 'garden' }],
  },
  {
    id: 'treasure',
    description: '你順利游過地下河，打開寶箱！',
    effect: { items: ['智慧護符'], exp: 20 },
    choices: [{ id: '1', text: '回到地面繼續冒險', nextSceneId: 'garden' }],
  },
  {
    id: 'river_path',
    description: '你沿著河岸走，發現了一條通往塔樓底部的密道！',
    choices: [
      { id: '1', text: '走密道前往塔樓', nextSceneId: 'tower' },
      { id: '2', text: '回到古井', nextSceneId: 'underground' },
    ],
  },
  {
    id: 'kitchen',
    description: '你從側門進入廚房。灶台上還有餘溫，桌上放著半吃完的食物。',
    choices: [
      { id: '1', text: '搜索廚房（感知檢定）', nextSceneId: 'find_potion', failSceneId: 'kitchen_nothing', check: { stat: 'WIS', dc: 9 } },
      { id: '2', text: '繼續往城堡深處走', nextSceneId: 'hall' },
    ],
  },
  {
    id: 'find_potion',
    description: '你在隱藏的櫃子裡找到了兩瓶魔力藥水！',
    effect: { items: ['魔力藥水', '魔力藥水'] },
    choices: [{ id: '1', text: '前往大廳', nextSceneId: 'hall' }],
  },
  {
    id: 'kitchen_nothing',
    description: '你翻了翻廚房，只找到一些發霉的麵包。算了，繼續前進吧。',
    choices: [{ id: '1', text: '前往大廳', nextSceneId: 'hall' }],
  },
  {
    id: 'tower',
    description: '你來到塔樓頂端。黑暗巫師正在進行邪惡的儀式，紫色的能量在他周圍旋轉。他轉過身來冷笑：「又一個不自量力的冒險者...」',
    choices: [
      { id: '1', text: '⚔️ 發起攻擊！（力量檢定）', nextSceneId: 'final_win', failSceneId: 'final_struggle', check: { stat: 'STR', dc: 14 } },
      { id: '2', text: '🧙 用魔法對抗（智力檢定）', nextSceneId: 'final_win', failSceneId: 'final_struggle', check: { stat: 'INT', dc: 14 } },
      { id: '3', text: '💬 嘗試說服他（魅力檢定）', nextSceneId: 'persuade_win', failSceneId: 'persuade_fail', check: { stat: 'CHA', dc: 16 } },
    ],
  },
  {
    id: 'final_struggle',
    description: '巫師的力量比你想像的強大！你被黑暗魔法擊退。但你不會放棄！',
    effect: { damage: 5 },
    choices: [
      { id: '1', text: '再次衝鋒！（力量檢定 DC 降低）', nextSceneId: 'final_win', failSceneId: 'final_barely', check: { stat: 'STR', dc: 10 } },
      { id: '2', text: '尋找弱點（感知檢定）', nextSceneId: 'final_win', failSceneId: 'final_barely', check: { stat: 'WIS', dc: 11 } },
    ],
  },
  {
    id: 'final_barely',
    description: '經過一番苦戰，你拼盡全力終於擊破了巫師的防禦！雖然傷痕累累，但你贏了！',
    choices: [{ id: '1', text: '繼續...', nextSceneId: 'final_win' }],
  },
  {
    id: 'persuade_win',
    description: '你的話語觸動了巫師內心深處殘存的善良。他停下儀式，淚流滿面：「我...我到底做了什麼...」黑暗能量消散，巫師恢復了理智。',
    choices: [{ id: '1', text: '繼續...', nextSceneId: 'ending' }],
  },
  {
    id: 'persuade_fail',
    description: '巫師大笑：「天真！」他向你發射了一道黑暗魔法。看來只能用武力解決了！',
    effect: { damage: 4 },
    choices: [
      { id: '1', text: '⚔️ 戰鬥！', nextSceneId: 'final_struggle' },
    ],
  },
  {
    id: 'final_win',
    description: '你擊敗了黑暗巫師！隨著他倒下，城堡上空的烏雲散去，陽光重新照耀大地。',
    choices: [{ id: '1', text: '繼續...', nextSceneId: 'ending' }],
  },
  {
    id: 'ending',
    description: '🎉 恭喜通關！\n\n你成為了拯救這片土地的英雄！城堡周圍的村民們歡呼著你的名字。\n\n🏆 冒險結束。感謝遊玩！',
    effect: { exp: 100, heal: 999 },
    choices: [{ id: '1', text: '🔄 重新開始冒險', nextSceneId: 'start' }],
  },
];

const STAT_MAP: Record<string, string> = { STR: '力量', DEX: '敏捷', CON: '體質', INT: '智力', WIS: '感知', CHA: '魅力' };

interface DiceState { rolling: boolean; result: number | null; dc: number; stat: string; success: boolean | null; choiceSuccess: string; choiceFail: string; }

export default function SceneDisplay({ char, addLog, takeDamage, heal, addItem, gainExp }: Props) {
  const [sceneId, setSceneId] = useState('start');
  const [dice, setDice] = useState<DiceState | null>(null);
  const scene = SCENES.find(s => s.id === sceneId) || SCENES[0];

  const goToScene = (id: string) => {
    const target = SCENES.find(s => s.id === id);
    if (target?.effect) {
      const e = target.effect;
      if (e.damage) takeDamage?.(e.damage);
      if (e.heal) heal?.(e.heal);
      if (e.items) e.items.forEach(item => addItem?.(item));
      if (e.exp) gainExp?.(e.exp);
    }
    setSceneId(id);
  };

  const STAT_KEY_MAP: Record<string, string> = { STR: 'strength', DEX: 'dexterity', CON: 'constitution', INT: 'intelligence', WIS: 'wisdom', CHA: 'charisma' };
  const getModifier = (stat: string) => Math.floor(((char.stats[STAT_KEY_MAP[stat]] || 10) - 10) / 2);

  const handleChoice = (c: Choice) => {
    if (c.check && c.failSceneId) {
      addLog?.(`▶ ${c.text}`);
      // Start dice roll animation
      setDice({ rolling: true, result: null, dc: c.check.dc, stat: c.check.stat, success: null, choiceSuccess: c.nextSceneId!, choiceFail: c.failSceneId });
      let ticks = 0;
      const interval = setInterval(() => {
        setDice(prev => prev ? { ...prev, result: Math.floor(Math.random() * 20) + 1 } : null);
        ticks++;
        if (ticks >= 10) {
          clearInterval(interval);
          const finalRoll = Math.floor(Math.random() * 20) + 1;
          const mod = getModifier(c.check!.stat);
          const total = finalRoll + mod;
          const success = total >= c.check!.dc;
          const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
          const msg = `🎲 ${STAT_MAP[c.check!.stat]}檢定：擲出 ${finalRoll}${modStr}=${total}（需要 ≥${c.check!.dc}）→ ${success ? '✅ 成功！' : '❌ 失敗！'}`;
          addLog?.(msg);
          setDice(prev => prev ? { ...prev, rolling: false, result: finalRoll, success } : null);
        }
      }, 100);
    } else if (c.nextSceneId) {
      addLog?.(`▶ ${c.text}`);
      setDice(null);
      goToScene(c.nextSceneId);
    }
  };

  const confirmDice = () => {
    if (!dice) return;
    goToScene(dice.success ? dice.choiceSuccess : dice.choiceFail);
    setDice(null);
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
      <h3>🏰 場景</h3>
      <p style={{ marginTop: '0.5rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{scene.description}</p>

      {dice && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{STAT_MAP[dice.stat]}檢定（DC {dice.dc}）</p>
          <p style={{ fontSize: '3rem', margin: '0.5rem 0', fontWeight: 'bold', color: dice.rolling ? 'var(--text-primary)' : dice.success ? '#4ade80' : '#f87171' }}>
            🎲 {dice.result ?? '?'}
          </p>
          {!dice.rolling && dice.success !== null && (
            <>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: dice.success ? '#4ade80' : '#f87171' }}>
                {dice.success ? '✅ 成功！' : '❌ 失敗！'}
              </p>
              <button onClick={confirmDice} style={{ marginTop: '0.5rem' }}>繼續</button>
            </>
          )}
        </div>
      )}

      {!dice && scene.choices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.8rem' }}>
          {scene.choices.map((c) => (
            <button key={c.id} onClick={() => handleChoice(c)} style={{ background: 'var(--bg-card)', textAlign: 'left' }}>
              {c.text}
              {c.check && <span style={{ float: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🎲 {c.check.stat} DC{c.check.dc}</span>}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
