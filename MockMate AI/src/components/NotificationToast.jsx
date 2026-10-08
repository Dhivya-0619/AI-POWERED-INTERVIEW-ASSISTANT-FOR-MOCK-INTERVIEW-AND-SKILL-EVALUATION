import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-900 text-white border-emerald-700',
    error: 'bg-rose-900 text-white border-rose-700',
    info: 'bg-slate-900 text-white border-slate-700',
    warning: 'bg-amber-900 text-white border-amber-700'
  }[type] || 'bg-slate-900 text-white border-slate-700';

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
  }[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl max-w-md ${styles}`}>
        {icons}
        <span className="text-xs font-semibold leading-snug">{message}</span>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:opacity-75 ml-auto">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
