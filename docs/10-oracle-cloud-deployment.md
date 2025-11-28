# Oracle Cloud 배포 가이드 (Xingu)

> **대상**: 1인 개발자, 무료 티어 활용
> **예상 시간**: 2-3시간
> **비용**: 완전 무료 (Always Free Tier)

---

## 목차

1. [Oracle Cloud 계정 생성](#step-1-oracle-cloud-계정-생성)
2. [ARM VM 인스턴스 생성](#step-2-arm-vm-인스턴스-생성)
3. [VM 초기 설정](#step-3-vm-초기-설정)
4. [Docker 및 Docker Compose 설치](#step-4-docker-및-docker-compose-설치)
5. [프로젝트 배포 준비](#step-5-프로젝트-배포-준비)
6. [Cloudflare R2 설정](#step-6-cloudflare-r2-설정)
7. [도메인 및 SSL 설정](#step-7-도메인-및-ssl-설정)
8. [배포 및 실행](#step-8-배포-및-실행)
9. [모니터링 및 유지보수](#step-9-모니터링-및-유지보수)

---

## Step 1: Oracle Cloud 계정 생성

### 1.1 가입 페이지 접속

```
https://www.oracle.com/cloud/free/
```

**"Start for free"** 버튼 클릭

### 1.2 가입 정보 입력

| 항목 | 입력 내용 | 비고 |
|------|----------|------|
| Country | South Korea | |
| Name | 본인 이름 | 영문 권장 |
| Email | 본인 이메일 | 인증 필요 |
| **Home Region** | **South Korea (Chuncheon)** | ⚠️ 변경 불가! |
| Account Type | Individual | 개인 |

### 1.3 결제 정보 등록

```
⚠️ 중요: 카드 등록은 인증용입니다. 청구되지 않습니다.
```

- **해외결제 가능한 신용카드** 권장
- 체크카드는 거절될 수 있음
- $1 임시 결제 후 취소됨 (인증용)

### 1.4 가입 완료 확인

1. 이메일 인증 완료
2. Oracle Cloud Console 접속: https://cloud.oracle.com/
3. 로그인 후 대시보드 확인

### 1.5 Always Free 리소스 확인

로그인 후 **Governance > Limits, Quotas and Usage** 에서 확인:

| 리소스 | Always Free 제공량 |
|--------|-------------------|
| VM.Standard.A1 (ARM) | 4 OCPU, 24GB RAM |
| VM.Standard.E2.1.Micro (AMD) | 2개 |
| Block Volume | 200GB |
| Object Storage | 10GB |
| Load Balancer | 1개 (10Mbps) |

---

## Step 2: ARM VM 인스턴스 생성

### 2.1 Compute 인스턴스 페이지 이동

```
메뉴 (☰) > Compute > Instances > Create Instance
```

### 2.2 인스턴스 설정

#### 기본 정보
```
Name: xingu-server
Compartment: (기본값 유지)
```

#### Image and Shape 설정

**Image 선택:**
```
Platform: Ubuntu
버전: Canonical Ubuntu 24.04 LTS (aarch64) ← ARM용 선택!
```

**Shape 선택 (중요!):**
```
1. "Change Shape" 클릭
2. "Ampere" 탭 선택 (ARM 기반)
3. VM.Standard.A1.Flex 선택
4. OCPU: 4, Memory: 24GB 설정
```

> ⚠️ ARM (Ampere)를 선택해야 Always Free입니다!

#### Networking 설정
```
VCN: Create new virtual cloud network
Subnet: Create new public subnet
Public IPv4 address: Assign a public IPv4 address ✅
```

#### SSH Key 추가

**Option A: 새 키 생성**
```
"Generate a key pair for me" 선택
→ Private key 다운로드 (xingu-server.key)
→ 안전한 곳에 보관!
```

**Option B: 기존 키 사용**
```
"Upload public key files" 선택
→ ~/.ssh/id_rsa.pub 업로드
```

#### Boot Volume
```
Boot volume size: 100GB (기본값)
Use in-transit encryption: ✅
```

### 2.3 인스턴스 생성

**"Create"** 버튼 클릭

> 프로비저닝에 1-5분 소요

### 2.4 공인 IP 확인

인스턴스 상세 페이지에서:
```
Public IP: xxx.xxx.xxx.xxx (메모해두기!)
```

### 2.5 보안 목록 설정 (포트 열기)

```
인스턴스 상세 > Primary VNIC > Subnet > Security Lists > Default Security List
```

**Ingress Rules 추가:**

| Source CIDR | Protocol | Dest Port | 용도 |
|-------------|----------|-----------|------|
| 0.0.0.0/0 | TCP | 22 | SSH (기본 있음) |
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | TCP | 3000 | Next.js (개발용) |
| 0.0.0.0/0 | TCP | 3001-3006 | Backend Services (개발용) |

**규칙 추가 방법:**
```
1. "Add Ingress Rules" 클릭
2. Source CIDR: 0.0.0.0/0
3. IP Protocol: TCP
4. Destination Port Range: 80
5. "Add Ingress Rules" 클릭
```

---

## Step 3: VM 초기 설정

### 3.1 SSH 접속

**macOS/Linux:**
```bash
# 키 권한 설정 (처음 한 번만)
chmod 400 ~/Downloads/xingu-server.key

# SSH 접속
ssh -i ~/Downloads/xingu-server.key ubuntu@<PUBLIC_IP>
```

**Windows (PowerShell):**
```powershell
ssh -i C:\Users\<username>\Downloads\xingu-server.key ubuntu@<PUBLIC_IP>
```

### 3.2 시스템 업데이트

```bash
# Ubuntu 기준
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl wget git vim htop
```

### 3.3 Swap 메모리 설정 (권장)

```bash
# 4GB Swap 생성
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 확인
free -h
```

### 3.4 방화벽 설정 (iptables)

Oracle Cloud는 OS 레벨 방화벽도 설정 필요:

```bash
# 포트 열기
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3002 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3003 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3004 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3005 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3006 -j ACCEPT

# 규칙 저장
sudo netfilter-persistent save
```

**Ubuntu 24.04에서 netfilter-persistent 설치:**
```bash
sudo apt install -y iptables-persistent netfilter-persistent
# 설치 중 "현재 규칙 저장?" → Yes 선택
```

---

## Step 4: Docker 및 Docker Compose 설치

### 4.1 Docker 설치

```bash
# Docker 공식 설치 스크립트
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 재로그인 (그룹 적용)
exit
# 다시 SSH 접속
```

### 4.2 Docker 확인

```bash
docker --version
# Docker version 24.x.x

docker run hello-world
# Hello from Docker! 메시지 확인
```

### 4.3 Docker Compose 설치

```bash
# 최신 버전 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 실행 권한 부여
sudo chmod +x /usr/local/bin/docker-compose

# 확인
docker-compose --version
```

### 4.4 Docker 서비스 자동 시작

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 5: 프로젝트 배포 준비

### 5.1 프로젝트 디렉토리 생성

```bash
mkdir -p ~/xingu
cd ~/xingu
```

### 5.2 Git Clone (Private Repo인 경우)

**Option A: SSH Key 방식**
```bash
# 서버에서 SSH 키 생성
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# → GitHub Settings > SSH Keys에 추가

# Clone
git clone git@github.com:your-username/xingu.git .
```

**Option B: Personal Access Token 방식**
```bash
git clone https://<PAT_TOKEN>@github.com/your-username/xingu.git .
```

### 5.3 환경 변수 파일 생성

```bash
# 루트에 .env.production 생성
vim .env.production
```

**.env.production 내용:**
```env
# ===================
# Production Environment
# ===================
NODE_ENV=production

# Database
DATABASE_URL=postgresql://xingu:YOUR_SECURE_PASSWORD@postgres:5432/xingu_prod

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT (반드시 변경!)
JWT_SECRET=YOUR_32_BYTE_RANDOM_STRING_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (배포 후 실제 도메인으로 변경)
CORS_ORIGIN=https://your-domain.com

# Service Ports (Docker 내부)
AUTH_SERVICE_PORT=3001
TEMPLATE_SERVICE_PORT=3002
GAME_SERVICE_PORT=3003
ROOM_SERVICE_PORT=3004
WS_SERVICE_PORT=3005
RESULT_SERVICE_PORT=3006

# Sentry (선택)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Cloudflare R2 (Step 6에서 설정)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=xingu-media
R2_PUBLIC_URL=
```

**JWT Secret 생성:**
```bash
openssl rand -base64 32
```

### 5.4 Docker Compose 파일 생성

```bash
vim docker-compose.prod.yml
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  # ===================
  # Databases
  # ===================
  postgres:
    image: postgres:17-alpine
    container_name: xingu-postgres
    restart: always
    environment:
      POSTGRES_USER: xingu
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: xingu_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U xingu -d xingu_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: xingu-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ===================
  # Backend Services
  # ===================
  auth-service:
    build:
      context: .
      dockerfile: apps/auth-service/Dockerfile
    container_name: xingu-auth
    restart: always
    env_file: .env.production
    environment:
      - PORT=3001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3001"

  template-service:
    build:
      context: .
      dockerfile: apps/template-service/Dockerfile
    container_name: xingu-template
    restart: always
    env_file: .env.production
    environment:
      - PORT=3002
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3002"

  game-service:
    build:
      context: .
      dockerfile: apps/game-service/Dockerfile
    container_name: xingu-game
    restart: always
    env_file: .env.production
    environment:
      - PORT=3003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3003"

  room-service:
    build:
      context: .
      dockerfile: apps/room-service/Dockerfile
    container_name: xingu-room
    restart: always
    env_file: .env.production
    environment:
      - PORT=3004
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3004"

  ws-service:
    build:
      context: .
      dockerfile: apps/ws-service/Dockerfile
    container_name: xingu-ws
    restart: always
    env_file: .env.production
    environment:
      - PORT=3005
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3005"

  result-service:
    build:
      context: .
      dockerfile: apps/result-service/Dockerfile
    container_name: xingu-result
    restart: always
    env_file: .env.production
    environment:
      - PORT=3006
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    expose:
      - "3006"

  # ===================
  # Frontend
  # ===================
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: xingu-web
    restart: always
    env_file: .env.production
    environment:
      - PORT=3000
    depends_on:
      - auth-service
      - template-service
      - game-service
      - room-service
      - ws-service
      - result-service
    expose:
      - "3000"

  # ===================
  # Reverse Proxy
  # ===================
  nginx:
    image: nginx:alpine
    container_name: xingu-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - web
      - ws-service

  # ===================
  # SSL Certificate (Let's Encrypt)
  # ===================
  certbot:
    image: certbot/certbot
    container_name: xingu-certbot
    volumes:
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  redis_data:
```

### 5.5 Nginx 설정 파일

```bash
mkdir -p nginx
vim nginx/nginx.conf
```

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    # 기본 설정
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 업스트림 정의
    upstream web {
        server web:3000;
    }

    upstream auth-api {
        server auth-service:3001;
    }

    upstream template-api {
        server template-service:3002;
    }

    upstream game-api {
        server game-service:3003;
    }

    upstream room-api {
        server room-service:3004;
    }

    upstream ws-api {
        server ws-service:3005;
    }

    upstream result-api {
        server result-service:3006;
    }

    # HTTP → HTTPS 리다이렉트
    server {
        listen 80;
        server_name your-domain.com;

        # Let's Encrypt 인증용
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS 서버
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL 인증서 (Step 7에서 생성)
        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

        # SSL 설정
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # 프론트엔드
        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API Routes
        location /api/auth {
            proxy_pass http://auth-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/templates {
            proxy_pass http://template-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/games {
            proxy_pass http://game-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/rooms {
            proxy_pass http://room-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/results {
            proxy_pass http://result-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /socket.io {
            proxy_pass http://ws-api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400;
        }
    }
}
```

### 5.6 각 서비스 Dockerfile 생성

모든 백엔드 서비스용 공통 Dockerfile 템플릿:

**apps/auth-service/Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 복사
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/auth-service ./apps/auth-service

# Prisma 생성
RUN pnpm --filter=@xingu/database db:generate

# 빌드
RUN pnpm --filter=@xingu/auth-service build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 프로덕션 의존성만 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "apps/auth-service/dist/main.js"]
```

> 다른 서비스들도 동일한 패턴으로 생성 (포트와 서비스명만 변경)

**apps/web/Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 복사
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# 환경변수 (빌드 시점)
ARG NEXT_PUBLIC_API_AUTH_URL
ARG NEXT_PUBLIC_API_TEMPLATE_URL
ARG NEXT_PUBLIC_API_GAME_URL
ARG NEXT_PUBLIC_API_ROOM_URL
ARG NEXT_PUBLIC_API_RESULT_URL
ARG NEXT_PUBLIC_WS_URL

# 빌드
RUN pnpm --filter=@xingu/web build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# standalone 출력 복사
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
```

---

## Step 6: Cloudflare R2 설정

### 6.1 Cloudflare 계정 생성

```
https://dash.cloudflare.com/sign-up
```

### 6.2 R2 활성화

1. Cloudflare Dashboard 접속
2. 좌측 메뉴에서 **R2** 클릭
3. **Create bucket** 클릭

```
Bucket name: xingu-media
Location: APAC (Asia Pacific)
```

### 6.3 API Token 생성

1. **R2 > Overview > Manage R2 API Tokens**
2. **Create API Token** 클릭

```
Token name: xingu-r2-token
Permissions: Object Read & Write
Specify bucket: xingu-media
TTL: (빈칸 = 무제한)
```

3. 생성 후 정보 복사:
```
Access Key ID: xxxxxxxxxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

### 6.4 Public Access 설정 (선택)

이미지 직접 접근 허용:

1. **R2 > xingu-media > Settings**
2. **Public access > Allow Access**
3. Custom domain 또는 R2.dev subdomain 선택

```
Public URL: https://pub-xxxx.r2.dev
또는
https://media.your-domain.com (Custom domain)
```

### 6.5 환경 변수 업데이트

**.env.production에 추가:**
```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=xingu-media
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

### 6.6 미디어 업로드 코드 수정

**packages/shared/src/utils/r2-client.ts:**
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadMedia(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `media/${Date.now()}-${filename}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteMedia(url: string): Promise<void> {
  const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');

  await r2Client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
```

---

## Step 7: 도메인 및 SSL 설정

### 7.1 도메인 구매 (선택)

무료 옵션:
- **Freenom**: .tk, .ml 등 (불안정)
- **DuckDNS**: 서브도메인 무료

유료 추천:
- **Namecheap**: .com $8-10/년
- **Cloudflare Registrar**: 원가 판매

### 7.2 DNS 설정

Cloudflare DNS 사용 권장 (무료 CDN + 보안):

1. Cloudflare에 도메인 추가
2. A 레코드 설정:

```
Type: A
Name: @ (또는 your-domain.com)
Content: <Oracle Cloud Public IP>
Proxy: DNS only (회색 구름) - SSL 직접 관리 시
```

### 7.3 Let's Encrypt SSL 발급

**초기 발급 (HTTP 모드로 시작):**

먼저 nginx.conf에서 SSL 부분 주석 처리 후 시작:

```bash
# nginx 임시 설정으로 시작
docker-compose -f docker-compose.prod.yml up -d nginx

# certbot으로 인증서 발급
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d your-domain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# nginx 재시작 (SSL 설정 활성화 후)
docker-compose -f docker-compose.prod.yml restart nginx
```

### 7.4 자동 갱신 설정

certbot 컨테이너가 12시간마다 자동 갱신 시도합니다.

수동 갱신:
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## Step 8: 배포 및 실행

### 8.1 전체 빌드 및 실행

```bash
cd ~/xingu

# 이미지 빌드
docker-compose -f docker-compose.prod.yml build

# 컨테이너 실행
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 8.2 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 실행
docker-compose -f docker-compose.prod.yml exec auth-service \
  npx prisma migrate deploy
```

### 8.3 상태 확인

```bash
# 모든 컨테이너 상태
docker-compose -f docker-compose.prod.yml ps

# 개별 서비스 로그
docker-compose -f docker-compose.prod.yml logs auth-service
docker-compose -f docker-compose.prod.yml logs web

# 리소스 사용량
docker stats
```

### 8.4 헬스체크

```bash
# API 확인
curl https://your-domain.com/api/auth/health
curl https://your-domain.com/api/templates/health

# 프론트엔드 확인
curl https://your-domain.com
```

---

## Step 9: 모니터링 및 유지보수

### 9.1 로그 관리

```bash
# 로그 파일 위치 (Docker)
docker-compose -f docker-compose.prod.yml logs --tail=100 auth-service

# 로그 로테이션 설정
# docker-compose.prod.yml에 추가:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 9.2 백업 스크립트

**backup.sh:**
```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL 백업
docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U xingu xingu_prod > "$BACKUP_DIR/db_$DATE.sql"

# 오래된 백업 삭제 (7일)
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql"
```

**Cron 설정:**
```bash
crontab -e

# 매일 새벽 3시 백업
0 3 * * * /home/ubuntu/xingu/backup.sh >> /home/ubuntu/logs/backup.log 2>&1
```

### 9.3 업데이트 배포

```bash
cd ~/xingu

# 최신 코드 가져오기
git pull origin main

# 이미지 재빌드 및 재시작
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 오래된 이미지 정리
docker image prune -f
```

### 9.4 서버 모니터링

**htop 설치:**
```bash
sudo apt install htop
htop
```

**디스크 사용량:**
```bash
df -h
```

**Docker 리소스:**
```bash
docker stats
```

### 9.5 트러블슈팅

**컨테이너가 재시작될 때:**
```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

**메모리 부족:**
```bash
# Swap 확인
free -h

# 불필요한 이미지 정리
docker system prune -a
```

**포트 충돌:**
```bash
sudo netstat -tulpn | grep LISTEN
```

---

## 체크리스트

### 배포 전
- [ ] Oracle Cloud 계정 생성
- [ ] ARM VM 인스턴스 생성 (4 OCPU, 24GB RAM)
- [ ] 보안 목록에서 포트 열기 (80, 443)
- [ ] Docker, Docker Compose 설치
- [ ] 프로젝트 clone

### 환경 설정
- [ ] .env.production 파일 생성
- [ ] JWT_SECRET 변경
- [ ] DATABASE_URL 설정
- [ ] Cloudflare R2 설정
- [ ] 도메인 연결

### 배포 후
- [ ] SSL 인증서 발급
- [ ] 모든 서비스 정상 작동 확인
- [ ] 백업 스크립트 설정
- [ ] 모니터링 설정 (Sentry, UptimeRobot)

---

## 비용 요약

| 항목 | 비용 |
|------|------|
| Oracle Cloud VM | 무료 (Always Free) |
| Cloudflare R2 | 무료 (10GB) |
| 도메인 | $0-10/년 |
| SSL | 무료 (Let's Encrypt) |
| **총계** | **$0-10/년** |

---

## 참고 링크

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
