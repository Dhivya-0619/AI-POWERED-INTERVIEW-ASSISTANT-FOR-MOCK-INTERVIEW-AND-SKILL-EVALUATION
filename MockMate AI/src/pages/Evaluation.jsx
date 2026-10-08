import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_EVALUATION_SAMPLE } from '../data/mockData';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  TrendingUp,
  Brain,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Download,
  Printer
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ScoreBadge from '../components/ScoreBadge';
import ProgressBar from '../components/ProgressBar';
import ChartCard from '../components/ChartCard';
import Button from '../components/Button';

const Evaluation = () => {
  const { currentSession, showToast } = useAuth();
  const navigate = useNavigate();

  // Phase 2: replace with real AI evaluation API. Sample scores for UI preview only.
  const evalData = MOCK_EVALUATION_SAMPLE;

  const radarData = [
    { subject: 'Technical', A: evalData.breakdown.technicalKnowledge },
    { subject: 'Communication', A: evalData.breakdown.communication },
    { subject: 'Problem Solving', A: evalData.breakdown.problemSolving },
    { subject: 'Relevance', A: evalData.breakdown.answerRelevance },
    { subject: 'Clarity', A: evalData.breakdown.confidence }
  ];

  const handleDownloadPDF = () => {
    showToast('Preparing interview evaluation report PDF...', 'info');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="space-y-8 text-left">
      <PageHeader
        title="Interview Evaluation Report"
        description="Phase 2 preview: scores below are sample UI data. Questions came from the Phase 1 backend; answer evaluation API is not implemented yet."
        badgeText="Phase 2 Preview"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleDownloadPDF} icon={Download}>
              Download Report
            </Button>
            <Button variant="primary" onClick={() => navigate('/interview-setup')} icon={RotateCcw} className="shimmer-effect">
              Retry Interview
            </Button>
          </div>
        }
      />

      {currentSession?.generation_source && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900">
          Last session used questions from <strong>{currentSession.generation_source}</strong>
          {currentSession.interviewId ? ` (interview #${currentSession.interviewId})` : ''}.
          Score charts are placeholder until Phase 2 evaluation is built.
        </div>
      )}

      {/* Hero Score Banner */}
      <div className="card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop ring */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              {evalData.role} • {evalData.interviewType} Round
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
              Great Job! Your Evaluation Score is Ready.
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              You demonstrated strong React & Java technical concepts with good structural communication clarity.
            </p>
          </div>

          {/* Prominent Circular Overall Score Badge */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 p-1 flex items-center justify-center shadow-2xl shadow-indigo-600/50 shrink-0 animate-pulse-glow">
            <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white font-heading">{evalData.overallScore}%</span>
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider mt-0.5">Overall Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Dimension Breakdown Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Technical Accuracy', val: evalData.breakdown.technicalKnowledge },
          { label: 'Communication Score', val: evalData.breakdown.communication },
          { label: 'Problem Solving', val: evalData.breakdown.problemSolving },
          { label: 'Answer Relevance', val: evalData.breakdown.answerRelevance },
          { label: 'Clarity & Delivery', val: evalData.breakdown.confidence }
        ].map((item, idx) => (
          <div key={idx} className="card card-hover text-center p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">{item.val}%</p>
            <div className="mt-2">
              <ProgressBar value={item.val} showPercentage={false} height="h-1.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Visual Recharts Radar Chart & Strengths / Improvements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Skill Competency Radar" subtitle="Multidimensional score visualization across dimensions">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
              <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Strengths & Improvements */}
        <div className="space-y-6">
          <div className="card space-y-3 border-emerald-100/80 shadow-md">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm font-heading">
              <CheckCircle2 className="w-5 h-5" />
              <span>Key Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {evalData.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-3 border-amber-100/80 shadow-md">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm font-heading">
              <AlertTriangle className="w-5 h-5" />
              <span>Areas for Improvement</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {evalData.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Feedback & Question Critique Cards */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">
              AI Question Feedback & Suggested Improvements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Compare your response against ideal AI recommendations</p>
          </div>
        </div>

        <div className="space-y-6">
          {evalData.questionFeedback.map((q, idx) => (
            <div key={idx} className="p-5 md:p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-colors shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-900 font-heading">
                  Question #{q.questionNumber}: {q.question}
                </span>
                <ScoreBadge score={q.score} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-600 block mb-1">Your Submitted Answer:</span>
                  <p className="text-slate-700 leading-relaxed">{q.userAnswer}</p>
                </div>

                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 shadow-2xs">
                  <span className="font-bold text-indigo-700 block mb-1">Suggested Model Answer:</span>
                  <p className="text-indigo-900 leading-relaxed">{q.idealAnswer}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-indigo-600">AI Feedback: </span>
                {q.feedback}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="secondary" onClick={() => navigate('/dashboard')} icon={LayoutDashboard}>
          Return to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadPDF} icon={Download}>
            Download Report
          </Button>
          <Button variant="primary" onClick={() => navigate('/interview-setup')} icon={RotateCcw} className="shimmer-effect">
            Practice Another Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
