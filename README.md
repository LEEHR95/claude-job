# GO 취업 — 채용공고 기반 지원 전략 도구

개인용 한국어 취업 지원 웹앱. 채용 공고를 분석해 내 경험과 연결하고, 지원 전략 · 자기소개서 초안 · 이력서 초안을 생성하는 AI 취업 도우미.

## 기능

- **📋 프로필 관리** — 지원 직무, 경력, 기술 스택, 프로젝트 경험, 강점 저장 (로컬 저장)
- **🎯 공고 분석 & 지원 전략** — 핵심 요구사항, 내 경험과의 연결, 부족한 부분, 이력서 강조 포인트, 면접 예상 질문, 지원 전략 요약
- **✍️ 자기소개서 초안** — 지원 동기 · 직무 역량 · 문제 해결 경험 · 입사 후 포부 초안 생성
- **📄 이력서 생성** — 프로필 기반 이력서 초안 작성
- **⚙️ 설정** — 데이터 백업/복원

AI 모델은 **Upstage Solar Pro 2** (`solar-pro2`) 고정.

## 배포 방법 (Vercel)

### 1. Vercel 계정 생성
[vercel.com](https://vercel.com)에서 계정 생성

### 2. Upstage API 키 발급
[console.upstage.ai](https://console.upstage.ai)에서 API 키 발급

### 3. 프로젝트 배포

**방법 A: GitHub 연동 (권장)**
1. 이 프로젝트를 GitHub에 push
2. Vercel에서 "New Project" → GitHub 저장소 선택 → 배포

**방법 B: Vercel CLI**
```bash
npm i -g vercel
vercel
```

### 4. 환경 변수 설정

Vercel 대시보드에서:
1. Settings → Environment Variables
2. 변수 추가:
   - **이름**: `UPSTAGE_API_KEY`
   - **값**: 발급받은 API 키
3. Redeploy

## 로컬 실행 (개발)

```bash
npm i -g vercel
vercel dev
```

`.env.local`:
```
UPSTAGE_API_KEY=up_xxxxxxxx...
```

## 파일 구조

```
.
├── index.html                    # 메인 앱
├── api/
│   ├── _upstage.js               # Solar Pro 2 공용 호출 헬퍼 (비공개)
│   ├── analyze-job.js            # 공고 분석 & 지원 전략
│   ├── generate-cover-letter.js  # 자기소개서 초안
│   └── generate-resume.js        # 이력서 생성
├── vercel.json                   # Vercel 배포 설정
└── README.md
```

## 보안

- **API 키는 서버 환경 변수에만 저장** — 클라이언트에 노출되지 않음
- **프롬프트는 서버에서 구성** — Vercel Function 내부에서만 처리
- **프로필 데이터는 브라우저 localStorage에만 보관**

## 문제 해결

**"UPSTAGE_API_KEY가 서버에 설정되지 않았습니다"**
- Vercel 환경 변수 설정 후 Redeploy 확인

**"Method not allowed"**
- POST 요청만 지원

**데이터 초기화** — 설정 탭 → "모든 데이터 삭제"

## 라이센스

개인 프로젝트 (MIT)
