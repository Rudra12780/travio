export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  home_country?: string;
  currency_pref?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'my-trips' 
  | 'itinerary-builder' 
  | 'itinerary-view' 
  | 'cities' 
  | 'activities' 
  | 'expenses' 
  | 'calendar' 
  | 'live-trip' 
  | 'settings' 
  | 'community'
  | 'admin';

export interface City {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity_score: number;
  avg_cost_per_day: number;
  climate: string;
  description: string;
  image_url: string;
}

export interface Activity {
  id: number;
  city_id: number;
  city_name?: string;
  city_country?: string;
  name: string;
  category: string;
  cost: number;
  duration_hours: number;
  rating: number;
  description: string;
  image_url: string;
}

export interface StopActivity {
  id: number;
  stop_id: number;
  activity_id?: number;
  custom_title: string;
  scheduled_date: string;
  scheduled_time: string;
  cost: number;
  notes?: string;
  original_name?: string;
  category?: string;
  duration_hours?: number;
  rating?: number;
  image_url?: string;
}

export interface Stop {
  id: number;
  trip_id: number;
  city_id: number;
  city_name?: string;
  city_country?: string;
  city_region?: string;
  city_image?: string;
  avg_cost_per_day?: number;
  climate?: string;
  order_index: number;
  start_date: string;
  end_date: string;
  transit_mode: string;
  stay_cost: number;
  notes?: string;
  activities?: StopActivity[];
}

export interface Expense {
  id: number;
  trip_id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface TripSummary {
  totalExpenseLogged: number;
  estimatedStay: number;
  estimatedActivities: number;
  totalEstimated: number;
}

export interface Trip {
  id: number;
  user_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  cover_image: string;
  is_public: number;
  status: 'Planning' | 'Active' | 'Completed';
  created_at?: string;
  stops_count?: number;
  estimated_cost?: number;
  stops?: Stop[];
  expenses?: Expense[];
  summary?: TripSummary;
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    totalTrips: number;
    totalCities: number;
    totalActivities: number;
  };
  popularCities: Array<{
    name: string;
    country: string;
    stop_count: number;
    popularity_score: number;
  }>;
  recentTrips: Array<{
    title: string;
    traveler: string;
    start_date: string;
    end_date: string;
    total_budget: number;
  }>;
}
