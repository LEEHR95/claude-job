# GO 취업 — 메모리

## 마지막 세션
<!-- /co가 이 섹션 전체를 덮어씁니다 (다음 "##"까지) -->
- 날짜: 2026-06-23
- 요약: 서비스 기획 재정의 세션(코드 변경 없음). 가치 중심을 "프로필 만들기"→**"공고→맞춤 지원서 반복"**으로 이동. 문제 6가지 진단(프로필 단순/AI근거 미표시/프로젝트 비구조화/공고 복붙만/여정 1회성/지원이력 부재), 정보구조 재설계(skills 배열화, projects→ProjectCard 카드화, evidence/weaknesses/교육·자격증·링크 추가, 기존5필드 하위호환 흡수), 공고입력 단계안(붙여넣기→구조화→URL fetch→사이트별 파서), AI분석 UX(요약카드+근거), P1~P3 로드맵 수립. 기획 원본: ~/.claude/plans/claude-codex-jiggly-cray.md. WIKI/ISSUE에 반영 완료.
- 다음 할 일: P1 착수 — (1)프로필 스키마 확장+기존5필드 마이그레이션 (2)프로젝트 카드 UI(textarea 대체) (3)AI 분석 근거(evidence) 표시+요약 카드 (4)지원 이력 저장. 병행: vercel dev 업로드→AI분석 실측 검증, Vercel 배포+UPSTAGE_API_KEY 등록, 노출 키 재발급.

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

## 세션 로그
<!-- 최근 5개만 유지. 초과 시 WIKI.md "세션 아카이브"로 이동. 추가만, 수정 금지 -->
| 날짜 | 한줄요약 | 산출물 |
|------|---------|--------|
| 2026-06-23 | 서비스 기획 재정의: 공고→맞춤지원서 반복 루프 + 정보구조/P1~P3 로드맵 | WIKI.md, ISSUE.md, plans/claude-codex-jiggly-cray.md |
| 2026-06-23 | 로컬 API 테스트 설정(vercel dev/.env) + dev 재귀 수정 + file:// 가드 | package.json, .env, README.md, index.html |
| 2026-06-23 | 프로필 탭 UX 개편: 업로드→AI분석→검토 흐름, 드래그앤드롭 | index.html, api/analyze-profile.js |
| 2026-06-23 | 기존 자소서·이력서 업로드(PDF/Word) → 문체 참고 생성 | index.html, api/generate-cover-letter.js, api/generate-resume.js |
| 2026-06-23 | API 보안 강화 (Vercel Function) | api/claude.js, vercel.json, README.md |
| 2026-06-22 | index.html 생성 | 프로필·이력서·공고분석 기능 |
