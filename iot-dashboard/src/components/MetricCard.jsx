import React from 'react';

export default function MetricCard({ title, value, unit, colorClass }) {
  return (
    <div className="glass-panel">
      <div className="metric-card-title">{title}</div>
      <div className={`metric-card-value ${colorClass}`}>
        {value !== undefined && value !== null ? value : '--'}
        <span className="metric-card-unit">{unit}</span>
      </div>
    </div>
  );
}