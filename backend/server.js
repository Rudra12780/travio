const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// Auth Routes
// --------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref FROM users WHERE email = ?').get(email);
  if (!user) {
    // If not found in hackathon demo mode, auto-create or return default
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const userName = email.split('@')[0] || 'Traveler';
    const result = stmt.run(userName, email, password || 'password123');
    const newUser = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    return res.json({ user: newUser });
  }

  res.json({ user });
});

app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Admin email and master key are required' });

  const user = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref, password FROM users WHERE email = ?').get(email);
  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Invalid administrator credentials.' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid administrator key.' });
  }

  const { password: _, ...adminProfile } = user;
  res.json({ user: adminProfile });
});

app.get('/api/admin/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.home_country, u.created_at,
           COUNT(t.id) as trip_count
    FROM users u
    LEFT JOIN trips t ON u.id = t.user_id
    GROUP BY u.id
    ORDER BY u.id ASC
  `).all();
  res.json({ users });
});

// Admin can delete a user
app.delete('/api/admin/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const user = db.prepare('SELECT id, role, email FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'Admin' || user.email === 'admin@trovio.com') {
    return res.status(403).json({ error: 'Cannot delete primary administrator account' });
  }

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ success: true, message: 'Traveler deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin sends direct message / notification to specific user
app.post('/api/admin/messages', (req, res) => {
  const user_id = req.body.user_id || req.body.userId;
  const { title, message, icon, sender } = req.body;
  if (!user_id || !title || !message) {
    return res.status(400).json({ error: 'User ID, title, and message are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO notifications (user_id, title, message, icon, sender) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(user_id, title, message, icon || '✈️', sender || 'Admin Mission Control');
    const newNotif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json({ success: true, notification: newNotif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notifications for a particular user
app.get('/api/notifications/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(userId);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dismiss a notification
app.delete('/api/notifications/:id', (req, res) => {
  const notifId = Number(req.params.id);
  try {
    db.prepare('DELETE FROM notifications WHERE id = ?').run(notifId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin posts or schedules a new trip package
app.post('/api/admin/trips/schedule', (req, res) => {
  const { user_id, title, description, start_date, end_date, total_budget, cover_image, scheduled_at, is_published, stops } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const stmt = db.prepare(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, scheduled_at, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      user_id || 1,
      title,
      description || '',
      start_date || '2026-11-01',
      end_date || '2026-11-10',
      total_budget || 2400,
      cover_image || 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80',
      scheduled_at || null,
      is_published !== undefined ? is_published : 1
    );

    const tripId = Number(result.lastInsertRowid);

    // If stops provided, insert them
    if (stops && Array.isArray(stops)) {
      const stopStmt = db.prepare(`
        INSERT INTO stops (trip_id, city_id, order_index, start_date, end_date, transit_mode, stay_cost, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stops.forEach((s, idx) => {
        stopStmt.run(tripId, s.city_id || 1, idx + 1, s.start_date || '2026-11-01', s.end_date || '2026-11-03', s.transit_mode || 'Flight', s.stay_cost || 120, s.notes || '');
      });
    }

    const createdTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    res.status(201).json({ success: true, trip: createdTrip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, password || 'password123');
    const user = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json({ user });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      const existing = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref FROM users WHERE email = ?').get(email);
      return res.json({ user: existing });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/profile', (req, res) => {
  const { id, name, bio, home_country, currency_pref, avatar_url } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  db.prepare(`
    UPDATE users 
    SET name = COALESCE(?, name), 
        bio = COALESCE(?, bio), 
        home_country = COALESCE(?, home_country),
        currency_pref = COALESCE(?, currency_pref),
        avatar_url = COALESCE(?, avatar_url)
    WHERE id = ?
  `).run(name, bio, home_country, currency_pref, avatar_url, id);

  const updated = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref FROM users WHERE id = ?').get(id);
  res.json({ user: updated });
});

// --------------------------------------------------------------------------
// Cities & Discovery Routes
// --------------------------------------------------------------------------
app.get('/api/cities', (req, res) => {
  const { search, region, maxCostIndex } = req.query;
  let query = 'SELECT * FROM cities WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR country LIKE ? OR region LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (region && region !== 'All') {
    query += ' AND region = ?';
    params.push(region);
  }

  if (maxCostIndex) {
    query += ' AND cost_index <= ?';
    params.push(Number(maxCostIndex));
  }

  query += ' ORDER BY popularity_score DESC, name ASC';
  const cities = db.prepare(query).all(...params);
  res.json({ cities });
});

app.get('/api/cities/:id', (req, res) => {
  const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });

  const activities = db.prepare('SELECT * FROM activities WHERE city_id = ? ORDER BY rating DESC').all(req.params.id);
  res.json({ city: { ...city, activities } });
});

// --------------------------------------------------------------------------
// Activities Catalog Routes
// --------------------------------------------------------------------------
app.get('/api/activities', (req, res) => {
  const { cityId, category, search, maxCost } = req.query;
  let query = `
    SELECT a.*, c.name as city_name, c.country as city_country 
    FROM activities a 
    JOIN cities c ON a.city_id = c.id 
    WHERE 1=1
  `;
  const params = [];

  if (cityId) {
    query += ' AND a.city_id = ?';
    params.push(Number(cityId));
  }

  if (category && category !== 'All') {
    query += ' AND a.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (a.name LIKE ? OR a.description LIKE ? OR c.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (maxCost) {
    query += ' AND a.cost <= ?';
    params.push(Number(maxCost));
  }

  query += ' ORDER BY a.rating DESC, a.name ASC';
  const activities = db.prepare(query).all(...params);
  res.json({ activities });
});

// --------------------------------------------------------------------------
// Trips CRUD & Management Routes
// --------------------------------------------------------------------------
app.get('/api/trips', (req, res) => {
  const userId = req.query.userId || 1;

  const trips = db.prepare(`
    SELECT t.*, 
      COUNT(DISTINCT s.id) as stops_count,
      COALESCE(SUM(s.stay_cost), 0) + COALESCE((
        SELECT SUM(cost) FROM stop_activities sa 
        JOIN stops st ON sa.stop_id = st.id 
        WHERE st.trip_id = t.id
      ), 0) as estimated_cost
    FROM trips t
    LEFT JOIN stops s ON t.id = s.trip_id
    WHERE t.user_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(userId);

  res.json({ trips });
});

app.get('/api/trips/:id', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Get Stops ordered with city details
  const stops = db.prepare(`
    SELECT s.*, c.name as city_name, c.country as city_country, c.region as city_region, 
           c.image_url as city_image, c.avg_cost_per_day, c.climate
    FROM stops s
    JOIN cities c ON s.city_id = c.id
    WHERE s.trip_id = ?
    ORDER BY s.order_index ASC
  `).all(req.params.id);

  // Get Stop Activities
  for (const stop of stops) {
    stop.activities = db.prepare(`
      SELECT sa.*, a.name as original_name, a.category, a.duration_hours, a.rating, a.image_url
      FROM stop_activities sa
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE sa.stop_id = ?
      ORDER BY sa.scheduled_date ASC, sa.scheduled_time ASC
    `).all(stop.id);
  }

  // Get Expenses
  const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC').all(req.params.id);

  // Get Cost Summary
  const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const stayTotal = stops.reduce((sum, s) => sum + Number(s.stay_cost || 0), 0);
  const activityTotal = stops.reduce((sum, s) => {
    return sum + s.activities.reduce((actSum, a) => actSum + Number(a.cost || 0), 0);
  }, 0);

  res.json({
    trip: {
      ...trip,
      stops,
      expenses,
      summary: {
        totalExpenseLogged: expenseTotal,
        estimatedStay: stayTotal,
        estimatedActivities: activityTotal,
        totalEstimated: stayTotal + activityTotal
      }
    }
  });
});

app.post('/api/trips', (req, res) => {
  const { user_id, title, description, start_date, end_date, total_budget, cover_image } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }

  const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  const result = db.prepare(`
    INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, is_public, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'Planning')
  `).run(user_id || 1, title, description || '', start_date, end_date, total_budget || 2000, defaultCover);

  const newTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ trip: newTrip });
});

app.put('/api/trips/:id', (req, res) => {
  const { title, description, start_date, end_date, total_budget, cover_image, is_public, status } = req.body;
  
  db.prepare(`
    UPDATE trips 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        total_budget = COALESCE(?, total_budget),
        cover_image = COALESCE(?, cover_image),
        is_public = COALESCE(?, is_public),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(title, description, start_date, end_date, total_budget, cover_image, is_public, status, req.params.id);

  const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  res.json({ trip: updated });
});

app.delete('/api/trips/:id', (req, res) => {
  db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Trip deleted' });
});

app.post('/api/trips/:id/copy', (req, res) => {
  const original = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!original) return res.status(404).json({ error: 'Trip not found' });

  const userId = req.body.userId || 1;
  const copyResult = db.prepare(`
    INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, is_public, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'Planning')
  `).run(
    userId,
    `Copy of ${original.title}`,
    original.description,
    original.start_date,
    original.end_date,
    original.total_budget,
    original.cover_image
  );

  const newTripId = Number(copyResult.lastInsertRowid);

  // Copy stops
  const stops = db.prepare('SELECT * FROM stops WHERE trip_id = ?').all(original.id);
  for (const s of stops) {
    const newStopRes = db.prepare(`
      INSERT INTO stops (trip_id, city_id, order_index, start_date, end_date, transit_mode, stay_cost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newTripId, s.city_id, s.order_index, s.start_date, s.end_date, s.transit_mode, s.stay_cost, s.notes);

    // Copy activities
    const acts = db.prepare('SELECT * FROM stop_activities WHERE stop_id = ?').all(s.id);
    for (const a of acts) {
      db.prepare(`
        INSERT INTO stop_activities (stop_id, activity_id, custom_title, scheduled_date, scheduled_time, cost, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(Number(newStopRes.lastInsertRowid), a.activity_id, a.custom_title, a.scheduled_date, a.scheduled_time, a.cost, a.notes);
    }
  }

  const copiedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(newTripId);
  res.status(201).json({ trip: copiedTrip });
});

// --------------------------------------------------------------------------
// Stops & Itinerary Builder Routes
// --------------------------------------------------------------------------
app.post('/api/trips/:id/stops', (req, res) => {
  const tripId = req.params.id;
  const { city_id, start_date, end_date, transit_mode, stay_cost, notes } = req.body;
  if (!city_id) return res.status(400).json({ error: 'City is required' });

  // Get highest order_index
  const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), 0) as max_idx FROM stops WHERE trip_id = ?').get(tripId).max_idx;

  const result = db.prepare(`
    INSERT INTO stops (trip_id, city_id, order_index, start_date, end_date, transit_mode, stay_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tripId,
    city_id,
    maxOrder + 1,
    start_date || '2026-10-01',
    end_date || '2026-10-03',
    transit_mode || 'Car',
    stay_cost || 100,
    notes || ''
  );

  const stop = db.prepare(`
    SELECT s.*, c.name as city_name, c.country as city_country, c.image_url as city_image
    FROM stops s JOIN cities c ON s.city_id = c.id
    WHERE s.id = ?
  `).get(Number(result.lastInsertRowid));

  res.status(201).json({ stop });
});

app.delete('/api/stops/:id', (req, res) => {
  db.prepare('DELETE FROM stops WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/trips/:id/stops/reorder', (req, res) => {
  const { orderedStopIds } = req.body;
  if (!Array.isArray(orderedStopIds)) return res.status(400).json({ error: 'Invalid stop IDs' });

  for (let idx = 0; idx < orderedStopIds.length; idx++) {
    db.prepare('UPDATE stops SET order_index = ? WHERE id = ?').run(idx + 1, orderedStopIds[idx]);
  }
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// Stop Activities Routes
// --------------------------------------------------------------------------
app.post('/api/stops/:stopId/activities', (req, res) => {
  const { stopId } = req.params;
  const { activity_id, custom_title, scheduled_date, scheduled_time, cost, notes } = req.body;

  let activityCost = cost;
  let title = custom_title;

  if (activity_id) {
    const act = db.prepare('SELECT name, cost FROM activities WHERE id = ?').get(activity_id);
    if (act) {
      if (!title) title = act.name;
      if (activityCost === undefined) activityCost = act.cost;
    }
  }

  const result = db.prepare(`
    INSERT INTO stop_activities (stop_id, activity_id, custom_title, scheduled_date, scheduled_time, cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(stopId, activity_id || null, title || 'Custom Activity', scheduled_date || '', scheduled_time || '10:00', activityCost || 0, notes || '');

  const newActivity = db.prepare('SELECT * FROM stop_activities WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ activity: newActivity });
});

app.delete('/api/stop-activities/:id', (req, res) => {
  db.prepare('DELETE FROM stop_activities WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// Expenses & Budget Routes
// --------------------------------------------------------------------------
app.get('/api/trips/:id/expenses', (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC').all(req.params.id);
  const trip = db.prepare('SELECT total_budget FROM trips WHERE id = ?').get(req.params.id);

  // Group by category
  const categories = { Transit: 0, Stay: 0, Activities: 0, Food: 0, Misc: 0 };
  let totalSpent = 0;

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    totalSpent += amt;
    if (categories[exp.category] !== undefined) {
      categories[exp.category] += amt;
    } else {
      categories.Misc += amt;
    }
  }

  res.json({
    expenses,
    totalBudget: trip ? trip.total_budget : 2500,
    totalSpent,
    remainingBudget: (trip ? trip.total_budget : 2500) - totalSpent,
    categoryBreakdown: categories
  });
});

app.post('/api/trips/:id/expenses', (req, res) => {
  const { category, description, amount, date } = req.body;
  if (!category || !description || amount === undefined) {
    return res.status(400).json({ error: 'Category, description, and amount are required' });
  }

  const result = db.prepare(`
    INSERT INTO expenses (trip_id, category, description, amount, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, category, description, Number(amount), date || new Date().toISOString().split('T')[0]);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ expense });
});

app.delete('/api/expenses/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// Wishlist Routes
// --------------------------------------------------------------------------
app.get('/api/wishlist', (req, res) => {
  const userId = req.query.userId || 1;
  const items = db.prepare(`
    SELECT w.id as wishlist_id, c.* 
    FROM wishlist w 
    JOIN cities c ON w.city_id = c.id 
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `).all(userId);
  res.json({ wishlist: items });
});

app.post('/api/wishlist', (req, res) => {
  const { userId, cityId } = req.body;
  if (!cityId) return res.status(400).json({ error: 'City ID is required' });

  db.prepare('INSERT OR IGNORE INTO wishlist (user_id, city_id) VALUES (?, ?)').run(userId || 1, cityId);
  res.json({ success: true });
});

app.delete('/api/wishlist/:cityId', (req, res) => {
  const userId = req.query.userId || 1;
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND city_id = ?').run(userId, req.params.cityId);
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// Admin & Platform Analytics Routes
// --------------------------------------------------------------------------
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT count(*) as count FROM users').get().count;
  const totalTrips = db.prepare('SELECT count(*) as count FROM trips').get().count;
  const totalCities = db.prepare('SELECT count(*) as count FROM cities').get().count;
  const totalActivities = db.prepare('SELECT count(*) as count FROM activities').get().count;

  const popularCities = db.prepare(`
    SELECT c.name, c.country, COUNT(s.id) as stop_count, c.popularity_score
    FROM cities c
    LEFT JOIN stops s ON c.id = s.city_id
    GROUP BY c.id
    ORDER BY stop_count DESC, c.popularity_score DESC
    LIMIT 5
  `).all();

  const recentTrips = db.prepare(`
    SELECT t.title, u.name as traveler, t.start_date, t.end_date, t.total_budget
    FROM trips t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
    LIMIT 5
  `).all();

  res.json({
    metrics: {
      totalUsers,
      totalTrips,
      totalCities,
      totalActivities
    },
    popularCities,
    recentTrips
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GlobeTrotter Backend API Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/cities`);
  console.log(`======================================================\n`);
});
