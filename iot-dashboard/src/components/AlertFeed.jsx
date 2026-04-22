import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';

export default function AlertFeed({ alerts }) {
  const [filter, setFilter] = useState('All'); // All, Temperature, Humidity, Critical

  const parsedAlerts = useMemo(() => {
    if (!alerts) return [];
    
    const events = [];
    
    alerts.forEach(a => {
      // Temperature logic
      if (a.temperature >= 34) {
        const isCritical = a.temperature > 36;
        events.push({
          id: `${a.id}-temp`,
          type: 'Temperature',
          icon: '🌡',
          value: a.temperature.toFixed(1),
          limit: isCritical ? 36 : 34,
          unit: '°C',
          severity: isCritical ? 'Critical' : 'Warning',
          timestamp: a.timestamp,
          device_id: a.device_id,
          location: a.location || 'Unknown Location'
        });
      }
      
      // Humidity logic
      if (a.humidity >= 88) {
        const isCritical = a.humidity > 92;
        events.push({
          id: `${a.id}-hum`,
          type: 'Humidity',
          icon: '💧',
          value: a.humidity.toFixed(1),
          limit: isCritical ? 92 : 88,
          unit: '%',
          severity: isCritical ? 'Critical' : 'Warning',
          timestamp: a.timestamp,
          device_id: a.device_id,
          location: a.location || 'Unknown Location'
        });
      }
    });
    
    // Sort newest first
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts]);

  // Filtering logic
  const filteredAlerts = useMemo(() => {
    switch (filter) {
      case 'Temperature': return parsedAlerts.filter(a => a.type === 'Temperature');
      case 'Humidity': return parsedAlerts.filter(a => a.type === 'Humidity');
      case 'Critical': return parsedAlerts.filter(a => a.severity === 'Critical');
      case 'All':
      default: return parsedAlerts;
    }
  }, [parsedAlerts, filter]);

  const displayAlerts = filteredAlerts.slice(0, 50);
  const hiddenCount = filteredAlerts.length - 50;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
      {/* Header & Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Triggered Alerts</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Temperature', 'Humidity', 'Critical Only'].map(f => {
            const val = f === 'Critical Only' ? 'Critical' : f;
            const isActive = filter === val;
            return (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                  background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed List Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="alert-feed-scroll">
        {displayAlerts.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '1rem' }}>✨</div>
            <p>No alerts in this period</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayAlerts.map(alert => (
              <div 
                key={alert.id}
                className="alert-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `4px solid ${alert.severity === 'Critical' ? '#ff3366' : '#ffaa00'}`,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0 8px 8px 0',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem' }}>
                  {alert.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-bright)', marginBottom: '0.25rem' }}>
                        {alert.value}{alert.unit} &gt; {alert.limit}{alert.unit} limit
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {alert.device_id} • {alert.location}
                      </div>
                    </div>
                    
                    <div 
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                        background: alert.severity === 'Critical' ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 170, 0, 0.15)',
                        color: alert.severity === 'Critical' ? '#ff3366' : '#ffaa00',
                        border: `1px solid ${alert.severity === 'Critical' ? 'rgba(255, 51, 102, 0.3)' : 'rgba(255, 170, 0, 0.3)'}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {alert.severity}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', opacity: 0.8 }}>
                    {format(new Date(alert.timestamp), "MMM d, yyyy '·' h:mm a")}
                  </div>
                </div>
              </div>
            ))}
            
            {hiddenCount > 0 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <a href="#all-alerts" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                  View all {filteredAlerts.length} alerts →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        .alert-feed-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .alert-feed-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .alert-feed-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .alert-feed-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .alert-card:hover {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
