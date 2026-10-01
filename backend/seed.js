const db = require('./database');

function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Regular Traveler User
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('panther@trovio.com');
  let userId;
  if (!existingUser) {
    const userStmt = db.prepare(`
      INSERT INTO users (name, email, password, role, avatar_url, bio, home_country, currency_pref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = userStmt.run(
      'panther',
      'panther@trovio.com',
      'password123',
      'Traveler',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      'Solo voyager & culture enthusiast wandering across royal frontiers and ancient heritage corridors.',
      'India',
      'USD'
    );
    userId = Number(result.lastInsertRowid);
  } else {
    userId = Number(existingUser.id);
  }

  // 1b. Seed Admin User (Confidential / Hidden from normal users)
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@trovio.com');
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (name, email, password, role, avatar_url, bio, home_country, currency_pref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Administrator',
      'admin@trovio.com',
      'admin123',
      'Admin',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      'GlobalTrotters System Operations & Dispatch Commander',
      'Global Ops',
      'USD'
    );
  }

  // 2. Seed Cities
  const citiesData = [
    {
      name: 'Udaipur',
      country: 'India',
      region: 'Rajasthan',
      cost_index: 2,
      popularity_score: 4.9,
      avg_cost_per_day: 75,
      climate: '29°C Sunny',
      description: 'The Venice of the East, surrounded by azure lakes and the majestic Aravalli hills with grand royal palaces.',
      image_url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Jodhpur',
      country: 'India',
      region: 'Rajasthan',
      cost_index: 2,
      popularity_score: 4.8,
      avg_cost_per_day: 65,
      climate: '31°C Clear',
      description: 'The Blue City crowned by the colossal Mehrangarh Fort, standing guard over winding indigo streets and spice bazaars.',
      image_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Jaipur',
      country: 'India',
      region: 'Rajasthan',
      cost_index: 2,
      popularity_score: 4.9,
      avg_cost_per_day: 80,
      climate: '28°C Pleasant',
      description: 'The legendary Pink City renowned for the honeycomb facade of Hawa Mahal, Amber Fort, and astronomy at Jantar Mantar.',
      image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Delhi',
      country: 'India',
      region: 'North India',
      cost_index: 2,
      popularity_score: 4.7,
      avg_cost_per_day: 85,
      climate: '27°C Hazy Sun',
      description: 'India dynamic capital blending Mughal monuments like Humayun Tomb and Qutub Minar with bustling street bazaars.',
      image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Agra',
      country: 'India',
      region: 'Uttar Pradesh',
      cost_index: 2,
      popularity_score: 5.0,
      avg_cost_per_day: 70,
      climate: '28°C Warm',
      description: 'Home to the magnificent ivory-white marble Taj Mahal and the imposing red sandstone fortress of Agra Fort.',
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Kochi',
      country: 'India',
      region: 'Kerala',
      cost_index: 2,
      popularity_score: 4.7,
      avg_cost_per_day: 70,
      climate: '30°C Tropical',
      description: 'Colonial coastal hub with cantilevered Chinese fishing nets, Portuguese synagogues, and fragrant spice warehouses.',
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'East Asia',
      cost_index: 4,
      popularity_score: 4.9,
      avg_cost_per_day: 190,
      climate: '18°C Crisp',
      description: 'Hypermodern metropolis where neon skyscrapers coexist with ancient Shinto shrines and world-class culinary crafts.',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      region: 'East Asia',
      cost_index: 3,
      popularity_score: 4.9,
      avg_cost_per_day: 150,
      climate: '16°C Fresh',
      description: 'Cultural soul of Japan with thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.',
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 4.9,
      avg_cost_per_day: 220,
      climate: '15°C Autumnal',
      description: 'The City of Light famed for the Eiffel Tower, Gothic Notre-Dame cathedral, and world-class art collections at the Louvre.',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 4.9,
      avg_cost_per_day: 175,
      climate: '21°C Sunny',
      description: 'Eternal city of ancient ruins, the mighty Colosseum, Roman Forum, Trevi Fountain, and Vatican masterpieces.',
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Zermatt',
      country: 'Switzerland',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 5.0,
      avg_cost_per_day: 240,
      climate: '12°C Alpine',
      description: 'Car-free fairytale alpine village crowned by the iconic Matterhorn, world-class cogwheel railways, and glacier skiing.',
      image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Ubud',
      country: 'Indonesia',
      region: 'Southeast Asia',
      cost_index: 2,
      popularity_score: 4.9,
      avg_cost_per_day: 85,
      climate: '28°C Tropical',
      description: 'Spiritual heart of Bali famous for emerald terraced rice fields, sacred monkey sanctuaries, and artisan woodcraft.',
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      region: 'Nordic',
      cost_index: 4,
      popularity_score: 4.9,
      avg_cost_per_day: 210,
      climate: '10°C Crisp',
      description: 'Cosmopolitan northern capital gateway to geysers, the Blue Lagoon geothermal baths, and cosmic Aurora Borealis displays.',
      image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Santorini',
      country: 'Greece',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 4.9,
      avg_cost_per_day: 165,
      climate: '26°C Sunny',
      description: 'Dramatic volcanic caldera lined with whitewashed cliffside cave houses, blue domes, and legendary Aegean sunsets.',
      image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 4.9,
      avg_cost_per_day: 145,
      climate: '23°C Mediterranean',
      description: 'Vibrant seaside metropolis adorned with Antoni Gaudí whimsical architectural wonders, Gothic quarters, and tapas feasts.',
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Queenstown',
      country: 'New Zealand',
      region: 'Oceania',
      cost_index: 4,
      popularity_score: 4.9,
      avg_cost_per_day: 195,
      climate: '15°C Fresh',
      description: 'World adventure capital nestled on the shores of crystal Lake Wakatipu beneath the jagged Remarkables mountain range.',
      image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Marrakech',
      country: 'Morocco',
      region: 'North Africa',
      cost_index: 2,
      popularity_score: 4.8,
      avg_cost_per_day: 90,
      climate: '27°C Warm',
      description: 'Ancient imperial city brimming with bustling spice souks, palatial Riads with mosaic courtyards, and street performers in Jemaa el-Fnaa.',
      image_url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const cityMap = {};
  const cityCount = db.prepare('SELECT count(*) as count FROM cities').get().count;

  const insertCityStmt = db.prepare(`
    INSERT INTO cities (name, country, region, cost_index, popularity_score, avg_cost_per_day, climate, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of citiesData) {
    const existing = db.prepare('SELECT id FROM cities WHERE name = ?').get(c.name);
    if (!existing) {
      const res = insertCityStmt.run(
        c.name,
        c.country,
        c.region,
        c.cost_index,
        c.popularity_score,
        c.avg_cost_per_day,
        c.climate,
        c.description,
        c.image_url
      );
      cityMap[c.name] = Number(res.lastInsertRowid);
    } else {
      cityMap[c.name] = Number(existing.id);
    }
  }

  // 3. Seed Activities
  const activityCount = db.prepare('SELECT count(*) as count FROM activities').get().count;
  if (activityCount === 0) {
    const insertActivityStmt = db.prepare(`
      INSERT INTO activities (city_id, name, category, cost, duration_hours, rating, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const activitiesList = [
      // Udaipur
      {
        cityName: 'Udaipur',
        name: 'Lake Pichola Sunset Boat Voyage',
        category: 'Sightseeing',
        cost: 25,
        duration: 1.5,
        rating: 4.9,
        description: 'Cruising by Jag Mandir and the Lake Palace as dusk bathes the royal city in golden hues.',
        image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=600&q=80'
      },
      {
        cityName: 'Udaipur',
        name: 'City Palace Architectural Tour',
        category: 'Culture',
        cost: 18,
        duration: 3.0,
        rating: 4.8,
        description: 'Marvel at mirror-work corridors, peacock courtyards, and centuries of Mewar royal heritage.',
        image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80'
      },
      {
        cityName: 'Udaipur',
        name: 'Old City Lakes Cycling Tour',
        category: 'Adventure',
        cost: 30,
        duration: 2.5,
        rating: 4.7,
        description: 'Morning guided ride along Fateh Sagar lake and rural village outposts.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
      },
      // Jodhpur
      {
        cityName: 'Jodhpur',
        name: 'Mehrangarh Fort Viewpoint & Flying Fox',
        category: 'Adventure',
        cost: 35,
        duration: 3.5,
        rating: 5.0,
        description: 'Explore the impregnable fort galleries followed by a thrilling zipline over the battlements and blue city.',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80'
      },
      {
        cityName: 'Jodhpur',
        name: 'Thar Desert Safari & Dune Dinner',
        category: 'Adventure',
        cost: 65,
        duration: 5.0,
        rating: 4.9,
        description: '4x4 open jeep safari across golden sand dunes with folk dance under starry desert skies.',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
      },
      // Jaipur
      {
        cityName: 'Jaipur',
        name: 'Amber Fort Elephant Pathway & Sheesh Mahal',
        category: 'Sightseeing',
        cost: 20,
        duration: 3.0,
        rating: 4.9,
        description: 'Admire the Hall of Mirrors with intricate floral inlays and panoramic hill views.',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80'
      },
      {
        cityName: 'Jaipur',
        name: 'Old Bazaar Street Food & Textile Trail',
        category: 'Food Tour',
        cost: 25,
        duration: 2.5,
        rating: 4.8,
        description: 'Taste authentic pyaaz kachori, lassi at MI Road, and explore block printing artisans.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
      },
      // Delhi
      {
        cityName: 'Delhi',
        name: 'Old Delhi Heritage Walk & Chandni Chowk Rikshaw',
        category: 'Culture',
        cost: 22,
        duration: 3.0,
        rating: 4.8,
        description: 'Rickshaw ride through spice markets, Jama Masjid courtyard, and parathe wali gali.',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const a of activitiesList) {
      const cityId = cityMap[a.cityName];
      if (cityId) {
        insertActivityStmt.run(cityId, a.name, a.category, a.cost, a.duration, a.rating, a.description, a.image);
      }
    }
  }

  // 4. Seed Primary Trip (Rajasthan Royal Heritage Odyssey)
  const existingTrips = db.prepare('SELECT count(*) as count FROM trips WHERE user_id = ?').get(userId).count;
  if (existingTrips === 0) {
    const insertTripStmt = db.prepare(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, is_public, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const trip1 = insertTripStmt.run(
      userId,
      'Rajasthan Royal Heritage Odyssey',
      'A majestic expedition through the royal forts, blue cities, desert dunes, and mirror palaces of India majestic northwestern frontier.',
      '2026-10-01',
      '2026-10-10',
      2800,
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80',
      1,
      'Active'
    );
    const trip1Id = Number(trip1.lastInsertRowid);

    // Stops for Trip 1: Delhi -> Jaipur -> Udaipur -> Jodhpur
    const insertStopStmt = db.prepare(`
      INSERT INTO stops (trip_id, city_id, order_index, start_date, end_date, transit_mode, stay_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const stopDelhi = insertStopStmt.run(trip1Id, cityMap['Delhi'], 1, '2026-10-01', '2026-10-02', 'Flight', 140, 'Arrival at IGI Airport, evening cultural walk');
    const stopJaipur = insertStopStmt.run(trip1Id, cityMap['Jaipur'], 2, '2026-10-03', '2026-10-05', 'Car', 210, 'Drive via NH48, Amber Fort exploration');
    const stopUdaipur = insertStopStmt.run(trip1Id, cityMap['Udaipur'], 3, '2026-10-06', '2026-10-08', 'Car', 280, 'Lake Pichola heritage stay, current live stop');
    const stopJodhpur = insertStopStmt.run(trip1Id, cityMap['Jodhpur'], 4, '2026-10-09', '2026-10-10', 'Train', 160, 'Mehrangarh zipline & Thar desert sunset');

    // Add Stop Activities
    const insertStopActStmt = db.prepare(`
      INSERT INTO stop_activities (stop_id, activity_id, custom_title, scheduled_date, scheduled_time, cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const udaipurActivities = db.prepare('SELECT id, name, cost FROM activities WHERE city_id = ?').all(cityMap['Udaipur']);
    if (udaipurActivities.length > 0) {
      insertStopActStmt.run(Number(stopUdaipur.lastInsertRowid), Number(udaipurActivities[0].id), udaipurActivities[0].name, '2026-10-06', '17:30', udaipurActivities[0].cost, 'Golden hour photography');
      if (udaipurActivities[1]) {
        insertStopActStmt.run(Number(stopUdaipur.lastInsertRowid), Number(udaipurActivities[1].id), udaipurActivities[1].name, '2026-10-07', '10:00', udaipurActivities[1].cost, 'Guided audio tour');
      }
    }

    // Seed Expenses for Trip 1
    const insertExpenseStmt = db.prepare(`
      INSERT INTO expenses (trip_id, category, description, amount, date)
      VALUES (?, ?, ?, ?, ?)
    `);

    const sampleExpenses = [
      { cat: 'Transit', desc: 'Flight Delhi to Jaipur Transfer', amount: 180, date: '2026-10-01' },
      { cat: 'Stay', desc: 'Heritage Haveli Udaipur (2 Nights)', amount: 280, date: '2026-10-06' },
      { cat: 'Stay', desc: 'Samode Palace Stay Jaipur', amount: 320, date: '2026-10-03' },
      { cat: 'Activities', desc: 'Lake Pichola Sunset Voyage & Fort Entry', amount: 85, date: '2026-10-06' },
      { cat: 'Food', desc: 'Rooftop Dinner overlooking Lake Pichola', amount: 65, date: '2026-10-06' },
      { cat: 'Transit', desc: 'Chauffeured Inter-City Sedan', amount: 240, date: '2026-10-04' }
    ];

    for (const exp of sampleExpenses) {
      insertExpenseStmt.run(trip1Id, exp.cat, exp.desc, exp.amount, exp.date);
    }

    // Secondary Trips
    insertTripStmt.run(
      userId,
      'Kerala Backwaters & Tea Trails',
      'Serene journey through coconut palm backwaters on traditional houseboats and mist-cloaked spice tea hills of Munnar.',
      '2026-11-15',
      '2026-11-22',
      1800,
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      1,
      'Planning'
    );

    insertTripStmt.run(
      userId,
      'Tokyo & Kyoto Autumn Odyssey',
      'Maple foliage, ancient Zen gardens in Kyoto, and futuristic neon street explorations across Tokyo.',
      '2026-12-05',
      '2026-12-14',
      3400,
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      0,
      'Planning'
    );

    insertTripStmt.run(
      userId,
      'Golden Triangle Heritage Express',
      'Classic historic circuit spanning the Red Fort of Delhi, the iconic Taj Mahal in Agra, and royal palaces in Jaipur.',
      '2026-12-20',
      '2026-12-25',
      1200,
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      1,
      'Planning'
    );
  }

  // 5. Seed Wishlist
  const wishlistCount = db.prepare('SELECT count(*) as count FROM wishlist WHERE user_id = ?').get(userId).count;
  if (wishlistCount === 0) {
    const insertWishlist = db.prepare('INSERT OR IGNORE INTO wishlist (user_id, city_id) VALUES (?, ?)');
    if (cityMap['Kyoto']) insertWishlist.run(userId, cityMap['Kyoto']);
    if (cityMap['Paris']) insertWishlist.run(userId, cityMap['Paris']);
    if (cityMap['Rome']) insertWishlist.run(userId, cityMap['Rome']);
  }

  console.log('✅ Seeding completed successfully!');
}

seedDatabase();
