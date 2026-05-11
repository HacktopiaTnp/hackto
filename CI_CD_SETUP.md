# CI/CD & Deployment Configuration Guide

## GitHub Secrets Setup

Navigate to: **GitHub Repository Settings → Secrets and variables → Actions**

Add the following secrets:

### Docker Registry Secrets
```
DOCKER_USERNAME: your-docker-username
DOCKER_PASSWORD: your-docker-token (Personal Access Token)
GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }} (auto-provided)
```

### Production Environment Secrets
```
PROD_SSH_KEY: <private-key-for-prod-server>
PROD_SERVER_IP: 1.2.3.4
PROD_SSH_USER: ubuntu

DB_PASSWORD: <strong-random-password>
REDIS_PASSWORD: <strong-random-password>
JWT_SECRET: <random-32-char-string>
JWT_REFRESH_SECRET: <random-32-char-string>
```

### API Configuration Secrets
```
VITE_API_BASE_URL: https://api.yourdomain.com
CLERK_PUBLISHABLE_KEY: pk_live_xxxxx
CLERK_SECRET_KEY: sk_live_xxxxx
CLOUDINARY_CLOUD_NAME: your-cloud
CLOUDINARY_API_KEY: xxxxx
CLOUDINARY_API_SECRET: xxxxx
```

### Staging Secrets (Optional)
```
STAGING_SSH_KEY: <private-key-for-staging-server>
STAGING_SERVER_IP: 1.2.3.5
STAGING_SSH_USER: ubuntu
```

### Notifications (Optional)
```
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/xxxxx
SLACK_CHANNEL: #deployments
DATADOG_API_KEY: xxxxx
```

---

## GitHub Actions Workflow Files

### Existing Workflows
- ✅ `.github/workflows/ci-cd-enhanced.yml` - Main enhanced CI/CD pipeline
- ✅ `.github/workflows/docker-test.yml` - Docker Compose validation (optional)

### How to Use
1. The enhanced pipeline will run on **push** to `main`, `develop`, or `staging` branches
2. Each commit triggers:
   - Code quality checks
   - Docker build tests
   - Security scanning
   - Docker image build & push
   - Auto-deploy to staging (if develop branch)
   - Manual approval for production (if main branch)

---

## Docker Compose Files

### Development (docker-compose.yml)
- Used locally with volumes for live reloading
- Services: PostgreSQL, Redis, Backend, Frontend, Nginx
- PORT: Backend on 3001 (fixed from 3000)

### Production (docker-compose.prod.yml)
- Resource limits configured
- Health checks enabled
- Auto-restart on failure
- No volume mounts (immutable containers)

### Build & Deploy
```bash
# Local development
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

---

## Environment Files

### .env.docker
Template for Docker development environment

### .env.production
Production secrets (do NOT commit to git)

### backend/.env.example
Backend environment template

### frontend/.env.example
Frontend environment template

---

## Deployment Workflows

### Development Workflow
```
Feature Branch → Code → Test → Push to GitHub
     ↓
Automated Tests Run ✓
     ↓
PR Review ✓
     ↓
Merge to develop
     ↓
Auto-deploy to Staging ✓
```

### Production Workflow
```
develop → main (via PR)
     ↓
Automated Tests Run ✓
     ↓
Docker Images Built ✓
     ↓
Manual Approval (by team lead)
     ↓
Auto-deploy to Production ✓
     ↓
Health Checks ✓
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing locally
- [ ] Linter passes (npm run lint)
- [ ] TypeScript compiles (npm run typecheck)
- [ ] No console errors
- [ ] Code review approved

### Security
- [ ] No hardcoded secrets in code
- [ ] Dependencies updated (npm audit)
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled

### Backend
- [ ] Database migrations tested
- [ ] Environment variables defined
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Logging configured

### Frontend
- [ ] Build succeeds without warnings
- [ ] Assets optimized
- [ ] API endpoints configured
- [ ] Error boundaries added
- [ ] Analytics integrated

### Infrastructure
- [ ] SSL certificates ready
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Load balancer configured
- [ ] DNS records ready

### Documentation
- [ ] API documentation updated
- [ ] Deployment runbook ready
- [ ] Rollback procedure documented
- [ ] Team trained on new features
- [ ] Change log updated

---

## Common CI/CD Issues & Solutions

### Issue: Tests fail locally but pass in CI
**Solution**: Clear node_modules and npm cache
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### Issue: Docker images not building
**Solution**: Check Dockerfile syntax and build context
```bash
docker build -f backend/Dockerfile ./backend -t tnp-backend:test
```

### Issue: Port conflicts in Docker
**Solution**: Stop conflicting containers
```bash
docker ps
docker stop container-id
```

### Issue: Database migrations fail
**Solution**: Check database connection and schema
```bash
docker-compose exec backend npm run migrate:revert
docker-compose exec backend npm run migrate
```

### Issue: Frontend can't reach backend
**Solution**: Verify CORS and API URL configuration
```bash
# Check backend health
curl http://localhost:3001/health

# Verify frontend environment
docker-compose exec frontend env | grep VITE_API
```

---

## Monitoring & Alerts

### Health Checks (Automated)
- Backend health endpoint: `/health`
- Database connectivity check
- Redis connectivity check
- Disk space monitoring
- Memory usage monitoring

### Logs
```bash
# View real-time logs
docker-compose logs -f backend

# View specific service logs
docker-compose logs postgres

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Performance Metrics
```bash
# Check container resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

---

## Rollback Procedure

In case of deployment issues:

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Check backup state
cat backup_state.txt

# 3. Pull previous image version
docker pull ghcr.io/username/tnp-backend:main-[previous-sha]

# 4. Start with previous version
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify health checks
curl http://localhost:3001/health

# 6. Restore database from backup
docker exec tnp-postgres psql -U tnp_prod -d tnp_production < backup_db_[timestamp].sql
```

---

## Scaling Considerations

### Horizontal Scaling
```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Use load balancer (Nginx configured by default)
```

### Vertical Scaling
Update `docker-compose.prod.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 2G
```

### Database Scaling
Consider:
- Read replicas for PostgreSQL
- Connection pooling with PgBouncer
- Sharding for large data volumes

---

## Cost Optimization

### Docker Image Size
- Backend: ~400MB (node 18-alpine + dependencies)
- Frontend: ~50MB (nginx alpine + built files)
- Postgres: ~100MB
- Redis: ~50MB

**Total**: ~600MB per environment

### Resource Limits (Production)
- Backend: 2 CPU, 1GB RAM
- Frontend: 1 CPU, 512MB RAM
- Database: 4 CPU, 4GB RAM
- Redis: 1 CPU, 512MB RAM
- Nginx: 1 CPU, 256MB RAM

---

## Troubleshooting Commands

```bash
# Docker
docker ps                           # List running containers
docker logs container-id            # View container logs
docker exec -it container-id bash   # SSH into container
docker-compose restart              # Restart services
docker-compose down -v              # Remove volumes (careful!)

# Network
curl http://localhost:3001/health   # Test backend
curl http://localhost:80            # Test frontend
docker network ls                   # List networks

# Database
docker exec tnp-postgres psql -U tnp_prod -d tnp_production
\dt                                 # List tables (in psql)
\q                                  # Quit psql

# Performance
docker stats                        # Resource usage
docker system df                    # Disk usage
docker image prune -a               # Remove unused images
```

---

## Support & Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Docker Docs**: https://docs.docker.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Let's Encrypt**: https://letsencrypt.org
- **Nginx Docs**: https://nginx.org/en/docs

---

## Version Control Strategy

### Branch Policy
- `main` - Production ready (tag releases)
- `develop` - Staging environment
- `feature/*` - Development
- `hotfix/*` - Emergency production fixes

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation
style: Code style changes
refactor: Code refactoring
test: Adding tests
ci: CI/CD configuration
```

### Release Process
1. Create release branch: `git checkout -b release/v1.0.0`
2. Bump version in package.json
3. Update CHANGELOG
4. Merge to main and tag: `git tag v1.0.0`
5. Merge back to develop
6. Deploy tagged version to production

---

**Last Updated**: May 11, 2026  
**Document Version**: 1.0
