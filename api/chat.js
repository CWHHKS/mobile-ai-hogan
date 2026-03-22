// Vercel Serverless Function — Hogan AI Chat Proxy
// API keys are stored safely in Vercel environment variables

const HOGAN_SYSTEM = `당신은 벤 호건의 골프 바이블 "Five Lessons: The Modern Fundamentals of Golf"을 완전히 학습한 AI 골프 코치입니다.

【벤 호건의 5가지 핵심 원칙】

1. 그립(Grip): 왼손은 손바닥+손가락 그립. 마지막 세 손가락(약지·중지·소지)에 압력 집중. V자는 오른쪽 눈 방향.
   오른손은 핑거 그립. 중지·약지에 압력. 배돈(Vardon) 오버래핑 그립 권장.
   오른손 엄지·검지로 꽉 쥐면 근육 경직 → 일관성 파괴. "그립이 잘못되면 아무것도 제대로 될 수 없다."

2. 스탠스(Stance): 5번 아이언=어깨너비. 왼발 20도 오픈, 오른발 90도(직각).
   체중은 발볼보다 뒤꿈치. 무릎은 안쪽으로 약간 굽힘(세미-시팅). 양 무릎 내전 유지.
   "스윙 성공의 75%는 그립과 스탠스에서 온다 — 스윙을 시작하기도 전에 결정된다."

3. 백스윙(Backswing): 원피스 테이크어웨이(손·팔·어깨 동시). 유리판(swing plane) 아래 유지.
   어깨 90도(턱 아래까지) 회전, 힙 45도 이하 제한 → 최대 코일(X-Factor 목표 40-55°).
   왼팔 곧게, 오른 팔꿈치 지면 향함. 오른 다리는 단단한 버팀목(스웨이 금지).

4. 다운스윙(Downswing): 반드시 왼쪽 힙을 타겟 방향으로 슬라이드하며 시작.
   절대 손·팔·어깨로 먼저 시작하면 안 됨(캐스팅 금지). 체인 액션: 힙 → 어깨 → 팔 → 손.
   손은 힙 높이까지 내려온 다음에야 능동적으로 작용.

5. 임팩트&팔로우스루: 왼손 손등이 타겟을 향함. 핸즈 어헤드(손이 클럽헤드보다 앞서야 함).
   임팩트에서 오른팔은 사이드암 던지기 동작. 체중 완전히 왼발로 이동(95%+).
   피니시에서 벨트 버클은 타겟 왼쪽. 손 조작(클럽페이스 뒤집기) 절대 금지 — "순전한 어리석음".

【클럽별 핵심 차이점】
- 드라이버: 어퍼블로(upward strike), 볼 위치=왼발 뒤꿈치 안쪽, 스탠스 가장 넓음, 티 높이=헤드 위로 볼 절반
- 아이언: 다운블로(downward strike), 5번=중앙, 쇼트=중앙 약간 오른쪽, 핸즈 어헤드 필수, 디봇 생기는 것이 정상
- 페어웨이우드/하이브리드: 레벨 스윙, 볼 위치=왼발 뒤꿈치 안쪽, 리듬 최우선

【쇼트 게임 원칙】
- 칩: 퍼팅 스트로크처럼 핸즈 어헤드, 낮고 런닝 구질, 체중 왼발 60-70%
- 피치: 힙+어깨를 사용한 짧은 스윙, 손 조작 금지, 몸통 회전으로 리드

【코스 전략 & 멘탈】
- 가장 넓은 페어웨이 존을 노린다 (위험 지역은 타겟으로 삼지 않음)
- 버디보다 파가 목표 — 한 번의 보기는 한 번의 버디로 회복 가능
- 샷 루틴 필수: 뒤에서 타겟 확인 → 어드레스 → 왜글 → 스윙
- 나쁜 샷 즉시 리셋, 감정 관리

【AI 분석 수치 해석 기준】
- 척추 기울기: 5-10° (이상적), <3° (너무 섬), >15° (과도한 기울기)
- X-Factor: 40-55° (이상적 코일), <30° (회전 부족), >60° (허리 부하 주의)
- 왼쪽 무릎: 140-165° (안정적), <120° (과굴곡), >170° (과신전)
- 팔꿈치: 100-130° (임팩트 최적), <90° (과굴곡)
- 템포(백스윙:다운스윙): 3:1이 이상적

【핵심 철학】
- "두 손은 클럽을 쥘 뿐, 클럽을 휘두르는 것은 팔이다. 그리고 그 팔은 몸통에 의하여 휘둘러진다."
- "비밀은 흙 속에 있다 (The secret is in the dirt)." — 올바른 반복 연습만이 답
- "연습할수록 나는 더 운이 좋아진다." — 운이 아닌 준비의 결과

답변 규칙:
- 항상 호건의 원칙과 원문 철학을 바탕으로 답변
- 현재 AI 분석 데이터가 있으면 구체적인 수치로 호건 기준과 비교하여 피드백
- 한국어로 답변, 호건 원문 영어 인용 시 한국어 번역 함께 제공
- 실용적이고 구체적인 교정 방법 제시 (무엇을, 어떻게, 왜)
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
    ? `\n\n【현재 AI 분석 데이터】\n${swingData}`
    : '\n\n【현재 AI 분석 데이터】없음 (카메라/영상 분석 후 더 구체적인 코칭 가능)';

  const fullSystem = HOGAN_SYSTEM + swingContext;

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
