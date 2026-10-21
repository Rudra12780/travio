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
  placeholder = 'Search destinations, activities, expeditions...',
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
        gap: '12px',
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
          border: '2px solid #101010',
          borderRadius: '12px',
          padding: '10px 16px',
          boxShadow: '3px 3px 0px #101010',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101010" strokeWidth="2.5" style={{ marginRight: '10px', flexShrink: 0 }}>
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
            color: '#101010',
            fontWeight: 500,
            fontFamily: 'inherit'
          }}
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => onSearchChange && onSearchChange('')}
            style={{ background: 'none', border: 'none', color: '#555555', cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
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
            gap: '8px',
            padding: '10px 16px',
            background: showGroupMenu ? '#FFD84D' : '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            color: '#101010',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #101010',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11.5px' }}>Group by</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showGroupMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: '180px',
            background: '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            boxShadow: '4px 4px 0px #101010',
            padding: '6px',
            zIndex: 9999
          }}>
            {groupByOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onGroupChange && onGroupChange(opt); setShowGroupMenu(false); }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101010',
                  fontWeight: selectedGroup === opt ? 800 : 500,
                  background: selectedGroup === opt ? '#FFD84D' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
            gap: '8px',
            padding: '10px 16px',
            background: showFilterMenu ? '#429FE8' : '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            color: '#101010',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #101010',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11.5px' }}>Filter</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showFilterMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: '180px',
            background: '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            boxShadow: '4px 4px 0px #101010',
            padding: '6px',
            zIndex: 9999
          }}>
            {filterOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onFilterChange && onFilterChange(opt); setShowFilterMenu(false); }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101010',
                  fontWeight: selectedFilter === opt ? 800 : 500,
                  background: selectedFilter === opt ? '#429FE8' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort by Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => { setShowSortMenu(!showSortMenu); setShowGroupMenu(false); setShowFilterMenu(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: showSortMenu ? '#F4AFC1' : '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            color: '#101010',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #101010',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11.5px' }}>Sort by</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {showSortMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '210px',
            background: '#FFFFFF',
            border: '2px solid #101010',
            borderRadius: '12px',
            boxShadow: '4px 4px 0px #101010',
            padding: '6px',
            zIndex: 9999
          }}>
            {sortByOptions.map(opt => (
              <div
                key={opt}
                onClick={() => { onSortChange && onSortChange(opt); setShowSortMenu(false); }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101010',
                  fontWeight: selectedSort === opt ? 800 : 500,
                  background: selectedSort === opt ? '#F4AFC1' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
