# AI-Powered Interview Assistant — Phase 1 Backend

Flask REST API for **MockMate / AI-Powered Interview Assistant**: user auth, resume upload & analysis, interview configuration, and personalized question generation.

Phase 1 ends at question generation. Mock interview execution, answer evaluation, and analytics belong to Phase 2.

---

## Phase 1 Scope

| Module | Status |
|--------|--------|
| 1. User Authentication & Profile | Implemented |
| 2. Resume Upload & Analysis | Implemented |
| 3. Interview Configuration | Implemented |
| 4. AI Question Generation | Implemented (LLM optional; rule-based fallback by default) |

**Not in Phase 1:** answer submission, speech/emotion analysis, scoring, interview completion, progress charts, recommendation engine.

---

## Features

- JWT registration / login / profile management
- Secure PDF & DOCX resume upload with text extraction
- Rule-based skill extraction (`analysis_mode: "rule_based_demo"`)
- Optional LLM resume analysis when `AI_*` env vars are set (`analysis_mode: "llm"`)
- Interview configuration (Technical / HR / Behavioral / Mixed)
- Fallback question bank + resume-templated questions (`generation_source: "fallback_rule_based"`)
- Optional LLM question generation (`generation_source: "llm"`)
- Ownership checks on every user-owned resource
- CORS for React + Vite (`http://localhost:5173`)

> Rule-based keyword matching is **not** advanced AI. Modes are labelled clearly so demos stay honest.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | Python 3.11+ |
| Framework | Flask |
| Auth | Flask-JWT-Extended + Werkzeug hashing |
| ORM | Flask-SQLAlchemy |
| DB (dev) | SQLite |
| PDF | PyMuPDF (`fitz`) |
| DOCX | python-docx |
| Config | python-dotenv |
| Tests | pytest |
| CORS | Flask-CORS |

---

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── config.py
│   ├── extensions.py
│   ├── models/              # User, Resume, Interview, Question
│   ├── routes/              # REST blueprints
│   ├── services/            # Business logic + AI wrapper
│   └── utils/               # Validators & helpers
├── uploads/                 # Stored resumes (not committed)
├── tests/
├── .env.example
├── .gitignore
├── requirements.txt
├── run.py
└── README.md
```

---

## Windows Setup

```powershell
cd "d:\final year project"
mkdir backend   # if not already created
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env
# Edit .env and change SECRET_KEY / JWT_SECRET_KEY

python run.py
```

API base URL: **http://127.0.0.1:5000**

Health check: `GET http://127.0.0.1:5000/api/health`

---

## Environment Configuration

Copy `.env.example` → `.env`:

```
SECRET_KEY=change-this-development-secret
JWT_SECRET_KEY=change-this-jwt-secret
DATABASE_URL=sqlite:///interview_assistant.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=5242880
FRONTEND_URL=http://localhost:5173

AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
```

Leave `AI_*` empty to run fully in **rule-based / fallback** mode (recommended for demos without paid keys).

Optional OpenAI-compatible LLM:

```
AI_PROVIDER=openai
AI_API_KEY=sk-your-key
AI_MODEL=gpt-4o-mini
```

Never commit real secrets. `.env` is gitignored.

---

## Database Initialization

On startup, `create_app()` calls `db.create_all()` so SQLite tables are created automatically in development.

### Adding Flask-Migrate later (Phase 2 / production)

```powershell
pip install Flask-Migrate
```

```python
# in extensions.py
from flask_migrate import Migrate
migrate = Migrate()

# in create_app()
migrate.init_app(app, db)
```

```powershell
flask db init
flask db migrate -m "describe change"
flask db upgrade
```

---

## API Endpoint Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/profile/` | Yes | Get profile |
| PUT | `/api/profile/` | Yes | Update profile |
| POST | `/api/profile/change-password` | Yes | Change password |
| POST | `/api/resume/upload` | Yes | Upload PDF/DOCX |
| POST | `/api/resume/analyze/<id>` | Yes | Analyze resume |
| GET | `/api/resume/` | Yes | List resumes |
| GET | `/api/resume/<id>` | Yes | Get resume |
| DELETE | `/api/resume/<id>` | Yes | Delete resume |
| POST | `/api/interviews/` | Yes | Create interview config |
| GET | `/api/interviews/` | Yes | List interviews (`?interview_type=&status=&page=`) |
| GET | `/api/interviews/<id>` | Yes | Get interview |
| POST | `/api/interviews/<id>/generate-questions` | Yes | Generate questions |
| GET | `/api/interviews/<id>/questions` | Yes | List questions |

Protected routes require:

```
Authorization: Bearer <access_token>
```

---

## Example Requests & Responses

### Register

```http
POST /api/auth/register
Content-Type: application/json

{"full_name": "user", "email": "user@example.com", "password": "StrongPassword123"}
```

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {"id": 1, "full_name": "user", "email": "user@example.com"}
}
```

### Login

```json
{
  "success": true,
  "message": "Login successful",
  "access_token": "<jwt>",
  "user": {"id": 1, "full_name": "user", "email": "user@example.com"}
}
```

### Upload resume

`multipart/form-data` field: `file`

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resume": {"id": 1, "filename": "resume.pdf", "status": "uploaded"}
}
```

### Analyze resume (default mode)

```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "analysis": {
    "analysis_mode": "rule_based_demo",
    "skills": ["Python", "Java", "Flask"],
    "skill_gaps": ["JavaScript"],
    "improvement_suggestions": ["..."]
  }
}
```

### Generate questions (default mode)

```json
{
  "success": true,
  "message": "Questions generated successfully",
  "generation_source": "fallback_rule_based",
  "questions": [
    {
      "id": 1,
      "question_order": 1,
      "question_text": "What is the difference between method overloading and method overriding?",
      "question_type": "Technical",
      "difficulty": "Intermediate"
    }
  ]
}
```

### Error format

```json
{"success": false, "message": "Clear human-readable error message"}
```

Status codes used: 400, 401, 403, 404, 409, 413, 415, 422, 500.

---

## Testing

```powershell
cd backend
venv\Scripts\activate
pytest -v
```

Tests use an in-memory SQLite database (`TestConfig`) and cover auth, profile, resume, interview, and questions.

---

## React + Vite Integration

Point Axios at `http://127.0.0.1:5000`. Suggested frontend layout:

```
MockMate AI/src/
  api/
    axios.js          # baseURL + auth interceptor
    authApi.js
    profileApi.js
    resumeApi.js
    interviewApi.js
```

### Example Axios calls

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 1. Register
await api.post("/auth/register", {
  full_name: "user",
  email: "user@example.com",
  password: "StrongPassword123",
});

// 2. Login
const { data } = await api.post("/auth/login", {
  email: "user@example.com",
  password: "StrongPassword123",
});
localStorage.setItem("access_token", data.access_token);

// 3. Get profile
await api.get("/profile/");

// 4. Upload resume
const form = new FormData();
form.append("file", fileInput.files[0]);
const upload = await api.post("/resume/upload", form, {
  headers: { "Content-Type": "multipart/form-data" },
});

// 5. Analyze resume
await api.post(`/resume/analyze/${upload.data.resume.id}`);

// 6. Create interview
const interview = await api.post("/interviews/", {
  interview_type: "Technical",
  difficulty: "Intermediate",
  job_role: "Java Developer",
  skills: ["Java", "OOP", "DBMS"],
  number_of_questions: 5,
  duration_minutes: 30,
  resume_id: upload.data.resume.id,
  use_resume_questions: true,
});

// 7. Generate questions
await api.post(`/interviews/${interview.data.interview.id}/generate-questions`);

// 8. Get questions
await api.get(`/interviews/${interview.data.interview.id}/questions`);
```

CORS is enabled for `http://localhost:5173` and `http://127.0.0.1:5173`.

---

## AI Configuration & Fallback Mode

| Setting | Resume analysis | Question generation |
|---------|-----------------|---------------------|
| `AI_*` empty / incomplete | `rule_based_demo` | `fallback_rule_based` |
| Provider configured + success | `llm` | `llm` |
| Provider configured + failure | falls back to `rule_based_demo` | falls back to `fallback_rule_based` |

The app **never fabricates** LLM output. Failures always use the real rule-based path.

---

## Security Considerations

- Passwords hashed with Werkzeug (never stored plaintext)
- JWT access tokens for protected routes
- Ownership checks on resumes, interviews, questions
- `secure_filename` + UUID storage names (no path traversal)
- File type whitelist (PDF/DOCX) and 5 MB size limit
- Secrets via environment variables
- Generic error messages (no stack traces in API responses)

---

## Current Limitations (Phase 1)

- No mock interview session / timer UI backend
- No answer submission or AI evaluation
- No speech-to-text or emotion analysis
- No OCR for scanned PDFs
- SQLite only (fine for demos; use PostgreSQL later)
- LLM support is optional and OpenAI-compatible only

---

## Future Phase 2 Modules

1. Mock interview execution (start session, timer, question navigation)
2. Answer submission (text / audio)
3. AI answer evaluation & scoring
4. Interview completion & summary
5. Performance analytics & progress tracking
6. Advanced speech / emotion analysis

Phase 2 can extend existing models (`Interview.status`, new `Answer` / `Evaluation` tables) and add blueprints under `/api/interviews/<id>/...` without rewriting Phase 1.

---

## Quick Demo Flow

```
Register → Login → Update Profile → Upload Resume → Analyze Resume
    → Create Interview → Generate Questions → List Questions
```

That completes the Phase 1 backend pipeline.
