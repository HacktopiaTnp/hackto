# 🚀 Render.com Deployment Guide

## Overview

Render.com is a modern PaaS platform that makes deploying applications simple. This guide covers deploying your HacktoTNP application.

**Key Benefits:**
- ✅ Free tier available
- ✅ GitHub integration (auto-deploy on push)
- ✅ Managed PostgreSQL & Redis
- ✅ Automatic SSL/TLS
- ✅ Zero-downtime deployments
- ✅ Easy scaling
- ✅ Built-in monitoring

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub account with `https://github.com/HacktopiaTnp/hackto.git` repository
- [ ] Render account (https://render.com - free tier available)
- [ ] Environment variables ready (API keys, secrets, etc.)
- [ ] Backend and Frontend code tested locally
- [ ] Docker builds working (`docker build .`)

---

## ⏱️ Deployment Time Estimate

| Phase | Time | Notes |
|-------|------|-------|
| Setup Render Account | 5 min | Free tier available |
| Create Services (Manual) | 20-30 min | One-by-one setup |
| Alternative: Infrastructure as Code | 5-10 min | Using render.yaml |
| Configure Environment Variables | 10 min | Setup secrets |
| First Deployment | 5-10 min | Initial build & deploy |
| **Total** | **45-60 min** | **Less with IaC approach** |

---

## Option 1: Quick Deploy (Manual Setup) - 20-30 minutes

### Step 1: Sign Up / Login to Render

1. Go to https://dashboard.render.com
2. Click "Sign up with GitHub" or login
3. Authorize Render to access your GitHub account

### Step 2: Create PostgreSQL Database

1. Click **"+ New"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `hackto-postgres` (or your choice)
   - **Database:** `neondb`
   - **User:** `neondb_owner`
   - **Region:** Choose your closest region (e.g., Oregon)
   - **Plan:** Free (0.15 GB RAM, 100 MB storage)
3. Click **"Create Database"**
4. Wait 2-3 minutes for creation
5. **Copy the Internal Database URL** (you'll need this)

### Step 3: Create Redis Cache

1. Click **"+ New"** → **"Redis"**
2. Configure:
   - **Name:** `hackto-redis`
   - **Region:** Same as PostgreSQL
   - **Plan:** Free (0.5 GB memory)
3. Click **"Create Redis"**
4. Wait for creation
5. **Copy the Redis Connection String**

### Step 4: Deploy Backend API

1. Click **"+ New"** → **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Connect GitHub:
   - Click **"Connect account"** (if not connected)
   - Select your repository: `HacktopiaTnp/hackto`
   - Click **"Connect"**
4. Configure Service:
   - **Name:** `hackto-backend`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free ($0/month)
   - **Root Directory:** `backend/` ← **IMPORTANT**

5. Click **"Create Web Service"**
6. Go to **"Environment"** tab
7. Add Environment Variables:

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<paste-postgres-internal-url>
   REDIS_URL=<paste-redis-connection-string>
   JWT_SECRET=<your-secret-key>
   VITE_API_BASE_URL=https://hackto-backend.onrender.com
   CLOUDINARY_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   JUDGE0_API_KEY=<your-judge0-api-key>
   ```

8. Click **"Save"**
9. Go to **"Deploys"** tab → wait for deployment to complete (5-10 minutes)
10. Once deployed, copy your backend URL (e.g., `https://hackto-backend.onrender.com`)

### Step 5: Deploy Frontend

1. Click **"+ New"** → **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Configure:
   - **Name:** `hackto-frontend`
   - **Repository:** `HacktopiaTnp/hackto`
   - **Branch:** `main`
   - **Runtime:** `Docker` ← **Select this**
   - **Plan:** Free

4. Click **"Create Web Service"**
5. Go to **"Environment"** tab
6. Add Environment Variables:

   ```
   VITE_API_BASE_URL=https://hackto-backend.onrender.com
   ```

7. Click **"Save"**
8. Wait for deployment (Render will auto-detect `frontend/Dockerfile`)

### Step 6: Verify Deployment

```bash
# Test Backend Health
curl https://hackto-backend.onrender.com/health

# Test Frontend
curl https://hackto-frontend.onrender.com

# Or open in browser
https://hackto-frontend.onrender.com
```

---

## Option 2: Infrastructure as Code (render.yaml) - 5-10 minutes

### Step 1: Use render.yaml

The `render.yaml` file is already created in your repo. It defines all services.

### Step 2: Deploy via Dashboard

1. Go to https://dashboard.render.com
2. Click **"+ New"** → **"Blueprint"** (or **"Infrastructure as Code"**)
3. Connect your GitHub repo (if not connected)
4. Select your repository and branch (`main`)
5. Render auto-detects `render.yaml`
6. Review services:
   - PostgreSQL (free)
   - Redis (free)
   - Backend (Node)
   - Frontend (Docker)
7. Click **"Deploy"**
8. **Manually set secrets:**
   - Go to each service
   - Add missing environment variables marked `sync: false`
   - (JWT_SECRET, CLOUDINARY keys, JUDGE0_API_KEY)

### Step 3: Verify

Wait 10-15 minutes for complete deployment, then test like in Option 1.

---

## 🔐 Environment Variables Reference

### Backend Required Variables

| Variable | Example | Where to Get | Required |
|----------|---------|--------------|----------|
| `NODE_ENV` | `production` | Set to this value | ✅ |
| `PORT` | `3001` | Default | ✅ |
| `DATABASE_URL` | `postgresql://...` | Render PostgreSQL service | ✅ |
| `REDIS_URL` | `redis://...` | Render Redis service | ✅ |
| `JWT_SECRET` | `your-secret-key-32-chars` | Generate random | ✅ |
| `VITE_API_BASE_URL` | `https://hackto-backend.onrender.com` | Your backend URL | ✅ |
| `CLOUDINARY_NAME` | Your cloudinary name | Cloudinary account | ❌ |
| `CLOUDINARY_API_KEY` | Your API key | Cloudinary account | ❌ |
| `CLOUDINARY_API_SECRET` | Your API secret | Cloudinary account | ❌ |
| `JUDGE0_API_KEY` | Your API key | RapidAPI Judge0 | ❌ |

### Frontend Required Variables

| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_BASE_URL` | `https://hackto-backend.onrender.com` | ✅ |

---

## 🆘 Troubleshooting

### Backend deployment fails to build

**Problem:** "npm install" fails or "npm run build" fails

**Solutions:**
1. Check `backend/package.json` exists
2. Verify `package.json` has correct dependencies
3. Check build script in `package.json`: `"build": "tsc"`
4. Ensure TypeScript compiles locally: `npm run build` in backend folder

**Quick Fix:**
```bash
cd backend
npm install
npm run build
```

### "Port already in use" error

**Solution:** PORT 3001 is usually free on Render. If not:
- The default PORT env var is fine - Render assigns internally
- Don't worry about external ports

### Frontend shows "Cannot GET /"

**Problem:** Frontend deployment failed or routing wrong

**Solutions:**
1. Check `frontend/Dockerfile` exists and is correct
2. Verify `frontend/nginx.conf` is configured for SPA routing
3. Check `VITE_API_BASE_URL` is correct in environment variables

### "VITE_API_BASE_URL" not working

**Problem:** Frontend can't reach backend

**Solutions:**
1. Verify backend is fully deployed and healthy
2. Go to backend service → copy full URL
3. Update frontend environment variable: `VITE_API_BASE_URL=<backend-url>`
4. Trigger frontend redeploy (Manual Deploy button)

### Database connection fails

**Problem:** "ECONNREFUSED" or connection timeout

**Solutions:**
1. Verify PostgreSQL service is created and running
2. Copy DATABASE_URL exactly from Postgres service page
3. Check DATABASE_URL doesn't have typos
4. Postgres takes 2-3 minutes to initialize

### Health checks failing

**Problem:** Service keeps crashing

**Solutions:**
1. Check logs: Service page → "Logs"
2. Verify `/health` endpoint exists in backend
3. Check if PORT matches (should be 3001 internally)
4. Increase health check delay in environment:
   - For slow builds: Set `start_period: 120` seconds

---

## 📊 Monitoring & Logs

### View Logs

1. Go to service page
2. Click **"Logs"** tab
3. See real-time deployment & runtime logs

### View Metrics

1. Click **"Metrics"** tab
2. See CPU, Memory, Disk usage
3. Monitor for performance issues

### View Events

1. Click **"Events"** tab
2. See deployment history
3. Track deploys and restarts

---

## 🔄 Continuous Deployment

### Auto-Deploy on GitHub Push

By default, Render auto-deploys when you push to the main branch:

```bash
# After making changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically detects the push and deploys!
# Check dashboard for deployment progress
```

### Manual Deployment

1. Go to service page
2. Click **"Manual Deploy"** button
3. Select branch (`main`)
4. Click **"Deploy latest commit"**

---

## 💰 Pricing Reference

| Component | Free Tier | Cost | Notes |
|-----------|-----------|------|-------|
| Web Service | Yes | $0-7/mo | Auto-sleeps after 15min inactivity |
| PostgreSQL | 0.15 GB | $7/mo for 1GB | Auto-upgrades on storage limit |
| Redis | 0.5 GB | $3.75/mo | Auto-upgrades on memory limit |
| **Total (Free)** | **Yes** | **$0/mo** | All services included |
| **Total (Paid)** | No | **$10.75/mo+** | Recommended for production |

**Recommendation:** Start free, upgrade when traffic increases (or monthly if in production).

---

## 🎯 Next Steps After Deployment

### 1. Update DNS (if using custom domain)

1. Get Render URL: `https://hackto-backend.onrender.com`
2. Update your DNS records:
   ```
   CNAME record: api.yourdomain.com → hackto-backend.onrender.com
   CNAME record: www.yourdomain.com → hackto-frontend.onrender.com
   ```

### 2. Test in Production

```bash
# Test Backend API
curl https://hackto-backend.onrender.com/health

# Test Frontend
Open https://hackto-frontend.onrender.com in browser

# Test Database Connection
# (Should work if environment variables are set)
```

### 3. Setup Monitoring

1. Enable alerts: Service → Settings → Notifications
2. Monitor logs daily: Check Logs tab
3. Monitor metrics: Check CPU/Memory usage

### 4. Automatic Backups (PostgreSQL)

1. Go to PostgreSQL service
2. Click **"Backups"** tab
3. Enable automatic daily backups (paid feature)

### 5. Upgrade Services (When Needed)

1. High traffic? Upgrade Web Service to `starter` or higher
2. Running out of space? Upgrade PostgreSQL storage
3. Slow queries? Increase Redis memory

---

## 📞 Support & Resources

- **Render Docs:** https://render.com/docs
- **Status Page:** https://render.statuspage.io
- **Community:** https://discord.gg/render
- **Email Support:** support@render.com (paid plans)

---

## ✅ Deployment Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] PostgreSQL service created
- [ ] Redis service created
- [ ] Backend deployed and `/health` endpoint working
- [ ] Frontend deployed and loading
- [ ] Environment variables set correctly
- [ ] Auto-deployment from GitHub verified
- [ ] Health checks passing
- [ ] Backend and frontend communication working
- [ ] Tested in production environment
- [ ] Monitoring and logs configured

---

## 🎉 Success Indicators

✅ **Backend working:**
```bash
curl https://hackto-backend.onrender.com/health
# Should return 200 OK with health status
```

✅ **Frontend working:**
```bash
curl https://hackto-frontend.onrender.com
# Should return HTML page
```

✅ **Frontend → Backend communication:**
- Open frontend in browser
- Check Browser DevTools → Network tab
- API calls should go to `hackto-backend.onrender.com`
- Should receive data without CORS errors

✅ **Database working:**
- Backend should connect to PostgreSQL
- No "ECONNREFUSED" errors in logs

---

**Deployment Complete! 🚀**

Your HacktoTNP application is now running on Render.com with automatic SSL/TLS, auto-scaling, and continuous deployment from GitHub.
