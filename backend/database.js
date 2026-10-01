const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'trovio.db');
const db = new DatabaseSync(dbPath);

// Enable Foreign Keys and WAL Mode
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Traveler',
    avatar_url TEXT,
    bio TEXT,
    home_country TEXT DEFAULT 'India',
    currency_pref TEXT DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    cost_index INTEGER NOT NULL DEFAULT 2,
    popularity_score REAL DEFAULT 4.8,
    avg_cost_per_day REAL NOT NULL DEFAULT 85,
    climate TEXT,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost REAL NOT NULL DEFAULT 25,
    duration_hours REAL NOT NULL DEFAULT 2.5,
    rating REAL DEFAULT 4.8,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_budget REAL DEFAULT 2500,
    cover_image TEXT,
    is_public INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    transit_mode TEXT DEFAULT 'Flight',
    stay_cost REAL DEFAULT 120,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS stop_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES activities(id) ON DELETE SET NULL,
    custom_title TEXT,
    scheduled_date TEXT,
    scheduled_time TEXT,
    cost REAL DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, city_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender TEXT DEFAULT 'Admin Mission Control',
    icon TEXT DEFAULT '✈️',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec(`ALTER TABLE trips ADD COLUMN scheduled_at TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE trips ADD COLUMN is_published INTEGER DEFAULT 1;`);
} catch (e) {}

console.log('✅ SQLite Database schema verified and initialized at:', dbPath);

module.exports = db;
