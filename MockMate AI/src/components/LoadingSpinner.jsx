import React from 'react';
import { Loader2, Brain } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading AI Module...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
          <Brain className="w-7 h-7 text-indigo-600 animate-pulse" />
        </div>
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin absolute" />
      </div>
      <p className="text-sm font-bold text-slate-800 font-heading">{text}</p>
      <p className="text-xs text-slate-400 mt-1">Please wait while processing demo analytics...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
