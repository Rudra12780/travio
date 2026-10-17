import React, { useState, useEffect } from 'react';
import { Trip, ActiveTab } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  tripId?: number;
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const TripCalendar: React.FC<Props> = ({ tripId, userId = 1, onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October (0-indexed: 9)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [selectedTripDetail, setSelectedTripDetail] = useState<Trip | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    api.getTrips(userId).then(res => {
      setTrips(res.trips);
    });
  }, [userId]);

  const prevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonthIndex(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonthIndex(m => m + 1);
    }
  };

  // Generate calendar days for the current month
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  const calendarCells: ({ dayNum: number; dateStr: string; isCurrentMonth: boolean })[] = [];

  // Padding days before start of month
  const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthDays - i,
      dateStr: '',
      isCurrentMonth: false
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const monthPadded = String(currentMonthIndex + 1).padStart(2, '0');
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
    calendarCells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true
    });
  }

  // Get trips matching search
  const filteredTrips = trips.filter(t => {
    return !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Assign distinct pastel luxury colors to trips
  const tripColors = [
    { bg: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)', text: '#FFFFFF', name: 'Periwinkle' },
    { bg: 'linear-gradient(135deg, #C39AD9 0%, #F7BFD5 100%)', text: '#203F70', name: 'Lavender' },
    { bg: 'linear-gradient(135deg, #203F70 0%, #192B4D 100%)', text: '#FAF9FC', name: 'Deep Navy' },
    { bg: 'linear-gradient(135deg, #F3AFCF 0%, #F7BFD5 100%)', text: '#292833', name: 'Blush' }
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Title & Screen Indicator */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#292833', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
          Expedition Calendar & Schedules
        </h2>
        <p style={{ fontSize: '13.5px', color: '#777584', margin: 0 }}>
          Monthly luxury journey schedules, multi-day itinerary spans, and departure timelines
        </p>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Search scheduled trips..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Region', 'By Status']}
        filterOptions={['All', 'Active', 'Planning', 'Completed']}
        sortByOptions={['Date', 'Trip Duration', 'Budget']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Calendar Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '28px',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.05)',
        marginTop: '16px'
      }}>
        {/* Month Switcher Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1.5px solid #E8E2F0'
        }}>
          <button
            type="button"
            onClick={prevMonth}
            style={{
              background: '#FAF9FC',
              border: '1px solid #E8E2F0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 800,
              color: '#292833'
            }}
          >
            ←
          </button>

          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#292833', margin: 0 }}>
            {monthNames[currentMonthIndex]} {currentYear}
          </h3>

          <button
            type="button"
            onClick={nextMonth}
            style={{
              background: '#FAF9FC',
              border: '1px solid #E8E2F0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 800,
              color: '#292833'
            }}
          >
            →
          </button>
        </div>

        {/* Days of Week Header: SUN MON TUE WED THU FRI SAT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '12.5px',
          color: '#64748B',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* 7-Column Calendar Grid with Event Spans (Screen 11) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {calendarCells.map((cell, idx) => {
            // Find trips that cover this date
            const matchingTrips = cell.isCurrentMonth
              ? filteredTrips.filter(t => {
                  if (!t.start_date || !t.end_date) return false;
                  return cell.dateStr >= t.start_date && cell.dateStr <= t.end_date;
                })
              : [];

            return (
              <div
                key={idx}
                style={{
                  minHeight: '90px',
                  background: cell.isCurrentMonth ? '#FFFFFF' : '#FAF9FC',
                  border: '1px solid #E8E2F0',
                  borderRadius: '14px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: cell.isCurrentMonth ? 1 : 0.45,
                  boxShadow: matchingTrips.length > 0 ? '0 4px 12px rgba(129, 120, 232, 0.12)' : 'none',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: cell.isCurrentMonth ? '#292833' : '#777584',
                  marginBottom: '6px'
                }}>
                  {cell.dayNum}
                </div>

                {/* Event Spans / Trip Blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                  {matchingTrips.map((trip, tIdx) => {
                    const color = tripColors[tIdx % tripColors.length];
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTripDetail(trip)}
                        title={`${trip.title} (${trip.start_date} → ${trip.end_date})`}
                        style={{
                          background: color.bg,
                          color: color.text,
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '5px 8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          boxShadow: '0 2px 6px rgba(32, 63, 112, 0.12)'
                        }}
                      >
                        {trip.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Trip Details Drawer / Modal */}
      {selectedTripDetail && (
        <div className="modal-overlay" onClick={() => setSelectedTripDetail(null)}>
          <div className="modal-card" style={{ maxWidth: '520px', borderRadius: '24px', border: '1.5px solid #E8E2F0' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setSelectedTripDetail(null)}>✕</button>
            <img
              src={selectedTripDetail.cover_image}
              alt={selectedTripDetail.title}
              style={{ width: '100%', height: '170px', borderRadius: '16px', objectFit: 'cover', marginBottom: '16px', border: '1px solid #E8E2F0' }}
            />
            <span style={{
              background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(129, 120, 232, 0.25)'
            }}>
              {selectedTripDetail.status}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#292833', margin: '10px 0' }}>
              {selectedTripDetail.title}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#777584', lineHeight: '1.5' }}>
              {selectedTripDetail.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#FAF9FC', borderRadius: '14px', margin: '16px 0', fontSize: '13px', border: '1px solid #E8E2F0' }}>
              <span style={{ color: '#292833', fontWeight: 600 }}>📅 {selectedTripDetail.start_date} → {selectedTripDetail.end_date}</span>
              <span style={{ fontWeight: 800, color: '#8178E8' }}>Budget: ${selectedTripDetail.total_budget}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-plan-budget"
                onClick={() => {
                  setSelectedTripDetail(null);
                  onNavigate('itinerary-view', selectedTripDetail.id);
                }}
                style={{ flex: 1, padding: '12px' }}
              >
                View Timeline Itinerary
              </button>
              <button
                type="button"
                className="btn-explore-packages"
                onClick={() => {
                  setSelectedTripDetail(null);
                  onNavigate('itinerary-builder', selectedTripDetail.id);
                }}
                style={{ flex: 1, padding: '12px' }}
              >
                Edit in Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
