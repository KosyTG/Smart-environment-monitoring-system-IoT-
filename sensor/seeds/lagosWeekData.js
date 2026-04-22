const lagosWeekData = [
  // Each entry: { date, avgTempC, maxTempC, minTempC, avgHumidity, maxHumidity, minHumidity }
  { date: "2026-04-13", avgTempC: 29, maxTempC: 33, minTempC: 27, avgHumidity: 82, maxHumidity: 89, minHumidity: 66 },
  { date: "2026-04-14", avgTempC: 29, maxTempC: 32, minTempC: 27, avgHumidity: 83, maxHumidity: 90, minHumidity: 67 },
  { date: "2026-04-15", avgTempC: 30, maxTempC: 33, minTempC: 27, avgHumidity: 81, maxHumidity: 88, minHumidity: 65 },
  { date: "2026-04-16", avgTempC: 29, maxTempC: 32, minTempC: 27, avgHumidity: 84, maxHumidity: 91, minHumidity: 68 },
  { date: "2026-04-17", avgTempC: 30, maxTempC: 33, minTempC: 28, avgHumidity: 82, maxHumidity: 90, minHumidity: 64 },
  { date: "2026-04-18", avgTempC: 29, maxTempC: 31, minTempC: 27, avgHumidity: 85, maxHumidity: 91, minHumidity: 70 },
  { date: "2026-04-19", avgTempC: 29, maxTempC: 31, minTempC: 27, avgHumidity: 83, maxHumidity: 90, minHumidity: 64 },
];

// Alert thresholds tuned for Lagos April climate
export const THRESHOLDS = {
  TEMP_HIGH: 34,     // feels-like threshold, above is dangerous
  TEMP_LOW: 21,      // unusually cold
  HUMIDITY_HIGH: 88, // oppressive / mold risk
  HUMIDITY_LOW: 50,  // unusually dry
};

export default lagosWeekData;
