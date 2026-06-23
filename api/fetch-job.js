// 채용 공고 URL → 페이지 본문 텍스트 추출 (서버에서 fetch → 브라우저 CORS 우회)
// 사람인/잡코리아 등은 봇 차단·동적 로딩이 있어 best-effort: 실패 시 붙여넣기로 폴백 안내.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const target = String((req.body || {}).url || '').trim();
  if (!/^https?:\/\//i.test(target)) {
    return res.status(400).json({ error: '올바른 URL(http/https)을 입력해 주세요.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const resp = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!resp.ok) {
      return res.status(502).json({
        error: `페이지를 불러오지 못했습니다 (HTTP ${resp.status}). 공고 내용을 직접 붙여넣어 주세요.`,
      });
    }

    const ctype = resp.headers.get('content-type') || '';
    if (!/html|text|xml/i.test(ctype)) {
      return res.status(415).json({
        error: 'HTML 페이지가 아닙니다. 공고 내용을 직접 붙여넣어 주세요.',
      });
    }

    const html = await resp.text();
    const { title, text } = htmlToText(html);

    if (text.length < 200) {
      return res.status(200).json({
        title,
        text,
        warning:
          '이 사이트는 자동 추출이 제한적입니다(로그인·동적 로딩 등). 내용이 부족하면 공고를 직접 붙여넣어 주세요.',
      });
    }

    return res.status(200).json({ title, text });
  } catch (error) {
    clearTimeout(timer);
    const msg =
      error.name === 'AbortError'
        ? '페이지 응답이 너무 느립니다. 공고 내용을 직접 붙여넣어 주세요.'
        : '페이지를 불러오지 못했습니다(차단되었거나 접근 불가). 공고 내용을 직접 붙여넣어 주세요.';
    return res.status(502).json({ error: msg });
  }
}

// HTML → 읽기 좋은 텍스트
function htmlToText(html) {
  let h = String(html);

  const titleMatch = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].replace(/\s+/g, ' ').trim()) : '';

  // 본문 영역만 우선 추출
  const bodyMatch = h.match(/<body[\s\S]*?<\/body>/i);
  if (bodyMatch) h = bodyMatch[0];

  h = h
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // 블록 종료 태그는 줄바꿈으로
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  h = decodeEntities(h)
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 토큰 보호: 과도하게 길면 잘라냄
  if (h.length > 12000) h = h.slice(0, 12000) + '\n...(이하 생략)';

  return { title, text: h };
}

// 주요 HTML 엔티티 디코드
function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 10)); } catch { return ' '; }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 16)); } catch { return ' '; }
    });
}
