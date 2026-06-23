import { callSolar, sendError } from './_upstage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeText = '' } = req.body || {};

  if (!resumeText.trim()) {
    return res.status(400).json({ error: '이력서 텍스트가 비어 있습니다.' });
  }

  const prompt = `당신은 채용 컨설턴트입니다.
아래는 지원자의 이력서에서 추출한 원문 텍스트입니다.
이 텍스트를 읽고 지원자의 프로필 정보를 정리해주세요.

[이력서 원문]
${resumeText}

다음 규칙을 지켜 **JSON만** 출력하세요. 설명·코드펜스 없이 순수 JSON 객체 하나만 출력합니다.

{
  "position": "지원(희망) 직무. 명확하지 않으면 가장 가능성 높은 직무를 추정",
  "experience": "총 경력 연수를 숫자 문자열로. 예: \\"3\\". 신입/불명확이면 \\"0\\"",
  "skills": "기술 스택을 쉼표로 구분한 문자열. 예: \\"Python, React, SQL\\"",
  "projects": "주요 프로젝트와 역할·성과를 2~4줄로 요약 (projectCards를 못 만들 때의 대비용)",
  "projectCards": [
    {
      "title": "프로젝트명",
      "period": "기간(있으면). 예: \\"2024.01 ~ 2024.06\\". 없으면 빈 문자열",
      "role": "지원자 본인의 역할. 예: \\"서비스 기획 리드\\"",
      "summary": "프로젝트 한 줄 요약",
      "contributions": ["지원자가 실제로 한 일(행동) 항목들"],
      "outcomes": ["성과. 정량 지표(숫자) 우선. 예: \\"전환율 15% 상승\\""],
      "techStack": ["사용한 기술·툴"],
      "tags": ["직무 매칭용 키워드"]
    }
  ],
  "strengths": "직무 관련 강점을 2~3줄로 요약",
  "confidence": 0~100 사이 정수. 이력서에서 정보를 얼마나 확실하게 추출했는지,
  "uncertain": ["확실하지 않아 사용자 확인이 필요한 항목들. position/experience/skills/projects/strengths 중에서만 선택"],
  "evidence": {
    "position": "이 직무로 판단한 근거를 이력서 내용에 기반해 한 줄로. 예: \\"'서비스 기획' 표현이 본문에 5회 등장\\"",
    "experience": "경력 연수 산출 근거 한 줄",
    "skills": "기술 스택 추출 근거 한 줄",
    "projects": "프로젝트 요약 근거 한 줄",
    "strengths": "강점 도출 근거 한 줄"
  }
}

- 이력서에 없는 정보는 비워두지 말고 합리적으로 추정하되, 추정한 항목은 uncertain 배열에 넣으세요.
- uncertain의 값은 반드시 위 5개 키 이름(position, experience, skills, projects, strengths) 중 하나여야 합니다.
- evidence의 각 값은 "왜 그렇게 판단했는가"를 이력서 근거에 기반해 한국어 한 줄로 적으세요. 추측이면 추측이라고 밝히세요.
- projectCards: 이력서/자기소개서에 드러난 프로젝트를 **프로젝트 단위로 분리**해 카드로 만드세요. 원문에 없는 성과를 지어내지 말고, 불확실하면 해당 항목을 비우세요. 프로젝트를 식별할 수 없으면 빈 배열 []을 넣으세요.`;

  try {
    const raw = await callSolar([{ role: 'user', content: prompt }], 3000);
    const profile = parseProfileJson(raw);
    return res.status(200).json(profile);
  } catch (error) {
    return sendError(res, error);
  }
}

// 모델 응답에서 JSON 객체를 안전하게 파싱
function parseProfileJson(raw) {
  let text = (raw || '').trim();

  // 코드펜스 제거
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  // 첫 { 부터 마지막 } 까지만 추출
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    const err = new Error('AI 응답을 프로필로 변환하지 못했습니다. 직접 입력해 주세요.');
    err.status = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    const err = new Error('AI 응답 형식이 올바르지 않습니다. 직접 입력해 주세요.');
    err.status = 502;
    throw err;
  }

  const validKeys = ['position', 'experience', 'skills', 'projects', 'strengths'];
  const uncertain = Array.isArray(parsed.uncertain)
    ? parsed.uncertain.filter((k) => validKeys.includes(k))
    : [];

  let confidence = parseInt(parsed.confidence, 10);
  if (isNaN(confidence)) confidence = 70;
  confidence = Math.max(0, Math.min(100, confidence));

  // 근거(evidence): 5개 유효키만, 문자열만 수용
  const evidence = {};
  if (parsed.evidence && typeof parsed.evidence === 'object') {
    validKeys.forEach((k) => {
      const v = parsed.evidence[k];
      if (typeof v === 'string' && v.trim()) evidence[k] = v.trim();
    });
  }

  return {
    position: String(parsed.position || '').trim(),
    experience: String(parsed.experience || '').replace(/[^0-9]/g, '') || '0',
    skills: String(parsed.skills || '').trim(),
    projects: String(parsed.projects || '').trim(),
    projectCards: sanitizeCards(parsed.projectCards),
    strengths: String(parsed.strengths || '').trim(),
    confidence,
    uncertain,
    evidence,
  };
}

// AI가 추출한 프로젝트 카드를 안전하게 정리
function sanitizeCards(cards) {
  if (!Array.isArray(cards)) return [];
  const str = (v) => String(v == null ? '' : v).trim();
  const arr = (v) =>
    Array.isArray(v) ? v.map(str).filter(Boolean) : (str(v) ? [str(v)] : []);
  return cards
    .filter((c) => c && typeof c === 'object')
    .map((c) => ({
      title: str(c.title),
      period: str(c.period),
      role: str(c.role),
      summary: str(c.summary),
      contributions: arr(c.contributions),
      outcomes: arr(c.outcomes),
      techStack: arr(c.techStack),
      tags: arr(c.tags),
    }))
    .filter((c) => c.title || c.summary || c.contributions.length);
}
