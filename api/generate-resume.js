import { callSolar, profileBlock, sendError } from './_upstage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobTitle = '', additionalInfo = '' } = req.body || {};

  const refBlock = profile.refResume
    ? `\n[지원자의 기존 이력서 — 문체·톤 참고용]
아래는 지원자가 직접 작성한 기존 이력서입니다. 내용을 그대로 복사하지 말고,
구성·말투·서술 스타일만 참고하여 지원자 본인의 글처럼 자연스럽게 작성하세요.
"""
${profile.refResume}
"""\n`
    : '';

  const prompt = `다음 정보를 바탕으로 한국어 이력서를 작성해주세요.

${profileBlock(profile)}
${refBlock}${jobTitle ? `\n지원 기업/직무: ${jobTitle}` : ''}
${additionalInfo ? `추가 정보: ${additionalInfo}` : ''}

요구사항:
- 전문적이고 설득력 있는 한국어 이력서
- 직무와 연결되는 경험을 구체적 성과 중심으로 서술
- 불필요한 미사여구 없이 핵심만`;

  try {
    const text = await callSolar(
      [{ role: 'user', content: prompt }],
      2000
    );
    return res.status(200).json({ text });
  } catch (error) {
    return sendError(res, error);
  }
}
