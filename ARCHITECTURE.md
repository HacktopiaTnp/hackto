# System Architecture & Data Flow

## 🏗️ Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         External Network                          │
│        Browser (Frontend SPA - React + Vite + TailwindCSS)       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
        ┌────────────────▼─────────────────┐
        │   Nginx Reverse Proxy (Port 80/443)
        │  - SSL/TLS Termination
        │  - Rate Limiting
        │  - Caching
        │  - WebSocket Support
        └────┬──────────────────┬──────────┘
             │                  │
          [HTTP]           [HTTP]
             │                  │
        ┌────▼────┐      ┌──────▼──────┐
        │ Backend  │      │  Frontend   │
        │ API      │      │  Static     │
        │ (Node)   │      │  Files      │
        │ Port 3000│      │  Port 5173  │
        └────┬─────┘      └─────────────┘
             │
        [TCP Connection]
             │
      ┌──────┼──────┐
      │      │      │
   ┌──▼──┐ ┌─▼──┐ ┌─▼─────┐
   │ DB  │ │Cac │ │Job Q  │
   │ PSQL│ │Redis│ │BullMQ │
   │5432 │ │6379 │ │ (Redis)
   └─────┘ └────┘ └───────┘
```

---

## 📊 Data Flow Architecture

### 1️⃣ USER REGISTRATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Registration Form                                            ││
│  │ - Email: test@example.com                                    ││
│  │ - Password: SecurePassword123!                               ││
│  │ - First Name: John                                           ││
│  │ - Last Name: Doe                                             ││
│  └──────────────────────┬──────────────────────────────────────┘│
└─────────────────────────┼────────────────────────────────────────┘
                          │
                  HTTP POST /api/v1/auth/register
                  Content-Type: application/json
                          │
        ┌─────────────────▼──────────────────┐
        │        NGINX REVERSE PROXY          │
        │  - Validates request                │
        │  - Applies rate limiting            │
        │  - Forwards to backend              │
        └─────────────────┬────────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │       BACKEND API (Node.js)         │
        │  ┌─────────────────────────────────┐│
        │  │ Auth Controller                  ││
        │  │ - Validates email format         ││
        │  │ - Validates password strength    ││
        │  │ - Checks if user exists          ││
        │  │ - Hashes password (bcrypt)       ││
        │  └─────────────────┬────────────────┘│
        │                    │                 │
        │  ┌─────────────────▼────────────────┐│
        │  │ Database Service                 ││
        │  │ - Prepares insert query          ││
        │  │ - Begins transaction              ││
        │  └─────────────────┬────────────────┘│
        └────────────────────┼────────────────┘
                             │
                    TCP Connection
                             │
           ┌─────────────────▼──────────────────┐
           │    POSTGRESQL DATABASE (5432)       │
           │  ┌─────────────────────────────────┐│
           │  │ Users Table                      ││
           │  │ - id: uuid                       ││
           │  │ - email: test@example.com        ││
           │  │ - password_hash: bcrypt_hash     ││
           │  │ - first_name: John               ││
           │  │ - last_name: Doe                 ││
           │  │ - role: user                     ││
           │  │ - tenant_id: uuid                ││
           │  │ - created_at: timestamp          ││
           │  │ - updated_at: timestamp          ││
           │  └─────────────────────────────────┘│
           │  Transaction Committed ✓            │
           └─────────────────────────────────────┘
                             │
        ┌────────────────────▼──────────────────┐
        │       BACKEND RESPONSE                │
        │  ┌─────────────────────────────────────┐
        │  │ - Generate JWT access_token         │
        │  │ - Generate JWT refresh_token        │
        │  │ - Return user data                  │
        │  └─────────────────────────────────────┐
        │  HTTP 201 Created                      │
        │  {                                     │
        │    "success": true,                    │
        │    "data": {                           │
        │      "access_token": "jwt...",        │
        │      "refresh_token": "jwt...",       │
        │      "user": {...}                    │
        │    }                                   │
        │  }                                     │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼──────────────────┐
        │      NGINX PROCESSES RESPONSE          │
        │  - Caches response (if applicable)    │
        │  - Sets security headers              │
        │  - Applies CORS headers               │
        └────────────────────┬─────────────────┘
                             │
        ┌────────────────────▼──────────────────────┐
        │            FRONTEND RECEIVES              │
        │  ┌────────────────────────────────────────┐
        │  │ 1. Extract tokens from response        │
        │  │ 2. Save to localStorage                │
        │  │      access_token: "jwt..."           │
        │  │      refresh_token: "jwt..."          │
        │  │ 3. Save user profile to state          │
        │  │ 4. Redirect to dashboard               │
        │  │ 5. Display success message             │
        │  └────────────────────────────────────────┘
        └────────────────────┬─────────────────────┘
                             │
                            ✓ USER REGISTERED
```

---

### 2️⃣ USER LOGIN FLOW

```
FRONTEND
│
├─ User enters credentials
│  • email: test@example.com
│  • password: SecurePassword123!
│
└─ Submit to /api/v1/auth/login
   │
   └─► NGINX (forward to backend)
       │
       └─► BACKEND
           │
           ├─ Query database for user by email
           │  │
           │  └─► POSTGRESQL: SELECT * FROM users WHERE email = 'test@example.com'
           │      │
           │      └─ Returns: user record with password_hash
           │
           ├─ Compare submitted password with hash (bcrypt)
           │  ├─ Match? YES ✓
           │  └─ Generate JWT tokens
           │
           └─► REDIS (optional - cache user session)
               │
               └─ Store session data for quick lookups
                  Key: session:{user_id}
                  TTL: 1 hour

       Response to FRONTEND:
       ├─ access_token (JWT - 15 min expiry)
       ├─ refresh_token (JWT - 7 days expiry)
       └─ user profile data

FRONTEND Storage:
├─ localStorage.setItem('access_token', token)
├─ localStorage.setItem('refresh_token', token)
└─ Redirect to dashboard
```

---

### 3️⃣ AUTHENTICATED REQUEST FLOW

```
FRONTEND
│
├─ User action: Update profile
│  • first_name: "Jonathan"
│  • phone: "+1234567890"
│
└─ HTTP PUT /api/v1/user with headers:
   │
   ├─ Authorization: Bearer eyJhbGc...
   ├─ Content-Type: application/json
   └─ Body: {...}
      │
      └─► NGINX
          │
          ├─ Match request origin (CORS)
          ├─ Apply rate limiting
          └─ Forward to backend
             │
             └─► BACKEND
                 │
                 ├─ Extract JWT from header
                 │  │
                 │  └─ Verify signature
                 │     └─ Check expiry time
                 │
                 ├─ Extract user_id from JWT payload
                 │
                 ├─ Prepare UPDATE query
                 │  UPDATE users SET
                 │    first_name = 'Jonathan',
                 │    phone = '+1234567890',
                 │    updated_at = NOW()
                 │  WHERE id = 'user-uuid'
                 │
                 └─ Execute in database
                    │
                    └─► POSTGRESQL
                        │
                        ├─ Acquire row lock
                        ├─ Update columns
                        ├─ Release lock
                        └─ Commit transaction
                           │
                           └─ ✓ Changes saved

BACKEND Response:
├─ HTTP 200 OK
├─ Updated user object
└─ Updated timestamp

FRONTEND:
├─ Receive response
├─ Update local state
├─ Update display
└─ ✓ Data updated successfully
```

---

### 4️⃣ CACHING FLOW (Redis)

```
REQUEST
│
├─ API endpoint: GET /api/v1/user/profile
│
├─ BACKEND checks Redis cache:
│  Key: "user:{user_id}:profile"
│  │
│  ├─ Cache HIT? ✓
│  │  └─ Return cached data (fast)
│  │
│  └─ Cache MISS? ✗
│     │
│     ├─ Query PostgreSQL
│     │
│     ├─ Get results
│     │
│     └─ Store in Redis:
│        SET "user:{user_id}:profile" JSON_DATA
│        EX 3600  (1 hour TTL)
│        │
│        └─► REDIS stores data
│
└─ Return to FRONTEND

Performance:
├─ Cache hit: ~5ms response
├─ Cache miss: ~50-100ms response (includes DB query)
└─ Cache invalidation: Manual on data update
```

---

### 5️⃣ JOB QUEUE FLOW (BullMQ)

```
BACKGROUND TASKS
│
├─ Email verification
├─ Password reset emails
├─ Report generation
├─ Data exports
└─ etc.

FLOW:
FRONTEND/BACKEND EVENT
│
└─► ADD TO QUEUE
    │
    └─► BULLMQ (uses Redis)
        │
        ├─ Store job data: {...}
        ├─ Set status: PENDING
        └─ Add to queue: "mail"
           │
           ├─► PROCESSOR picks up job
           │   │
           │   ├─ Process (e.g., send email)
           │   │  └─ External API call
           │   │
           │   └─ Update status: COMPLETED/FAILED
           │      │
           │      └─ Store result in Redis
           │
           └─► BACKEND polls for completion
               │
               └─ Notify FRONTEND (via WebSocket or polling)
```

---

## 🔄 Data Persistence Verification

```
┌─────────────────────────────────────────┐
│ STEP 1: CREATE DATA                      │
│ Frontend form → API → Database ✓         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ STEP 2: QUERY DATA                       │
│ Backend query → Database → Frontend ✓   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ STEP 3: UPDATE DATA                      │
│ Frontend update → API → Database ✓      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ STEP 4: RESTART SERVICES                 │
│ docker-compose restart backend           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ STEP 5: VERIFY DATA PERSISTS             │
│ Query database → Data still there ✓     │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
FRONTEND
  │
  ├─ Input validation (client-side)
  │  └─ Email format, password strength
  │
  └─► NGINX
     │
     ├─ CORS validation
     │  └─ Only allow requests from authorized origins
     │
     ├─ SSL/TLS encryption (HTTPS)
     │  └─ Data encrypted in transit
     │
     ├─ Rate limiting
     │  └─ Prevent brute force attacks
     │
     ├─ Security headers (HSTS, CSP, etc.)
     │  └─ Prevent common web attacks
     │
     └─► BACKEND
        │
        ├─ Request validation (server-side)
        │  └─ Joi schema validation
        │
        ├─ JWT authentication
        │  └─ Verify token signature & expiry
        │
        ├─ Authorization checks
        │  └─ User can only access own data
        │
        ├─ Bcrypt password hashing
        │  └─ Never store plain-text passwords
        │
        └─► DATABASE
           │
           ├─ Encrypted password storage
           ├─ Database access control
           └─ Transaction integrity
```

---

## 📈 System Components & Their Roles

| Component | Port | Role | Data Flow |
|-----------|------|------|-----------|
| **Nginx** | 80, 443 | Reverse proxy, SSL, rate limiting, caching | HTTP(S) IN → Containers OUT |
| **Frontend** | 5173 | React SPA, user interface | User → Browser → Nginx → Backend |
| **Backend** | 3000 | Node.js API, business logic | Frontend ← API ← DB/Cache |
| **PostgreSQL** | 5432 | Persistent data storage | Backend ↔ Database |
| **Redis** | 6379 | Cache & session store | Backend ↔ Redis |
| **BullMQ** | (Redis) | Job queue | Backend → Queue → Workers |

---

## 🔀 Request/Response Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST CYCLE (200ms)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (5ms)                                              │
│  └─ Prepare request                                          │
│     - Validate input                                         │
│     - Add JWT token                                          │
│     - Send HTTP request                                      │
│                                                              │
│  Network Transit (2ms)                                       │
│  └─ Encrypted TLS connection to Nginx                        │
│                                                              │
│  Nginx (1ms)                                                 │
│  └─ Route request to backend                                 │
│     - Check CORS                                             │
│     - Rate limiting                                          │
│     - Forward request                                        │
│                                                              │
│  Backend Processing (150ms)                                  │
│  ├─ Parse request (1ms)                                      │
│  ├─ Validate JWT (2ms)                                       │
│  ├─ Check cache (5ms)                                        │
│  │  └─ Cache miss? Query database (100ms)                    │
│  ├─ Process business logic (30ms)                            │
│  └─ Prepare response (12ms)                                  │
│                                                              │
│  Nginx (1ms)                                                 │
│  └─ Add security headers                                     │
│     - Cache if applicable                                    │
│                                                              │
│  Network Transit (2ms)                                       │
│  └─ Send encrypted response                                  │
│                                                              │
│  Frontend (36ms)                                             │
│  └─ Receive response                                         │
│     - Parse JSON                                             │
│     - Update state                                           │
│     - Re-render UI                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Integration Points to Test

| Integration | Test | Expected |
|-------------|------|----------|
| **Frontend → Nginx** | Access http://localhost/ | HTML page loads |
| **Frontend → Backend** | fetch('/api/v1/auth/login') | 200 + token |
| **Backend → Database** | Create user via API | User appears in DB |
| **Backend → Redis** | Cache data | Key stored in Redis |
| **Backend → Nginx** | All routes accessible | Reverse proxy working |
| **End-to-End** | Register → Update → Verify DB | Data persists |

---

## ✅ Verification Checklist

- [ ] All services running (`docker-compose ps`)
- [ ] Health endpoints responding
- [ ] Can register user via API
- [ ] User created in database
- [ ] User can login and get token
- [ ] Protected endpoints require valid token
- [ ] User data updates reflected in database
- [ ] Data persists after service restart
- [ ] No CORS errors in browser console
- [ ] No database connection errors in logs

---

**Last Updated**: April 13, 2026
**Architecture**: Microservices with Docker Compose
**Data Store**: PostgreSQL + Redis
**API Framework**: Express.js
**Frontend Framework**: React + Vite
