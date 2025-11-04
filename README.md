# UMessenger - React TypeScript 메신저 프로젝트

React 18 + TypeScript + Vite로 구축된 웹 메신저 애플리케이션

## 기술 스택

### 코어
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구

### 상태 관리 & 데이터
- **Zustand** - 경량 상태 관리
- **@tanstack/react-query** - 서버 상태 관리 및 데이터 페칭
- **Axios** - HTTP 클라이언트

### UI & 스타일링
- **Ant Design (antd)** - UI 컴포넌트 라이브러리
- **CSS Modules** - 컴포넌트 스타일링

### 폼 & 유틸리티
- **React Hook Form** - 폼 상태 관리
- **React Router DOM** - 라우팅
- **date-fns** - 날짜 처리

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── Login.tsx       # 로그인 페이지
│   ├── Messages.tsx    # 쪽지함
│   ├── Organization.tsx # 조직도
│   ├── Notice.tsx      # 공지사항
│   └── Settings.tsx    # 설정
├── components/         # 재사용 가능한 컴포넌트
├── layouts/            # 레이아웃 컴포넌트
│   ├── PopupLayout.tsx # 팝업 레이아웃 (1000x500px, min 500px)
│   └── Sidebar.tsx     # 사이드바 네비게이션
├── styles/             # CSS Module 파일
├── api/                # API 함수 및 Axios 설정
├── store/              # Zustand 스토어
│   └── authStore.ts    # 인증 상태 관리
├── types/              # TypeScript 타입 정의
├── hooks/              # 커스텀 훅
└── utils/              # 유틸리티 함수
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```

### 5. 빌드 파일 미리보기
```bash
npm run preview
```

## 주요 기능

### 인증
- 로그인 페이지
- Zustand를 사용한 인증 상태 관리
- Protected Routes (로그인 필요)

### 메신저 레이아웃
- **팝업 형태**: 1000px × 500px 크기
- **최소 크기**: 500px (그 이하로 줄어들지 않음)
- **사이드바 네비게이션**: 쪽지, 조직도, 공지사항, 설정

### 페이지

#### 쪽지함 (Messages)
- 쪽지 목록 테이블
- 새 쪽지 작성
- 쪽지 삭제 기능

#### 조직도 (Organization)
- Tree 구조로 조직 계층 표시
- 확장/축소 가능한 트리 뷰

#### 공지사항 (Notice)
- 공지사항 목록
- 중요 공지 태그 표시

#### 설정 (Settings)
- 알림 설정 (새 쪽지, 공지사항)
- 개인정보 수정

## API 구조

API 함수는 `src/api/index.ts`에 정의되어 있습니다.

```typescript
// 인증
authAPI.login(credentials)
authAPI.logout()

// 쪽지
messagesAPI.getMessages()
messagesAPI.sendMessage(message)
messagesAPI.deleteMessage(id)

// 공지사항
noticesAPI.getNotices()
```

## 개발 가이드

### 새 페이지 추가
1. `src/pages/`에 페이지 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. `src/layouts/Sidebar.tsx`에 네비게이션 아이템 추가

### 새 API 엔드포인트 추가
1. `src/types/index.ts`에 타입 정의
2. `src/api/index.ts`에 API 함수 추가

### 상태 관리
- **로컬 상태**: `useState`, `useReducer` 사용
- **전역 상태**: Zustand 스토어 사용 (`src/store/`)
- **서버 상태**: React Query 사용

## 라이센스

MIT
