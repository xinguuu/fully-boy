# Deployment Guide

> Production deployment guide for Xingu platform

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [SSL/TLS Certificate](#ssltls-certificate)
5. [Docker Deployment](#docker-deployment)
6. [Monitoring & Error Tracking](#monitoring--error-tracking)
7. [Post-deployment](#post-deployment)
8. [Rollback Procedures](#rollback-procedures)

---

## Pre-deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] Type check passing (`pnpm type-check`)
- [ ] Lint passing (`pnpm lint`)
- [ ] Build successful (`NODE_ENV=production pnpm build`)
- [ ] E2E tests passing (`pnpm test:e2e`)
- [ ] Lighthouse score >90

### Security
- [ ] All secrets rotated for production
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are strong
- [ ] Redis password is set
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Infrastructure
- [ ] Production database provisioned
- [ ] Redis instance provisioned
- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Firewall rules configured
- [ ] Backup strategy defined

---

## Environment Configuration

### 1. Copy Production Environment Template

```bash
# Root .env for backend services
cp .env.production.example .env.production

# Frontend .env
cp apps/web/.env.local apps/web/.env.production
```

### 2. Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24

# Generate Redis password
openssl rand -base64 24
```

### 3. Update Environment Variables

Edit `.env.production` and replace all `CHANGE_ME` placeholders:

```env
# Critical variables to update:
DATABASE_URL="postgresql://xingu_prod:YOUR_DB_PASSWORD@your-db-host:5432/xingu_prod"
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@your-redis-host:6379"
JWT_SECRET="YOUR_GENERATED_JWT_SECRET"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
```

---

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE xingu_prod;
CREATE USER xingu_prod WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE xingu_prod TO xingu_prod;
```

### 2. Run Migrations

```bash
# Set DATABASE_URL in environment
export DATABASE_URL="postgresql://xingu_prod:password@host:5432/xingu_prod"

# Run Prisma migrations
pnpm --filter=@xingu/database db:migrate
```

### 3. Verify Database

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Should see: User, Template, Game, Question, Room, Participant, Answer, Result, etc.
```

---

## SSL/TLS Certificate

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Certificate Locations

```
Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

## Docker Deployment

### 1. Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker build -t xingu/auth-service:latest -f apps/auth-service/Dockerfile .
docker build -t xingu/template-service:latest -f apps/template-service/Dockerfile .
# ... repeat for all services
```

### 2. Push to Registry (if using)

```bash
# Tag images
docker tag xingu/auth-service:latest your-registry.com/xingu/auth-service:latest

# Push to registry
docker push your-registry.com/xingu/auth-service:latest
```

### 3. Deploy with Docker Compose

```bash
# Load production environment
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Health Checks

```bash
# Check auth service
curl https://yourdomain.com/api/auth/health

# Check each service
curl https://yourdomain.com/api/templates/health
curl https://yourdomain.com/api/games/health
# ... etc
```

---

## Monitoring & Error Tracking

### 1. Sentry Setup

See [08-sentry-setup.md](./08-sentry-setup.md) for detailed Sentry configuration.

Quick setup:

```bash
# Create Sentry project at sentry.io
# Copy DSN to .env.production
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

### 2. UptimeRobot Setup

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create monitors for:
   - Frontend: `https://yourdomain.com`
   - API Health: `https://yourdomain.com/api/auth/health`
   - WebSocket: `wss://yourdomain.com/socket.io`
3. Set alert contacts (email, Slack, etc.)
4. Configure check interval (5 minutes recommended)

### 3. Application Logs

```bash
# View logs in production
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Filter by service
docker-compose -f docker-compose.prod.yml logs -f auth-service

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 auth-service
```

---

## Post-deployment

### 1. Smoke Tests

```bash
# Test homepage
curl https://yourdomain.com

# Test auth endpoints
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test1234!"}'

# Test WebSocket connection
# Use browser console:
# const socket = io('wss://yourdomain.com');
# socket.on('connect', () => console.log('Connected'));
```

### 2. Run E2E Tests Against Production

```bash
# Update playwright config with production URL
# Then run tests
PLAYWRIGHT_BASE_URL=https://yourdomain.com pnpm test:e2e
```

### 3. Monitor Initial Traffic

- Check Sentry for any errors
- Monitor server resources (CPU, memory, disk)
- Watch application logs for warnings
- Verify SSL certificate is valid

---

## Rollback Procedures

### Quick Rollback (Docker)

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout [previous-tag]

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Rollback

```bash
# Restore from backup
pg_restore -U xingu_prod -d xingu_prod /backups/xingu_prod_backup_YYYYMMDD.dump

# Or rollback specific migration
pnpm --filter=@xingu/database prisma migrate resolve --rolled-back MIGRATION_NAME
```

---

## Maintenance

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups (cron)
# Add to crontab (crontab -e):
# 0 2 * * * pg_dump postgresql://user:pass@host/db > /backups/xingu_$(date +\%Y\%m\%d).sql
```

### Log Rotation

```bash
# Configure Docker log rotation
# Add to /etc/docker/daemon.json:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

### Security Updates

```bash
# Update dependencies
pnpm update --latest

# Run security audit
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker logs [container-name]

# Check environment variables
docker exec [container-name] env

# Check network connectivity
docker network inspect xingu_network
```

### Database Connection Issues

```bash
# Test connection from container
docker exec [service-name] psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL logs
docker logs xingu_postgres
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats

# Identify problematic container
# Scale down if needed
docker-compose -f docker-compose.prod.yml scale [service-name]=1
```

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/
- **Sentry Documentation**: https://docs.sentry.io/
- **PostgreSQL Backup**: https://www.postgresql.org/docs/current/backup.html
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Last Updated**: 2025-11-19
