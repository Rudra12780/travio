import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { COUNTRIES_DATA, CountryDossier } from '../data/countryData';
import { CountryDossierModal } from './CountryDossierModal';
import { SignIn } from './SignIn';
import { RegisterModal } from './RegisterModal';

interface Props {
  onSignInSuccess: (user: UserProfile) => void;
}

export const LandingPage: React.FC<Props> = ({ onSignInSuccess }) => {
  // Navigation & Modal State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryDossier | null>(null);

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
  const [activeFeatureTab, setActiveFeatureTab] = useState<'itinerary' | 'telemetry' | 'budget' | 'discovery' | 'community'>('itinerary');

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
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="brand-logo-text">
              <span className="logo-title">Trovio</span>
              <span className="logo-badge">GlobalTrotters</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="landing-desktop-nav" aria-label="Landing Navigation">
            <a href="#best-countries-section" className="nav-anchor-link">
              <span className="nav-link-icon">🌍</span> Best Countries
            </a>
            <a href="#platform-features-section" className="nav-anchor-link">
              <span className="nav-link-icon">⚡</span> Site Features
            </a>
            <a href="#trip-calculator-section" className="nav-anchor-link">
              <span className="nav-link-icon">🧮</span> Cost Calculator
            </a>
            <a href="#voyager-reviews-section" className="nav-anchor-link">
              <span className="nav-link-icon">💬</span> Reviews
            </a>
            <a href="#faq-section" className="nav-anchor-link">
              <span className="nav-link-icon">❓</span> FAQ
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
      {/* 2. HERO SECTION */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-hero-section">
        <div className="hero-content-wrapper">
          {/* Trust Pill */}
          <div className="hero-announcement-pill">
            <span className="pulsing-live-dot" />
            <span className="pill-text">AI Voyage Intelligence & Real-Time Satellite Telemetry</span>
            <span className="pill-chip">v2.4 Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-main-title">
            Explore the World’s <span className="gradient-text">Pinnacle Destinations</span> with Intelligent Planning
          </h1>

          {/* Subtitle */}
          <p className="hero-subtext">
            Immerse yourself in in-depth country dossiers, craft multi-city itineraries with drag-and-drop ease, 
            track live flight and road telemetry, and budget seamlessly with over 25,000+ fearless voyagers worldwide.
          </p>

          {/* Interactive Search Bar Box */}
          <form className="hero-search-glass-card" onSubmit={handleHeroSearch}>
            <div className="search-field-group">
              <span className="field-icon">📍</span>
              <div className="field-inputs">
                <label>DESTINATION OR COUNTRY</label>
                <input
                  type="text"
                  placeholder="e.g. Japan, Switzerland, Italy, Bali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="search-divider-vertical" />

            <div className="search-field-group">
              <span className="field-icon">🌸</span>
              <div className="field-inputs">
                <label>SEASON / TIMING</label>
                <select onChange={(e) => setSearchQuery(e.target.value)}>
                  <option value="">Any Travel Season</option>
                  <option value="Cherry Blossom">Spring Cherry Blossoms (Hanami)</option>
                  <option value="Summer">Summer Sun & Alpine Trails</option>
                  <option value="Autumn">Autumn Foliage (Koyo & Wine)</option>
                  <option value="Northern Lights">Winter Snow & Northern Lights</option>
                </select>
              </div>
            </div>

            <div className="search-divider-vertical" />

            <div className="search-field-group">
              <span className="field-icon">🎒</span>
              <div className="field-inputs">
                <label>VOYAGE STYLE</label>
                <select onChange={(e) => {
                  if (e.target.value) setCountryFilter(e.target.value);
                }}>
                  <option value="All">All Travel Styles</option>
                  <option value="Europe">European Grand Culture</option>
                  <option value="Asia">Asian Metropolises & Shrines</option>
                  <option value="Islands">Tropical Island Escapes</option>
                  <option value="Nordic">Nordic & Glacial Wilderness</option>
                  <option value="Adventure">Outdoor Adrenaline & Trekking</option>
                </select>
              </div>
            </div>

            <button type="submit" className="hero-search-submit-btn">
              <span>Explore Guides</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Social Proof & Hero Highlights */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <div className="star-row">★★★★★</div>
              <span className="trust-label"><strong>4.96 / 5.0</strong> from 34,000+ Voyagers</span>
            </div>
            <div className="trust-item-divider" />
            <div className="trust-item">
              <span className="trust-icon-badge">🌍</span>
              <span className="trust-label"><strong>120+ Countries</strong> Mapped & Verified</span>
            </div>
            <div className="trust-item-divider" />
            <div className="trust-item">
              <span className="trust-icon-badge">🛰️</span>
              <span className="trust-label"><strong>Live Telemetry Radar</strong> Flight & Road Channels</span>
            </div>
            <div className="trust-item-divider" />
            <div className="trust-item">
              <span className="trust-icon-badge">🛡️</span>
              <span className="trust-label"><strong>Zero Admin Overhead</strong> 100% Traveler Focused</span>
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
            <button
              type="button"
              className={`feat-tab-btn ${activeFeatureTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('community')}
            >
              <span className="feat-tab-icon">🤝</span>
              <span>Voyager Community</span>
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

            {/* 5. VOYAGER COMMUNITY */}
            {activeFeatureTab === 'community' && (
              <div className="feature-pane-layout">
                <div className="feature-text-side">
                  <span className="pane-badge">VOYAGER SOCIAL FEED</span>
                  <h3>Connect, Share Journals, and Clone Proven Itineraries</h3>
                  <p>
                    Join an authentic community of global explorers. Browse public trip journals, view verified 
                    traveler photographs, and clone complete multi-day itineraries into your own dashboard with 1-click.
                  </p>
                  <ul className="feature-bullets">
                    <li><strong>Community Itinerary Cloning:</strong> Duplicate vetted travel plans directly into your planner.</li>
                    <li><strong>Insider Recommendations:</strong> Real tips from travelers who just returned from the route.</li>
                    <li><strong>Photo Journals & Reviews:</strong> High-resolution voyager albums with zero sponsored noise.</li>
                  </ul>
                  <button type="button" className="btn-feature-cta" onClick={() => setShowSignInModal(true)}>
                    <span>Join Voyager Community</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <div className="feature-visual-side">
                  <div className="visual-mockup-card community-mockup">
                    <div className="community-post-preview">
                      <div className="post-author-row">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="Elena" className="author-avatar" />
                        <div>
                          <strong>Elena Rostova</strong>
                          <span>Completed 12-day Swiss Alpine Circuit • 3 hours ago</span>
                        </div>
                        <span className="badge-verified">Verified Voyager</span>
                      </div>
                      <p className="post-text">
                        "The Glacier Express from St. Moritz to Zermatt was completely magical! 
                        Following Trovio's recommendation to reserve seats in the panorama car on the left side made all the difference."
                      </p>
                      <div className="post-tags-row">
                        <span>🏔️ Zermatt</span>
                        <span>🫕 Fondue in Bern</span>
                        <span>🚂 Swiss Travel Pass</span>
                      </div>
                      <div className="post-stats-row">
                        <span>❤️ 412 Likes</span>
                        <span>💬 64 Comments</span>
                        <span className="clone-btn-inline">📋 128 Voyagers Cloned This Trip</span>
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

              {/* Trip Duration Slider */}
              <div className="calc-field-group">
                <div className="slider-label-row">
                  <label>EXPEDITION DURATION</label>
                  <span className="slider-val-badge"><strong>{calcDays} Days</strong></span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="28"
                  value={calcDays}
                  onChange={(e) => setCalcDays(Number(e.target.value))}
                  className="calc-range-slider"
                />
                <div className="slider-ticks">
                  <span>3 Days (Weekend)</span>
                  <span>7 Days (Week)</span>
                  <span>14 Days (Two Weeks)</span>
                  <span>28 Days (Month)</span>
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
      {/* 7. VOYAGER TESTIMONIALS & REVIEWS */}
      {/* -------------------------------------------------------------------- */}
      <section className="landing-section" id="voyager-reviews-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">💬 Real Voyager Stories</span>
            <h2 className="section-title">Loved by Explorers in 120+ Countries</h2>
            <p className="section-subtitle">
              Read how fellow travelers planned their dream honeymoons, solo backpacking adventures, 
              and multi-generational family expeditions with Trovio.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-quote">
                “Trovio replaced the nightmare of coordinating our 3-week Japan itinerary. The Shinkansen bullet train 
                transit connectors and automated budget breakdowns saved us over $800 in unexpected transit fees!”
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" alt="Marcus Vance" />
                <div>
                  <h4>Marcus & Claire Vance</h4>
                  <span>Tokyo, Kyoto & Osaka (21-Day Voyage)</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-quote">
                “The Switzerland country dossier was spot-on! Having the Swiss Travel Pass tips, Gornergrat cogwheel train 
                times, and fondue tavern recommendations already organized made our Zermatt stay completely unforgettable.”
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" alt="Sophia Laurent" />
                <div>
                  <h4>Sophia Laurent</h4>
                  <span>Zurich, Interlaken & Zermatt (10-Day Voyage)</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-quote">
                “As a solo backpacker doing the Ring Road in Iceland, the live telemetry radar was a lifesaver. Being able to 
                monitor weather alerts and road closures alongside my campervan budget gave me total peace of mind.”
              </p>
              <div className="testimonial-user">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" alt="Liam Davies" />
                <div>
                  <h4>Liam Davies</h4>
                  <span>Iceland Ring Road Camper Expedition (14 Days)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <span className="footer-logo-title">Trovio GlobalTrotters</span>
            </div>
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
              <li><a href="#platform-features-section" onClick={() => setActiveFeatureTab('community')}>Voyager Community Feed</a></li>
              <li><a href="#trip-calculator-section">Trip Cost Calculator</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>VOYAGER RESOURCES</h4>
            <ul>
              <li><button type="button" onClick={() => setShowSignInModal(true)} className="footer-link-btn">Sign In to Dashboard</button></li>
              <li><button type="button" onClick={() => setShowRegisterModal(true)} className="footer-link-btn">Join GlobalTrotters</button></li>
              <li><a href="#faq-section">Traveler Help & FAQ</a></li>
              <li><a href="#voyager-reviews-section">Verified Reviews</a></li>
              <li><a href="#best-countries-section">Best Season Guides</a></li>
              <li><span className="status-live-indicator">● System Status: All Systems Operational</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <span className="copyright-text">
              © {new Date().getFullYear()} Trovio GlobalTrotters Inc. Built for fearless explorers worldwide.
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
    </div>
  );
};
