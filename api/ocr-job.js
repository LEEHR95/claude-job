// 채용 공고 이미지 → Upstage OCR로 텍스트 추출 (서버 전용)
// 클라이언트는 { imageBase64, filename, mimeType } JSON으로 전송.
import { sendError } from './_upstage.js';

// 이미지 base64가 커질 수 있어 본문 한도 상향
export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } },
};

const OCR_URL = 'https://api.upstage.ai/v1/document-digitization';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64 = '', filename = 'image.png', mimeType = 'image/png' } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: '이미지 데이터가 비어 있습니다.' });
  }

  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'UPSTAGE_API_KEY가 서버에 설정되지 않았습니다.' });
  }

  try {
    const buffer = Buffer.from(imageBase64, 'base64');

    const form = new FormData();
    form.append('document', new Blob([buffer], { type: mimeType }), filename);
    form.append('model', 'ocr');

    const resp = await fetch(OCR_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!resp.ok) {
      let detail = '';
      try { detail = JSON.stringify(await resp.json()); } catch { detail = await resp.text(); }
      const err = new Error(`Upstage OCR 오류 (${resp.status}): ${detail}`);
      err.status = resp.status;
      throw err;
    }

    const data = await resp.json();
    return res.status(200).json({
      text: (data.text || '').trim(),
      confidence: typeof data.confidence === 'number' ? data.confidence : null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}
