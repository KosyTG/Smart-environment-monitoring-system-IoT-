import React, { useState, useEffect } from 'react';

export default function ConnectionStatus({ error, lastFetchTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Update the 'now' state every second so the yellow 'stale' condition evaluates in real-time
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  let status = 'live';
  let color = '#00ff66'; // green
  let text = 'Live';

  // Evaluate conditions
  if (error) {
    status = 'error';
    color = '#ff3333'; // red
    text = 'Fetch Failed';
  } else if (lastFetchTime && (now - lastFetchTime) > 30000) {
    status = 'stale';
    color = '#ffcf00'; // yellow
    text = `Stale (>30s ago)`;
  } else if (!lastFetchTime) {
    status = 'loading';
    color = '#9ba1b0'; // grey
    text = 'Connecting...';
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      fontSize: '14px', 
      background: 'rgba(0,0,0,0.1)', 
      padding: '0.5rem 1rem', 
      borderRadius: '20px',
      border: `1px solid ${color}`
    }}>
      <span style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`
      }}></span>
      <span>{text}</span>
    </div>
  );
}
