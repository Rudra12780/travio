import React, { useState, useEffect } from 'react';
import { UserProfile, Trip, City, ActiveTab } from '../types';
import { api } from '../api';
import { LiveNavigatorModal } from './LiveNavigatorModal';
import { BudgetCrafterModal } from './BudgetCrafterModal';
import { WaypointDetailModal, WaypointInfo } from './WaypointDetailModal';
import { WishlistModal } from './WishlistModal';

interface Props {
  user: UserProfile;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const DashboardHome: React.FC<Props> = ({ user, onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendedCities, setRecommendedCities] = useState<City[]>([]);
  const [showToastBanner, setShowToastBanner] = useState(true);

  // Interactive Modals State
  const [showLiveNavigator, setShowLiveNavigator] = useState(false);
  const [showBudgetCrafter, setShowBudgetCrafter] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointInfo | null>(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    // Load trips
    api.getTrips(user.id || 1).then(data => setTrips(data.trips)).catch(console.error);
    // Load cities
    api.getCities().then(data => setRecommendedCities(data.cities.slice(0, 4))).catch(console.error);
  }, [user.id]);

  const activeTrip = trips.find(t => t.status === 'Active') || trips[0];

  const handleSyncSatellite = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncToast('🛰️ Transmitting to GPS/NavIC constellations... Aligning live coordinates & transit channels');

    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('✨ Telemetry Synchronized! Weather: Udaipur 29°C | Road telemetry aligned | 0 delays reported.');
      setTimeout(() => setSyncToast(null), 4000);
    }, 1200);
  };

  const waypointData: Record<string, WaypointInfo> = {
    plane: {
      icon: '✈️',
      title: 'Flight 6E-204 (Delhi → Udaipur)',
      subtitle: 'Airbus A320neo • Indigo Aerial Telemetry',
      category: 'AERIAL TRANSIT WAYPOINT',
      duration: '1h 25m non-stop',
      elevation: '31,000 ft • 780 km/h',
      description: 'High-altitude scenic aerial approach over the Aravalli mountain ranges directly into Maharana Pratap Airport (UDR).',
      highlights: ['Complimentary Rajasthani refreshments', 'Panoramic Aravalli range window views', 'Express luggage priority baggage retrieval'],
      tips: 'Window seat on the left side (Row A) provides the best aerial views of Lake Pichola upon descent.'
    },
    car: {
      icon: '🚗',
      title: 'Heritage Highway Transit (Udaipur → Jodhpur)',
      subtitle: 'NH58 Express Chauffeur Highway Route',
      category: 'GROUND CHAUFFEUR EXPEDITION',
      duration: '4h 30m scenic drive',
      elevation: '260 km • 82 km/h cruise',
      description: 'Smooth luxury SUV transfer traversing marble quarries, Mewar hill forts, and authentic rural highway dhabas.',
      highlights: ['Scenic Ranakpur Jain Temple detour stop', 'Traditional masala chai stop at Pali junction', 'Complimentary onboard mineral water and Wi-Fi'],
      tips: 'Take the scenic Ranakpur valley bypass for breathtaking mountain passes and wild peacock sightings.'
    },
    hat: {
      icon: '🏜️',
      title: 'Thar Desert Sunset & Camel Safari',
      subtitle: 'Sam Sand Dunes Wilderness Basecamp',
      category: 'WILDERNESS DESERT SAFARI',
      duration: '3h sunset & dune trek',
      elevation: 'Golden sand dunes • 32°C warm breeze',
      description: 'Venture into the heart of the Great Indian Desert atop trained camels or 4x4 dune buggies, followed by Kalbelia folk performances around a bonfire.',
      highlights: ['Breathtaking golden-hour sunset over rippling dunes', 'Traditional Rajasthani folk music and fire dance show', 'Stargazing in zero-light-pollution desert sky'],
      tips: 'Bring a light cotton scarf to protect against evening dune breezes and wear slip-on sandals.'
    },
    bike: {
      icon: '🚲',
      title: 'Udaipur Twin Lakes Sunrise Cycling',
      subtitle: 'Lake Fateh Sagar to Lake Pichola Circuit',
      category: 'ACTIVE MORNING EXPEDITION',
      duration: '2h leisurely ride (14 km)',
      elevation: '598m elevation • Cool morning breeze',
      description: 'A morning cycling journey along lake promenades, passing Neemach Mata hill, heritage gardens, and vibrant morning fish markets.',
      highlights: ['Chilled morning lakeside breeze along Rani Road', 'Artisanal kulhad coffee stop by Fateh Sagar bank', 'Lightweight geared mountain bikes provided with helmets'],
      tips: 'Depart at 06:15 AM to catch the sunrise glowing over the monsoon palace on the hill peak.'
    },
    binoculars: {
      icon: '🏰',
      title: 'Mehrangarh Fort Skyline Observation Deck',
      subtitle: 'Jodhpur Blue City Citadel Heritage Walk',
      category: 'HISTORIC CITADEL DISCOVERY',
      duration: '2.5h guided exploration',
      elevation: '122m above city skyline',
      description: 'Stand atop the colossal 15th-century cliffside bastion with panoramic 360° views across Jodhpur’s sea of indigo-painted houses.',
      highlights: ['Sheesh Mahal mirror gallery & royal palanquins', 'Live folk sarangi musicians at Jai Pol gateway', 'Zip-line aerial glide across fort ramparts and chasm'],
      tips: 'The canon ramparts on the north wall offer an unmatched vista of the blue Brahmin houses at 4:30 PM.'
    },
    boat: {
      icon: '⛵',
      title: 'Lake Pichola Royal Sunset Ferry',
      subtitle: 'City Palace Ghat to Jag Mandir Island',
      category: 'AQUATIC SUNSET VOYAGE',
      duration: '1h tranquil cruise',
      elevation: 'Calm water surface • 28°C sunset',
      description: 'Glide across the mirror-like waters of Lake Pichola past the majestic City Palace facade and the iconic Taj Lake Palace.',
      highlights: ['Jag Mandir island palace courtyard access', 'Golden sunset reflections on marble palace walls', 'Evening flute performance on the open observation deck'],
      tips: 'Board the 05:00 PM sunset departure to see both daylight beauty and illuminated palaces at dusk.'
    },
    train: {
      icon: '🚂',
      title: 'Palace on Wheels Heritage Express',
      subtitle: 'Jaipur to Sawai Madhopur Royal Rail Transit',
      category: 'LUXURY HERITAGE RAILWAY',
      duration: '3h 15m scenic locomotive journey',
      elevation: 'Broad gauge heritage line • 90 km/h',
      description: 'Relive the grandeur of Rajput royalty aboard vintage royal rail saloons featuring bespoke maharaja dining cars and panoramic countryside views.',
      highlights: ['Personal Khidmatgar butler service onboard', 'Live shehnai performance upon platform departure', 'Fine dining multi-course Rajasthani thali'],
      tips: 'Visit the observation lounge car at sunset for unhindered golden hour photography of mustard fields.'
    },
    balloon: {
      icon: '🎈',
      title: 'SkyWaltz Dawn Hot Air Balloon Safari',
      subtitle: 'Amber Fort Valley to Aravalli Skyward Ascent',
      category: 'AERIAL BALLOON EXPEDITION',
      duration: '1h sunrise flight (600m altitude)',
      elevation: '1,950 ft gentle air currents',
      description: 'Float serenely above ancient hill fortresses, rustic desert villages, and mist-clad Aravalli peaks in a world-class hot air balloon.',
      highlights: ['360° sunrise panorama over Amber Fort & Maota Lake', 'Champagne celebration and flight certificate upon landing', 'Experienced commercial pilots with FAA & DGCA certification'],
      tips: 'Dress in comfortable layers as morning air at 2,000 feet is brisk and refreshing.'
    },
    cablecar: {
      icon: '🚡',
      title: 'Karni Mata Skyline Ropeway Cable Car',
      subtitle: 'Doodh Talai to Machhala Magra Hilltop Summit',
      category: 'MOUNTAIN PANORAMIC TRANSIT',
      duration: '15m aerial cableway ascent',
      elevation: '380m vertical summit lift',
      description: 'Ascend over lush subtropical slopes in red panoramic gondolas to reach the cliffside Karni Mata temple with birds-eye views of Lake Pichola.',
      highlights: ['Spectacular aerial view of Sajjangarh Monsoon Palace', 'Temple drum ceremonies echoed across the valley', 'Sunset photography terrace overlooking Lake City'],
      tips: 'Grab a seat on the downhill-facing side of the cabin for dramatic views of Jag Niwas island.'
    },
    compass: {
      icon: '🧭',
      title: 'Ranthambore Bengal Tiger Tracking Expedition',
      subtitle: 'Zone 3 & 4 Deep Jungle Jeep Safari',
      category: 'WILDLIFE TRACKING SAFARI',
      duration: '3.5h wilderness tracking drive',
      elevation: 'Ancient dry deciduous forest canopy',
      description: 'Navigate ancient banyan groves and crumbling Mughal ruins with senior naturalists tracking fresh pugmarks of royal Bengal tigers.',
      highlights: ['High probability sightings of apex predators & leopards', 'Ancient 10th-century Ranthambore Fort looming overhead', 'Custom 4x4 open safari gypsies equipped with telephoto mounts'],
      tips: 'Book the morning 06:30 AM slot when big cats are actively hunting around Padam Talao lake.'
    },
    tent: {
      icon: '⛺',
      title: 'Pushkar Desert Oasis & Luxury Glamping',
      subtitle: 'Rose Valley & Sacred Sand Dune Encampment',
      category: 'HERITAGE DESERT GLAMPING',
      duration: 'Overnight luxury tent stay',
      elevation: 'Desert rose plantation valley • 510m',
      description: 'Stay in handcrafted royal Swiss cottages with private verandas surrounded by aromatic damask rose gardens and sweeping Thar dunes.',
      highlights: ['Traditional wood-fired bonfire with live Sufi qawwali', 'Sunset high tea served atop mobile dune camel carts', 'Outdoor brass telescope stargazing session'],
      tips: 'Wake up early to witness local farmers harvesting fresh damask rose petals for organic rosewater.'
    },
    kayak: {
      icon: '🛶',
      title: 'Chambal River Gorge Kayaking & Sanctuary',
      subtitle: 'Pali Ghat Clean Waters River Expedition',
      category: 'ECO-RIVER ADVENTURE',
      duration: '2h guided river paddle',
      elevation: 'Glass-clear river gorge • 180m',
      description: 'Paddle through one of India’s most pristine river ecosystems, home to endangered Gharial crocodiles, Indian skimmers, and Gangetic dolphins.',
      highlights: ['Close encounters with fish-eating Gharials sunbathing on sandbars', 'Towering canyon cliffs with nesting raptor colonies', 'Premium sea kayaks and lightweight carbon fiber paddles provided'],
      tips: 'Wear waterproof sandals and use a waterproof dry bag for your camera and mobile device.'
    },
    helicopter: {
      icon: '🚁',
      title: 'Kumbhalgarh Great Wall Heli-Charter',
      subtitle: 'Udaipur Helipad to Kumbhalgarh Bastion Flyover',
      category: 'VIP HELICOPTER CHARTER',
      duration: '45m aerial fortress tour',
      elevation: '3,600 ft Aravali ridge altitude',
      description: 'Soar in an executive twin-engine Airbus helicopter tracing the 36-kilometer continuous perimeter wall—the second-longest wall on Earth.',
      highlights: ['Unprecedented aerial perspective of the 36-km Great Wall of India', 'VIP private landing pad at Kumbhalgarh Valley resort', 'Noise-canceling aviation headsets with live pilot commentary'],
      tips: 'Morning charter flights offer crystal-clear mountain visibility before midday heat haze rises.'
    },
    scooter: {
      icon: '🛵',
      title: 'Blue City Indigo Lanes Vespa Tour',
      subtitle: 'Navchokiya & Brahmapuri Old Quarter Ride',
      category: 'URBAN HERITAGE DISCOVERY',
      duration: '2h nimble street exploration',
      elevation: 'Winding cobblestone heritage alleys',
      description: 'Zip through secret medieval alleyways painted in vibrant indigo blue, past centuries-old stepwells, spice merchants, and hidden havelis.',
      highlights: ['Photogenic stop at the iconic stepwell Toorji Ka Jhalra', 'Artisanal saffron lassi tasting at Shri Mishrilal Hotel', 'Classic restored vintage scooters with safety helmets'],
      tips: 'The narrow alleys are pedestrian-heavy; keep your camera strapped securely around your neck.'
    },
    temple: {
      icon: '🏛️',
      title: 'Ranakpur Marble 1,444 Pillars Sanctuary',
      subtitle: 'Valley of the Aravallis Architectural Wonder',
      category: 'SACRED ARCHITECTURAL PILGRIMAGE',
      duration: '2h deep architectural tour',
      elevation: '480m valley floor • Serene forest',
      description: 'Explore the 15th-century white marble Jain masterpiece where no two of the 1,444 intricately carved pillars are carved alike.',
      highlights: ['Masterful marble ceiling dome carvings resembling celestial lace', 'Fascinating acoustics where devotional chants resonate organically', 'Wild langur monkeys playing in the surrounding teakwood forest'],
      tips: 'Audio guides in 6 languages are available at the entrance; modest attire covering shoulders and knees is mandatory.'
    },
    telescope: {
      icon: '🔭',
      title: 'Zero-Bortle Dark Sky Astral Observatory',
      subtitle: 'Benital & Desert Astro-Village Stargazing Station',
      category: 'CELESTIAL ASTRONOMY DISCOVERY',
      duration: '2.5h guided nocturnal cosmic tour',
      elevation: 'Bortle Scale 1 • Pristine night sky',
      description: 'Peer into deep space through high-powered 14-inch Schmidt-Cassegrain computer-guided telescopes into the rings of Saturn and the Andromeda galaxy.',
      highlights: ['Vivid naked-eye Milky Way galaxy core arching across the horizon', 'Astrophotography workshop capturing long-exposure star trails', 'Laser-guided constellations tour by visiting astrophysicists'],
      tips: 'Avoid white flashlight screens to preserve your natural dark adaptation; red light torches are provided.'
    }
  };

  const waypointsList = [
    {
      id: 'boat',
      className: 'route-node boat',
      title: 'Lake Pichola Sunset Cruise',
      data: waypointData.boat,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 18H2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3Z" />
          <path d="M10 2v16" />
          <path d="M10 4l9 9H10Z" />
        </svg>
      )
    },
    {
      id: 'plane',
      className: 'route-node plane',
      title: 'Flight Departure: Delhi → Udaipur',
      data: waypointData.plane,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      )
    },
    {
      id: 'car',
      className: 'route-node car',
      title: 'Heritage Highway Road Transit (NH58)',
      data: waypointData.car,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      )
    },
    {
      id: 'hat',
      className: 'route-node hat',
      title: 'Thar Desert Safari Expedition',
      data: waypointData.hat,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1c0-4-3-6-6-6H8c-3 0-6 2-6 6Z" />
          <path d="M8 12V7c0-1.7 1.3-3 3-3h2c1.7 0 3 1.3 3 3v5" />
        </svg>
      )
    },
    {
      id: 'bike',
      className: 'route-node bike',
      title: 'Old City Lakes Cycling Tour',
      data: waypointData.bike,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 11l3-3 3 3-3 6.5z" />
          <path d="m12 8 3-4h3" />
        </svg>
      )
    },
    {
      id: 'binoculars',
      className: 'route-node binoculars',
      title: 'Mehrangarh Fort Sightseeing',
      data: waypointData.binoculars,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M10 10h4" />
          <path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3" />
          <path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3" />
          <rect width="6" height="12" x="4" y="7" rx="2" />
          <rect width="6" height="12" x="14" y="7" rx="2" />
        </svg>
      )
    },
    {
      id: 'train',
      className: 'route-node train',
      title: 'Palace on Wheels Heritage Express',
      data: waypointData.train,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect width="16" height="16" x="4" y="3" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 19-2 3" />
          <path d="m18 22-2-3" />
          <circle cx="8" cy="15" r="1" />
          <circle cx="16" cy="15" r="1" />
        </svg>
      )
    },
    {
      id: 'balloon',
      className: 'route-node balloon',
      title: 'SkyWaltz Hot Air Balloon Dawn Safari',
      data: waypointData.balloon,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2a7 7 0 0 0-7 7c0 4.5 5 9 7 11 2-2 7-6.5 7-11a7 7 0 0 0-7-7Z" />
          <path d="M9 22h6" />
          <path d="M10 20h4" />
        </svg>
      )
    },
    {
      id: 'cablecar',
      className: 'route-node cablecar',
      title: 'Karni Mata Skyline Ropeway',
      data: waypointData.cablecar,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m10 3-8 6" />
          <path d="m22 9-8-6" />
          <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
          <path d="M9 10v10" />
          <path d="M15 10v10" />
          <path d="M12 3v7" />
        </svg>
      )
    },
    {
      id: 'compass',
      className: 'route-node compass',
      title: 'Ranthambore Tiger Tracking Expedition',
      data: waypointData.compass,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    },
    {
      id: 'tent',
      className: 'route-node tent',
      title: 'Pushkar Desert Oasis & Glamping',
      data: waypointData.tent,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m19 20-7-16-7 16" />
          <path d="m12 4 4 16" />
          <path d="m12 14 3 6" />
          <path d="M2 20h20" />
        </svg>
      )
    },
    {
      id: 'kayak',
      className: 'route-node kayak',
      title: 'Chambal Gorge Kayaking & Wildlife',
      data: waypointData.kayak,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m2 12 5-3 10 3-5 3-10-3Z" />
          <path d="m4 15 16-6" />
          <path d="m18 8 2 2" />
          <path d="m4 14 2 2" />
        </svg>
      )
    },
    {
      id: 'helicopter',
      className: 'route-node helicopter',
      title: 'Kumbhalgarh Great Wall Heli-Charter',
      data: waypointData.helicopter,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 3h18" />
          <path d="M12 3v4" />
          <path d="M4 14a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V9H4v5Z" />
          <path d="M4 19h16" />
          <path d="M19 12h3" />
        </svg>
      )
    },
    {
      id: 'scooter',
      className: 'route-node scooter',
      title: 'Blue City Indigo Lanes Vespa Tour',
      data: waypointData.scooter,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="6.5" cy="17.5" r="3.5" />
          <circle cx="17.5" cy="17.5" r="3.5" />
          <path d="M6.5 17.5h8" />
          <path d="M14.5 17.5V8h3" />
          <path d="M17.5 8H16" />
        </svg>
      )
    },
    {
      id: 'temple',
      className: 'route-node temple',
      title: 'Ranakpur Marble 1,444 Pillars',
      data: waypointData.temple,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 22h16" />
          <path d="m12 2-8 5v3h16V7l-8-5Z" />
          <path d="M6 10v12" />
          <path d="M10 10v12" />
          <path d="M14 10v12" />
          <path d="M18 10v12" />
        </svg>
      )
    },
    {
      id: 'telescope',
      className: 'route-node telescope',
      title: 'Zero-Bortle Dark Sky Observatory',
      data: waypointData.telescope,
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
          <path d="m13.56 11.747 4.332-.924" />
          <path d="m16 21-3.105-6.21" />
          <path d="M8 21l3.105-6.21" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      )
    }
  ];

  return (
    <div className="dash-main" style={{ background: '#F7F6F2', color: '#101010', minHeight: '100%', padding: '24px 0' }}>
      {/* Card 1: Live Expedition In Progress (Editorial High-Contrast Neo-Brutalist) */}
      <section 
        className="live-expedition-card" 
        aria-label="Live Expedition Details" 
        style={{
          background: '#FFFFFF',
          border: '2px solid #101010',
          boxShadow: '4px 4px 0px #101010',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div 
            style={{ 
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#FFD84D', 
              border: '2px solid #101010',
              color: '#101010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #101010'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
          </div>
          <div>
            <span 
              style={{ 
                background: '#429FE8', 
                color: '#101010', 
                border: '1px solid #101010',
                fontSize: '10.5px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}
            >
              ACTIVE EXPEDITION TELEMETRY
            </span>
            <h2 style={{ color: '#101010', fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 900, margin: '6px 0 2px 0' }}>
              {activeTrip ? activeTrip.title : 'Santorini & Cyclades Archipelago Odyssey'}
            </h2>
            <p style={{ color: '#555555', fontSize: '13px', margin: 0 }}>
              Currently at <strong style={{ color: '#101010' }}>Oia Caldera (24°C)</strong> • Next waypoint Amalfi Coastline
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowLiveNavigator(true)}
          style={{
            background: '#101010',
            color: '#FFFFFF',
            fontWeight: 800,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 22px',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #429FE8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px'
          }}
        >
          <span>Open Live Navigator</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>
      </section>

      {/* Card 2: Editorial Headquarters Welcome Banner */}
      <section 
        style={{
          background: '#FFFFFF',
          border: '2px solid #101010',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '6px 6px 0px #101010',
          margin: '22px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F4AFC1', border: '1.5px solid #101010', borderRadius: '4px', padding: '3px 10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px' }}>🧭</span>
            <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#101010', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PERSONALIZED TRAVEL EXPERIENCES // DASHBOARD
            </span>
          </div>

          <h1 style={{ color: '#101010', fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, margin: '0 0 10px 0', lineHeight: 1.1 }}>
            Welcome back, <span style={{ color: '#429FE8' }}>{user.name || 'Voyager'}!</span>
          </h1>
          <p style={{ color: '#555555', fontSize: '14.5px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            Bespoke luxury itinerary curation, multi-currency treasury tracking, and real-time waypoint telemetry across world destinations.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div 
              onClick={() => onNavigate('my-trips')} 
              style={{ cursor: 'pointer', background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 800, color: '#101010', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '2px 2px 0px #101010' }}
            >
              <span>✈️</span>
              <span>{trips.length} Active Expeditions</span>
            </div>
            <div 
              onClick={() => onNavigate('cities')} 
              style={{ cursor: 'pointer', background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 800, color: '#101010', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '2px 2px 0px #101010' }}
            >
              <span>🏙️</span>
              <span>15 Curated Dossiers</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => setShowBudgetCrafter(true)} 
            style={{ 
              background: '#FFD84D', 
              color: '#101010', 
              fontWeight: 900, 
              border: '2px solid #101010', 
              borderRadius: '8px', 
              padding: '13px 22px', 
              boxShadow: '3px 3px 0px #101010', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13.5px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span>Plan Voyage Budget</span>
          </button>
          <button 
            type="button" 
            onClick={() => onNavigate('cities')} 
            style={{ 
              background: '#FFFFFF', 
              border: '2px solid #101010', 
              color: '#101010', 
              borderRadius: '8px', 
              padding: '12px 22px', 
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '13.5px',
              boxShadow: '3px 3px 0px #101010',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <span>Explore Destinations</span>
          </button>
        </div>
      </section>

      {/* Interactive Transport Progress Track */}
      <section 
        className="route-tracker-container" 
        aria-label="Route waypoints track"
        style={{
          background: '#FFFFFF',
          border: '2px solid #101010',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px #101010',
          padding: '18px 20px',
          margin: '22px 0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', color: '#101010', textTransform: 'uppercase' }}>
            WAYPOINTS TRANSIT CORRIDOR // CLICK TO INSPECT
          </span>
          <span style={{ fontSize: '11px', color: '#555555' }}>
            12 Active Expedition Stops
          </span>
        </div>
        <div className="route-marquee-track">
          {[1, 2].map((groupNum) => (
            <div
              key={`group-${groupNum}`}
              className="route-marquee-group"
              aria-hidden={groupNum === 2 ? 'true' : undefined}
            >
              {waypointsList.map((wp) => (
                <div
                  key={`g${groupNum}-${wp.id}`}
                  className={wp.className}
                  tabIndex={0}
                  title={wp.title}
                  onClick={() => setSelectedWaypoint(wp.data)}
                >
                  {wp.svg}
                  <span className="tooltip">{wp.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Expeditions Section */}
      <section style={{ margin: '28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#101010', fontFamily: "'Syne', sans-serif", margin: 0 }}>
              Your Recent Expeditions
            </h3>
            <p style={{ fontSize: '13px', color: '#555555', margin: '4px 0 0 0' }}>
              Continue designing your multi-city journeys
            </p>
          </div>
          <button
            type="button"
            style={{ 
              fontWeight: 800, 
              color: '#101010', 
              background: '#FFFFFF', 
              border: '1.5px solid #101010', 
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '12px',
              boxShadow: '2px 2px 0px #101010'
            }}
            onClick={() => onNavigate('my-trips')}
          >
            <span>View All Trips ({trips.length}) ↗</span>
          </button>
        </div>

        {trips.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '2px solid #101010', borderRadius: '14px', padding: '36px', textAlign: 'center', boxShadow: '4px 4px 0px #101010' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>🗺️</span>
            <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: '0 0 6px 0', fontFamily: "'Syne', sans-serif" }}>No Expeditions Created Yet</h4>
            <p style={{ fontSize: '13.5px', color: '#555555', maxWidth: '420px', margin: '0 auto 18px auto' }}>
              Begin your journey by creating a customized itinerary with day-by-day routing, hotel stays, and multi-currency budgets.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('my-trips')}
              style={{
                background: '#FFD84D',
                color: '#101010',
                fontWeight: 900,
                border: '1.5px solid #101010',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #101010'
              }}
            >
              + Create Your First Trip
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {trips.slice(0, 3).map(trip => (
              <div
                key={trip.id}
                onClick={() => onNavigate('itinerary-builder', trip.id)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '2px solid #101010',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0px #101010',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ position: 'relative', height: '150px' }}>
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: trip.status === 'Active' ? '#FFD84D' : '#FFFFFF',
                    color: '#101010',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    border: '1.5px solid #101010'
                  }}>
                    {trip.status}
                  </span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#101010', marginBottom: '6px', fontFamily: "'Syne', sans-serif" }}>{trip.title}</h4>
                  <p style={{ fontSize: '12px', color: '#555555', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <span>📅 {trip.start_date} → {trip.end_date}</span>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E8E6E0', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 800, color: '#429FE8' }}>📍 {trip.stops_count || 0} Stops</span>
                    <span style={{ fontWeight: 800, color: '#101010' }}>Budget: ${trip.total_budget}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Global Destinations Showcase */}
      <section style={{ margin: '28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#101010', fontFamily: "'Syne', sans-serif", margin: 0 }}>
              Curated World Destinations
            </h3>
            <p style={{ fontSize: '13px', color: '#555555', margin: '4px 0 0 0' }}>
              Explore destinations with verified cost indices and daily expenses
            </p>
          </div>
          <button
            type="button"
            style={{ 
              fontWeight: 800, 
              color: '#101010', 
              background: '#FFFFFF', 
              border: '1.5px solid #101010', 
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer', 
              fontSize: '12px',
              boxShadow: '2px 2px 0px #101010'
            }}
            onClick={() => onNavigate('cities')}
          >
            <span>Explore All Cities ↗</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {recommendedCities.map(city => (
            <div
              key={city.id}
              onClick={() => onNavigate('cities')}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '2px solid #101010',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #101010',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ position: 'relative', height: '145px' }}>
                <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: '#FFFFFF',
                  color: '#101010',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid #101010'
                }}>
                  {city.climate}
                </span>
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#FFD84D',
                  color: '#101010',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #101010'
                }}>
                  ★ {city.popularity_score}
                </span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#101010', margin: '0 0 2px 0', fontFamily: "'Syne', sans-serif" }}>{city.name}</h4>
                <p style={{ fontSize: '12px', color: '#555555', margin: '0 0 10px 0' }}>{city.country} • {city.region}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '10px', borderTop: '1px solid #E8E6E0' }}>
                  <span style={{ color: '#101010', fontWeight: 800 }}>${city.avg_cost_per_day}/day</span>
                  <span style={{ fontWeight: 900, color: '#36B7B3' }}>
                    {'$'.repeat(city.cost_index)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Section: Notification Banner & Action Tiles */}
      <section className="dash-bottom-grid" style={{ marginTop: '24px' }}>
        {showToastBanner && (
          <div 
            style={{
              background: '#FFFFFF',
              border: '2px solid #101010',
              borderRadius: '12px',
              color: '#101010',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '3px 3px 0px #101010'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#36B7B3', color: '#101010', border: '1px solid #101010', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                ✓
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Welcome aboard GlobalTrotter, {user.name || 'Voyager'}! Your portal is ready.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowToastBanner(false)}
              aria-label="Dismiss banner"
              style={{ background: 'none', border: 'none', color: '#101010', cursor: 'pointer', fontWeight: 900, fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* Satellite Synchronization Toast Feedback */}
      {syncToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#101010',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '2px solid #429FE8',
          boxShadow: '4px 4px 0px #101010',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13.5px',
          fontWeight: 700,
          zIndex: 2000
        }}>
          <span>{syncToast}</span>
        </div>
      )}

      {/* Modals Mounted */}
      <LiveNavigatorModal
        isOpen={showLiveNavigator}
        onClose={() => setShowLiveNavigator(false)}
      />

      <BudgetCrafterModal
        isOpen={showBudgetCrafter}
        userId={user.id || 1}
        onClose={() => setShowBudgetCrafter(false)}
        onTripGenerated={(newTrip) => onNavigate('itinerary-builder', newTrip.id)}
      />

      <WaypointDetailModal
        waypoint={selectedWaypoint}
        onClose={() => setSelectedWaypoint(null)}
      />

      <WishlistModal
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
