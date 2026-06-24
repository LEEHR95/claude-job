# GO 취업 — 위키

프로젝트 영구 지식. /co 체크아웃 시 자동 갱신.

## 목차
<!-- 카테고리별 지식이 추가되면 여기에 링크 -->

## 일반
<!-- 프로젝트 전반 지식 -->
- 서비스 방향(2026-06-23 기획 재정의): 가치 중심을 "프로필 만들기"가 아니라 **"공고 → 맞춤 지원서 반복"**에 둠. 취준생이 공고를 만날 때마다 돌아와 자소서·이력서를 뽑는 재사용 루프가 핵심. 프로필은 1회성 입력이 아니라 프로젝트·역량 카드가 누적되는 자산으로 취급하고, 생성물(공고분석/자소서/이력서)은 지원 이력으로 저장.
- 프로필 정보구조 목표안: skills는 `[{name, level}]` 배열화, projects는 ProjectCard 배열(`{id,title,period,role,summary,contributions[],outcomes[],techStack[],tags[]}`)로 카드화 → 공고에 맞는 프로젝트만 골라 생성. 부가항목: targetIndustry, tools, education, certificates, awards, links, weaknesses(보완점), `_ai.evidence`(추출 근거). 기존 5필드(position/experience/skills/projects/strengths)는 삭제 없이 상위 구조로 흡수 → 하위호환 마이그레이션 필요.
- 공고 입력 발전 단계: 텍스트 붙여넣기(현재·유지) → 붙여넣기 후 구조화 추출(회사/직무/필수·우대/마감일 JSON) → URL fetch(V2, JS렌더링·봇차단·로그인 때문에 best-effort+붙여넣기 폴백) → 사이트별 파서(V3). 범용 크롤러는 무리이므로 P3로 미룸.
- 전체 기획 원본: `~/.claude/plans/claude-codex-jiggly-cray.md` (문제점·정보구조·플로우·P1~P3 로드맵 전문).

## 기술
<!-- 기술 관련 학습 -->
- 문서 텍스트 추출(브라우저): PDF는 pdf.js(`pdfjsLib`, workerSrc 설정 필요), Word(docx)는 mammoth.js(`mammoth.extractRawText`). 둘 다 CDN 로드. (.doc 구버전은 미지원, docx만)
- 데이터 저장 위치: 모든 프로필 데이터(업로드 문서 추출 텍스트 포함)는 브라우저 localStorage('profile')에만 저장. 서버 전송은 생성 요청 시뿐. 업로드 문서는 `refCover`/`refResume` 키에 텍스트로 보관.
- 생성 프롬프트: 기존 문서는 `"""..."""` 블록으로 감싸 "복사 금지, 문체·톤만 참고" 지시와 함께 전달.
- 프로필 자동 추출: 이력서 텍스트 → `/api/analyze-profile`이 position/experience/skills/projects/strengths + confidence(신뢰도) + uncertain(확인필요 키 배열)을 JSON으로 반환. 모델이 코드펜스/잡설을 붙일 수 있어 서버에서 코드펜스 제거 후 첫 `{`~마지막 `}` 범위만 JSON.parse, 실패 시 502+안내 메시지로 폴백. uncertain은 5개 유효키로 필터.
- 프로필 탭 UX: 시작화면은 업로드 중심(이력서/자소서/직접입력 3선택), 입력필드는 `#profileForm`에 숨겨두고 AI분석·직접입력 시에만 표시. 업로드 박스는 `.drop-zone` 클래스로 드래그앤드롭+클릭 공용, onchange/ondrop 모두 `handleResumeUpload(file)`/`handleCoverUpload(file)`(파일 인자) 호출. 이력서→refResume, 자소서→refCover로 문체참고 자동저장.
- 로컬 실행: `vercel dev`(localhost:3000)에서 index.html + /api 함수 동시 동작. **env는 `.env` 로드**(프레임워크 없는 정적+함수 구조라 `.env.local` 아님). `package.json`에 `dev: vercel dev` 스크립트를 두면 vercel dev가 자기 자신을 재호출해 무한 재귀 → dev 스크립트 두지 말 것. `.env`/`.env.local`/`.vercel`은 .gitignore 처리. file://로 열면 isApiAvailable()(http/https만 true)이 API 호출 차단.

- 저장 모델(goData): localStorage['goData'] = `{ activeProfileId, profiles:[...] }`. 각 profile은 직무 단위 슬롯(id, label=직무명 + 기존 필드들). 구버전 단일 'profile'은 loadData()가 첫 진입 시 자동 마이그레이션(profiles[0]로 흡수). getProfile()=활성 직무 반환(하위코드 호환), saveActiveProfile(obj)=활성 슬롯에 병합저장(id/label 보존). 직무 전환=switchProfile, 추가=addProfile, 삭제/이름변경 제공. 내보내기/가져오기는 goData 기준(구버전 profile 키도 호환 임포트).
- 프로젝트 카드: profile.projectCards[] = `{id,title,period,role,summary,contributions[],outcomes[],techStack[],tags[]}`. 화면은 카드 CRUD(projectEditor 인라인 폼). profile.projects(텍스트)는 cardsToText()로 카드에서 동기화 → api/_upstage.js profileBlock이 그대로 사용(서버 무수정). AI 분석(analyze-profile)이 projectCards[]도 추출→기존 카드 없을 때만 자동 채움(sanitizeCards로 방어).
- 화면 상태 3단계: profileStart(업로드 시작) / profileForm(수정 폼) / profileView(읽기전용 보기). 저장하면 보기화면으로 전환, 새로고침도 보기화면. 보기의 "수정"→폼, 폼의 "취소"→보기.
- 공고 입력 3경로: ① URL(api/fetch-job.js: 서버 fetch+HTML→텍스트, 12s 타임아웃, 봇차단/동적로딩은 폴백 안내) ② 이미지 OCR(api/ocr-job.js: Upstage Document OCR `POST /v1/document-digitization`, multipart model=ocr+document, 응답 data.text. 클라가 base64 JSON 전송, 장당 4MB 가드, config bodyParser 6mb) ③ 붙여넣기. **OCR 후 LLM 정리 단계는 쓰지 말 것** — 숫자·고유명사를 변조함(경력12년→1~2년, Figma→Wireframe 실제 발생).
- 자소서/이력서 앙상블: api/_upstage.js runEnsemble({angles, draftPrompt, mergePrompt}) — 관점 다른 초안 Promise.all 병렬 생성 후 편집자 패스로 병합. 반환 `{drafts:[{label,text}], merged}`. stripMarkdown()으로 **·##·//·불릿 제거(지원서 바로 붙여쓰기). 프런트는 완성본+초안3개(접기) 표시, generateEnsemble()이 localStorage['genCache']에 입력 해시로 결과 캐시(최근20개), "다시 생성"=force. 모델은 solar-pro2 유지.

## 워크플로우
<!-- 작업 방식 관련 -->

## 교훈
<!-- ERROR.md에서 승급된 패턴, 해결된 에러의 교훈 -->

## 세션 아카이브
<!-- MEMORY.md에서 5개 초과한 세션 로그 보관 -->
| 날짜 | 한줄요약 | 산출물 |
|------|---------|--------|
| 2026-06-23 | 기존 자소서·이력서 업로드(PDF/Word) → 문체 참고 생성 | index.html, api/generate-cover-letter.js, api/generate-resume.js |
| 2026-06-23 | API 보안 강화 (Vercel Function) | api/claude.js, vercel.json, README.md |
| 2026-06-22 | index.html 생성 | 프로필·이력서·공고분석 기능 |
