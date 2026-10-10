import React, { useState, useRef, useEffect } from 'react';

interface Props {
  placeholder?: string;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  groupByOptions?: string[];
  filterOptions?: string[];
  sortByOptions?: string[];
  selectedGroup?: string;
  selectedFilter?: string;
  selectedSort?: string;
  onGroupChange?: (group: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  style?: React.CSSProperties;
}

export const GlobalSearchBar: React.FC<Props> = ({
  placeholder = 'Search bar .....',
  searchTerm = '',
  onSearchChange,
  groupByOptions = ['Default', 'By Region', 'By Budget', 'By Duration'],
  filterOptions = ['All Status', 'Active', 'Upcoming', 'Completed'],
  sortByOptions = ['Popularity', 'Date (Newest)', 'Date (Oldest)', 'Price (Low to High)', 'Price (High to Low)'],
  selectedGroup = 'Default',
  selectedFilter = 'All Status',
  selectedSort = 'Popularity',
  onGroupChange,
  onFilterChange,
  onSortChange,
  style
}) => {
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setShowGroupMenu(false);
        setShowFilterMenu(false);
        setShowSortMenu(false);
      }
    };
    if (showGroupMenu || showFilterMenu || showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGroupMenu, showFilterMenu, showSortMenu]);

  return (
    <div 
      ref={searchBarRef}
      className="global-search-bar-wrap" 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: '18px 0',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 100,
        ...style
      }}
    >
      {/* Main Search Input */}
      <div 
        style={{
          flex: '1 1 280px',
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '999px',
          padding: '8px 18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" style={{ marginRight: '10px', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: '14px',
            color: '#0F172A',
            fontFamily: 'inherit'
          }}
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => onSearchChange && onSearchChange('')}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Group by Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => { setShowGroupMenu(!showGroupMenu); setShowFilterMenu(false); setShowSortMenu(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: showGroupMenu ? '#E2E8F0' : '#FFFFFF',
            border: '1.5px solid #94A3B8',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Group by</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showGroupMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '160px',
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            padding: '6px',
            zIndex: 9999
          }}>
            {groupByOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onGroupChange && onGroupChange(opt); setShowGroupMenu(false); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: selectedGroup === opt ? '#0D9488' : '#334155',
                  fontWeight: selectedGroup === opt ? 700 : 500,
                  background: selectedGroup === opt ? '#F0FDFA' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => { setShowFilterMenu(!showFilterMenu); setShowGroupMenu(false); setShowSortMenu(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: showFilterMenu ? '#E2E8F0' : '#FFFFFF',
            border: '1.5px solid #94A3B8',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Filter</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showFilterMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '160px',
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            padding: '6px',
            zIndex: 9999
          }}>
            {filterOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onFilterChange && onFilterChange(opt); setShowFilterMenu(false); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: selectedFilter === opt ? '#0D9488' : '#334155',
                  fontWeight: selectedFilter === opt ? 700 : 500,
                  background: selectedFilter === opt ? '#F0FDFA' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort by... Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => { setShowSortMenu(!showSortMenu); setShowGroupMenu(false); setShowFilterMenu(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: showSortMenu ? '#E2E8F0' : '#FFFFFF',
            border: '1.5px solid #94A3B8',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Sort by...</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showSortMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: '190px',
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            padding: '6px',
            zIndex: 9999
          }}>
            {sortByOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onSortChange && onSortChange(opt); setShowSortMenu(false); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: selectedSort === opt ? '#0D9488' : '#334155',
                  fontWeight: selectedSort === opt ? 700 : 500,
                  background: selectedSort === opt ? '#F0FDFA' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
