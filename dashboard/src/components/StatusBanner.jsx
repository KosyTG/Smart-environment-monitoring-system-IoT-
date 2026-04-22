import React from 'react';

export default function StatusBanner({ latestReading }) {
  if (!latestReading) return null;

  const isAlert = latestReading.alert;

  return (
    <div className={`status-banner ${isAlert ? '' : 'safe'}`}>
      <div className="status-icon">
        {isAlert ? '🚨' : '✅'}
      </div>
      <div>
        <h3 style={{ margin: 0, fontWeight: 600 }}>
          {isAlert ? 'Active Environmental Alert' : 'System Normal'}
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          {isAlert 
            ? `Critical threshold exceeded at ${new Date(latestReading.timestamp).toLocaleTimeString()}`
            : 'All environmental metrics are within safe operating ranges.'}
        </p>
      </div>
    </div>
  );
}
