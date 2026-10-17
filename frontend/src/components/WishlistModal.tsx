import React from 'react';
import { ActiveTab } from '../types';

interface WishlistItem {
  id: number;
  name: string;
  category: string;
  location: string;
  image: string;
  estCost: string;
  rating: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const WishlistModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const wishlist: WishlistItem[] = [
    {
      id: 1,
      name: 'Lake Palace Heritage Stay',
      category: 'Luxury Stay',
      location: 'Udaipur, India',
      image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=400&q=80',
      estCost: '$320/night',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Sam Sand Dunes Camel Safari',
      category: 'Desert Adventure',
      location: 'Jaisalmer, India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80',
      estCost: '$45/person',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Alleppey Backwaters Houseboat',
      category: 'Scenic Aquatic Cruise',
      location: 'Kerala, India',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80',
      estCost: '$160/night',
      rating: 4.9
    },
    {
      id: 4,
      name: 'Fushimi Inari Torii Gates',
      category: 'Cultural Shrine',
      location: 'Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
      estCost: 'Free Entry',
      rating: 5.0
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '620px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.3) 0%, rgba(243, 175, 207, 0.3) 100%)',
            color: '#A678BD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            border: '1px solid rgba(166, 120, 189, 0.2)'
          }}>
            ❤️
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#292833', margin: 0 }}>
              Traveler Wishlist & Bookmarks
            </h2>
            <p style={{ fontSize: '13px', color: '#777584', margin: 0 }}>
              Saved destinations and experiences ready to include in your voyages
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
          {wishlist.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#FAF9FC',
                borderRadius: '16px',
                border: '1.5px solid #E8E2F0',
                gap: '14px'
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
              />

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8178E8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.category}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#292833', margin: '2px 0' }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '12px', color: '#777584', margin: 0 }}>
                  📍 {item.location} • <span style={{ color: '#A678BD', fontWeight: 700 }}>★ {item.rating}</span> • {item.estCost}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('itinerary-builder');
                }}
                style={{
                  background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(129, 120, 232, 0.25)'
                }}
              >
                + Add to Plan
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('cities');
            }}
            style={{
              background: '#FFFFFF',
              color: '#292833',
              border: '1.5px solid #E8E2F0',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Explore More Cities
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#203F70',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(32, 63, 112, 0.2)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
