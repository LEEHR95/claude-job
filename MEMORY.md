# GO 취업 — 메모리

## 마지막 세션
<!-- /co가 이 섹션 전체를 덮어씁니다 (다음 "##"까지) -->
- 날짜: 2026-06-28
- 요약(2026-06-28): 프로필 '경력 사항' 카드(회사별 이력) 신규 + 자소서 첨부 UI 개선. (1)경력 카드 — careerCards[]{id,company,period,role,summary,contributions[],outcomes[]}, 프로젝트 카드와 동일 CRUD(addCareerCard/edit/save/delete/cancel, careerEditorHtml, _editingCareerId, project-card·project-editor-box CSS 재사용). careers 텍스트 동기화(careersToText→persistCareerCards). 폼 fg-careers 섹션(경력년수 칸 아래), 보기화면 '경력 사항' 섹션(buildProfileViewHtml), saveProfile/fillProfileForm/clearProfile 연동. AI 추출 병합 — 회사명+기간 normTitle 중복제거 후 기존에 누적. api/analyze-profile.js 스키마에 careerCards 추가('어디서 일했나' vs projectCards '무엇을 만들었나', 같은 회사 프로젝트는 contributions로 묶기). api/_upstage.js profileBlock에 '경력 사항' 주입→생성 반영. 기존엔 경력=년수 숫자 한 칸뿐이라 회사별 이력 입력·표시 칸 없던 문제 해결. (2)자소서 첨부 UI — 폼 기본 file input(항상 '선택된 파일 없음' 노출) 숨김. displayDocStatus: 첨부시 초록박스 '✓ 현재 첨부됨: OO.pdf (N자)'+[다른 파일로 교체]/[삭제], 미첨부시 [자소서 첨부하기] 버튼. 교체는 hidden input.click(). 이력서 교체(replace)시 refCover/refResume는 keep목록(line~1450)으로 보존됨 확인. 생성 자소서/지원이력은 goHistory로 프로필과 별개라 무관.
- 이전 요약(2026-06-25): UI 개편 — 상단 가로탭→우측 sticky 사이드바, 본문카드 독립스크롤, 지원이력 공고별 묶음(jobKey 그룹핑), Word/묶음 내보내기(downloadDoc .doc msword), 적합도(analyzeJobFit 빠진키워드), 새 공고 초기화(resetAnalysis).
- 이전 요약(2026-06-24): P2 완료 — 공고↔프로젝트 매칭, 작성규칙화(_writing-rules.js), 프로필 병합업로드+4섹션, 스킬 [{name,detail}] 배열화, 지원이력 저장(goHistory), 사실검증, OCR 제목버그 수정, Vercel 배포.
- 다음 할 일: ① Vercel 배포본에서 AI 경력 카드 추출 동작 확인(이력서 재업로드 시 careerCards 자동 생성되는지) ② (선택) 경력 카드 담당업무 키워드를 공고 적합도 매칭(getMyTerms)에 포함할지 결정 ③ 기존 검증 — .doc Word/한글 열림, 적합도 사전(COMMON_JD_KEYWORDS) 실공고 튜닝, jobKey 그룹핑. (배포운영) UPSTAGE_API_KEY 등록 확인.

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
| 2026-06-25 | 탭을 우측 sticky 사이드바 + 본문카드 독립스크롤 | 사용자 요청. 페이지 중앙고정·사이드바 따라다님·맨위로 버튼 | 상단 가로탭 유지, 좌측 사이드바 |
| 2026-06-25 | 적합도를 클라이언트 키워드사전으로 계산 | 분석 AI호출에 의존 안 하고 즉시·무비용. 내 용어∪공통JD사전으로 빠진키워드 검출 | analyze-job API가 score/missing JSON 반환(비용·응답형변경 위험) |
| 2026-06-25 | Word 내보내기를 HTML→.doc(msword)로 | 라이브러리 없이 Word/한글에서 바로 열림. 단일 HTML 유지 | docx 생성 라이브러리 추가, PDF 변환 |
| 2026-06-28 | 경력 사항을 projectCards와 동일한 카드 구조로 분리 | '경력=년수 숫자 한 칸'은 회사별 이력을 담지 못함. 검증된 프로젝트 카드 패턴/CSS 재사용으로 위험 최소화 | experience 한 칸 유지, 경력을 자유 텍스트 한 칸으로 |
| 2026-06-28 | 자소서 첨부를 기본 file input→상태박스+버튼으로 | 기본 input이 항상 '선택된 파일 없음'을 노출해 첨부 여부 혼란. 첨부 강조+클릭 교체로 명확화 | 기본 input 유지, 라벨만 추가 |

## 세션 로그
<!-- 최근 5개만 유지. 초과 시 WIKI.md "세션 아카이브"로 이동. 추가만, 수정 금지 -->
| 날짜 | 한줄요약 | 산출물 |
|------|---------|--------|
| 2026-06-23 | P1 구현(직무별프로필·프로젝트카드·AI근거·AI→카드추출) + 보기화면 UX + 이모지제거/미색배경 + 공고 URL/이미지OCR + 자소서/이력서 앙상블·캐시 | index.html, api/_upstage.js, api/analyze-profile.js, api/fetch-job.js, api/ocr-job.js, api/generate-*.js |
| 2026-06-23 | 서비스 기획 재정의: 공고→맞춤지원서 반복 루프 + 정보구조/P1~P3 로드맵 | WIKI.md, ISSUE.md, plans/claude-codex-jiggly-cray.md |
| 2026-06-23 | 로컬 API 테스트 설정(vercel dev/.env) + dev 재귀 수정 + file:// 가드 | package.json, .env, README.md, index.html |
| 2026-06-23 | 프로필 탭 UX 개편: 업로드→AI분석→검토 흐름, 드래그앤드롭 | index.html, api/analyze-profile.js |
| 2026-06-24 | P2 전체 완료: 지원이력 저장 + UX(자동전달·로딩스피너·토스트) + 공고↔프로젝트 매칭 + 작성 규칙화 + 프로필 병합업로드/4섹션 + 스킬 배열화 | index.html, api/_writing-rules.js, api/_upstage.js, api/analyze-profile.js, api/generate-*.js |
| 2026-06-25 | 우측 sticky 사이드바+본문 독립스크롤 + 지원이력 공고별 묶음 + Word/묶음 내보내기 + 적합도(빠진 키워드) + 새 공고 초기화 | index.html |
| 2026-06-28 | 프로필 경력 사항 카드(회사별 이력) 신규 + 자소서 첨부 UI 개선(현재 첨부 강조/클릭 교체) | index.html, api/analyze-profile.js, api/_upstage.js |
