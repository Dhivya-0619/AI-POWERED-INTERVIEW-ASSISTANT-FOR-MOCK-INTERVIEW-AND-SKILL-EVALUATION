import React from 'react';
import { Calendar, Clock, HelpCircle, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import Button from './Button';

const InterviewCard = ({ session, onSelect, actionText = 'View Evaluation', isSetupCard = false }) => {
  if (isSetupCard) {
    const { title, description, icon: Icon, selected, onClick, badge } = session;
    return (
      <div
        onClick={onClick}
        className={`card cursor-pointer transition-all border-2 ${
          selected
            ? 'border-indigo-600 bg-indigo-50/40 shadow-md'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {badge && (
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 mt-4 font-heading">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600">
          <span>{selected ? 'Selected' : 'Select Option'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
            {session.type}
          </span>
          <ScoreBadge score={session.score} />
        </div>

        <h3 className="font-bold text-slate-900 text-base font-heading mt-2">{session.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{session.role}</p>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.questionsCount} Questions</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Button variant="outline" size="sm" fullWidth onClick={() => onSelect(session)} icon={ArrowRight}>
          {actionText}
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard;
