import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const BASE_URL = 'https://smart-environment-monitoring-system-iot-production.up.railway.app';
      const res = await axios.get(
        `${BASE_URL}/api/alerts?t=${Date.now()}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );

      setAlerts(res.data);
      setError(null);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, loading, error, lastFetchTime, refetch: fetchAlerts };
}
