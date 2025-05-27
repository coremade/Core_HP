# 개발 환경 설정 문서

## 1. 시스템 개요

### 1.1 목적

- 개발자 인력 풀의 효율적인 관리
- 개발자 기술 스택 기반 검색 및 매칭
- 프로젝트-개발자 매칭 최적화

## 2. 기술 스택 및 버전 정보

### 2.1 프론트엔드

| 프로그램   | 버전    | 상태 | 용도       |
| ---------- | ------- | ---- | ---------- |
| Next.js    | 14.1.0  | ✅   | 프레임워크 |
| TypeScript | 5.3.3   | ✅   | 언어       |
| Node.js    | 20.11.1 | ✅   | 런타임     |

### 2.2 백엔드

| 프로그램   | 버전    | 상태 | 용도          |
| ---------- | ------- | ---- | ------------- |
| Node.js    | 20.11.1 | ✅   | 런타임        |
| Express.js | 4.18.2  | ✅   | 웹 프레임워크 |
| MySQL      | 8.0.36  | ✅   | 데이터베이스  |
| Sequelize  | 6.37.1  | ✅   | ORM           |

### 2.3 개발 도구

| 프로그램           | 버전   | 상태 | 용도       |
| ------------------ | ------ | ---- | ---------- |
| Git                | 2.43.0 | ✅   | 버전 관리  |
| Visual Studio Code | 1.87.0 | ✅   | IDE        |
| Docker Desktop     | 4.27.2 | ✅   | 컨테이너화 |

✅: 설치 완료

## 3. 프로그램 설치 위치

### 3.1 주요 프로그램

- MySQL: `C:\Program Files\MySQL\MySQL Server 8.0\`
  - MySQL bin: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- Node.js: 시스템 PATH에 등록됨
- Git: 시스템 PATH에 등록됨
- Visual Studio Code: 시스템 PATH에 등록됨
- Docker Desktop: 시스템 PATH에 등록됨

## 4. 프로젝트 구조

```
C:\Projects\CORE_HP\
├── frontend/           # Next.js 14 + TypeScript
├── backend/           # Node.js + Express.js
└── shared/
    ├── resources/     # 공유 리소스
    ├── documents/     # 문서
    ├── databases/     # DB 스키마, 마이그레이션
    ├── tools/         # 유틸리티 스크립트
    └── backups/       # 백업 파일
```

## 5. 초기 설정 방법

### 5.1 Git 설정

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf true
git config --global core.safecrlf warn
git config --global init.defaultBranch main
```

### 5.2 MySQL 설정

```bash
mysql -u root -p
```

- root 비밀번호 설정
- 데이터베이스 생성: `dev_management`
- 사용자 생성 및 권한 설정

### 5.3 환경 변수 설정

- MySQL bin 디렉토리: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- Node.js
- Docker
- 기타 필요한 PATH 설정

## 6. Docker Compose 설정

프로젝트 루트에 `docker-compose.yml` 파일:

```yaml
version: "3.8"

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:4000

  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=dev_management

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=dev_management
```

## 7. 유용한 명령어

```bash
# 버전 확인
mysql --version
node -v
git --version
docker --version
docker-compose --version

# 서비스 상태 확인
Get-Service -Name MySQL80
docker ps

# Docker Compose 명령어
docker-compose up -d
docker-compose down
docker-compose logs
```

## 8. 문제 해결

### 8.1 MySQL 문제

1. 서비스 상태 확인:
   ```powershell
   Get-Service -Name MySQL80
   ```
2. 서비스 재시작:
   ```powershell
   Restart-Service -Name MySQL80
   ```

### 8.2 Docker 문제

1. 컨테이너 상태 확인:
   ```bash
   docker ps -a
   ```
2. 로그 확인:
   ```bash
   docker logs [container_id]
   ```

## 9. 업데이트 내역

- 최초 작성: 2024-02-20
- 마지막 업데이트: 2024-02-20
- 문서 버전: 1.0
- 변경 사항: 설치 완료된 프로그램만 포함하도록 업데이트
