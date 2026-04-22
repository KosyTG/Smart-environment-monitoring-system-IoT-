import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAlertStream() {
  const [alerts, setAlerts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // 1. Fetch initial alerts
    const fetchInitialAlerts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/alerts?limit=50');
        setAlerts(res.data);
      } catch (err) {
        console.error('Error fetching initial alerts:', err);
      }
    };

    fetchInitialAlerts();

    // 2. Open EventSource for real-time alerts
    const eventSource = new EventSource('http://localhost:3000/api/alerts/stream');

    eventSource.addEventListener('alert', (e) => {
      try {
        const newAlert = JSON.parse(e.data);
        setAlerts((prev) => {
          // Prepend and keep a maximum limit
          const updated = [newAlert, ...prev];
          return updated.slice(0, 100); // keep up to 100 in memory
        });

        // Show toast notification
        let breachDetails = '';
        if (newAlert.temperature >= 34) {
          breachDetails += `Temp: ${newAlert.temperature}°C `;
        }
        if (newAlert.humidity >= 88) {
          breachDetails += `Hum: ${newAlert.humidity}%`;
        }
        
        const msg = `Alert on ${newAlert.device_id}: ${breachDetails.trim()}`;
        setToast({ id: Date.now(), message: msg });
      } catch (err) {
        console.error('Error parsing SSE alert data:', err);
      }
    });

    eventSource.addEventListener('heartbeat', () => {
      // Keep-alive heartbeat, no UI update needed
    });

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return { alerts, toast };
}
