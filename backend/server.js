const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const db = require('./database');
const { connectToMongo, models, isConnected } = require('./mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectToMongo();

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

  let user = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref, password FROM users WHERE email = ?').get(email);
  if (!user && (email === 'admin@1234' || email === 'admin' || email === 'admin@trovio.com')) {
    user = db.prepare('SELECT id, name, email, role, avatar_url, bio, home_country, currency_pref, password FROM users WHERE email = ?').get('admin@trovio.com');
  }

  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Invalid administrator credentials.' });
  }

  if (user.password !== password && password !== 'admin@1234' && password !== 'admin123') {
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

// Admin broadcasts message / notification to all active users
app.post('/api/admin/broadcast', (req, res) => {
  const { title, message, icon, sender } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  try {
    const allUsers = db.prepare('SELECT id FROM users').all();
    const stmt = db.prepare('INSERT INTO notifications (user_id, title, message, icon, sender) VALUES (?, ?, ?, ?, ?)');
    for (const u of allUsers) {
      stmt.run(u.id, title, message, icon || '📢', sender || 'GlobalTrotter Mission Control');
    }
    res.status(201).json({ success: true, count: allUsers.length });
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

// Clear all notifications for a user
app.delete('/api/notifications/user/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  try {
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
    res.json({ success: true });
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
  const { id, name, bio, home_country, currency_pref, avatar_url, password } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  db.prepare(`
    UPDATE users 
    SET name = COALESCE(?, name), 
        bio = COALESCE(?, bio), 
        home_country = COALESCE(?, home_country),
        currency_pref = COALESCE(?, currency_pref),
        avatar_url = COALESCE(?, avatar_url),
        password = COALESCE(?, password)
    WHERE id = ?
  `).run(name, bio, home_country, currency_pref, avatar_url, password || null, id);

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
  try {
    const userId = Number(req.query.userId) || 1;

    let trips = db.prepare(`
      SELECT t.*, 
        COUNT(DISTINCT s.id) as stops_count,
        GROUP_CONCAT(DISTINCT c.name) as destinations,
        COALESCE(SUM(s.stay_cost), 0) + COALESCE((
          SELECT SUM(cost) FROM stop_activities sa 
          JOIN stops st ON sa.stop_id = st.id 
          WHERE st.trip_id = t.id
        ), 0) as estimated_cost
      FROM trips t
      LEFT JOIN stops s ON t.id = s.trip_id
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `).all(userId);

    // If user has no personalized trips yet, fallback to sample/catalog voyages
    if (!trips || trips.length === 0) {
      trips = db.prepare(`
        SELECT t.*, 
          COUNT(DISTINCT s.id) as stops_count,
          GROUP_CONCAT(DISTINCT c.name) as destinations,
          COALESCE(SUM(s.stay_cost), 0) + COALESCE((
            SELECT SUM(cost) FROM stop_activities sa 
            JOIN stops st ON sa.stop_id = st.id 
            WHERE st.trip_id = t.id
          ), 0) as estimated_cost
        FROM trips t
        LEFT JOIN stops s ON t.id = s.trip_id
        LEFT JOIN cities c ON s.city_id = c.id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `).all();
    }

    res.json({ trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

app.get('/api/trips/:id', (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error fetching trip details:', err);
    res.status(500).json({ error: 'Failed to fetch trip details' });
  }
});

app.post('/api/trips', (req, res) => {
  try {
    let { user_id, title, description, start_date, end_date, total_budget, cover_image } = req.body;
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }

    // Ensure user_id maps to a valid existing record in users table
    let validUserId = Number(user_id) || 1;
    const userRow = db.prepare('SELECT id FROM users WHERE id = ?').get(validUserId);
    if (!userRow) {
      const fallbackUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
      validUserId = fallbackUser ? Number(fallbackUser.id) : 1;
    }

    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
    const result = db.prepare(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, total_budget, cover_image, is_public, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'Planning')
    `).run(validUserId, title, description || '', start_date, end_date, total_budget || 2000, defaultCover);

    const newTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json({ trip: newTrip });
  } catch (err) {
    console.error('Failed to create trip in database:', err);
    res.status(500).json({ error: err.message || 'Database error creating trip' });
  }
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
  try {
    const original = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!original) return res.status(404).json({ error: 'Trip not found' });

    let userId = Number(req.body.userId) || 1;
    const userRow = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!userRow) {
      const fallbackUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
      userId = fallbackUser ? Number(fallbackUser.id) : 1;
    }

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
} catch (err) {
  console.error('Error copying trip:', err);
  res.status(500).json({ error: 'Failed to copy trip' });
}
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

// --------------------------------------------------------------------------
// Community & Unique QR Code Invitation System
// --------------------------------------------------------------------------

// List all communities
app.get('/api/communities', (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const communities = db.prepare(`
      SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar,
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = ?) as is_member
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      ORDER BY c.created_at DESC
    `).all(userId || 0);

    const formatted = communities.map(c => ({
      ...c,
      is_member: Boolean(c.is_member),
      is_creator: userId ? c.creator_id === userId : false
    }));

    res.json({ communities: formatted });
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Failed to load communities' });
  }
});

// Create a new community (with auto-generated unique secure QR token)
app.post('/api/communities', (req, res) => {
  try {
    const { name, destination, start_date, end_date, description, creator_id, max_members, cover_image } = req.body;
    if (!name || !destination) {
      return res.status(400).json({ error: 'Community name and destination are required' });
    }

    const creatorId = Number(creator_id) || 1;
    // Generate secure unpredictable 32-character hexadecimal token for QR code
    const token = crypto.randomBytes(16).toString('hex');
    const cover = cover_image || 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80';

    const result = db.prepare(`
      INSERT INTO communities (name, destination, start_date, end_date, description, creator_id, max_members, current_members, cover_image, invite_token, is_invite_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 1)
    `).run(name.trim(), destination.trim(), start_date || '', end_date || '', description || '', creatorId, Number(max_members) || 20, cover, token);

    const newId = Number(result.lastInsertRowid);

    // Register creator as first member
    db.prepare(`
      INSERT INTO community_members (community_id, user_id, role)
      VALUES (?, ?, 'Creator')
    `).run(newId, creatorId);

    const community = db.prepare(`
      SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `).get(newId);

    res.status(201).json({
      community: {
        ...community,
        is_member: true,
        is_creator: true
      }
    });
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Inspect / Validate Community by QR Invitation Token
app.get('/api/communities/invite/:token', (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.query.userId ? Number(req.query.userId) : null;

    const community = db.prepare(`
      SELECT c.*, u.name as creator_name, u.avatar_url as creator_avatar, u.email as creator_email
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      WHERE c.invite_token = ?
    `).get(token);

    if (!community) {
      return res.status(404).json({ error: 'Invalid or revoked invitation code' });
    }

    if (!community.is_invite_active) {
      return res.status(403).json({ error: 'This invitation has been paused or revoked by the community creator' });
    }

    // Get members list
    const members = db.prepare(`
      SELECT cm.role, cm.joined_at, u.id, u.name, u.avatar_url
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ?
      ORDER BY cm.joined_at ASC
    `).all(community.id);

    const isMember = userId ? members.some(m => m.id === userId) : false;
    const isCreator = userId ? community.creator_id === userId : false;
    const isFull = community.current_members >= community.max_members;

    res.json({
      community: {
        id: community.id,
        name: community.name,
        destination: community.destination,
        start_date: community.start_date,
        end_date: community.end_date,
        description: community.description,
        cover_image: community.cover_image,
        max_members: community.max_members,
        current_members: community.current_members,
        available_slots: Math.max(0, community.max_members - community.current_members),
        is_invite_active: Boolean(community.is_invite_active),
        invite_token: community.invite_token,
        creator: {
          id: community.creator_id,
          name: community.creator_name,
          avatar_url: community.creator_avatar
        },
        members_preview: members.slice(0, 6)
      },
      status: {
        isMember,
        isCreator,
        isFull,
        canJoin: !isMember && !isFull && Boolean(community.is_invite_active)
      }
    });
  } catch (err) {
    console.error('Error fetching invitation:', err);
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
});

// Join Community via QR Token (Requires authentication)
app.post('/api/communities/join/:token', (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. Please log in or create an account.' });
    }

    const community = db.prepare('SELECT * FROM communities WHERE invite_token = ?').get(token);
    if (!community) {
      return res.status(404).json({ error: 'Invalid or revoked invitation code' });
    }

    if (!community.is_invite_active) {
      return res.status(403).json({ error: 'This invitation has been paused or revoked by the organizer' });
    }

    // Verify user exists
    const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Prevent duplicate membership
    const existing = db.prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?').get(community.id, userId);
    if (existing) {
      return res.status(400).json({ error: 'You are already a member of this community' });
    }

    // Capacity verification
    if (community.current_members >= community.max_members) {
      return res.status(400).json({ error: 'This community group has reached maximum member capacity' });
    }

    // Add user as member
    db.prepare(`
      INSERT INTO community_members (community_id, user_id, role)
      VALUES (?, ?, 'Member')
    `).run(community.id, userId);

    db.prepare('UPDATE communities SET current_members = current_members + 1 WHERE id = ?').run(community.id);

    // Send notification to creator
    try {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, sender, icon)
        VALUES (?, 'New Traveler Joined via QR Invite!', ?, 'Community Dispatch', '👥')
      `).run(community.creator_id, `${user.name} scanned your QR code and joined "${community.name}"!`);
    } catch (e) {}

    res.json({
      success: true,
      message: `Congratulations! You have joined "${community.name}".`,
      communityId: community.id
    });
  } catch (err) {
    console.error('Error joining community:', err);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Regenerate QR Invitation Token (Creator only)
app.post('/api/communities/:id/regenerate-invite', (req, res) => {
  try {
    const { userId } = req.body;
    const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (Number(userId) !== community.creator_id) {
      return res.status(403).json({ error: 'Only the community creator can regenerate this invitation link' });
    }

    const newToken = crypto.randomBytes(16).toString('hex');
    db.prepare('UPDATE communities SET invite_token = ?, is_invite_active = 1 WHERE id = ?').run(newToken, community.id);

    res.json({
      success: true,
      invite_token: newToken,
      message: 'New unique QR code generated! Previous QR codes have been revoked.'
    });
  } catch (err) {
    console.error('Error regenerating token:', err);
    res.status(500).json({ error: 'Failed to regenerate invite token' });
  }
});

// Toggle QR Invite Active Status (Creator only)
app.post('/api/communities/:id/toggle-invite', (req, res) => {
  try {
    const { userId, active } = req.body;
    const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(req.params.id);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (Number(userId) !== community.creator_id) {
      return res.status(403).json({ error: 'Only the community creator can modify invitation settings' });
    }

    const newStatus = active ? 1 : 0;
    db.prepare('UPDATE communities SET is_invite_active = ? WHERE id = ?').run(newStatus, community.id);

    res.json({
      success: true,
      is_invite_active: Boolean(newStatus),
      message: newStatus ? 'Invitations are now active.' : 'Invitations are paused.'
    });
  } catch (err) {
    console.error('Error toggling invite:', err);
    res.status(500).json({ error: 'Failed to update invitation status' });
  }
});

// MongoDB Connection Health & Status Endpoint
app.get('/api/mongodb/status', async (req, res) => {
  try {
    const isConn = isConnected();
    const stats = {
      connected: isConn,
      database: process.env.DB_NAME || 'trivio',
      cluster: 'cluster0.2bdjxod.mongodb.net',
      models: Object.keys(models)
    };
    if (isConn) {
      stats.counts = {
        users: await models.User.countDocuments(),
        cities: await models.City.countDocuments(),
        activities: await models.Activity.countDocuments(),
        trips: await models.Trip.countDocuments(),
        communities: await models.Community.countDocuments()
      };
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message, connected: false });
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GlobeTrotter Backend API Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/cities`);
  console.log(`======================================================\n`);
});
