// Upstage Solar Pro 2 공용 호출 헬퍼 (서버 전용)
// 파일명이 _ 로 시작하므로 Vercel 엔드포인트로 노출되지 않습니다.

const UPSTAGE_URL = 'https://api.upstage.ai/v1/chat/completions';
const MODEL = 'solar-pro2'; // MVP 고정 모델

// messages: [{ role, content }], 반환: 생성된 텍스트(string)
export async function callSolar(messages, maxTokens = 2000) {
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    const err = new Error('UPSTAGE_API_KEY가 서버에 설정되지 않았습니다.');
    err.status = 500;
    throw err;
  }

  const response = await fetch(UPSTAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await response.json());
    } catch {
      detail = await response.text();
    }
    const err = new Error(`Upstage API 오류 (${response.status}): ${detail}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// 프로필 객체를 프롬프트용 텍스트 블록으로 변환
export function profileBlock(profile = {}) {
  return [
    `지원 직무: ${profile.position || '-'}`,
    `경력: ${profile.experience || '-'}년`,
    `기술 스택: ${profile.skills || '-'}`,
    `프로젝트 경험: ${profile.projects || '-'}`,
    `강점: ${profile.strengths || '-'}`,
    profile.name ? `이름: ${profile.name}` : '',
    profile.email ? `이메일: ${profile.email}` : '',
    profile.phone ? `전화: ${profile.phone}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// 공통 응답 헬퍼
export function sendError(res, error) {
  const status = error.status || 500;
  return res.status(status).json({ error: error.message });
}
