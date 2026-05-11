# 🎯 Render Deployment - Exact Steps from Form

## You're on the Right Page! ✅

This guide shows exactly what to enter in each field you see on Render.

---

## 📋 Step 1: Top Section

### Repository
- **Already set:** `HacktopiaTnp / hackto` ✅

### Project Name
```
Enter: hackto
```

### Environment
```
Select: Production
```

---

## 🐳 Step 2: Build Settings

### Runtime
```
Select: Docker ✅ (Already selected in your screenshot)
```

### Branch
```
Select: main ✅ (Already selected)
```

### Root Directory (Optional)
```
Leave empty OR enter: .
(Render will auto-detect)
```

### Dockerfile Path
```
Enter: frontend/Dockerfile
```

### Region
```
Select: Oregon (US West) ✅ (Already selected)
```

---

## 💰 Step 3: Instance Type (Choose ONE)

### For FREE (Recommended to start)
```
Select: Free
- $0/month
- 512 MB RAM
- 0.1 CPU
- Auto-sleeps after 15 min inactivity
```

### For PRODUCTION
```
Select: Starter
- $7/month
- 512 MB RAM  
- 0.5 CPU
- Always running (no sleep)
```

### For HIGHER PERFORMANCE
```
Select: Standard or higher based on needs
- Standard: $25/mo (2GB RAM, 1 CPU)
- Pro: $85/mo (4GB RAM, 2 CPU)
```

**Recommendation:** Start with `Free`, upgrade later if needed.

---

## 🔐 Step 4: Environment Variables

Click: **"+ Add Environment Variable"**

Add these variables ONE BY ONE:

### Required Variables

#### 1️⃣ First Variable
```
NAME: VITE_API_BASE_URL
VALUE: https://hackto-backend.onrender.com
```

Click "Add" or "Save"

#### 2️⃣ Optional Variables (if using these features)
```
(Add only if you use these services)

NAME: CLOUDINARY_NAME
VALUE: <your-cloudinary-name>

---

NAME: CLOUDINARY_API_KEY
VALUE: <your-cloudinary-key>

---

NAME: CLOUDINARY_API_SECRET
VALUE: <your-cloudinary-secret>

---

NAME: JUDGE0_API_KEY
VALUE: <your-judge0-api-key>
```

---

## ✅ Step 5: Click Deploy

```
Scroll down and click: "Deploy Web Service"
```

**That's it!** ✅ Deployment will start.

---

## ⏱️ What Happens Next

```
1. Render clones your repo (30 sec)
2. Builds Docker image (2-3 min)
3. Deploys container (1 min)
4. Service starts (1 min)

Total: 5-10 minutes
```

---

## ✨ After Deployment Succeeds

Your frontend will be live at:
```
https://hackto-frontend.onrender.com
```

---

## 📝 Summary of Form Fields

| Field | Value |
|-------|-------|
| Repository | HacktopiaTnp/hackto |
| Project Name | hackto |
| Environment | Production |
| Runtime | Docker |
| Branch | main |
| Root Directory | (leave empty) |
| Dockerfile Path | frontend/Dockerfile |
| Region | Oregon |
| Instance Type | Free (or Starter for production) |
| Environment Var 1 | VITE_API_BASE_URL = https://hackto-backend.onrender.com |

---

Done! That's all you need to do for the frontend. 🚀
