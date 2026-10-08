import React from 'react';
import { FileQuestion } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No records found',
  description = 'There are currently no items to display.',
  actionText,
  onAction
}) => {
  return (
    <div className="card flex flex-col items-center justify-center text-center p-8 md:p-12 my-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 font-heading">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
