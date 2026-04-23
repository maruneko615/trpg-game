import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `你是一個克蘇魯的呼喚（Call of Cthulhu）TRPG 的 GM（守密人）。

規則：
- 使用繁體中文
- 以第二人稱描述場景
- 營造恐怖、懸疑、不安的洛夫克拉夫特風格氛圍
- 當玩家行動需要技能檢定時，在回應最後加上 [ROLL:技能名:難度]，例如 [ROLL:偵查:普通]
- 可用技能：偵查、圖書館、聆聽、閃避、說服、心理學、急救、神秘學、撬鎖、潛行、格鬥、射擊
- 難度：普通、困難、極難
- 看到恐怖事物加 [SAN:數值]，例如 [SAN:1]
- 受傷加 [DMG:數值]
- 獲得物品加 [ITEM:物品名]
- 獲得線索加 [CLUE:線索]
- 每次結尾問「你想做什麼？」
- 控制在200字以內，不替玩家做決定
- 只回覆GM的敘述文字，不要使用任何工具

背景：1925年阿卡姆鎮，玩家是私家偵探，調查教授亨利·阿米蒂奇失蹤案。`;

function callKiro(messages: Array<{role: string; text: string}>): Promise<string> {
  return new Promise((resolve) => {
    const conversation = messages.map(m =>
      m.role === 'player' ? `[玩家]: ${m.text}` : `[GM]: ${m.text}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\n以下是目前的對話記錄：\n${conversation}\n\n請以GM身份回應玩家最後的行動。只回覆GM的敘述文字。`;

    execFile('kiro-cli', ['chat', '--no-interactive', '--wrap', 'never', '--trust-tools=', prompt], {
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        console.log(`[Kiro] Error: ${error.message}`);
        resolve('（GM 暫時無法回應，請再試一次）');
        return;
      }

      // Clean ANSI codes and extract the actual response
      const clean = stdout
        .replace(/\x1b\[[0-9;]*m/g, '')
        .replace(/\x1b\[\?[0-9]*[hl]/g, '')
        .replace(/\x1b\[[\d]*G/g, '')
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0
            && !trimmed.includes('tools are now')
            && !trimmed.includes('Learn more')
            && !trimmed.includes('kiro.dev')
            && !trimmed.includes('Time:')
            && !trimmed.includes('▸')
            && !trimmed.includes('WARNING')
            && !trimmed.startsWith('>')
            && !trimmed.includes('Agents can sometimes');
        })
        .join('\n')
        .trim();

      // Also try to get text after '>' marker
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

      const result = (response.trim() || clean || '（GM 思考中...請再試一次）');
      console.log(`[Kiro] Response: ${result.substring(0, 100)}...`);
      resolve(result);
    });
  });
}

app.post('/api/gm', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });
    console.log(`[GM] Request with ${messages.length} messages`);
    const reply = await callKiro(messages);
    res.json({ reply });
  } catch (e: any) {
    console.log(`[GM] Error:`, e.message);
    res.status(500).json({ error: e.message || 'GM error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`TRPG server (Kiro GM) listening on port ${PORT}`));
