# Live Coding Interview Platform - API Documentation

## Overview

Complete REST API for real-time collaborative coding interviews with automatic code evaluation, scoring, and feedback.

## Base URL

```
http://localhost:3000/api/v1
```

All endpoints require JWT authentication unless otherwise specified.

---

## API Endpoints

### 1. CODING PROBLEMS

#### List All Problems
```http
GET /problems?difficulty=easy&category=arrays&search=sort&limit=20&offset=0&sortBy=created_at&sortOrder=desc
```

**Query Parameters:**
- `difficulty` (optional): `easy`, `medium`, `hard`
- `category` (optional): Problem category
- `search` (optional): Search in title/description
- `limit` (optional): Default 20
- `offset` (optional): Default 0
- `sortBy` (optional): Default `created_at`
- `sortOrder` (optional): `asc` or `desc`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Two Sum",
      "description": "...",
      "difficulty": "easy",
      "category": "arrays",
      "tags": ["hash-map", "two-pointer"],
      "test_case_count": 10,
      "acceptance_rate": 85.5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Problem Details
```http
GET /problems/{problemId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return the indices of the two numbers.",
    "difficulty": "easy",
    "category": "arrays",
    "tags": ["hash-map"],
    "test_case_count": 10,
    "acceptance_rate": 85.5,
    "time_limit_ms": 2000,
    "memory_limit_mb": 256,
    "problem_test_cases": [
      {
        "id": "uuid",
        "input_data": "nums = [2,7,11,15], target = 9",
        "expected_output": "[0,1]",
        "is_hidden": false
      }
    ],
    "statistics": {
      "total_submissions": 1000,
      "total_accepted": 850,
      "average_runtime_ms": 45.2,
      "average_memory_mb": 28.5
    }
  }
}
```

#### Create Problem (Admin)
```http
POST /problems
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "easy",
  "category": "arrays",
  "tags": ["hash-map", "two-pointer"],
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "expectedOutput": "[0,1]",
      "isHidden": false
    },
    {
      "input": "nums = [3,2,4], target = 6",
      "expectedOutput": "[1,2]",
      "isHidden": true
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { ...problem_object }
}
```

#### Search Problems
```http
GET /problems/search?query=sort&limit=10
```

---

### 2. INTERVIEW ROOMS

#### Create Interview Room
```http
POST /rooms
Content-Type: application/json

{
  "interviewerId": "user-uuid",
  "candidateId": "user-uuid",
  "problemId": "problem-uuid"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "room_code": "ABC123",
    "interviewer_id": "...",
    "candidate_id": "...",
    "problem_id": "...",
    "status": "scheduled",
    "start_time": null,
    "end_time": null,
    "recording_url": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Join Interview Room
```http
POST /rooms/join
Content-Type: application/json

{
  "roomCode": "ABC123",
  "userId": "user-uuid",
  "role": "candidate"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room-uuid",
    "roomCode": "ABC123",
    "status": "in_progress",
    "problemId": "problem-uuid"
  }
}
```

#### Get Room Details
```http
GET /rooms/{roomId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "room_code": "ABC123",
    "status": "in_progress",
    "interviewer_id": "...",
    "candidate_id": "...",
    "problem_id": "...",
    "start_time": "2024-01-15T10:35:00Z",
    "coding_problems": {
      "id": "...",
      "title": "Two Sum",
      "description": "...",
      "difficulty": "easy"
    },
    "room_participants": [
      {
        "user_id": "...",
        "role": "interviewer",
        "joined_at": "2024-01-15T10:35:00Z",
        "is_active": true
      }
    ]
  }
}
```

#### Get Active Participants
```http
GET /rooms/{roomId}/participants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "role": "interviewer",
      "joined_at": "2024-01-15T10:35:00Z",
      "is_active": true,
      "auth_users": {
        "id": "uuid",
        "email": "interviewer@example.com",
        "name": "John Doe"
      }
    }
  ]
}
```

#### Get Room Messages (Chat History)
```http
GET /rooms/{roomId}/messages?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "room_id": "...",
      "sender_id": "...",
      "message_type": "text",
      "content": "Your solution looks good!",
      "metadata": "{}",
      "created_at": "2024-01-15T10:45:00Z",
      "auth_users": {
        "id": "...",
        "name": "John Doe"
      }
    }
  ]
}
```

#### Send Room Message
```http
POST /rooms/{roomId}/messages
Content-Type: application/json

{
  "userId": "user-uuid",
  "message": "Your solution looks good!",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...message_object }
}
```

#### End Interview Room
```http
POST /rooms/{roomId}/end
Content-Type: application/json

{
  "userId": "interviewer-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "room-uuid",
    "status": "ended",
    "end_time": "2024-01-15T11:15:00Z"
  }
}
```

#### Get User's Interview History
```http
GET /users/{userId}/interviews?role=all&limit=20&offset=0
```

---

### 3. SUBMISSIONS

#### Run Code (with custom input)
```http
POST /submissions/run
Content-Type: application/json

{
  "code": "def twoSum(nums, target):\n    return [0, 1]",
  "language": "python",
  "input": "nums = [2,7,11,15]\ntarget = 9",
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Accepted",
    "stdout": "[0, 1]",
    "stderr": "",
    "compile_output": "",
    "time": 0.045,
    "memory": 28.5,
    "exitCode": 0
  }
}
```

**Supported Languages:**
- python (71)
- c (50)
- cpp (54)
- java (62)
- javascript (63)
- typescript (74)
- csharp (51)
- ruby (72)
- go (60)
- rust (73)

#### Submit Code (evaluate against test cases)
```http
POST /submissions/submit
Content-Type: application/json

{
  "code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
  "language": "python",
  "problemId": "problem-uuid",
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
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
    "passPercentage": 100,
    "runtime": 0.234,
    "memory": 28.5,
    "testResults": [
      {
        "passed": true,
        "status": "Accepted",
        "input": "nums = [2,7,11,15], target = 9",
        "expectedOutput": "[0,1]",
        "actualOutput": "[0, 1]",
        "executionTime": 0.045,
        "memory": 28.5
      }
    ]
  }
}
```

**Possible Statuses:**
- `accepted` - All test cases passed
- `wrong_answer` - Output doesn't match expected
- `time_limit_exceeded` - Execution exceeded time limit
- `runtime_error` - Code crashed during execution
- `compilation_error` - Code failed to compile

#### Get Submission Details
```http
GET /submissions/{submissionId}
```

#### Get User's Submissions for Problem
```http
GET /submissions/user/{userId}/problem/{problemId}?limit=20&offset=0
```

#### Get All Submissions in Room
```http
GET /rooms/{roomId}/submissions
```

#### Get User Statistics
```http
GET /users/{userId}/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 100,
    "acceptedSubmissions": 75,
    "solvedProblems": 42,
    "acceptanceRate": "75.00",
    "byDifficulty": [
      {
        "difficulty": "easy",
        "solved": 25,
        "attempted": 30
      },
      {
        "difficulty": "medium",
        "solved": 12,
        "attempted": 25
      }
    ]
  }
}
```

---

### 4. SCORING & FEEDBACK

#### Create Scorecard
```http
POST /scorecards
Content-Type: application/json

{
  "roomId": "room-uuid",
  "candidateId": "user-uuid",
  "interviewerId": "user-uuid",
  "dsa_score": 8.5,
  "communication_score": 7.5,
  "code_quality_score": 8.0,
  "optimization_score": 7.0,
  "test_case_pass_score": 9.0,
  "feedback_text": "Great problem-solving approach, could improve on edge cases",
  "recommendation": "shortlist",
  "interview_feedback": {
    "codeReviewScore": 8,
    "problemUnderstandingScore": 9,
    "approachClarityScore": 8,
    "edgeCaseHandlingScore": 7,
    "codeReviewComment": "Clean and readable code",
    "problemUnderstandingComment": "Excellent understanding",
    "approachClarityComment": "Explained approach clearly",
    "edgeCaseHandlingComment": "Missed some edge cases"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "scorecard-uuid",
    "interview_room_id": "room-uuid",
    "candidate_id": "user-uuid",
    "interviewer_id": "user-uuid",
    "dsa_score": 8.5,
    "communication_score": 7.5,
    "code_quality_score": 8.0,
    "optimization_score": 7.0,
    "test_case_pass_score": 9.0,
    "overall_score": 8.0,
    "recommendation": "shortlist",
    "feedback_text": "...",
    "created_at": "2024-01-15T11:45:00Z"
  }
}
```

**Score Scale:** 0-10 (auto-recommendations: 8+ = shortlist, 6-8 = maybe, <6 = reject)

#### Get Scorecard by Room
```http
GET /scorecards/room/{roomId}
```

#### Get Candidate Scorecards
```http
GET /scorecards/candidate/{candidateId}?limit=20&offset=0&sortBy=created_at
```

#### Get Interviewer's Evaluations
```http
GET /scorecards/interviewer/{interviewerId}?limit=20&offset=0
```

**Response includes:**
- Scorecard list
- Recommendation statistics (count by shortlist/maybe/reject)

#### Generate Interview Report
```http
GET /scorecards/{roomId}/report
```

**Response:**
```json
{
  "success": true,
  "data": {
    "candidate": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "problem": {
      "title": "Two Sum",
      "difficulty": "easy"
    },
    "scores": {
      "dsa": 8.5,
      "communication": 7.5,
      "codeQuality": 8.0,
      "optimization": 7.0,
      "testCasePass": 9.0,
      "overall": 8.0
    },
    "recommendation": "shortlist",
    "detailedFeedback": { ...feedback_object },
    "submissions": [ ...],
    "activities": [ ...],
    "generatedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

## WebSocket Events (Socket.IO)

### Connection Events

#### Join Room
```javascript
socket.emit('join-room', {
  roomId: 'room-uuid',
  userId: 'user-uuid',
  userName: 'John Doe',
  role: 'candidate',
  problemId: 'problem-uuid'
});

// Receive
socket.on('room-state', (data) => {
  // data: { code, language, participants, version }
});

socket.on('participant-joined', (data) => {
  // data: { userId, userName, role, color }
});
```

### Real-time Code Collaboration

#### Code Change
```javascript
socket.emit('code-change', {
  userId: 'user-uuid',
  change: {
    startLine: 5,
    startColumn: 10,
    endLine: 5,
    endColumn: 15,
    text: 'newCode',
    removedText: 'oldCode'
  },
  timestamp: Date.now(),
  version: 10
});

// Receive
socket.on('code-changed', (data) => {
  // data: { userId, change, version, timestamp }
});
```

#### Cursor Update
```javascript
socket.emit('cursor-update', {
  line: 10,
  column: 25
});

socket.on('cursor-updated', (data) => {
  // data: { userId, line, column }
});
```

#### Typing Indicator
```javascript
socket.emit('typing-start', {});
socket.emit('typing-end', {});

socket.on('typing-started', (data) => {
  // data: { userId }
});

socket.on('typing-ended', (data) => {
  // data: { userId }
});
```

### Code Execution

#### Run Code
```javascript
socket.emit('run-code', {
  code: 'def test(): return 42',
  language: 'python',
  input: ''
});

socket.on('code-executed', (result) => {
  // result: { status, stdout, stderr, time, memory }
});
```

#### Submit Code
```javascript
socket.emit('submit-code', {
  code: 'def test(): return 42',
  language: 'python',
  problemId: 'problem-uuid'
});

socket.on('submission-result', (result) => {
  // result: { userId, status, passedTests, totalTests, timestamp }
});
```

### Chat Messages

#### Send Message
```javascript
socket.emit('send-message', {
  message: 'Great approach!'
});

socket.on('message-received', (data) => {
  // data: { userId, message, timestamp }
});
```

### Disconnect

#### Leave Room
```javascript
socket.on('participant-left', (data) => {
  // data: { userId }
});
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Additional details (if available)"
}
```

**Common Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

JWT Payload:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "student|recruiter|admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## Rate Limiting

- 100 requests per minute per user
- Code execution limited to 5 concurrent submissions
- File uploads limited to 10MB

---

## Pagination

List endpoints support pagination:
- `limit`: Number of records (default: 20, max: 100)
- `offset`: Starting position (default: 0)

**Response format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 500,
    "limit": 20,
    "offset": 0
  }
}
```

