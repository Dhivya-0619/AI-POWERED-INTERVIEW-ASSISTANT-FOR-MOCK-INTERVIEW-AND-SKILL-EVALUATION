import React from 'react';

const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="w-full h-64 md:h-72 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
