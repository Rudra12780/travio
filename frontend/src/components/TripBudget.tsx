import React, { useState, useEffect } from 'react';
import { Trip, Expense, ActiveTab } from '../types';
import { api } from '../api';

interface Props {
  tripId?: number;
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const TripBudget: React.FC<Props> = ({ tripId, userId = 1, onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<number | undefined>(tripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalBudget, setTotalBudget] = useState(2500);
  const [totalSpent, setTotalSpent] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // New Expense Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [expCategory, setExpCategory] = useState('Transit');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(50);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const loadBudgetDetails = (id: number) => {
    setLoading(true);
    api.getTrip(id).then(tRes => setTrip(tRes.trip));
    api.getExpenses(id).then(eRes => {
      setExpenses(eRes.expenses);
      setTotalBudget(eRes.totalBudget);
      setTotalSpent(eRes.totalSpent);
      setBreakdown(eRes.categoryBreakdown);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    api.getTrips(userId).then(res => {
      setTrips(res.trips);
      const chosenId = tripId || (res.trips[0] ? res.trips[0].id : undefined);
      setCurrentTripId(chosenId);
      if (chosenId) loadBudgetDetails(chosenId);
    });
  }, [tripId, userId]);

  const handleTripChange = (id: number) => {
    setCurrentTripId(id);
    loadBudgetDetails(id);
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTripId || !expDesc.trim()) return;

    try {
      await api.addExpense(currentTripId, {
        category: expCategory,
        description: expDesc.trim(),
        amount: Number(expAmount) || 0,
        date: expDate
      });
      setShowLogModal(false);
      setExpDesc('');
      loadBudgetDetails(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not log expense');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await api.deleteExpense(id);
      if (currentTripId) loadBudgetDetails(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not delete expense');
    }
  };

  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const spentPercent = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

  // Estimate days of trip for daily avg
  let tripDays = 1;
  if (trip?.start_date && trip?.end_date) {
    const d1 = new Date(trip.start_date);
    const d2 = new Date(trip.end_date);
    tripDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
  }
  const avgCostPerDay = Math.round(totalSpent / tripDays);

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Title Bar & Trip Selector */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E2F0',
        borderRadius: '22px',
        padding: '26px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 8px 24px rgba(32, 63, 112, 0.05)'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#8178E8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🌸 FINANCIAL INTELLIGENCE & TRACKING
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#292833' }}>Expedition Budget for</h2>
            <select
              value={currentTripId}
              onChange={(e) => handleTripChange(Number(e.target.value))}
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#8178E8',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '13.5px', color: '#777584', marginTop: '4px' }}>
            {trip?.start_date} → {trip?.end_date} ({tripDays} Days)
          </p>
        </div>

        <button type="button" className="btn-plan-budget" onClick={() => setShowLogModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span>+ Log Expense</span>
        </button>
      </div>

      {/* Overbudget Warning Alert */}
      {isOverBudget && (
        <div style={{
          background: '#FFF2F0',
          border: '1.5px solid #F5B0A4',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: '#C65335'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Budget Alert: Target Exceeded</h4>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              You have surpassed your allocated budget of ${totalBudget} by <strong>${Math.abs(remaining)}</strong>. Consider adjusting lodging or activity parameters.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '24px', border: '1.5px solid #E8E2F0', boxShadow: '0 8px 24px -4px rgba(32, 63, 112, 0.05)' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#777584', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Allocated</p>
          <p style={{ fontSize: '28px', fontWeight: 900, color: '#292833', marginTop: '4px' }}>${totalBudget}</p>
          <span style={{ fontSize: '12px', color: '#8178E8', fontWeight: 800 }}>Planned Target</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '24px', border: '1.5px solid #E8E2F0', boxShadow: '0 8px 24px -4px rgba(32, 63, 112, 0.05)' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#777584', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Logged</p>
          <p style={{ fontSize: '28px', fontWeight: 900, color: isOverBudget ? '#E11D48' : '#8178E8', marginTop: '4px' }}>${totalSpent}</p>
          <span style={{ fontSize: '12px', color: '#777584' }}>{spentPercent}% of total</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '24px', border: '1.5px solid #E8E2F0', boxShadow: '0 8px 24px -4px rgba(32, 63, 112, 0.05)' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#777584', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Balance</p>
          <p style={{ fontSize: '28px', fontWeight: 900, color: isOverBudget ? '#E11D48' : '#292833', marginTop: '4px' }}>
            {isOverBudget ? `-$${Math.abs(remaining)}` : `$${remaining}`}
          </p>
          <span style={{ fontSize: '12px', color: isOverBudget ? '#E11D48' : '#10B981', fontWeight: 800, background: isOverBudget ? '#FFE4E6' : '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
            {isOverBudget ? 'Over Budget' : 'Safe to spend'}
          </span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '24px', border: '1.5px solid #E8E2F0', boxShadow: '0 8px 24px -4px rgba(32, 63, 112, 0.05)' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#777584', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Burn Rate</p>
          <p style={{ fontSize: '28px', fontWeight: 900, color: '#292833', marginTop: '4px' }}>${avgCostPerDay} <span style={{ fontSize: '13px', color: '#777584', fontWeight: 500 }}>/ day</span></p>
          <span style={{ fontSize: '12px', color: '#777584' }}>Across {tripDays} days</span>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 8px 24px -4px rgba(32, 63, 112, 0.05)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#292833', marginBottom: '16px' }}>Category Allocations</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { cat: 'Transit', label: '🚗 Transit & Flights', amount: breakdown.Transit || 0, color: '#8178E8' },
            { cat: 'Stay', label: '🏨 Lodging & Hotels', amount: breakdown.Stay || 0, color: '#38BDF8' },
            { cat: 'Activities', label: '🎟️ Experiences & Tours', amount: breakdown.Activities || 0, color: '#F3AFCF' },
            { cat: 'Food', label: '🍽️ Dining & Cuisine', amount: breakdown.Food || 0, color: '#F59E0B' },
            { cat: 'Misc', label: '📦 Shopping & Misc', amount: breakdown.Misc || 0, color: '#A678BD' }
          ].map(item => {
            const percent = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
            return (
              <div key={item.cat} style={{ background: '#FAF9FC', padding: '16px', borderRadius: '18px', border: '1.5px solid #E8E2F0' }}>
                <p style={{ fontSize: '13px', fontWeight: 750, color: '#292833' }}>{item.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 900, color: '#292833', marginTop: '4px' }}>${item.amount}</p>
                <div style={{ marginTop: '8px', height: '7px', background: '#E8E2F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: item.color, borderRadius: '9999px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#777584', marginTop: '4px', display: 'block', fontWeight: 600 }}>{percent}% of spent</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses History Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>Logged Financial Ledger ({expenses.length})</h3>
          <button type="button" className="btn-plan-budget" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setShowLogModal(true)}>
            + Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '30px' }}>No expenses logged yet for this trip.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Description</th>
                <th style={{ padding: '12px 14px' }}>Amount</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', color: '#475569' }}>{exp.date}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      background: '#F1F5F9',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600, color: '#111827' }}>{exp.description}</td>
                  <td style={{ padding: '14px', fontWeight: 800, color: '#111827' }}>${exp.amount}</td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#E11D48',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Expense Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setShowLogModal(false)}>✕</button>
            <h2 className="modal-title">Log Trip Expense</h2>
            <p className="modal-desc">Record a payment for transit, stays, food, or experiences.</p>

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">CATEGORY</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                  >
                    <option value="Transit">🚗 Transit & Flights</option>
                    <option value="Stay">🏨 Lodging & Stays</option>
                    <option value="Activities">🎟️ Activities & Entries</option>
                    <option value="Food">🍽️ Dining & Food</option>
                    <option value="Misc">📦 Shopping & Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <div className="input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Udaipur Lakeside Dinner"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">AMOUNT ($)</label>
                  <div className="input-container">
                    <input
                      type="number"
                      className="form-input"
                      value={expAmount}
                      onChange={(e) => setExpAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">DATE</label>
                  <div className="input-container">
                    <input
                      type="date"
                      className="form-input"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit" style={{ marginTop: '8px' }}>
                <span>Record Expense</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
