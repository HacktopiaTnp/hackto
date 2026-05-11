# QUICK START: VERIFY YOUR INTEGRATION

## 🚀 Start Here (3 Steps)

### Step 1: Clean Up (2 minutes)
```powershell
# Run with Administrator privileges
.\cleanup.ps1
```

This will:
- ✓ Kill any processes using ports 3000, 5173, 5432, 6379, 80, 443
- ✓ Stop all Docker containers
- ✓ Clear npm cache

### Step 2: Start Services (3 minutes)
```powershell
# From project root
docker-compose up -d

# Wait 30 seconds for all services to start
Start-Sleep -Seconds 30

# Verify all containers are running
docker-compose ps
```

### Step 3: Run Integration Tests (2 minutes)
```powershell
# Run automated tests
.\test-integration.ps1
```

---

## 📊 What Gets Tested?

The automated test suite checks:

- ✅ **Docker Containers**: All 5 services running (nginx, backend, frontend, postgres, redis)
- ✅ **Backend Health**: Responding to health check requests
- ✅ **Frontend Access**: Can access the frontend via Nginx
- ✅ **CORS Configuration**: Frontend can communicate with backend
- ✅ **Database Connection**: PostgreSQL is accessible and working
- ✅ **Cache Layer**: Redis is accessible and working
- ✅ **API Endpoints**: Sample endpoints responding correctly
- ✅ **Port Availability**: All required ports are open

---

## 🔍 Available Resources

### Comprehensive Guides
| File | Purpose | Time |
|------|---------|------|
| [INTEGRATION_TEST_GUIDE.md](INTEGRATION_TEST_GUIDE.md) | Complete 12-step testing guide with troubleshooting | 30 min |
| [SAMPLE_API_TESTS.md](SAMPLE_API_TESTS.md) | API endpoint examples and curl commands | Reference |
| [FRONTEND_TEST_CONSOLE.js](FRONTEND_TEST_CONSOLE.js) | Browser console tests for frontend validation | Reference |

### Automation Scripts
| File | Purpose | Usage |
|------|---------|-------|
| `cleanup.ps1` | Clean all ports and processes | `.\cleanup.ps1` |
| `test-integration.ps1` | Run full integration test suite | `.\test-integration.ps1` |
| `quick-verify.sh` | Quick bash verification (Linux/Mac) | `bash quick-verify.sh` |

---

## 🌐 Access Your Application

After successful startup:

### Frontend
- **Nginx Route**: http://localhost/
- **Direct**: http://localhost:5173

### Backend
- **API Base**: http://localhost:3000
- **Health**: http://localhost:3000/health
- **Info**: http://localhost:3000/info

### Databases
- **PostgreSQL**: localhost:5432 (user: `neondb_owner`, password: `postgres`)
- **Redis**: localhost:6379

---

## ✅ Verification Checklist

After running the automated tests, verify manually:

### Backend Connectivity
```bash
# Test 1: Health Check
curl http://localhost:3000/health
# Expected: {"status": "ok", ...}

# Test 2: API Info
curl http://localhost:3000/info
# Expected: {"name": "tnp-backend", ...}
```

### Frontend Connectivity
```bash
# Test 3: Frontend Access
curl http://localhost/
# Expected: HTML content
```

### Database Operations
```bash
# Test 4: Database Query (requires psql)
psql -h localhost -U neondb_owner -d neondb -c "SELECT COUNT(*) FROM users;"

# Or via Docker
docker-compose exec postgres psql -U neondb_owner -d neondb -c "SELECT COUNT(*) FROM users;"
```

### End-to-End Data Flow
1. **Frontend**: Open http://localhost/
2. **Register**: Create a new user account
3. **Monitor Backend**: Watch logs in terminal 1
4. **Check Database**: Query users table in terminal 2
5. **Update Profile**: Change user information
6. **Verify Persistence**: Restart services and check data still exists

---

## 🛠️ Troubleshooting

### Issue: Port Already in Use
```
Error: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
```

**Solution:**
```powershell
.\cleanup.ps1
# or manually:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: CORS Errors
```
Access to fetch blocked by CORS policy
```

**Check**: `backend/src/api/middleware/logging.middleware.ts`
- Verify `CORS_ORIGIN` environment variable
- Default should be `http://localhost`

### Issue: Database Connection Failed
```bash
# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection
docker-compose exec postgres psql -U neondb_owner -c "SELECT 1;"
```

### Issue: Containers Not Starting
```bash
# Check all logs
docker-compose logs

# Rebuild and restart
docker-compose down -v
docker-compose up -d --build
```

---

## 📋 Test Data Integration

### Create Test User (via API)
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Verify in Database
```bash
docker-compose exec postgres psql -U neondb_owner -d neondb \
  -c "SELECT email, first_name, last_name FROM users WHERE email = 'test@example.com';"
```

### Update User Data
```bash
# Use the token from registration response
curl -X PUT http://localhost:3000/api/v1/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated"
  }'
```

### Verify Update in Database
```bash
docker-compose exec postgres psql -U neondb_owner -d neondb \
  -c "SELECT * FROM users WHERE email = 'test@example.com';"
```

---

## 📈 Monitoring During Tests

### Terminal 1: Backend Logs
```bash
docker-compose logs -f backend
# Shows: Database connections, API calls, errors
```

### Terminal 2: Database Logs
```bash
docker-compose logs -f postgres
# Shows: Connection attempts, query logs
```

### Terminal 3: Redis Logs
```bash
docker-compose logs -f redis
# Shows: Cache hits, connection status
```

### Terminal 4: Nginx Logs
```bash
docker-compose logs -f nginx
# Shows: HTTP requests, reverse proxy activity
```

---

## 🎯 Key Endpoints to Test

### Health & Info
- `GET /health` - Backend health
- `GET /info` - Backend info

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Authenticate
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### User Profile
- `GET /api/v1/user` - Get current user (requires auth)
- `PUT /api/v1/user` - Update user (requires auth)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `INTEGRATION_TEST_GUIDE.md` | Complete 12-step guide with detailed explanations |
| `SAMPLE_API_TESTS.md` | API examples, curl commands, expected responses |
| `FRONTEND_TEST_CONSOLE.js` | Browser console test suite |
| `docker-compose.yml` | Container configuration |
| `backend/src/app.ts` | Backend API setup |
| `frontend/src/services/api.ts` | Frontend API client |

---

## ⏱️ Typical Timeline

| Step | Time | Activity |
|------|------|----------|
| Cleanup | 2 min | Kill processes, stop containers |
| Start Services | 1 min | `docker-compose up -d` |
| Wait for Ready | 2 min | Containers initialize |
| Run Tests | 2 min | `test-integration.ps1` |
| **Total** | **~7 min** | Complete verification |

---

## ✨ Success Indicators

Your integration is working correctly when:

- ✅ All 5 containers show "Up" status
- ✅ Health endpoints respond with 200 status
- ✅ Database returns query results
- ✅ Redis responds to PING command
- ✅ Frontend page loads in browser
- ✅ User registration creates database entry
- ✅ Data updates reflected in database
- ✅ Frontend can read updated data
- ✅ No CORS or connection errors in console
- ✅ All logs show successful initialization

---

## 🚨 Emergency Help

### Reset Everything
```powershell
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a
.\cleanup.ps1
docker-compose up -d --build
```

### Check Individual Components
```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/

# Database
docker-compose exec postgres psql -U neondb_owner -c "SELECT 1;"

# Redis
docker-compose exec redis redis-cli ping
```

---

## 📞 Questions?

Refer to the relevant guide:
- **Setup Issues**: [INTEGRATION_TEST_GUIDE.md](INTEGRATION_TEST_GUIDE.md) - Step 1
- **API Testing**: [SAMPLE_API_TESTS.md](SAMPLE_API_TESTS.md)
- **Frontend Debugging**: [FRONTEND_TEST_CONSOLE.js](FRONTEND_TEST_CONSOLE.js)
- **Docker Issues**: `docker-compose logs`

---

**Last Updated**: April 13, 2026
**Status**: Ready for testing
**Next Step**: Run `.\cleanup.ps1`, then `docker-compose up -d`, then `.\test-integration.ps1`
