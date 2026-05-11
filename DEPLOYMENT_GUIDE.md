# Complete Deployment Guide - TnP Application

**Last Updated**: May 11, 2026  
**Environments Covered**: Development → Staging → Production

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Setup Verification](#local-setup-verification)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Docker Configuration](#docker-configuration)
7. [Production Environment Setup](#production-environment-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### ✅ Version Control
- [ ] Code committed to Git repository
- [ ] `.gitignore` configured properly
- [ ] No sensitive data in commits (keys, passwords, tokens)
- [ ] Branch strategy: `main` (production), `develop` (staging), `feature/*` (development)

### ✅ Infrastructure Requirements
- [ ] Docker & Docker Compose installed
- [ ] Node.js 18+ (for local testing)
- [ ] PostgreSQL 15+ (production database)
- [ ] Redis 7+ (caching & jobs)
- [ ] SSL certificates (Let's Encrypt recommended)

### ✅ Third-Party Services
- [ ] Cloudinary API keys configured
- [ ] Clerk authentication setup
- [ ] SMTP/Email service configured
- [ ] AWS S3/SQS access (if using)
- [ ] All API credentials in secure vault

---

## Local Setup Verification

### 1. Fix Current Issues
The port mismatch has been fixed (PORT changed from 3000→3001). Run verification:

```bash
# Restart Docker containers
cd c:\Users\bramh\OneDrive\Desktop\hack\gitnew\hackto
docker-compose down && docker-compose up -d

# Verify backend health
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# Verify frontend
curl http://localhost:80
# Expected: HTML response

# Verify database connection
docker exec tnp-postgres pg_isready -U ${DB_USER}
```

### 2. Run Full Test Suite

```bash
# Backend tests
cd backend
npm install
npm run test

# Frontend tests
cd ../frontend
npm install
npm run build

# Integration tests
cd ../backend
npm run test:integration
```

### 3. Verify All Services

```bash
# Check Docker service health
docker-compose ps

# Check logs for errors
docker-compose logs -f

# Database migrations
docker exec tnp-backend npm run migrate
```

---

## Backend Deployment

### Docker Configuration Issues to Fix

**Current Problem**: Backend Dockerfile has inconsistencies
```dockerfile
# Issues found:
# 1. ENV NODE_ENV=development (should be production)
# 2. Not using built artifacts (missing tsc-alias output)
# 3. Running `npm ci` instead of using build stage
```

### Improved Backend Dockerfile
```dockerfile
# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm run build  # tsc + tsc-alias

# Production Stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache dumb-init curl

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["dumb-init", "node", "dist/server.js"]
```

### Backend Deployment Process
1. **Code Quality Checks**
   ```bash
   npm run lint
   npm run typecheck
   npm run test --coverage
   ```

2. **Build Optimization**
   ```bash
   npm run build
   npm prune --production  # Remove dev dependencies
   ```

3. **Environment Variables** (.env.production)
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   REDIS_URL=redis://:password@redis-host:6379
   JWT_SECRET=<use-strong-random-key>
   JWT_REFRESH_SECRET=<use-strong-random-key>
   CORS_ORIGIN=https://yourdomain.com
   SKIP_DATABASE_INIT=false
   SKIP_REDIS_INIT=false
   ```

4. **Database Migrations**
   ```bash
   # Run before deploying
   npm run migrate
   ```

---

## Frontend Deployment

### Frontend Optimization for Production

**Issues to Fix**:
- [ ] Nginx config needs improvement for SPA routing
- [ ] Missing gzip compression settings
- [ ] Cache headers not optimal

### Improved Frontend Dockerfile
```dockerfile
# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_API_BASE_URL=https://api.yourdomain.com
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy optimized nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create health check
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget -q -O- http://localhost:80/health 2>/dev/null | grep -q "ok" && exit 0 || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### Frontend Build & Deploy
```bash
# Build with optimizations
npm run build

# Verify build size
ls -lh dist/

# Test production build locally
npm run preview
```

---

## CI/CD Pipeline Setup

### Current Status
✅ `.github/workflows/ci-cd.yml` exists but needs updates

### Required Improvements

### 1. Fix Backend Dockerfile Reference in CI/CD
Update `.github/workflows/ci-cd.yml`:

```yaml
- name: Build Backend Docker image
  uses: docker/build-push-action@v5
  with:
    context: ./backend
    file: ./backend/Dockerfile
    push: true
    tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest
    cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:buildcache
    cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:buildcache,mode=max
```

### 2. Add Secrets to GitHub
Go to: **Settings → Secrets and variables → Actions**

Required secrets:
```
DOCKER_USERNAME: your-docker-username
DOCKER_PASSWORD: your-docker-token
DB_PASSWORD: production-db-password
JWT_SECRET: strong-random-jwt-secret
PROD_SSH_KEY: production-server-ssh-key
PROD_SERVER_IP: production-server-ip
```

### 3. CI/CD Pipeline Stages

**Stage 1: Code Quality**
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Jest)
- Code coverage minimum: 70%

**Stage 2: Build Verification**
- Build backend and frontend
- Verify Docker images can be created
- Test Docker Compose locally

**Stage 3: Security Scanning**
- Trivy vulnerability scan
- OWASP dependency check
- Secret detection (GitGuardian)

**Stage 4: Docker Build & Push**
- Build multi-platform images (amd64, arm64)
- Push to container registry (GHCR)
- Tag with version and latest

**Stage 5: Deploy to Staging** (on develop branch)
- Deploy to staging server
- Run smoke tests
- Performance baseline tests

**Stage 6: Deploy to Production** (on main branch, manual approval)
- Blue-green deployment
- Health checks
- Rollback capability

---

## Docker Configuration

### Development Setup (docker-compose.yml)
✅ Already configured, but verify:

```yaml
services:
  backend:
    environment:
      PORT: 3001  # ✅ Fixed from 3000
      NODE_ENV: development
  frontend:
    environment:
      VITE_API_BASE_URL: http://localhost:3001
```

### Production Setup (docker-compose.prod.yml)

Required additions:
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    # Add daily backups
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: always
    volumes:
      - redis_data:/data

  backend:
    image: ghcr.io/yourusername/tnp-backend:latest
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend:
    image: ghcr.io/yourusername/tnp-frontend:latest
    environment:
      VITE_API_BASE_URL: https://api.yourdomain.com
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-reverse-proxy.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    restart: always

volumes:
  postgres_data:
  redis_data:
```

---

## Production Environment Setup

### Step 1: Prepare Production Server

```bash
# SSH into production server
ssh root@your-prod-server

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/tnp-app
cd /opt/tnp-app
```

### Step 2: Configure SSL/TLS

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate Let's Encrypt certificate (first time)
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Copy certs to app directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tnp-app/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/tnp-app/certs/
sudo chown docker:docker /opt/tnp-app/certs/*
```

### Step 3: Setup Production .env

```bash
# Create .env file
sudo nano /opt/tnp-app/.env.production

# Add all production secrets:
NODE_ENV=production
PORT=3001

# Database
DB_USER=tnp_prod
DB_PASSWORD=<strong-random-password>
DB_NAME=tnp_production
DATABASE_URL=postgresql://tnp_prod:password@postgres:5432/tnp_production

# Redis
REDIS_PASSWORD=<strong-random-password>
REDIS_URL=redis://:password@redis:6379

# JWT
JWT_SECRET=<random-32-char-string>
JWT_REFRESH_SECRET=<random-32-char-string>

# CORS
CORS_ORIGIN=https://yourdomain.com

# External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLERK_SECRET_KEY=your_clerk_secret
```

### Step 4: Deploy with Docker Compose

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify all services running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Database Initialization

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed if needed
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Database connection
docker-compose exec postgres pg_isready -U ${DB_USER}

# Redis connection
docker-compose exec redis redis-cli ping

# View all container status
docker-compose ps
```

### Backup Strategy

```bash
# Database backup (daily)
docker-compose exec postgres pg_dump -U ${DB_USER} ${DB_NAME} > backup_$(date +%Y%m%d).sql

# Redis backup
docker-compose exec redis redis-cli SAVE
docker cp tnp-redis:/data/dump.rdb ./backup_redis_$(date +%Y%m%d).rdb
```

### Log Management

```bash
# View backend logs
docker-compose logs -f backend

# View Nginx logs
docker-compose logs -f nginx

# Check log file sizes
du -sh /var/lib/docker/containers/*/

# Rotate logs periodically
docker run --rm -v /var/lib/docker:/var/lib/docker alpine \
  sh -c 'find /var/lib/docker/containers -name "*-json.log" -mtime +7 -delete'
```

### Monitoring Stack (Recommended)

Add to production:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
  volumes:
    - grafana_data:/var/lib/grafana
```

---

## Troubleshooting

### Issue: Backend returns empty response
```bash
# Check port mapping
docker-compose ps
# Verify PORT environment variable
docker-compose exec backend env | grep PORT

# Fix: Ensure PORT=3001 in docker-compose.yml
```

### Issue: Database connection fails
```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready
# View database logs
docker-compose logs postgres
```

### Issue: Frontend shows API errors
```bash
# Verify CORS configuration
curl -H "Origin: https://yourdomain.com" http://localhost:3001/health -v
# Check backend environment variables
docker-compose exec backend env | grep CORS
```

### Issue: High memory usage
```bash
# Check container resource limits
docker stats
# Increase limits in docker-compose.prod.yml
# Restart container
docker-compose restart backend
```

---

## Deployment Checklist - Production Ready

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] SSL/TLS certificates installed and auto-renewing
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Database passwords changed from defaults
- [ ] Redis password configured
- [ ] JWT secrets are strong (32+ characters)
- [ ] No debug mode enabled in production

### Performance
- [ ] Database indexes created
- [ ] Redis cache configured
- [ ] Frontend minified and optimized
- [ ] Nginx gzip compression enabled
- [ ] CDN configured for static assets
- [ ] Database connection pooling configured

### Reliability
- [ ] Automated backups configured
- [ ] Database replication setup (if multi-node)
- [ ] Health checks configured
- [ ] Log aggregation setup
- [ ] Monitoring and alerting active
- [ ] Rollback procedure documented

### Operations
- [ ] Load balancer configured
- [ ] DNS records pointing to production
- [ ] Email notifications configured
- [ ] Incident response plan documented
- [ ] Team has production access
- [ ] Runbooks for common issues created

---

## Quick Commands Reference

```bash
# Local development
docker-compose up -d
docker-compose logs -f

# Production deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Health checks
curl http://localhost:3001/health
docker-compose ps

# Cleanup
docker-compose down -v
docker system prune -a

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

---

## Support & Resources

- **Docker Docs**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **GitHub Actions**: https://github.com/features/actions
- **PostgreSQL**: https://www.postgresql.org/docs
- **Redis**: https://redis.io/documentation
- **Nginx**: https://nginx.org/en/docs

---

**Document Version**: 1.0  
**Next Review**: After first production deployment
