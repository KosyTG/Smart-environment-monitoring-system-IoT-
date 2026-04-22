import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  annotationPlugin
);

export default function TemperatureChart({ readings }) {
  if (!readings || readings.length === 0) return null;
  
  // Filter for last 24h of data based on the latest reading
  const latestTime = new Date(readings[0].timestamp).getTime();
  const last24h = readings.filter(r => (latestTime - new Date(r.timestamp).getTime()) <= 24 * 60 * 60 * 1000).reverse();

  const hasAlert = last24h.some(r => r.temperature > 34);
  const lineColor = hasAlert ? '#ff3333' : '#00ff66';
  const bgColor = hasAlert ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 255, 102, 0.1)';

  const data = {
    labels: last24h.map(r => format(new Date(r.timestamp), 'HH:mm')),
    datasets: [
      {
        fill: true,
        label: 'Temperature (°C)',
        data: last24h.map(r => r.temperature),
        borderColor: lineColor,
        backgroundColor: bgColor,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          title: (context) => `Time: ${context[0].label}`,
          label: function(context) {
            const raw = context.raw;
            const alertText = raw > 34 ? ' ⚠ Alert' : '';
            return `Temp: ${raw}°C${alertText}`;
          }
        }
      },
      annotation: {
        annotations: {
          threshold: {
            type: 'line',
            yMin: 34,
            yMax: 34,
            borderColor: '#ff3333',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: '34°C Limit',
              position: 'end'
            }
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ba1b0' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ba1b0', maxTicksLimit: 12 }
      }
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Temperature (24h)</h3>
      <div style={{ height: '240px', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
