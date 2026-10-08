/**
 * API client for Flask Phase 1 backend.
 * Base URL: http://127.0.0.1:5000/api (override with VITE_API_BASE_URL)
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const TOKEN_KEY = 'access_token';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status = 400, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.message || `Request failed (${response.status})`,
      response.status,
      data
    );
  }
  return data;
}

/**
 * JSON request helper with Bearer token.
 */
async function apiRequest(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new ApiError(
      'Cannot reach the server. Make sure the Flask backend is running at http://127.0.0.1:5000',
      0,
      { cause: networkErr }
    );
  }

  return parseResponse(response);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerApi(fullName, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });
}

export async function loginApi(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  return data;
}

export async function getMeApi() {
  return apiRequest('/auth/me');
}

export async function logoutApi() {
  clearAccessToken();
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfileApi() {
  return apiRequest('/profile/');
}

export async function updateProfileApi(payload) {
  // Map UI fields → backend fields
  const body = {};
  if (payload.full_name !== undefined || payload.name !== undefined) {
    body.full_name = payload.full_name ?? payload.name;
  }
  if (payload.education !== undefined) body.education = payload.education;
  if (payload.preferred_job_role !== undefined || payload.targetRole !== undefined) {
    body.preferred_job_role = payload.preferred_job_role ?? payload.targetRole;
  }
  if (payload.skills !== undefined) {
    body.skills = Array.isArray(payload.skills)
      ? payload.skills
      : String(payload.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  }
  return apiRequest('/profile/', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function changePasswordApi(currentPassword, newPassword) {
  return apiRequest('/profile/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export async function uploadResumeApi(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/resume/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function analyzeResumeApi(resumeId) {
  return apiRequest(`/resume/analyze/${resumeId}`, {
    method: 'POST',
  });
}

/** Upload then analyze — returns UI-friendly analysis object. */
export async function uploadAndAnalyzeResumeApi(file) {
  const upload = await uploadResumeApi(file);
  const resumeId = upload.resume.id;
  const analyzed = await analyzeResumeApi(resumeId);
  const a = analyzed.analysis || {};

  return {
    success: true,
    message: analyzed.message,
    id: resumeId,
    resumeId,
    fileName: upload.resume.filename,
    detectedSkills: a.skills || [],
    education: a.education ? [a.education] : [],
    experience: a.experience || null,
    projects: a.projects || [],
    skillGaps: a.skill_gaps || [],
    improvementSuggestions: a.improvement_suggestions || [],
    analysis_mode: a.analysis_mode || 'rule_based_demo',
    isDemoData: false,
  };
}

export async function listResumesApi() {
  return apiRequest('/resume/');
}

export async function deleteResumeApi(resumeId) {
  return apiRequest(`/resume/${resumeId}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Interviews & questions (Phase 1)
// ---------------------------------------------------------------------------

export async function createInterviewApi(setup) {
  const skills = Array.isArray(setup.skills)
    ? setup.skills
    : String(setup.topics || setup.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  // Backend allows Technical | HR | Behavioral | Mixed
  let interviewType = setup.interviewType || setup.interview_type || 'Technical';
  if (interviewType === 'Coding') interviewType = 'Mixed';

  const body = {
    interview_type: interviewType,
    difficulty: setup.difficulty || 'Intermediate',
    job_role: setup.jobRole || setup.job_role || 'Software Engineer',
    skills: skills.length ? skills : ['General'],
    number_of_questions: Number(setup.questionCount || setup.number_of_questions || 5),
    duration_minutes: Number(setup.durationMinutes || setup.duration_minutes || 20),
    use_resume_questions: Boolean(
      setup.useResumeQuestions ?? setup.use_resume_questions ?? false
    ),
  };

  if (setup.resumeId || setup.resume_id) {
    body.resume_id = Number(setup.resumeId || setup.resume_id);
  }

  return apiRequest('/interviews/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function generateQuestionsApi(interviewId) {
  return apiRequest(`/interviews/${interviewId}/generate-questions`, {
    method: 'POST',
  });
}

export async function getInterviewQuestionsApi(interviewId) {
  return apiRequest(`/interviews/${interviewId}/questions`);
}

export async function getInterviewApi(interviewId) {
  return apiRequest(`/interviews/${interviewId}`);
}

export async function listInterviewsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.interview_type) query.set('interview_type', params.interview_type);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', params.page);
  const qs = query.toString();
  return apiRequest(`/interviews/${qs ? `?${qs}` : ''}`);
}

/**
 * Create interview + generate questions in one step for the UI.
 * Returns { interview, questions, generation_source } with UI-shaped questions.
 */
export async function createInterviewAndGenerateQuestionsApi(setup) {
  const created = await createInterviewApi(setup);
  const interview = created.interview;
  const generated = await generateQuestionsApi(interview.id);

  const questions = (generated.questions || []).map((q) => ({
    id: q.id,
    question: q.question_text,
    question_text: q.question_text,
    category: q.question_type,
    question_type: q.question_type,
    difficulty: q.difficulty,
    question_order: q.question_order,
  }));

  return {
    success: true,
    interview,
    questions,
    generation_source: generated.generation_source,
    message: generated.message,
  };
}

export { ApiError };
