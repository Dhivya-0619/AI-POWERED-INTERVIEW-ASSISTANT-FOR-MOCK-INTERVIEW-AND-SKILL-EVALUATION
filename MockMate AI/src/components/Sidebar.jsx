import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sliders,
  PlayCircle,
  Award,
  TrendingUp,
  User,
  HelpCircle,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analysis', path: '/resume', icon: FileText },
    { label: 'Interview Setup', path: '/interview-setup', icon: Sliders },
    { label: 'Mock Interview', path: '/mock-interview', icon: PlayCircle },
    { label: 'Evaluation', path: '/evaluation', icon: Award },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Help', path: '#help', icon: HelpCircle },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-[#0a1628] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-white/5 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-[15.5rem]'}`}
      >
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
            <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-900/40 shrink-0">
                <span className="font-heading text-lg text-white leading-none pt-0.5">M</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-heading text-xl text-white tracking-tight leading-none">
                    MockMate
                  </span>
                  <span className="text-[9px] text-teal-300/80 font-semibold tracking-[0.14em] uppercase mt-1">
                    Interview Lab
                  </span>
                </div>
              )}
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-0.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[13px] transition-all ${
                      isActive && item.path !== '#help'
                        ? 'bg-teal-500/15 text-teal-200 font-semibold border border-teal-400/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {!isCollapsed && (
          <div className="p-4 m-3 rounded-2xl bg-white/[0.03] border border-white/8 text-left">
            <p className="text-[11px] font-semibold text-slate-200">Practice workspace</p>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5">
              Resume analysis, interview setup, and personalized questions.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
