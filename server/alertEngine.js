require('dotenv').config();

const getThresholds = () => ({
  tempHigh: parseFloat(process.env.TEMP_ALERT_HIGH) || 34,
  tempLow: parseFloat(process.env.TEMP_ALERT_LOW) || 21,
  humidityHigh: parseFloat(process.env.HUMIDITY_ALERT_HIGH) || 88,
  humidityLow: parseFloat(process.env.HUMIDITY_ALERT_LOW) || 50
});

const evaluateReading = (reading) => {
  const thresholds = getThresholds();
  const reasons = [];
  
  if (reading.temperature !== undefined) {
    if (reading.temperature > thresholds.tempHigh) {
      reasons.push(`Temperature ${reading.temperature}°C exceeds max threshold ${thresholds.tempHigh}°C`);
    } else if (reading.temperature < thresholds.tempLow) {
      reasons.push(`Temperature ${reading.temperature}°C is below min threshold ${thresholds.tempLow}°C`);
    }
  }

  if (reading.humidity !== undefined) {
    if (reading.humidity > thresholds.humidityHigh) {
      reasons.push(`Humidity ${reading.humidity}% exceeds max threshold ${thresholds.humidityHigh}%`);
    } else if (reading.humidity < thresholds.humidityLow) {
      reasons.push(`Humidity ${reading.humidity}% is below min threshold ${thresholds.humidityLow}%`);
    }
  }

  return {
    alert: reasons.length > 0,
    reasons
  };
};

const getAlertSummary = (readings) => {
  const summary = {
    total: 0,
    byType: {
      highTemp: 0,
      lowTemp: 0,
      highHumidity: 0,
      lowHumidity: 0
    }
  };

  const thresholds = getThresholds();

  for (const r of readings) {
    let triggered = false;
    
    if (r.temperature !== undefined) {
      if (r.temperature > thresholds.tempHigh) {
        summary.byType.highTemp++;
        triggered = true;
      } else if (r.temperature < thresholds.tempLow) {
        summary.byType.lowTemp++;
        triggered = true;
      }
    }

    if (r.humidity !== undefined) {
      if (r.humidity > thresholds.humidityHigh) {
        summary.byType.highHumidity++;
        triggered = true;
      } else if (r.humidity < thresholds.humidityLow) {
        summary.byType.lowHumidity++;
        triggered = true;
      }
    }

    if (triggered) {
      summary.total++;
    }
  }

  return summary;
};

module.exports = {
  evaluateReading,
  getAlertSummary
};
