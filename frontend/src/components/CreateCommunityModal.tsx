import React, { useState, useEffect } from 'react';
import { UserProfile, Community } from '../types';
import { api } from '../api';
import { 
  Compass, MapPin, Calendar, Users, Sparkles, X, Check, Image as ImageIcon, 
  Tag, ArrowRight, ShieldCheck, QrCode, Globe, AlertCircle, RefreshCw, 
  Flame, Sliders, Eye, Heart, Camera, Clock, Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onCommunityCreated: (newCommunity: Community) => void;
}

interface PresetCover {
  label: string;
  location: string;
  url: string;
  category: string;
}

const PRESET_COVERS: PresetCover[] = [
  {
    label: 'Udaipur Palaces',
    location: 'Udaipur, Rajasthan',
    category: 'Heritage',
    url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Jodhpur Blue City',
    location: 'Jodhpur, Rajasthan',
    category: 'Culture',
    url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Thar Desert Dunes',
    location: 'Jaisalmer, Thar',
    category: 'Desert',
    url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Himalayan Snow Peaks',
    location: 'Manali & Solang, HP',
    category: 'Trekking',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Jaipur Amber Fort',
    location: 'Jaipur, Pink City',
    category: 'Heritage',
    url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Munnar Tea Valleys',
    location: 'Munnar & Alleppey, Kerala',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Goa Coastal Cliffs',
    location: 'Old Goa & Gokarna',
    category: 'Coast',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Spiti High Alpine Valley',
    location: 'Spiti & Kaza, Himalayas',
    category: 'Expedition',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80'
  }
];

const POPULAR_DESTINATIONS = [
  { name: 'Udaipur & Jodhpur, Rajasthan', coverIdx: 0, vibe: 'Heritage Palaces' },
  { name: 'Manali & Spiti Valley, HP', coverIdx: 7, vibe: 'High Altitude Adventure' },
  { name: 'Jaipur & Pushkar, Rajasthan', coverIdx: 4, vibe: 'Cultural Desert Odyssey' },
  { name: 'Munnar & Alleppey, Kerala', coverIdx: 5, vibe: 'Backwaters & Tea Hills' },
  { name: 'Old Goa & Coastal Gokarna', coverIdx: 6, vibe: 'Sunset & Bohemian Nomads' },
  { name: 'Jaisalmer Sam Dunes, Thar', coverIdx: 2, vibe: 'Stargazing & Camping' }
];

const VIBE_TAGS = [
  '#Photography',
  '#Stargazing',
  '#Foodie',
  '#HeritageWalks',
  '#OffGrid',
  '#Backpacking',
  '#SoloFriendly',
  '#SunsetChasers',
  '#RoadTrip',
  '#LuxuryStays'
];

const THEME_CATEGORIES = [
  { id: 'Heritage', label: 'Heritage & Palaces', icon: '🏰', desc: 'Fortresses, royal cuisine, and living history' },
  { id: 'Trekking', label: 'Alpine Trekking', icon: '🏔️', desc: 'Passes, ridge hikes, and mountain summits' },
  { id: 'Desert', label: 'Desert Odyssey', icon: '🏜️', desc: 'Dunes, campfires, and open-sky stargazing' },
  { id: 'Coastal', label: 'Coastal & Nomads', icon: '🌊', desc: 'Coves, tropical sunsets, and slow travel' },
  { id: 'Photography', label: 'Photo & Creative', icon: '📸', desc: 'Golden hours, architecture, and reels' },
  { id: 'Backpacker', label: 'Budget & Explorer', icon: '🎒', desc: 'Hostel hopping, local transit, and hidden gems' }
];

const NARRATIVE_STARTERS = [
  {
    title: '🏰 Royal Heritage',
    text: 'A curated expedition for culture lovers. We explore centuries-old lakeside palaces, majestic hill forts at golden hour, and legendary Mewari cuisine. Welcoming travelers who love architecture and leisurely photography.'
  },
  {
    title: '🏔️ High Altitude Trek',
    text: 'Chasing crisp alpine mornings and dramatic mountain passes. Expect active day hikes, cozy bonfire strategy sessions, local homestays, and night sky astrophotography. Good fitness and adventurous spirit recommended!'
  },
  {
    title: '🌊 Coastal Slow Travel',
    text: 'Exploring pristine secluded beaches, beachside sunset cafes, local seafood culinary trails, and scooter rides through coconut groves. Balanced pace with ample free time to unwind and connect.'
  }
];

const INSPIRATION_PRESETS = [
  {
    name: 'Royal Rajasthan Heritage Odyssey',
    destination: 'Udaipur & Jodhpur, Rajasthan',
    category: 'Heritage',
    description: 'A 9-day voyage through the Venice of the East and the Blue City. Evening lake cruises, private palace tours, and rooftop dining under Mehrangarh Fort.',
    maxMembers: 14,
    tags: ['#HeritageWalks', '#Photography', '#Foodie'],
    coverIdx: 0,
    daysAhead: 14,
    durationDays: 9
  },
  {
    name: 'Spiti Valley High Altitude Stargazers',
    destination: 'Manali & Spiti Valley, HP',
    category: 'Trekking',
    description: 'Traversing Kunzum Pass, ancient Buddhist monasteries, and high-desert hamlets with zero light pollution for celestial milky-way photography.',
    maxMembers: 10,
    tags: ['#Stargazing', '#OffGrid', '#Photography'],
    coverIdx: 7,
    daysAhead: 21,
    durationDays: 8
  },
  {
    name: 'Kerala Backwaters & Spice Trail Flotilla',
    destination: 'Munnar & Alleppey, Kerala',
    category: 'Coastal',
    description: 'Cruising emerald canals on traditional cedar houseboats, misty high-range tea tastings, and fresh Malabar coastal dining.',
    maxMembers: 12,
    tags: ['#Foodie', '#SoloFriendly', '#SunsetChasers'],
    coverIdx: 5,
    daysAhead: 30,
    durationDays: 7
  },
  {
    name: 'Goan Coastal Nomads & Sunset Sessions',
    destination: 'Old Goa & Coastal Gokarna',
    category: 'Coastal',
    description: 'Scooter trails along hidden cliff coves, quiet beach work sessions, yoga at dawn, and secret night food markets.',
    maxMembers: 16,
    tags: ['#SunsetChasers', '#SoloFriendly', '#Backpacking'],
    coverIdx: 6,
    daysAhead: 10,
    durationDays: 6
  }
];

export const CreateCommunityModal: React.FC<Props> = ({
  isOpen,
  user,
  onClose,
  onCommunityCreated
}) => {
  // Form State
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxMembers, setMaxMembers] = useState(14);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [selectedCategory, setSelectedCategory] = useState('Heritage');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#Photography', '#HeritageWalks']);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [showCustomCoverInput, setShowCustomCoverInput] = useState(false);

  // Studio UI state
  const [activeMobileView, setActiveMobileView] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inspireIndex, setInspireIndex] = useState(0);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set default initial dates if not set
  useEffect(() => {
    if (isOpen && !startDate) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + 14);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [isOpen, startDate]);

  if (!isOpen) return null;

  // Calculate duration in days
  const calculateDuration = (): string | null => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Same day / 1 day';
    return `${diffDays} Days • ${diffDays - 1 > 0 ? diffDays - 1 : 1} Nights`;
  };

  // Toggle Vibe Tag
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 4) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  // Quick Inspire Me / Auto-Fill feature
  const handleInspireMe = () => {
    const preset = INSPIRATION_PRESETS[inspireIndex % INSPIRATION_PRESETS.length];
    setInspireIndex((prev) => prev + 1);

    setName(preset.name);
    setDestination(preset.destination);
    setSelectedCategory(preset.category);
    setDescription(preset.description);
    setMaxMembers(preset.maxMembers);
    setSelectedTags(preset.tags);
    setCoverImage(PRESET_COVERS[preset.coverIdx].url);
    setShowCustomCoverInput(false);

    const today = new Date();
    const s = new Date(today);
    s.setDate(today.getDate() + preset.daysAhead);
    const e = new Date(s);
    e.setDate(s.getDate() + preset.durationDays);

    setStartDate(s.toISOString().split('T')[0]);
    setEndDate(e.toISOString().split('T')[0]);
    setErrorMsg(null);
  };

  // Destination Pill Selection
  const handleSelectDestinationPill = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setDestination(dest.name);
    setCoverImage(PRESET_COVERS[dest.coverIdx].url);
    if (!name) {
      setName(`${dest.name.split(',')[0]} Expedition`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Please enter a distinctive community name.');
      return;
    }
    if (!destination.trim()) {
      setErrorMsg('Please enter a destination corridor for this expedition.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Combine description and tags for rich context
    const fullDescription = selectedTags.length > 0 
      ? `${description.trim()}\n\nVibes: ${selectedTags.join(' ')}` 
      : description.trim();

    try {
      const res = await api.createCommunity({
        name: name.trim(),
        destination: destination.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        max_members: Number(maxMembers) || 15,
        description: fullDescription || undefined,
        creator_id: user.id || 1,
        cover_image: coverImage
      });

      onCommunityCreated(res.community);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationStr = calculateDuration();

  // Exclusivity tier based on members
  const getCapacityBadge = () => {
    if (maxMembers <= 8) {
      return {
        label: 'Intimate Crew',
        color: '#8178E8',
        bg: '#FAF9FC',
        border: '#E8E2F0',
        desc: 'Agile & close-knit group for boutique stays'
      };
    }
    if (maxMembers <= 20) {
      return {
        label: 'Balanced Cohort',
        color: '#A678BD',
        bg: '#FAF9FC',
        border: '#E8E2F0',
        desc: 'Optimal social dynamic & shared group logistics'
      };
    }
    return {
      label: 'Grand Expedition',
      color: '#203F70',
      bg: '#FAF9FC',
      border: '#E8E2F0',
      desc: 'Festival scale, convoy travel & high energy'
    };
  };

  const capacityInfo = getCapacityBadge();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(25, 43, 77, 0.75)',
        backdropFilter: 'blur(16px)',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FAF9FC 100%)',
          borderRadius: '28px',
          border: '1.5px solid #E8E2F0',
          width: '100%',
          maxWidth: '1140px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px -15px rgba(32, 63, 112, 0.25)',
          color: '#292833',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ==================================================================== */}
        {/* 1. TOP HEADER & STUDIO CONTROLS */}
        {/* ==================================================================== */}
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: '1.5px solid #E8E2F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 8px 20px -4px rgba(129, 120, 232, 0.4)'
              }}
            >
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
                    border: '1px solid #E8E2F0',
                    color: '#203F70',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  ✦ Expedition Architect Studio
                </span>
                <span
                  style={{
                    background: 'rgba(129, 120, 232, 0.1)',
                    color: '#8178E8',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px'
                  }}
                >
                  Cryptographic QR Ready
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '4px 0 0', color: '#292833', letterSpacing: '-0.02em' }}>
                Create Travel Community & Mint QR Pass
              </h2>
            </div>
          </div>

          {/* Right Actions: Inspire Me & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleInspireMe}
              title="Click to auto-populate with exciting curated trip ideas"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)',
                border: '1.5px solid #C7D2FE',
                color: '#4F46E5',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.12)';
              }}
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>✨ Inspire Me</span>
            </button>

            {/* Mobile View Toggle */}
            <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMobileView('form')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeMobileView === 'form' ? '#FFFFFF' : 'transparent',
                  color: activeMobileView === 'form' ? '#0F172A' : '#64748B',
                  boxShadow: activeMobileView === 'form' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileView('preview')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeMobileView === 'preview' ? '#FFFFFF' : 'transparent',
                  color: activeMobileView === 'preview' ? '#0F172A' : '#64748B',
                  boxShadow: activeMobileView === 'preview' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Preview
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E2E8F0';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. BODY SPLIT WORKSPACE: FORM STUDIO (LEFT) & LIVE PREVIEW (RIGHT) */}
        {/* ==================================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(92vh - 90px)'
          }}
          className="create-community-grid"
        >
          {/* ================================================================ */}
          {/* LEFT: FORM CUSTOMIZATION STUDIO */}
          {/* ================================================================ */}
          <div
            style={{
              padding: '26px 30px 40px',
              borderRight: '1px solid #E2E8F0',
              display: activeMobileView === 'form' ? 'block' : 'none'
            }}
            className="lg:block"
          >
            {errorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* --- SECTION 1: IDENTITY & THEME --- */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Community Name & Identity *
                  </label>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                    {name.length}/60 chars
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="e.g. Royal Rajasthan Heritage Odyssey"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '14px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0D9488';
                      e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                    }}
                  />
                </div>
              </div>

              {/* Expedition Style Category Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Expedition Theme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {THEME_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
                          background: isSelected ? '#F0FDFA' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#0F766E' : '#1E293B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {cat.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- SECTION 2: DESTINATION CORRIDOR --- */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  2. Destination Corridor *
                </label>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0D9488' }}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Udaipur & Jodhpur, Rajasthan"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px 13px 40px',
                      borderRadius: '14px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0D9488';
                      e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Popular Route Fast Chips */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    ⚡ Popular Corridors (Click to quick-select & match cover):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                        type="button"
                        key={dest.name}
                        onClick={() => handleSelectDestinationPill(dest)}
                        style={{
                          background: destination === dest.name ? '#0F766E' : '#F1F5F9',
                          color: destination === dest.name ? '#FFFFFF' : '#475569',
                          border: destination === dest.name ? '1px solid #0F766E' : '1px solid #E2E8F0',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        📍 {dest.name.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: DATES & CREW SLOTS --- */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Expedition Schedule & Crew Dynamic
                  </label>
                  {durationStr && (
                    <span
                      style={{
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: '#4F46E5',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {durationStr}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '5px' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0F172A'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '5px' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0F172A'
                      }}
                    />
                  </div>
                </div>

                {/* Maximum Travelers Dynamic Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users className="w-4 h-4 text-teal-600" />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>
                        Crew Capacity Limit:
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F766E' }}>
                        {maxMembers} Travelers
                      </span>
                    </div>

                    <span
                      style={{
                        background: capacityInfo.bg,
                        border: `1px solid ${capacityInfo.border}`,
                        color: capacityInfo.color,
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}
                    >
                      {capacityInfo.label}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#0D9488',
                      cursor: 'pointer',
                      marginBottom: '8px'
                    }}
                  />

                  {/* Quick Capacity Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                    {[
                      { slots: 6, label: '6 (Intimate)' },
                      { slots: 12, label: '12 (Standard)' },
                      { slots: 20, label: '20 (Cohort)' },
                      { slots: 35, label: '35 (Rally)' }
                    ].map((preset) => (
                      <button
                        key={preset.slots}
                        type="button"
                        onClick={() => setMaxMembers(preset.slots)}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          borderRadius: '8px',
                          border: maxMembers === preset.slots ? '1.5px solid #0D9488' : '1px solid #CBD5E1',
                          background: maxMembers === preset.slots ? '#F0FDFA' : '#FFFFFF',
                          color: maxMembers === preset.slots ? '#0F766E' : '#64748B',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- SECTION 4: VIBE TAGS --- */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    4. Expedition Vibe & Affinity Tags
                  </label>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Choose up to 4</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {VIBE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          background: isSelected ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          border: isSelected ? '1px solid #0F766E' : '1px solid #CBD5E1',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 3px 8px rgba(13, 148, 136, 0.25)' : 'none'
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* --- SECTION 5: VOYAGE NARRATIVE & TEMPLATES --- */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    5. Voyage Narrative & Expectations
                  </label>
                </div>

                {/* Narrative starter buttons */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, alignSelf: 'center' }}>
                    Starters:
                  </span>
                  {NARRATIVE_STARTERS.map((s) => (
                    <button
                      type="button"
                      key={s.title}
                      onClick={() => setDescription(s.text)}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Outline the expedition itinerary, daily pace, accommodation style, and what kind of travelers fit best..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    lineHeight: 1.5,
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0D9488';
                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* --- SECTION 6: COVER PANORAMA PHOTOGRAPHY --- */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    6. Cover Panorama Photography
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomCoverInput(!showCustomCoverInput)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0D9488',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {showCustomCoverInput ? 'Use Curated Gallery' : 'Custom Image URL'}
                  </button>
                </div>

                {showCustomCoverInput ? (
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="url"
                      placeholder="Paste high-resolution image URL (Unsplash, etc.)"
                      value={customCoverUrl}
                      onChange={(e) => {
                        setCustomCoverUrl(e.target.value);
                        if (e.target.value.trim()) setCoverImage(e.target.value.trim());
                      }}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {PRESET_COVERS.map((preset) => {
                      const isSelected = coverImage === preset.url;
                      return (
                        <div
                          key={preset.label}
                          onClick={() => setCoverImage(preset.url)}
                          style={{
                            height: '68px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            border: isSelected ? '3px solid #0D9488' : '1.5px solid #E2E8F0',
                            transform: isSelected ? 'scale(1.03)' : 'none',
                            boxShadow: isSelected ? '0 6px 16px rgba(13, 148, 136, 0.3)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              padding: '6px 8px'
                            }}
                          >
                            <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                              {preset.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#0D9488',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 900
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit CTA & Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0',
                  marginTop: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#475569',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 50%, #7C3AED 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '13px 28px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px -4px rgba(13, 148, 136, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    opacity: isSubmitting ? 0.8 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Minting Community Pass...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Launch Community & Generate QR Pass</span>
                      <ArrowRight className="w-4 h-4 text-cyan-100" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ================================================================ */}
          {/* RIGHT: LIVE HOLOGRAPHIC PREVIEW STUDIO (CARD & QR BOARDING PASS) */}
          {/* ================================================================ */}
          <div
            style={{
              padding: '26px 28px 40px',
              background: '#F8FAFC',
              display: activeMobileView === 'preview' ? 'block' : 'none'
            }}
            className="lg:block"
          >
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Real-Time Traveler Preview
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  What invitees will see
                </span>
              </div>

              {/* CARD 1: COMMUNITY DISCOVERY FEED CARD */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Card Banner */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={coverImage}
                    alt={name || 'Expedition Panorama'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)'
                    }}
                  />

                  {/* Badges on Top */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      Expedition Leader: You
                    </span>

                    <span
                      style={{
                        background: capacityInfo.bg,
                        border: `1px solid ${capacityInfo.border}`,
                        color: capacityInfo.color,
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}
                    >
                      {maxMembers - 1} Slots Left
                    </span>
                  </div>

                  {/* Destination Pin on bottom of banner */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#2DD4BF',
                        fontSize: '12px',
                        fontWeight: 800,
                        marginBottom: '4px'
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{destination || 'Destination Corridor Pending'}</span>
                    </div>
                    <h3
                      style={{
                        color: '#FFFFFF',
                        fontSize: '17px',
                        fontWeight: 900,
                        margin: 0,
                        lineHeight: 1.25,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {name || 'Your Epic Community Title'}
                    </h3>
                  </div>
                </div>

                {/* Card Body Info */}
                <div style={{ padding: '16px 18px' }}>
                  {/* Dates & Duration Pill */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#475569',
                      fontWeight: 600,
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{startDate || 'TBD'} → {endDate || 'TBD'}</span>
                    </div>
                    {durationStr && (
                      <span style={{ color: '#0D9488', fontWeight: 800 }}>
                        {durationStr}
                      </span>
                    )}
                  </div>

                  {/* Narrative snippet */}
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#64748B',
                      lineHeight: 1.5,
                      margin: '0 0 12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {description || 'Curated voyages with fellow travelers. Unique invitation QR pass generated upon launch.'}
                  </p>

                  {/* Vibe Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: '#F1F5F9',
                          color: '#475569',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Host Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid #F1F5F9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#0D9488',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        {user.name} (Creator)
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0D9488' }}>
                      1 / {maxMembers} Voyagers
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: CRYPTOGRAPHIC QR BOARDING PASS TEASER */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
                  borderRadius: '20px',
                  padding: '18px 20px',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(13, 148, 136, 0.4) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(45, 212, 191, 0.15)',
                        border: '1px solid rgba(45, 212, 191, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2DD4BF'
                      }}
                    >
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#2DD4BF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Cryptographic Pass Mint
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>
                        Unique QR Boarding Ticket
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#E2E8F0',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '9999px'
                    }}
                  >
                    Auto-Generated
                  </span>
                </div>

                <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 14px' }}>
                  Upon clicking Create, Travio mints a high-security 256-bit token pass with a downloadable scannable QR ticket for effortless guest onboarding.
                </p>

                {/* Simulated QR Code Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      border: '1px dashed #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F172A',
                      position: 'relative'
                    }}
                  >
                    <QrCode className="w-9 h-9 text-slate-800" />
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid #0D9488',
                        borderRadius: '8px',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>
                      Ready to Broadcast
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                      • Instant shareable web link<br />
                      • Camera-scannable QR image<br />
                      • Real-time member alerts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
