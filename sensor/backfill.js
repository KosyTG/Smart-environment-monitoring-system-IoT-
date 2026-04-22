import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import lagosWeekData from './seeds/lagosWeekData.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BATCH_URL = `${BASE_URL}/api/readings/batch`;
const DEVICE_ID = process.env.DEVICE_ID || 'lagos-sensor-01';
const LOCATION = 'Lagos, Nigeria';

const getTemp = (h, min, max) => {
    const avg = (max + min) / 2;
    const amp = (max - min) / 2;
    const phase = h >= 5 && h <= 14
        ? -Math.PI / 2 + ((h - 5) / 9) * Math.PI
        : Math.PI / 2 + (((h > 14 ? h : h + 24) - 14) / 15) * Math.PI;
    return avg + amp * Math.sin(phase);
};

const getHumidity = (h, min, max) => {
    const avg = (max + min) / 2;
    const amp = (max - min) / 2;
    const phase = h >= 6 && h <= 14
        ? Math.PI / 2 - ((h - 6) / 8) * Math.PI
        : -Math.PI / 2 - (((h > 14 ? h : h + 24) - 14) / 16) * Math.PI;
    return avg + amp * Math.sin(phase);
};

async function backfill() {
    const readings = [];
    const startDate = new Date('2026-04-13T00:00:00+01:00'); // WAT (Lagos) timezone

    for (let i = 0; i < 168; i++) {
        const currentDate = new Date(startDate.getTime() + i * 60 * 60 * 1000);

        // Calculate the local date string (YYYY-MM-DD) for Lagos (UTC+1)
        const watDate = new Date(currentDate.getTime() + 60 * 60 * 1000);
        const dateStr = `${watDate.getUTCFullYear()}-${String(watDate.getUTCMonth() + 1).padStart(2, '0')}-${String(watDate.getUTCDate()).padStart(2, '0')}`;

        // Find the specific daily baselines from the seed data
        const dayData = lagosWeekData.find(d => d.date === dateStr);
        if (!dayData) {
            console.warn(`No seed data found for date ${dateStr}, skipping hour.`);
            continue;
        }

        const h = (currentDate.getUTCHours() + 1) % 24;

        let temperature = getTemp(h, dayData.minTempC, dayData.maxTempC) + (Math.random() * 3 - 1.5);
        let humidity = getHumidity(h, dayData.minHumidity, dayData.maxHumidity) + (Math.random() * 3 - 1.5);

        // Ensure values remain within realistic absolute bounds
        temperature = Math.max(20, Math.min(45, temperature));
        humidity = Math.max(0, Math.min(100, humidity));

        readings.push({
            temperature: parseFloat(temperature.toFixed(2)),
            humidity: parseFloat(humidity.toFixed(2)),
            timestamp: currentDate.toISOString(),
            location: LOCATION
        });
    }

    try {
        const payload = {
            device_id: DEVICE_ID,
            readings: readings
        };

        console.log(`Sending backfill data to ${BATCH_URL}...`);
        const response = await axios.post(BATCH_URL, payload);

        if (response.status >= 200 && response.status < 300) {
            console.log(`Backfill complete: ${readings.length} readings sent`);
        } else {
            console.error(`Failed to backfill. Status: ${response.status}`);
        }
    } catch (err) {
        console.error('Full error:', err.message);
        console.error('Code:', err.code);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Body:', JSON.stringify(err.response.data));
        }
    }

}

backfill();
