// Vercel Serverless Function — AI Golf Coach Chat Proxy
// API keys are stored safely in Vercel environment variables

const GOLF_SYSTEM = `당신은 전문적인 AI 골프 코치입니다.

골프 스윙, 자세, 그립, 스탠스, 백스윙, 다운스윙, 임팩트, 팔로우스루, 퍼팅, 쇼트게임, 코스 전략, 멘탈 관리, 클럽 선택 등 골프에 관한 모든 질문에 전문적으로 답변합니다.

【AI 스윙 분석 수치 해석 기준】
- 척추 기울기: 5-10° (이상적), <3° (너무 섬), >15° (과도한 기울기)
- X-Factor(어깨-힙 차이): 40-55° (이상적 코일), <30° (회전 부족), >60° (허리 부하 주의)
- 왼쪽 무릎: 140-165° (안정적), <120° (과굴곡), >170° (과신전)
- 팔꿈치: 100-130° (임팩트 최적), <90° (과굴곡)
- 템포(백스윙:다운스윙): 3:1이 이상적

답변 규칙:
- 현재 AI 분석 데이터가 있으면 구체적인 수치를 기준으로 실질적인 피드백 제공
- 한국어로 답변 (영어 골프 용어는 한국어 설명 함께 제공)
- 실용적이고 구체적인 교정/개선 방법 제시 (무엇을, 어떻게, 왜)
- 답변은 400자 내외로 간결하되 실용적으로`;

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, ai, swingData } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  // 스윙 데이터 컨텍스트 생성
  const swingContext = swingData
    ? `\n\n【현재 AI 스윙 분석 데이터】\n${swingData}`
    : '';

  const fullSystem = GOLF_SYSTEM + swingContext;

  try {
    if (ai === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: fullSystem }] },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
          })
        }
      );
      const data = await response.json();
      if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Gemini error' });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 받지 못했습니다.';
      return res.status(200).json({ reply: text, ai: 'gemini' });

    } else if (ai === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: fullSystem },
            { role: 'user', content: message }
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (!response.ok) return res.status(500).json({ error: data.error?.message || 'OpenAI error' });
      const text = data.choices?.[0]?.message?.content || '답변을 받지 못했습니다.';
      return res.status(200).json({ reply: text, ai: 'openai' });

    } else {
      return res.status(400).json({ error: 'ai must be gemini or openai' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
