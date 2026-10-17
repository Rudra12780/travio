import React, { useState, useEffect } from 'react';
import { UserProfile, ActiveTab, Community, Trip } from '../types';
import { GlobalSearchBar } from './GlobalSearchBar';
import { api } from '../api';
import { AnimatedLogo } from './AnimatedLogo';
import { 
  Users, MapPin, Calendar, Sparkles, Check, 
  ArrowRight, Compass, RefreshCw
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
  initialOpenCreate?: boolean;
  selectedTripId?: number;
}

const KNOWN_DESTINATIONS = [
  'Jaipur', 'Jodhpur', 'Udaipur', 'Manali', 'Goa', 'Munnar', 'Alleppey',
  'Delhi', 'Agra', 'Kochi', 'Tokyo', 'Kyoto', 'Paris', 'Rome',
  'Zermatt', 'Ubud', 'Reykjavik', 'Santorini', 'Barcelona', 'Queenstown', 'Marrakech'
];

interface CommunityPost {
  id: number;
  author: string;
  authorAvatar: string;
  location: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  category: string;
}

const INITIAL_POSTS: CommunityPost[] = [];

export const CommunityTab: React.FC<Props> = ({ user, onNavigate, initialOpenCreate, selectedTripId }) => {
  // Communities State
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState<boolean>(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Traveler Trip Destinations & Filtering
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [plannedTrip, setPlannedTrip] = useState<Trip | null>(null);
  const [plannedDestinations, setPlannedDestinations] = useState<string[]>([]);
  const [activeDestination, setActiveDestination] = useState<string>('ALL_PLANNED');

  // Community Posts Feed State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // New post state (text only - no images)
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Expedition');

  const fetchCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const res = await api.getCommunities(user?.id);
      if (res && res.communities) {
        setCommunities(res.communities);
      }
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const extractFromTrip = (t: Trip): string[] => {
    const destinationsFound = new Set<string>();
    if (t.destinations) {
      t.destinations.split(',').forEach((d: string) => {
        const trimmed = d.trim();
        if (trimmed) destinationsFound.add(trimmed);
      });
    }
    if (t.stops && Array.isArray(t.stops)) {
      t.stops.forEach((s: any) => {
        if (s.city_name && s.city_name.trim()) destinationsFound.add(s.city_name.trim());
      });
    }
    // Search in title and description against known destinations
    KNOWN_DESTINATIONS.forEach((known) => {
      const regex = new RegExp(`\\b${known}\\b`, 'i');
      if (t.title && regex.test(t.title)) destinationsFound.add(known);
      if (t.description && regex.test(t.description)) destinationsFound.add(known);
    });

    if (destinationsFound.size === 0 && t.destinations && t.destinations.trim()) {
      destinationsFound.add(t.destinations.trim());
    }

    return Array.from(destinationsFound);
  };

  const handleSelectTrip = (t: Trip) => {
    setPlannedTrip(t);
    const dests = extractFromTrip(t);
    setPlannedDestinations(dests);
    setActiveDestination(dests.length > 1 ? 'ALL_PLANNED' : (dests[0] || ''));
  };

  const handleClearSelectedTrip = () => {
    setPlannedTrip(null);
    setPlannedDestinations([]);
    setActiveDestination('');
  };

  const fetchUserTrips = async () => {
    try {
      const res = await api.getTrips(user?.id || 1);
      if (res && res.trips && res.trips.length > 0) {
        setUserTrips(res.trips);

        // If selectedTripId was explicitly passed, select that trip
        if (selectedTripId) {
          const currentTrip = res.trips.find((t: Trip) => t.id === selectedTripId);
          if (currentTrip) {
            handleSelectTrip(currentTrip);
            return;
          }
        }

        // If no trip was selected, do not auto-pick one; show the select trip prompt
        setPlannedTrip(null);
        setPlannedDestinations([]);
        setActiveDestination('');
      } else {
        setUserTrips([]);
        setPlannedTrip(null);
        setPlannedDestinations([]);
        setActiveDestination('');
      }
    } catch (err) {
      console.error('Failed to fetch traveler trips:', err);
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchUserTrips();
  }, [user?.id, selectedTripId]);

  const handleJoinDirect = async (community: Community) => {
    if (!user.id) return;
    try {
      setJoiningId(community.id);
      const res = await api.joinCommunity(community.invite_token, user.id);
      if (res && res.success) {
        await fetchCommunities();
      } else {
        alert(res?.message || 'Failed to join community.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error joining community.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleLike = (id: number) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      const isAlreadyLiked = next.has(id);
      if (isAlreadyLiked) {
        // Unlike: decrease by 1
        next.delete(id);
        setPosts(current => current.map(p => p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      } else {
        // Like once
        next.add(id);
        setPosts(current => current.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
      }
      return next;
    });
  };

  // User shares text-only experience (no images allowed or added)
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const defaultLoc = plannedDestinations[0] || (activeDestination !== 'ALL_PLANNED' && activeDestination !== 'ALL_GLOBAL' ? activeDestination : 'Global');
    const post: CommunityPost = {
      id: Date.now(),
      author: user.name || 'panther',
      authorAvatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      location: newLocation.trim() || `${defaultLoc}, India`,
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      commentsCount: 0,
      timeAgo: 'Just now',
      category: newCategory
    };

    setPosts([post, ...posts]);
    setShowCreatePost(false);
    setNewTitle('');
    setNewLocation('');
    setNewContent('');
  };

  // Filter communities related ONLY to the destination of the selected trip
  const destinationCommunities = communities.filter(c => {
    if (!plannedTrip) return false;

    // Check against active destination or all planned destinations of the trip
    const destinationsToMatch = activeDestination && activeDestination !== 'ALL_PLANNED'
      ? [activeDestination]
      : (plannedDestinations.length > 0 ? plannedDestinations : [plannedTrip.destinations || plannedTrip.title]);

    return destinationsToMatch.some(dest => {
      if (!dest) return false;
      const target = dest.trim().toLowerCase();
      if (!target) return false;
      return (
        c.destination.toLowerCase().includes(target) ||
        c.name.toLowerCase().includes(target) ||
        (c.description && c.description.toLowerCase().includes(target))
      );
    });
  });

  const filteredPosts = posts.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
    const matchFilter = selectedFilter === 'All' || p.category.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ marginTop: '20px', maxWidth: '980px', margin: '20px auto 40px', padding: '0 16px' }}>
      
      {/* ==================================================================== */}
      {/* 1. TRAVEL COMMUNITIES FOR TRAVELER'S TRIP DESTINATION */}
      {/* ==================================================================== */}
      {/* CASE 1: USER HAS NOT SELECTED OR STARTED A TRIP YET */}
      {!plannedTrip ? (
        <section
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            borderRadius: '24px',
            border: '1.5px solid #E8E2F0',
            padding: '50px 28px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(129, 120, 232, 0.08)',
            marginBottom: '40px',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Animated GlobalTrotter Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
            <AnimatedLogo size="lg" title="GlobalTrotter" badge="COMMUNITIES" />
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#292833',
              letterSpacing: '-0.4px',
              maxWidth: '680px',
              margin: '0 auto 12px',
              lineHeight: 1.4
            }}
          >
            Select a destination and start your trip to discover related travel communities.
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: '#777584',
              maxWidth: '540px',
              margin: '0 auto 28px',
              lineHeight: 1.6
            }}
          >
            {userTrips.length > 0
              ? 'Select one of your expeditions below to reveal verified travel groups and cohorts heading to that exact destination.'
              : 'You have not started any trips yet. Create or plan your first expedition to discover destination communities.'}
          </p>

          {userTrips.length > 0 ? (
            <div style={{ textAlign: 'left', maxWidth: '820px', margin: '0 auto' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748B',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🗺️ Select From Your Expeditions ({userTrips.length}):</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '16px'
                }}
              >
                {userTrips.map((trip) => {
                  const dests = extractFromTrip(trip);
                  const destDisplay = dests.length > 0 ? dests.join(', ') : trip.destinations || 'Explore';

                  return (
                    <div
                      key={trip.id}
                      onClick={() => handleSelectTrip(trip)}
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#C39AD9';
                        e.currentTarget.style.background = '#FAF9FC';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(129, 120, 232, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span
                            style={{
                              background: '#F1E9F7',
                              color: '#8178E8',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MapPin className="w-3 h-3" /> {destDisplay}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#64748B'
                            }}
                          >
                            {trip.status || 'Active'}
                          </span>
                        </div>
                        <h4
                          style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: '#0F172A',
                            margin: '0 0 6px',
                            lineHeight: 1.3
                          }}
                        >
                          {trip.title}
                        </h4>
                        {trip.start_date && (
                          <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {trip.start_date} {trip.end_date ? `→ ${trip.end_date}` : ''}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-plan-budget"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          justifyContent: 'center',
                          borderRadius: '10px'
                        }}
                      >
                        Select Trip & View Communities →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('my-trips')}
              className="btn-plan-budget"
              style={{
                padding: '12px 26px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Sparkles className="w-4 h-4" /> Start a New Trip
            </button>
          )}
        </section>
      ) : (
        /* ==================================================================== */
        /* 1. TRAVEL COMMUNITIES FOR SELECTED TRIP DESTINATION */
        /* ==================================================================== */
        <section style={{ marginBottom: '40px' }}>
          {/* Active Trip Banner HUD */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '20px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#F6EEFA',
                  border: '1px solid #E8E2F0',
                  color: '#8178E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#8178E8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Selected Trip Destination
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#777584', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                    {plannedTrip.start_date ? `${plannedTrip.start_date} ${plannedTrip.end_date ? '→ ' + plannedTrip.end_date : ''}` : 'Upcoming'}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#292833', margin: '2px 0 0' }}>
                  {plannedTrip.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '12.5px', color: '#777584' }}>
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Destination: <strong>{plannedDestinations.length > 0 ? plannedDestinations.join(', ') : plannedTrip.destinations || plannedTrip.title}</strong></span>
                </div>
              </div>
            </div>

            {/* Switch Trip Action */}
            <button
              type="button"
              onClick={handleClearSelectedTrip}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Trip</span>
            </button>
          </div>

          {/* Section Heading & Multi-Destination Tabs */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', margin: '0 0 4px' }}>
                  {activeDestination === 'ALL_PLANNED'
                    ? `Communities for ${plannedDestinations.join(' & ')}`
                    : `Communities for ${activeDestination}`}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  {activeDestination === 'ALL_PLANNED'
                    ? `Showing verified travel groups and cohorts heading to ${plannedDestinations.join(' and ')} for your selected trip.`
                    : `Showing verified travel groups and cohorts heading to ${activeDestination} for your selected trip.`}
                </p>
              </div>

              {/* Destination Selector Tabs if multiple destinations on this trip */}
              {plannedDestinations.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: '#F8FAFC', padding: '6px 10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginRight: '4px' }}>Filter Destination:</span>
                  
                  <button
                    type="button"
                    onClick={() => setActiveDestination('ALL_PLANNED')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeDestination === 'ALL_PLANNED' ? '1px solid #8178E8' : '1px solid transparent',
                      background: activeDestination === 'ALL_PLANNED' ? 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)' : 'transparent',
                      color: activeDestination === 'ALL_PLANNED' ? '#FFFFFF' : '#777584',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ✨ All Trip Destinations ({plannedDestinations.length})
                  </button>

                  {plannedDestinations.map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setActiveDestination(dest)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: activeDestination.toLowerCase() === dest.toLowerCase() ? '1px solid #8178E8' : '1px solid transparent',
                        background: activeDestination.toLowerCase() === dest.toLowerCase() ? 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)' : 'transparent',
                        color: activeDestination.toLowerCase() === dest.toLowerCase() ? '#FFFFFF' : '#777584',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      📍 {dest}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Communities Grid */}
          {loadingCommunities ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mr-3" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                Loading travel cohorts for {plannedDestinations.join(', ')}...
              </span>
            </div>
          ) : destinationCommunities.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '44px 24px',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#F6EEFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: '#8178E8'
                }}
              >
                <Compass className="w-7 h-7" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#292833', margin: '0 0 6px' }}>
                No Communities Found for {activeDestination === 'ALL_PLANNED' ? (plannedDestinations.length > 0 ? plannedDestinations.join(' & ') : plannedTrip.title) : activeDestination} Yet
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                Check back soon as new cohorts for your trip destination are curated, or switch to another trip.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClearSelectedTrip}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Switch Trip
                </button>
              </div>
            </div>
          ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px'
            }}
          >
            {destinationCommunities.map((community) => {
              const isCreator = community.creator_id === user.id || community.is_creator;
              const isMember = community.is_member || isCreator;
              const isFull = (community.current_members || 0) >= community.max_members;

              return (
                <div
                  key={community.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px -4px rgba(15, 23, 42, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(15, 23, 42, 0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 25px -4px rgba(15, 23, 42, 0.08)';
                  }}
                >
                  {/* Card Banner */}
                  <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={community.cover_image || 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1000&q=80'}
                      alt={community.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.25) 55%, transparent 100%)'
                      }}
                    />

                    {/* Status badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(8px)',
                          color: '#2DD4BF',
                          border: '1px solid rgba(45, 212, 191, 0.35)',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {community.destination}
                      </span>

                      {isCreator ? (
                        <span
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)'
                          }}
                        >
                          <Sparkles className="w-3 h-3" /> Creator
                        </span>
                      ) : isMember ? (
                        <span
                          style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)'
                          }}
                        >
                          <Check className="w-3 h-3" /> Member
                        </span>
                      ) : null}
                    </div>

                    {/* Community Name & Dates on Banner */}
                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          margin: '0 0 4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {community.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#CBD5E1' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {community.start_date || 'Flexible'} → {community.end_date || 'Ongoing'}
                        </span>
                        <span>•</span>
                        <span>Lead by {community.creator_name || 'Voyager'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                    {community.description && (
                      <p
                        style={{
                          fontSize: '12.5px',
                          color: '#64748B',
                          lineHeight: '1.5',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {community.description}
                      </p>
                    )}

                    {/* Capacity Indicator */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users className="w-3.5 h-3.5 text-teal-600" /> Cohort Capacity
                        </span>
                        <span style={{ color: isFull ? '#EF4444' : '#0F172A', fontWeight: 800 }}>
                          {community.current_members} / {community.max_members} spots
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '7px', borderRadius: '9999px', background: '#F1F5F9', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '9999px',
                            background: isFull ? '#EF4444' : 'linear-gradient(90deg, #8178E8 0%, #F3AFCF 100%)',
                            width: `${Math.min(100, ((community.current_members || 1) / community.max_members) * 100)}%`,
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button - Direct Join / Member Indicator (No QR button) */}
                    <div style={{ paddingTop: '4px' }}>
                      {!isMember ? (
                        <button
                          type="button"
                          onClick={() => handleJoinDirect(community)}
                          disabled={isFull || joiningId === community.id}
                          className="btn-plan-budget"
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            fontSize: '13px',
                            fontWeight: 800,
                            justifyContent: 'center',
                            opacity: isFull ? 0.6 : 1,
                            cursor: isFull ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {joiningId === community.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : isFull ? (
                            'Cohort Full'
                          ) : (
                            <>
                              <span>Join {activeDestination} Cohort</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '9999px',
                            background: '#F0FDF4',
                            color: '#16A34A',
                            border: '1px solid #BBF7D0',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Joined Explorer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}

      {/* ==================================================================== */}
      {/* 2. COMMUNITY VOYAGE STORIES & EXPERIENCES FEED (TEXT-ONLY) */}
      {/* Only rendered when a trip is selected */}
      {/* ==================================================================== */}
      {plannedTrip && (
        <section style={{ borderTop: '1px solid #E2E8F0', paddingTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
                Traveler Experience Feed
              </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
            Community stories, insider tips, and reviews from fellow verified voyagers
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="btn-plan-budget"
          style={{ padding: '10px 20px', fontSize: '13.5px' }}
        >
          <span>{showCreatePost ? '✕ Cancel Post' : '+ Share Your Experience'}</span>
        </button>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Search stories, forts, desert camps..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Location', 'By Activity Category']}
        filterOptions={['All', 'Heritage Cruise', 'Adventure', 'Wilderness Camping']}
        sortByOptions={['Newest', 'Most Liked', 'Most Comments']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Create New Community Post Box - Strictly Text-Only As In Screenshot */}
      {showCreatePost && (
        <form
          onSubmit={handleCreatePost}
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #2DD4BF',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 6px 20px rgba(13, 148, 136, 0.1)'
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
            Share your Voyage Story with the GlobalTrotter Community
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Title of your experience..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Location (e.g. Jaipur, Manali, Goa)..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              required
            />
          </div>

          <textarea
            className="form-input"
            rows={3}
            placeholder="Share details, tips, recommended activities, best time to visit..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
            style={{ marginBottom: '14px' }}
          />

          <button
            type="submit"
            className="btn-plan-budget"
            style={{ padding: '10px 22px' }}
          >
            Post Story to Community
          </button>
        </form>
      )}

      {/* Community Feed Posts - Pure Text Story Layout (No Images) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✍️</div>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              No Traveler Stories Shared for {activeDestination === 'ALL_PLANNED' ? plannedDestinations.join(' & ') : (activeDestination || plannedTrip.title)} Yet
            </h4>
            <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px' }}>
              Be the first to share an insider tip or experience from your expedition!
            </p>
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="btn-plan-budget"
              style={{ padding: '8px 18px', fontSize: '13px', margin: '0 auto' }}
            >
              + Share First Story
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Post Header: Avatar, Author, Location, Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px 12px' }}>
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{post.author}</span>
                    <span style={{
                      background: '#F0FDFA',
                      color: '#0D9488',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {post.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    📍 {post.location} • {post.timeAgo}
                  </div>
                </div>
              </div>

              {/* Post Content - Text Only */}
              <div style={{ padding: '0 20px 16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                  {post.content}
                </p>
              </div>

              {/* Post Footer: Likes, Comments (User can like only once) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                borderTop: '1px solid #F1F5F9',
                background: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: likedPostIds.has(post.id) ? '#E11D48' : '#64748B',
                      transition: 'all 0.15s ease'
                    }}
                    title={likedPostIds.has(post.id) ? 'Unlike this story' : 'Like this story (once)'}
                  >
                    <span style={{ transform: likedPostIds.has(post.id) ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
                      {likedPostIds.has(post.id) ? '❤️' : '🤍'}
                    </span>
                    <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                    <span>💬</span>
                    <span>{post.commentsCount} Comments</span>
                  </div>
                </div>

                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Verified Voyager Story</span>
              </div>
            </div>
          ))
        )}
      </div>
        </section>
      )}

    </div>
  );
};
