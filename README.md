# Codex Platform | Production-Ready Online Coding & Assessment Platform

Codex is a full-stack, enterprise-grade Online Coding and Assessment Platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Designed as a production-quality system in the vein of LeetCode and HackerRank, Codex features process-isolated code execution, real-time contest leaderboards via WebSockets, candidate technical assessments, streak tracking, automated achievements, and comprehensive administrative telemetry.

---

## 🌟 Key Features

### 💻 Student Experience
- **Interactive Problem Workspace**: Powered by **Monaco Editor**, supporting JavaScript, Python, C++, and Java with theme selection (Dark/Light), code font adjustments, starter code templates, and code reset.
- **Run vs. Submit Architecture**: 
  - **Run Code**: Tests against sample public test cases or custom standard input (`stdin`).
  - **Submit Code**: Evaluates against hidden test suites, enforcing strict time limits, memory caps, and process isolation.
- **Problem Explorer**: Multi-facet filtering by difficulty (Easy, Medium, Hard), topic tags (Arrays, DP, Graphs, Binary Search, etc.), solved status, and debounced instant search.
- **Student Dashboard**: Real-time solved progress breakdown (Recharts donut & meter charts), current and longest streak counters, submission accuracy, and recent activity logs.
- **Public Coding Profile**: GitHub-style 365-day submission activity heatmap, achievement showcase, and contest rating badges.
- **Live Contests**: Server-synchronized countdown timer resistant to client clock tampering, live penalty scoring, and instant WebSocket leaderboard updates.
- **Timed Assessments**: Candidate assessment portal with unique access code verification, examination timers, and automatic grade calculation.

### 🎓 Instructor Experience
- **Problem Authoring Suite**: Create, edit, and publish algorithmic challenges with Markdown descriptions, starter code snippets, hints, editorials, and memory/time limits.
- **Test Case Management**: Configure **Public** (sample cases visible to students) versus **Hidden** (accessible exclusively to the sandbox runner) test cases.
- **Assessment Management**: Generate private assessments, issue access codes, assign problem point weights, and review candidate pass/fail analytics.

### 🛡️ Admin Experience
- **Platform Telemetry**: System-wide statistics for active users, problem difficulties, submissions, and a 7-day submission volume bar chart.
- **User Moderation**: Instant user suspension/activation, role elevation (Student ⇄ Instructor ⇄ Admin), and global search.
- **Live Submission Stream**: Real-time platform submission feed monitoring language, execution times, and verdicts.

---

## 🏗️ System Architecture

Codex enforces strict physical separation between business logic and untrusted user code execution:

```
[ Client: React + Vite + Monaco ]
               │
        HTTP / Socket.IO
               ▼
[ API Server: Node.js + Express (Port 5000) ]
        │                       │
     MongoDB                 REST API
 (Data Storage)                 │
                                ▼
         [ Execution Service: Node.js (Port 5050) ]
                                │
                        Temporary Sandbox
                        ├── solution.js / solution.py
                        ├── Restricted Child Process
                        └── Time / Memory Enforcer
```

---

## 📁 Project Structure

```
codex-platform/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, DifficultyBadge, ActivityHeatmap, ProtectedRoute
│   │   ├── context/            # AuthContext, ThemeContext, SocketContext
│   │   ├── pages/              # Home, Login, Register, ProblemList, ProblemDetail, ContestList,
│   │   │                       # ContestDetail, AssessmentList, AssessmentArena, Leaderboard,
│   │   │                       # Profile, StudentDashboard, InstructorPortal, AdminDashboard
│   │   ├── services/           # api.js, authService, problemService, submissionService, etc.
│   │   └── App.jsx             # Router and layouts
│   ├── index.html
│   └── package.json
│
├── server/                     # Express.js REST API & WebSocket Server
│   ├── src/
│   │   ├── config/             # db.js (MongoDB connection)
│   │   ├── controllers/        # auth, problem, submission, contest, assessment, admin controllers
│   │   ├── middleware/         # auth (JWT & RBAC), errorHandler, rateLimiter
│   │   ├── models/             # User, Problem, Submission, Contest, Assessment, Achievement, Notification
│   │   ├── routes/             # authRoutes, problemRoutes, submissionRoutes, etc.
│   │   ├── services/           # achievementService, contestScoringService
│   │   ├── utils/              # seed.js, seedData.js, jwt.js
│   │   └── server.js           # Server entry point & Socket.IO initialization
│   ├── tests/                  # Jest & Supertest API test suite
│   └── package.json
│
├── execution-service/          # Isolated Code Execution Service
│   ├── src/
│   │   ├── runners/            # javascriptRunner, pythonRunner, cppRunner, javaRunner
│   │   ├── sandbox.js          # Ephemeral workspace creation & child process sandboxing
│   │   └── executionServer.js  # Microservice listening on port 5050
│   └── package.json
│
├── docker-compose.yml          # Containerized multi-service deployment
├── ARCHITECTURE.md             # Detailed system design & lifecycles
└── README.md                   # Complete documentation
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/codex_platform
JWT_SECRET=super_secret_codex_jwt_key_2026_dev_env_987654321
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EXECUTION_SERVICE_URL=http://localhost:5050
EXECUTION_SECRET=codex_internal_secret_sandbox_token_2026
```

### Execution Service (`execution-service/.env`)
```env
PORT=5050
NODE_ENV=development
EXECUTION_SECRET=codex_internal_secret_sandbox_token_2026
PYTHON_BIN=python
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** >= v18
- **MongoDB** running locally on port 27017 (or MongoDB Atlas connection string)
- **Python** (for executing Python 3 solutions)

### 2. Installation
Install dependencies in each subproject:
```bash
# In codex-platform/server
cd server
npm install

# In codex-platform/execution-service
cd ../execution-service
npm install

# In codex-platform/client
cd ../client
npm install
```

### 3. Database Seeding
Seed the database with 21 realistic coding problems, users, contests, achievements, and sample submissions:
```bash
cd server
npm run seed
```

### 4. Running the Services
Launch all three services in separate terminals:

**Terminal 1 — Execution Sandbox:**
```bash
cd execution-service
npm start
# Runs on http://localhost:5050
```

**Terminal 2 — API Gateway Server:**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

**Terminal 3 — Client Frontend:**
```bash
cd client
npm run dev
# Accessible at http://localhost:5173
```

---

## 🐳 Docker Deployment

To launch the complete platform inside containers:
```bash
docker-compose up --build
```
This starts:
- MongoDB 8.0 on port `27017`
- Isolated Execution Service on port `5050`
- API Gateway on port `5000`
- Production Nginx Client on port `5173`

---

## 👥 Seed Test Accounts

The platform includes pre-configured accounts with populated data, streaks, and ratings:

| Role | Email / Login | Password | Username |
|---|---|---|---|
| **Admin** | `admin@codex.dev` | `admin123` | `admin` |
| **Instructor** | `instructor@codex.dev` | `instructor123` | `dr_alan` |
| **Student 1** | `alex@codex.dev` | `student123` | `alex_coder` |
| **Student 2** | `maria@codex.dev` | `student123` | `maria_dev` |
| **Student 3** | `sarah@codex.dev` | `student123` | `sarah_algo` |

*Note: The login page includes quick-fill buttons for instant 1-click credential population during testing.*

---

## 🧪 Testing

Run automated API and integration tests covering Authentication, RBAC, Problem Management, Hidden Test Case Protection, Contests, Profiles, and Admin Controls:
```bash
cd server
npm test
```
Result: **17 passed, 17 total**.

---

## 📄 License
MIT License. Built for enterprise algorithmic problem solving and technical evaluation.
