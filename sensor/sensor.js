import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEVICE_ID = process.env.DEVICE_ID || 'lagos-sensor-01';
const LOCATION = 'Lagos, Nigeria';

const BASE_TEMP = 29;
const BASE_HUMIDITY = 82;

function generateReading() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const timeInHours = hours + minutes / 60 + seconds / 3600;
    const timeOffsetHours = timeInHours - 8; // Peak temperature around 14:00 (2 PM)

    // Sine wave from -1 to 1 over 24 hours
    const diurnalSine = Math.sin((timeOffsetHours / 24) * 2 * Math.PI);

    // Temperature: between 27°C and 33°C, base 29°C
    const tempAmplitude = diurnalSine > 0 ? 4 : 2;
    let temperature = BASE_TEMP + (tempAmplitude * diurnalSine);

    // Humidity: between 64% and 91%, base 82%, inversely correlated with temperature
    const humAmplitude = diurnalSine > 0 ? 18 : 9;
    let humidity = BASE_HUMIDITY - (humAmplitude * diurnalSine);

    // Add small random noise for realism
    temperature += (Math.random() * 0.4 - 0.2);
    humidity += (Math.random() * 1.5 - 0.75);

    // Ensure within absolute bounds
    temperature = Math.max(27, Math.min(33, temperature));
    humidity = Math.max(64, Math.min(91, humidity));

    return {
        device_id: DEVICE_ID,
        location: LOCATION,
        temperature: parseFloat(temperature.toFixed(2)),
        humidity: parseFloat(humidity.toFixed(2)),
        timestamp: now.toISOString()
    };
}

async function sendReading() {
    const reading = generateReading();
    try {
        const response = await axios.post(`${BASE_URL}/api/readings`, reading);
        console.log(`[${reading.timestamp}] Sent reading: temp=${reading.temperature}°C, hum=${reading.humidity}% - Status: ${response.status}`);
    } catch (error) {
        // Expected to fail if no local server is listening
        console.error(`[${reading.timestamp}] Failed to send reading: ${error.message}`);
    }
}

console.log(`Starting IoT Sensor Simulator...`);
console.log(`Device ID: ${DEVICE_ID}`);
console.log(`Target URL: ${BASE_URL}`);

sendReading();
setInterval(sendReading, 10000);
