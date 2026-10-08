---
name: ai-interview-assistant-frontend
description: "Use when building a polished React + Vite frontend for an AI-powered mock interview assistant project. Covers landing page, login/register, dashboard, resume upload, interview setup, mock interview flow, evaluation, progress analytics, profile settings, reusable components, responsive styling, demo data, validation, and future Flask API integration."
---

# AI Interview Assistant Frontend

## Goal

Build a complete, professional frontend for a final-year project titled: AI-Powered Interview Assistant for Mock Interviews and Skill Evaluation.

The output should be a modern React + Vite app with strong UI/UX, responsive layout, working client-side navigation, realistic demo data, validation, and clear labels wherever backend or AI capabilities are still missing.

## Scope

This skill is for a workspace-scoped project. It is intended for an engineering student or developer creating a polished project demo that can later connect to a Flask backend.

## Workflow

1. Set up the project structure
   - Create a Vite React app.
   - Install dependencies: react, react-dom, react-router-dom, recharts, lucide-react or react-icons.
   - Create a beginner-friendly folder structure with pages, components, data, and styles.

2. Review the project brief and map all pages and routes
   - Landing page
   - Login page
   - Registration page
   - Dashboard
   - Resume upload
   - Interview setup
   - Mock interview
   - Evaluation
   - Progress tracking
   - Profile

3. Establish a consistent design system
   - Use a navy/indigo/violet palette with white and light gray tones.
   - Define spacing, shadows, cards, buttons, inputs, badges, progress bars, and charts.
   - Keep the UI clean, minimal, and professional.
   - Add subtle hover effects and smooth transitions.

4. Build the shared app shell
   - Add a reusable Navbar for public pages.
   - Add a reusable Sidebar for authenticated pages.
   - Add a PageHeader component and common stat cards.
   - Use App.jsx to define routes and layout.

5. Implement public pages first
   - Landing page with hero section, feature cards, how-it-works, benefits, and footer.
   - Login page with form validation for email and password.
   - Registration page with full validation and mock success flow.
   - Ensure buttons route correctly and the design matches the project theme.

6. Implement the authenticated experience
   - Dashboard with summary cards, recent sessions, charts, skill progress, quick actions, and activities.
   - Resume upload page with drag-and-drop or browse file selection, file details, demo analysis results, and a clear “sample/demo data” label.
   - Interview setup page with type, difficulty, number of questions, role, skills, and summary state.

7. Build the mock interview flow
   - Use sample questions and navigation controls.
   - Add timer logic.
   - Add text input for answers.
   - Include optional voice/demo controls only if they are clearly labelled and safe.
   - Keep a functional demo mode without claiming real AI analysis.
   - Navigate to the evaluation page after the last question is submitted.

8. Design the evaluation and progress pages
   - Create a detailed feedback screen with overall score, charts, strengths, weaknesses, and question-by-question review.
   - Use demo scores and labelled sample feedback.
   - Add progress analytics with charts, filters, and history tables.

9. Add profile and persistence
   - Build a profile page with avatar, details, editable fields, notifications, and password section.
   - Use localStorage when helpful for prototype persistence.
   - Keep the experience realistic for a demo without a backend.

10. Finish the project with quality checks
   - Ensure every button is connected to real navigation or action.
   - Validate all required inputs and edge cases.
   - Make each page responsive across desktop, tablet, and mobile.
   - Ensure all sample data is clearly labelled as demo content.
   - Verify the app runs successfully with npm run dev.

11. Prepare for future backend integration
   - Keep API logic separated from UI components where possible.
   - Add a configurable API base URL.
   - Document where future endpoints for authentication, resume parsing, interview generation, evaluation, and analytics should be added.

## Decision Points

- If the user wants a mock, demo-only frontend: use sample data and clearly mark it as demo.
- If a feature needs AI or backend processing: do not fake real results; use placeholder states and labels.
- If a browser voice feature is not fully supported: show a demo-only note instead of pretending that speech analysis is active.
- If form validation fails: show helpful inline messages and block submission.
- If the user is authenticated: route to the dashboard; otherwise keep them on public pages.
- If the required interview settings are incomplete: block start-interview and show a summary of missing values.
- If the resume is selected: show file details and allow replace/remove actions.
- If the project is intended for future Flask integration: maintain a clear separation between UI and API service calls.

## Quality Criteria

A solution is complete when all of the following are true:

- All required pages and routes exist and are linked properly.
- The project has a professional SaaS-style look and matching layout.
- The UI is responsive and visually consistent across pages.
- Reusable components are modular and maintainable.
- Client-side validation works for login and registration.
- Dashboard and analytics pages include realistic sample data.
- Interview flow supports navigation, timer, answers, and final evaluation transition.
- The app clearly labels demo-only AI and backend behavior.
- There are no dead buttons or fake actions.
- The app runs without compile errors.
- The project is ready for future Flask API connection.

## Recommended File Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── Button.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ResumeUpload.jsx
│   │   ├── InterviewSetup.jsx
│   │   ├── MockInterview.jsx
│   │   ├── Evaluation.jsx
│   │   ├── Progress.jsx
│   │   └── Profile.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
├── package.json
├── README.md
└── vite.config.js
```

## Typical Prompt Patterns

- Build the complete AI Interview Assistant frontend in React with modern SaaS styling.
- Create the landing page, auth forms, dashboard, mock interview flow, and progress pages.
- Add validation, realistic sample data, and responsive layout for a final-year project.
- Make this frontend ready for a Flask backend without pretending real AI responses are live.
- Implement the interview evaluation and progress analytics pages with Recharts demo charts.

## Suggested Output Checklist

Before finishing, confirm:

- project setup commands were shown
- dependencies were installed
- all required pages were implemented
- navigation works across all pages
- validation is included
- charts and cards render correctly
- sample/demo labels are visible where needed
- localStorage is used for prototype persistence when appropriate
- README explains how to run the app and future backend connection points

## API-Ready Design Notes

Store configuration in a central file such as `src/config.js` or `src/services/api.js`.

Recommended future endpoints:

- POST /api/register
- POST /api/login
- POST /api/resume/upload
- GET /api/interview/questions
- POST /api/interview/submit
- GET /api/progress
- GET /api/profile

Keep these calls separate from UI component logic so the frontend can later connect to a Flask REST API without rewriting the UI structure.

## Completion Standard

This skill is successful when the user receives a complete frontend, easy to run locally, clearly demo-labeled where needed, and ready for future Flask backend integration without fake functionality.
