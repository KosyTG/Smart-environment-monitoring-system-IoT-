import { useState } from 'react'
import './App.css'
import { useReadings } from './hooks/useReadings';
import { useAlerts } from './hooks/useAlerts';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const { readings, latestReading, error: readingsError, lastFetchTime: readingsTime, refetch: refetchReadings } = useReadings();
  const { alerts, error: alertsError, lastFetchTime: alertsTime, refetch: refetchAlerts } = useAlerts();

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>IoT Dashboard</h1>
        {/* We pass the readings status to the indicator, as it polls every 10s */}
        <ConnectionStatus error={readingsError} lastFetchTime={readingsTime} />
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <button onClick={refetchReadings} style={{ marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Manual Refetch Readings
        </button>
        <button onClick={refetchAlerts} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Manual Refetch Alerts
        </button>
      </section>

      <section>
        <h2>Latest Reading ({readings.length} total)</h2>
        {latestReading ? (
          <pre style={{ background: '#f4f4f4', color: '#333', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
            {JSON.stringify(latestReading, null, 2)}
          </pre>
        ) : (
          <p>No readings available.</p>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Active Alerts ({alerts.length})</h2>
        {alerts.length > 0 ? (
          <ul style={{ background: '#fff0f0', color: '#d00', padding: '1rem', borderRadius: '8px', listStyle: 'none' }}>
            {alerts.slice(0, 5).map(a => (
              <li key={a.id} style={{ marginBottom: '0.5rem' }}>
                <strong>Alert at {a.timestamp}:</strong> {a.temperature}°C, {a.humidity}%
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts right now.</p>
        )}
      </section>
    </div>
  )
}

export default App
