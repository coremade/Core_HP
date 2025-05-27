# 개발자 관리 및 기술 스펙 검색 시스템

본 프로젝트는 개발자 관리와 기술 스펙 검색을 위한 통합 시스템입니다.

## 기술 스택

### Frontend

- Vue.js
- Vuetify

### Backend

- Node.js
- Express
- MySQL

### Infrastructure

- Docker
- Docker Compose

## 설치 방법

### 사전 요구사항

- Node.js 16.x 이상
- Docker
- Docker Compose

### 설치 단계

1. 저장소 클론

```bash
git clone [repository-url]
cd Core_HP
```

2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 적절히 수정하세요
```

3. 개발 환경 설정

```bash
./install-dev-env.ps1
```

## 실행 방법

### 개발 환경

```bash
# Frontend 실행
cd frontend
npm install
npm run serve

# Backend 실행
cd backend
npm install
npm run dev
```

### Docker 환경

```bash
docker-compose up -d
```

## 프로젝트 구조

```
├── frontend/         # Vue.js 프론트엔드
├── backend/         # Node.js 백엔드
├── shared/          # 공유 리소스
└── docker-compose.yml
```

## 환경 설정

- `.env` 파일에서 다음 환경 변수들을 설정해야 합니다:
  - `DB_HOST`: 데이터베이스 호스트
  - `DB_PORT`: 데이터베이스 포트
  - `DB_USER`: 데이터베이스 사용자
  - `DB_PASSWORD`: 데이터베이스 비밀번호
  - `DB_NAME`: 데이터베이스 이름

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
