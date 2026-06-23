# GO 취업 — AI 기반 이력서 생성 및 공고 분석

개인용 한국어 취업 지원 웹앱. 저장한 프로필을 기반으로 AI가 이력서 초안을 생성하고, 기업 공고를 분석해 직무 적합도를 파악해주는 도구.

## 기능

- **📋 프로필 관리** — 이름, 경력, 스킬, 학력 저장 (로컬 저장)
- **📄 이력서 생성** — 프로필을 기반으로 AI가 한국어 이력서 작성
- **🎯 공고 분석** — 채용 공고와 당신의 적합도를 분석 (직무 적합도, 스킬 매칭율, 강점/약점 분석)
- **⚙️ 설정** — AI 모델 선택, 작성 톤 조정, 데이터 백업

## 배포 방법 (Vercel)

### 1. Vercel 계정 생성
[vercel.com](https://vercel.com)에서 GitHub, GitLab, 또는 이메일로 계정 생성

### 2. Anthropic API 키 발급
[console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)에서 API 키 발급받기

### 3. 프로젝트 배포

**방법 A: GitHub 연동 (권장)**
1. 이 프로젝트를 GitHub에 push
2. Vercel에서 "New Project" → GitHub 저장소 선택
3. 배포 진행

**방법 B: Vercel CLI 사용**
```bash
npm i -g vercel
vercel
```

### 4. 환경 변수 설정

Vercel 대시보드에서:
1. Settings → Environment Variables
2. 변수 추가:
   - **이름**: `ANTHROPIC_API_KEY`
   - **값**: 발급받은 API 키 붙여넣기
3. 배포 트리거 (Redeploy 또는 푸시)

## 로컬 실행 (개발)

### Node.js 필요
```bash
npm i
vercel dev
```

그러면 `http://localhost:3000`에서 실행됨

### 환경 변수 설정 (.env.local)
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx...
```

## 파일 구조

```
.
├── index.html           # 메인 앱 (프로필, 이력서, 공고분석)
├── api/
│   └── claude.js        # Vercel Function (API 프록시)
├── vercel.json          # Vercel 배포 설정
└── README.md            # 이 파일
```

## 보안

- **API 키는 서버에만 저장** — 클라이언트에 노출되지 않음
- **프로필 데이터는 로컬에 저장** — 브라우저 localStorage에만 보관
- **HTTPS 암호화** — Vercel 자동 배포

## 비용

- Vercel: 무료
- Anthropic API: 종량제 (약 $0.003 ~ $0.015 / 요청)
  - 이력서 생성: ~1,500 토큰 입력, ~800 토큰 출력
  - 공고 분석: ~1,200 토큰 입력, ~700 토큰 출력

## 문제 해결

**"Server Error: 500"**
- Vercel 대시보드에서 `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있는지 확인
- API 키가 유효한지 확인

**"Method not allowed"**
- POST 요청만 지원합니다. GET 요청은 불가능

**데이터 초기화 (모두 삭제)**
- 브라우저 DevTools → Application → Local Storage → 삭제
- 또는 "설정" 탭에서 "모든 데이터 삭제" 클릭

## 라이센스

개인 프로젝트 (MIT)
