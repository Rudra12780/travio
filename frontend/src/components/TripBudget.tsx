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

  let tripDays = 1;
  if (trip?.start_date && trip?.end_date) {
    const d1 = new Date(trip.start_date);
    const d2 = new Date(trip.end_date);
    tripDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
  }
  const avgCostPerDay = Math.round(totalSpent / tripDays);

  return (
    <div style={{ marginTop: '24px', paddingBottom: '60px' }}>
      {/* Title Bar & Trip Selector */}
      <div style={{
        background: '#FFFFFF',
        border: '2px solid #101010',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-block', marginBottom: '4px' }}>
            EDITORIAL FINANCIAL INTELLIGENCE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#101010', margin: 0, letterSpacing: '-0.03em' }}>
              Expedition Budget:
            </h2>
            <select
              value={currentTripId}
              onChange={(e) => handleTripChange(Number(e.target.value))}
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#101010',
                border: '2px solid #101010',
                borderRadius: '8px',
                padding: '4px 10px',
                background: '#FFD84D',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '2px 2px 0px #101010'
              }}
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '13.5px', color: '#555555', marginTop: '6px', margin: 0 }}>
            📅 {trip?.start_date} → {trip?.end_date} • <strong>{tripDays} Days Duration</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          style={{
            background: '#FFD84D',
            color: '#101010',
            fontWeight: 900,
            border: '2px solid #101010',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #101010',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span>+ Log Expense</span>
        </button>
      </div>

      {/* Overbudget Warning Alert */}
      {isOverBudget && (
        <div style={{
          background: '#F4AFC1',
          border: '2px solid #101010',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: '#101010',
          boxShadow: '3px 3px 0px #101010'
        }}>
          <span style={{ fontSize: '26px' }}>⚠️</span>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 900, margin: '0 0 4px' }}>Budget Alert: Target Exceeded</h4>
            <p style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>
              You have surpassed your allocated budget of ${totalBudget} by <strong>${Math.abs(remaining)}</strong>. Consider adjusting lodging or activities.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '2px solid #101010', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ fontSize: '11px', fontWeight: 900, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Total Allocated</p>
          <p style={{ fontSize: '32px', fontWeight: 900, color: '#101010', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>${totalBudget}</p>
          <span style={{ fontSize: '12px', color: '#101010', fontWeight: 800, background: '#FFD84D', padding: '2px 8px', borderRadius: '4px', border: '1px solid #101010' }}>Target Baseline</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '2px solid #101010', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ fontSize: '11px', fontWeight: 900, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Total Logged</p>
          <p style={{ fontSize: '32px', fontWeight: 900, color: isOverBudget ? '#E11D48' : '#101010', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>${totalSpent}</p>
          <span style={{ fontSize: '12px', color: '#555555', fontWeight: 700 }}>{spentPercent}% of total</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '2px solid #101010', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ fontSize: '11px', fontWeight: 900, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Remaining Balance</p>
          <p style={{ fontSize: '32px', fontWeight: 900, color: isOverBudget ? '#E11D48' : '#101010', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
            {isOverBudget ? `-$${Math.abs(remaining)}` : `$${remaining}`}
          </p>
          <span style={{
            fontSize: '11px',
            color: '#101010',
            fontWeight: 900,
            background: isOverBudget ? '#F4AFC1' : '#36B7B3',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid #101010',
            textTransform: 'uppercase'
          }}>
            {isOverBudget ? 'Over Budget' : 'Safe to spend'}
          </span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '14px', border: '2px solid #101010', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ fontSize: '11px', fontWeight: 900, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Daily Burn Rate</p>
          <p style={{ fontSize: '32px', fontWeight: 900, color: '#101010', margin: '6px 0 4px', letterSpacing: '-0.03em' }}>
            ${avgCostPerDay} <span style={{ fontSize: '14px', color: '#555555', fontWeight: 600 }}>/ day</span>
          </p>
          <span style={{ fontSize: '12px', color: '#555555', fontWeight: 700 }}>Across {tripDays} planned days</span>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Category Allocations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { cat: 'Transit', label: '🚗 Transit & Flights', amount: breakdown.Transit || 0, color: '#429FE8' },
            { cat: 'Stay', label: '🏨 Lodging & Stays', amount: breakdown.Stay || 0, color: '#36B7B3' },
            { cat: 'Activities', label: '🎟️ Experiences & Tours', amount: breakdown.Activities || 0, color: '#FFD84D' },
            { cat: 'Food', label: '🍽️ Dining & Cuisine', amount: breakdown.Food || 0, color: '#F4AFC1' },
            { cat: 'Misc', label: '📦 Shopping & Misc', amount: breakdown.Misc || 0, color: '#E8E6E0' }
          ].map(item => {
            const percent = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
            return (
              <div key={item.cat} style={{ background: '#F7F6F2', padding: '16px', borderRadius: '12px', border: '1.5px solid #101010' }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#101010', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#101010', margin: '6px 0' }}>${item.amount}</p>
                <div style={{ marginTop: '6px', height: '8px', background: '#FFFFFF', borderRadius: '4px', overflow: 'hidden', border: '1px solid #101010' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: item.color }} />
                </div>
                <span style={{ fontSize: '11px', color: '#555555', marginTop: '6px', display: 'block', fontWeight: 700 }}>{percent}% of spent</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses History Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '24px',
        overflowX: 'auto',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Logged Financial Ledger ({expenses.length})
          </h3>
          <button
            type="button"
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              background: '#FFD84D',
              color: '#101010',
              fontWeight: 900,
              border: '2px solid #101010',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #101010',
              textTransform: 'uppercase'
            }}
            onClick={() => setShowLogModal(true)}
          >
            + Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#555555', textAlign: 'center', padding: '36px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px dashed #101010' }}>
            No expenses logged yet for this trip. Click "+ Log Expense" above to add receipts.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #101010', color: '#101010', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Description</th>
                <th style={{ padding: '12px 14px' }}>Amount</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #E8E6E0' }}>
                  <td style={{ padding: '14px', color: '#555555', fontWeight: 600 }}>{exp.date}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      background: exp.category === 'Transit' ? '#429FE8' : exp.category === 'Stay' ? '#36B7B3' : exp.category === 'Food' ? '#F4AFC1' : '#FFD84D',
                      color: '#101010',
                      fontSize: '11px',
                      fontWeight: 900,
                      padding: '3px 9px',
                      borderRadius: '4px',
                      border: '1px solid #101010',
                      textTransform: 'uppercase'
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: '#101010' }}>{exp.description}</td>
                  <td style={{ padding: '14px', fontWeight: 900, color: '#101010' }}>${exp.amount}</td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{
                        background: '#F4AFC1',
                        border: '1.5px solid #101010',
                        color: '#101010',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '12px',
                        boxShadow: '1px 1px 0px #101010'
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
          <div
            className="modal-card"
            style={{
              maxWidth: '480px',
              padding: '28px',
              background: '#FFFFFF',
              border: '2px solid #101010',
              borderRadius: '16px',
              boxShadow: '6px 6px 0px #101010'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowLogModal(false)}
              style={{ color: '#101010', fontWeight: 900 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#101010', margin: '0 0 6px' }}>
              Log Trip Expense
            </h2>
            <p style={{ fontSize: '13px', color: '#555555', margin: '0 0 20px' }}>
              Record a payment for transit, stays, food, or experiences.
            </p>

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #101010',
                    background: '#F7F6F2',
                    color: '#101010',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value="Transit">🚗 Transit & Flights</option>
                  <option value="Stay">🏨 Lodging & Stays</option>
                  <option value="Activities">🎟️ Activities & Entries</option>
                  <option value="Food">🍽️ Dining & Food</option>
                  <option value="Misc">📦 Shopping & Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oia Sunset Cliffside Dinner"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #101010',
                    background: '#F7F6F2',
                    color: '#101010',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #101010',
                      background: '#F7F6F2',
                      color: '#101010',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #101010',
                      background: '#F7F6F2',
                      color: '#101010',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#FFD84D',
                  color: '#101010',
                  border: '2px solid #101010',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #101010',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Record Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
