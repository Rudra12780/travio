require('dotenv').config();
const { connectToMongo, models } = require('./mongodb');
const db = require('./database');

async function seedMongo() {
  const connected = await connectToMongo();
  if (!connected) {
    console.log('❌ Could not connect to MongoDB. Please ensure MONGODB_URI is set in backend/.env');
    process.exit(1);
  }

  console.log('🚀 Seeding MongoDB "trovio" database from existing dataset...');

  try {
    // 1. Users
    const users = db.prepare('SELECT * FROM users').all();
    for (const u of users) {
      await models.User.findOneAndUpdate(
        { id: u.id },
        { ...u, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Users seeded: ${users.length}`);

    // 2. Cities
    const cities = db.prepare('SELECT * FROM cities').all();
    for (const c of cities) {
      await models.City.findOneAndUpdate(
        { id: c.id },
        { ...c, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Cities seeded: ${cities.length}`);

    // 3. Activities
    const activities = db.prepare('SELECT * FROM activities').all();
    for (const a of activities) {
      await models.Activity.findOneAndUpdate(
        { id: a.id },
        { ...a, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Activities seeded: ${activities.length}`);

    // 4. Trips
    const trips = db.prepare('SELECT * FROM trips').all();
    for (const t of trips) {
      await models.Trip.findOneAndUpdate(
        { id: t.id },
        { ...t, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Trips seeded: ${trips.length}`);

    // 5. Stops
    const stops = db.prepare('SELECT * FROM stops').all();
    for (const s of stops) {
      await models.Stop.findOneAndUpdate(
        { id: s.id },
        { ...s, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Stops seeded: ${stops.length}`);

    // 6. Stop Activities
    const stopActivities = db.prepare('SELECT * FROM stop_activities').all();
    for (const sa of stopActivities) {
      await models.StopActivity.findOneAndUpdate(
        { id: sa.id },
        { ...sa, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Stop Activities seeded: ${stopActivities.length}`);

    // 7. Expenses
    const expenses = db.prepare('SELECT * FROM expenses').all();
    for (const e of expenses) {
      await models.Expense.findOneAndUpdate(
        { id: e.id },
        { ...e, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Expenses seeded: ${expenses.length}`);

    // 8. Wishlist
    const wishlist = db.prepare('SELECT * FROM wishlist').all();
    for (const w of wishlist) {
      await models.Wishlist.findOneAndUpdate(
        { id: w.id },
        { ...w, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Wishlist seeded: ${wishlist.length}`);

    // 9. Notifications
    const notifications = db.prepare('SELECT * FROM notifications').all();
    for (const n of notifications) {
      await models.Notification.findOneAndUpdate(
        { id: n.id },
        { ...n, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Notifications seeded: ${notifications.length}`);

    // 10. Communities
    const communities = db.prepare('SELECT * FROM communities').all();
    for (const comm of communities) {
      await models.Community.findOneAndUpdate(
        { id: comm.id },
        { ...comm, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Communities seeded: ${communities.length}`);

    // 11. Community Members
    const members = db.prepare('SELECT * FROM community_members').all();
    for (const m of members) {
      await models.CommunityMember.findOneAndUpdate(
        { id: m.id },
        { ...m, _id: undefined },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Community Members seeded: ${members.length}`);

    console.log('🎉 MongoDB "trovio" database fully seeded and synchronized!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB seeding:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedMongo();
}

module.exports = seedMongo;
