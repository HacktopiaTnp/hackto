# 🚀 DEPLOYMENT QUICK REFERENCE CARD

## ⚡ Most Critical Commands

### Development (Local)
```bash
# Start all services
docker-compose up -d

# Check health
curl http://localhost:3001/health
curl http://localhost:80

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production (Server)
```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start/restart services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tnp_prod tnp_production > backup.sql
```

---

## 📋 Pre-Deployment Checklist (Must Do)

- [ ] `curl http://localhost:3001/health` returns OK
- [ ] All code committed to git
- [ ] GitHub Secrets configured (PROD_SSH_KEY, PROD_SERVER_IP, etc.)
- [ ] Production server ready (run setup-production.sh)
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Database backups working
- [ ] Team notified

---

## 🔄 Deployment Workflow

### For Small Changes (Backend/Frontend)
```
1. git checkout -b feature/your-change
2. Make changes
3. git push origin feature/your-change
4. Create PR → Code review
5. Merge to develop → Auto-tests run
6. (After staging tests pass)
7. Merge to main → Manual approval
8. GitHub Actions deploys to production
```

### For Hotfixes (Emergency)
```
1. git checkout main
2. git checkout -b hotfix/issue-name
3. Fix the issue
4. Test locally: docker-compose restart
5. git push origin hotfix/issue-name
6. Create PR with URGENT tag
7. Fast-track review & merge to main
8. Approve deployment in GitHub Actions
```

---

## 📊 Status Dashboard

| Component | Local | Production | Status |
|-----------|-------|-----------|---------|
| Backend | http://localhost:3001 | https://api.yourdomain.com | ✅ |
| Frontend | http://localhost | https://yourdomain.com | ✅ |
| Database | localhost:5432 | postgres-internal | ✅ |
| Redis | localhost:6379 | redis-internal | ✅ |
| GitHub Actions | N/A | workflow runs | ✅ |

---

## 🔑 GitHub Secrets Needed

### Required Immediately
```
PROD_SSH_KEY         = ••••••• (SSH private key)
PROD_SERVER_IP       = ••••••• (e.g., 1.2.3.4)
PROD_SSH_USER        = ubuntu
DB_PASSWORD          = ••••••• (random 32 chars)
JWT_SECRET           = ••••••• (random 32 chars)
```

### Optional But Recommended
```
VITE_API_BASE_URL    = https://api.yourdomain.com
SLACK_WEBHOOK_URL    = https://hooks.slack.com/services/...
CLERK_SECRET_KEY     = sk_live_...
```

---

## 🏗️ Architecture at a Glance

```
GitHub Push → GitHub Actions Pipeline → Docker Build → Push to Registry
                    ↓
            ┌─────────┴────────┐
            ↓                  ↓
        Tests Pass        Tests Fail
            ↓                  ↓
      Staging Deploy      Notify & Stop
            ↓
      Manual Review
            ↓
      ┌─────┴─────┐
      ↓           ↓
   Approve    Reject
      ↓
Production Deploy → Health Check → Success/Rollback
```

---

## 🐳 Docker Services Running

```
Service      Status   Port      URL
─────────────────────────────────────
Backend      ✅       3001      http://localhost:3001
Frontend     ✅       80        http://localhost:80
PostgreSQL   ✅       5432      localhost
Redis        ✅       6379      localhost
Nginx        ✅       80/443    http://localhost
```

---

## 📝 Common Tasks

### Check if Backend is Healthy
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}
```

### View Real-Time Logs
```bash
docker-compose logs -f backend
# Ctrl+C to exit
```

### SSH to Production Server
```bash
ssh ubuntu@your-server-ip
cd /opt/tnp-app
docker-compose -f docker-compose.prod.yml ps
```

### Deploy Latest Code
```bash
# On production server
cd /opt/tnp-app
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Backup Database
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tnp_prod tnp_production > backup_$(date +%Y%m%d).sql
```

### Restart a Service
```bash
docker-compose restart backend    # Development
docker-compose -f docker-compose.prod.yml restart backend  # Production
```

### Clear Docker Cache
```bash
docker system prune -a --volumes
docker-compose down -v
```

---

## 🆘 When Things Go Wrong

| Problem | Fix | Command |
|---------|-----|---------|
| Backend won't start | Check port | `docker-compose logs backend` |
| Port already in use | Stop other containers | `docker stop container-id` |
| Database connection fails | Restart database | `docker-compose restart postgres` |
| Frontend shows API errors | Check CORS | `curl -v http://localhost:3001/health` |
| Disk full | Clean Docker | `docker system prune -a` |
| Need to rollback | Use backup | See DEPLOYMENT_GUIDE.md |

---

## 📚 Documentation Files

Keep these bookmarked:

1. **README_DEPLOYMENT.txt** ← You are here
2. **DEPLOYMENT_GUIDE.md** - Full 500+ line guide
3. **CI_CD_SETUP.md** - GitHub Actions config
4. **QUICK_DEPLOYMENT_CHECKLIST.md** - Step-by-step
5. **setup-production.sh** - Server automation

---

## 🔐 Security Reminders

- ⚠️ Never commit secrets to git
- ⚠️ Always use strong passwords (32+ chars)
- ⚠️ Rotate SSH keys regularly
- ⚠️ Keep dependencies updated
- ⚠️ Enable SSL/TLS for all traffic
- ⚠️ Backup database before deployments
- ⚠️ Monitor logs for suspicious activity
- ⚠️ Use GitHub Secrets for all sensitive data

---

## 📊 Current Status

**Last Checked**: May 11, 2026
- ✅ Backend: Healthy (Port 3001)
- ✅ Database: Initialized
- ✅ CI/CD: Ready
- ✅ Documentation: Complete
- ✅ Ready for production deployment

---

## 🚀 Next Immediate Steps

1. **Read**: DEPLOYMENT_GUIDE.md (15 mins)
2. **Configure**: GitHub Secrets (15 mins)
3. **Setup**: Production server (30 mins)
4. **Test**: Health checks (5 mins)
5. **Deploy**: Push to main & approve (5 mins)

**Total Time**: ~70 minutes to production

---

## 📞 Quick Help

| Need Help With | See |
|---|---|
| Deploying code | QUICK_DEPLOYMENT_CHECKLIST.md |
| Setting up GitHub | CI_CD_SETUP.md |
| Production server | setup-production.sh + DEPLOYMENT_GUIDE.md |
| Debugging issues | DEPLOYMENT_GUIDE.md (Troubleshooting) |
| Architecture | README_DEPLOYMENT.txt |

---

## 💾 Important Paths

```
Local Development:
  /backend           - Backend source code
  /frontend          - Frontend source code
  /docker-compose.yml - Development services

Production Server:
  /opt/tnp-app                      - Application directory
  /opt/tnp-app/.env.production      - Secrets (keep safe!)
  /opt/tnp-app/certs                - SSL certificates
  /backups/tnp                      - Automated backups
  /var/log/tnp                      - Application logs
```

---

## ⏱️ Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Health check | Daily | `curl https://api.yourdomain.com/health` |
| Backup | Daily (auto) | Runs at 2 AM UTC |
| Log review | Weekly | `docker-compose logs` |
| Dependencies update | Monthly | `npm update` |
| Security audit | Monthly | `npm audit` |
| SSL renewal | Auto | Runs automatically |
| Full test | Before any production push | `npm test` |

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Backend responds to health check
- ✅ Frontend loads in browser
- ✅ API calls succeed
- ✅ Database queries work
- ✅ No errors in logs
- ✅ SSL certificate valid
- ✅ Backups created
- ✅ Monitoring active

---

**Print this page or bookmark it!**

For full details, see: DEPLOYMENT_GUIDE.md
