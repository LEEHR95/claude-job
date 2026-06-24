# GO 취업 — 메모리

## 마지막 세션
<!-- /co가 이 섹션 전체를 덮어씁니다 (다음 "##"까지) -->
- 날짜: 2026-06-24 (진행 중)
- 요약(2026-06-24 막판): (A)사실 검증 기능 — Fact Store(localStorage['factStore']=[{id,label,value,unit,verified,note}], 프로필탭 CRUD 섹션) + 생성 시 verified facts를 payload로 보내 _writing-rules.js factsBlock/FACT_RULE로 프롬프트 주입(검증목록 외 수치 생성금지) + 클라 숫자검증기(정규식 숫자+단위 추출→factStore value 대조→본문 초록/빨강 하이라이트 + 검증리포트 + 미검증 'Fact Store에 추가'버튼, runFactCheck를 renderEnsemble 끝에서 실행). 내보내기/가져오기·페이지로드에 factStore 연결. (B)OCR 제목 버그 — jobTitleFromPosting이 깨진 첫줄을 직무칸에 자동입력하던 것 수정(의미글자[가-힣A-Za-z0-9] 비율 0.6+·4자+ 줄만 선택, 없으면 빈값→자동입력 안함). (C)Vercel 배포 — vercel.json framework "static"→null(무효값 오류). 배포: 새 프로젝트 claude-job(harin's projects 팀, preset Other, root ./), env UPSTAGE_API_KEY(Production+Preview) 등록 필요. GitHub 연동 배포라 push 필수.
- 요약(2026-06-24 후반): P2 잔여 완료. (5)공고↔프로젝트 매칭 — 클라이언트에서 카드 tags+techStack을 공고 본문과 대조(2자+, 대소문자무시), 일치 수로 점수화 상위5 표시. 공고분석 탭(matchOutput, 분석 클릭 시 즉시)·자소서 탭(coverMatchOutput, oninput 실시간) 패널. (6)자소서·이력서 작성 규칙화 — '낭궁성/남궁성 강사' 가이드 txt를 api/_writing-rules.js(COVER_GUIDE/RESUME_GUIDE)로 추려 generate-cover-letter/generate-resume 초안·병합 프롬프트에 주입(회사중심 동기·정량 수치증명·과거현재미래·면접관관점, 상/중/하 금지). (7)프로필 병합 업로드 — showReviewForm을 덮어쓰기→누적병합으로: skills/education/certifications/awards/links 합집합, 경력 max, 직무·강점 보존, 카드 제목중복 제외 이어붙임. 보기화면 '문서 추가 업로드' 버튼. (8)교육/자격증/수상/링크 섹션 신설(줄단위 textarea, 링크는 '설명|URL' 파싱·클릭), profileBlock·analyze-profile 확장. (9)스킬 레벨 배열화 — skills를 [{name,detail}]로(정량 보조설명, 상/중/하 금지 방침). parseSkills/skillsToText/mergeSkills(이름기준 중복제거), 구버전 쉼표문자열 자동변환, profileBlock·analyze-profile(sanitizeSkills) 대응.
- 요약(2026-06-24): (1)지원 이력 저장 — localStorage['goHistory'](상한50, 최신순)에 공고분석/자소서/이력서 결과 자동저장(캐시히트 자소서·이력서는 중복저장 안함), '지원 이력' 탭 신설(유형필터·건수·전체삭제 + 항목별 열기(토글, 초안 포함)/복사/다운로드/삭제), 제목 자동추출(이력서=jobTitle, 분석·자소서=공고 첫줄 40자), 내보내기/가져오기에 goHistory 포함. (2)UX 개편 — 공고 분석 완료 시 공고를 자소서탭(coverPosting)·이력서탭(jobTitle 비어있을때)에 자동전달(callAndRender onSuccess), 상단 'info' 진행배너 제거→화면 가운데 로딩 스피너(showLoading/hideLoading), 모든 안내문구를 가운데 토스트(showToast, 일반3초·오류5초)로 전환(showAlert는 토스트 별칭으로 호환). 참고: 프로필 업로드 상태글은 맥락정보라 그대로 둠.
- 이전 요약(2026-06-23): P1 대거 구현 세션. (1)직무별 프로필 — 저장모델을 단일 'profile'→'goData'{activeProfileId,profiles[]}로 전환+기존데이터 자동 마이그레이션+직무 전환 칩 UI. getProfile()이 활성 직무 반환해 하위호환. (2)프로젝트 카드 — projects textarea→projectCards[] CRUD, projects 텍스트는 카드에서 동기화(profileBlock API 무수정). (3)AI 근거(evidence) 표시 — analyze-profile가 항목별 근거 반환, 폼 필드 아래 노트. (4)AI→카드 자동추출 — 이력서에서 projectCards[] 추출해 자동 채움(sanitizeCards 방어). (5)저장후 읽기전용 보기화면 전환(showProfileView). (6)디자인 — 이모지 전부 제거 + 배경 미색(#faf7f0). (7)공고 입력 확장 — URL fetch(api/fetch-job.js, best-effort+폴백) + 이미지 OCR(api/ocr-job.js, Upstage). (8)자소서/이력서 앙상블 — 3관점 초안 병렬생성+편집자 병합, 마크다운 제거(stripMarkdown), 사용자 초안 확인 가능, 결과 localStorage 캐시.
- 다음 할 일: P2 전부 완료. 남은 것 — (P3) 사이트별 파서·지원현황 대시보드·자소서 버전관리. 병행: vercel dev로 OCR(경력12년 정확)·앙상블(초안3+병합·마크다운없음)·캐시 실측 검증, Vercel 배포+UPSTAGE_API_KEY 등록, 노출 키 재발급, GitHub remote 연결 후 push.

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
| 2026-06-24 | 작성 가이드를 코드(_writing-rules.js)로 규칙화 | 남궁성 강사 가이드를 매 생성마다 프롬프트에 주입해 품질 일관성 확보. 규칙 한 곳에서 관리 | txt 전문을 매번 삽입(토큰↑), 미반영 |
| 2026-06-24 | 스킬을 [{name,detail}] 정량 보조설명으로 | 강사 가이드가 상/중/하(주관적) 금지·정량 표현 권장. detail에 버전·기간·규모 기록 | 상/중/하 level 방식, 단순 문자열 유지 |

## 세션 로그
<!-- 최근 5개만 유지. 초과 시 WIKI.md "세션 아카이브"로 이동. 추가만, 수정 금지 -->
| 날짜 | 한줄요약 | 산출물 |
|------|---------|--------|
| 2026-06-23 | P1 구현(직무별프로필·프로젝트카드·AI근거·AI→카드추출) + 보기화면 UX + 이모지제거/미색배경 + 공고 URL/이미지OCR + 자소서/이력서 앙상블·캐시 | index.html, api/_upstage.js, api/analyze-profile.js, api/fetch-job.js, api/ocr-job.js, api/generate-*.js |
| 2026-06-23 | 서비스 기획 재정의: 공고→맞춤지원서 반복 루프 + 정보구조/P1~P3 로드맵 | WIKI.md, ISSUE.md, plans/claude-codex-jiggly-cray.md |
| 2026-06-23 | 로컬 API 테스트 설정(vercel dev/.env) + dev 재귀 수정 + file:// 가드 | package.json, .env, README.md, index.html |
| 2026-06-23 | 프로필 탭 UX 개편: 업로드→AI분석→검토 흐름, 드래그앤드롭 | index.html, api/analyze-profile.js |
| 2026-06-24 | P2 전체 완료: 지원이력 저장 + UX(자동전달·로딩스피너·토스트) + 공고↔프로젝트 매칭 + 작성 규칙화 + 프로필 병합업로드/4섹션 + 스킬 배열화 | index.html, api/_writing-rules.js, api/_upstage.js, api/analyze-profile.js, api/generate-*.js |
