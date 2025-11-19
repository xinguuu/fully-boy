#!/bin/bash

# ========================================
# Xingu 도커 이미지 빌드 및 푸시 스크립트
# ========================================
# 과제 제출용 도커 이미지를 빌드하고 도커 허브에 업로드합니다.
#
# 사용법:
#   1. 도커 허브 아이디를 DOCKER_USERNAME에 설정
#   2. docker login 실행
#   3. ./build-and-push.sh 실행
# ========================================

set -e  # 에러 발생 시 즉시 중단

# ========================================
# 설정 (여기를 수정하세요!)
# ========================================
DOCKER_USERNAME="xinguoh"
REPO_NAME="xingu_hub"  # 하나의 리포지토리 사용
VERSION="v1.0"

# ========================================
# 색상 출력
# ========================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ========================================
# 사전 검증
# ========================================
# Docker username is already set to xinguoh

if ! command -v docker &> /dev/null; then
    echo_error "Docker가 설치되어 있지 않습니다."
    exit 1
fi

echo_info "도커 로그인 상태 확인..."
if ! docker info &> /dev/null; then
    echo_error "도커 데몬이 실행되고 있지 않습니다."
    exit 1
fi

# ========================================
# 빌드 전 준비
# ========================================
echo_info "빌드 전 준비 중..."

# 1. 의존성 설치
echo_info "의존성 설치..."
pnpm install

# 2. Prisma Client 생성
echo_info "Prisma Client 생성..."
pnpm --filter=@xingu/database db:generate

# 3. 전체 빌드 (Turborepo)
echo_info "전체 프로젝트 빌드 중..."
pnpm build

echo_success "빌드 전 준비 완료!"

# ========================================
# 도커 이미지 빌드
# ========================================
echo ""
echo_info "========================================"
echo_info "도커 이미지 빌드 시작"
echo_info "========================================"

# 서비스 목록
services=(
    "web"
    "auth-service"
    "template-service"
    "game-service"
    "room-service"
    "ws-service"
    "result-service"
)

# 각 서비스 빌드
for service in "${services[@]}"; do
    echo ""
    echo_info "Building $service..."

    IMAGE_NAME="$DOCKER_USERNAME/$REPO_NAME:$service-$VERSION"
    # LATEST_NAME="$DOCKER_USERNAME/$REPO_NAME:$service-latest"  # latest 비활성화

    docker build \
        -f ./apps/$service/Dockerfile.optimized \
        -t "$IMAGE_NAME" \
        .
        # -t "$LATEST_NAME" \  # latest 태그 제거

    echo_success "$service 이미지 빌드 완료: $IMAGE_NAME"
done

echo ""
echo_success "========================================"
echo_success "모든 이미지 빌드 완료!"
echo_success "========================================"

# ========================================
# 빌드된 이미지 목록 출력
# ========================================
echo ""
echo_info "빌드된 이미지 목록:"
docker images | grep "$DOCKER_USERNAME/xingu-"

# ========================================
# 도커 허브 푸시 확인
# ========================================
echo ""
read -p "도커 허브에 푸시하시겠습니까? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo_info "푸시를 건너뜁니다."
    echo_info "나중에 푸시하려면 다음 명령어를 실행하세요:"
    for service in "${services[@]}"; do
        echo "  docker push $DOCKER_USERNAME/xingu-$service:$VERSION"
        echo "  docker push $DOCKER_USERNAME/xingu-$service:latest"
    done
    exit 0
fi

# ========================================
# 도커 허브 푸시
# ========================================
echo ""
echo_info "========================================"
echo_info "도커 허브 푸시 시작"
echo_info "========================================"

for service in "${services[@]}"; do
    echo ""
    echo_info "Pushing $service..."

    docker push "$DOCKER_USERNAME/$REPO_NAME:$service-$VERSION"
    # docker push "$DOCKER_USERNAME/$REPO_NAME:$service-latest"  # latest 푸시 제거

    echo_success "$service 푸시 완료!"
done

echo ""
echo_success "========================================"
echo_success "모든 이미지 푸시 완료!"
echo_success "========================================"

# ========================================
# 도커 허브 주소 출력
# ========================================
echo ""
echo_info "도커 허브 이미지 주소:"
for service in "${services[@]}"; do
    echo "  - $DOCKER_USERNAME/$REPO_NAME:$service-$VERSION"
done

echo ""
echo_success "완료! 이제 README.assignment.md를 확인하여 설치 가이드를 작성하세요."
