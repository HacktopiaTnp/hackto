# Live Coding Interview Platform - Setup & Integration Guide

## 🚀 Quick Start

### Phase 1: Prerequisites (Completion Status: ✅ 90%)

**What's Done:**
- ✅ Database schema created with 15 tables
- ✅ Judge0 code execution service implemented
- ✅ Socket.IO real-time collaboration service
- ✅ All backend controllers (Interview Rooms, Submissions, Problems, Scoring)
- ✅ API documentation with all endpoints
- ✅ Frontend LiveCodingEditor component

**What's Remaining:**
- 🔄 Integrate controllers into Express app
- 🔄 Set up Socket.IO Server configuration
- 🔄 Database migration/seeding
- 🔄 Frontend integration into main App

---

## 📋 Integration Checklist

### 1. Backend Integration (Express App)

**File: `backend/src/app.ts`**

```typescript
// Add these imports at the top
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import LiveCodingService from '@services/LiveCodingService';
import liveCodingRoutes from '@api/routes/live-coding.routes';
import { Redis } from 'ioredis';

// Initialize HTTP server with Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize Redis for real-time features
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 1, // Separate DB for live coding state
});

// Initialize Live Coding Service
const liveCodingService = new LiveCodingService(io, redis);

// Make io and liveCodingService globally available
(global as any).io = io;
(global as any).liveCodingService = liveCodingService;

// Register routes
app.use('/api/v1', liveCodingRoutes);

// Health check for live coding endpoints
app.get('/api/v1/health/live-coding', (req, res) => {
  res.json({
    status: 'ok',
    service: 'live-coding',
    timestamp: new Date().toISOString(),
  });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`🎮 Server running on port ${PORT}`);
  logger.info(`🔴 Live Coding Platform ready`);
  logger.info(`📡 Socket.IO listening on ws://localhost:${PORT}`);
});

export { httpServer, io, liveCodingService };
```

---

### 2. Database Migration

**Create migration file:**
```bash
npx prisma migrate dev --name add_live_coding_schema
```

**Or run SQL directly:**
```bash
cd backend
psql "postgresql://user:password@host/dbname" < prisma/migrations/live_coding_schema.sql
```

**Verify schema:**
```bash
npx prisma db push
npx prisma studio
```

---

### 3. Environment Configuration

**File: `backend/.env`**

Add/verify these variables:

```env
# Live Coding Features
ENABLE_LIVE_CODING=true
LIVE_CODING_DB=postgres
LIVE_CODING_CACHE=redis

# Socket.IO Configuration
SOCKET_IO_PORT=3000
SOCKET_IO_PATH=/socket.io
SOCKET_IO_ENABLED=true
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Judge0 Code Execution Engine
JUDGE0_API_URL=https://judge0-api.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_API_HOST=judge0-api.p.rapidapi.com
JUDGE0_DEFAULT_LANGUAGE=71
JUDGE0_TIMEOUT=5000
JUDGE0_MAX_CODE_LENGTH=10000

# Interview Configuration
MAX_EXECUTION_TIME=5000
MAX_ROOM_DURATION_MINUTES=120
MAX_ROOM_SIZE=3
ENABLE_WEBRTC=true
RECORDING_ENABLED=false

# Redis for real-time state
REDIS_DB_LIVE_CODING=1

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

---

### 4. Frontend Integration

**File: `frontend/src/app/App.tsx`**

```typescript
import LiveCodingEditor from './components/LiveCodingEditor';
import { useParams } from 'react-router-dom';

// In your routing
export function LiveCodingPage() {
  const { roomId } = useParams();
  const { user } = useAuth(); // Your auth hook

  if (!roomId || !user) {
    return <div>Loading...</div>;
  }

  return (
    <LiveCodingEditor
      roomId={roomId}
      userId={user.id}
      userName={user.name}
      role={user.role as 'interviewer' | 'candidate'}
      problemId={params.problemId}
      language="python"
      onCodeChange={(code) => console.log('Code changed:', code)}
      onSubmit={(code, language) => console.log('Submitted:', { code, language })}
      onRun={(code, language, input) => console.log('Running:', { code, language, input })}
    />
  );
}
```

**Add route:**
```typescript
// frontend/src/app/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/interview/:roomId/problem/:problemId" element={<LiveCodingPage />} />
</Routes>
```

---

### 5. Seed Initial Problems

**Create seed script:**
```typescript
// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

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
        isHidden: false,
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
  // Add more problems...
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
        average_runtime_ms: 0,
        average_memory_mb: 0,
        compilation_errors: 0,
        runtime_errors: 0,
        time_limit_exceeded: 0,
        wrong_answer: 0,
      },
    });

    console.log(`✅ Created problem: ${problem.title}`);
  }
}

main()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

**Run seed:**
```bash
cd backend
npx prisma db seed
```

---

### 6. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Verify Services:**
```bash
# Check backend health
curl http://localhost:3000/api/v1/health

# Check live coding service
curl http://localhost:3000/api/v1/health/live-coding

# Check frontend
open http://localhost:5173
```

---

## 📊 Interview Room Workflow

### 1. Create Room (Recruiter)

```bash
curl -X POST http://localhost:3000/api/v1/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "interviewerId": "recruiter-uuid",
    "candidateId": "candidate-uuid",
    "problemId": "problem-uuid"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "room_code": "ABC123",
    "status": "scheduled"
  }
}
```

### 2. Candidate Joins (Candidate)

```bash
curl -X POST http://localhost:3000/api/v1/rooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CANDIDATE_TOKEN" \
  -d '{
    "roomCode": "ABC123",
    "userId": "candidate-uuid",
    "role": "candidate"
  }'
```

### 3. Real-Time Collaboration Starts

- Both users connect via Socket.IO
- Code changes sync in real-time
- Cursor positions visible
- Chat available

### 4. Run Code

```bash
curl -X POST http://localhost:3000/api/v1/submissions/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "code": "def test():\n  return 42",
    "language": "python",
    "input": "",
    "roomId": "room-uuid",
    "userId": "user-uuid"
  }'
```

### 5. Submit Code

```bash
curl -X POST http://localhost:3000/api/v1/submissions/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "code": "def twoSum(nums, target):\n  ...",
    "language": "python",
    "problemId": "problem-uuid",
    "roomId": "room-uuid",
    "userId": "candidate-uuid"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission-uuid",
    "status": "accepted",
    "passedTests": 10,
    "totalTests": 10,
    "passPercentage": 100
  }
}
```

### 6. Create Scorecard

```bash
curl -X POST http://localhost:3000/api/v1/scorecards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "roomId": "room-uuid",
    "candidateId": "candidate-uuid",
    "interviewerId": "interviewer-uuid",
    "dsa_score": 8.5,
    "communication_score": 7.5,
    "code_quality_score": 8.0,
    "optimization_score": 7.0,
    "test_case_pass_score": 9.0,
    "feedback_text": "Great approach!",
    "recommendation": "shortlist"
  }'
```

### 7. End Room

```bash
curl -X POST http://localhost:3000/api/v1/rooms/{roomId}/end \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INTERVIEWER_TOKEN" \
  -d '{
    "userId": "interviewer-uuid"
  }'
```

---

## 🧪 Testing

### Manual Testing

1. **Create two test accounts:**
   - Interviewer: `recruiter@test.com`
   - Candidate: `candidate@test.com`

2. **Recruiter Dashboard:**
   - Create interview with problem
   - Get room code

3. **Candidate Dashboard:**
   - Join room with code
   - Start coding

4. **Verify Real-time Sync:**
   - Edit code in one browser
   - See updates in other browser instantly

5. **Test Code Execution:**
   - Click "Run" button
   - Verify Judge0 execution
   - Check output panel

6. **Test Submission:**
   - Click "Submit"
   - Verify test case evaluation
   - Check acceptance status

### API Testing (Postman/Insomnia)

Import the included Postman collection: `LIVE_CODING_API.md`

---

## 🔧 Troubleshooting

### Socket.IO Connection Issues

**Problem:** "Failed to connect to Socket.IO"

**Solution:**
```typescript
// Check CORS configuration in backend
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, // Must match frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### Judge0 API Errors

**Problem:** "401 Unauthorized" from Judge0

**Solution:**
```bash
# Verify API key in .env
JUDGE0_API_KEY=your-key
JUDGE0_API_HOST=judge0-api.p.rapidapi.com

# Check RapidAPI dashboard for rate limits
```

### Database Connection

**Problem:** "Prisma connection failed"

**Solution:**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin < /dev/null

# Run migrations
npx prisma migrate deploy
```

### Real-time Code Sync Lag

**Problem:** Code changes delayed between users

**Solution:**
1. Check Redis connection: `redis-cli PING`
2. Verify Socket.IO transport: WebSocket preferred over polling
3. Check network latency: Use `socket.io` debug logs

---

## 📈 Performance Optimization

### Production Deployment

**Backend:**
```bash
# Build TypeScript
npm run build

# Run production
NODE_ENV=production node dist/server.js
```

**Frontend:**
```bash
# Build React
npm run build

# Serve static files
npx serve -s dist
```

### Scaling Considerations

1. **Socket.IO Clustering:**
   - Use Redis adapter for multi-server setup
   - Install: `npm install @socket.io/redis-adapter`

2. **Database Optimization:**
   - Add indexes (already in schema)
   - Use read replicas for statistics queries

3. **Judge0 Load:**
   - Queue submissions if rate limited
   - Implement backoff strategy

---

## 📚 Next Steps

### Phase 2: Enhanced Features
- [ ] WebRTC integration for video/audio
- [ ] Code review inline comments
- [ ] Interview recording and playback
- [ ] Advanced analytics dashboard

### Phase 3: Admin Features
- [ ] Problem difficulty calibration
- [ ] Interview statistics export
- [ ] Candidate ranking
- [ ] Bulk problem import

### Phase 4: Mobile Support
- [ ] React Native app
- [ ] Mobile-optimized UI
- [ ] Offline code caching

---

## 📞 Support

For issues or questions:

1. Check logs: `docker-compose logs backend`
2. Review API docs: `LIVE_CODING_API.md`
3. Check Socket.IO debug: `DEBUG=socket.io npm run dev`
4. Review Judge0 status: `curl https://judge0-api.p.rapidapi.com/status_versions`

---

## 📄 Files Reference

| File | Purpose |
|------|---------|
| `backend/src/services/LiveCodingService.ts` | Socket.IO handler |
| `backend/src/services/Judge0Service.ts` | Code execution |
| `backend/src/modules/interview-rooms/controllers/InterviewRoomController.ts` | Room management |
| `backend/src/modules/submissions/controllers/SubmissionController.ts` | Code submission |
| `backend/src/modules/coding-problems/controllers/ProblemController.ts` | Problem mgmt |
| `backend/src/modules/scoring/controllers/ScorecardController.ts` | Evaluation |
| `backend/src/api/routes/live-coding.routes.ts` | Route registration |
| `frontend/src/app/components/LiveCodingEditor.tsx` | Main component |
| `backend/LIVE_CODING_API.md` | API documentation |
| `prisma/migrations/live_coding_schema.sql` | Database schema |

---

**Last Updated:** January 2024
**Status:** Ready for Integration ✅
