# Quick Deployment Checklist - TnP Application

**Status**: Ready for Production Deployment  
**Last Updated**: May 11, 2026

---

## 🎯 Quick Summary

Your TnP application is now configured for production deployment with:
- ✅ Fixed Docker port configuration (3001)
- ✅ Improved multi-stage Dockerfiles (backend & frontend)
- ✅ Enhanced CI/CD pipeline with GitHub Actions
- ✅ Comprehensive deployment guide
- ✅ Production setup automation script
- ✅ Environment configuration templates

---

## 📋 Pre-Deployment Steps (Complete These First)

### 1. **Verify Local Setup** (5 minutes)
```bash
cd c:\Users\bramh\OneDrive\Desktop\hack\gitnew\hackto

# Check if Docker is running
docker ps

# Verify backend health
curl http://localhost:3001/health
# Expected: {"status":"ok",...}

# Verify frontend loads
curl http://localhost:80
# Expected: HTML content
```

### 2. **Prepare GitHub Repository** (10 minutes)
- [ ] Push code to GitHub
- [ ] Ensure `.git` is initialized
- [ ] Have clean git history (no uncommitted changes)

### 3. **Configure GitHub Secrets** (15 minutes)
Go to: **GitHub → Settings → Secrets and variables → Actions**

Add these secrets (minimum required):
```
PROD_SSH_KEY=your-private-key
PROD_SERVER_IP=your.server.ip
PROD_SSH_USER=ubuntu

DB_PASSWORD=strong-random-password
JWT_SECRET=random-32-char-string
VITE_API_BASE_URL=https://api.yourdomain.com
```

[See CI_CD_SETUP.md for complete list]

### 4. **Prepare Production Server** (30 minutes)
```bash
# On production server:
ssh root@your-server-ip

# Download and run setup script:
wget https://raw.githubusercontent.com/yourusername/repo/main/setup-production.sh
chmod +x setup-production.sh
./setup-production.sh

# Follow the interactive prompts
```

Or run locally and transfer:
```bash
scp setup-production.sh ubuntu@your-server-ip:/tmp/
ssh ubuntu@your-server-ip "sudo /tmp/setup-production.sh"
```

### 5. **Configure DNS** (varies)
- [ ] Update A record to point to production server IP
- [ ] Update CNAME for api subdomain
- [ ] Wait for DNS propagation (5-30 minutes)

### 6. **Test Connection** (5 minutes)
```bash
# Once DNS is updated:
curl https://yourdomain.com/health
curl https://api.yourdomain.com/health
```

---

## 🚀 Deployment Process

### Option 1: Automatic Deployment (Recommended)

1. **Merge to main branch**
   ```bash
   git checkout main
   git pull origin develop
   git push origin main
   ```

2. **CI/CD Pipeline Runs Automatically**
   - GitHub Actions → Actions tab to view progress
   - Tests run → Docker images built → Manual approval prompt

3. **Approve Production Deploy**
   - Review test results
   - Click "Approve and deploy" button
   - Monitor deployment in Actions tab

### Option 2: Manual Deployment

```bash
# SSH into production server
ssh ubuntu@your-server-ip

# Navigate to app directory
cd /opt/tnp-app

# Pull latest code
git pull origin main

# Load environment
source .env.production

# Pull latest Docker images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Verify health
curl http://localhost:3001/health
```

---

## ✅ Post-Deployment Verification

### Health Checks (Automated)
```bash
# Backend API
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# Frontend
curl https://yourdomain.com
# Expected: HTML document

# Database
docker exec tnp-postgres pg_isready -U tnp_prod

# Redis
docker exec tnp-redis redis-cli ping
# Expected: PONG
```

### Manual Verification (In Browser)
- [ ] Navigate to https://yourdomain.com
- [ ] Login with test account
- [ ] Create/view dashboard data
- [ ] Check browser console for errors
- [ ] Test API endpoints (browser DevTools Network tab)

### Log Review
```bash
# Check for errors
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
docker-compose -f docker-compose.prod.yml logs --tail=50 frontend

# Monitor real-time
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 📦 Deployment Files Reference

### Core Deployment Files
| File | Purpose | Location |
|------|---------|----------|
| `DEPLOYMENT_GUIDE.md` | Comprehensive deployment guide | Root |
| `CI_CD_SETUP.md` | GitHub Actions & CI/CD config | Root |
| `setup-production.sh` | Automated production setup | Root |
| `docker-compose.yml` | Development stack | Root |
| `docker-compose.prod.yml` | Production stack | Root |
| `backend/Dockerfile` | Backend container image | backend/ |
| `frontend/Dockerfile` | Frontend container image | frontend/ |
| `.github/workflows/ci-cd-enhanced.yml` | Enhanced CI/CD workflow | .github/workflows/ |

### Environment Files (Don't commit!)
| File | Purpose | Contains |
|------|---------|----------|
| `.env.production` | Production secrets | DB passwords, JWT secrets |
| `.env.docker` | Docker env template | Database defaults |
| `backend/.env.example` | Backend template | Example variables |
| `frontend/.env.example` | Frontend template | Example variables |

---

## 🔧 Common Deployment Scenarios

### Scenario: Update Backend Code Only
```bash
git add backend/
git commit -m "fix: Update backend logic"
git push origin develop
# Auto-deploys to staging

# After testing, merge to main
git checkout main && git pull
git merge develop
git push origin main
# Manual approval deploys to production
```

### Scenario: Emergency Production Hotfix
```bash
git checkout main
git pull
git checkout -b hotfix/critical-bug

# Fix the issue
git add src/
git commit -m "fix: Critical production bug"

# Push for testing
git push origin hotfix/critical-bug

# Once verified, merge directly to main
git checkout main
git merge hotfix/critical-bug
git push origin main
# Manually approve deployment
```

### Scenario: Database Migration Issue
```bash
# SSH into production
ssh ubuntu@your-server-ip
cd /opt/tnp-app

# Revert migration
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:revert

# Review and fix migration
git pull origin main

# Re-run migration
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

---

## 🔐 Security Checklist

Before going live, ensure:
- [ ] All secrets in GitHub Secrets (not in code)
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall rules configured (allow 80, 443; deny others)
- [ ] Fail2Ban enabled for brute force protection
- [ ] Database password changed from defaults
- [ ] Redis password configured
- [ ] CORS restricted to your domain only
- [ ] JWT secrets are strong (32+ characters)
- [ ] Debug mode disabled in production
- [ ] Logs don't expose sensitive information

---

## 📊 Monitoring & Maintenance

### Daily Checks (Automated)
```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# View recent errors
docker-compose -f docker-compose.prod.yml logs --tail=20
```

### Weekly Tasks
```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tnp_prod tnp_production > backup_$(date +%Y%m%d).sql

# Check disk usage
df -h

# Check resource usage
docker stats
```

### Monthly Tasks
- [ ] Review and rotate SSL certificates
- [ ] Update dependencies (`npm update`)
- [ ] Review security logs
- [ ] Test rollback procedure
- [ ] Performance analysis

---

## 🆘 Troubleshooting

### Backend returns empty response
```bash
# Check port configuration
docker-compose ps | grep backend
# Verify PORT environment variable
docker-compose exec backend env | grep PORT

# Fix: Ensure PORT=3001 in docker-compose files
```

### Frontend shows API errors
```bash
# Verify CORS
curl -H "Origin: https://yourdomain.com" http://localhost:3001/health -v

# Check API URL
docker-compose exec frontend env | grep VITE_API

# Test direct backend access
curl https://api.yourdomain.com/health
```

### Database connection fails
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U tnp_prod

# View database logs
docker-compose logs postgres

# Check DATABASE_URL
docker-compose exec backend env | grep DATABASE_URL
```

[See DEPLOYMENT_GUIDE.md for more troubleshooting]

---

## 📞 Support Resources

- **Documentation**: See DEPLOYMENT_GUIDE.md and CI_CD_SETUP.md
- **GitHub Actions**: https://github.com/yourusername/tnp-repo/actions
- **Docker Logs**: `docker-compose logs -f`
- **SSH to Production**: `ssh ubuntu@your-server-ip`
- **Database Access**: `docker exec -it tnp-postgres psql`

---

## 📝 Deployment Log Template

Keep this for each deployment:
```
Date: YYYY-MM-DD
Time: HH:MM UTC
Version: v1.0.0
Changes: Brief summary
Status: ✓ Success / ✗ Failed
Health Checks: ✓ Pass
Approver: Name
Notes: Any issues or rollbacks
```

---

## 🎓 Training Checklist

Team members should understand:
- [ ] How to deploy code (git flow)
- [ ] How CI/CD pipeline works
- [ ] How to monitor health checks
- [ ] How to view logs
- [ ] How to rollback if needed
- [ ] Where production server is located
- [ ] SSH access to production
- [ ] Database backup procedure
- [ ] Incident response plan

---

**Remember**: Take backups before any deployment!

```bash
# Backup everything
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tnp_prod tnp_production > backup_$(date +%Y%m%d_%H%M%S).sql
docker-compose -f docker-compose.prod.yml exec redis redis-cli SAVE
```

---

**Document Version**: 1.0  
**Last Updated**: May 11, 2026  
**Next Review**: After first production deployment
