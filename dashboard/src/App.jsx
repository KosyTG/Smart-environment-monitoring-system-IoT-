import React, { useState } from 'react';
import './App.css';
import { useReadings } from './hooks/useReadings';
import { useAlerts } from './hooks/useAlerts';
import TemperatureChart from './components/TemperatureChart';
import HumidityChart from './components/HumidityChart';
import AlertFeed from './components/AlertFeed';
import MetricCard from './components/MetricCard';
import StatusBanner from './components/StatusBanner';

export default function App() {
  const { readings, latestReading, error: readingsError } = useReadings();
  const { alerts, error: alertsError } = useAlerts();

  // Status computation for the connection dot
  const isConnected = !readingsError && !alertsError;

  const highTemp = readings.length > 0 ? Math.max(...readings.map(r => r.temperature)) : '--';

  return (
    <div style={{
      backgroundColor: '#0d0d1a',
      color: '#f3f4f6',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 1. HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ color: '#00f0ff', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              Lagos Sensor Telemetry
            </h1>
            <p style={{ color: '#9ca3af', margin: 0 }}>Live environment monitoring dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#00ff66' : '#ff3333',
                boxShadow: `0 0 8px ${isConnected ? '#00ff66' : '#ff3333'}`
              }}></span>
              {isConnected ? 'Connected' : 'Connection Error'}
            </div>
            <button style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              View 7-Day Chart Preview
            </button>
          </div>
        </header>

        {/* 2. STATUS BANNER */}
        {latestReading?.alert === true && (
          <div style={{
            width: '100%',
            backgroundColor: 'rgba(255, 51, 51, 0.1)',
            border: '1px solid #ff3333',
            borderLeft: '4px solid #ff3333',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: '#ff3333',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            Active Environmental Alert - Critical threshold exceeded at {new Date(latestReading.timestamp).toLocaleTimeString()}
          </div>
        )}

        {/* 3. METRIC CARDS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
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
            title="24H High Temp"
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
        </div>

        {/* 4. CHARTS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem' }}>
              <TemperatureChart readings={readings} />
            </div>
          </div>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem' }}>
              <HumidityChart readings={readings} />
            </div>
          </div>
        </div>

        {/* 5. ALERT FEED */}
        <div style={{ marginTop: '0.5rem' }}>
          <AlertFeed alerts={alerts} />
        </div>

      </div>
    </div>
  );
}
