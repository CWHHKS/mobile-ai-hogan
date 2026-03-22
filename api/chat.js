// Vercel Serverless Function — AI Golf Coach Chat Proxy
// Uses gemini-pro (v1beta) - most stable model

const GOLF_SYSTEM = `당신은 전문적인 AI 골프 코치입니다.
골프 스윙, 자세, 그립, 스탠스, 백스윙, 다운스윙, 임팩트, 팔로우스루, 퍼팅, 쇼트게임, 코스 전략, 멘탈 관리, 클럽 선택 등 골프에 관한 모든 질문에 전문적으로 답변합니다.

AI 스윙 분석 수치 기준:
- 척추 기울기: 5-10° (이상적)
- X-Factor: 40-55° (이상적)
- 왼쪽 무릎: 140-165° (안정적)
- 팔꿈치: 100-130° (임팩트 최적)
- 템포(백스윙:다운스윙): 3:1 이상적

답변: 한국어로 400자 내외. 구체적인 교정 방법 포함.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, ai, swingData } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  const swingContext = swingData ? `\n[현재 스윙 분석 데이터]\n${swingData}` : '';
  const systemText = GOLF_SYSTEM + swingContext;

  console.log(`[chat] ai=${ai}, msg_len=${message.length}`);

  try {
    if (!ai || ai === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

      // gemini-pro: v1beta에서 안정적으로 지원되는 기본 모델
      const MODELS = ['gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-pro'];
      let lastErr = null;

      for (const model of MODELS) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          console.log(`[chat] trying model: ${model}`);

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: `${systemText}\n\n사용자 질문: ${message}` }]
              }],
              generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
            })
          });

          const data = await response.json();
          console.log(`[chat] ${model} status=${response.status}`);

          if (response.ok) {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 받지 못했습니다.';
            return res.status(200).json({ reply: text, ai: 'gemini', model });
          }
          lastErr = data?.error?.message || JSON.stringify(data);
          console.error(`[chat] ${model} error: ${lastErr}`);
        } catch(e) {
          lastErr = e.message;
          console.error(`[chat] ${model} exception: ${lastErr}`);
        }
      }
      return res.status(500).json({ error: lastErr || 'All Gemini models failed' });

    } else if (ai === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemText },
            { role: 'user', content: message }
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });

      const data = await response.json();
      console.log(`[chat] OpenAI status=${response.status}`);

      if (!response.ok) {
        const errMsg = data?.error?.message || JSON.stringify(data);
        console.error(`[chat] OpenAI error: ${errMsg}`);
        return res.status(500).json({ error: errMsg });
      }

      const text = data.choices?.[0]?.message?.content || '답변을 받지 못했습니다.';
      return res.status(200).json({ reply: text, ai: 'openai' });

    } else {
      return res.status(400).json({ error: `unknown ai type: ${ai}` });
    }
  } catch (err) {
    console.error('[chat] exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
