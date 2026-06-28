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
  "skills": [
    { "name": "기술명. 예: \\"Java\\"", "detail": "정량 정보(버전·기간·규모 등). 예: \\"8/11, 약 1만 줄\\". 없으면 빈 문자열. 상/중/하 같은 주관적 표현은 쓰지 말 것" }
  ],
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
  "careerCards": [
    {
      "company": "회사명/조직명",
      "period": "재직 기간. 예: \\"2022.03 ~ 2024.06\\". 없으면 빈 문자열",
      "role": "직책·담당 직무. 예: \\"서비스 기획자 / 대리\\"",
      "summary": "회사/팀/담당 영역 한 줄 요약(있으면)",
      "contributions": ["재직 중 실제로 한 담당 업무 항목들"],
      "outcomes": ["성과. 정량 지표(숫자) 우선"]
    }
  ],
  "strengths": "직무 관련 강점을 2~3줄로 요약",
  "education": ["학력·교육 이력. 국비/학원 과정은 핵심만 담백하게(예: \\"웹 개발자 과정(백엔드/프론트엔드) 6개월\\"). 없으면 빈 배열"],
  "certifications": ["자격증 항목. 없으면 빈 배열"],
  "awards": ["수상·대외활동 항목. 없으면 빈 배열"],
  "links": ["GitHub/블로그/포트폴리오 링크. 가능하면 \\"설명 | URL\\" 형태로. 없으면 빈 배열"],
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
- projectCards: 이력서/자기소개서에 드러난 프로젝트를 **프로젝트 단위로 분리**해 카드로 만드세요. 원문에 없는 성과를 지어내지 말고, 불확실하면 해당 항목을 비우세요. 프로젝트를 식별할 수 없으면 빈 배열 []을 넣으세요.
- careerCards: 이력서의 **경력 사항(재직했던 회사별 이력)**을 회사 단위로 분리해 카드로 만드세요. projectCards가 '무엇을 만들었나'라면 careerCards는 '어디서 일했나'입니다. 같은 회사 안의 여러 프로젝트는 한 회사 카드의 contributions로 묶으세요. 회사명이 드러나지 않으면 빈 배열 []을 넣으세요. 원문에 없는 회사·기간·성과를 지어내지 마세요.`;

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
    skills: sanitizeSkills(parsed.skills),
    projects: String(parsed.projects || '').trim(),
    projectCards: sanitizeCards(parsed.projectCards),
    strengths: String(parsed.strengths || '').trim(),
    education: toStrArray(parsed.education),
    certifications: toStrArray(parsed.certifications),
    awards: toStrArray(parsed.awards),
    links: toStrArray(parsed.links),
    confidence,
    uncertain,
    evidence,
  };
}

// 기술 스택을 [{name, detail}] 배열로 안전 변환 (문자열/객체 혼용 수용)
function sanitizeSkills(v) {
  const str = (x) => String(x == null ? '' : x).trim();
  let items = [];
  if (Array.isArray(v)) {
    items = v.map((s) => (s && typeof s === 'object')
      ? { name: str(s.name), detail: str(s.detail || s.level) }
      : { name: str(s), detail: '' });
  } else {
    items = str(v).split(/\r?\n|,/).map((x) => ({ name: str(x), detail: '' }));
  }
  return items.filter((s) => s.name);
}

// 문자열 배열로 안전 변환 (문자열이면 줄/쉼표 분리)
function toStrArray(v) {
  if (Array.isArray(v)) return v.map((x) => String(x == null ? '' : x).trim()).filter(Boolean);
  const s = String(v == null ? '' : v).trim();
  if (!s) return [];
  return s.split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
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
