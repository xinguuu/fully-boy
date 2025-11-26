# 📚 Xingu 문서 가이드

> **이 문서를 먼저 읽으세요!** 프로젝트의 모든 문서가 어디에 있고, 누가 무엇을 읽어야 하는지 안내합니다.

---

## 🗺️ 문서 구조 한눈에 보기

```
xingu/
├── CLAUDE.md                    # 🤖 AI 어시스턴트 전용
├── README.md                    # 👋 첫 방문자용 (Quick Start)
├── SENTRY_COMPLETION.md         # 📋 Sentry 통합 완료 체크리스트
├── .env.production.example      # 🔐 Production 환경변수 템플릿
│
└── docs/
    ├── 00-INDEX.md              # 📌 이 문서 (시작점)
    ├── 01-overview.md           # 📖 프로젝트 전체 개요
    ├── 02-ia.md                 # 🗂️ Information Architecture
    ├── 03-prd.md                # 📋 Product Requirements
    ├── 04-architecture.md       # 🏗️ 시스템 아키텍처
    ├── 05-design-guide.md       # 🎨 디자인 시스템
    ├── 06-development-guide.md  # 💻 개발 가이드 & 컨벤션
    ├── 07-deployment-guide.md   # 🚀 배포 가이드
    └── 08-sentry-setup.md       # 🐛 Sentry 설정 가이드
```

---

## 🎯 당신이 누구인가요?

### 🤖 AI 어시스턴트 (Claude 등)

**필수 읽기:**
1. [CLAUDE.md](../CLAUDE.md) - 핵심 규칙, 현재 상태, 개발 워크플로우

**개발 시 항상 참조:**
- [02-ia.md](02-ia.md) - Frontend 개발 시 (화면 구조, 사용자 플로우)
- [03-prd.md](03-prd.md) - API 개발 시 (엔드포인트 스펙, 요구사항)
- [05-design-guide.md](05-design-guide.md) - Frontend 스타일링 시 (컬러, 타이포그래피)
- [06-development-guide.md](06-development-guide.md) - 코딩 컨벤션, Recent Changes

**깊은 이해가 필요할 때:**
- [01-overview.md](01-overview.md) - 비즈니스 이해
- [04-architecture.md](04-architecture.md) - 시스템 구조, DB 스키마

---

### 👨‍💻 처음 시작하는 개발자

**1단계: 빠른 시작**
1. [README.md](../README.md) - 프로젝트 소개 + Quick Start
2. 환경 설정 (Docker, Node.js, PostgreSQL)
3. `pnpm install && pnpm dev` 실행

**2단계: 프로젝트 이해**
1. [01-overview.md](01-overview.md) - 프로젝트 비전, 타겟 유저, 비즈니스 모델
2. [02-ia.md](02-ia.md) - 화면 구조, 사용자 플로우 (전체 흐름 파악)
3. [04-architecture.md](04-architecture.md) - MSA 구조, 6개 서비스, DB 스키마

**3단계: 개발 시작**
1. [06-development-guide.md](06-development-guide.md) - 코딩 컨벤션 (필수!)
2. [03-prd.md](03-prd.md) - 작업할 기능의 상세 요구사항
3. [05-design-guide.md](05-design-guide.md) - 디자인 시스템 (Frontend만)

**추천 순서:**
```
README → 01-overview → 02-ia → 04-architecture → 06-development-guide
```

---

### 📋 기획자 / PM

**핵심 문서:**
1. [01-overview.md](01-overview.md) - 프로젝트 비전, 타겟, 시나리오, 수익 모델
2. [02-ia.md](02-ia.md) - 화면 구조, 사용자 플로우, 와이어프레임
3. [03-prd.md](03-prd.md) - 상세 요구사항, API 스펙, 비즈니스 로직

**기술 이해가 필요하다면:**
- [04-architecture.md](04-architecture.md) - 시스템 구조 (간단히)

---

### 🎨 디자이너 / UI/UX

**핵심 문서:**
1. [02-ia.md](02-ia.md) - 화면 구조, 사용자 플로우
2. [05-design-guide.md](05-design-guide.md) - 디자인 시스템 (필수!)
   - 컬러 팔레트
   - 타이포그래피
   - 컴포넌트 디자인
   - 애니메이션

**비즈니스 이해:**
- [01-overview.md](01-overview.md) - 타겟 유저, 시나리오

---

### 🏢 비즈니스 / 투자자

**핵심 문서:**
1. [01-overview.md](01-overview.md) - 전체 개요
   - 서비스 소개
   - 타겟 유저 & 시나리오
   - 차별화 포인트
   - 수익 모델
   - KPI

**기술적 이해:**
- [04-architecture.md](04-architecture.md) - 시스템 구조 (선택)

---

## 📂 문서별 상세 설명

| 문서 | 내용 | 독자 | 분량 |
|------|------|------|------|
| [01-overview.md](01-overview.md) | 프로젝트 전체 개요, 비즈니스, 기술 스택 | 전체 | 800줄 |
| [02-ia.md](02-ia.md) | UI 구조, 화면별 플로우, 사용자 여정 | 기획자, 디자이너, Frontend | 1,000줄 |
| [03-prd.md](03-prd.md) | 상세 요구사항, API 스펙, 비즈니스 로직 | PM, Backend, Frontend | 대용량 |
| [04-architecture.md](04-architecture.md) | 시스템 아키텍처, DB 스키마, 다이어그램 | Backend, DevOps | 1,200줄 |
| [05-design-guide.md](05-design-guide.md) | 디자인 시스템, 컴포넌트, 컬러, 타이포 | 디자이너, Frontend | 1,900줄 |
| [06-development-guide.md](06-development-guide.md) | 코딩 컨벤션, 파일 구조, Recent Changes | 개발자 | 1,000줄 |
| [07-deployment-guide.md](07-deployment-guide.md) | Production 배포 가이드, 인프라 설정 | DevOps, Backend | 중량 |
| [08-sentry-setup.md](08-sentry-setup.md) | Sentry 에러 추적 설정 상세 가이드 | DevOps, Backend | 중량 |

---

## 🔍 상황별 문서 찾기

### "프로젝트가 뭐하는 건지 알고 싶어요"
→ [01-overview.md](01-overview.md)

### "화면 구조가 어떻게 되나요?"
→ [02-ia.md](02-ia.md)

### "이 기능의 상세 요구사항이 뭐죠?"
→ [03-prd.md](03-prd.md)

### "DB 스키마를 보고 싶어요"
→ [04-architecture.md](04-architecture.md)

### "이 버튼 색상은 뭘 써야 하나요?"
→ [05-design-guide.md](05-design-guide.md)

### "코딩 컨벤션이 어떻게 되나요?"
→ [06-development-guide.md](06-development-guide.md)

### "최근에 무엇이 변경되었나요?"
→ [06-development-guide.md](06-development-guide.md) - Recent Changes 섹션

### "프로젝트 현재 상태는?"
→ [CLAUDE.md](../CLAUDE.md) - Current Status 섹션

### "Production 배포는 어떻게 하나요?"
→ [07-deployment-guide.md](07-deployment-guide.md)

### "Sentry 에러 추적 설정 방법은?"
→ [08-sentry-setup.md](08-sentry-setup.md)

### "새로운 게임 타입을 추가하고 싶어요"
→ [06-development-guide.md](06-development-guide.md) - Plugin System 섹션 참조

---

## 🚀 빠른 시작 (개발자)

```bash
# 1. 클론
git clone https://github.com/your-org/xingu.git
cd xingu

# 2. 의존성 설치
pnpm install

# 3. 데이터베이스 실행 (Docker)
docker compose up -d postgres redis

# 4. 마이그레이션
pnpm --filter=@xingu/database db:migrate

# 5. 개발 서버 실행
pnpm dev

# 6. 브라우저 열기
# http://localhost:3000
```

**자세한 내용**: [README.md](../README.md) 또는 [01-overview.md](01-overview.md#quick-start)

---

## 📝 문서 업데이트 원칙

### 누가 업데이트하나요?

- **CLAUDE.md**: AI 어시스턴트 (매 작업마다 Current Status 업데이트)
- **06-development-guide.md**: 개발자 (Recent Changes 섹션 업데이트)
- **01-overview.md**: PM (프로젝트 방향 변경 시)
- **02-ia.md**: 기획자/PM (화면 추가/변경 시)
- **03-prd.md**: PM (요구사항 변경 시)
- **04-architecture.md**: 백엔드 리드 (아키텍처 변경 시)
- **05-design-guide.md**: 디자이너 (디자인 시스템 변경 시)

### 언제 업데이트하나요?

- **작업 완료 시**: CLAUDE.md, 06-development-guide.md
- **기능 추가 시**: 02-ia.md, 03-prd.md
- **아키텍처 변경 시**: 04-architecture.md
- **디자인 변경 시**: 05-design-guide.md

---

## 🆘 도움이 필요하신가요?

- **버그 리포트**: GitHub Issues
- **질문**: GitHub Discussions
- **긴급 문의**: team@xingu.com

---

**마지막 업데이트**: 2025-11-26
**버전**: 1.2
