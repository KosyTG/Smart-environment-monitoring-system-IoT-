import React, { useState, useEffect } from 'react';
import './index.css';
import { useReadings } from './hooks/useReadings';
import { useAlertStream } from './hooks/useAlertStream'; // Using the SSE stream we just built
import StatusBanner from './components/StatusBanner';
import MetricCard from './components/MetricCard';
import TemperatureChart from './components/TemperatureChart';
import HumidityChart from './components/HumidityChart';
import AlertFeed from './components/AlertFeed';
import Preview from './Preview';

function App() {
  const [hash, setHash] = useState(window.location.hash);
  
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash === '#preview') {
    return <Preview />;
  }

  // 1. Imports useReadings and our realtime alerts hook
  const { readings, latestReading, loading } = useReadings();
  const { alerts, toast } = useAlertStream();

  if (loading && readings.length === 0) {
    return (
      <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2>Initializing Telemetry...</h2>
      </div>
    );
  }

  // 2. Calculate 24H High Temp
  const highTemp = readings.length > 0 
    ? Math.max(...readings.map(r => r.temperature))
    : '--';

  return (
    <div className="dashboard-container">
      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          background: 'rgba(255, 51, 102, 0.9)', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontWeight: 'bold', animation: 'fadeIn 0.3s ease-out'
        }}>
          ⚠️ {toast.message}
        </div>
      )}

      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lagos Sensor Telemetry</h1>
          <p style={{ color: 'var(--text-muted)' }}>Live environment monitoring dashboard</p>
        </div>
        <button 
          onClick={() => window.location.hash = '#preview'} 
          style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', cursor: 'pointer' }}
        >
          View 7-Day Chart Preview
        </button>
      </header>

      {/* 5. Shows a StatusBanner at the top if latestReading.alert === true */}
      {latestReading?.alert === true && (
        <StatusBanner latestReading={latestReading} />
      )}

      {/* 2. Shows 4 metric cards in a row */}
      <section className="metrics-row">
        <MetricCard 
          title="Current Temp" 
          value={latestReading?.temperature} 
          unit="°C" 
          colorClass="metric-value-cyan"
        />
        <MetricCard 
          title="Current Humidity" 
          value={latestReading?.humidity} 
          unit="%" 
          colorClass="metric-value-magenta"
        />
        <MetricCard 
          title="24h High Temp" 
          value={highTemp} 
          unit="°C" 
          colorClass="metric-value-yellow"
        />
        <MetricCard 
          title="Active Alerts" 
          value={alerts.length} 
          unit="" 
          colorClass={alerts.length > 0 ? "metric-value-red" : "metric-value-green"}
        />
      </section>

      {/* 3. Shows TemperatureChart and HumidityChart side by side */}
      <section className="charts-row">
        <TemperatureChart readings={readings} />
        <HumidityChart readings={readings} />
      </section>

      {/* 4. Shows AlertFeed component at the bottom passing alerts as prop */}
      <section style={{ gridColumn: '1 / -1' }}>
        <AlertFeed alerts={alerts} />
      </section>
    </div>
  );
}

export default App;
