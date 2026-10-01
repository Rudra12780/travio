import { Trip, City, Activity, Expense, UserProfile, AdminStats } from './types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  async adminLogin(email: string, password: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Access denied. Invalid administrator credentials.');
    }
    return res.json();
  },

  async getAdminUsers(): Promise<{ users: any[] }> {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch platform users');
    return res.json();
  },

  async register(name: string, email: string, password?: string): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error('Failed to register');
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile> & { id: number }): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Trips
  async getTrips(userId: number = 1): Promise<{ trips: Trip[] }> {
    const res = await fetch(`${API_BASE}/trips?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  async getTrip(id: number): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`);
    if (!res.ok) throw new Error('Failed to fetch trip');
    return res.json();
  },

  async createTrip(data: {
    user_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    total_budget: number;
    cover_image?: string;
  }): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return res.json();
  },

  async updateTrip(id: number, data: Partial<Trip>): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update trip');
    return res.json();
  },

  async deleteTrip(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete trip');
    return res.json();
  },

  async copyTrip(id: number, userId: number = 1): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to copy trip');
    return res.json();
  },

  // Stops
  async addStop(tripId: number, data: {
    city_id: number;
    start_date: string;
    end_date: string;
    transit_mode: string;
    stay_cost?: number;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add stop');
    return res.json();
  },

  async deleteStop(stopId: number) {
    const res = await fetch(`${API_BASE}/stops/${stopId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete stop');
    return res.json();
  },

  async reorderStops(tripId: number, orderedStopIds: number[]) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/stops/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedStopIds })
    });
    if (!res.ok) throw new Error('Failed to reorder stops');
    return res.json();
  },

  // Stop Activities
  async addStopActivity(stopId: number, data: {
    activity_id?: number;
    custom_title?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    cost?: number;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/stops/${stopId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add activity');
    return res.json();
  },

  async deleteStopActivity(id: number) {
    const res = await fetch(`${API_BASE}/stop-activities/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete activity');
    return res.json();
  },

  // Cities
  async getCities(params?: { search?: string; region?: string; maxCostIndex?: number }): Promise<{ cities: City[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.region) query.append('region', params.region);
    if (params?.maxCostIndex) query.append('maxCostIndex', String(params.maxCostIndex));

    const res = await fetch(`${API_BASE}/cities?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  async getCityDetails(id: number): Promise<{ city: City & { activities: Activity[] } }> {
    const res = await fetch(`${API_BASE}/cities/${id}`);
    if (!res.ok) throw new Error('Failed to fetch city details');
    return res.json();
  },

  // Activities
  async getActivities(params?: {
    cityId?: number;
    category?: string;
    search?: string;
    maxCost?: number;
  }): Promise<{ activities: Activity[] }> {
    const query = new URLSearchParams();
    if (params?.cityId) query.append('cityId', String(params.cityId));
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.maxCost) query.append('maxCost', String(params.maxCost));

    const res = await fetch(`${API_BASE}/activities?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },

  // Expenses & Budget
  async getExpenses(tripId: number): Promise<{
    expenses: Expense[];
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    categoryBreakdown: Record<string, number>;
  }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async addExpense(tripId: number, data: {
    category: string;
    description: string;
    amount: number;
    date: string;
  }): Promise<{ expense: Expense }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add expense');
    return res.json();
  },

  async deleteExpense(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete expense');
    return res.json();
  },

  // Wishlist
  async getWishlist(userId: number = 1): Promise<{ wishlist: City[] }> {
    const res = await fetch(`${API_BASE}/wishlist?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async addToWishlist(cityId: number, userId: number = 1) {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cityId })
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return res.json();
  },

  async removeFromWishlist(cityId: number, userId: number = 1) {
    const res = await fetch(`${API_BASE}/wishlist/${cityId}?userId=${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async deleteAdminUser(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete traveler');
    }
    return res.json();
  },

  async sendAdminMessage(data: { user_id: number; title: string; message: string; icon?: string; sender?: string }): Promise<{ success: boolean; notification: any }> {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async getNotifications(userId: number): Promise<{ notifications: any[] }> {
    const res = await fetch(`${API_BASE}/notifications/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async deleteNotification(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to dismiss notification');
    return res.json();
  },

  async scheduleAdminTrip(tripData: any): Promise<{ success: boolean; trip: Trip }> {
    const res = await fetch(`${API_BASE}/admin/trips/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to schedule trip');
    }
    return res.json();
  }
};
