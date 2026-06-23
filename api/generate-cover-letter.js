import { profileBlock, sendError, runEnsemble } from './_upstage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobPosting = '' } = req.body || {};

  if (!jobPosting.trim()) {
    return res.status(400).json({ error: '채용 공고가 비어 있습니다.' });
  }

  const refBlock = profile.refCover
    ? `\n[지원자의 기존 자기소개서 — 문체·단어 참고용]
아래는 지원자가 직접 작성한 기존 자기소개서입니다. 내용을 그대로 복사하지는 말되,
말투·문장 호흡·자주 쓰는 표현과 단어를 최대한 살려 지원자 본인이 쓴 글처럼 작성하세요.
"""
${profile.refCover}
"""\n`
    : '';

  const base = `[지원자 프로필]
${profileBlock(profile)}
${refBlock}
[채용 공고]
${jobPosting}`;

  const angles = [
    { label: '성과 중심', focus: '구체적인 성과와 수치, 본인의 기여를 전면에 내세워' },
    { label: '직무 적합성 중심', focus: '공고의 요구 역량과 지원자 경험의 직접적인 매칭을 중심으로' },
    { label: '동기·스토리 중심', focus: '지원 동기와 성장 서사를 진정성 있게 풀어내어' },
  ];

  const rules = `
규칙:
- 아래 4개 섹션을 각 400~700자로 작성하세요. 섹션 제목은 그대로 사용하세요.
- 공고 요구사항과 지원자의 실제 경험을 자연스럽게 연결하고, 추상적 표현 대신 구체적 사례를 쓰세요.
- 지원자가 올린 기존 문서가 있으면 그 말투·표현·자주 쓰는 단어를 살려 본인 글처럼 쓰세요.
- 마크다운 기호(**, ##, //, * 등)를 절대 쓰지 말고 일반 텍스트로만 작성하세요.

지원 동기

직무 역량

문제 해결 경험

입사 후 포부`;

  const draftPrompt = (a) =>
    `당신은 한국 채용 자기소개서 작성 전문가입니다.
${base}

${a.focus} 자기소개서 초안을 작성하세요.
${rules}`;

  const mergePrompt = (drafts) =>
    `당신은 자기소개서 편집 전문가입니다.
아래는 같은 지원자의 자기소개서 초안 ${drafts.length}개입니다. 각각 강조점이 다릅니다.
각 초안에서 가장 설득력 있는 표현·사례·구성을 골라 하나의 완성된 자기소개서로 통합하세요.
중복은 제거하고 흐름을 매끄럽게 다듬되, 지원자의 말투와 자주 쓰는 단어는 유지하세요.
마크다운 기호 없이 일반 텍스트로, 같은 4개 섹션(지원 동기 / 직무 역량 / 문제 해결 경험 / 입사 후 포부)으로 출력하세요.

${drafts.map((d, i) => `[초안 ${i + 1}]\n${d}`).join('\n\n')}`;

  try {
    const result = await runEnsemble({ angles, draftPrompt, mergePrompt });
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
}
