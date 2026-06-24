import { profileBlock, sendError, runEnsemble } from './_upstage.js';
import { RESUME_GUIDE, factsBlock, FACT_RULE } from './_writing-rules.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobTitle = '', additionalInfo = '', facts = [] } = req.body || {};

  const factSection = `${factsBlock(facts)}\n${FACT_RULE}`;

  const refBlock = profile.refResume
    ? `\n[지원자의 기존 이력서 — 구성·문체 참고용]
아래는 지원자가 직접 작성한 기존 이력서입니다. 내용을 그대로 복사하지는 말되,
구성·말투·서술 스타일과 자주 쓰는 단어를 살려 지원자 본인이 쓴 글처럼 작성하세요.
"""
${profile.refResume}
"""\n`
    : '';

  const base = `${profileBlock(profile)}
${refBlock}${jobTitle ? `\n지원 기업/직무: ${jobTitle}` : ''}
${additionalInfo ? `추가 정보: ${additionalInfo}` : ''}`;

  const angles = [
    { label: '성과 중심', focus: '직무와 연결되는 경험을 구체적인 성과와 정량 지표 중심으로' },
    { label: '직무 적합성 중심', focus: '지원 직무의 핵심 요구사항에 맞춰 경험을 배치하여' },
    { label: '간결·구성 중심', focus: '핵심만 간결하게, 읽기 쉬운 구성으로' },
  ];

  const rules = `
규칙:
- 전문적이고 설득력 있는 한국어 이력서를 작성하세요.
- 직무와 연결되는 경험을 구체적 성과 중심으로 서술하고, 불필요한 미사여구는 빼세요.
- 지원자가 올린 기존 문서가 있으면 그 구성·말투·자주 쓰는 단어를 살리세요.
- 마크다운 기호(**, ##, //, * 등)를 절대 쓰지 말고 일반 텍스트로만 작성하세요.`;

  const draftPrompt = (a) =>
    `당신은 한국 채용 이력서 작성 전문가입니다. 다음 정보를 바탕으로 한국어 이력서를 작성해주세요.
${RESUME_GUIDE}

${factSection}

${base}

${a.focus} 이력서 초안을 작성하세요. 위 작성 규칙과 수치 사용 규칙을 반드시 지키세요.
${rules}`;

  const mergePrompt = (drafts) =>
    `당신은 이력서 편집 전문가입니다.
${RESUME_GUIDE}

${factSection}

아래는 같은 지원자의 이력서 초안 ${drafts.length}개입니다. 각각 강조점이 다릅니다.
각 초안에서 가장 강력한 표현·성과·구성을 골라 하나의 완성된 이력서로 통합하세요.
위 작성 규칙을 기준으로 규칙에 어긋나는 표현('상/중/하' 수준 표기, 수치 없는 기술 나열, 링크만 나열 등)은 고치세요.
검증된 사실 목록에 없는 수치는 정성적 표현으로 바꾸세요.
중복은 제거하고 구성을 매끄럽게 다듬되, 지원자의 말투와 자주 쓰는 단어는 유지하세요.
마크다운 기호 없이 일반 텍스트로만 출력하세요.

${drafts.map((d, i) => `[초안 ${i + 1}]\n${d}`).join('\n\n')}`;

  try {
    const result = await runEnsemble({ angles, draftPrompt, mergePrompt });
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
}
