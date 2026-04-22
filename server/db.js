const Database = require('better-sqlite3');

const db = new Database('environment.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    location TEXT,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    timestamp TEXT NOT NULL,
    alert INTEGER DEFAULT 0
  );
`);

// Create indexes
db.exec(`CREATE INDEX IF NOT EXISTS idx_device_timestamp ON readings(device_id, timestamp);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_alert_timestamp ON readings(alert, timestamp);`);

const stmts = {
  insert: db.prepare(`
    INSERT INTO readings (device_id, location, temperature, humidity, timestamp, alert)
    VALUES (@device_id, @location, @temperature, @humidity, @timestamp, @alert)
  `),

  getReadings: db.prepare(`
    SELECT * FROM readings 
    WHERE (@device_id IS NULL OR device_id = @device_id)
      AND (@from_date IS NULL OR timestamp >= @from_date)
      AND (@to_date IS NULL OR timestamp <= @to_date)
    ORDER BY timestamp DESC 
    LIMIT @limit
  `),

  getLatestByDevice: db.prepare(`
    SELECT * FROM readings 
    WHERE device_id = @device_id 
    ORDER BY timestamp DESC 
    LIMIT 1
  `),

  getLatestAll: db.prepare(`
    SELECT * FROM (
      SELECT id, device_id, location, temperature, humidity, timestamp, alert,
             ROW_NUMBER() OVER(PARTITION BY device_id ORDER BY timestamp DESC) as rn
      FROM readings
    )
    WHERE rn = 1
  `),

  getAlerts: db.prepare(`
    SELECT * FROM readings 
    WHERE alert = 1 
    ORDER BY timestamp DESC 
    LIMIT @limit
  `)
};

const mapAlert = (row) => {
  if (!row) return row;
  const { rn, ...rest } = row; // remove window function rn if it exists
  return { ...rest, alert: rest.alert === 1 };
};

const insertReading = (data) => {
  const info = stmts.insert.run({
    device_id: data.device_id,
    location: data.location || null,
    temperature: data.temperature,
    humidity: data.humidity,
    timestamp: data.timestamp,
    alert: data.alert === true || data.alert === 1 ? 1 : 0
  });
  return { id: info.lastInsertRowid, ...data };
};

const insertReadingsBatch = db.transaction((array) => {
  let count = 0;
  for (const item of array) {
    if (item.temperature === undefined || item.humidity === undefined || !item.timestamp) {
      continue;
    }
    stmts.insert.run({
      device_id: item.device_id,
      location: item.location || null,
      temperature: item.temperature,
      humidity: item.humidity,
      timestamp: item.timestamp,
      alert: item.alert === true || item.alert === 1 ? 1 : 0
    });
    count++;
  }
  return count;
});

const getReadings = (filters = {}) => {
  const rows = stmts.getReadings.all({
    device_id: filters.device_id || null,
    from_date: filters.from || null,
    to_date: filters.to || null,
    limit: parseInt(filters.limit, 10) || 100
  });
  return rows.map(mapAlert);
};

const getLatestReading = (device_id) => {
  if (device_id) {
    const rows = stmts.getLatestByDevice.all({ device_id });
    return rows.map(mapAlert);
  } else {
    // If no specific device is requested, return latest for all devices
    const rows = stmts.getLatestAll.all();
    return rows.map(mapAlert);
  }
};

const getAlerts = (limit = 100) => {
  const rows = stmts.getAlerts.all({ limit: parseInt(limit, 10) || 100 });
  return rows.map(mapAlert);
};

module.exports = {
  insertReading,
  insertReadingsBatch,
  getReadings,
  getLatestReading,
  getAlerts
};