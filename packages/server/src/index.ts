import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const PROMPTS: Record<string, string> = {
  coc: `你是一個克蘇魯的呼喚（Call of Cthulhu）TRPG 的 GM（守密人）。

規則：
- 使用繁體中文，以第二人稱描述場景
- 營造恐怖、懸疑、不安的洛夫克拉夫特風格氛圍
- 當玩家行動需要技能檢定時，在回應最後加上 [ROLL:技能名:難度]，例如 [ROLL:偵查:普通]
- 可用技能：偵查、圖書館、聆聽、閃避、說服、心理學、急救、神秘學、撬鎖、潛行、格鬥、射擊
- 難度：普通、困難、極難
- 看到恐怖事物加 [SAN:數值]，受傷加 [DMG:數值]，獲得物品加 [ITEM:物品名]，獲得線索加 [CLUE:線索]
- 每次結尾問「你想做什麼？」，控制在200字以內，不替玩家做決定
- 只回覆GM的敘述文字，不要使用任何工具

背景：1925年阿卡姆鎮，玩家是私家偵探，調查教授亨利·阿米蒂奇失蹤案。`,

  kaidan: `你是一個日式都市怪談 TRPG 的 GM（遊戲主持人）。

規則：
- 使用繁體中文，以第二人稱描述場景
- 營造日式恐怖氛圍：安靜中的不對勁、似有若無的異象、心理壓迫感
- 風格參考：伊藤潤二、都市傳說、學校怪談、深夜的東京
- 當玩家行動需要技能檢定時，在回應最後加上 [ROLL:技能名:難度]，例如 [ROLL:觀察:普通]
- 可用技能：觀察、聆聽、搜索、說服、冷靜、逃跑、靈感、急救、電子設備、駕駛
- 難度：普通、困難、極難
- 看到恐怖事物加 [SAN:數值]（理智值損失），受傷加 [DMG:數值]
- 獲得物品加 [ITEM:物品名]，獲得線索加 [CLUE:線索]
- 每次結尾問「你想做什麼？」，控制在200字以內，不替玩家做決定
- 恐怖要含蓄、暗示性的，不要直接描述血腥場面
- 只回覆GM的敘述文字，不要使用任何工具

背景：現代東京，玩家是大學生，調查室友佐藤美咲的失蹤。美咲失蹤前留下訊息「不要接那通電話」，她的手機每天凌晨2:37會響起，來電顯示是她自己的號碼。`,
};

function callKiro(messages: Array<{role: string; text: string}>, scenario: string): Promise<string> {
  return new Promise((resolve) => {
    const systemPrompt = PROMPTS[scenario] || PROMPTS.coc;
    const conversation = messages.map(m =>
      m.role === 'player' ? `[玩家]: ${m.text}` : `[GM]: ${m.text}`
    ).join('\n');

    const prompt = `${systemPrompt}\n\n以下是目前的對話記錄：\n${conversation}\n\n請以GM身份回應玩家最後的行動。只回覆GM的敘述文字。`;

    execFile('kiro-cli', ['chat', '--no-interactive', '--wrap', 'never', '--trust-tools=', prompt], {
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    }, (error, stdout) => {
      if (error) {
        console.log(`[Kiro] Error: ${error.message}`);
        resolve('（GM 暫時無法回應，請再試一次）');
        return;
      }

      const lines = stdout.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[\?[0-9]*[hl]/g, '').replace(/\x1b\[[\d]*G/g, '').split('\n');
      let response = '';
      let capture = false;
      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('> ')) {
          capture = true;
          response += t.substring(2) + '\n';
        } else if (capture && t.length > 0 && !t.includes('Time:') && !t.includes('▸')) {
          response += t + '\n';
        }
      }

      if (!response.trim()) {
        response = lines.filter(l => {
          const t = l.trim();
          return t.length > 0 && !t.includes('tools are now') && !t.includes('Learn more') && !t.includes('kiro.dev') && !t.includes('Time:') && !t.includes('▸') && !t.includes('WARNING') && !t.includes('Agents can sometimes');
        }).join('\n');
      }

      const result = response.trim() || '（GM 思考中...請再試一次）';
      console.log(`[Kiro][${scenario}] Response: ${result.substring(0, 100)}...`);
      resolve(result);
    });
  });
}

app.post('/api/gm', async (req, res) => {
  try {
    const { messages, scenario } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });
    console.log(`[GM] ${scenario || 'coc'} - ${messages.length} messages`);
    const reply = await callKiro(messages, scenario || 'coc');
    res.json({ reply });
  } catch (e: any) {
    console.log(`[GM] Error:`, e.message);
    res.status(500).json({ error: e.message || 'GM error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`TRPG server (Kiro GM) listening on port ${PORT}`));
