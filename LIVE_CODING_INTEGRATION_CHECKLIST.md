# Live Coding Platform - Integration Checklist

## 🎯 Integration Status: READY ✅

**What's Completed:**
- ✅ Backend services (LiveCodingService, Judge0Service)
- ✅ Database schema (15 tables)
- ✅ 4 controllers (32 API endpoints)
- ✅ API routes
- ✅ Frontend editor component
- ✅ Complete documentation
- ✅ Setup guides

**What Needs Integration:**
- Your Express app.ts file
- Your database
- Your frontend routes
- Test and verify

---

## 🚀 5-Step Integration Plan

### ✅ Step 1: Update Backend app.ts

**File to Edit:** `backend/src/app.ts`

**Add these imports at the TOP:**
```typescript
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import LiveCodingService from '@services/LiveCodingService';
import liveCodingRoutes from '@api/routes/live-coding.routes';
import { Redis } from 'ioredis';
```

**Replace your app initialization with:**
```typescript
// Create HTTP server (instead of app.listen)
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1, // Separate DB for live coding
});

// Initialize Live Coding Service
const liveCodingService = new LiveCodingService(io, redis);

// Make globally available
(global as any).io = io;
(global as any).liveCodingService = liveCodingService;

// Register API routes
app.use('/api/v1', liveCodingRoutes);

// Health check
app.get('/api/v1/health/live-coding', (req, res) => {
  res.json({
    status: 'ok',
    service: 'live-coding',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`🎮 Server running on port ${PORT}`);
  logger.info(`📡 Live Coding Platform ready`);
  logger.info(`🔴 Socket.IO listening on ws://localhost:${PORT}`);
});

export { httpServer, io, liveCodingService };
```

**Checklist:**
- [ ] Add all imports
- [ ] Create httpServer from app
- [ ] Initialize SocketIOServer with CORS
- [ ] Create Redis connection on db 1
- [ ] Initialize LiveCodingService
- [ ] Register liveCodingRoutes under /api/v1
- [ ] Add health check endpoint
- [ ] Listen on httpServer instead of app
- [ ] Save file

---

### ✅ Step 2: Update Backend .env

**File to Edit:** `backend/.env`

**Add these variables:**
```env
# === LIVE CODING PLATFORM ===

# Feature Flags
ENABLE_LIVE_CODING=true
SOCKET_IO_ENABLED=true

# Judge0 Code Execution (https://rapidapi.com/judge0/api/judge0)
JUDGE0_API_URL=https://judge0-api.p.rapidapi.com
JUDGE0_API_KEY=YOUR_JUDGE0_API_KEY
JUDGE0_API_HOST=judge0-api.p.rapidapi.com
JUDGE0_TIMEOUT=5000
JUDGE0_MAX_CODE_LENGTH=10000

# Redis Configuration (Live Coding State)
REDIS_DB_LIVE_CODING=1

# Socket.IO Configuration
SOCKET_IO_PORT=3000
SOCKET_IO_PATH=/socket.io
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Interview Configuration
MAX_EXECUTION_TIME=5000
MAX_ROOM_DURATION_MINUTES=120
MAX_ROOM_SIZE=3
ENABLE_WEBRTC=true
RECORDING_ENABLED=false

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Action Items:**
- [ ] Copy section above to .env
- [ ] Update JUDGE0_API_KEY with your RapidAPI key
- [ ] Update FRONTEND_URL if different
- [ ] Verify REDIS_HOST/PORT already set
- [ ] Save file

**Get Judge0 API Key:**
1. Go to https://rapidapi.com/judge0/api/judge0
2. Subscribe to free tier
3. Copy API Key
4. Add to .env

---

### ✅ Step 3: Run Database Migration

**Terminal Command:**
```bash
cd backend

# Option A: Using Prisma CLI
npx prisma migrate dev --name add_live_coding_schema

# Option B: Using psql directly
psql "postgresql://user:password@host/dbname" < prisma/migrations/live_coding_schema.sql
```

**Expected Output:**
```
✔ Prisma Migrate applied the migration live_coding_schema
✔ Generated Prisma Client
```

**Verify in Prisma Studio:**
```bash
npx prisma studio
# Opens browser at http://localhost:5555
# Look for: coding_problems, submissions, interview_rooms, etc.
```

**Checklist:**
- [ ] Run migration command
- [ ] Check for success message
- [ ] Open Prisma Studio
- [ ] Verify 15 tables exist
- [ ] Check relationships are correct

---

### ✅ Step 4: Seed Initial Problems (Optional)

**Quick Seed Script:**

Create `backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/core/logger/logger';

const prisma = new PrismaClient();

const problems = [
  {
    title: 'Two Sum',
    description: 'Find two numbers that add up to target',
    difficulty: 'easy',
    category: 'arrays',
    tags: ['hash-map', 'array'],
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]',
        isHidden: false,
      },
      {
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
        isHidden: true,
      },
    ],
  },
  {
    title: 'Reverse String',
    description: 'Reverse a string in-place',
    difficulty: 'easy',
    category: 'strings',
    tags: ['string', 'two-pointer'],
    testCases: [
      {
        input: '"hello"',
        expectedOutput: '"olleh"',
        isHidden: false,
      },
    ],
  },
];

async function main() {
  for (const problem of problems) {
    const created = await prisma.coding_problems.create({
      data: {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty as any,
        category: problem.category,
        tags: problem.tags,
        test_case_count: problem.testCases.length,
        acceptance_rate: 0,
      },
    });

    for (const tc of problem.testCases) {
      await prisma.problem_test_cases.create({
        data: {
          problem_id: created.id,
          input_data: tc.input,
          expected_output: tc.expectedOutput,
          is_hidden: tc.isHidden,
        },
      });
    }

    await prisma.problem_statistics.create({
      data: {
        problem_id: created.id,
        total_submissions: 0,
        total_accepted: 0,
      },
    });

    logger.info(`✅ Created problem: ${problem.title}`);
  }
}

main()
  .then(() => {
    logger.info('✅ Seed completed');
    process.exit(0);
  })
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
```

**Run seed:**
```bash
cd backend
npx ts-node prisma/seed.ts
```

**Checklist:**
- [ ] Create seed.ts file
- [ ] Add your problems
- [ ] Run seed
- [ ] Verify in Prisma Studio (2 problems should appear)

---

### ✅ Step 5: Frontend Integration

**Create file:** `frontend/src/pages/LiveCodingPage.tsx`

```typescript
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveCodingEditor from '../app/components/LiveCodingEditor';
import { useAuth } from '../services/auth'; // Your auth hook

export const LiveCodingPage: React.FC = () => {
  const { roomId, problemId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!roomId || !problemId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-red-400">Invalid room or problem ID</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <LiveCodingEditor
        roomId={roomId}
        userId={user.id}
        userName={user.name}
        role={user.role as 'interviewer' | 'candidate'}
        problemId={problemId}
        language="python"
        onCodeChange={(code) => {
          console.log('Code changed');
        }}
        onSubmit={(code, language) => {
          console.log('Code submitted:', { language });
        }}
        onRun={(code, language, input) => {
          console.log('Code executed');
        }}
      />
    </div>
  );
};

export default LiveCodingPage;
```

**Update routes:** `frontend/src/app/App.tsx`

```typescript
import LiveCodingPage from '../pages/LiveCodingPage';

// Inside your Routes
<Routes>
  {/* ... other routes */}
  <Route
    path="/interview/:roomId/problem/:problemId"
    element={<LiveCodingPage />}
  />
</Routes>
```

**Checklist:**
- [ ] Create LiveCodingPage.tsx
- [ ] Add route to App.tsx
- [ ] Verify auth hook imported correctly
- [ ] Test route navigation

---

## 🧪 Testing Phase

### Backend Testing

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Test endpoints:**

```bash
# 1. Health check
curl http://localhost:3000/api/v1/health/live-coding

# 2. List problems
curl http://localhost:3000/api/v1/problems \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create room
curl -X POST http://localhost:3000/api/v1/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "interviewerId": "test-interviewer",
    "candidateId": "test-candidate",
    "problemId": "problem-uuid"
  }'

# 4. Join room
curl -X POST http://localhost:3000/api/v1/rooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "roomCode": "ABC123",
    "userId": "test-candidate",
    "role": "candidate"
  }'
```

**Checklist:**
- [ ] Health check returns 200
- [ ] List problems works
- [ ] Create room returns room_code
- [ ] Join room updates status to in_progress

### Frontend Testing

**Terminal 3:**
```bash
cd frontend
npm run dev
```

**Browser Test:**
1. Open http://localhost:5173
2. Navigate to `/interview/room-id/problem-id`
3. Code editor should load
4. Try typing code
5. Click "Run" button
6. Should see execution result

**Checklist:**
- [ ] Page loads without errors
- [ ] Editor textarea visible
- [ ] Language dropdown works
- [ ] "Run" button responds
- [ ] Output panel shows results

---

## ✅ Final Verification

### Run All Tests

```bash
# Backend: Verify all services start
npm --prefix backend run dev

# Check logs for:
# ✓ "🎮 Server running on port 3000"
# ✓ "📡 Live Coding Platform ready"
# ✓ "🔴 Socket.IO listening on ws://localhost:3000"

# Frontend: Verify build succeeds
npm --prefix frontend run build

# Check for:
# ✓ Build completes without errors
# ✓ "dist" folder created
```

### API Verification Checklist

- [ ] GET  /api/v1/problems works
- [ ] GET  /api/v1/problems/:id works
- [ ] POST /api/v1/rooms works
- [ ] POST /api/v1/rooms/join works
- [ ] POST /api/v1/submissions/run works
- [ ] POST /api/v1/submissions/submit works
- [ ] GET  /api/v1/scorecards/candidate/:id works
- [ ] Socket.IO connection successful

### Frontend Verification Checklist

- [ ] Component imports without errors
- [ ] Code changes sync between tabs
- [ ] Run code executes properly
- [ ] Output appears in result panel
- [ ] Participant list shows current users
- [ ] Language selector works
- [ ] Submit button is visible

---

## 🚨 Troubleshooting

### Issue: "Cannot find module '@services/LiveCodingService'"

**Solution:** Verify tsconfig.json has path alias:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@services/*": ["src/services/*"]
    }
  }
}
```

### Issue: "Socket.IO is not connected"

**Solution:** Check CORS configuration:
```typescript
cors: {
  origin: process.env.FRONTEND_URL, // Must match exactly
  methods: ['GET', 'POST'],
  credentials: true,
}
```

### Issue: "Judge0 API returns 401"

**Solution:** Verify RapidAPI key:
```bash
echo $JUDGE0_API_KEY
# Should output your API key, not empty
```

### Issue: "Database migration fails"

**Solution:** Check connection:
```bash
npx prisma db execute --stdin < /dev/null
echo $DATABASE_URL
```

---

## 📊 Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Step 1: Update app.ts | 15 min | Ready |
| Step 2: .env setup | 10 min | Ready |
| Step 3: DB migration | 10 min | Ready |
| Step 4: Seed problems | 5 min | Ready |
| Step 5: Frontend routes | 15 min | Ready |
| Backend testing | 15 min | Ready |
| Frontend testing | 15 min | Ready |
| **Total** | **1.5 hours** | ✅ Ready |

---

## 📞 Support Files

- **API Details:** `backend/LIVE_CODING_API.md`
- **Setup Guide:** `LIVE_CODING_SETUP.md`
- **Implementation Summary:** `LIVE_CODING_IMPLEMENTATION_SUMMARY.md`

---

## ✨ Next: Go Live!

After completing all steps:

1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 5173
3. ✅ Database with 15 tables
4. ✅ Socket.IO connected
5. ✅ All 32 endpoints working

**Your Live Coding Interview Platform is LIVE!** 🎉

---

**Status:** All components ready for integration
**Last Updated:** January 2024
**Estimated Integration Time:** 1.5-2 hours
