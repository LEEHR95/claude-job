# GO 취업 — 메모리

## 마지막 세션
<!-- /co가 이 섹션 전체를 덮어씁니다 (다음 "##"까지) -->
- 날짜: 2026-06-23
- 요약: P1 대거 구현 세션. (1)직무별 프로필 — 저장모델을 단일 'profile'→'goData'{activeProfileId,profiles[]}로 전환+기존데이터 자동 마이그레이션+직무 전환 칩 UI. getProfile()이 활성 직무 반환해 하위호환. (2)프로젝트 카드 — projects textarea→projectCards[] CRUD, projects 텍스트는 카드에서 동기화(profileBlock API 무수정). (3)AI 근거(evidence) 표시 — analyze-profile가 항목별 근거 반환, 폼 필드 아래 노트. (4)AI→카드 자동추출 — 이력서에서 projectCards[] 추출해 자동 채움(sanitizeCards 방어). (5)저장후 읽기전용 보기화면 전환(showProfileView). (6)디자인 — 이모지 전부 제거 + 배경 미색(#faf7f0). (7)공고 입력 확장 — URL fetch(api/fetch-job.js, best-effort+폴백) + 이미지 OCR(api/ocr-job.js, Upstage). (8)자소서/이력서 앙상블 — 3관점 초안 병렬생성+편집자 병합, 마크다운 제거(stripMarkdown), 사용자 초안 확인 가능, 결과 localStorage 캐시.
- 다음 할 일: (P2) 지원 이력 저장(공고분석/자소서/이력서 결과 누적·재열람) / 공고↔프로젝트 자동매칭 / 프로필 병합 업로드+교육·자격증·링크 섹션 / 스킬 레벨 배열화. 병행: vercel dev로 OCR(경력12년 정확)·앙상블(초안3+병합·마크다운없음)·캐시 실측 검증, Vercel 배포+UPSTAGE_API_KEY 등록, 노출 키 재발급, GitHub remote 연결 후 push.

## 의사결정 이력

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| 2026-06-23 | Vercel Functions로 API 키 관리 | 보안 강화 (키가 서버에만 저장). 개인 프로젝트이므로 간단하고 무료 | 백엔드 서버 구축, 로컬 프록시 |
| 2026-06-23 | 기존 문서 입력을 PDF/Word 업로드로 | 사용자가 가진 파일 그대로 활용. 텍스트 붙여넣기보다 편함 | 텍스트 붙여넣기, .txt만 지원 |
| 2026-06-23 | 기존 문서를 "문체·톤 참고용"으로만 사용 | 내용 복사가 아닌 본인 글처럼 자연스러운 새 초안 생성 | 내용 기반 재작성 |
| 2026-06-23 | 프로필을 "업로드→검토→수정" 흐름으로 전환 | 입력부터 시키면 업로드할 이유가 사라지는 UX 모순 해결 | 입력 중심 유지, 업로드 보조 |
| 2026-06-23 | AI 분석 결과를 구조화 JSON으로 반환 | 폼 자동 채움 + 신뢰도/확인필요 항목 표시 위함 | 자유 텍스트 반환 후 수동 입력 |
| 2026-06-23 | 로컬 env는 .env 사용 (.env.local 아님) | 프레임워크 없는 정적+/api 구조라 vercel dev가 .env만 로드 | vercel env pull, 클라우드 env |
| 2026-06-23 | package.json dev 스크립트 제거 | vercel dev가 dev 스크립트(vercel dev)를 재호출해 무한 재귀 | 다른 명령명으로 우회 |
| 2026-06-23 | 직무별 프로필 저장모델(goData) 채택 | 서비스기획·UXUI 등 직무별로 따로 관리 필요. getProfile()이 활성 직무 반환해 하위코드 호환 | 단일 profile 유지, 프로필 분리 안 함 |
| 2026-06-23 | 이미지 공고 OCR을 Tesseract→Upstage로 교체 | Tesseract가 '경력12년→1~2년' 등 오인식. LLM 정리 단계는 멀쩡한 숫자·고유명사를 변조해 폐기 | Tesseract 유지+프롬프트로 정리, 정리단계 강화 |
| 2026-06-23 | 자소서/이력서 앙상블(3초안 병렬+병합) | 1회 생성은 품질 편차 큼. 다관점 초안의 강점만 병합해 품질 안정화. 마크다운 제거로 바로 붙여쓰기 | 단일 생성 유지, self-consistency만 |
| 2026-06-23 | 생성 결과 클라이언트 캐시(localStorage) | Upstage 프롬프트 캐싱 지원 불확실 → 같은 입력 재호출 방지로 확실한 절감 | 프롬프트 캐싱 의존, 캐시 없음 |
| 2026-06-23 | URL 공고분석을 P3→즉시 구현 | 사용자 요청. 단 봇차단·동적로딩 사이트는 폴백 안내로 처리 | 로드맵대로 P3 보류 |

## 세션 로그
<!-- 최근 5개만 유지. 초과 시 WIKI.md "세션 아카이브"로 이동. 추가만, 수정 금지 -->
| 날짜 | 한줄요약 | 산출물 |
|------|---------|--------|
| 2026-06-23 | P1 구현(직무별프로필·프로젝트카드·AI근거·AI→카드추출) + 보기화면 UX + 이모지제거/미색배경 + 공고 URL/이미지OCR + 자소서/이력서 앙상블·캐시 | index.html, api/_upstage.js, api/analyze-profile.js, api/fetch-job.js, api/ocr-job.js, api/generate-*.js |
| 2026-06-23 | 서비스 기획 재정의: 공고→맞춤지원서 반복 루프 + 정보구조/P1~P3 로드맵 | WIKI.md, ISSUE.md, plans/claude-codex-jiggly-cray.md |
| 2026-06-23 | 로컬 API 테스트 설정(vercel dev/.env) + dev 재귀 수정 + file:// 가드 | package.json, .env, README.md, index.html |
| 2026-06-23 | 프로필 탭 UX 개편: 업로드→AI분석→검토 흐름, 드래그앤드롭 | index.html, api/analyze-profile.js |
| 2026-06-23 | 기존 자소서·이력서 업로드(PDF/Word) → 문체 참고 생성 | index.html, api/generate-cover-letter.js, api/generate-resume.js |
