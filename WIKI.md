# GO 취업 — 위키

프로젝트 영구 지식. /co 체크아웃 시 자동 갱신.

## 목차
<!-- 카테고리별 지식이 추가되면 여기에 링크 -->

## 일반
<!-- 프로젝트 전반 지식 -->

## 기술
<!-- 기술 관련 학습 -->
- 문서 텍스트 추출(브라우저): PDF는 pdf.js(`pdfjsLib`, workerSrc 설정 필요), Word(docx)는 mammoth.js(`mammoth.extractRawText`). 둘 다 CDN 로드. (.doc 구버전은 미지원, docx만)
- 데이터 저장 위치: 모든 프로필 데이터(업로드 문서 추출 텍스트 포함)는 브라우저 localStorage('profile')에만 저장. 서버 전송은 생성 요청 시뿐. 업로드 문서는 `refCover`/`refResume` 키에 텍스트로 보관.
- 생성 프롬프트: 기존 문서는 `"""..."""` 블록으로 감싸 "복사 금지, 문체·톤만 참고" 지시와 함께 전달.
- 프로필 자동 추출: 이력서 텍스트 → `/api/analyze-profile`이 position/experience/skills/projects/strengths + confidence(신뢰도) + uncertain(확인필요 키 배열)을 JSON으로 반환. 모델이 코드펜스/잡설을 붙일 수 있어 서버에서 코드펜스 제거 후 첫 `{`~마지막 `}` 범위만 JSON.parse, 실패 시 502+안내 메시지로 폴백. uncertain은 5개 유효키로 필터.
- 프로필 탭 UX: 시작화면은 업로드 중심(이력서/자소서/직접입력 3선택), 입력필드는 `#profileForm`에 숨겨두고 AI분석·직접입력 시에만 표시. 업로드 박스는 `.drop-zone` 클래스로 드래그앤드롭+클릭 공용, onchange/ondrop 모두 `handleResumeUpload(file)`/`handleCoverUpload(file)`(파일 인자) 호출. 이력서→refResume, 자소서→refCover로 문체참고 자동저장.

## 워크플로우
<!-- 작업 방식 관련 -->

## 교훈
<!-- ERROR.md에서 승급된 패턴, 해결된 에러의 교훈 -->

## 세션 아카이브
<!-- MEMORY.md에서 5개 초과한 세션 로그 보관 -->
