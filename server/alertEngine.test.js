const { evaluateReading, getAlertSummary } = require('./alertEngine');

describe('alertEngine', () => {
  beforeEach(() => {
    // Reset env vars to known state for tests
    process.env.TEMP_ALERT_HIGH = '34';
    process.env.TEMP_ALERT_LOW = '21';
    process.env.HUMIDITY_ALERT_HIGH = '88';
    process.env.HUMIDITY_ALERT_LOW = '50';
  });

  describe('evaluateReading()', () => {
    test('normal reading (no alert)', () => {
      const result = evaluateReading({ temperature: 30, humidity: 70 });
      expect(result.alert).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    test('high temp only', () => {
      const result = evaluateReading({ temperature: 35.2, humidity: 70 });
      expect(result.alert).toBe(true);
      expect(result.reasons).toEqual([
        'Temperature 35.2°C exceeds max threshold 34°C'
      ]);
    });

    test('high humidity only', () => {
      const result = evaluateReading({ temperature: 30, humidity: 90 });
      expect(result.alert).toBe(true);
      expect(result.reasons).toEqual([
        'Humidity 90% exceeds max threshold 88%'
      ]);
    });

    test('both triggered simultaneously', () => {
      const result = evaluateReading({ temperature: 35.2, humidity: 90 });
      expect(result.alert).toBe(true);
      expect(result.reasons).toEqual([
        'Temperature 35.2°C exceeds max threshold 34°C',
        'Humidity 90% exceeds max threshold 88%'
      ]);
    });
    
    test('low temp and low humidity', () => {
      const result = evaluateReading({ temperature: 20, humidity: 40 });
      expect(result.alert).toBe(true);
      expect(result.reasons).toEqual([
        'Temperature 20°C is below min threshold 21°C',
        'Humidity 40% is below min threshold 50%'
      ]);
    });
  });

  describe('getAlertSummary()', () => {
    test('summarizes correctly', () => {
      const readings = [
        { temperature: 30, humidity: 70 }, // normal
        { temperature: 35, humidity: 70 }, // high temp
        { temperature: 35, humidity: 90 }, // high temp, high hum
        { temperature: 20, humidity: 40 }, // low temp, low hum
        { temperature: 30, humidity: 45 }  // low hum
      ];
      
      const summary = getAlertSummary(readings);
      expect(summary.total).toBe(4);
      expect(summary.byType).toEqual({
        highTemp: 2,
        lowTemp: 1,
        highHumidity: 1,
        lowHumidity: 2
      });
    });
  });
});
