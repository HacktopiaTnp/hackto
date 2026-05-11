# ✅ Render Deployment - Complete Verification Guide

## 🎯 After Deployment, Verify Everything Works

---

## 📊 **Step 1: Check Your Services on Render Dashboard**

Go to: https://dashboard.render.com

### What You Should See:

```
✅ hackto-postgres    → Status: Available (green)
✅ hackto-redis       → Status: Available (green)
✅ hackto-backend     → Status: Live (green)
✅ hackto-frontend    → Status: Live (green)
```

If any are **red** or **suspended**, click on it and check "Logs" tab.

---

## 🗄️ **Step 2: PostgreSQL Database Verification**

### Where to Find Database Info:

1. Go to Render Dashboard
2. Click on **"hackto-postgres"** service
3. Go to **"Info"** tab

### What You'll See:

```
Database: neondb
User: neondb_owner
Host: dpg-xxxxx.render.internal
Port: 5432
Connection String: postgresql://neondb_owner:PASSWORD@dpg-xxxxx.render.internal:5432/neondb
```

### How to Check Database is Working:

**Option A: From Render Dashboard**
1. Click **"hackto-postgres"** service
2. Go to **"Connect"** tab
3. See "Connection Information"

**Option B: Test from Backend Service Logs**
1. Click **"hackto-backend"** service
2. Go to **"Logs"** tab
3. Look for lines like:
   ```
   ✅ Database connected successfully
   ✅ Running migrations
   ```

### Database Structure (Default):

```
Database Name: neondb
Tables Created:
├── users
├── coding_problems
├── submissions
├── interview_rooms
├── blogs
├── announcements
├── jobs
├── applications
├── companies
├── resumes
├── drive_files
└── (other tables from schema)
```

---

## 🔄 **Step 3: Redis Cache Verification**

### Where to Find Redis Info:

1. Go to Render Dashboard
2. Click on **"hackto-redis"** service
3. Go to **"Info"** tab

### What You'll See:

```
Memory: 0.5 GB (Free tier)
Connection String: redis://:PASSWORD@red-xxxxx.render.internal:6379
Host: red-xxxxx.render.internal
Port: 6379
```

### How to Check Redis is Working:

**Option A: Check Backend Logs**
1. Click **"hackto-backend"** service
2. Go to **"Logs"** tab
3. Look for:
   ```
   ✅ Redis connected
   ✅ Cache initialized
   ```

**Option B: Check Redis Memory Usage**
1. Click **"hackto-redis"** service
2. Go to **"Metrics"** tab
3. See Memory usage graph

### What Redis Stores:

```
✅ Session data
✅ JWT tokens (blacklist)
✅ Cache for API responses
✅ Rate limiting data
✅ Real-time notifications
✅ WebSocket connections (if using)
```

---

## 🔌 **Step 4: Backend Service Verification**

### Check Backend is Running:

**Test 1: Health Check Endpoint**

```bash
curl https://hackto-backend.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 123456,
  "timestamp": "2024-05-11T12:00:00Z"
}
```

**Test 2: Check Backend Logs**

1. Click **"hackto-backend"** on Render Dashboard
2. Go to **"Logs"** tab
3. Look for these success messages:
   ```
   ✅ Server listening on port 3001
   ✅ Connected to PostgreSQL database
   ✅ Connected to Redis cache
   ✅ All routes initialized
   ```

**Test 3: API Test Endpoints**

```bash
# Test API is responding
curl https://hackto-backend.onrender.com/api/v1/health

# Test with authentication (if available)
curl https://hackto-backend.onrender.com/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Backend Environment Variables Check:

On Render Dashboard:
1. Click **"hackto-backend"** service
2. Go to **"Environment"** tab
3. Verify these are set:
   ```
   ✅ NODE_ENV = production
   ✅ PORT = 3001
   ✅ DATABASE_URL = (set)
   ✅ REDIS_URL = (set)
   ✅ JWT_SECRET = (set)
   ✅ VITE_API_BASE_URL = (set)
   ```

---

## 🎨 **Step 5: Frontend Service Verification**

### Check Frontend is Running:

1. Open in browser:
   ```
   https://hackto-frontend.onrender.com
   ```

2. Should see:
   ```
   ✅ Your React/Vue app loads
   ✅ No 404 errors
   ✅ No CORS errors
   ```

**Test 2: Check Frontend Logs**

1. Click **"hackto-frontend"** on Render Dashboard
2. Go to **"Logs"** tab
3. Look for:
   ```
   ✅ Building Docker image
   ✅ Successfully built
   ✅ Container started
   ✅ Nginx listening on port 80
   ```

**Test 3: Frontend Environment Variables**

On Render Dashboard:
1. Click **"hackto-frontend"** service
2. Go to **"Environment"** tab
3. Verify:
   ```
   ✅ VITE_API_BASE_URL = https://hackto-backend.onrender.com
   ```

---

## 🔗 **Step 6: Frontend ↔ Backend Communication**

### Test API Connection:

1. Open your frontend: `https://hackto-frontend.onrender.com`
2. Open **Browser DevTools** (F12)
3. Go to **"Network"** tab
4. Refresh page
5. Look for API calls to:
   ```
   https://hackto-backend.onrender.com/api/v1/...
   ```

### Check Network Tab Shows:

```
✅ Status: 200 (or 401 for auth, but NOT 500)
✅ URL: https://hackto-backend.onrender.com/api/...
✅ No CORS errors
✅ Response has data
```

### If CORS Error:

Backend might not be ready yet. Wait 2-3 minutes and refresh.

---

## 📝 **Step 7: Complete Verification Checklist**

### Services Status

- [ ] PostgreSQL service shows "Available" (green)
- [ ] Redis service shows "Available" (green)
- [ ] Backend service shows "Live" (green)
- [ ] Frontend service shows "Live" (green)

### Database Verification

- [ ] PostgreSQL connection string visible
- [ ] PostgreSQL user: `neondb_owner`
- [ ] Database name: `neondb`
- [ ] Redis connection string visible
- [ ] Redis memory shows > 0 bytes (means it's running)

### Backend Verification

- [ ] Backend health endpoint returns 200 OK
- [ ] Backend logs show "Server listening on port 3001"
- [ ] Backend logs show "Connected to PostgreSQL"
- [ ] Backend logs show "Connected to Redis"
- [ ] All environment variables are set

### Frontend Verification

- [ ] Frontend loads in browser (no 404)
- [ ] Frontend logs show "successfully built"
- [ ] Frontend environment variable VITE_API_BASE_URL is set
- [ ] Browser Network tab shows API calls to backend

### Communication Verification

- [ ] Frontend makes API calls to backend
- [ ] API responses have status 200 (no 500 errors)
- [ ] No CORS errors in browser console
- [ ] Data flows from Frontend → Backend → Database → Redis

---

## 🆘 **Step 8: Troubleshooting**

### If PostgreSQL is RED:

```
1. Go to PostgreSQL service
2. Click "Logs" tab
3. Look for error message
4. Common issues:
   - Memory limit exceeded → Upgrade plan
   - Connection pool exhausted → Restart service
   - Migration failed → Check backend logs
```

### If Redis is RED:

```
1. Go to Redis service
2. Click "Logs" tab
3. Common issues:
   - Memory full → Upgrade to larger plan
   - Authentication failed → Check password
   - Connection timeout → Restart service
```

### If Backend Won't Deploy:

```
1. Check "Logs" tab
2. Look for error in build process:
   - npm install failed → Missing dependencies
   - npm run build failed → TypeScript errors
   - Dockerfile error → Check Dockerfile path
3. Fix locally, then push to GitHub (auto-redeploy)
```

### If Frontend Won't Load:

```
1. Check "Logs" tab
2. Common issues:
   - Docker build failed → Check frontend/Dockerfile
   - Nginx error → Check nginx.conf
   - SPA routing error → Check nginx.conf routing
```

### If API Calls Fail:

```
1. Check Frontend logs for CORS errors
2. Verify VITE_API_BASE_URL is correct
3. Check Backend is responding:
   curl https://hackto-backend.onrender.com/health
4. Check Database connection:
   - Backend logs should show "Database connected"
5. Wait 2-3 minutes if services just deployed
```

---

## 📊 **Step 9: Monitoring Your Deployment**

### Daily Checks:

```
1. Go to https://dashboard.render.com
2. Check all services are "Live" or "Available"
3. Click "Metrics" tab for each service
4. Look for:
   - CPU: Should be < 50% average
   - Memory: Should be < 70% average
   - Disk: Should have space available
```

### Weekly Checks:

```
1. Check PostgreSQL disk space isn't full
2. Check Redis memory isn't full
3. Check backend error logs for patterns
4. Monitor API response times
```

### Monthly Maintenance:

```
1. Review and clean up old data from databases
2. Check if you need to upgrade plan based on traffic
3. Review security logs
4. Backup important data manually
```

---

## ✅ **Success Indicators - You're Done When:**

```
✅ All 4 services show green status
✅ Backend /health endpoint returns 200
✅ Frontend loads in browser
✅ Frontend → Backend API calls work
✅ Database queries return results
✅ Cache operations work
✅ No errors in any service logs
✅ CPU/Memory usage is reasonable
```

---

## 🎉 **Deployment Complete!**

Your full stack is running:

```
🌐 Frontend:   https://hackto-frontend.onrender.com
🔌 Backend:    https://hackto-backend.onrender.com
🗄️  Database:   PostgreSQL (Internal)
💾 Cache:      Redis (Internal)
🔒 SSL/TLS:    Automatic HTTPS
🔄 Auto-Deploy: On GitHub push
```

---

## 📞 **Support Resources**

- **Render Docs:** https://render.com/docs
- **Status Page:** https://render.statuspage.io
- **Community:** https://discord.gg/render
- **Backend Logs:** Dashboard → hackto-backend → Logs
- **Frontend Logs:** Dashboard → hackto-frontend → Logs
- **Database Logs:** Dashboard → hackto-postgres → Logs
- **Redis Logs:** Dashboard → hackto-redis → Logs

---

**Everything is working? Congratulations! 🚀**

Your application is now live and production-ready!
