# 🚀 Render.com Quick Start (5 Minutes)

## Step-by-Step Guide

### 1️⃣ Login to Render (1 min)

```
Visit: https://dashboard.render.com
Click: "Sign up with GitHub" (or login if you have account)
Authorize: Allow Render to access your GitHub
```

---

### 2️⃣ Create PostgreSQL Database (3 min)

```
Click: "+ New" → "PostgreSQL"

Fill in:
  Name: hackto-postgres
  Database: neondb
  User: neondb_owner
  Region: Oregon (or your region)
  Plan: Free

Click: "Create Database"
⏳ Wait 2-3 minutes
📋 COPY: Internal Database URL
```

**Example URL:**
```
postgresql://neondb_owner:PASSWORD@internal-ip:5432/neondb
```

---

### 3️⃣ Create Redis Cache (2 min)

```
Click: "+ New" → "Redis"

Fill in:
  Name: hackto-redis
  Region: Oregon
  Plan: Free

Click: "Create Redis"
⏳ Wait 1-2 minutes
📋 COPY: Connection String
```

---

### 4️⃣ Deploy Backend (5 min)

```
Click: "+ New" → "Web Service"
Select: "Build and deploy from a Git repository"

Connect GitHub:
  Click: "Connect account"
  Select: HacktopiaTnp/hackto
  
Configure:
  Name: hackto-backend
  Branch: main
  Runtime: Node
  Build Command: npm install && npm run build
  Start Command: npm start
  Root Directory: backend/
  Plan: Free

Click: "Create Web Service"
```

**Then add Environment Variables:**

1. Click on service when created
2. Go to "Environment" tab
3. Add these:

```
NODE_ENV                = production
PORT                    = 3001
DATABASE_URL            = <paste-from-postgresql>
REDIS_URL               = <paste-from-redis>
JWT_SECRET              = your-secret-key-min-32-chars
VITE_API_BASE_URL       = https://hackto-backend.onrender.com
```

**Optional (for your features):**
```
CLOUDINARY_NAME         = <your-cloudinary-name>
CLOUDINARY_API_KEY      = <your-key>
CLOUDINARY_API_SECRET   = <your-secret>
JUDGE0_API_KEY          = <your-judge0-key>
```

⏳ Wait for Backend deployment (5-10 min)

---

### 5️⃣ Deploy Frontend (5 min)

```
Click: "+ New" → "Web Service"
Select: "Build and deploy from a Git repository"

Configure:
  Name: hackto-frontend
  Repository: HacktopiaTnp/hackto
  Branch: main
  Runtime: Docker
  Plan: Free

Click: "Create Web Service"
```

**Then add Environment Variables:**

1. Go to "Environment" tab
2. Add:

```
VITE_API_BASE_URL = https://hackto-backend.onrender.com
```

⏳ Wait for Frontend deployment (5-10 min)

---

### 6️⃣ Verify It Works ✅

```bash
# Test Backend
curl https://hackto-backend.onrender.com/health
# Should return: {"status":"ok",...}

# Test Frontend
Open in browser: https://hackto-frontend.onrender.com
# Should load your app
```

---

## 📊 What You Now Have

| Service | Status | URL |
|---------|--------|-----|
| 🗄️ PostgreSQL | ✅ Running | Internal only |
| 🔄 Redis | ✅ Running | Internal only |
| 🔌 Backend API | ✅ Running | https://hackto-backend.onrender.com |
| 🎨 Frontend | ✅ Running | https://hackto-frontend.onrender.com |
| 🔒 SSL/TLS | ✅ Automatic | Built-in |
| 🔄 Auto-Deploy | ✅ Enabled | Push to GitHub = Deploy |

---

## 🆘 Quick Troubleshooting

### Frontend shows "Cannot connect to API"

**Solution:**
1. Go to frontend service
2. Click "Environment"
3. Update `VITE_API_BASE_URL` to your actual backend URL
4. Click "Save"
5. Click "Manual Deploy" (top right)

### Backend won't deploy

**Solution:**
1. Check Root Directory is `backend/`
2. Verify `backend/package.json` exists
3. View logs: Click "Logs" tab
4. Common error: Missing dependencies
   - Run locally: `cd backend && npm install`
   - Then push to GitHub

### Services keep crashing

**Check logs:**
1. Click service
2. Click "Logs" tab
3. See error messages
4. Fix locally
5. Push to GitHub (auto-deploy)

---

## 💾 Important URLs to Save

```
Dashboard: https://dashboard.render.com
Backend URL: https://hackto-backend.onrender.com
Frontend URL: https://hackto-frontend.onrender.com
Docs: https://render.com/docs
```

---

## 🎉 You're Done!

Your app is now deployed! 🚀

**Next:** 
- Create custom domain (optional)
- Monitor logs and metrics
- Push updates to auto-deploy
- Upgrade to paid tier if needed

