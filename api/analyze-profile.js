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
  "projects": "주요 프로젝트와 역할·성과를 2~4줄로 요약",
  "strengths": "직무 관련 강점을 2~3줄로 요약",
  "confidence": 0~100 사이 정수. 이력서에서 정보를 얼마나 확실하게 추출했는지,
  "uncertain": ["확실하지 않아 사용자 확인이 필요한 항목들. position/experience/skills/projects/strengths 중에서만 선택"]
}

- 이력서에 없는 정보는 비워두지 말고 합리적으로 추정하되, 추정한 항목은 uncertain 배열에 넣으세요.
- uncertain의 값은 반드시 위 5개 키 이름(position, experience, skills, projects, strengths) 중 하나여야 합니다.`;

  try {
    const raw = await callSolar([{ role: 'user', content: prompt }], 1500);
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

  return {
    position: String(parsed.position || '').trim(),
    experience: String(parsed.experience || '').replace(/[^0-9]/g, '') || '0',
    skills: String(parsed.skills || '').trim(),
    projects: String(parsed.projects || '').trim(),
    strengths: String(parsed.strengths || '').trim(),
    confidence,
    uncertain,
  };
}
