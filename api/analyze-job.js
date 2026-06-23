import { callSolar, profileBlock, sendError } from './_upstage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile = {}, jobPosting = '' } = req.body || {};

  if (!jobPosting.trim()) {
    return res.status(400).json({ error: '채용 공고가 비어 있습니다.' });
  }

  const prompt = `당신은 채용 지원 전략 컨설턴트입니다.
아래 지원자 프로필과 채용 공고를 읽고, "어떻게 지원해야 하는가"에 초점을 맞춰 분석해주세요.

[지원자 프로필]
${profileBlock(profile)}

[채용 공고]
${jobPosting}

다음 형식 그대로 한국어로 작성하세요. 각 섹션 제목은 그대로 사용하세요.

## 공고 핵심 요구사항
- 필수 역량: (목록)
- 우대 사항: (목록)
- 반복 등장 키워드: (목록)

## 나와 연결 가능한 경험
- 프로필에서 공고와 연결되는 경험을 구체적으로 추출

## 부족한 부분
- 현재 부족하거나 보완이 필요한 역량

## 이력서 강조 포인트
- 이력서에 반드시 넣어야 할 내용

## 면접 예상 질문
1. ~
2. ~
3. ~
4. ~
5. ~

## 지원 전략 요약
- 한 줄 결론`;

  try {
    const text = await callSolar(
      [{ role: 'user', content: prompt }],
      2500
    );
    return res.status(200).json({ text });
  } catch (error) {
    return sendError(res, error);
  }
}
