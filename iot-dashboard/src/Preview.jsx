import React, { useState, useEffect } from 'react';
import TemperatureChart from './components/TemperatureChart';
import HumidityChart from './components/HumidityChart';
import './index.css';

const getTemp = (h) => {
    const min = 27; const max = 33;
    const avg = (max + min) / 2;
    const amp = (max - min) / 2;
    const phase = h >= 5 && h <= 14 
        ? -Math.PI/2 + ((h - 5) / 9) * Math.PI
        : Math.PI/2 + (((h > 14 ? h : h + 24) - 14) / 15) * Math.PI;
    return avg + amp * Math.sin(phase);
};

const getHumidity = (h) => {
    const min = 64; const max = 91;
    const avg = (max + min) / 2;
    const amp = (max - min) / 2;
    const phase = h >= 6 && h <= 14 
        ? Math.PI/2 - ((h - 6) / 8) * Math.PI
        : -Math.PI/2 - (((h > 14 ? h : h + 24) - 14) / 16) * Math.PI;
    return avg + amp * Math.sin(phase);
};

export default function Preview() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const seeded = [];
    const startDate = new Date('2026-04-13T00:00:00+01:00'); // WAT Time
    
    for (let i = 0; i < 168; i++) {
        const currentDate = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const h = (currentDate.getUTCHours() + 1) % 24;
        
        let temperature = getTemp(h) + (Math.random() * 3 - 1.5);
        let humidity = getHumidity(h) + (Math.random() * 3 - 1.5);
        
        seeded.push({
            temperature: parseFloat(temperature.toFixed(2)),
            humidity: parseFloat(humidity.toFixed(2)),
            timestamp: currentDate.toISOString(),
            alert: temperature > 34 || humidity > 88
        });
    }
    // Sort descending to match the shape expected by charts (which reverse it back)
    setReadings(seeded.reverse());
  }, []);

  if (readings.length === 0) return <div>Loading Preview...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lagos 7-Day Chart Preview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Simulated data for April 13-19, 2026</p>
        </div>
        <button 
          onClick={() => window.location.hash = ''} 
          style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}
        >
          Return to Live Dashboard
        </button>
      </header>
      <section className="charts-row">
        <TemperatureChart readings={readings} />
        <HumidityChart readings={readings} />
      </section>
    </div>
  );
}
