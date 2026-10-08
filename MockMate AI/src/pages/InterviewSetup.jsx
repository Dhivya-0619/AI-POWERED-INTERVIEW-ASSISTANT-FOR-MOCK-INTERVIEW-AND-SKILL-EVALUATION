import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createInterviewAndGenerateQuestionsApi } from '../services/api';
import {
  Code,
  Users,
  Brain,
  Layers,
  Sparkles,
  ArrowRight,
  Sliders,
  Mic,
  FileText,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';
import InterviewCard from '../components/InterviewCard';

const InterviewSetup = () => {
  const {
    activeSetup,
    setActiveSetup,
    resumeData,
    setGeneratedQuestions,
    setActiveInterviewId,
    setGenerationSource,
    showToast,
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [setup, setSetup] = useState({
    ...activeSetup,
    responseMode: activeSetup.responseMode || 'Text Response',
    useResumeQuestions: activeSetup.useResumeQuestions ?? true,
    topics:
      activeSetup.topics ||
      (resumeData?.detectedSkills || []).slice(0, 6).join(', ') ||
      'Java, SQL, OOP',
  });

  const interviewTypes = [
    {
      type: 'Technical',
      title: 'Technical Round',
      description: 'Languages, frameworks, databases & system concepts.',
      icon: Code,
      badge: 'Popular',
    },
    {
      type: 'HR',
      title: 'HR & Culture',
      description: 'Career goals, background, strengths & soft skills.',
      icon: Users,
    },
    {
      type: 'Behavioral',
      title: 'Behavioral Round',
      description: 'STAR-style questions on teamwork, pressure & learning.',
      icon: Brain,
    },
    {
      type: 'Mixed',
      title: 'Mixed Round',
      description: 'Blend of technical, HR, and behavioral questions.',
      icon: Layers,
    },
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const questionCounts = [5, 10, 15];
  const durations = [15, 20, 30, 45];
  const responseModes = ['Voice Dictation', 'Text Response'];
  const jobRoles = [
    'Full Stack Developer',
    'Java Developer',
    'Python Developer',
    'Software Engineer',
    'Frontend Developer',
    'Backend Engineer',
    'Data Scientist',
    'Other',
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      const payload = {
        ...setup,
        resumeId: resumeData?.resumeId || resumeData?.id || null,
        useResumeQuestions: Boolean(
          setup.useResumeQuestions && (resumeData?.resumeId || resumeData?.id)
        ),
      };

      const result = await createInterviewAndGenerateQuestionsApi(payload);

      setActiveSetup({
        ...setup,
        interviewId: result.interview.id,
      });
      setActiveInterviewId(result.interview.id);
      setGeneratedQuestions(result.questions);
      setGenerationSource(result.generation_source);

      showToast(
        `Questions ready (${result.generation_source === 'llm' ? 'LLM' : 'fallback bank'})`,
        'success'
      );
      navigate('/mock-interview');
    } catch (err) {
      showToast(err.message || 'Failed to create interview / generate questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <PageHeader
        title="Configure Mock Interview"
        description="Choose category, role, skills, and difficulty. The backend creates the interview and generates personalized questions."
        badgeText="Phase 1 Backend"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              1. Choose Interview Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {interviewTypes.map((item) => (
                <InterviewCard
                  key={item.type}
                  isSetupCard
                  session={{
                    ...item,
                    selected: setup.interviewType === item.type,
                    onClick: () => setSetup({ ...setup, interviewType: item.type }),
                  }}
                />
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              2. Technical Domain & Target Role
            </h3>

            <InputField
              label="Target Role / Domain"
              type="select"
              options={jobRoles}
              value={setup.jobRole}
              onChange={(e) => setSetup({ ...setup, jobRole: e.target.value })}
            />

            <InputField
              label="Focus Skills / Topic Tags"
              type="text"
              placeholder="e.g. React, Java, SQL, REST APIs"
              value={setup.topics}
              onChange={(e) => setSetup({ ...setup, topics: e.target.value })}
              helperText="Comma-separated skills sent to the question generator"
            />

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(setup.useResumeQuestions)}
                onChange={(e) =>
                  setSetup({ ...setup, useResumeQuestions: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                disabled={!resumeData?.resumeId && !resumeData?.id}
              />
              <span>
                Personalize from my analyzed resume
                {!resumeData?.resumeId && !resumeData?.id
                  ? ' (upload a resume first)'
                  : ` (resume #${resumeData.resumeId || resumeData.id})`}
              </span>
            </label>
          </div>

          <div className="card grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Difficulty Level
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSetup({ ...setup, difficulty: diff })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      setup.difficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Primary Response Mode
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {responseModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSetup({ ...setup, responseMode: mode })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      setup.responseMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {mode === 'Voice Dictation' ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>{mode === 'Voice Dictation' ? 'Voice' : 'Text'}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Voice UI is client-side only in Phase 1 (answers are not scored by the API yet).
              </p>
            </div>
          </div>

          <div className="card grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-2 block">Number of Questions</label>
              <div className="grid grid-cols-3 gap-2">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSetup({ ...setup, questionCount: count })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                      setup.questionCount === count
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-500 font-extrabold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label mb-2 block">Target Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setSetup({ ...setup, durationMinutes: dur })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                      setup.durationMinutes === dur
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-500 font-extrabold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card sticky top-24 space-y-6 border-indigo-100 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base font-heading">
                Configuration Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-indigo-600">{setup.interviewType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Domain / Role:</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">
                  {setup.jobRole}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Difficulty:</span>
                <span className="font-bold text-slate-900">{setup.difficulty}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Questions:</span>
                <span className="font-bold text-slate-900">
                  {setup.questionCount} Questions
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-slate-900">
                  {setup.durationMinutes} Minutes
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Resume Qs:</span>
                <span className="font-bold text-indigo-600">
                  {setup.useResumeQuestions && (resumeData?.id || resumeData?.resumeId)
                    ? 'Yes'
                    : 'No'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-2xl text-[11px] text-indigo-800 leading-relaxed border border-indigo-100">
              <Sparkles className="w-4 h-4 text-indigo-600 mb-1" />
              Starting will call the Flask API to create the interview and generate
              questions (rule-based bank unless an LLM is configured).
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onClick={handleStart}
              icon={ArrowRight}
              className="shimmer-effect"
            >
              Generate Questions & Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
