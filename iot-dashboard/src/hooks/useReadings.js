import { useState, useEffect } from 'react';
import axios from 'axios';

export function useReadings() {
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/readings?limit=144');
        setReadings(res.data);
        if (res.data.length > 0) {
          setLatestReading(res.data[0]); // sorted by timestamp DESC
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching readings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 10000);
    return () => clearInterval(interval);
  }, []);

  return { readings, latestReading, loading, error };
}
