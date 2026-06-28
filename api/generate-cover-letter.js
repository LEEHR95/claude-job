import { profileBlock, sendError, runEnsemble } from './_upstage.js';
import { COVER_GUIDE, factsBlock, FACT_RULE } from './_writing-rules.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobPosting = '', facts = [], questions = [] } = req.body || {};

  if (!jobPosting.trim()) {
    return res.status(400).json({ error: '채용 공고가 비어 있습니다.' });
  }

  // 사용자가 입력한 문항(있으면) → 문항별 작성 모드
  const qs = (Array.isArray(questions) ? questions : [])
    .filter((q) => q && String(q.prompt || '').trim())
    .map((q) => ({ prompt: String(q.prompt).trim(), limit: parseInt(q.limit, 10) || 0 }));
  const useQuestions = qs.length > 0;
  const defaultSections = ['지원 동기', '직무 역량', '문제 해결 경험', '입사 후 포부'];
  const sectionTitles = useQuestions ? qs.map((q) => q.prompt) : defaultSections;

  const factSection = `${factsBlock(facts)}\n${FACT_RULE}`;

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

  const rules = useQuestions
    ? `
규칙:
- 아래 [문항 목록]의 각 문항에 답하세요. 각 문항의 질문 문장을 제목으로 한 줄 그대로 쓰고, 다음 줄부터 답변을 작성하세요.
- 글자수 제한이 있는 문항은 그 글자수 이내(공백 포함)로 맞추고, 제한의 80~100% 분량을 채우세요.
- 공고 요구사항과 지원자의 실제 경험을 구체적 사례로 연결하세요. 추상적 표현은 피하세요.
- 지원자가 올린 기존 문서가 있으면 그 말투·표현·자주 쓰는 단어를 살려 본인 글처럼 쓰세요.
- 마크다운 기호(**, ##, //, * 등)를 절대 쓰지 말고 일반 텍스트로만 작성하세요.

[문항 목록]
${qs.map((q) => `- ${q.prompt}${q.limit ? ` (${q.limit}자 이내)` : ''}`).join('\n')}`
    : `
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
${COVER_GUIDE}

${factSection}

${base}

${a.focus} 자기소개서 초안을 작성하세요. 위 작성 규칙과 수치 사용 규칙을 반드시 지키세요.
${rules}`;

  const mergePrompt = (drafts) =>
    `당신은 자기소개서 편집 전문가입니다.
${COVER_GUIDE}

${factSection}

아래는 같은 지원자의 자기소개서 초안 ${drafts.length}개입니다. 각각 강조점이 다릅니다.
각 초안에서 가장 설득력 있는 표현·사례·구성을 골라 하나의 완성된 자기소개서로 통합하세요.
위 작성 규칙을 기준으로 규칙에 어긋나는 표현(나 중심 동기, 수치 없는 나열, 뻔한 문장 등)은 고치세요.
검증된 사실 목록에 없는 수치는 정성적 표현으로 바꾸세요.
중복은 제거하고 흐름을 매끄럽게 다듬되, 지원자의 말투와 자주 쓰는 단어는 유지하세요.
마크다운 기호 없이 일반 텍스트로, 같은 ${sectionTitles.length}개 ${useQuestions ? '문항' : '섹션'}(${sectionTitles.join(' / ')})으로 출력하세요. 각 ${useQuestions ? '문항' : '섹션'} 제목을 한 줄로 그대로 쓰고 그 아래 내용을 쓰세요.${useQuestions ? `\n각 문항의 글자수 제한을 반드시 지키세요:\n${qs.map((q) => `- ${q.prompt}${q.limit ? ` (${q.limit}자 이내)` : ''}`).join('\n')}` : ''}

${drafts.map((d, i) => `[초안 ${i + 1}]\n${d}`).join('\n\n')}`;

  try {
    const result = await runEnsemble({ angles, draftPrompt, mergePrompt });
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
}
