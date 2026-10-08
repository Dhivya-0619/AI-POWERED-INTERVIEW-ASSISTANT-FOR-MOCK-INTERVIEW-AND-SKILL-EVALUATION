# AI-Powered Interview Assistant for Mock Interviews and Skill Evaluation

A modern, responsive, full-featured React frontend for a final-year engineering project titled **"AI-Powered Interview Assistant for Mock Interviews and Skill Evaluation"**.

Built with **React.js**, **Vite**, **React Router DOM**, **Lucide React**, **Recharts**, and standard **CSS Design System variables**.

---

## 🌟 Key Features & Highlights

- 🎨 **AI SaaS Design System**: Minimal, professional aesthetic using navy, indigo, violet, emerald, and slate color palettes with smooth card hover states and glassmorphism.
- 🚀 **10 Complete Interactive Pages**:
  1. `Landing Page (/`): Hero section, CTA buttons, feature grid, 3-step interactive process, benefits summary.
  2. `Login (/login)`: Email/password authentication form with validation and password visibility toggle.
  3. `Register (/register)`: Full student registration form with client-side field validation and password matching.
  4. `Dashboard (/dashboard)`: KPI metric summary cards, Recharts performance line chart, skill progress radar, recent mock sessions data table, and quick launcher buttons.
  5. `Resume Analysis (/resume)`: Drag-and-drop file uploader (PDF/DOCX), simulated AI parser spinner, extracted skill badges, and improvement suggestions.
  6. `Interview Setup (/interview-setup)`: Cards for Technical/HR/Behavioral rounds, difficulty pills, question count selector, job role dropdown, and summary sidebar.
  7. `Mock Interview (/mock-interview)`: Active question presenter, countdown timer, Web Speech API speech-to-text dictation with live waveform visualizer, and navigation controls.
  8. `Interview Evaluation (/evaluation)`: Overall score ring badge, 5-dimension score breakdowns, Recharts radar graph, question-by-question critique, and retry buttons.
  9. `Progress Analytics (/progress)`: Time-series line chart, skill comparison bar graph, and filterable complete interview log table.
  10. `Profile & Settings (/profile)`: User profile editor, skills tag editor, password change form, and notification preferences.
- 🎙️ **Voice Speech Dictation**: Integrated browser Web Speech API for voice-to-text question responses with fallback simulated recording waveform indicator.
- 📊 **Recharts Visualizations**: Interactive Area Charts, Line Graphs, Bar Comparisons, and Radar diagrams.
- 🔗 **Flask REST Backend Ready**: Built with a clean API service layer (`src/services/api.js`) featuring configurable base URL and transparent mock fallback handlers.

---

## 🛠️ Setup & Local Execution Commands

### 1. Prerequisites
Ensure **Node.js** (v18+ recommended) and **npm** are installed on your system.

### 2. Install Dependencies
Run the following command in the project root directory:

```bash
npm install
```

This installs all required packages:
- `react` & `react-dom`
- `react-router-dom` (routing)
- `lucide-react` (modern icons)
- `recharts` (dashboard graphs)
- `vite` & `@vitejs/plugin-react` (development server & bundler)

### 3. Start Development Server
Run the local dev server using Vite:

```bash
npm run dev
```

The application will start at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🧪 Testing Routes List

You can test each page directly via the following routes:

| Route | Page | Key Interaction to Test |
|---|---|---|
| `/` | Landing Page | Click "Start Practising" -> navigates to `/register` |
| `/login` | Login | Click "Sign In" (Use demo email: `kavya.sharma@example.com`) |
| `/register` | Registration | Complete form & click "Create Account" -> redirects to `/dashboard` |
| `/dashboard` | Dashboard | View stat cards, Recharts score trend graph, & click "Start Mock Interview" |
| `/resume` | Resume Upload | Drag & drop PDF/DOCX resume file -> view extracted technical skills |
| `/interview-setup` | Interview Setup | Configure Technical/HR type, difficulty, and click "Start Interview" |
| `/mock-interview` | Active Mock | Dictate/type answers, test countdown timer, click "Submit & Finish" |
| `/evaluation` | Evaluation | View circular score ring (86%), radar chart, & question-by-question critique |
| `/progress` | Progress Analytics | Filter interview table by Technical/HR/Behavioral categories |
| `/profile` | Profile & Settings | Edit student details, update skill tags, or change password |

---

## 🔌 Future Flask REST Backend Integration Guide

The frontend has been designed from the ground up for easy connection to a **Python Flask REST API**.

### API Service Configuration (`src/services/api.js`)

1. Open `src/services/api.js`.
2. Update the `API_BASE_URL` to point to your Flask server:
   ```javascript
   export const API_BASE_URL = 'http://localhost:5000/api';
   export const IS_DEMO_MODE = false; // Set to false when Flask endpoints are active
   ```

### Flask Endpoint Specifications

Your Flask backend should implement the following REST endpoints:

- `POST /api/auth/login`: Authenticates user credentials & returns JWT token.
- `POST /api/auth/register`: Registers a new student account.
- `POST /api/resume/analyze`: Accepts `multipart/form-data` file upload (PDF/DOCX), parses text using PyPDF2 / pdfplumber or SpaCy NLP, and returns JSON array of detected skills.
- `POST /api/interview/generate-questions`: Generates customized interview questions based on job role and resume topics using OpenAI / Gemini / Llama models.
- `POST /api/interview/evaluate`: Accepts user submitted answers and computes semantic relevance, technical accuracy, and detailed critique score JSON.
- `GET /api/progress/history`: Fetches past user session logs and scores from SQLite/PostgreSQL.

---

## 📁 Project Folder Structure

```
c:/Users/DELL/OneDrive/Desktop/Final project/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── styles/
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── data/
│   │   └── mockData.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PageHeader.jsx
│   │   ├── StatCard.jsx
│   │   ├── Button.jsx
│   │   ├── InputField.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ScoreBadge.jsx
│   │   ├── InterviewCard.jsx
│   │   ├── QuestionCard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── NotificationToast.jsx
│   │   └── Modal.jsx
│   └── pages/
│       ├── Landing.jsx
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── ResumeUpload.jsx
│       ├── InterviewSetup.jsx
│       ├── MockInterview.jsx
│       ├── Evaluation.jsx
│       ├── Progress.jsx
│       └── Profile.jsx
└── README.md
```

---

## 🎓 Project Demonstration Notes

This project is built to demonstrate a complete production-style AI SaaS interface for college final-year project reviews. All buttons, navigation links, forms, timers, audio recording indicators, and charts are fully functional with realistic sample data.
