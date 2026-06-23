import { callSolar, profileBlock, sendError } from './_upstage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobPosting = '' } = req.body || {};

  if (!jobPosting.trim()) {
    return res.status(400).json({ error: '채용 공고가 비어 있습니다.' });
  }

  const refBlock = profile.refCover
    ? `\n[지원자의 기존 자기소개서 — 문체·톤 참고용]
아래는 지원자가 직접 작성한 기존 자기소개서입니다. 내용을 그대로 복사하지 말고,
말투·문장 호흡·표현 스타일만 참고하여 지원자 본인의 글처럼 자연스럽게 작성하세요.
"""
${profile.refCover}
"""\n`
    : '';

  const prompt = `당신은 한국 채용 자기소개서 작성 전문가입니다.
아래 지원자 프로필과 채용 공고를 바탕으로 자기소개서 초안을 작성하세요.

[지원자 프로필]
${profileBlock(profile)}
${refBlock}
[채용 공고]
${jobPosting}

다음 4개 항목을 각 500~800자 분량으로 작성하세요. 섹션 제목은 그대로 사용하세요.
공고의 요구사항과 지원자의 실제 경험을 자연스럽게 연결하고, 추상적 표현 대신 구체적 사례를 사용하세요.

## 지원 동기

## 직무 역량

## 문제 해결 경험

## 입사 후 포부`;

  try {
    const text = await callSolar(
      [{ role: 'user', content: prompt }],
      3000
    );
    return res.status(200).json({ text });
  } catch (error) {
    return sendError(res, error);
  }
}
