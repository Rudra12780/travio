import React, { useState } from 'react';
import { api } from '../api';
import { Trip } from '../types';

interface Props {
  isOpen: boolean;
  userId?: number;
  onClose: () => void;
  onTripGenerated: (trip: Trip) => void;
}

export const BudgetCrafterModal: React.FC<Props> = ({
  isOpen,
  userId = 1,
  onClose,
  onTripGenerated
}) => {
  const [budget, setBudget] = useState(2400);
  const [region, setRegion] = useState('Rajasthan');
  const [pace, setPace] = useState('Balanced');
  const [theme, setTheme] = useState('Heritage & Palaces');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tripTitle = `${region} ${theme.split('&')[0]} Expedition`;
    const coverImages: Record<string, string> = {
      Rajasthan: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80',
      Kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'Golden Triangle': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      Japan: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
    };

    try {
      const res = await api.createTrip({
        user_id: userId,
        title: tripTitle,
        description: `AI-crafted ${pace.toLowerCase()} voyage optimized for a budget of $${budget} with curated ${theme.toLowerCase()} stops.`,
        start_date: '2026-11-01',
        end_date: '2026-11-10',
        total_budget: budget,
        cover_image: coverImages[region] || coverImages.Rajasthan
      });

      // Add appropriate initial stops
      const citiesRes = await api.getCities({ region: region === 'Japan' ? 'East Asia' : region });
      const targetCities = citiesRes.cities.slice(0, 3);

      for (let i = 0; i < targetCities.length; i++) {
        await api.addStop(res.trip.id, {
          city_id: targetCities[i].id,
          start_date: `2026-11-0${1 + i * 3}`,
          end_date: `2026-11-0${3 + i * 3}`,
          transit_mode: i === 0 ? 'Flight' : 'Car',
          stay_cost: Math.round(budget * 0.15)
        });
      }

      setLoading(false);
      onTripGenerated(res.trip);
      onClose();
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Could not generate itinerary');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div className="modal-icon-badge" style={{ background: '#FFF1F2', color: '#E11D48' }}>
          <span style={{ fontSize: '24px' }}>✨</span>
        </div>

        <h2 className="modal-title">AI Smart Budget Crafter</h2>
        <p className="modal-desc">
          Set your total spend and let our travel intelligence engine design your complete multi-city itinerary.
        </p>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Budget Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <label className="form-label">TARGET EXPEDITION BUDGET</label>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0D9488' }}>${budget}</span>
            </div>
            <input
              type="range"
              min="500"
              max="8000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0D9488', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
              <span>$500 (Budget Explorer)</span>
              <span>$4,000 (Comfort)</span>
              <span>$8,000 (Royal Luxury)</span>
            </div>
          </div>

          {/* Region */}
          <div className="form-group">
            <label className="form-label">DESTINATION REGION</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {['Rajasthan', 'Kerala', 'Golden Triangle', 'Japan'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  style={{
                    background: region === r ? '#0D9488' : '#F1F5F9',
                    color: region === r ? '#FFFFFF' : '#1E293B',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Theme */}
          <div className="form-group">
            <label className="form-label">VOYAGE VIBE & THEME</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {['Heritage & Palaces', 'Wilderness & Desert Safari', 'Culinary & Street Food', 'Scenic Nature & Lakes'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  style={{
                    background: theme === t ? '#4F46E5' : '#F8FAFC',
                    color: theme === t ? '#FFFFFF' : '#334155',
                    border: theme === t ? '1.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Pace */}
          <div className="form-group">
            <label className="form-label">TRAVEL PACE</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Relaxed (3 days/city)', 'Balanced (2 days/city)', 'Fast-paced (1-2 days/city)'].map(p => {
                const paceKey = p.split(' ')[0];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(paceKey)}
                    style={{
                      flex: 1,
                      background: pace === paceKey ? '#0D9488' : '#F1F5F9',
                      color: pace === paceKey ? '#FFFFFF' : '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {paceKey}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
            style={{ marginTop: '8px', background: 'linear-gradient(135deg, #E11D48 0%, #EA580C 100%)' }}
          >
            {!loading ? (
              <span>⚡ Generate Custom Package & Itinerary</span>
            ) : (
              <div className="spinner" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
