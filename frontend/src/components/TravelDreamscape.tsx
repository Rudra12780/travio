import React, { useState, useEffect, useRef } from 'react';

export interface DreamscapeDestination {
  id: string;
  title: string;
  realmName: string;
  country: string;
  countryFlag: string;
  coordinates: string;
  category: 'aurora' | 'zen' | 'alpine' | 'ocean' | 'desert';
  image: string;
  heroImage: string;
  description: string;
  quote: string;
  voyagerName: string;
  voyagerRole: string;
  wonderScore: number;
  stargazingRating: string;
  tranquilityLevel: string;
  magicHour: string;
  soundscapeName: string;
  soundscapeFrequencies: [number, number, number];
  tags: string[];
  signatureRoute: string;
}

const DREAMSCAPES: DreamscapeDestination[] = [
  {
    id: 'norway-aurora',
    title: 'The Celestial Veil',
    realmName: 'Tromsø & Senja Glacial Fjords',
    country: 'Norway',
    countryFlag: '🇳🇴',
    coordinates: '69.6492° N, 18.9553° E',
    category: 'aurora',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1600&q=85',
    description: 'Emerald and violet solar ribbons swirling across frozen fjord peaks, reflected over crystal glacial waters where silence reigns supreme.',
    quote: 'Standing beneath the Norwegian auroras with Trovio’s live geomagnetic radar felt like slipping beyond the edge of earth into a living dream.',
    voyagerName: 'Elena Rostova',
    voyagerRole: 'Arctic Expeditionist • 14-Day Winter Route',
    wonderScore: 99.8,
    stargazingRating: 'Bortle Class 1 (Zero Light Pollution)',
    tranquilityLevel: '99% Pure Serenity',
    magicHour: '21:30 - 02:45 UTC',
    soundscapeName: 'Polar Wind & Aurora Harmonic Chimes',
    soundscapeFrequencies: [174, 285, 396],
    tags: ['Arctic Aurora', 'Glacial Fjord', 'Polar Glass Igloos', 'Whale Fjords'],
    signatureRoute: 'Tromsø Cableway → Sommarøy Archipelago → Senja Peaks'
  },
  {
    id: 'switzerland-alpine',
    title: 'Valley of 72 Waterfalls',
    realmName: 'Lauterbrunnen & Jungfrau Massif',
    country: 'Switzerland',
    countryFlag: '🇨🇭',
    coordinates: '46.5935° N, 7.9090° E',
    category: 'alpine',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=85',
    description: 'Vertical limestone cliffs shrouded in glacial mist, where Staubbach cascades drop 300 meters into emerald valley meadows studded with timber chalets.',
    quote: 'The Swiss alpine dossier curated our Gornergrat cogwheel train and cliffside tavern stops so flawlessly. Lauterbrunnen felt like a storybook realm.',
    voyagerName: 'Marcus & Sophia Laurent',
    voyagerRole: 'Alpine Voyagers • 10-Day Bernese Oberland Journey',
    wonderScore: 99.4,
    stargazingRating: 'High-Altitude Alpine Clarity',
    tranquilityLevel: '96% Alpine Bliss',
    magicHour: '06:15 - 09:30 (Morning Dew)',
    soundscapeName: 'Glacial Torrent & Alpine Meadow Echoes',
    soundscapeFrequencies: [216, 432, 528],
    tags: ['Glacial Cascades', 'Timber Chalets', 'Cogwheel Railways', 'Wild Edelweiss'],
    signatureRoute: 'Lauterbrunnen Valley → Wengen Cliffpath → Jungfraujoch Summit'
  },
  {
    id: 'japan-zen',
    title: 'Whispering Bamboo & Sacred Torii',
    realmName: 'Kyoto Arashiyama & Fushimi Mist',
    country: 'Japan',
    countryFlag: '🇯🇵',
    coordinates: '35.0116° N, 135.6778° E',
    category: 'zen',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
    description: 'Towering jade bamboo stalks groaning gently in the mountain breeze, lantern-lit moss pathways leading to ancient wooden teahouses at dawn.',
    quote: 'We stepped into the Arashiyama bamboo grove at 6:15 AM before the world woke up. The soft wind through the stalks and moss scent was pure meditation.',
    voyagerName: 'Kenji & Claire Vance',
    voyagerRole: 'Cultural Voyagers • 21-Day Honshu Odyssey',
    wonderScore: 98.9,
    stargazingRating: 'Temple Garden Moonrise (Zen Glow)',
    tranquilityLevel: '98% Mindful Stillness',
    magicHour: '05:45 - 08:00 (Misty Dawn)',
    soundscapeName: 'Bamboo Grove Wind & Zen Temple Gong',
    soundscapeFrequencies: [144, 288, 432],
    tags: ['Bamboo Canopy', 'Vermilion Torii', 'Moss Temples', 'Matcha Pavilions'],
    signatureRoute: 'Sagano Romantic Train → Tenryū-ji Zen Garden → Gion Evening Walk'
  },
  {
    id: 'greece-caldera',
    title: 'Cascading Sapphire Caldera',
    realmName: 'Oia & Imerovigli Volcanic Heights',
    country: 'Greece',
    countryFlag: '🇬🇷',
    coordinates: '36.4618° N, 25.3753° E',
    category: 'ocean',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=85',
    description: 'Blinding white Cycladic cubist villas sculpted into towering volcanic rock, hovering 300 meters above the indigo Aegean Sea bathed in golden sunset.',
    quote: 'Watching the Mediterranean melt into pastel gold from our caldera terrace in Imerovigli, with our entire ferry route mapped in Trovio... absolute heaven.',
    voyagerName: 'Aria & Matteo Rossi',
    voyagerRole: 'Cyclades Voyagers • 9-Day Aegean Escape',
    wonderScore: 99.1,
    stargazingRating: 'Aegean Maritime Horizon & Island Lights',
    tranquilityLevel: '94% Coastal Euphoria',
    magicHour: '19:15 - 20:45 (Golden Hour)',
    soundscapeName: 'Caldera Ocean Swell & Warm Aegean Breeze',
    soundscapeFrequencies: [194, 388, 582],
    tags: ['Volcanic Caldera', 'Cobalt Domes', 'Infinity Terraces', 'Aegean Golden Hour'],
    signatureRoute: 'Fira to Oia Cliffside Trail → Ammoudi Bay Sunset → Akrotiri Ruins'
  },
  {
    id: 'cappadocia-balloons',
    title: 'Kingdom of Floating Skies',
    realmName: 'Göreme Valley & Fairy Chimneys',
    country: 'Turkey',
    countryFlag: '🇹🇷',
    coordinates: '38.6431° N, 34.8289° E',
    category: 'desert',
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=85',
    description: 'Hundreds of multi-hued hot air balloons silently drifting into pastel pink dawn over surreal honeycombed tufa valleys and cave dwellings.',
    quote: 'Ascending 1,000 meters above the fairy chimneys as the first rays painted Anatolia in rose gold was the undisputed pinnacle of my global travels.',
    voyagerName: 'Liam Davies',
    voyagerRole: 'Solo Expeditionist • 12-Day Anatolian Trek',
    wonderScore: 99.6,
    stargazingRating: 'Anatolian Desert Clear Sky (Bortle 2)',
    tranquilityLevel: '95% Weightless Wonder',
    magicHour: '05:30 - 07:15 (Sunrise Lift-Off)',
    soundscapeName: 'Dawn Thermal Draft & Hot-Air Burner Echoes',
    soundscapeFrequencies: [162, 324, 486],
    tags: ['Fairy Chimneys', 'Sunrise Ballooning', 'Cave Sanctuaries', 'Rose Valley'],
    signatureRoute: 'Göreme Sunrise Flight → Love Valley Hike → Derinkuyu Underground City'
  },
  {
    id: 'maldives-bioluminescence',
    title: 'Bioluminescent Starlit Shoals',
    realmName: 'Vaadhoo Sea of Stars & Raa Atoll',
    country: 'Maldives',
    countryFlag: '🇲🇻',
    coordinates: '5.8450° N, 72.9833° E',
    category: 'ocean',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85',
    description: 'Electric-blue dinoflagellates illuminating the night surf with supernatural glow, mimicking the constellations of the Milky Way along the sand.',
    quote: 'Walking barefoot along a shoreline that glows neon blue with every step you take feels like discovering an alien utopia on Earth.',
    voyagerName: 'Zoe & Nathan Cole',
    voyagerRole: 'Eco-Voyagers • 7-Day Atoll Sanctuary',
    wonderScore: 99.7,
    stargazingRating: 'Equatorial Oceanic Celestial Vault',
    tranquilityLevel: '99% Deep Sanctuary',
    magicHour: '22:00 - 03:00 (Dark Tide)',
    soundscapeName: 'Bioluminescent Shorebreak & Night Breeze',
    soundscapeFrequencies: [180, 360, 540],
    tags: ['Sea of Stars', 'Neon Shorebreak', 'Overwater Bungalows', 'Coral Reefs'],
    signatureRoute: 'Malé Seaplane Hop → Vaadhoo Starlight Kayak → House Reef Night Dive'
  }
];

interface TravelDreamscapeProps {
  onStartPlanning: (destinationName: string) => void;
}

export const TravelDreamscape: React.FC<TravelDreamscapeProps> = ({ onStartPlanning }) => {
  const [selectedId, setSelectedId] = useState<string>('norway-aurora');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [atmosphere, setAtmosphere] = useState<'celestial' | 'golden' | 'dawn'>('celestial');
  const [savedWishlist, setSavedWishlist] = useState<Set<string>>(new Set(['norway-aurora']));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeDreamscape = DREAMSCAPES.find(d => d.id === selectedId) || DREAMSCAPES[0];

  const toggleWishlist = (id: string, title: string) => {
    setSavedWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed "${title}" from your Dream Journal`);
      } else {
        next.add(id);
        showToast(`✨ Saved "${title}" to your Dream Journal!`);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const pickRandomDreamscape = () => {
    const otherDestinations = DREAMSCAPES.filter(d => d.id !== selectedId);
    const randomPick = otherDestinations[Math.floor(Math.random() * otherDestinations.length)];
    setSelectedId(randomPick.id);
  };

  const filteredDreamscapes = DREAMSCAPES.filter(d => {
    if (activeCategory === 'all') return true;
    return d.category === activeCategory;
  });

  return (
    <section 
      className={`landing-section travel-dreamscape-section atmosphere-${atmosphere}`} 
      id="travel-dreamscape-section"
      aria-label="Travel Dreamscape Showcase"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="dreamscape-ambient-canvas" aria-hidden="true">
        <div className="ambient-celestial-orb orb-1" />
        <div className="ambient-celestial-orb orb-2" />
        <div className="ambient-celestial-orb orb-3" />
        <div className="dreamscape-grid-overlay" />
      </div>

      <div className="section-container dreamscape-inner">
        {/* Section Header */}
        <div className="dreamscape-header-block">
          <div className="dreamscape-badge-pill">
            <span className="dreamscape-sparkle-icon">✨</span>
            <span className="badge-text">Interactive Showcase • Travel Dreamscape</span>
            <span className="live-pulse-dot" />
          </div>

          <h2 className="dreamscape-main-title">
            Step Into Your <span className="dreamscape-gradient-title">Travel Dreamscape</span>
          </h2>

          <p className="dreamscape-subtitle">
            Transcend ordinary itineraries. Immerse your senses in surreal horizons, ethereal twilight, 
            and authentic voyager journals from the most wondrous corners of our planet.
          </p>

          {/* Atmospheric Lighting Preset Switcher */}
          <div className="dreamscape-atmosphere-bar">
            <span className="atmosphere-label">Atmosphere Lighting:</span>
            <div className="atmosphere-toggle-group">
              <button 
                type="button"
                className={`atm-toggle-btn ${atmosphere === 'celestial' ? 'active' : ''}`}
                onClick={() => setAtmosphere('celestial')}
                title="Deep Cosmic Aurora & Starry Twilight"
              >
                <span className="atm-icon">🌌</span>
                <span>Celestial Twilight</span>
              </button>
              <button 
                type="button"
                className={`atm-toggle-btn ${atmosphere === 'golden' ? 'active' : ''}`}
                onClick={() => setAtmosphere('golden')}
                title="Warm Rose-Gold Sunset Radiance"
              >
                <span className="atm-icon">🌅</span>
                <span>Golden Hour</span>
              </button>
              <button 
                type="button"
                className={`atm-toggle-btn ${atmosphere === 'dawn' ? 'active' : ''}`}
                onClick={() => setAtmosphere('dawn')}
                title="Ethereal Misty Lavender Dawn"
              >
                <span className="atm-icon">🌸</span>
                <span>Ethereal Dawn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Realm Filter Tabs */}
        <div className="dreamscape-filter-tabs" role="tablist">
          {[
            { id: 'all', label: 'All Realms', icon: '✨' },
            { id: 'aurora', label: 'Celestial Aurora', icon: '🌌' },
            { id: 'alpine', label: 'Alpine Glaciers', icon: '🏔️' },
            { id: 'zen', label: 'Zen Mist & Torii', icon: '⛩️' },
            { id: 'ocean', label: 'Bioluminescent Waters', icon: '🌊' },
            { id: 'desert', label: 'Floating Skies & Dunes', icon: '🎈' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === tab.id}
              className={`dreamscape-filter-btn ${activeCategory === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(tab.id);
                const matched = tab.id === 'all' 
                  ? DREAMSCAPES[0] 
                  : DREAMSCAPES.find(d => d.category === tab.id);
                if (matched) {
                  setSelectedId(matched.id);
                }
              }}
            >
              <span className="filter-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Interactive Location Selector Chips */}
        <div className="dreamscape-destinations-pill-row" aria-label="Select destination location">
          <span className="dest-row-label">Select Location:</span>
          <div className="dest-pill-scroll">
            {filteredDreamscapes.map(dest => (
              <button
                key={dest.id}
                type="button"
                className={`dest-select-pill ${dest.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(dest.id)}
              >
                <span className="dest-pill-flag">{dest.countryFlag}</span>
                <span className="dest-pill-name">{dest.realmName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* HERO DREAMSCAPE SHOWCASE STAGE */}
        <div className="dreamscape-stage-card">
          <div className="dreamscape-stage-visual">
            <img 
              key={activeDreamscape.id}
              src={activeDreamscape.heroImage} 
              alt={activeDreamscape.title}
              className="stage-main-img" 
              loading="eager"
            />
            <div className="stage-overlay-gradient" />

            {/* Stage Floating Top Bar */}
            <div className="stage-top-hud">
              <div className="hud-location-badge">
                <span className="flag">{activeDreamscape.countryFlag}</span>
                <span className="realm-name">{activeDreamscape.realmName}</span>
                <span className="coordinates-tag">{activeDreamscape.coordinates}</span>
              </div>

              <div className="hud-metrics-row">
                <div className="hud-metric-chip" title="Voyager Wonder Index">
                  <span className="metric-star">★</span>
                  <span className="metric-val">{activeDreamscape.wonderScore}%</span>
                  <span className="metric-label">Wonder Index</span>
                </div>

                <button 
                  type="button" 
                  className={`btn-dream-bookmark ${savedWishlist.has(activeDreamscape.id) ? 'bookmarked' : ''}`}
                  onClick={() => toggleWishlist(activeDreamscape.id, activeDreamscape.title)}
                  aria-label="Save to Dream Journal"
                  title="Bookmark to Dream Journal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={savedWishlist.has(activeDreamscape.id) ? '#F43F5E' : 'none'} stroke={savedWishlist.has(activeDreamscape.id) ? '#F43F5E' : 'currentColor'} strokeWidth="2.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{savedWishlist.has(activeDreamscape.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dreamscape Hero Content Panel */}
          <div className="dreamscape-stage-content">
            <div className="content-realm-tag">
              <span>{activeDreamscape.country}</span>
              <span className="dot-sep">•</span>
              <span>{activeDreamscape.stargazingRating}</span>
            </div>

            <h3 className="content-stage-title">{activeDreamscape.title}</h3>
            <p className="content-stage-desc">{activeDreamscape.description}</p>

            {/* Telemetry Matrix Grid */}
            <div className="stage-telemetry-grid">
              <div className="telemetry-pill">
                <span className="telemetry-icon">🌌</span>
                <div>
                  <span className="t-label">Night Sky Vault</span>
                  <strong className="t-val">{activeDreamscape.stargazingRating.split('(')[0]}</strong>
                </div>
              </div>

              <div className="telemetry-pill">
                <span className="telemetry-icon">🧘</span>
                <div>
                  <span className="t-label">Sanctuary Vibe</span>
                  <strong className="t-val">{activeDreamscape.tranquilityLevel}</strong>
                </div>
              </div>

              <div className="telemetry-pill">
                <span className="telemetry-icon">⏳</span>
                <div>
                  <span className="t-label">Golden Window</span>
                  <strong className="t-val">{activeDreamscape.magicHour}</strong>
                </div>
              </div>

              <div className="telemetry-pill">
                <span className="telemetry-icon">🗺️</span>
                <div>
                  <span className="t-label">Signature Passage</span>
                  <strong className="t-val route-snippet">{activeDreamscape.signatureRoute}</strong>
                </div>
              </div>
            </div>

            {/* Real Voyager Journal Quote (Replaces Testimonial Card) */}
            <div className="dreamscape-quote-box">
              <div className="quote-mark">“</div>
              <p className="quote-text">{activeDreamscape.quote}</p>
              <div className="quote-voyager-row">
                <div className="voyager-avatar-badge">
                  <span>{activeDreamscape.countryFlag}</span>
                </div>
                <div className="voyager-info">
                  <h5 className="voyager-name">{activeDreamscape.voyagerName}</h5>
                  <span className="voyager-role">{activeDreamscape.voyagerRole}</span>
                </div>
                <span className="verified-voyager-tag">✓ Verified Expedition</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="stage-actions-row">
              <button 
                type="button" 
                className="btn-dreamscape-plan"
                onClick={() => onStartPlanning(`${activeDreamscape.realmName}, ${activeDreamscape.country}`)}
                id="btn-plan-dreamscape"
              >
                <span>Plan This Dreamscape</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button 
                type="button" 
                className="btn-dreamscape-random"
                onClick={pickRandomDreamscape}
                title="Wander to a random surreal destination"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                <span>Surprise Horizon</span>
              </button>
            </div>
          </div>
        </div>

        {/* DREAMSCAPE DESTINATIONS GALLERY CARDS */}
        <div className="dreamscape-gallery-header">
          <div className="gallery-header-left">
            <h3 className="gallery-section-title">Explore Surreal Horizons</h3>
            <p className="gallery-section-sub">Select any realm to preview its atmospheric parameters, soundscape, and curated passage.</p>
          </div>
          <span className="gallery-counter">
            Showing {filteredDreamscapes.length} Curated Realms
          </span>
        </div>

        <div className="dreamscape-cards-grid">
          {filteredDreamscapes.map(realm => {
            const isCurrent = realm.id === selectedId;
            const isBookmarked = savedWishlist.has(realm.id);

            return (
              <div 
                key={realm.id} 
                className={`dreamscape-card ${isCurrent ? 'selected-active' : ''}`}
                onClick={() => {
                  setSelectedId(realm.id);
                  const el = document.getElementById('travel-dreamscape-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedId(realm.id);
                  }
                }}
              >
                <div className="dream-card-media">
                  <img src={realm.image} alt={realm.title} loading="lazy" />
                  <div className="dream-card-gradient" />

                  <span className="dream-card-flag">{realm.countryFlag}</span>
                  
                  <div className="dream-card-wonder-pill">
                    <span className="star">★</span>
                    <span>{realm.wonderScore}%</span>
                  </div>

                  <button
                    type="button"
                    className={`card-bookmark-icon-btn ${isBookmarked ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(realm.id, realm.title);
                    }}
                    title="Bookmark Dreamscape"
                    aria-label="Bookmark Dreamscape"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? '#F43F5E' : 'none'} stroke={isBookmarked ? '#F43F5E' : '#FFFFFF'} strokeWidth="2.2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  <div className="dream-card-title-overlay">
                    <span className="card-country-label">{realm.country}</span>
                    <h4 className="card-realm-name">{realm.title}</h4>
                    <span className="card-location-sub">{realm.realmName}</span>
                  </div>
                </div>

                <div className="dream-card-body">
                  <div className="dream-card-tags">
                    {realm.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="dream-tag-chip">{tag}</span>
                    ))}
                  </div>

                  <p className="dream-card-snippet">
                    {realm.description}
                  </p>

                  <div className="dream-card-footer">
                    <span className="card-atmosphere-tag">
                      <span className="realm-icon">✨</span> {realm.tranquilityLevel}
                    </span>

                    <button 
                      type="button" 
                      className="btn-card-experience"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(realm.id);
                        const el = document.getElementById('travel-dreamscape-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <span>{isCurrent ? 'Viewing' : 'Experience'}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* VOYAGER DREAM LOGS (Expanded proof of wonder) */}
        <div className="dreamscape-stories-banner">
          <div className="stories-banner-header">
            <span className="stories-pill">📖 Verified Voyager Dream Logs</span>
            <h3 className="stories-title">Real Explorers in Surreal Horizons</h3>
            <p className="stories-sub">Stories from travelers who planned bespoke journeys across these exact dreamscapes.</p>
          </div>

          <div className="dreamscape-stories-grid">
            {DREAMSCAPES.slice(0, 3).map((d) => (
              <div key={d.id} className="dream-story-card">
                <div className="story-card-top">
                  <div className="story-flag-badge">{d.countryFlag}</div>
                  <div>
                    <h5 className="story-author">{d.voyagerName}</h5>
                    <span className="story-route">{d.realmName}</span>
                  </div>
                  <div className="story-rating">★★★★★</div>
                </div>
                <p className="story-quote">“{d.quote}”</p>
                <div className="story-footer">
                  <span className="story-sub-tag">Voyage Log: {d.voyagerRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="dreamscape-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
};
