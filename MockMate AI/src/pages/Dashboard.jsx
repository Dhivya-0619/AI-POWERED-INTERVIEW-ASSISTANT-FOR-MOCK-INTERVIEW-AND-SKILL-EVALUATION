import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MOCK_STATS,
  MOCK_PERFORMANCE_HISTORY,
  MOCK_SKILL_SUMMARY
} from '../data/mockData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  PlayCircle,
  UploadCloud,
  TrendingUp,
  Award,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import ScoreBadge from '../components/ScoreBadge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, sessionHistory } = useAuth();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Interview Title & Role',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-400">{row.role}</p>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
          {row.type}
        </span>
      )
    },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Score',
      accessor: 'score',
      render: (row) => <ScoreBadge score={row.score} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={() => navigate('/evaluation')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
        >
          <span>Evaluation</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner Header */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Continue from your resume analysis, configure a round, or generate fresh practice questions."
        badgeText="Workspace"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/interview-setup')}
            icon={PlayCircle}
            className="shimmer-effect"
          >
            Start mock interview
          </Button>
        }
      />

      {/* Four Compact Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Interviews"
          value={sessionHistory.length || MOCK_STATS.totalInterviews}
          subtitle="Completed sessions"
          trend="+3 this week"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Average Score"
          value={`${MOCK_STATS.avgScore}%`}
          subtitle="Overall performance"
          trend="+12% this month"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Practice Time"
          value={`${MOCK_STATS.practiceHours} hrs`}
          subtitle="Total mock duration"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Skills Improved"
          value="6 Topics"
          subtitle="React, Java, System Design"
          icon={Zap}
          color="violet"
        />
      </div>

      {/* Analytics Line Chart & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Performance Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Interview Performance Trend"
            subtitle="Historical score trajectory across recent mock attempts"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PERFORMANCE_HISTORY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardScoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#dashboardScoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Skill Breakdown Section */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading mb-1">Skill Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">AI automated rating by competency area</p>

            <div className="space-y-4">
              {MOCK_SKILL_SUMMARY.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{s.skill}</span>
                    <span className="font-bold text-indigo-600">{s.score}%</span>
                  </div>
                  <ProgressBar value={s.score} showPercentage={false} color={s.score > 85 ? 'indigo' : 'emerald'} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Target competency: 85%+</span>
            <button onClick={() => navigate('/progress')} className="text-indigo-600 font-semibold hover:underline">
              Full Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming & Recommended Practice Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Practice */}
        <div className="card space-y-3 border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm font-heading">
            <Calendar className="w-5 h-5" />
            <span>Upcoming Scheduled Practice</span>
          </div>
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">System Design & Architecture</p>
              <p className="text-[11px] text-slate-500">Scheduled for Tomorrow • 10:00 AM</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/interview-setup')}>
              Prepare
            </Button>
          </div>
        </div>

        {/* Recommended Practice */}
        <div className="card space-y-3 border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm font-heading">
            <BookOpen className="w-5 h-5" />
            <span>Recommended Focus Area</span>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Java Multithreading & Concurrency</p>
              <p className="text-[11px] text-slate-500">Improve technical score by +8%</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/interview-setup')}>
              Start Module
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Interview Sessions Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Recent Interview Sessions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any row to review detailed question-by-question feedback</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/progress')}>
            View All
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={sessionHistory}
          onRowClick={(row) => navigate('/evaluation')}
        />
      </div>
    </div>
  );
};

export default Dashboard;
