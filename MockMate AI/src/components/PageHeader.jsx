import React from 'react';

const PageHeader = ({ title, description, actions, badgeText }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-2 pb-8 border-b border-slate-200/80">
      <div className="min-w-0 max-w-3xl">
        {badgeText && (
          <span className="inline-flex mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md">
            {badgeText}
          </span>
        )}
        <h1 className="text-2xl md:text-[2rem] text-slate-900 tracking-tight font-heading leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 text-sm md:text-[0.95rem] mt-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0 pt-1">{actions}</div>}
    </div>
  );
};

export default PageHeader;
