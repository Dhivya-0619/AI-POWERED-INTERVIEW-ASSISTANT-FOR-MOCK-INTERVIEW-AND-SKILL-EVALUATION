import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  getMeApi,
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  logoutApi,
  getAccessToken,
  clearAccessToken,
  ApiError,
} from '../services/api';

const AuthContext = createContext();

const defaultAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200';

/** Normalize backend profile/user into UI-friendly shape. */
export function mapUserFromApi(profileOrUser) {
  if (!profileOrUser) return null;
  const fullName = profileOrUser.full_name || profileOrUser.name || '';
  const skills = Array.isArray(profileOrUser.skills)
    ? profileOrUser.skills
    : profileOrUser.skills
      ? String(profileOrUser.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return {
    id: profileOrUser.id,
    name: fullName,
    full_name: fullName,
    email: profileOrUser.email || '',
    education: profileOrUser.education || '',
    preferred_job_role: profileOrUser.preferred_job_role || '',
    targetRole: profileOrUser.preferred_job_role || profileOrUser.targetRole || '',
    skills,
    avatar: profileOrUser.avatar || defaultAvatar,
    notificationsEnabled: profileOrUser.notificationsEnabled ?? true,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_resume');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeSetup, setActiveSetup] = useState({
    interviewType: 'Technical',
    difficulty: 'Intermediate',
    questionCount: 5,
    durationMinutes: 20,
    jobRole: 'Full Stack Developer',
    topics: 'Java, React, SQL',
    useResumeQuestions: true,
    responseMode: 'Text Response',
  });

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [activeInterviewId, setActiveInterviewId] = useState(null);
  const [generationSource, setGenerationSource] = useState(null);

  const [currentSession, setCurrentSession] = useState(null);

  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_assistant_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Restore session from JWT on load
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const me = await getMeApi();
        if (!cancelled) {
          setUser(mapUserFromApi(me.user));
          setIsAuthenticated(true);
        }
      } catch {
        clearAccessToken();
        if (!cancelled) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_assistant_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    let profileUser = mapUserFromApi(data.user);
    try {
      const profile = await getProfileApi();
      profileUser = mapUserFromApi(profile.profile);
    } catch {
      // login user object is enough
    }
    setUser(profileUser);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${profileUser.name}!`, 'success');
    return data;
  };

  const register = async (fullName, email, password) => {
    await registerApi(fullName, email, password);
    // Auto-login after registration so JWT is available
    const data = await loginApi(email, password);
    const profileUser = mapUserFromApi({
      ...data.user,
      full_name: data.user.full_name || fullName,
    });
    setUser(profileUser);
    setIsAuthenticated(true);
    showToast(`Account created! Welcome ${fullName}.`, 'success');
    return data;
  };

  const logout = () => {
    logoutApi();
    setIsAuthenticated(false);
    setUser(null);
    setGeneratedQuestions([]);
    setActiveInterviewId(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateUserProfile = async (updatedDetails) => {
    const res = await updateProfileApi(updatedDetails);
    const mapped = mapUserFromApi(res.profile);
    setUser(mapped);
    showToast('Profile updated successfully!', 'success');
    return mapped;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await changePasswordApi(currentPassword, newPassword);
    showToast('Password updated successfully!', 'success');
  };

  const refreshProfile = async () => {
    const res = await getProfileApi();
    const mapped = mapUserFromApi(res.profile);
    setUser(mapped);
    return mapped;
  };

  const saveResumeAnalysis = (data) => {
    setResumeData(data);
    localStorage.setItem('ai_assistant_resume', JSON.stringify(data));
  };

  const addCompletedSession = (newSession) => {
    setSessionHistory((prev) => [newSession, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        updateUserProfile,
        changePassword,
        refreshProfile,
        resumeData,
        saveResumeAnalysis,
        activeSetup,
        setActiveSetup,
        generatedQuestions,
        setGeneratedQuestions,
        activeInterviewId,
        setActiveInterviewId,
        generationSource,
        setGenerationSource,
        currentSession,
        setCurrentSession,
        sessionHistory,
        addCompletedSession,
        toast,
        showToast,
        ApiError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
