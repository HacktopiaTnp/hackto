# ⚡ Render Deployment - Quick Checks (30 seconds)

## 🔍 **AFTER CLICKING "Deploy Web Service"**

**Wait 10-15 minutes**, then check these 5 things:

---

## ✅ **Check 1: Service Status**

```
Go to: https://dashboard.render.com

Should see GREEN:
  ✅ hackto-postgres    [Available]
  ✅ hackto-redis       [Available]
  ✅ hackto-backend     [Live]
  ✅ hackto-frontend    [Live]
```

---

## ✅ **Check 2: Backend Works**

```
Open this URL in browser:
https://hackto-backend.onrender.com/health

Should see JSON with:
  "status": "ok"
  "database": "connected"
  "redis": "connected"
```

---

## ✅ **Check 3: Frontend Loads**

```
Open in browser:
https://hackto-frontend.onrender.com

Should see:
  ✅ Your app homepage
  ✅ No 404 errors
  ✅ No loading forever
```

---

## ✅ **Check 4: API Connection Works**

```
1. Open: https://hackto-frontend.onrender.com
2. Press F12 (Developer Tools)
3. Go to Network tab
4. Refresh page
5. Look for blue requests going to:
   https://hackto-backend.onrender.com/api/...

Should see:
  ✅ Status: 200 or 401 (NOT 500)
  ✅ Response has data
  ✅ No CORS errors
```

---

## ✅ **Check 5: Logs Look Good**

```
For each service (click it, then Logs):

PostgreSQL:
  ✅ "Database accepting connections"
  ❌ NO "ERROR" or "FATAL"

Redis:
  ✅ "Ready to accept connections"
  ❌ NO errors

Backend:
  ✅ "Server listening on port 3001"
  ✅ "Connected to PostgreSQL"
  ✅ "Connected to Redis"
  ❌ NO errors

Frontend:
  ✅ "successfully built"
  ❌ NO build errors
```

---

## 📊 **All 5 Checks Passing?**

```
✅ YES → Everything works perfectly! 🎉
❌ NO → See RENDER_VERIFICATION_GUIDE.md for troubleshooting
```

---

## 🆘 **Quick Fixes**

| Issue | Fix |
|-------|-----|
| Services stuck deploying | Click service → Logs → see error |
| Backend won't start | Check logs for missing env vars |
| Frontend won't load | Wait 5 min, refresh (might be building) |
| API calls fail | Check VITE_API_BASE_URL in frontend env |
| Database error | Restart PostgreSQL service |

---

**Done!** Your app is deployed! 🚀
