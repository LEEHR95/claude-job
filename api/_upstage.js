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
  // 기술 스택: [{name, detail}] 배열 또는 구버전 문자열 모두 지원
  let skillsText;
  if (Array.isArray(profile.skills)) {
    skillsText = profile.skills
      .map((s) => (s && typeof s === 'object' ? (s.detail ? `${s.name} (${s.detail})` : s.name) : String(s)))
      .filter(Boolean)
      .join(', ');
  } else {
    skillsText = profile.skills || '';
  }
  return [
    `지원 직무: ${profile.position || '-'}`,
    `경력: ${profile.experience || '-'}년`,
    `기술 스택: ${skillsText || '-'}`,
    `프로젝트 경험: ${profile.projects || '-'}`,
    `강점: ${profile.strengths || '-'}`,
    profile.education ? `학력·교육:\n${profile.education}` : '',
    profile.certifications ? `자격증:\n${profile.certifications}` : '',
    profile.awards ? `수상·활동:\n${profile.awards}` : '',
    profile.links ? `링크:\n${profile.links}` : '',
    profile.name ? `이름: ${profile.name}` : '',
    profile.email ? `이메일: ${profile.email}` : '',
    profile.phone ? `전화: ${profile.phone}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

// 마크다운 표시 제거 → 지원서에 바로 붙일 수 있는 일반 텍스트
export function stripMarkdown(s) {
  return String(s || '')
    .replace(/```[a-z]*\n?/gi, '')          // 코드펜스
    .replace(/`([^`]+)`/g, '$1')            // 인라인 코드
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')     // 헤더 ##
    .replace(/\*\*(.+?)\*\*/g, '$1')        // 굵게 **
    .replace(/__(.+?)__/g, '$1')            // 굵게 __
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1$2') // 기울임 *
    .replace(/^\s*[-*•]\s+/gm, '· ')        // 불릿 → ·
    .replace(/^\s*>\s?/gm, '')              // 인용 >
    .replace(/^\s*-{3,}\s*$/gm, '')         // 수평선 ---
    .replace(/ *\/\/ */g, ' ')              // // 제거(주변 공백 정리)
    .replace(/[ \t]{2,}/g, ' ')             // 중복 공백
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// 앙상블: 여러 관점의 초안을 병렬 생성 → 편집자 패스로 병합
// angles: [{ label, focus }], draftPrompt(angle)→string, mergePrompt(cleanDrafts)→string
export async function runEnsemble({ angles, draftPrompt, mergePrompt, draftTokens = 2200, mergeTokens = 3000 }) {
  // 초안 병렬 생성 (속도)
  const raw = await Promise.all(
    angles.map((a) => callSolar([{ role: 'user', content: draftPrompt(a) }], draftTokens))
  );
  const cleanDrafts = raw.map(stripMarkdown);

  // 병합 (편집자)
  const mergedRaw = await callSolar([{ role: 'user', content: mergePrompt(cleanDrafts) }], mergeTokens);

  return {
    drafts: cleanDrafts.map((text, i) => ({ label: angles[i].label, text })),
    merged: stripMarkdown(mergedRaw),
  };
}

// 공통 응답 헬퍼
export function sendError(res, error) {
  const status = error.status || 500;
  return res.status(status).json({ error: error.message });
}
