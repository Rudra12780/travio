const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'trovio';

// Schema Definitions for 'trovio' database
const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Traveler' },
  avatar_url: String,
  bio: String,
  home_country: { type: String, default: 'India' },
  currency_pref: { type: String, default: 'USD' },
  created_at: { type: Date, default: Date.now }
});

const CitySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  region: { type: String, required: true },
  cost_index: { type: Number, default: 2 },
  popularity_score: { type: Number, default: 4.8 },
  avg_cost_per_day: { type: Number, default: 85 },
  climate: String,
  description: String,
  image_url: String
});

const ActivitySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  city_id: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  cost: { type: Number, default: 25 },
  duration_hours: { type: Number, default: 2.5 },
  rating: { type: Number, default: 4.8 },
  description: String,
  image_url: String
});

const TripSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  total_budget: { type: Number, default: 2500 },
  cover_image: String,
  is_public: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  scheduled_at: String,
  created_at: { type: Date, default: Date.now }
});

const StopSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  trip_id: { type: Number, required: true },
  city_id: { type: Number, required: true },
  order_index: { type: Number, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  transit_mode: { type: String, default: 'Flight' },
  stay_cost: { type: Number, default: 120 },
  notes: String
});

const StopActivitySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  stop_id: { type: Number, required: true },
  activity_id: Number,
  custom_title: String,
  scheduled_date: String,
  scheduled_time: String,
  cost: { type: Number, default: 0 },
  notes: String
});

const ExpenseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  trip_id: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }
});

const WishlistSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  city_id: { type: Number, required: true },
  added_at: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  user_id: { type: Number, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, default: 'Admin Mission Control' },
  icon: { type: String, default: '✈️' },
  is_read: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const CommunitySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  destination: { type: String, required: true },
  start_date: String,
  end_date: String,
  description: String,
  creator_id: { type: Number, required: true },
  max_members: { type: Number, default: 20 },
  current_members: { type: Number, default: 1 },
  cover_image: String,
  invite_token: { type: String, required: true, unique: true },
  is_invite_active: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

const CommunityMemberSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  community_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  role: { type: String, default: 'Member' },
  joined_at: { type: Date, default: Date.now }
});

// Compile models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const City = mongoose.models.City || mongoose.model('City', CitySchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
const Stop = mongoose.models.Stop || mongoose.model('Stop', StopSchema);
const StopActivity = mongoose.models.StopActivity || mongoose.model('StopActivity', StopActivitySchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);
const CommunityMember = mongoose.models.CommunityMember || mongoose.model('CommunityMember', CommunityMemberSchema);

let isConnected = false;

async function connectToMongo(uri) {
  const connectionUri = uri || MONGODB_URI;
  if (!connectionUri) {
    console.log('⚠️ [MongoDB] No MONGODB_URI configured in backend/.env yet.');
    return false;
  }
  try {
    await mongoose.connect(connectionUri, {
      dbName: DB_NAME
    });
    isConnected = true;
    console.log(`✅ [MongoDB Atlas] Connected successfully to database: "${DB_NAME}"`);
    return true;
  } catch (err) {
    console.error('❌ [MongoDB Atlas] Connection error:', err.message);
    return false;
  }
}

module.exports = {
  connectToMongo,
  isConnected: () => isConnected,
  models: {
    User,
    City,
    Activity,
    Trip,
    Stop,
    StopActivity,
    Expense,
    Wishlist,
    Notification,
    Community,
    CommunityMember
  }
};
