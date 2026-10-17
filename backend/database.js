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

  CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 1,
    cover_image TEXT,
    invite_token TEXT UNIQUE NOT NULL,
    is_invite_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
  );
`);

try {
  db.exec(`ALTER TABLE trips ADD COLUMN scheduled_at TEXT;`);
} catch (e) {}

try {
  const user1 = db.prepare('SELECT id FROM users WHERE id = 1').get();
  if (!user1) {
    db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password, role, bio, home_country, currency_pref)
      VALUES (1, 'Panther Explorer', 'panther.explorer@trovio.com', 'password123', 'Traveler', 'Solo voyager & culture enthusiast wandering across royal frontiers and ancient heritage corridors.', 'India', 'USD')
    `).run();
  }

  // Seed diverse destination communities covering all trip destinations
  const seedCommunitiesList = [
    // Udaipur
    {
      name: 'Royal Mewar Heritage Expedition',
      destination: 'Udaipur, Rajasthan',
      start_date: '2026-11-10',
      end_date: '2026-11-18',
      description: 'An exclusive cohort of heritage architecture buffs, photography aficionados, and sunset ferry voyagers exploring Lake Pichola and the Great Wall of India.',
      creator_id: 1,
      max_members: 15,
      current_members: 8,
      cover_image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'c7e3f89a2b4d10567e9f3b2a',
      is_invite_active: 1
    },
    {
      name: 'Lake Pichola Sunset & Boat Voyagers',
      destination: 'Udaipur, Rajasthan',
      start_date: '2026-10-20',
      end_date: '2026-10-25',
      description: 'Daily sunset boat cruises to Jag Mandir, rooftop dining at Ambrai Ghat, and twilight lakeside photography walks with local guides.',
      creator_id: 1,
      max_members: 12,
      current_members: 5,
      cover_image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'ud-pichola-voyage-2026',
      is_invite_active: 1
    },
    {
      name: 'Old City Havelis & Culinary Walkers',
      destination: 'Udaipur, Rajasthan',
      start_date: '2026-11-01',
      end_date: '2026-11-07',
      description: 'A foodie and architectural group exploring centuries-old street food stalls, kachoris near Jagdish Temple, miniature painting studios, and heritage courtyards.',
      creator_id: 1,
      max_members: 18,
      current_members: 9,
      cover_image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'ud-oldcity-culinary-2026',
      is_invite_active: 1
    },
    {
      name: 'Aravalli Trail & Sajjangarh Monsoon Trekkers',
      destination: 'Udaipur, Rajasthan',
      start_date: '2026-11-15',
      end_date: '2026-11-22',
      description: 'Morning nature hikes through Sajjangarh Wildlife Sanctuary up to the Monsoon Palace for panoramic sunrises over the Aravalli mountain ranges.',
      creator_id: 1,
      max_members: 10,
      current_members: 4,
      cover_image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'ud-aravalli-trekkers-2026',
      is_invite_active: 1
    },
    {
      name: 'Fateh Sagar Lakeside & Cycling Voyagers',
      destination: 'Udaipur, Rajasthan',
      start_date: '2026-10-28',
      end_date: '2026-11-04',
      description: 'Breezy sunset bicycle rides around the perimeter of Fateh Sagar Lake, stone bridge viewpoints, and weekend cafe meetups.',
      creator_id: 1,
      max_members: 20,
      current_members: 11,
      cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'ud-fatehsagar-cycle-2026',
      is_invite_active: 1
    },
    // Jaipur
    {
      name: 'Pink City Heritage & Photography Trail',
      destination: 'Jaipur, Rajasthan',
      start_date: '2026-11-05',
      end_date: '2026-11-12',
      description: 'Early morning photowalks capturing Hawa Mahal facade, vibrant spice bazaars in Johari Bazaar, and sunrise views above Nahargarh Fort.',
      creator_id: 1,
      max_members: 16,
      current_members: 9,
      cover_image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'jp-pinkcity-trail-2026',
      is_invite_active: 1
    },
    {
      name: 'Amber Palace & Nahargarh Sunset Guild',
      destination: 'Jaipur, Rajasthan',
      start_date: '2026-11-14',
      end_date: '2026-11-20',
      description: 'Elephant ramparts exploration at Amer, Sheesh Mahal mirrored hall tours, followed by dusk coffee sessions atop Nahargarh looking over the illuminated city.',
      creator_id: 1,
      max_members: 14,
      current_members: 7,
      cover_image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'jp-amber-sunset-2026',
      is_invite_active: 1
    },
    // Jodhpur
    {
      name: 'Blue City Rooftops & Mehrangarh Rampart Explorers',
      destination: 'Jodhpur, Rajasthan',
      start_date: '2026-11-08',
      end_date: '2026-11-15',
      description: 'Navigating the labyrinth of indigo-painted alleys, zip-lining with Flying Fox over royal lakes, and sunset tea at rooftop havelis.',
      creator_id: 1,
      max_members: 15,
      current_members: 8,
      cover_image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'jd-bluecity-mehrangarh-2026',
      is_invite_active: 1
    },
    {
      name: 'Thar Desert Stargazers & Camel Caravan',
      destination: 'Jodhpur, Rajasthan',
      start_date: '2026-11-18',
      end_date: '2026-11-24',
      description: 'Expeditions into the golden dunes of Osian near Jodhpur, ancient Jain temples, traditional folk music campfires, and astro-photography.',
      creator_id: 1,
      max_members: 18,
      current_members: 10,
      cover_image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'jd-thar-stargaze-2026',
      is_invite_active: 1
    },
    // Manali & Himalayas
    {
      name: 'Solang Valley Paragliding & High Pass Cohort',
      destination: 'Manali, Himachal Pradesh',
      start_date: '2026-11-02',
      end_date: '2026-11-10',
      description: 'Thrill-seeking cohort soaring above snow-dusted Himalayan valleys, river rafting on the Beas, and evening bonfire acoustic sessions.',
      creator_id: 1,
      max_members: 12,
      current_members: 6,
      cover_image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'mn-solang-paraglide-2026',
      is_invite_active: 1
    },
    {
      name: 'Old Manali Riverside & Pine Forest Hikers',
      destination: 'Manali, Himachal Pradesh',
      start_date: '2026-11-12',
      end_date: '2026-11-18',
      description: 'Serene forest walks through ancient deodar trees, visiting Hidimba Temple, trout fishing, and cozy workation cafe meetups.',
      creator_id: 1,
      max_members: 20,
      current_members: 12,
      cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'mn-oldmanali-forest-2026',
      is_invite_active: 1
    },
    // Goa
    {
      name: 'Old Goa Coastline & Hidden Beach Riders',
      destination: 'Goa, India',
      start_date: '2026-11-04',
      end_date: '2026-11-11',
      description: 'Cruising through secluded coastal cliffs, Portuguese colonial villas, sunset cliff picnics at Cabo de Rama, and beach volleyball.',
      creator_id: 1,
      max_members: 16,
      current_members: 9,
      cover_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'goa-coastline-riders-2026',
      is_invite_active: 1
    },
    {
      name: 'Dudhsagar Waterfall & Jungle Trekkers',
      destination: 'Goa, India',
      start_date: '2026-11-16',
      end_date: '2026-11-22',
      description: 'Jeep safari into the lush Western Ghats, swimming in freshwater pools below four-tiered Dudhsagar falls, and spice plantation banquets.',
      creator_id: 1,
      max_members: 14,
      current_members: 7,
      cover_image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'goa-dudhsagar-trekkers-2026',
      is_invite_active: 1
    },
    // Munnar & Alleppey
    {
      name: 'Munnar Tea Estate Mist Walkers & Peak Trekkers',
      destination: 'Munnar, Kerala',
      start_date: '2026-11-06',
      end_date: '2026-11-13',
      description: 'Trekking through emerald rolling tea terraces at sunrise, spotting Nilgiri Tahr at Eravikulam, and tasting freshly processed artisanal teas.',
      creator_id: 1,
      max_members: 12,
      current_members: 6,
      cover_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'mu-tea-mist-2026',
      is_invite_active: 1
    },
    {
      name: 'Alleppey Backwater Houseboat & Canoe Explorers',
      destination: 'Munnar & Alleppey, Kerala',
      start_date: '2026-11-15',
      end_date: '2026-11-21',
      description: 'Gliding along tranquil palm-lined canals on traditional wooden kettuvallams, authentic Karimeen fish curry feasts, and village pottery stops.',
      creator_id: 1,
      max_members: 15,
      current_members: 8,
      cover_image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'al-backwater-canoe-2026',
      is_invite_active: 1
    },
    // Delhi & Agra
    {
      name: 'Taj Mahal Sunrise & Yamuna Heritage Voyagers',
      destination: 'Agra, India',
      start_date: '2026-11-03',
      end_date: '2026-11-08',
      description: 'Unforgettable dawn admission to the ivory-white wonder before crowds arrive, Mehtab Bagh reflection views, and Agra Fort rampart tours.',
      creator_id: 1,
      max_members: 16,
      current_members: 11,
      cover_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'ag-tajmahal-dawn-2026',
      is_invite_active: 1
    },
    {
      name: 'Old Delhi Chandni Chowk Food & Haveli Trail',
      destination: 'Delhi, India',
      start_date: '2026-11-09',
      end_date: '2026-11-14',
      description: 'Culinary adventures through historic Paranthe Wali Gali, spice market aromatics at Khari Baoli, and architectural walks through Mughal Jama Masjid.',
      creator_id: 1,
      max_members: 15,
      current_members: 9,
      cover_image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'dl-olddelhi-food-2026',
      is_invite_active: 1
    },
    // Tokyo
    {
      name: 'Shibuya Neon & Akihabara Night Explorers',
      destination: 'Tokyo, Japan',
      start_date: '2026-11-12',
      end_date: '2026-11-20',
      description: 'Wandering glowing cyber streets, underground ramen counters, retro arcade competitions, and twilight views from Roppongi Hills Sky Deck.',
      creator_id: 1,
      max_members: 12,
      current_members: 7,
      cover_image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'tk-shibuya-neon-2026',
      is_invite_active: 1
    },
    // Paris
    {
      name: 'Montmartre Bohemian Artists & Seine Sunset Walkers',
      destination: 'Paris, France',
      start_date: '2026-11-05',
      end_date: '2026-11-12',
      description: 'Cobblestone journeys past Sacré-Cœur, hidden bakeries smelling of warm croissants, bookstore visits at Shakespeare & Company, and dusk bridge strolls.',
      creator_id: 1,
      max_members: 14,
      current_members: 8,
      cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'pr-montmartre-seine-2026',
      is_invite_active: 1
    },
    // Rome
    {
      name: 'Colosseum & Ancient Roman Forum Antiquities Guild',
      destination: 'Rome, Italy',
      start_date: '2026-11-10',
      end_date: '2026-11-17',
      description: 'Tracing footsteps of gladiators, exploring subterranean aqueducts, evening gelato walks past the Trevi Fountain, and Trastevere trattoria dinners.',
      creator_id: 1,
      max_members: 12,
      current_members: 6,
      cover_image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      invite_token: 'rm-colosseum-forum-2026',
      is_invite_active: 1
    }
  ];

  const insertComm = db.prepare(`
    INSERT INTO communities (name, destination, start_date, end_date, description, creator_id, max_members, current_members, cover_image, invite_token, is_invite_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of seedCommunitiesList) {
    const exists = db.prepare('SELECT id FROM communities WHERE name = ?').get(c.name);
    if (!exists) {
      const res = insertComm.run(c.name, c.destination, c.start_date, c.end_date, c.description, c.creator_id, c.max_members, c.current_members, c.cover_image, c.invite_token, c.is_invite_active);
      db.prepare(`INSERT OR IGNORE INTO community_members (community_id, user_id, role) VALUES (?, 1, 'Creator')`).run(res.lastInsertRowid);
    }
  }

  // Seed sample planned expedition if trips table is empty
  const tripCount = db.prepare('SELECT count(*) as count FROM trips').get();
  if (!tripCount || tripCount.count === 0) {
    const insertTrip = db.prepare(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, is_public, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'Planning')
    `);
    const t1 = insertTrip.run(
      1,
      'Royal Rajasthan Heritage Expedition',
      'Voyage to Jaipur and Jodhpur across royal palaces, desert forts, and vibrant bazaars.',
      '2026-11-10',
      '2026-11-20',
      2800,
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
    );
    const trip1Id = Number(t1.lastInsertRowid);
    const insertStop = db.prepare(`
      INSERT INTO stops (trip_id, city_id, order_index, start_date, end_date, transit_mode, stay_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    // Jaipur (city_id: 3) and Jodhpur (city_id: 2)
    insertStop.run(trip1Id, 3, 1, '2026-11-10', '2026-11-15', 'Flight', 750);
    insertStop.run(trip1Id, 2, 2, '2026-11-15', '2026-11-20', 'Train', 650);
  }
} catch (e) {
  console.warn('Seed note:', e.message);
}

console.log('✅ SQLite Database schema verified and initialized at:', dbPath);

module.exports = db;

