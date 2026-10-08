import React from 'react';

const ScoreBadge = ({ score, size = 'md' }) => {
  let badgeStyle = 'badge-neutral';
  let label = 'Needs Practice';

  if (score >= 85) {
    badgeStyle = 'badge-success';
    label = 'Excellent';
  } else if (score >= 70) {
    badgeStyle = 'badge-primary';
    label = 'Good';
  } else if (score >= 50) {
    badgeStyle = 'badge-warning';
    label = 'Average';
  } else {
    badgeStyle = 'badge-danger';
    label = 'Needs Work';
  }

  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`badge ${badgeStyle} ${sizeClass}`}>
      <span className="font-bold">{score}%</span> • {label}
    </span>
  );
};

export default ScoreBadge;
