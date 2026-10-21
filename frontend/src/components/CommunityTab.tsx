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

  // New post state (text only)
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
        if (selectedTripId) {
          const currentTrip = res.trips.find((t: Trip) => t.id === selectedTripId);
          if (currentTrip) {
            handleSelectTrip(currentTrip);
            return;
          }
        }
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
        next.delete(id);
        setPosts(current => current.map(p => p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      } else {
        next.add(id);
        setPosts(current => current.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
      }
      return next;
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const defaultLoc = plannedDestinations[0] || (activeDestination !== 'ALL_PLANNED' && activeDestination !== 'ALL_GLOBAL' ? activeDestination : 'Global');
    const post: CommunityPost = {
      id: Date.now(),
      author: user.name || 'Explorer',
      authorAvatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      location: newLocation.trim() || `${defaultLoc}, World`,
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

  const destinationCommunities = communities.filter(c => {
    if (!plannedTrip) return false;

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
    <div style={{ marginTop: '20px', maxWidth: '1080px', margin: '20px auto 60px', padding: '0 16px' }}>
      
      {/* 1. TRAVEL COMMUNITIES FOR TRAVELER'S TRIP DESTINATION */}
      {!plannedTrip ? (
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '2px solid #101010',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '4px 4px 0px #101010',
            marginBottom: '40px',
            position: 'relative'
          }}
        >
          {/* Animated GlobalTrotter Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <AnimatedLogo size="lg" title="GlobalTrotter" badge="COHORTS" />
          </div>

          <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-block', marginBottom: '8px' }}>
            CURATED TRAVEL COHORTS
          </span>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#101010',
              letterSpacing: '-0.03em',
              maxWidth: '720px',
              margin: '0 auto 12px',
              lineHeight: 1.25
            }}
          >
            Select an expedition destination to reveal curated traveler cohorts.
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#555555',
              maxWidth: '560px',
              margin: '0 auto 32px',
              lineHeight: 1.6
            }}
          >
            {userTrips.length > 0
              ? 'Select one of your active or planned voyages below to connect with verified travelers and group cohorts heading to that exact destination.'
              : 'You have not scheduled any expeditions yet. Plan your first journey to unlock destination-specific community circles.'}
          </p>

          {userTrips.length > 0 ? (
            <div style={{ textAlign: 'left', maxWidth: '880px', margin: '0 auto' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#101010',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🗺️ SELECT ACTIVE EXPEDITION ({userTrips.length}):</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '18px'
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
                        background: '#F7F6F2',
                        border: '2px solid #101010',
                        borderRadius: '12px',
                        padding: '18px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        boxShadow: '2px 2px 0px #101010'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '4px 4px 0px #101010';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '2px 2px 0px #101010';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span
                            style={{
                              background: '#36B7B3',
                              border: '1.5px solid #101010',
                              color: '#101010',
                              fontSize: '11px',
                              fontWeight: 900,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MapPin className="w-3 h-3" /> {destDisplay}
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 900,
                              color: '#101010',
                              background: '#FFD84D',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1.5px solid #101010',
                              textTransform: 'uppercase'
                            }}
                          >
                            {trip.status || 'Active'}
                          </span>
                        </div>
                        <h4
                          style={{
                            fontSize: '16px',
                            fontWeight: 900,
                            color: '#101010',
                            margin: '0 0 6px',
                            lineHeight: 1.3
                          }}
                        >
                          {trip.title}
                        </h4>
                        {trip.start_date && (
                          <span style={{ fontSize: '12px', color: '#555555', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar className="w-3 h-3 text-gold-400" />
                            {trip.start_date} {trip.end_date ? `→ ${trip.end_date}` : ''}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 900,
                          justifyContent: 'center',
                          borderRadius: '8px',
                          background: '#FFD84D',
                          color: '#101010',
                          border: '2px solid #101010',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          boxShadow: '2px 2px 0px #101010'
                        }}
                      >
                        Select & View Cohorts →
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
              style={{
                padding: '12px 26px',
                fontSize: '13px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                borderRadius: '10px',
                background: '#FFD84D',
                color: '#101010',
                border: '2px solid #101010',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px #101010',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Sparkles className="w-4 h-4" /> Start a New Expedition
            </button>
          )}
        </section>
      ) : (
        /* 1. TRAVEL COMMUNITIES FOR SELECTED TRIP DESTINATION */
        <section style={{ marginBottom: '40px' }}>
          {/* Active Trip Banner HUD */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #101010',
              borderRadius: '14px',
              padding: '18px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '3px 3px 0px #101010'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#FFD84D',
                  border: '2px solid #101010',
                  color: '#101010',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ACTIVE EXPEDITION COHORT
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#101010', background: '#F7F6F2', border: '1px solid #101010', padding: '1px 7px', borderRadius: '4px' }}>
                    {plannedTrip.start_date ? `${plannedTrip.start_date} ${plannedTrip.end_date ? '→ ' + plannedTrip.end_date : ''}` : 'Upcoming'}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
                  {plannedTrip.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '12.5px', color: '#555555' }}>
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Target Destination: <strong style={{ color: '#101010' }}>{plannedDestinations.length > 0 ? plannedDestinations.join(', ') : plannedTrip.destinations || plannedTrip.title}</strong></span>
                </div>
              </div>
            </div>

            {/* Switch Trip Action */}
            <button
              type="button"
              onClick={handleClearSelectedTrip}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '2px solid #101010',
                color: '#101010',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010'
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Expedition</span>
            </button>
          </div>

          {/* Section Heading & Multi-Destination Tabs */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#101010', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                  {activeDestination === 'ALL_PLANNED'
                    ? `Curated Cohorts for ${plannedDestinations.join(' & ')}`
                    : `Curated Cohorts for ${activeDestination}`}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#555555', margin: 0 }}>
                  {activeDestination === 'ALL_PLANNED'
                    ? `Showing verified voyager circles and travel cohorts heading to ${plannedDestinations.join(' and ')}.`
                    : `Showing verified voyager circles and travel cohorts heading to ${activeDestination}.`}
                </p>
              </div>

              {/* Destination Selector Tabs */}
              {plannedDestinations.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: '#FFFFFF', padding: '6px 10px', borderRadius: '10px', border: '2px solid #101010', boxShadow: '2px 2px 0px #101010' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010', marginRight: '4px', textTransform: 'uppercase' }}>Filter Destination:</span>
                  
                  <button
                    type="button"
                    onClick={() => setActiveDestination('ALL_PLANNED')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: '1.5px solid #101010',
                      background: activeDestination === 'ALL_PLANNED' ? '#FFD84D' : '#FFFFFF',
                      color: '#101010'
                    }}
                  >
                    ✨ All Destinations ({plannedDestinations.length})
                  </button>

                  {plannedDestinations.map(dest => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setActiveDestination(dest)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: '1.5px solid #101010',
                        background: activeDestination.toLowerCase() === dest.toLowerCase() ? '#FFD84D' : '#FFFFFF',
                        color: '#101010'
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
                borderRadius: '16px',
                border: '2px solid #101010',
                boxShadow: '3px 3px 0px #101010',
                color: '#101010'
              }}
            >
              <RefreshCw className="w-5 h-5 animate-spin mr-3" />
              <span style={{ fontSize: '14px', fontWeight: 800 }}>
                Connecting to cohorts for {plannedDestinations.join(', ')}...
              </span>
            </div>
          ) : destinationCommunities.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '44px 24px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #101010',
                boxShadow: '4px 4px 0px #101010'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#FFD84D',
                  border: '2px solid #101010',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#101010'
                }}
              >
                <Compass className="w-6 h-6" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: '0 0 8px' }}>
                No Cohorts Found for {activeDestination === 'ALL_PLANNED' ? (plannedDestinations.length > 0 ? plannedDestinations.join(' & ') : plannedTrip.title) : activeDestination} Yet
              </h3>
              <p style={{ fontSize: '14px', color: '#555555', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Check back soon as new voyager circles for your expedition destination are verified, or switch to another expedition.
              </p>
              <button
                type="button"
                onClick={handleClearSelectedTrip}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#FFD84D',
                  color: '#101010',
                  fontWeight: 900,
                  fontSize: '13px',
                  border: '2px solid #101010',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                🔄 Switch Expedition
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
                      borderRadius: '16px',
                      border: '2px solid #101010',
                      overflow: 'hidden',
                      boxShadow: '4px 4px 0px #101010',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = '6px 6px 0px #101010';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #101010';
                    }}
                  >
                    {/* Card Banner */}
                    <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden', borderBottom: '2px solid #101010' }}>
                      <img
                        src={community.cover_image || 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1000&q=80'}
                        alt={community.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Status badges */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            background: '#101010',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            textTransform: 'uppercase'
                          }}
                        >
                          <MapPin className="w-3 h-3" />
                          {community.destination}
                        </span>

                        {isCreator ? (
                          <span
                            style={{
                              background: '#FFD84D',
                              color: '#101010',
                              border: '1.5px solid #101010',
                              fontSize: '10.5px',
                              fontWeight: 900,
                              padding: '3px 10px',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Sparkles className="w-3 h-3" /> Creator
                          </span>
                        ) : isMember ? (
                          <span
                            style={{
                              background: '#36B7B3',
                              color: '#101010',
                              border: '1.5px solid #101010',
                              fontSize: '10.5px',
                              fontWeight: 900,
                              padding: '3px 10px',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check className="w-3 h-3" /> Member
                          </span>
                        ) : null}
                      </div>

                      {/* Community Name & Dates on Banner */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', background: 'rgba(16, 16, 16, 0.75)', padding: '6px 10px', borderRadius: '6px' }}>
                        <h3
                          style={{
                            fontSize: '17px',
                            fontWeight: 900,
                            color: '#FFFFFF',
                            margin: '0 0 2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {community.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#E8E6E0' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar className="w-3 h-3 text-gold-400" />
                            {community.start_date || 'Flexible'} → {community.end_date || 'Ongoing'}
                          </span>
                          <span>•</span>
                          <span>By {community.creator_name || 'Voyager'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                      {community.description && (
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#555555',
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: '#101010', marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Users className="w-3.5 h-3.5" /> Cohort Capacity
                          </span>
                          <span style={{ fontWeight: 900 }}>
                            {community.current_members} / {community.max_members} spots
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '7px', borderRadius: '4px', background: '#E8E6E0', border: '1px solid #101010', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: isFull ? '#F4AFC1' : '#36B7B3',
                              width: `${Math.min(100, ((community.current_members || 1) / community.max_members) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {!isMember ? (
                          <button
                            type="button"
                            onClick={() => handleJoinDirect(community)}
                            disabled={isFull || joiningId === community.id}
                            style={{
                              width: '100%',
                              padding: '11px 16px',
                              fontSize: '12.5px',
                              fontWeight: 900,
                              justifyContent: 'center',
                              opacity: isFull ? 0.6 : 1,
                              cursor: isFull ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderRadius: '8px',
                              background: '#FFD84D',
                              color: '#101010',
                              border: '2px solid #101010',
                              boxShadow: '2px 2px 0px #101010',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
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
                              padding: '9px 14px',
                              borderRadius: '8px',
                              background: '#36B7B3',
                              color: '#101010',
                              border: '2px solid #101010',
                              fontSize: '12px',
                              fontWeight: 900,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              textTransform: 'uppercase'
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

      {/* 2. COMMUNITY VOYAGE STORIES & EXPERIENCES FEED */}
      {plannedTrip && (
        <section style={{ borderTop: '2px solid #101010', paddingTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#101010', letterSpacing: '-0.03em', margin: '0 0 6px 0' }}>
                Voyager Chronicle & Field Notes
              </h2>
              <p style={{ fontSize: '13.5px', color: '#555555', margin: 0 }}>
                First-hand expedition stories, cultural notes, and reflections from verified voyagers
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePost(!showCreatePost)}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 900,
                borderRadius: '8px',
                background: showCreatePost ? '#FFFFFF' : '#FFD84D',
                color: '#101010',
                border: '2px solid #101010',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #101010',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <span>{showCreatePost ? '✕ Cancel Post' : '+ Share Expedition Story'}</span>
            </button>
          </div>

          <GlobalSearchBar
            placeholder="Search stories, ancient forts, alpine trails..."
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

          {/* Create New Community Post Box */}
          {showCreatePost && (
            <form
              onSubmit={handleCreatePost}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #101010',
                padding: '24px',
                marginBottom: '26px',
                boxShadow: '4px 4px 0px #101010'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', marginBottom: '16px', textTransform: 'uppercase' }}>
                Chronicle Your Experience
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Title of your expedition dispatch..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #101010',
                    background: '#F7F6F2',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#101010',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Santorini, Kyoto, Amalfi)..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #101010',
                    background: '#F7F6F2',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#101010',
                    outline: 'none'
                  }}
                />
              </div>

              <textarea
                rows={3}
                placeholder="Share your personal insights, hidden vistas, recommended routes, and optimal seasons..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #101010',
                  background: '#F7F6F2',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#101010',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '16px'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '11px 24px',
                  borderRadius: '8px',
                  background: '#FFD84D',
                  color: '#101010',
                  fontSize: '13px',
                  fontWeight: 900,
                  border: '2px solid #101010',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #101010',
                  textTransform: 'uppercase'
                }}
              >
                Publish Chronicle Entry
              </button>
            </form>
          )}

          {/* Community Feed Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredPosts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '44px 20px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #101010',
                  boxShadow: '3px 3px 0px #101010'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</div>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: '0 0 6px' }}>
                  No Dispatches Recorded for {activeDestination === 'ALL_PLANNED' ? plannedDestinations.join(' & ') : (activeDestination || plannedTrip.title)} Yet
                </h4>
                <p style={{ fontSize: '13.5px', color: '#555555', maxWidth: '440px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                  Be the first traveler to document an insider perspective or trail reflection from this route.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(true)}
                  style={{
                    padding: '9px 20px',
                    fontSize: '12.5px',
                    fontWeight: 900,
                    borderRadius: '8px',
                    background: '#FFD84D',
                    color: '#101010',
                    border: '2px solid #101010',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #101010',
                    textTransform: 'uppercase'
                  }}
                >
                  + Record First Entry
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div
                  key={post.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '2px solid #101010',
                    overflow: 'hidden',
                    boxShadow: '3px 3px 0px #101010'
                  }}
                >
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px 14px' }}>
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #101010' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 900, fontSize: '15px', color: '#101010' }}>{post.author}</span>
                        <span style={{
                          background: '#429FE8',
                          color: '#101010',
                          border: '1px solid #101010',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {post.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#555555', marginTop: '2px', fontWeight: 600 }}>
                        📍 {post.location} • {post.timeAgo}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: '0 22px 18px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#101010', marginBottom: '8px' }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                      {post.content}
                    </p>
                  </div>

                  {/* Post Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 22px',
                    borderTop: '1.5px solid #E8E6E0',
                    background: '#F7F6F2'
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
                          fontWeight: 800,
                          color: '#101010'
                        }}
                      >
                        <span>{likedPostIds.has(post.id) ? '❤️' : '🤍'}</span>
                        <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555555', fontWeight: 700 }}>
                        <span>💬</span>
                        <span>{post.commentsCount} Comments</span>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: '#101010', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800 }}>
                      Verified Dispatch
                    </span>
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
