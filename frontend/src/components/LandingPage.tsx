import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { COUNTRIES_DATA, CountryDossier } from '../data/countryData';
import { CountryDossierModal } from './CountryDossierModal';
import { SignIn } from './SignIn';
import { RegisterModal } from './RegisterModal';
import { TravelDreamscape } from './TravelDreamscape';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  onSignInSuccess: (user: UserProfile) => void;
}

interface HeroDestination {
  id: string;
  name: string;
  country: string;
  kicker: string;
  tagline: string;
  image: string;
  weather: string;
  rating: string;
}

const HERO_DESTINATIONS: HeroDestination[] = [
  {
    id: 'santorini',
    name: 'SANTORINI',
    country: 'Greece',
    kicker: 'CYCLADES ARCHIPELAGO // 36°25′N 25°26′E',
    tagline: 'Whitewashed cliffside suites, sapphire-domed sanctuaries, and dramatic volcanic sunset horizons over the Aegean.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85',
    weather: '24°C • Aegean Sun',
    rating: '4.98'
  },
  {
    id: 'amalfi',
    name: 'AMALFI COAST',
    country: 'Italy',
    kicker: 'MEDITERRANEAN RIVIERA // 40°38′N 14°36′E',
    tagline: 'Pastel cliff dwellings cascading down sheer limestone crags into crystalline turquoise bays.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=85',
    weather: '23°C • Coastal Breeze',
    rating: '4.96'
  },
  {
    id: 'kyoto',
    name: 'KYOTO',
    country: 'Japan',
    kicker: 'KANSAI HERITAGE // 35°00′N 135°46′E',
    tagline: 'Misty bamboo pathways, sacred vermilion torii gates, and centuries-old cedar pavilions.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85',
    weather: '19°C • Spring Bloom',
    rating: '4.99'
  },
  {
    id: 'zermatt',
    name: 'MATTERHORN',
    country: 'Switzerland',
    kicker: 'VALAIS ALPS // 45°58′N 07°44′E',
    tagline: 'Iconic pyramidal granite summit rising 4,478m over mirror-like glacial tarns and alpine villages.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=85',
    weather: '16°C • Alpine Crisp',
    rating: '4.97'
  }
];

export const LandingPage: React.FC<Props> = ({ onSignInSuccess }) => {
  // Navigation & Modal State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPublicMenuDrawer, setShowPublicMenuDrawer] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryDossier | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  // Search & Filter State
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR'>('USD');

  // Interactive Trip Cost Calculator State
  const [calcCountryId, setCalcCountryId] = useState<string>('japan');
  const [calcDays, setCalcDays] = useState<number>(7);
  const [calcStyle, setCalcStyle] = useState<'backpacker' | 'comfort' | 'luxury'>('comfort');
  const [calcTravelers, setCalcTravelers] = useState<number>(2);

  // Interactive FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active Feature Tab in Preview Section
  const [activeFeatureTab, setActiveFeatureTab] = useState<'itinerary' | 'telemetry' | 'budget' | 'discovery'>('itinerary');

  // Filtered countries
  const filteredCountries = useMemo(() => {
    return COUNTRIES_DATA.filter((country) => {
      const matchesCategory =
        countryFilter === 'All' ||
        (countryFilter === 'Europe' && country.continent === 'Europe') ||
        (countryFilter === 'Asia' && country.continent === 'Asia') ||
        (countryFilter === 'Islands' && country.continent === 'Islands & Escapes') ||
        (countryFilter === 'Nordic' && country.continent === 'Nordic & Glacial') ||
        (countryFilter === 'Adventure' && country.continent === 'Adventure & Wilderness');

      const matchesSearch =
        !searchQuery.trim() ||
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.whyBest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.topAttractions.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        country.signatureDishes.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [countryFilter, searchQuery]);

  // Selected Country for Calculator
  const calcCountry = useMemo(() => {
    return COUNTRIES_DATA.find(c => c.id === calcCountryId) || COUNTRIES_DATA[0];
  }, [calcCountryId]);

  // Calculate dynamic trip budget estimate
  const estimatedCost = useMemo(() => {
    const ratePerDay = calcCountry.dailyBudget[calcStyle];
    const totalLodgingFoodActivities = ratePerDay * calcDays * calcTravelers;
    const baseTransitCost = calcStyle === 'backpacker' ? 450 : calcStyle === 'comfort' ? 750 : 1600;
    const totalTransit = baseTransitCost * calcTravelers;
    const grandTotal = totalLodgingFoodActivities + totalTransit;

    return {
      perPerson: Math.round(grandTotal / calcTravelers),
      grandTotal: Math.round(grandTotal),
      lodging: Math.round(totalLodgingFoodActivities * 0.45),
      dining: Math.round(totalLodgingFoodActivities * 0.25),
      activities: Math.round(totalLodgingFoodActivities * 0.20),
      transit: totalTransit,
      dailyRate: ratePerDay
    };
  }, [calcCountry, calcDays, calcStyle, calcTravelers]);

  const handlePlanTripToCountry = (countryName: string) => {
    setSelectedCountry(null);
    setShowSignInModal(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const element = document.getElementById('best-countries-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root" style={{ background: '#F7F6F2', color: '#101010', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* -------------------------------------------------------------------- */}
      {/* 1. GLOBAL MINIMALIST EDITORIAL NAVIGATION */}
      {/* -------------------------------------------------------------------- */}
      <header className="landing-nav-header" style={{ background: '#F7F6F2', borderBottom: '1px solid #E8E6E0', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 28px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Left: GlobalTrotter Wordmark + Small uppercase descriptor */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          >
            <AnimatedLogo size="sm" title="GlobalTrotter" badge="PERSONALIZED TRAVEL EXPERIENCES" />
          </div>

          {/* Center: Minimalist Editorial Navigation Links */}
          <nav className="landing-desktop-nav" aria-label="Landing Navigation" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#best-countries-section" className="preserve-discover-font" style={{ color: '#101010', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}>
              Discover
            </a>
            <a href="#best-countries-section" style={{ color: '#555555', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
              Destinations
            </a>
            <a href="#trip-calculator-section" style={{ color: '#555555', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
              Plan Trip
            </a>
            <a href="#editorial-grid-section" style={{ color: '#555555', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
              Community
            </a>
            <a href="#faq-section" style={{ color: '#555555', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
              About
            </a>
          </nav>

          {/* Right: Currency, Sign In, Join Free, and Circular Black Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Currency Selector */}
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                aria-label="Select Currency"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #101010',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#101010',
                  cursor: 'pointer'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={() => setShowSignInModal(true)}
              id="landing-signin-btn"
              style={{
                background: 'transparent',
                border: '1.5px solid #101010',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#101010',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>

            {/* Join Free / Get Started */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              id="landing-getstarted-btn"
              style={{
                background: '#FFD84D',
                border: '1.5px solid #101010',
                borderRadius: '6px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 900,
                color: '#101010',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Join Free</span>
              <span style={{ fontSize: '14px' }}>↗</span>
            </button>

            {/* Far Right: Circular Black Menu Button */}
            <button
              type="button"
              onClick={() => setShowPublicMenuDrawer(true)}
              aria-label="Open Navigation Directory"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#101010',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #429FE8'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. ASYMMETRIC EDITORIAL HERO SECTION */}
      {/* -------------------------------------------------------------------- */}
      <section 
        className="editorial-hero-section"
        style={{
          position: 'relative',
          padding: '48px 28px 72px 28px',
          maxWidth: '1440px',
          margin: '0 auto',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column: Massive Editorial Typography & Narrative */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Small uppercase vertical or horizontal labels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span className="preserve-discover-font" style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#429FE8', textTransform: 'uppercase', fontFamily: "'Syne', sans-serif" }}>
                DISCOVER
              </span>
              <span style={{ color: '#E8E6E0' }}>•</span>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#101010', textTransform: 'uppercase' }}>
                EXPLORE
              </span>
              <span style={{ color: '#E8E6E0' }}>•</span>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#36B7B3', textTransform: 'uppercase' }}>
                TRAVEL
              </span>
              <span style={{ background: '#F4AFC1', color: '#101010', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', border: '1px solid #101010' }}>
                VOL. 2026
              </span>
            </div>

            {/* Massive Multi-line Headline */}
            <h1 
              className="preserve-discover-font"
              style={{
                fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(3rem, 6.2vw, 5.8rem)',
                fontWeight: 900,
                lineHeight: 0.94,
                letterSpacing: '-0.035em',
                color: '#101010',
                margin: '0 0 24px 0',
                textTransform: 'none'
              }}
            >
              Discover.<br />
              Explore.<br />
              Go Beyond.
            </h1>

            {/* Meaningful Description */}
            <p 
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: '#555555',
                maxWidth: '520px',
                margin: '0 0 32px 0',
                fontWeight: 450
              }}
            >
              Create unforgettable journeys with personalized itineraries, smart budgets, 
              extraordinary destinations, and travelers who share your spirit of adventure.
            </p>

            {/* Primary & Secondary Editorial Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('best-countries-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: '#101010',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '14px 26px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '3px 3px 0px #429FE8',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>Start exploring ↗</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                style={{
                  background: '#FFFFFF',
                  color: '#101010',
                  border: '2px solid #101010',
                  borderRadius: '6px',
                  padding: '13px 24px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '3px 3px 0px #101010',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>Plan your trip</span>
              </button>
            </div>

            {/* Clean Editorial Destination Search Bar */}
            <form 
              onSubmit={handleHeroSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '2px solid #101010',
                borderRadius: '10px',
                boxShadow: '4px 4px 0px #101010',
                padding: '6px 8px 6px 18px',
                maxWidth: '520px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ fontSize: '18px' }}>🧭</span>
                <input
                  type="text"
                  placeholder="Search countries, cities, or activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#101010',
                    background: 'transparent'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#36B7B3',
                  color: '#101010',
                  border: '1.5px solid #101010',
                  borderRadius: '6px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0px #101010'
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Column: Asymmetric Framing, Polygons & Pink Badge */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '520px' }}>
            
            {/* Background Geometric Color Blocks */}
            <div 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '75%',
                height: '85%',
                background: '#FFD84D',
                border: '2px solid #101010',
                borderRadius: '16px',
                transform: 'rotate(2.5deg)',
                zIndex: 1
              }}
            />

            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '20px',
                width: '65%',
                height: '70%',
                background: '#429FE8',
                border: '2px solid #101010',
                borderRadius: '16px',
                transform: 'rotate(-3deg)',
                zIndex: 2
              }}
            />

            {/* Main High-Quality Travel Photograph in Asymmetric Polygon / Angled Frame */}
            <div 
              style={{
                position: 'relative',
                zIndex: 3,
                width: '100%',
                maxWidth: '480px',
                height: '460px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '2.5px solid #101010',
                boxShadow: '8px 8px 0px #101010',
                background: '#FFFFFF'
              }}
            >
              <img 
                src={HERO_DESTINATIONS[heroIndex].image} 
                alt={HERO_DESTINATIONS[heroIndex].name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease'
                }}
              />

              {/* Bottom Image Caption Bar */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(16, 16, 16, 0.88)',
                  backdropFilter: 'blur(6px)',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1.5px solid #101010'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFD84D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {HERO_DESTINATIONS[heroIndex].kicker}
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0', fontFamily: "'Syne', sans-serif" }}>
                    {HERO_DESTINATIONS[heroIndex].name}, {HERO_DESTINATIONS[heroIndex].country}
                  </h4>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {HERO_DESTINATIONS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHeroIndex(idx)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: heroIndex === idx ? '#FFD84D' : 'rgba(255,255,255,0.4)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      aria-label={`Show destination ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Circular Pink Editorial Badge with Rotated / Curved Text Style */}
            <div 
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-10px',
                zIndex: 4,
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: '#F4AFC1',
                border: '2px solid #101010',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '8px',
                boxShadow: '4px 4px 0px #101010',
                transform: 'rotate(-8deg)',
                animation: 'badgeFloat 4s ease-in-out infinite'
              }}
            >
              <span className="preserve-discover-font" style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', color: '#101010', textTransform: 'uppercase', lineHeight: 1.2, fontFamily: "'Syne', sans-serif" }}>
                DISCOVER •<br />EXPLORE •<br />EXPERIENCE
              </span>
              <span style={{ fontSize: '14px', marginTop: '3px' }}>✦</span>
            </div>

            {/* Additional Asymmetric Editorial Pill */}
            <div 
              style={{
                position: 'absolute',
                bottom: '-12px',
                left: '-10px',
                zIndex: 4,
                background: '#36B7B3',
                border: '2px solid #101010',
                borderRadius: '8px',
                padding: '8px 14px',
                boxShadow: '3px 3px 0px #101010',
                fontSize: '11.5px',
                fontWeight: 900,
                color: '#101010',
                letterSpacing: '0.04em'
              }}
            >
              ★ 4.98 RATED EXPERIENCES
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. ASYMMETRIC EDITORIAL CONTENT GRID (CARDS A THROUGH E) */}
      {/* -------------------------------------------------------------------- */}
      <section 
        id="editorial-grid-section"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '24px 28px 72px 28px'
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: '#101010', textTransform: 'uppercase' }}>
            SECTION // 02
          </span>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: 900, color: '#101010', margin: '4px 0 0 0' }}>
            The Global Editorial Collection
          </h2>
        </div>

        {/* 12-Column Asymmetrical Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {/* Card A — Featured Destination (Spans 7 cols) */}
          <div 
            style={{
              gridColumn: 'span 7',
              background: '#429FE8',
              border: '2px solid #101010',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '6px 6px 0px #101010',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ background: '#FFFFFF', color: '#101010', fontSize: '11px', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', border: '1.5px solid #101010' }}>
                  FEATURED DESTINATION
                </span>
                <span style={{ fontStyle: 'italic', fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                  * Aegean volcanic horizons
                </span>
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', textShadow: '1px 1px 0px #101010' }}>
                Santorini & The Cyclades
              </h3>
              <p style={{ fontSize: '14px', color: '#F7F6F2', maxWidth: '420px', lineHeight: 1.5, margin: 0 }}>
                Sun-drenched caldera viewpoints, sapphire domes, and timeless maritime passages across the southern Aegean Sea.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'flex-end', marginTop: '24px', position: 'relative', zIndex: 2 }}>
              <div 
                style={{
                  height: '180px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #101010',
                  boxShadow: '4px 4px 0px #101010'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80" 
                  alt="Santorini" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    const country = COUNTRIES_DATA.find(c => c.name.toLowerCase() === 'greece');
                    if (country) setSelectedCountry(country);
                  }}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    color: '#101010',
                    border: '2px solid #101010',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13.5px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px #101010',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Explore destination</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card B — Personalized Itinerary (Spans 5 cols) */}
          <div 
            style={{
              gridColumn: 'span 5',
              background: '#F4AFC1',
              border: '2px solid #101010',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '6px 6px 0px #101010',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: '#101010', textTransform: 'uppercase' }}>
                CUSTOM PLANNING // 01
              </span>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: 900, color: '#101010', margin: '12px 0 10px 0' }}>
                Your Next Journey.
              </h3>
              <p style={{ fontSize: '14.5px', color: '#101010', lineHeight: 1.5, margin: 0 }}>
                Build intelligent day-by-day itineraries tailored to your pacing, budget, and travel preferences.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '2px solid #101010', borderRadius: '10px', padding: '16px', margin: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>⚡</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#101010' }}>AI ROUTE OPTIMIZATION</span>
              </div>
              <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>
                Automated train schedules, hotel linkages, and real-time transit times calculated instantly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                width: '100%',
                background: '#101010',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 18px',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '3px 3px 0px #FFFFFF'
              }}
            >
              <span>Build your itinerary</span>
              <span>↗</span>
            </button>
          </div>

          {/* Card C — Adventure Highlight (Spans 4 cols) */}
          <div 
            style={{
              gridColumn: 'span 4',
              background: '#FFD84D',
              border: '2px solid #101010',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '6px 6px 0px #101010',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px'
            }}
          >
            <div>
              <div 
                style={{
                  height: '160px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #101010',
                  marginBottom: '16px'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=700&q=80" 
                  alt="Matterhorn" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 900, letterSpacing: '0.1em', color: '#101010', textTransform: 'uppercase' }}>
                ADVENTURE HIGHLIGHT
              </span>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 900, color: '#101010', margin: '4px 0 0 0' }}>
                Matterhorn Glacial Trek
              </h4>
            </div>

            <button
              type="button"
              onClick={() => {
                const country = COUNTRIES_DATA.find(c => c.name.toLowerCase() === 'switzerland');
                if (country) setSelectedCountry(country);
              }}
              style={{
                marginTop: '16px',
                background: '#FFFFFF',
                color: '#101010',
                border: '1.5px solid #101010',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>View adventure details</span>
              <span>↗</span>
            </button>
          </div>

          {/* Card D — Trip Planning (Spans 4 cols) */}
          <div 
            style={{
              gridColumn: 'span 4',
              background: '#FFFFFF',
              border: '2px solid #101010',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '6px 6px 0px #101010',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px'
            }}
          >
            <div>
              <div style={{ fontSize: '56px', fontWeight: 900, color: '#101010', lineHeight: 1, marginBottom: '12px', fontFamily: "'Syne', sans-serif" }}>
                ↗
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 900, letterSpacing: '0.12em', color: '#555555', textTransform: 'uppercase' }}>
                START CRAFTING
              </span>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 900, color: '#101010', margin: '8px 0 10px 0', lineHeight: 1.2 }}>
                Let's Plan Something Extraordinary.
              </h4>
              <p style={{ fontSize: '13px', color: '#555555', lineHeight: 1.5, margin: 0 }}>
                Direct integration with hotel bookings, flight radar, and budget estimates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                marginTop: '16px',
                background: '#101010',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '2px 2px 0px #FFD84D'
              }}
            >
              <span>Launch planner</span>
              <span>↗</span>
            </button>
          </div>

          {/* Card E — Travel Community (Spans 4 cols) */}
          <div 
            style={{
              gridColumn: 'span 4',
              background: '#36B7B3',
              border: '2px solid #101010',
              borderRadius: '16px',
              padding: '26px',
              boxShadow: '6px 6px 0px #101010',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px'
            }}
          >
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 900, letterSpacing: '0.12em', color: '#FFFFFF', textTransform: 'uppercase' }}>
                VOYAGER GUILD // SOCIAL
              </span>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 900, color: '#101010', margin: '8px 0 12px 0', lineHeight: 1.2 }}>
                Adventure Is Better Together.
              </h4>
              <p style={{ fontSize: '13px', color: '#101010', lineHeight: 1.5, margin: 0 }}>
                Share trip photos, exchange local tips, join expedition squads, and connect with global travelers.
              </p>

              {/* Avatar Stack */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80',
                  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=80&h=80&q=80'
                ].map((src, i) => (
                  <img 
                    key={i} 
                    src={src} 
                    alt="Traveler" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #101010', marginLeft: i > 0 ? '-8px' : '0' }}
                  />
                ))}
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#101010', marginLeft: '6px' }}>+14.2k active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                marginTop: '16px',
                background: '#FFFFFF',
                color: '#101010',
                border: '2px solid #101010',
                borderRadius: '6px',
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '2px 2px 0px #101010'
              }}
            >
              <span>Join community</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. PINNACLE SECTION: THE WORLD'S BEST COUNTRIES DEEP-DIVE GUIDES */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="best-countries-section" style={{ background: '#F7F6F2', padding: '64px 28px', borderTop: '1px solid #E8E6E0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#429FE8', textTransform: 'uppercase' }}>
                EDITORIAL DOSSIERS // 35+ NATIONS
              </span>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#101010', margin: '6px 0 0 0' }}>
                The World's Greatest Destinations
              </h2>
            </div>

            {/* Filter Tabs for Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['All', 'Europe', 'Asia', 'Islands', 'Nordic', 'Adventure'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCountryFilter(cat)}
                  style={{
                    background: countryFilter === cat ? '#101010' : '#FFFFFF',
                    color: countryFilter === cat ? '#FFFFFF' : '#101010',
                    border: '1.5px solid #101010',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: countryFilter === cat ? '2px 2px 0px #429FE8' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'All' ? `All Featured (${COUNTRIES_DATA.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Bar */}
          {searchQuery && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#FFFFFF', border: '1.5px solid #101010', borderRadius: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '13.5px', color: '#101010' }}>
                Found <strong>{filteredCountries.length}</strong> destinations matching "<em>{searchQuery}</em>"
              </span>
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ background: '#F7F6F2', border: '1px solid #101010', borderRadius: '4px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Country Cards Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredCountries.map((country) => (
              <article 
                key={country.id} 
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #101010',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '4px 4px 0px #101010',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Image Banner */}
                <div 
                  onClick={() => setSelectedCountry(country)}
                  style={{
                    position: 'relative',
                    height: '210px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderBottom: '2px solid #101010'
                  }}
                >
                  <img 
                    src={country.heroImage} 
                    alt={country.name} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#FFFFFF', color: '#101010', fontSize: '10.5px', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', border: '1px solid #101010' }}>
                    {country.continent}
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#FFD84D', color: '#101010', fontSize: '11px', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', border: '1px solid #101010' }}>
                    ★ {country.rating}
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 16, 16, 0.85)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{country.flag}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0, fontFamily: "'Syne', sans-serif" }}>{country.name}</h3>
                      <span style={{ fontSize: '11px', color: '#E8E6E0' }}>Capital: {country.capital}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#555555', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                      “{country.tagline}”
                    </p>

                    {/* Why It's The Best Feature Box */}
                    <div style={{ background: '#F7F6F2', border: '1px solid #E8E6E0', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#101010', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        🏆 WHY IT'S THE BEST:
                      </div>
                      <p style={{ fontSize: '12px', color: '#555555', margin: 0, lineHeight: 1.45 }}>
                        {country.whyBest.slice(0, 140)}...
                      </p>
                    </div>

                    {/* Quick Facts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
                      <div style={{ background: '#F7F6F2', padding: '6px', borderRadius: '6px', border: '1px solid #E8E6E0' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#555555', display: 'block' }}>SEASON</span>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010' }}>{country.bestSeason.months.split('&')[0]}</span>
                      </div>
                      <div style={{ background: '#F7F6F2', padding: '6px', borderRadius: '6px', border: '1px solid #E8E6E0' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#555555', display: 'block' }}>BUDGET</span>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010' }}>${country.dailyBudget.comfort}/day</span>
                      </div>
                      <div style={{ background: '#F7F6F2', padding: '6px', borderRadius: '6px', border: '1px solid #E8E6E0' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#555555', display: 'block' }}>SAFETY</span>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010' }}>{country.safetyScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      style={{
                        flex: 1,
                        background: '#101010',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Deep Dive Dossier</span>
                      <span>↗</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlanTripToCountry(country.name)}
                      style={{
                        background: '#FFD84D',
                        color: '#101010',
                        border: '1.5px solid #101010',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontSize: '12.5px',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      Plan Trip
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 5. INTERACTIVE TRIP COST CALCULATOR (EDITORIAL DESIGN) */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="trip-calculator-section" style={{ background: '#FFFFFF', padding: '64px 28px', borderTop: '1px solid #E8E6E0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#36B7B3', textTransform: 'uppercase' }}>
              FINANCIAL INTELLIGENCE // REAL-TIME ESTIMATES
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#101010', margin: '6px 0 10px 0' }}>
              Dynamic Expedition Cost Forecaster
            </h2>
            <p style={{ fontSize: '15px', color: '#555555', maxWidth: '640px', margin: '0 auto' }}>
              Estimate accurate budgets across accommodations, transit, culinary experiences, and guided activities before departure.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '36px', background: '#F7F6F2', border: '2px solid #101010', borderRadius: '16px', padding: '36px', boxShadow: '8px 8px 0px #101010' }}>
            
            {/* Left Controls */}
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 900, letterSpacing: '0.08em', color: '#101010', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  CHOOSE DESTINATION NATION
                </label>
                <select
                  value={calcCountryId}
                  onChange={(e) => setCalcCountryId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '2px solid #101010',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#101010',
                    boxShadow: '2px 2px 0px #101010'
                  }}
                >
                  {COUNTRIES_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} ({c.continent})
                    </option>
                  ))}
                </select>
              </div>

              {/* Days Slider */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 900, letterSpacing: '0.08em', color: '#101010', textTransform: 'uppercase' }}>
                    JOURNEY LENGTH
                  </label>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#101010', background: '#FFD84D', padding: '2px 10px', borderRadius: '4px', border: '1px solid #101010' }}>
                    {calcDays} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={calcDays}
                  onChange={(e) => setCalcDays(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#101010', cursor: 'pointer' }}
                />
              </div>

              {/* Travel Style */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 900, letterSpacing: '0.08em', color: '#101010', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  TRAVEL TIER & STYLE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { key: 'backpacker', icon: '🎒', label: 'Backpacker', price: calcCountry.dailyBudget.backpacker },
                    { key: 'comfort', icon: '🏨', label: 'Comfort', price: calcCountry.dailyBudget.comfort },
                    { key: 'luxury', icon: '✨', label: 'Luxury VIP', price: calcCountry.dailyBudget.luxury }
                  ].map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setCalcStyle(tier.key as any)}
                      style={{
                        background: calcStyle === tier.key ? '#101010' : '#FFFFFF',
                        color: calcStyle === tier.key ? '#FFFFFF' : '#101010',
                        border: '1.5px solid #101010',
                        borderRadius: '8px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: calcStyle === tier.key ? '3px 3px 0px #429FE8' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{tier.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, display: 'block' }}>{tier.label}</span>
                      <span style={{ fontSize: '11px', opacity: 0.85 }}>${tier.price}/day</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 900, letterSpacing: '0.08em', color: '#101010', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  VOYAGER COUNT
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcTravelers(num)}
                      style={{
                        flex: 1,
                        background: calcTravelers === num ? '#101010' : '#FFFFFF',
                        color: calcTravelers === num ? '#FFFFFF' : '#101010',
                        border: '1.5px solid #101010',
                        borderRadius: '6px',
                        padding: '8px 4px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {num === 1 ? 'Solo' : `${num} Pax`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Results Breakdown */}
            <div style={{ background: '#FFFFFF', border: '2px solid #101010', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#429FE8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {calcCountry.flag} {calcCountry.name} // {calcDays} DAYS // {calcTravelers} TRAVELERS
                </span>
                <div style={{ margin: '14px 0 20px 0' }}>
                  <div style={{ fontSize: '42px', fontWeight: 900, color: '#101010', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                    ${estimatedCost.grandTotal.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#555555' }}>
                    Total Estimated Voyage Cost (~${estimatedCost.perPerson.toLocaleString()} per person)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #E8E6E0', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#555555' }}>🏨 Stays & Lodging</span>
                    <strong style={{ color: '#101010' }}>${estimatedCost.lodging.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#555555' }}>✈️ Flights & Transit</span>
                    <strong style={{ color: '#101010' }}>${estimatedCost.transit.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#555555' }}>🍜 Dining & Cuisine</span>
                    <strong style={{ color: '#101010' }}>${estimatedCost.dining.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#555555' }}>🏛️ Guided Experiences</span>
                    <strong style={{ color: '#101010' }}>${estimatedCost.activities.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  style={{
                    width: '100%',
                    background: '#101010',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '3px 3px 0px #FFD84D'
                  }}
                >
                  <span>Lock in & Build Itinerary</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 6. WHOLE SITE OPERATING SYSTEM PREVIEW */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="platform-features-section" style={{ background: '#F7F6F2', padding: '64px 28px', borderTop: '1px solid #E8E6E0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#101010', textTransform: 'uppercase' }}>
              THE VOYAGER OPERATING SYSTEM
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#101010', margin: '6px 0 10px 0' }}>
              Engineered for Effortless Exploration
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[
              { id: 'itinerary', label: 'Itinerary Builder', icon: '🗺️' },
              { id: 'telemetry', label: 'Live Telemetry Radar', icon: '🛰️' },
              { id: 'budget', label: 'Multi-Currency Budget', icon: '💳' },
              { id: 'discovery', label: 'Destination Catalog', icon: '🏙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFeatureTab(tab.id as any)}
                style={{
                  background: activeFeatureTab === tab.id ? '#101010' : '#FFFFFF',
                  color: activeFeatureTab === tab.id ? '#FFFFFF' : '#101010',
                  border: '1.5px solid #101010',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: activeFeatureTab === tab.id ? '2px 2px 0px #36B7B3' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', border: '2px solid #101010', borderRadius: '16px', padding: '36px', boxShadow: '6px 6px 0px #101010' }}>
            {activeFeatureTab === 'itinerary' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#429FE8', textTransform: 'uppercase' }}>
                    DYNAMIC ROUTING ENGINE
                  </span>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 900, color: '#101010', margin: '8px 0 12px 0' }}>
                    Craft Multi-City Routes with Visual Draggable Flow
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#555555', lineHeight: 1.6 }}>
                    Structure every day of your expedition with ease. Connect cities via bullet trains, scenic flights, or private chauffeur road trips with automated travel time estimates and hotel stay tracking.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    style={{
                      marginTop: '16px',
                      background: '#FFD84D',
                      color: '#101010',
                      border: '1.5px solid #101010',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #101010'
                    }}
                  >
                    Launch Itinerary Builder ↗
                  </button>
                </div>
                <div style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E6E0', paddingBottom: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#101010' }}>ACTIVE ITINERARY // TOKYO → KYOTO → OSAKA</span>
                    <span style={{ fontSize: '11px', background: '#36B7B3', color: '#101010', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>9 DAYS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                    <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E8E6E0' }}>
                      <strong>Day 1-3: Tokyo</strong> • Shibuya Crossing, Meiji Shrine, Shinjuku Golden Gai
                    </div>
                    <div style={{ background: '#FFD84D', padding: '8px 10px', borderRadius: '6px', border: '1px solid #101010', fontSize: '11.5px', fontWeight: 700 }}>
                      🚄 Shinkansen Bullet Train: Tokyo → Kyoto (2h 15m @ 285 km/h)
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #E8E6E0' }}>
                      <strong>Day 4-7: Kyoto</strong> • Fushimi Inari Torii, Arashiyama Bamboo, Traditional Ryokan
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'telemetry' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#36B7B3', textTransform: 'uppercase' }}>
                    SATELLITE & TRANSIT CHANNELS
                  </span>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 900, color: '#101010', margin: '8px 0 12px 0' }}>
                    Real-Time Flight & Ground Telemetry
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#555555', lineHeight: 1.6 }}>
                    Live telemetry monitors departure gates, flight paths, weather radar advisories, and local time zones as you move between world destinations.
                  </p>
                </div>
                <div style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#101010', marginBottom: '8px' }}>FLIGHT 6E-204 EN ROUTE</div>
                  <div style={{ height: '8px', background: '#E8E6E0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: '68%', height: '100%', background: '#429FE8' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555555' }}>
                    <span>Altitude: 34,000 ft</span>
                    <span>Speed: 840 km/h</span>
                    <span>Arrival: On Time</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'budget' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#F4AFC1', textTransform: 'uppercase' }}>
                    FINANCIAL LEDGER
                  </span>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 900, color: '#101010', margin: '8px 0 12px 0' }}>
                    Multi-Currency Budget Tracker
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#555555', lineHeight: 1.6 }}>
                    Log expenses in any currency, split costs with travel companions, and monitor category allowances with zero hidden transaction surprises.
                  </p>
                </div>
                <div style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#101010', marginBottom: '10px' }}>EXPENSE BREAKDOWN</div>
                  <div style={{ display: 'flex', gap: '6px', height: '14px', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ flex: 45, background: '#429FE8' }} title="Stays" />
                    <div style={{ flex: 25, background: '#FFD84D' }} title="Dining" />
                    <div style={{ flex: 20, background: '#36B7B3' }} title="Activities" />
                    <div style={{ flex: 10, background: '#F4AFC1' }} title="Transit" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#555555' }}>
                    Auto-converts foreign receipts (JPY, EUR, CHF) into your preferred home currency.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'discovery' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFD84D', textTransform: 'uppercase' }}>
                    CURATED DISCOVERY
                  </span>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 900, color: '#101010', margin: '8px 0 12px 0' }}>
                    Verified Local Intelligence
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#555555', lineHeight: 1.6 }}>
                    Access hidden viewpoints, off-the-beaten-path dining, cultural etiquette, and optimal sunset viewpoints verified by experienced global travelers.
                  </p>
                </div>
                <div style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }}>🧭</span>
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: '#101010', margin: 0 }}>Over 1,200+ Verified Experience Dossiers</h4>
                    <p style={{ fontSize: '12px', color: '#555555', margin: '4px 0 0 0' }}>Updated weekly across 7 continents with season-by-season climate accuracy.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 7. TRAVEL DREAMSCAPE IMMERSIVE 3D SHOWCASE */}
      {/* -------------------------------------------------------------------- */}
      <TravelDreamscape onStartPlanning={(destName) => setShowSignInModal(true)} />

      {/* -------------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="faq-section" style={{ background: '#FFFFFF', padding: '64px 28px', borderTop: '1px solid #E8E6E0' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', color: '#101010', textTransform: 'uppercase' }}>
              CLARITY & SUPPORT
            </span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#101010', margin: '6px 0 0 0' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: 'Is GlobalTrotter free for regular travelers?',
                a: 'Yes! GlobalTrotter is completely free to sign up, explore country dossiers, create multi-city itineraries, and calculate budgets. There are no paywalls for core voyage planning tools.'
              },
              {
                q: 'How do the country dossiers help me plan?',
                a: 'Each dossier curates verified intelligence: signature bucket-list spots, optimal seasonal windows (with temperature breakdowns), authentic culinary specialties, and realistic daily budgets for Backpackers, Balanced Voyagers, and Luxury travelers.'
              },
              {
                q: 'Can I share or export my itinerary with travel companions?',
                a: 'Absolutely. Every trip created can be exported or shared via an invite link so your travel squad stays synchronized.'
              },
              {
                q: 'How does multi-currency budget tracking work?',
                a: 'You can log expenses in any local currency (JPY, EUR, CHF, GBP, INR), and GlobalTrotter automatically converts and totals them against your preferred base currency.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  background: '#F7F6F2',
                  border: '1.5px solid #101010',
                  borderRadius: '10px',
                  padding: '18px 22px',
                  cursor: 'pointer',
                  boxShadow: openFaq === idx ? '3px 3px 0px #FFD84D' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#101010', margin: 0 }}>{faq.q}</h4>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#101010' }}>{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #E8E6E0', paddingTop: '10px' }}>
                    <p style={{ fontSize: '13.5px', color: '#555555', margin: 0, lineHeight: 1.55 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 9. BOTTOM EDITORIAL CALL TO ACTION */}
      {/* -------------------------------------------------------------------- */}
      <section style={{ background: '#101010', color: '#FFFFFF', padding: '72px 28px', textAlign: 'center' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <span style={{ background: '#FFD84D', color: '#101010', fontSize: '11px', fontWeight: 900, padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            START YOUR JOURNEY TODAY
          </span>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 900, margin: '20px 0 16px 0', lineHeight: 1.05 }}>
            Ready to Explore the World’s Greatest Wonders?
          </h2>
          <p style={{ fontSize: '16px', color: '#A7B2BE', lineHeight: 1.6, margin: '0 0 32px 0' }}>
            Join 25,000+ passionate global voyagers. Build your custom multi-city itinerary, unlock verified country dossiers, and travel with confidence.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                background: '#FFD84D',
                color: '#101010',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '3px 3px 0px #429FE8'
              }}
            >
              Create Free Account ↗
            </button>

            <button
              type="button"
              onClick={() => setShowSignInModal(true)}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                borderRadius: '8px',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Sign In to Existing Trips
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 10. EDITORIAL FOOTER */}
      {/* -------------------------------------------------------------------- */}
      <footer style={{ background: '#F7F6F2', borderTop: '2px solid #101010', padding: '48px 28px 32px 28px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '36px', marginBottom: '36px' }}>
          <div>
            <AnimatedLogo size="md" title="GlobalTrotter" badge="PERSONALIZED TRAVEL EXPERIENCES" />
            <p style={{ fontSize: '13px', color: '#555555', lineHeight: 1.6, marginTop: '14px', maxWidth: '340px' }}>
              The modern intelligent digital operating system for global travelers. Designed for effortless multi-city itinerary building, live telemetry, and country discovery.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', color: '#101010', textTransform: 'uppercase', marginBottom: '14px' }}>
              DESTINATIONS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {COUNTRIES_DATA.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedCountry(c)} 
                    style={{ background: 'none', border: 'none', color: '#555555', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 600 }}
                  >
                    {c.flag} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', color: '#101010', textTransform: 'uppercase', marginBottom: '14px' }}>
              FEATURES
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><a href="#platform-features-section" style={{ color: '#555555', textDecoration: 'none' }}>Itinerary Builder</a></li>
              <li><a href="#platform-features-section" style={{ color: '#555555', textDecoration: 'none' }}>Live Telemetry Radar</a></li>
              <li><a href="#trip-calculator-section" style={{ color: '#555555', textDecoration: 'none' }}>Budget Calculator</a></li>
              <li><a href="#editorial-grid-section" style={{ color: '#555555', textDecoration: 'none' }}>Travel Community</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', color: '#101010', textTransform: 'uppercase', marginBottom: '14px' }}>
              VOYAGER ACCESS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li>
                <button type="button" onClick={() => setShowSignInModal(true)} style={{ background: 'none', border: 'none', color: '#101010', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '13px' }}>
                  Sign In to Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setShowRegisterModal(true)} style={{ background: 'none', border: 'none', color: '#101010', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '13px' }}>
                  Join Free Today
                </button>
              </li>
              <li><a href="#faq-section" style={{ color: '#555555', textDecoration: 'none' }}>Traveler FAQ</a></li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1440px', margin: '0 auto', borderTop: '1px solid #E8E6E0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#555555', flexWrap: 'wrap', gap: '10px' }}>
          <span>© {new Date().getFullYear()} GlobalTrotter Inc. Personalized Travel Experiences.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security</span>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* 11. PUBLIC NAVIGATION OVERLAY / DRAWER */}
      {/* -------------------------------------------------------------------- */}
      {showPublicMenuDrawer && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(16, 16, 16, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowPublicMenuDrawer(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              background: '#F7F6F2',
              borderLeft: '2px solid #101010',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-8px 0px 0px rgba(16, 16, 16, 0.15)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#429FE8', textTransform: 'uppercase' }}>
                    DIRECTORY // INDEX
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: '4px 0 0 0', fontFamily: "'Syne', sans-serif' " }}>
                    GlobalTrotter
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPublicMenuDrawer(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#101010',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { num: '01', label: 'Discover Destinations', href: '#best-countries-section', desc: 'Curated 35+ Country Guides' },
                  { num: '02', label: 'Trip Cost Calculator', href: '#trip-calculator-section', desc: 'Real-time Budget Estimates' },
                  { num: '03', label: 'Editorial Collection', href: '#editorial-grid-section', desc: 'Stories, Itineraries & Highlights' },
                  { num: '04', label: 'Operating System Hubs', href: '#platform-features-section', desc: 'Route Optimizer, Radar & Budget' },
                  { num: '05', label: '3D Mountain Dreamscape', href: '#travel-dreamscape-section', desc: 'Immersive Sanctuary Preview' },
                  { num: '06', label: 'About & Voyager FAQ', href: '#faq-section', desc: 'Platform Details & Guidance' }
                ].map((item) => (
                  <a
                    key={item.num}
                    href={item.href}
                    onClick={() => setShowPublicMenuDrawer(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: '#FFFFFF',
                      border: '1.5px solid #101010',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#101010',
                      boxShadow: '3px 3px 0px #101010'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#36B7B3', fontFamily: 'monospace' }}>
                        {item.num}
                      </span>
                      <div>
                        <div 
                          className={item.num === '01' ? 'preserve-discover-font' : ''} 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 800, 
                            fontFamily: item.num === '01' ? "'Syne', sans-serif" : '"Noto Sans Kharoshthi", sans-serif' 
                          }}
                        >
                          {item.label}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#555555' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E8E6E0', paddingTop: '20px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPublicMenuDrawer(false);
                  setShowSignInModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#FFFFFF',
                  color: '#101010',
                  border: '2px solid #101010',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPublicMenuDrawer(false);
                  setShowRegisterModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#101010',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #FFD84D'
                }}
              >
                Join Free (Get Started)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 12. COUNTRY DEEP-DIVE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {selectedCountry && (
        <CountryDossierModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onPlanTrip={handlePlanTripToCountry}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 13. SIGN-IN MODAL */}
      {/* -------------------------------------------------------------------- */}
      {showSignInModal && (
        <SignIn
          onSignInSuccess={(user) => {
            setShowSignInModal(false);
            onSignInSuccess(user);
          }}
          onClose={() => setShowSignInModal(false)}
          isModal={true}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 14. REGISTER MODAL */}
      {/* -------------------------------------------------------------------- */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={(newUser) => {
          setShowRegisterModal(false);
          onSignInSuccess(newUser);
        }}
      />
    </div>
  );
};
