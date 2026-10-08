import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_PERFORMANCE_HISTORY, MOCK_SKILL_SUMMARY } from '../data/mockData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  Filter,
  ArrowRight,
  Brain,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Search
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import ScoreBadge from '../components/ScoreBadge';
import Button from '../components/Button';

const Progress = () => {
  const { sessionHistory } = useAuth();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = sessionHistory.filter(s => {
    const matchesFilter = filterType === 'All' || s.type === filterType;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns = [
    {
      header: 'Session Title & Role',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-400">{row.role}</p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'type',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
          {row.type}
        </span>
      )
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Duration', accessor: 'duration' },
    {
      header: 'Score',
      accessor: 'score',
      render: (row) => <ScoreBadge score={row.score} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => navigate('/evaluation')}>
          View Report
        </Button>
      )
    }
  ];

  const categoryAverageData = [
    { category: 'Technical', score: 88 },
    { category: 'HR Round', score: 84 },
    { category: 'Behavioral', score: 82 },
    { category: 'Coding', score: 86 }
  ];

  return (
    <div className="space-y-8 text-left">
      <PageHeader
        title="Progress Analytics & History"
        description="Monitor performance over time, analyze average scores by category, and filter your practice logs."
        badgeText="Analytics Engine"
        actions={
          <Button variant="primary" onClick={() => navigate('/interview-setup')} icon={RotateCcw} className="shimmer-effect">
            Start New Practice
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Interviews"
          value={sessionHistory.length}
          subtitle="Completed attempts"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Average Score"
          value="84%"
          subtitle="Across all rounds"
          trend="+12% growth"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Best Score"
          value="88%"
          subtitle="Java Full Stack Round"
          icon={Zap}
          color="violet"
        />
        <StatCard
          title="Total Practice Time"
          value="18.5 hrs"
          subtitle="Mock session duration"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Line Chart over Time */}
        <ChartCard
          title="Interview Performance Over Time"
          subtitle="Line chart tracking evaluation scores across dates"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_PERFORMANCE_HISTORY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
              />
              <Line type="monotone" dataKey="score" name="Overall Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="technical" name="Technical" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Average Bar Chart */}
        <ChartCard
          title="Average Score by Category"
          subtitle="Performance comparison across technical, HR, and behavioral rounds"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryAverageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
              />
              <Bar dataKey="score" name="Average Score %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Personalized Suggestions Card */}
      <div className="card bg-slate-900 text-white p-6 border-slate-800">
        <h3 className="font-bold text-base font-heading mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Personalized Improvement Suggestions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <span className="text-indigo-400 font-bold block mb-1">Focus Area #1</span>
            Practice system design microservices scalability questions to boost technical depth.
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <span className="text-indigo-400 font-bold block mb-1">Focus Area #2</span>
            Structure non-technical answers strictly using the STAR methodology (Situation, Task, Action, Result).
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <span className="text-indigo-400 font-bold block mb-1">Focus Area #3</span>
            Incorporate time complexity (Big-O notation) in algorithmic answers.
          </div>
        </div>
      </div>

      {/* Filterable & Searchable Interview History Log Table */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">
              Complete Interview History Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter and search through past mock sessions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['All', 'Technical', 'HR', 'Behavioral'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filterType === type
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => navigate('/evaluation')}
        />
      </div>
    </div>
  );
};

export default Progress;
