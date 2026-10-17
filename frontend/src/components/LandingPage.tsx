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

export const LandingPage: React.FC<Props> = ({ onSignInSuccess }) => {
  // Navigation & Modal State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryDossier | null>(null);

  // Search & Filter State
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTravelers, setSearchTravelers] = useState('2 Travelers');
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
    // Estimated round-trip flight / transit base per person
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
    <div className="landing-page-root">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP STICKY NAVIGATION (PUBLIC VOYAGER BAR) */}
      {/* -------------------------------------------------------------------- */}
      <header className="landing-nav-header">
        <div className="landing-nav-container">
          {/* Brand Logo */}
          <div className="landing-brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AnimatedLogo size="md" title="GlobalTrotter" badge="Pastel Dreamscape" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="landing-desktop-nav" aria-label="Landing Navigation">
            <a href="#best-countries-section" className="nav-anchor-link">
              <span className="nav-link-icon">🌍</span> Destinations
            </a>
            <a href="#trip-calculator-section" className="nav-anchor-link">
              <span className="nav-link-icon">✨</span> Plan Trip
            </a>
            <a href="#platform-features-section" className="nav-anchor-link">
              <span className="nav-link-icon">🌐</span> Community & Hubs
            </a>
            <a href="#travel-dreamscape-section" className="nav-anchor-link">
              <span className="nav-link-icon">🌸</span> Dreamscape
            </a>
            <a href="#faq-section" className="nav-anchor-link">
              <span className="nav-link-icon">ℹ️</span> About & FAQ
            </a>
          </nav>

          {/* Auth Action Buttons (Prominent Sign In Button) */}
          <div className="landing-nav-actions">
            {/* Currency Selector */}
            <div className="nav-currency-selector">
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                aria-label="Select Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            {/* THE SIGN-IN BUTTON */}
            <button
              type="button"
              className="btn-nav-signin"
              onClick={() => setShowSignInModal(true)}
              id="landing-signin-btn"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In</span>
            </button>

            {/* Get Started Button */}
            <button
              type="button"
              className="btn-nav-getstarted"
              onClick={() => setShowRegisterModal(true)}
              id="landing-getstarted-btn"
            >
              <span>Join Free</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. HERO SECTION - PASTEL DREAMSCAPE LUXURY TRAVEL UI */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-hero-section">
        <div className="hero-two-col-container">
          {/* Left Column: Intro Copy, Actions, Location/Date/Traveler Search */}
          <div className="hero-left-col">
            {/* Trust Pill */}
            <div className="hero-announcement-pill">
              <span className="pulsing-live-dot" />
              <span className="pill-text">Luxury Travel Planning & Tailored Dreamscapes</span>
              <span className="pill-chip">Pastel Dreamscape</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">
              Discover Your <span className="gradient-text">Next Destination.</span>
            </h1>

            {/* Introductory Text */}
            <p className="hero-subtext">
              Immerse yourself in bespoke luxury itineraries, curated country dossiers, real-time voyager telemetry, 
              and dynamic expense budgeting across ethereal turquoise lagoons, alpine heights, and cultural wonders.
            </p>

            {/* Action Buttons: Explore Today, Start Planning, Watch Video */}
            <div className="hero-actions-row">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => setShowRegisterModal(true)}
                id="hero-explore-today-btn"
              >
                <span>Explore Today</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => {
                  const element = document.getElementById('trip-calculator-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                id="hero-start-planning-btn"
              >
                <span>Start Planning</span>
                <span style={{ fontSize: '16px' }}>✨</span>
              </button>

              <button
                type="button"
                className="btn-hero-video"
                onClick={() => setShowVideoModal(true)}
                id="hero-watch-video-btn"
              >
                <span className="video-play-icon">▶</span>
                <span>Watch Story</span>
              </button>
            </div>

            {/* Interactive Location, Date, and Traveler Search Bar */}
            <form className="hero-search-glass-card" onSubmit={handleHeroSearch}>
              <div className="search-field-group">
                <span className="field-icon">📍</span>
                <div className="field-inputs">
                  <label>LOCATION</label>
                  <input
                    type="text"
                    placeholder="Where to? (e.g. Bora Bora, Japan, Swiss Alps...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-divider-vertical" />

              <div className="search-field-group">
                <span className="field-icon">📅</span>
                <div className="field-inputs">
                  <label>TRAVEL DATE</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2026 / Spring Bloom"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-divider-vertical" />

              <div className="search-field-group">
                <span className="field-icon">👥</span>
                <div className="field-inputs">
                  <label>TRAVELERS</label>
                  <select 
                    value={searchTravelers} 
                    onChange={(e) => {
                      setSearchTravelers(e.target.value);
                      if (e.target.value.includes('1')) setCalcTravelers(1);
                      else if (e.target.value.includes('2')) setCalcTravelers(2);
                      else if (e.target.value.includes('4')) setCalcTravelers(4);
                    }}
                  >
                    <option value="1 Solo Explorer">1 Solo Explorer</option>
                    <option value="2 Travelers">2 Travelers (Couple)</option>
                    <option value="3-4 Group / Family">3-4 Group / Family</option>
                    <option value="5+ Expedition Squad">5+ Expedition Squad</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="hero-search-submit-btn">
                <span>Explore</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Column: Large Luxury Travel Destination Image */}
          <div className="hero-right-col">
            <div className="hero-3d-island-wrapper">
              {/* Pastel Dreamscape Ambient Glow */}
              <div 
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  background: 'radial-gradient(circle, rgba(247, 191, 213, 0.4) 0%, rgba(195, 154, 217, 0.25) 50%, transparent 70%)',
                  filter: 'blur(30px)',
                  borderRadius: '40px',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />

              {/* Luxury Travel Hero Destination Image */}
              <img
                src="/pastel_dreamscape_hero.jpg"
                alt="GlobalTrotter Pastel Dreamscape Luxury Travel"
                className="floating-3d-island-img"
                style={{ position: 'relative', zIndex: 1 }}
              />

              {/* Floating Decorative Elements & Badges */}
              <div className="floating-badge floating-cloud-badge">
                <span>✈️</span>
                <span>AI Voyage Telemetry</span>
              </div>

              <div className="floating-badge floating-airplane-badge">
                <span>🌸</span>
                <span>Pastel Dreamscape</span>
              </div>

              <div className="floating-badge floating-rating-badge">
                <span>⭐ 4.98/5</span>
                <span>35k+ Voyagers</span>
              </div>

              <div className="floating-badge floating-ocean-badge">
                <span className="badge-dot-turquoise" style={{ background: '#F3AFCF', boxShadow: '0 0 10px #F3AFCF' }} />
                <span>Luxury Travel UI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. PINNACLE SECTION: BEST COUNTRIES OF THE WORLD (INFORMATION OF ANOTHER COUNTRY BEST) */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="best-countries-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">🌍 Curated Global Intelligence</span>
            <h2 className="section-title">The World's Best Countries — Deep-Dive Travel Guides</h2>
            <p className="section-subtitle">
              Comprehensive intelligence on why each country ranks among the absolute greatest destinations on Earth: 
              signature bucket-list experiences, seasonal climate windows, authentic cuisine, and daily voyager budgets.
            </p>
          </div>

          {/* Filter Tabs for Categories */}
          <div className="country-filter-tabs">
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'All' ? 'active' : ''}`}
              onClick={() => setCountryFilter('All')}
            >
              🌟 All Featured ({COUNTRIES_DATA.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'Europe' ? 'active' : ''}`}
              onClick={() => setCountryFilter('Europe')}
            >
              🏰 Europe
            </button>
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'Asia' ? 'active' : ''}`}
              onClick={() => setCountryFilter('Asia')}
            >
              🏮 Asia
            </button>
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'Islands' ? 'active' : ''}`}
              onClick={() => setCountryFilter('Islands')}
            >
              🏝️ Island Escapes
            </button>
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'Nordic' ? 'active' : ''}`}
              onClick={() => setCountryFilter('Nordic')}
            >
              ❄️ Nordic & Glacial
            </button>
            <button
              type="button"
              className={`filter-tab ${countryFilter === 'Adventure' ? 'active' : ''}`}
              onClick={() => setCountryFilter('Adventure')}
            >
              🧭 Adventure & Wilderness
            </button>
          </div>

          {/* Search Result Count / Reset */}
          {searchQuery && (
            <div className="search-status-bar">
              <span>Showing results for "<strong>{searchQuery}</strong>" ({filteredCountries.length} countries found)</span>
              <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>Clear Filter</button>
            </div>
          )}

          {/* Country Cards Grid */}
          <div className="countries-card-grid">
            {filteredCountries.map((country) => (
              <article key={country.id} className="country-card">
                {/* Image Banner */}
                <div className="country-card-media" onClick={() => setSelectedCountry(country)}>
                  <img src={country.heroImage} alt={country.name} loading="lazy" />
                  <div className="card-media-gradient" />
                  <span className="country-continent-chip">{country.continent}</span>
                  <div className="country-card-rating">
                    <span className="star">★</span> {country.rating}
                  </div>
                  <div className="country-card-title-overlay">
                    <span className="country-flag-icon">{country.flag}</span>
                    <div>
                      <h3 className="country-name-text">{country.name}</h3>
                      <span className="country-capital-text">Capital: {country.capital}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="country-card-body">
                  <p className="country-tagline-quote">“{country.tagline}”</p>

                  {/* Why It's The Best Feature Box */}
                  <div className="country-why-snippet">
                    <div className="why-label">
                      <span className="trophy-icon">🏆</span>
                      <span>WHY IT'S THE BEST:</span>
                    </div>
                    <p className="why-snippet-text">{country.whyBest.slice(0, 160)}...</p>
                  </div>

                  {/* Key Highlights Grid */}
                  <div className="country-quick-facts-row">
                    <div className="quick-fact-col">
                      <span className="fact-label">BEST SEASON</span>
                      <span className="fact-val">🌸 {country.bestSeason.months.split('&')[0]}</span>
                    </div>
                    <div className="quick-fact-col">
                      <span className="fact-label">DAILY BUDGET</span>
                      <span className="fact-val">💳 ~${country.dailyBudget.comfort}/day</span>
                    </div>
                    <div className="quick-fact-col">
                      <span className="fact-label">SAFETY INDEX</span>
                      <span className="fact-val">🛡️ {country.safetyScore}% Top Tier</span>
                    </div>
                  </div>

                  {/* Top Iconic Highlights preview */}
                  <div className="signature-highlights-list">
                    <span className="highlight-tag-item">
                      📍 {country.topAttractions[0]?.name.slice(0, 32)}...
                    </span>
                    <span className="highlight-tag-item">
                      🍜 {country.signatureDishes[0]?.name}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="country-card-actions">
                    <button
                      type="button"
                      className="btn-deep-dive"
                      onClick={() => setSelectedCountry(country)}
                      title={`Open complete ${country.name} dossier`}
                    >
                      <span>Deep Dive Dossier</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-quick-plan"
                      onClick={() => handlePlanTripToCountry(country.name)}
                      title={`Plan an expedition to ${country.name}`}
                    >
                      <span>Plan Trip</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredCountries.length === 0 && (
            <div className="empty-search-state">
              <span className="empty-icon">🔍</span>
              <h3>No destination match found for "{searchQuery}"</h3>
              <p>Try searching for countries like Japan, Switzerland, Italy, Bali, Iceland, or France.</p>
              <button type="button" className="btn-reset-filters" onClick={() => { setSearchQuery(''); setCountryFilter('All'); }}>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. WHOLE SITE FEATURES PREVIEW (ZERO ADMIN RELATED INFORMATION) */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section bg-contrast" id="platform-features-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">⚡ The Voyager Operating System</span>
            <h2 className="section-title">Everything You Need for Flawless Global Journeys</h2>
            <p className="section-subtitle">
              Built exclusively for independent travelers, couples, families, and expedition groups. 
              Say goodbye to scattered notes, static spreadsheets, and clunky ticket booking portals.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="feature-interactive-tabs">
            <button
              type="button"
              className={`feat-tab-btn ${activeFeatureTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('itinerary')}
            >
              <span className="feat-tab-icon">🗺️</span>
              <span>Itinerary Builder</span>
            </button>
            <button
              type="button"
              className={`feat-tab-btn ${activeFeatureTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('telemetry')}
            >
              <span className="feat-tab-icon">🛰️</span>
              <span>Live Telemetry Radar</span>
            </button>
            <button
              type="button"
              className={`feat-tab-btn ${activeFeatureTab === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('budget')}
            >
              <span className="feat-tab-icon">💳</span>
              <span>Smart Budget Crafter</span>
            </button>
            <button
              type="button"
              className={`feat-tab-btn ${activeFeatureTab === 'discovery' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('discovery')}
            >
              <span className="feat-tab-icon">🏙️</span>
              <span>Destination Catalog</span>
            </button>
          </div>

          {/* Interactive Feature Display Stage */}
          <div className="feature-stage-container">
            {/* 1. ITINERARY BUILDER PREVIEW */}
            {activeFeatureTab === 'itinerary' && (
              <div className="feature-pane-layout">
                <div className="feature-text-side">
                  <span className="pane-badge">DYNAMIC ROUTING ENGINE</span>
                  <h3>Craft Multi-City Routes with Seamless Visual Draggable Flow</h3>
                  <p>
                    Structure every day of your expedition with ease. Connect cities via high-speed bullet trains, 
                    scenic flights, or private chauffeur road trips with automated travel time estimates and hotel stay tracking.
                  </p>
                  <ul className="feature-bullets">
                    <li><strong>Day-by-Day Precision:</strong> Schedule activities, restaurant reservations, and landmark entries.</li>
                    <li><strong>Multi-Modal Transit:</strong> Direct linkages for Flights, High-Speed Trains, Ferries, and Chauffeur SUVs.</li>
                    <li><strong>1-Click AI Route Optimizer:</strong> Reorganize waypoints to minimize travel fatigue and cost.</li>
                  </ul>
                  <button type="button" className="btn-feature-cta" onClick={() => setShowSignInModal(true)}>
                    <span>Launch Itinerary Builder</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <div className="feature-visual-side">
                  <div className="visual-mockup-card itinerary-mockup">
                    <div className="mockup-header-bar">
                      <span className="mockup-pill-status">Active Expedition Route</span>
                      <span className="mockup-meta">Tokyo → Kyoto → Osaka (9 Days)</span>
                    </div>

                    <div className="mockup-timeline">
                      <div className="timeline-node">
                        <div className="node-marker">1</div>
                        <div className="node-content">
                          <div className="node-top">
                            <h4>Tokyo (3 Days)</h4>
                            <span className="cost-tag">$190/day</span>
                          </div>
                          <p>Shibuya Crossing • Meiji Shrine • Shinjuku Golden Gai</p>
                        </div>
                      </div>

                      <div className="transit-link-card">
                        <span className="transit-icon">🚄</span>
                        <div className="transit-details">
                          <strong>Tokaido Shinkansen Bullet Train (Nozomi)</strong>
                          <span>Tokyo Station → Kyoto Station • 2h 15m @ 285 km/h</span>
                        </div>
                      </div>

                      <div className="timeline-node">
                        <div className="node-marker">2</div>
                        <div className="node-content">
                          <div className="node-top">
                            <h4>Kyoto (4 Days)</h4>
                            <span className="cost-tag">$150/day</span>
                          </div>
                          <p>Fushimi Inari Torii Gates • Arashiyama Bamboo • Traditional Ryokan Onsen</p>
                        </div>
                      </div>

                      <div className="transit-link-card">
                        <span className="transit-icon">🚆</span>
                        <div className="transit-details">
                          <strong>JR Special Rapid Service</strong>
                          <span>Kyoto → Osaka Dotonbori • 28 mins non-stop</span>
                        </div>
                      </div>

                      <div className="timeline-node">
                        <div className="node-marker">3</div>
                        <div className="node-content">
                          <div className="node-top">
                            <h4>Osaka (2 Days)</h4>
                            <span className="cost-tag">$140/day</span>
                          </div>
                          <p>Osaka Castle • Sizzling Takoyaki Street Feast • Shinsekai Neon Tower</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LIVE TELEMETRY RADAR PREVIEW */}
            {activeFeatureTab === 'telemetry' && (
              <div className="feature-pane-layout">
                <div className="feature-text-side">
                  <span className="pane-badge">SATELLITE & TRANSIT CHANNELS</span>
                  <h3>Real-Time Live Trip Radar & Satellite Telemetry</h3>
                  <p>
                    Experience active voyage monitoring. Live telemetry links your flight boarding gates, 
                    scenic train altitude, live local weather barometers, and road conditions in one heads-up display.
                  </p>
                  <ul className="feature-bullets">
                    <li><strong>Flight Tracking Telemetry:</strong> Live altitudes, ground speeds, gate changes, and carousel baggage alerts.</li>
                    <li><strong>Meteorological Radar:</strong> 7-day microclimate forecasts tailored for your scheduled outdoor stops.</li>
                    <li><strong>Satellite GPS Waypoints:</strong> Visual waypoint navigation along every kilometer of your journey.</li>
                  </ul>
                  <button type="button" className="btn-feature-cta" onClick={() => setShowSignInModal(true)}>
                    <span>View Live Radar Stream</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <div className="feature-visual-side">
                  <div className="visual-mockup-card telemetry-mockup">
                    <div className="telemetry-hud-top">
                      <div className="hud-signal">
                        <span className="signal-dot pulsing" />
                        <span>SATELLITE TELEMETRY LOCKED</span>
                      </div>
                      <span className="hud-clock">08:42:15 UTC</span>
                    </div>

                    <div className="telemetry-status-grid">
                      <div className="telemetry-metric-tile">
                        <span className="tile-label">CURRENT WAYPOINT</span>
                        <h4 className="tile-value">Flight 6E-204</h4>
                        <span className="tile-sub">Airbus A320neo • In-Flight</span>
                      </div>
                      <div className="telemetry-metric-tile">
                        <span className="tile-label">ALTITUDE & SPEED</span>
                        <h4 className="tile-value">31,000 ft</h4>
                        <span className="tile-sub">780 km/h Ground Cruise</span>
                      </div>
                      <div className="telemetry-metric-tile">
                        <span className="tile-label">DESTINATION WEATHER</span>
                        <h4 className="tile-value">29°C Sunny</h4>
                        <span className="tile-sub">Udaipur • 0% Rain Probability</span>
                      </div>
                      <div className="telemetry-metric-tile">
                        <span className="tile-label">TRANSIT STATUS</span>
                        <h4 className="tile-value status-good">ON SCHEDULE</h4>
                        <span className="tile-sub">ETA 09:55 AM (0 min delay)</span>
                      </div>
                    </div>

                    <div className="radar-visual-strip">
                      <div className="radar-sweep-line" />
                      <div className="radar-plane-icon">✈️</div>
                      <span className="radar-label">Approaching Aravalli Range Approach Corridor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SMART BUDGET CRAFTER PREVIEW */}
            {activeFeatureTab === 'budget' && (
              <div className="feature-pane-layout">
                <div className="feature-text-side">
                  <span className="pane-badge">FINANCIAL TRANSPARENCY</span>
                  <h3>Smart Budget Crafter & Multi-Currency Ledger</h3>
                  <p>
                    Never experience post-trip budget shock. Trovio organizes your projected vs actual expenses 
                    across flights, stays, gastronomy, experiences, and shopping with real-time multi-currency conversion.
                  </p>
                  <ul className="feature-bullets">
                    <li><strong>Category Cost Breakdown:</strong> Visual donut charts highlighting lodging, dining, and transit ratios.</li>
                    <li><strong>Multi-Currency Support:</strong> Log expenses in local currency (¥ JPY, CHF, € EUR) and view in your home currency.</li>
                    <li><strong>Daily Spending Burn-Rate:</strong> Real-time alerts when daily spending approaches your target cap.</li>
                  </ul>
                  <button type="button" className="btn-feature-cta" onClick={() => setShowSignInModal(true)}>
                    <span>Craft Your Budget</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <div className="feature-visual-side">
                  <div className="visual-mockup-card budget-mockup">
                    <div className="budget-mockup-header">
                      <div>
                        <span className="mockup-label">EXPEDITION BUDGET TOTAL</span>
                        <h3 className="mockup-budget-amount">$3,450.00</h3>
                      </div>
                      <span className="badge-saved">Safe Zone (72% Allocated)</span>
                    </div>

                    <div className="budget-progress-bar-wrap">
                      <div className="bar-segment stays" style={{ width: '40%' }} title="Stays 40%" />
                      <div className="bar-segment flights" style={{ width: '25%' }} title="Flights 25%" />
                      <div className="bar-segment dining" style={{ width: '20%' }} title="Dining 20%" />
                      <div className="bar-segment activities" style={{ width: '15%' }} title="Activities 15%" />
                    </div>

                    <div className="budget-category-list">
                      <div className="category-item">
                        <span className="cat-color-dot stays" />
                        <span className="cat-name">Hotels & Stays</span>
                        <span className="cat-amt">$1,380</span>
                      </div>
                      <div className="category-item">
                        <span className="cat-color-dot flights" />
                        <span className="cat-name">Flights & Rail Passes</span>
                        <span className="cat-amt">$862</span>
                      </div>
                      <div className="category-item">
                        <span className="cat-color-dot dining" />
                        <span className="cat-name">Gastronomy & Dining</span>
                        <span className="cat-amt">$690</span>
                      </div>
                      <div className="category-item">
                        <span className="cat-color-dot activities" />
                        <span className="cat-name">Excursions & Entry Passes</span>
                        <span className="cat-amt">$518</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DESTINATION & ACTIVITY CATALOG */}
            {activeFeatureTab === 'discovery' && (
              <div className="feature-pane-layout">
                <div className="feature-text-side">
                  <span className="pane-badge">CURATED ATLAS</span>
                  <h3>Vetted Global Destinations & Hand-Selected Activities</h3>
                  <p>
                    Browse a curated encyclopedia of global cities, ancient heritage capitals, alpine valleys, 
                    and hidden island coves with verified prices, timing, and local tips.
                  </p>
                  <ul className="feature-bullets">
                    <li><strong>500+ Verified Cities:</strong> Average daily costs, climate barometers, and local cultural norms.</li>
                    <li><strong>Hand-Picked Experiences:</strong> Sunset boat voyages, architectural walking tours, and culinary masterclasses.</li>
                    <li><strong>Direct Itinerary Addition:</strong> Add any landmark or experience to your trip in a single tap.</li>
                  </ul>
                  <button type="button" className="btn-feature-cta" onClick={() => setShowSignInModal(true)}>
                    <span>Explore Destination Catalog</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <div className="feature-visual-side">
                  <div className="visual-mockup-card discovery-mockup">
                    <div className="catalog-preview-grid">
                      <div className="catalog-mini-card">
                        <img src="https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=400&q=80" alt="Udaipur" />
                        <div className="catalog-mini-info">
                          <h4>Udaipur, India</h4>
                          <span>Lake Pichola • $75/day</span>
                        </div>
                      </div>
                      <div className="catalog-mini-card">
                        <img src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80" alt="Zermatt" />
                        <div className="catalog-mini-info">
                          <h4>Zermatt, Switzerland</h4>
                          <span>Matterhorn • $240/day</span>
                        </div>
                      </div>
                      <div className="catalog-mini-card">
                        <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80" alt="Tokyo" />
                        <div className="catalog-mini-info">
                          <h4>Tokyo, Japan</h4>
                          <span>Shinjuku • $160/day</span>
                        </div>
                      </div>
                      <div className="catalog-mini-card">
                        <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" alt="Bali" />
                        <div className="catalog-mini-info">
                          <h4>Bali, Indonesia</h4>
                          <span>Ubud • $85/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 5. INTERACTIVE TRIP COST CALCULATOR WIDGET */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="trip-calculator-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">🧮 Instant Budget Intelligence</span>
            <h2 className="section-title">Interactive Voyage Cost Calculator</h2>
            <p className="section-subtitle">
              Configure your desired country, voyage duration, travel style, and party size to receive an instant, 
              realistic budget estimate including flights, boutique hotels, dining, and landmark admissions.
            </p>
          </div>

          <div className="calculator-widget-card">
            {/* Left Controls */}
            <div className="calc-controls-col">
              {/* Select Country */}
              <div className="calc-field-group">
                <label>SELECT DESTINATION COUNTRY</label>
                <div className="calc-country-select-wrapper">
                  <select 
                    value={calcCountryId} 
                    onChange={(e) => setCalcCountryId(e.target.value)}
                    className="calc-select"
                  >
                    {COUNTRIES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} ({c.continent})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trip Duration Controls */}
              <div className="calc-field-group">
                <div className="slider-label-row">
                  <label htmlFor="expedition-duration-range">EXPEDITION DURATION</label>
                  <div className="duration-counter-control">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setCalcDays((prev) => Math.max(3, prev - 1))}
                      disabled={calcDays <= 3}
                      aria-label="Decrease duration by 1 day"
                      title="Decrease by 1 day"
                    >
                      −
                    </button>
                    <span className="slider-val-badge">
                      <strong>{calcDays}</strong> {calcDays === 1 ? 'Day' : 'Days'}
                    </span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setCalcDays((prev) => Math.min(28, prev + 1))}
                      disabled={calcDays >= 28}
                      aria-label="Increase duration by 1 day"
                      title="Increase by 1 day"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Range Slider with Exact Active Fill Track */}
                <div className="slider-track-wrap">
                  <input
                    id="expedition-duration-range"
                    type="range"
                    min="3"
                    max="28"
                    step="1"
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="calc-range-slider"
                    style={{
                      background: `linear-gradient(to right, #8178E8 0%, #A678BD ${((calcDays - 3) / 25) * 100}%, #E8E2F0 ${((calcDays - 3) / 25) * 100}%, #E8E2F0 100%)`
                    }}
                    aria-label="Expedition Duration in Days"
                  />
                </div>

                {/* Quick-Select Duration Preset Chips */}
                <div className="duration-preset-chips" role="group" aria-label="Duration Presets">
                  {[
                    { days: 3, label: '3D Weekend' },
                    { days: 7, label: '7D Week' },
                    { days: 10, label: '10D Tour' },
                    { days: 14, label: '14D 2 Weeks' },
                    { days: 21, label: '21D 3 Weeks' },
                    { days: 28, label: '28D Month' }
                  ].map((preset) => {
                    const isSelected = calcDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        className={`duration-preset-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setCalcDays(preset.days)}
                        title={`Select ${preset.days} days`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style Buttons */}
              <div className="calc-field-group">
                <label>TRAVEL COMFORT TIER</label>
                <div className="calc-style-toggle-group">
                  <button
                    type="button"
                    className={`style-toggle-btn ${calcStyle === 'backpacker' ? 'active' : ''}`}
                    onClick={() => setCalcStyle('backpacker')}
                  >
                    <span className="toggle-icon">🎒</span>
                    <span className="toggle-title">Backpacker</span>
                    <span className="toggle-price">${calcCountry.dailyBudget.backpacker}/day</span>
                  </button>

                  <button
                    type="button"
                    className={`style-toggle-btn ${calcStyle === 'comfort' ? 'active' : ''}`}
                    onClick={() => setCalcStyle('comfort')}
                  >
                    <span className="toggle-icon">🏨</span>
                    <span className="toggle-title">Balanced Explorer</span>
                    <span className="toggle-price">${calcCountry.dailyBudget.comfort}/day</span>
                  </button>

                  <button
                    type="button"
                    className={`style-toggle-btn ${calcStyle === 'luxury' ? 'active' : ''}`}
                    onClick={() => setCalcStyle('luxury')}
                  >
                    <span className="toggle-icon">✨</span>
                    <span className="toggle-title">Luxury VIP</span>
                    <span className="toggle-price">${calcCountry.dailyBudget.luxury}/day</span>
                  </button>
                </div>
              </div>

              {/* Number of Voyagers */}
              <div className="calc-field-group">
                <label>PARTY SIZE</label>
                <div className="calc-travelers-picker">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      className={`traveler-btn ${calcTravelers === num ? 'active' : ''}`}
                      onClick={() => setCalcTravelers(num)}
                    >
                      {num === 1 ? '👤 Solo' : num === 2 ? '👥 Couple' : `👥 ${num} Voyagers`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Results Display */}
            <div className="calc-results-col">
              <div className="results-header">
                <span className="results-country-badge">
                  {calcCountry.flag} {calcCountry.name} • {calcDays} Days for {calcTravelers} {calcTravelers === 1 ? 'Person' : 'People'}
                </span>
                <div className="results-grand-total">
                  <span className="currency-sign">$</span>
                  <span className="total-amount">{estimatedCost.grandTotal.toLocaleString()}</span>
                  <span className="total-sub">Total Estimated Cost</span>
                </div>
                <div className="per-person-pill">
                  Estimated <strong>${estimatedCost.perPerson.toLocaleString()}</strong> per traveler (${estimatedCost.dailyRate}/day baseline)
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="results-breakdown-list">
                <h4>ESTIMATED ALLOCATION BREAKDOWN</h4>
                <div className="breakdown-row">
                  <span className="breakdown-name">🏨 Stays & Accommodations</span>
                  <span className="breakdown-val">${estimatedCost.lodging.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-name">✈️ Flights & Ground Transit</span>
                  <span className="breakdown-val">${estimatedCost.transit.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-name">🍜 Dining & Authentic Gastronomy</span>
                  <span className="breakdown-val">${estimatedCost.dining.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-name">🏛️ Guided Tours & Admissions</span>
                  <span className="breakdown-val">${estimatedCost.activities.toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <div className="calc-cta-wrap">
                <button
                  type="button"
                  className="btn-calc-lockin"
                  onClick={() => setShowSignInModal(true)}
                >
                  <span>Save & Build {calcCountry.name} Itinerary</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <span className="calc-footnote">
                  *Estimates calculated from live historical costs, seasonal adjustments, and verified voyager averages.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 6. COMPARISON: WHY VOYAGERS CHOOSE TROVIO */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section bg-contrast">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">⚖️ The Modern Travel Advantage</span>
            <h2 className="section-title">Why Voyagers Choose Trovio Over Spreadsheets</h2>
            <p className="section-subtitle">
              Planning complex multi-stop voyages across continents shouldn't require 15 browser tabs, 
              clunky Excel files, and disjointed confirmation emails.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-th">CAPABILITIES & WORKFLOW</th>
                  <th className="brand-th highlighted-col">
                    <div className="th-brand-title">Trovio GlobalTrotters</div>
                    <span className="th-brand-sub">AI Travel OS</span>
                  </th>
                  <th className="alt-th">Excel / Google Sheets</th>
                  <th className="alt-th">Generic Booking Portals</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Interactive Multi-City Drag & Drop</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ Seamless & Visual</span></td>
                  <td><span className="cross-badge">✗ Manual Rows & Text</span></td>
                  <td><span className="cross-badge">✗ Single Point Bookings</span></td>
                </tr>
                <tr>
                  <td><strong>Live Satellite & Flight Telemetry</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ Real-Time GPS & Weather</span></td>
                  <td><span className="cross-badge">✗ None (Static)</span></td>
                  <td><span className="cross-badge">✗ Email Confirmations Only</span></td>
                </tr>
                <tr>
                  <td><strong>Curated World Country Dossiers</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ In-Depth Verified Intel</span></td>
                  <td><span className="cross-badge">✗ Zero Context</span></td>
                  <td><span className="cross-badge">✗ Sponsored Hotel Ads</span></td>
                </tr>
                <tr>
                  <td><strong>Smart Multi-Currency Budget Ledger</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ Auto Rates & Categories</span></td>
                  <td><span className="partial-badge">~ Manual Math Formulas</span></td>
                  <td><span className="cross-badge">✗ Only Tracks Booked Items</span></td>
                </tr>
                <tr>
                  <td><strong>Community Itinerary Cloning</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ 1-Click Itinerary Duplicate</span></td>
                  <td><span className="cross-badge">✗ Copy-paste Mess</span></td>
                  <td><span className="cross-badge">✗ Non-Existent</span></td>
                </tr>
                <tr>
                  <td><strong>Zero Clutter / 100% Traveler Focused</strong></td>
                  <td className="highlighted-col"><span className="check-badge">✓ Clean, Ad-Free UI</span></td>
                  <td><span className="cross-badge">✗ Bland Spreadsheets</span></td>
                  <td><span className="cross-badge">✗ Popups & Upsells</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 7. TRAVEL DREAMSCAPE IMMERSIVE SHOWCASE */}
      {/* -------------------------------------------------------------------- */}
      <TravelDreamscape 
        onStartPlanning={(destinationName) => {
          setShowSignInModal(true);
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section bg-contrast" id="faq-section">
        <div className="section-container" style={{ maxWidth: '880px' }}>
          <div className="section-header-centered">
            <span className="section-pill-tag">❓ Clarity & Support</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Common questions answered about Trovio GlobalTrotters, country intelligence dossiers, and planning features.
            </p>
          </div>

          <div className="faq-accordion-list">
            {[
              {
                q: 'Is Trovio free for regular travelers to use?',
                a: 'Yes! Trovio is completely free to sign up, explore country dossiers, create multi-city itineraries, and calculate budgets. There are no hidden subscription paywalls for core voyage planning tools.'
              },
              {
                q: 'How do the "Best Countries" dossiers help me plan my trip?',
                a: 'Each dossier curates verified intelligence: why the country ranks among the best, signature bucket-list spots, optimal seasonal windows (with temperature breakdowns), authentic culinary specialties, and realistic daily budgets for Backpackers, Balanced Voyagers, and Luxury travelers.'
              },
              {
                q: 'Can I export or share my itinerary with travel companions?',
                a: 'Absolutely. Every trip created in Trovio can be exported, shared via a secure link with friends and family, or published to the Voyager Community so others can clone your route.'
              },
              {
                q: 'How does the Live Telemetry Radar work during my journey?',
                a: 'When you are traveling on an active trip, Trovio syncs with aviation flight schedules, GPS coordinate waypoints, and regional meteorology feeds to provide real-time updates on gate changes, transit speeds, and weather advisories.'
              },
              {
                q: 'Can I track multi-currency expenses for international trips?',
                a: 'Yes. You can log expenses in any local currency (such as Japanese Yen, Swiss Francs, Euros, or Indonesian Rupiah), and Trovio automatically converts and totals them against your primary home currency preference.'
              },
              {
                q: 'Is my personal travel information kept private and secure?',
                a: 'Yes. All personal itineraries and profile information are strictly private by default. You retain complete control over whether you choose to share a trip publicly or keep it strictly for yourself and invited companions.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="faq-question-row">
                  <h4>{faq.q}</h4>
                  <span className="faq-toggle-icon">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <div className="faq-answer-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 9. HIGH-IMPACT BOTTOM CALL TO ACTION */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <span className="cta-pill">🚀 START YOUR JOURNEY TODAY</span>
          <h2>Ready to Explore the World’s Greatest Wonders?</h2>
          <p>
            Join 25,000+ passionate global voyagers. Build your custom multi-city itinerary, 
            unlock deep-dive country dossiers, and travel with confidence.
          </p>

          <div className="cta-action-buttons">
            <button
              type="button"
              className="btn-cta-primary"
              onClick={() => setShowRegisterModal(true)}
            >
              <span>Create Free Account</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {/* Prominent CTA Sign In Button */}
            <button
              type="button"
              className="btn-cta-secondary"
              onClick={() => setShowSignInModal(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In to Existing Trips</span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 10. PUBLIC SITE FOOTER (100% NON-ADMIN) */}
      {/* -------------------------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="footer-top-container">
          <div className="footer-brand-col">
            <AnimatedLogo size="md" title="GlobalTrotter" badge="Island Explorer" className="footer-animated-logo" />
            <p className="footer-brand-desc">
              The modern intelligent operating system for global voyagers. 
              Designed for effortless multi-city itinerary building, live telemetry monitoring, 
              and authentic country discovery across all seven continents.
            </p>
            <div className="footer-trust-chips">
              <span>⭐️ 4.96/5 Star Rating</span>
              <span>🔒 256-Bit SSL Encryption</span>
              <span>🌿 Sustainable Travel</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>TOP COUNTRIES</h4>
            <ul>
              {COUNTRIES_DATA.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setSelectedCountry(c)} className="footer-link-btn">
                    {c.flag} {c.name} Guide
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>PLATFORM FEATURES</h4>
            <ul>
              <li><a href="#platform-features-section" onClick={() => setActiveFeatureTab('itinerary')}>Itinerary Builder</a></li>
              <li><a href="#platform-features-section" onClick={() => setActiveFeatureTab('telemetry')}>Live Telemetry Radar</a></li>
              <li><a href="#platform-features-section" onClick={() => setActiveFeatureTab('budget')}>Smart Budget Crafter</a></li>
              <li><a href="#platform-features-section" onClick={() => setActiveFeatureTab('discovery')}>Destinations & Cities</a></li>
              <li><a href="#trip-calculator-section">Trip Cost Calculator</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>VOYAGER RESOURCES</h4>
            <ul>
              <li><button type="button" onClick={() => setShowSignInModal(true)} className="footer-link-btn">Sign In to Dashboard</button></li>
              <li><button type="button" onClick={() => setShowRegisterModal(true)} className="footer-link-btn">Join GlobalTrotter</button></li>
              <li><a href="#faq-section">Traveler Help & FAQ</a></li>
              <li><a href="#travel-dreamscape-section">Travel Dreamscape</a></li>
              <li><a href="#best-countries-section">Best Season Guides</a></li>
              <li><span className="status-live-indicator">● System Status: All Systems Operational</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <span className="copyright-text">
              © {new Date().getFullYear()} GlobalTrotter Inc. Built for fearless explorers worldwide.
            </span>
            <div className="footer-legal-links">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Traveler Safety</span>
              <span>•</span>
              <span>Cookie Preferences</span>
            </div>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* 11. COUNTRY DEEP-DIVE MODAL */}
      {/* -------------------------------------------------------------------- */}
      {selectedCountry && (
        <CountryDossierModal
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onPlanTrip={handlePlanTripToCountry}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 12. SIGN-IN MODAL (INCLUDES ALL EXISTING AUTH, GOOGLE DEMO, ETC.) */}
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
      {/* 13. REGISTER MODAL */}
      {/* -------------------------------------------------------------------- */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={(newUser) => {
          setShowRegisterModal(false);
          onSignInSuccess(newUser);
        }}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 14. 3D ISLAND EXPEDITION VIDEO TOUR MODAL */}
      {/* -------------------------------------------------------------------- */}
      {showVideoModal && (
        <div className="sunset-video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="sunset-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🌅</span>
                <h3>GlobalTrotter 3D Island & AI Voyage Experience</h3>
              </div>
              <button 
                type="button"
                className="video-modal-close-btn" 
                onClick={() => setShowVideoModal(false)}
                aria-label="Close video modal"
              >
                ✕
              </button>
            </div>
            <div className="video-modal-body">
              <div className="video-preview-hero-frame">
                <img src="/lavender_travel_hero.jpg" alt="Voyage Tour Lavender Glassmorphism Preview" />
                <div className="video-preview-overlay-info">
                  <h4 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Lavender Glassmorphism Explorer</h4>
                  <p style={{ fontSize: '15px', opacity: 0.95, lineHeight: 1.5 }}>
                    Personalized multi-city route visualization, live flight & road telemetry radar, dynamic budget crafter, and verified destination travel communities.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button 
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => { setShowVideoModal(false); setShowRegisterModal(true); }}
                >
                  Join Free & Explore Destinations 🌴
                </button>
                <button 
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => setShowVideoModal(false)}
                >
                  Close Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
