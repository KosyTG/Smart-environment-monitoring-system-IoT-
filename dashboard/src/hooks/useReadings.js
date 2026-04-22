import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchReadings = useCallback(async () => {
    try {
      const BASE_URL = 'https://smart-environment-monitoring-system-iot-production.up.railway.app';
      const res = await axios.get(`${BASE_URL}/api/readings?limit=144&device_id=lagos-sensor-01`);
      setReadings(res.data);
      setError(null);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [fetchReadings]);

  // Dynamically derive the latest reading
  const latestReading = readings[0] || null;

  return { readings, latestReading, loading, error, lastFetchTime, refetch: fetchReadings };
}