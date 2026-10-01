export interface CountryDossier {
  id: string;
  name: string;
  flag: string;
  capital: string;
  continent: 'Europe' | 'Asia' | 'Islands & Escapes' | 'Nordic & Glacial' | 'Adventure & Wilderness';
  tagline: string;
  rating: number;
  safetyScore: number;
  voyagerVotes: string;
  whyBest: string;
  heroImage: string;
  gallery: string[];
  bestSeason: {
    title: string;
    months: string;
    climateSummary: string;
    seasons: Array<{ name: string; period: string; temp: string; highlight: string }>;
  };
  dailyBudget: {
    backpacker: number;
    comfort: number;
    luxury: number;
    currency: string;
    currencySymbol: string;
    breakdownNote: string;
  };
  topAttractions: Array<{
    name: string;
    location: string;
    description: string;
    tag: string;
    image: string;
  }>;
  signatureDishes: Array<{
    name: string;
    description: string;
    mustTrySpot: string;
    icon: string;
  }>;
  travelTips: Array<{
    title: string;
    advice: string;
    badge: string;
  }>;
  transitInfo: string;
  visaInfo: string;
}

export const COUNTRIES_DATA: CountryDossier[] = [
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    capital: 'Tokyo',
    continent: 'Asia',
    tagline: 'Hypermodern Neon Metropolises Meets Ancient Zen Sanctuaries',
    rating: 4.96,
    safetyScore: 99,
    voyagerVotes: '48.2k reviews',
    whyBest: 'Japan stands out as the world’s gold standard for travel infrastructure, culinary mastery, safety, and cultural hospitality (omotenashi). Travelers can ride 320 km/h Shinkansen bullet trains through snow-capped Mount Fuji vistas, meditate in 1,200-year-old Kyoto moss gardens, and eat world-class ramen or Michelin-starred sushi in pristine alleyways.',
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Spring (Sakura) & Autumn (Koyo)',
      months: 'March–May & October–November',
      climateSummary: 'Crisp, mild temperatures (14°C – 22°C) with minimal rainfall and world-famous cherry blossoms or fiery maple foliage.',
      seasons: [
        { name: 'Spring', period: 'Mar – May', temp: '15°C', highlight: 'Iconic Cherry Blossoms (Hanami) across Tokyo, Kyoto & Osaka' },
        { name: 'Summer', period: 'Jun – Aug', temp: '29°C', highlight: 'Mount Fuji hiking season, summer fireworks festivals & street matsuri' },
        { name: 'Autumn', period: 'Sep – Nov', temp: '18°C', highlight: 'Fiery Japanese maple leaves (Momiji), harvest delicacies & pleasant hikes' },
        { name: 'Winter', period: 'Dec – Feb', temp: '5°C', highlight: 'Hokkaido world-class powder snow (Japow) & steaming volcanic Onsen baths' }
      ]
    },
    dailyBudget: {
      backpacker: 65,
      comfort: 160,
      luxury: 390,
      currency: 'JPY',
      currencySymbol: '¥',
      breakdownNote: 'Includes high-speed rail transit pass, capsule or boutique hotel, and exquisite noodle & izakaya dining.'
    },
    topAttractions: [
      {
        name: 'Fushimi Inari Shrine & Arashiyama Bamboo Grove',
        location: 'Kyoto',
        description: 'Ten thousand vermilion torii gates winding up the sacred sacred Mount Inari, flanked by ancient bamboo corridors.',
        tag: 'Cultural Heritage',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Mount Fuji & Lake Kawaguchiko Five Lakes',
        location: 'Yamanashi Prefecture',
        description: 'The iconic sacred snow-capped volcanic cone mirrored in crystal alpine lakes with hot spring ryokans.',
        tag: 'Natural Wonder',
        image: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Shibuya Crossing & Shinjuku Neon Cyberpunk',
        location: 'Tokyo',
        description: 'The world’s busiest pedestrian crossing, retro Omoide Yokocho lantern alleys, and futuristic digital art museums.',
        tag: 'Urban Pulse',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Dotonbori Street Food Arcades',
        location: 'Osaka',
        description: 'The food capital of Japan famous for sizzling takoyaki octopus balls, okonomiyaki, and vibrant canal neon signs.',
        tag: 'Gastronomy',
        image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Authentic Tonkotsu & Miso Ramen', description: 'Rich 16-hour slow-simmered pork bone broth with springy handmade noodles and tender chashu.', mustTrySpot: 'Ichiran or Afuri (Tokyo)', icon: '🍜' },
      { name: 'A5 Wagyu Beef Teppanyaki', description: 'Melt-in-your-mouth marbled Japanese beef seared over sizzling iron plates with wasabi sea salt.', mustTrySpot: 'Kobe & Ginza steakhouses', icon: '🥩' },
      { name: 'Edomae Nigiri Sushi', description: 'Master-pressed fresh Pacific tuna, salmon roe, and sea urchin over seasoned warm vinegared rice.', mustTrySpot: 'Toyosu Outer Fish Market', icon: '🍣' },
      { name: 'Matcha Soft Cream & Parfait', description: 'Stone-ground ceremonial green tea soft serve with sweet azuki red beans and chewy dango mochi.', mustTrySpot: 'Uji, Kyoto tea estates', icon: '🍵' }
    ],
    travelTips: [
      { title: 'Suica / Pasmo IC Card', advice: 'Add a digital Suica to Apple/Google Wallet for tap-and-go travel on all subways, trains, and vending machines.', badge: 'Transit Hack' },
      { title: 'Tipping is Not Practiced', advice: 'Exceptional service is built into Japanese culture; leaving extra tips can cause confusion or polite refusal.', badge: 'Etiquette' },
      { title: 'Luggage Forwarding (Takkyubin)', advice: 'Ship heavy suitcases hotel-to-hotel overnight for around $15, allowing luggage-free train travels.', badge: 'Pro Tip' }
    ],
    transitInfo: 'Shinkansen Bullet Train (320 km/h) links Tokyo, Kyoto, Osaka, and Hiroshima within hours. 100% on-time record.',
    visaInfo: 'Visa-free entry for up to 90 days for travelers from over 68 countries including US, EU, UK, Canada, and Australia.'
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    flag: '🇨🇭',
    capital: 'Bern',
    continent: 'Europe',
    tagline: 'Fairytale Alpine Summits, Glacial Lakes & World-Class Scenic Trains',
    rating: 4.98,
    safetyScore: 99,
    voyagerVotes: '36.8k reviews',
    whyBest: 'Switzerland offers the absolute pinnacle of Alpine majesty, pristine wilderness, and engineering perfection. From the pyramidal tooth of the Matterhorn in Zermatt to the dramatic Lauterbrunnen valley with 72 waterfalls, the country is linked by the world’s most scenic panoramic trains like the Glacier Express and Bernina Express.',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Summer Alpine Hiking & Winter Skiing',
      months: 'June–September & December–March',
      climateSummary: 'Summer boasts crystal alpine air (18°C–25°C) perfect for trail trekking; winter brings powder snow for world-class skiing.',
      seasons: [
        { name: 'Summer', period: 'Jun – Aug', temp: '22°C', highlight: 'Lush wildflower meadows, glacial lake swims, and high-altitude hiking passes' },
        { name: 'Autumn', period: 'Sep – Oct', temp: '14°C', highlight: 'Golden larch forests in Engadin, wine harvest festivals in Lavaux vineyards' },
        { name: 'Winter', period: 'Nov – Mar', temp: '-2°C', highlight: 'Glacier skiing in Zermatt, St. Moritz luxury resorts & cozy cheese fondue huts' },
        { name: 'Spring', period: 'Apr – May', temp: '13°C', highlight: 'Thawing valleys, cascading waterfalls in full roar & quiet mountain towns' }
      ]
    },
    dailyBudget: {
      backpacker: 90,
      comfort: 240,
      luxury: 520,
      currency: 'CHF',
      currencySymbol: 'CHF',
      breakdownNote: 'The Swiss Travel Pass covers unlimited trains, buses, lake steamers, and free entry into 500+ museums.'
    },
    topAttractions: [
      {
        name: 'The Matterhorn & Gornergrat Cogwheel Train',
        location: 'Zermatt',
        description: 'Ride Europe’s highest open-air cogwheel railway up to 3,089m for unobstructed views of the Matterhorn and 29 peaks.',
        tag: 'Alpine Icon',
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Jungfraujoch - Top of Europe & Lauterbrunnen',
        location: 'Bernese Oberland',
        description: 'Trek into the glacial ice palace at 3,454m elevation overlooking the Aletsch Glacier, towering above 72 cascading waterfalls.',
        tag: 'Glacier Wonder',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Glacier Express Panoramic Railway',
        location: 'St. Moritz to Zermatt',
        description: 'The slowest express train in the world, traversing 291 bridges and 91 tunnels through dramatic Swiss canyons.',
        tag: 'Scenic Rail',
        image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Lake Lucerne & Mount Pilatus Dragon Ride',
        location: 'Lucerne',
        description: 'Historic Chapel Bridge, vintage paddle steamer cruises across turquoise fjord-like waters, and aerial cable cars.',
        tag: 'Lake & Mountain',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Traditional Swiss Cheese Fondue', description: 'Bubbling pot of melted Gruyère and Emmental with kirsch and garlic, dipped with crusty artisan bread cubes.', mustTrySpot: 'Zermatt rustic mountain huts', icon: '🫕' },
      { name: 'Crispy Swiss Rösti', description: 'Golden pan-fried grated potato cake topped with fried eggs, bacon, and melted raclette cheese.', mustTrySpot: 'Bernese Oberland taverns', icon: '🥔' },
      { name: 'Swiss Raclette', description: 'Scraped melted wheel of fragrant mountain cheese served hot over boiled new potatoes, gherkins, and pickled onions.', mustTrySpot: 'Valais alpine dairies', icon: '🧀' },
      { name: 'Artisan Swiss Dark Chocolates & Pralines', description: 'Handcrafted truffles from master chocolatiers using alpine dairy cream and single-origin cocoa.', mustTrySpot: 'Läderach (Zurich & Lucerne)', icon: '🍫' }
    ],
    travelTips: [
      { title: 'Get the Swiss Travel Pass', advice: 'Grants unlimited travel on the entire national rail, bus, and lake ferry network, plus 50% off mountain cable cars.', badge: 'Money Saver' },
      { title: 'Free Pure Alpine Tap Water', advice: 'Every historic fountain in Swiss towns spouts pristine, ice-cold drinking water sourced directly from glaciers.', badge: 'Eco Tip' },
      { title: 'CO2-Free Car-Free Towns', advice: 'Zermatt and Wengen are completely car-free; arrive by electric train and enjoy pure mountain silence.', badge: 'Travel Insight' }
    ],
    transitInfo: 'The SBB Swiss Federal Railways is the cleanest, most punctual train network on Earth with seamless timed connections.',
    visaInfo: 'Part of the Schengen Area. Most international voyagers enjoy 90 days visa-free access.'
  },
  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    capital: 'Rome',
    continent: 'Europe',
    tagline: 'Living Museum of Art, Romantic Coastal Cliffs & World-Renowned Gastronomy',
    rating: 4.94,
    safetyScore: 94,
    voyagerVotes: '52.1k reviews',
    whyBest: 'Italy holds the greatest number of UNESCO World Heritage sites on Earth (59 sites!). Every corner feels like a cinematic masterpiece: from the Colosseum and Vatican in Rome to the Renaissance treasures of Florence, the gondola canals of Venice, and pastel cliffside villas of the Amalfi Coast.',
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523906834658-6e2b32c7f070?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Shoulder Season (Spring & Autumn)',
      months: 'April–June & September–October',
      climateSummary: 'Pleasant warm sunshine (20°C–26°C), fewer tourist crowds, and vibrant harvest seasons for wine, truffles, and olives.',
      seasons: [
        { name: 'Spring', period: 'Apr – Jun', temp: '22°C', highlight: 'Blooming Tuscan countryside, pleasant sightseeing in Rome and Florence' },
        { name: 'Summer', period: 'Jul – Aug', temp: '32°C', highlight: 'Amalfi Coast beach days, Sardinia crystal coves, and lively piazza gelato nights' },
        { name: 'Autumn', period: 'Sep – Nov', temp: '19°C', highlight: 'Tuscany grape harvest, white truffle festival in Alba, mild coastal weather' },
        { name: 'Winter', period: 'Dec – Mar', temp: '10°C', highlight: 'Festive Christmas markets, peaceful art galleries without long lines, Dolomite skiing' }
      ]
    },
    dailyBudget: {
      backpacker: 60,
      comfort: 145,
      luxury: 360,
      currency: 'EUR',
      currencySymbol: '€',
      breakdownNote: 'Frecciarossa high-speed rail connects Rome to Florence in 1h 30m; trattoria dining is remarkably affordable.'
    },
    topAttractions: [
      {
        name: 'The Colosseum & Roman Forum at Golden Hour',
        location: 'Rome',
        description: 'Walk through 2,000 years of gladiator history, the Pantheon, and toss a coin into Trevi Fountain.',
        tag: 'Ancient History',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Amalfi Coast & Positano Cliffside Villages',
        location: 'Campania',
        description: 'Dramatic vertical towns tumbling into the sapphire Tyrrhenian Sea, fragrant lemon groves, and scenic cliff drives.',
        tag: 'Coastal Luxury',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Venice Grand Canal & Gondola Waterways',
        location: 'Venice',
        description: 'A car-free labyrinth of 400 bridges, 118 islands, Byzantine St. Mark’s Basilica, and romantic sunset boat rides.',
        tag: 'Romantic Escape',
        image: 'https://images.unsplash.com/photo-1523906834658-6e2b32c7f070?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Florence Duomo & Tuscan Rolling Hills',
        location: 'Tuscany',
        description: 'Brunelleschi’s dome, Michelangelo’s David in the Galleria dell’Accademia, and cypress-lined Chianti vineyards.',
        tag: 'Renaissance Art',
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Authentic Neapolitan Pizza Margherita', description: 'Wood-fired sourdough crust with San Marzano tomatoes, buffalo mozzarella, and fresh basil leaves.', mustTrySpot: 'L’Antica Pizzeria da Michele (Naples)', icon: '🍕' },
      { name: 'Cacio e Pepe & Carbonara', description: 'Fresh handmade pasta tossed with aged Pecorino Romano, guanciale, and cracked black pepper.', mustTrySpot: 'Trastevere traditional osterias (Rome)', icon: '🍝' },
      { name: 'Florentine T-Bone Steak (Bistecca)', description: 'Thick, wood-grilled Chianina beef steak seasoned with rosemary, sea salt, and extra virgin olive oil.', mustTrySpot: 'Trattoria Mario (Florence)', icon: '🥩' },
      { name: 'Artisanal Gelato Artigianale', description: 'Silky, churned pistachio di Bronte, dark chocolate fondant, and stracciatella gelato.', mustTrySpot: 'Giolitti (Rome)', icon: '🍨' }
    ],
    travelTips: [
      { title: 'Book Uffizi & Colosseum Tickets Early', advice: 'Reserve skip-the-line time slots 3-4 weeks in advance to avoid 2-hour queue delays.', badge: 'Crucial Tip' },
      { title: 'Espresso at the Bar Counter', advice: 'Drinking coffee standing at the banco costs €1.20 vs €4.00+ when seated at tourist tables.', badge: 'Local Custom' },
      { title: 'Frecciarossa High-Speed Trains', advice: 'Book Italo or Trenitalia high-speed rail between major cities rather than renting a car in restricted ZTL zones.', badge: 'Transit Hack' }
    ],
    transitInfo: 'High-speed trains link Milan, Venice, Bologna, Florence, Rome, and Naples at speeds up to 300 km/h.',
    visaInfo: 'Schengen Area member. 90-day visa-exempt entry for US, Canada, Australia, UK, and European travelers.'
  },
  {
    id: 'indonesia',
    name: 'Indonesia (Bali & Beyond)',
    flag: '🇮🇩',
    capital: 'Jakarta / Denpasar',
    continent: 'Islands & Escapes',
    tagline: 'Tropical Island Sanctuaries, Sacred Water Temples & Volcanic Sunrise Peaks',
    rating: 4.92,
    safetyScore: 92,
    voyagerVotes: '41.5k reviews',
    whyBest: 'Indonesia is the world’s largest archipelago (over 17,000 islands!). Bali is universally celebrated as the Island of the Gods for its terraced emerald rice fields, sacred cliffside temples, holistic yoga retreats in Ubud, legendary Indian Ocean surf breaks, and ultra-luxurious private pool villas at unbeatable value.',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Dry Season (Sunny & Breezy)',
      months: 'May–September',
      climateSummary: 'Bright blue skies (26°C–29°C), low humidity, and consistent offshore winds ideal for surfing and diving.',
      seasons: [
        { name: 'Dry Peak', period: 'Jun – Aug', temp: '27°C', highlight: 'Zero rainfall, outdoor beach clubs, diving with Manta Rays in Nusa Penida' },
        { name: 'Shoulder', period: 'Apr – May & Sep – Oct', temp: '28°C', highlight: 'Peaceful temples, uncrowded jungle waterfalls, best photography light' },
        { name: 'Wet Season', period: 'Nov – Mar', temp: '30°C', highlight: 'Lush blooming rainforests, spiritual yoga retreats, fewer crowds and lower villa rates' }
      ]
    },
    dailyBudget: {
      backpacker: 35,
      comfort: 85,
      luxury: 220,
      currency: 'IDR',
      currencySymbol: 'Rp',
      breakdownNote: 'Extremely high value for money; 5-star private pool jungle villas often cost under $150/night.'
    },
    topAttractions: [
      {
        name: 'Ubud Tegallalang Rice Terraces & Sacred Monkey Forest',
        location: 'Ubud, Bali',
        description: 'Ancient Subak irrigation rice paddies cascading down lush canyons, ancient banyan trees, and playful macaques.',
        tag: 'Spiritual Nature',
        image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Nusa Penida & Kelingking T-Rex Coastal Cliff',
        location: 'Nusa Islands',
        description: 'Iconic dinosaur-shaped limestone cliff plunging into turquoise waves, with pristine Manta Bay diving spots.',
        tag: 'Coastal Wonder',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Uluwatu Sunset Temple & Fire Kecak Dance',
        location: 'Uluwatu Peninsula',
        description: 'Perched 70 meters atop steep ocean cliffs, where a dramatic chorus of 50 chanters performs as the sun sets into the sea.',
        tag: 'Cultural Spectacle',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Mount Batur Sunrise Active Volcano Trek',
        location: 'Kintamani',
        description: 'Early morning hike above the clouds to witness dawn light over caldera lakes while enjoying volcanic steam-cooked breakfast.',
        tag: 'Volcanic Trek',
        image: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Nasi Goreng Special & Chicken Satay', description: 'Fragrant wok-tossed jasmine rice with sweet soy, shallots, fried egg, and peanut sauce skewers.', mustTrySpot: 'Local Warungs (Warung Ibu Oka)', icon: '🍛' },
      { name: 'Babi Guling (Balinese Roast Pork)', description: 'Whole spit-roasted pig stuffed with lemongrass, turmeric, galangal, served with crispy crackling.', mustTrySpot: 'Warung Babi Guling Pak Malen', icon: '🍖' },
      { name: 'Fresh Dragon Fruit & Açaí Smoothie Bowl', description: 'Chilled tropical fruit blend topped with toasted granola, chia seeds, and fresh shredded coconut.', mustTrySpot: 'Ubud organic cafes', icon: '🥥' },
      { name: 'Bebek Betutu (Slow-Cooked Duck)', description: 'Tender spiced duck wrapped in banana leaves and slow-smoked for 24 hours over coconut husks.', mustTrySpot: 'Bebek Bengil Dirty Duck Diner', icon: '🍗' }
    ],
    travelTips: [
      { title: 'Rent a Scooter or Hire Private Driver', advice: 'Daily private chauffeur cars with AC cost just $35-$45 for 10 hours of custom touring.', badge: 'Budget Secret' },
      { title: 'Temple Sarong Dress Code', advice: 'Always wear a sarong and sash when entering sacred Hindu temples (usually provided at entrance).', badge: 'Respect' },
      { title: 'Drink Bottled / Filtered Water', advice: 'Avoid untreated tap water; stick to coconut water, filtered water, or bottled drinks.', badge: 'Health Tip' }
    ],
    transitInfo: 'Private air-conditioned car transfers with English-speaking drivers, speedboats to Gili and Nusa islands, or scooter rentals.',
    visaInfo: 'Visa on Arrival (e-VOA) available online or at airport for 30 days (extendable for 30 more) for 90+ nationalities.'
  },
  {
    id: 'iceland',
    name: 'Iceland',
    flag: '🇮🇸',
    capital: 'Reykjavik',
    continent: 'Nordic & Glacial',
    tagline: 'The Land of Fire & Ice, Aurora Borealis & Geothermal Lagoons',
    rating: 4.97,
    safetyScore: 100,
    voyagerVotes: '31.4k reviews',
    whyBest: 'Iceland is ranked as the #1 Safest Country in the World on the Global Peace Index. It offers otherworldly raw landscapes that look straight from another planet: shimmering blue ice caves inside glaciers, spouting geysers, thunderous waterfalls, black sand beaches, geothermal hot springs, and neon green Aurora Borealis dancing in the polar sky.',
    heroImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Midnight Sun (Summer) or Northern Lights (Winter)',
      months: 'June–August & September–March',
      climateSummary: 'Summer offers 24-hour daylight and mild road trips; winter offers snowscapes, ice caves, and cosmic Aurora displays.',
      seasons: [
        { name: 'Midnight Sun', period: 'Jun – Aug', temp: '14°C', highlight: '24 hours of daylight, puffin colonies on cliffs, green highland routes open' },
        { name: 'Northern Lights', period: 'Sep – Mar', temp: '-1°C', highlight: 'Vibrant Aurora Borealis across dark skies, glacial ice cave expeditions' },
        { name: 'Shoulder', period: 'Apr – May & Sep', temp: '6°C', highlight: 'Crisp clear days, lower campervan rental rates, uncrowded hot springs' }
      ]
    },
    dailyBudget: {
      backpacker: 85,
      comfort: 210,
      luxury: 480,
      currency: 'ISK',
      currencySymbol: 'kr',
      breakdownNote: 'Renting a 4x4 campervan is the most popular way to explore the Ring Road with lodging and wheels in one.'
    },
    topAttractions: [
      {
        name: 'The Golden Circle (Gullfoss, Geysir & Thingvellir)',
        location: 'South Iceland',
        description: 'Gullfoss double waterfall roaring into a canyon, Strokkur shooting boiling water 30m high, and tectonic rift valley.',
        tag: 'Natural Marvel',
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Blue Lagoon & Sky Lagoon Geothermal Spa',
        location: 'Grindavík & Kópavogur',
        description: 'Soak in mineral-rich milky-blue 39°C geothermal seawater framed by black lava fields with silica mud masks.',
        tag: 'Geothermal Spa',
        image: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Jökulsárlón Glacier Lagoon & Diamond Beach',
        location: 'Vatnajökull National Park',
        description: 'Giant electric-blue icebergs breaking off Europe’s largest glacier and washing onto jet-black volcanic sand.',
        tag: 'Glacier Marvel',
        image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Reynisfjara Black Sand Beach & Basalt Columns',
        location: 'Vik',
        description: 'Towering hexagonal basalt rock formations, roaring Atlantic swells, and sea stacks jutting out of the stormy sea.',
        tag: 'Dramatic Coast',
        image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Fresh Arctic Char & Langoustines', description: 'Delicate cold-water trout and sweet butter-seared Icelandic lobster tails from Hofn.', mustTrySpot: 'Pakkhús Restaurant (Hofn)', icon: '🦞' },
      { name: 'Slow-Cooked Icelandic Lamb Stew (Kjötsúpa)', description: 'Hearty warming soup made with free-roaming mountain lamb, root vegetables, and wild herbs.', mustTrySpot: 'Gullfoss cafe & countryside inns', icon: '🍲' },
      { name: 'Famous Icelandic Hot Dog (Pylsur)', description: 'Organic lamb hot dog topped with fried onions, raw onions, sweet brown mustard, and remoulade.', mustTrySpot: 'Bæjarins Beztu Pylsur (Reykjavik)', icon: '🌭' },
      { name: 'Skyr with Wild Arctic Berries', description: 'Traditional creamy Icelandic cultured dairy high in protein, drizzled with heather honey and blueberries.', mustTrySpot: 'Local dairy farms & breakfast bakeries', icon: '🫐' }
    ],
    travelTips: [
      { title: 'Check Vedur.is & SafeTravel.is Daily', advice: 'Icelandic weather changes rapidly; check real-time road conditions before driving the Ring Road.', badge: 'Essential Safety' },
      { title: 'Chase Auroras with Kp Index', advice: 'Look for clear dark skies and Aurora forecast Kp index of 3 or higher between 10 PM and 2 AM.', badge: 'Aurora Hack' },
      { title: '100% Cashless Country', advice: 'Credit/debit cards and contactless mobile pay are accepted everywhere, even at public rest stops.', badge: 'Finance Tip' }
    ],
    transitInfo: 'The 1,332 km Route 1 (Ring Road) encircles the entire island. Renting a 4WD vehicle is recommended for highlands.',
    visaInfo: 'Part of the Schengen Area. 90-day visa-free entry for citizens of over 60 countries.'
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    capital: 'Paris',
    continent: 'Europe',
    tagline: 'Timeless Romance, Fairytale Châteaux & Haute Cuisine Capitals',
    rating: 4.93,
    safetyScore: 93,
    voyagerVotes: '49.8k reviews',
    whyBest: 'France is the most visited country in the world for good reason. Beyond the romantic charm of Paris with the Eiffel Tower and Louvre, France offers the fairytale castles of the Loire Valley, the sun-kissed glamour of the Côte d’Azur French Riviera, lavender fields of Provence, and snow-capped peaks of Chamonix Mont-Blanc.',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Spring (May–Jun) & Autumn (Sep–Oct)',
      months: 'May–June & September–October',
      climateSummary: 'Mild, golden sunshine (18°C–23°C), outdoor cafe terraces, and uncrowded museums and vineyards.',
      seasons: [
        { name: 'Spring', period: 'Apr – Jun', temp: '19°C', highlight: 'Parisian parks in bloom, sidewalk cafes, French Open at Roland Garros' },
        { name: 'Summer', period: 'Jul – Aug', temp: '28°C', highlight: 'Nice & Cannes beaches, lavender blooming in Valensole Provence' },
        { name: 'Autumn', period: 'Sep – Nov', temp: '16°C', highlight: 'Bordeaux and Champagne wine harvests, golden trees along the Seine river' },
        { name: 'Winter', period: 'Dec – Mar', temp: '7°C', highlight: 'Chamonix ski resorts, Alsace Christmas markets in Strasbourg' }
      ]
    },
    dailyBudget: {
      backpacker: 65,
      comfort: 155,
      luxury: 380,
      currency: 'EUR',
      currencySymbol: '€',
      breakdownNote: 'TGV high-speed trains connect Paris to Lyon, Nice, and Bordeaux in 2 to 4 hours.'
    },
    topAttractions: [
      {
        name: 'The Eiffel Tower & Sunset Seine River Cruise',
        location: 'Paris',
        description: 'Watch the Iron Lady sparkle with 20,000 lights every hour on the hour, followed by a romantic riverboat cruise.',
        tag: 'World Icon',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'The Louvre & Musée d’Orsay Treasures',
        location: 'Paris',
        description: 'Admire the Mona Lisa, Venus de Milo, and Monet’s water lilies inside world-class palaces of art.',
        tag: 'Art & Heritage',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Côte d’Azur & Promenade des Anglais',
        location: 'Nice & French Riviera',
        description: 'Azure Mediterranean waters, pastel Belle Époque palaces, yachts in Monaco, and seaside seafood bistros.',
        tag: 'Coastal Glamour',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Mont Saint-Michel Tidal Island Abbey',
        location: 'Normandy',
        description: 'Gothic abbey soaring above dramatic tides that sweep across the bay, looking like a mirage on the horizon.',
        tag: 'Fairytale Abbey',
        image: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Fresh Artisan Croissants & Baguettes', description: 'Flaky, buttery layers with a crisp golden exterior from early morning neighborhood boulangeries.', mustTrySpot: 'Du Pain et des Idées (Paris)', icon: '🥐' },
      { name: 'Boeuf Bourguignon & Duck Confit', description: 'Tender beef braised in red Burgundy wine with pearl onions, mushrooms, and lardon bacon.', mustTrySpot: 'Traditional Parisian Bouillons (Bouillon Chartier)', icon: '🍲' },
      { name: 'Crêpes & Galettes de Sarrasin', description: 'Paper-thin Breton buckwheat savory crêpes filled with Gruyère cheese, ham, and golden egg yolk.', mustTrySpot: 'Breizh Café (Le Marais)', icon: '🥞' },
      { name: 'French Macarons & Crème Brûlée', description: 'Delicate almond meringue shells filled with rich ganache, and rich vanilla custard with caramelized sugar.', mustTrySpot: 'Pierre Hermé / Ladurée', icon: '🧁' }
    ],
    travelTips: [
      { title: 'Always Greet with "Bonjour"', advice: 'Starting any conversation in a shop or cafe with "Bonjour, Madame/Monsieur" unlocks immediate warmth and smiles.', badge: 'Cultural Etiquette' },
      { title: 'Use the Navigo Easy Card in Paris', advice: 'Load digital metro carnets onto your phone or card for cheap €2.15 subway rides throughout Paris.', badge: 'Transit Secret' },
      { title: 'Look for "Menu du Jour"', advice: 'Weekday 2-course lunch specials at top bistros provide gourmet cuisine for just €15-€20.', badge: 'Foodie Value' }
    ],
    transitInfo: 'SNCF TGV trains reach 320 km/h, linking Paris to every major region in France swiftly and comfortably.',
    visaInfo: 'Schengen Area member. 90-day visa-free entry for travelers from US, UK, Australia, Japan, Canada, etc.'
  },
  {
    id: 'greece',
    name: 'Greece',
    flag: '🇬🇷',
    capital: 'Athens',
    continent: 'Europe',
    tagline: 'Sun-Bleached Cycladic Cliffs, Azure Aegean Waters & Classical Wonders',
    rating: 4.95,
    safetyScore: 95,
    voyagerVotes: '38.6k reviews',
    whyBest: 'Greece is the cradle of Western civilization, philosophy, and democracy. The Greek islands offer an unmatched summer lifestyle: whitewashed cliffside villas in Santorini overlooking volcanic calderas, vibrant nightlife in Mykonos, secluded shipwreck coves in Zakynthos, and ancient temples under Mediterranean blue skies.',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Island Hopping Summer & Autumn',
      months: 'May–October',
      climateSummary: 'Glorious sunny Mediterranean days (25°C–31°C) with refreshing sea breezes and warm swimming waters.',
      seasons: [
        { name: 'Peak Summer', period: 'Jul – Aug', temp: '31°C', highlight: 'Vibrant beach clubs, sailing trips, golden sunsets in Oia Santorini' },
        { name: 'Shoulder Bliss', period: 'May – Jun & Sep – Oct', temp: '25°C', highlight: 'Warm sea for swimming, pleasant weather for hiking ancient ruins without crowds' },
        { name: 'Winter Calm', period: 'Nov – Mar', temp: '14°C', highlight: 'Peaceful exploration of the Athens Acropolis and mainland mountain villages' }
      ]
    },
    dailyBudget: {
      backpacker: 55,
      comfort: 130,
      luxury: 340,
      currency: 'EUR',
      currencySymbol: '€',
      breakdownNote: 'High-speed ferries (Blue Star & Seajets) make island hopping between Santorini, Naxos, and Paros easy.'
    },
    topAttractions: [
      {
        name: 'Oia Village Caldera Sunset & Blue Domes',
        location: 'Santorini',
        description: 'The world’s most famous sunset: whitewashed cave houses glowing amber as the sun dips into the Aegean Sea.',
        tag: 'Sunset Miracle',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'The Acropolis & Parthenon',
        location: 'Athens',
        description: 'The 2,500-year-old marble crown of Athens, standing tall over the historic Plaka neighborhood and olive groves.',
        tag: 'Ancient Cradle',
        image: 'https://images.unsplash.com/photo-1555993539-1732916b8235?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Navagio Shipwreck Beach & Blue Caves',
        location: 'Zakynthos',
        description: 'A rusty smuggler ship stranded on a powdery white beach enclosed by towering 200m vertical limestone cliffs.',
        tag: 'Coastal Icon',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Meteora Suspended Monasteries',
        location: 'Thessaly',
        description: 'Centuries-old Eastern Orthodox monasteries precariously perched atop colossal natural rock pillars.',
        tag: 'Spiritual Wonder',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Authentic Souvlaki & Gyros Pita', description: 'Grilled seasoned pork or chicken wrapped in warm pita with tzatziki, ripe tomatoes, onions, and crispy fries.', mustTrySpot: 'Street gyros in Monastiraki (Athens)', icon: '🥙' },
      { name: 'Greek Horiatiki Salad with Barrel Feta', description: 'Sun-ripened tomatoes, crisp cucumbers, Kalamata olives, and a thick block of creamy feta drenched in olive oil.', mustTrySpot: 'Seaside tavernas in Naxos & Paros', icon: '🥗' },
      { name: 'Traditional Moussaka', description: 'Layers of tender eggplant, spiced minced beef, and potatoes baked under a thick golden béchamel crust.', mustTrySpot: 'Family-run tavernas across Crete', icon: '🥘' },
      { name: 'Honey-Glazed Baklava & Loukoumades', description: 'Crisp layers of filo pastry packed with chopped walnuts, spiced cinnamon, and drenched in wild thyme honey.', mustTrySpot: 'Traditional bakeries in Chania', icon: '🍯' }
    ],
    travelTips: [
      { title: 'Book Ferry Tickets in Advance', advice: 'Use Ferryhopper to compare high-speed catamarans and scenic slow car ferries between Aegean islands.', badge: 'Island Transit' },
      { title: 'Visit Acropolis at 8:00 AM', advice: 'Arrive right when the gates open for cool morning temperatures and empty marble pathways before tour groups.', badge: 'Crowd Dodger' },
      { title: 'Always Carry Small Cash for Tavernas', advice: 'Small family tavernas on secluded beaches love cash tips and may offer complimentary raki and watermelon.', badge: 'Hospitality' }
    ],
    transitInfo: 'Frequent ferry connections link Piraeus (Athens) to the Cyclades, Dodecanese, and Ionian islands.',
    visaInfo: 'Schengen Area member. 90-day visa-exempt entry for all eligible international travelers.'
  },
  {
    id: 'spain',
    name: 'Spain',
    flag: '🇪🇸',
    capital: 'Madrid',
    continent: 'Europe',
    tagline: 'Passionate Flamenco, Antoni Gaudí Architecture & Endless Tapas Crawls',
    rating: 4.91,
    safetyScore: 96,
    voyagerVotes: '44.7k reviews',
    whyBest: 'Spain delivers an infectious joy of life. From Antoni Gaudí’s surreal Sagrada Família in Barcelona to the Moorish palaces of the Alhambra in Granada, vibrant tapas bars lining Seville’s cobblestone alleys, and golden Mediterranean beaches, every day in Spain ends with music, laughter, and late-night feasts.',
    heroImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Spring (Apr–Jun) & Autumn (Sep–Oct)',
      months: 'April–June & September–October',
      climateSummary: 'Sunny, comfortable temperatures (21°C–27°C) perfect for outdoor fiestas, patio dining, and coastal walks.',
      seasons: [
        { name: 'Spring', period: 'Apr – Jun', temp: '23°C', highlight: 'Feria de Abril in Seville, blooming patios in Córdoba, pleasant sightseeing' },
        { name: 'Summer', period: 'Jul – Aug', temp: '33°C', highlight: 'Balearic Island beaches in Mallorca & Ibiza, late evening tapas until 1 AM' },
        { name: 'Autumn', period: 'Sep – Nov', temp: '20°C', highlight: 'Wine harvest in La Rioja, quiet beaches, cultural events in Madrid' }
      ]
    },
    dailyBudget: {
      backpacker: 55,
      comfort: 125,
      luxury: 310,
      currency: 'EUR',
      currencySymbol: '€',
      breakdownNote: 'Renfe AVE high-speed trains connect Madrid and Barcelona in just 2h 30m.'
    },
    topAttractions: [
      {
        name: 'Basílica de la Sagrada Família & Park Güell',
        location: 'Barcelona',
        description: 'Antoni Gaudí’s architectural masterpiece with stained-glass tree pillars, soaring spires, and mosaic dragon terraces.',
        tag: 'Architectural Wonder',
        image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'The Alhambra & Nasrid Palaces',
        location: 'Granada',
        description: 'Breathtaking 13th-century Moorish fortress with intricate arabesque carvings, courtyards of the lions, and cypress gardens.',
        tag: 'Moorish Heritage',
        image: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Plaza de España & Royal Alcázar',
        location: 'Seville',
        description: 'Grand semi-circular palace with painted ceramic tile bridges, flamenco performances, and lush orange-tree courtyards.',
        tag: 'Andalusian Soul',
        image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Madrid Royal Palace & Prado Museum',
        location: 'Madrid',
        description: 'Vast regal courtyards and world-class master paintings by Goya, Velázquez, and El Greco.',
        tag: 'Royal Capital',
        image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Authentic Paella Valenciana', description: 'Saffron-infused rice simmered with chicken, rabbit, green beans, and rosemary, served with a crispy socarrat crust.', mustTrySpot: 'La Pepica (Valencia beachfront)', icon: '🥘' },
      { name: 'Jamón Ibérico de Bellota', description: 'Acorn-fed cured Iberian ham carved paper-thin, melting with nutty, savory umami flavors on your tongue.', mustTrySpot: 'Mercado de San Miguel (Madrid)', icon: '🥓' },
      { name: 'Crispy Churros con Chocolate', description: 'Fresh golden-fried dough flutes dipped into thick, velvety dark Spanish drinking chocolate.', mustTrySpot: 'Chocolatería San Ginés (Madrid, open 24/7)', icon: '☕' },
      { name: 'Pintxos & Tapas Variety', description: 'Gambas al ajillo garlic shrimp, patatas bravas, and Spanish tortilla potato omelette.', mustTrySpot: 'Calle Laurel (Logroño) & San Sebastián old town', icon: '🍢' }
    ],
    travelTips: [
      { title: 'Embrace Spanish Dining Hours', advice: 'Lunch is enjoyed from 2:00 PM to 4:00 PM, and dinner rarely starts before 9:00 PM or 10:00 PM.', badge: 'Local Schedule' },
      { title: 'Free Tapas with Drinks in Granada', advice: 'In Granada, ordering any glass of wine or beer automatically comes with a generous complimentary tapas dish!', badge: 'Budget Secret' },
      { title: 'Sagrada Família Tower Access', advice: 'Book the Nativity Facade tower ticket for panoramic views overlooking Barcelona down to the sea.', badge: 'Pro Tip' }
    ],
    transitInfo: 'The AVE high-speed train network is the second largest in the world after China, connecting all key regions seamlessly.',
    visaInfo: 'Schengen Area member. 90-day visa-free entry for international travelers.'
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    flag: '🇳🇿',
    capital: 'Wellington',
    continent: 'Adventure & Wilderness',
    tagline: 'Middle-Earth Fjords, Glowworm Caverns & Outdoor Adventure Capital',
    rating: 4.96,
    safetyScore: 99,
    voyagerVotes: '29.3k reviews',
    whyBest: 'New Zealand (Aotearoa) is the undisputed outdoor adventure capital of our planet. From the dramatic sheer granite peaks and thundering waterfalls of Milford Sound to the geothermal wonders of Rotorua, glowing Waitomo caves, and the cinematic Lord of the Rings filming landscapes in Queenstown.',
    heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Southern Summer (Dec–Mar) & Autumn (Apr–May)',
      months: 'December–March & April–May',
      climateSummary: 'Long sunny days (19°C–25°C) ideal for road tripping in campervans, hiking Great Walks, and fjord cruises.',
      seasons: [
        { name: 'Summer', period: 'Dec – Feb', temp: '24°C', highlight: 'Pristine lake swims, glacier heli-hikes, outdoor camping & hiking' },
        { name: 'Autumn', period: 'Mar – May', temp: '16°C', highlight: 'Golden foliage in Arrowtown, Central Otago Pinot Noir wine harvests' },
        { name: 'Winter', period: 'Jun – Aug', temp: '6°C', highlight: 'World-class skiing at The Remarkables & Cardrona in Queenstown' }
      ]
    },
    dailyBudget: {
      backpacker: 70,
      comfort: 175,
      luxury: 410,
      currency: 'NZD',
      currencySymbol: 'NZ$',
      breakdownNote: 'Self-contained campervans provide full freedom to camp across designated scenic conservation sites.'
    },
    topAttractions: [
      {
        name: 'Milford Sound (Piopiotahi) Fjord Cruise',
        location: 'Fiordland National Park',
        description: 'Cruising beneath sheer 1,200m vertical rock cliffs with thundering Stirling Falls spraying rainbow mist on the deck.',
        tag: 'Eighth Wonder',
        image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Queenstown & Lake Wakatipu Adventure Hub',
        location: 'South Island',
        description: 'Bungy jumping at Kawarau Bridge, scenic skyline gondola, jet boating through canyons, and lakeside Pinot Noir.',
        tag: 'Adrenaline Rush',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Hobbiton Movie Set & Waitomo Glowworm Caves',
        location: 'Waikato',
        description: 'Stroll past 44 Hobbit holes in lush green Shire pastures, then drift in silence under thousands of bioluminescent glowworms.',
        tag: 'Cinematic Wonder',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Traditional Māori Hāngī Feast', description: 'Meats and root vegetables slow-cooked for hours under the earth on hot volcanic stones.', mustTrySpot: 'Te Puia (Rotorua)', icon: '🍖' },
      { name: 'Steamed Green-Lipped Mussels', description: 'Plump native New Zealand mussels cooked in Marlborough Sauvignon Blanc, garlic, and fresh cream.', mustTrySpot: 'The Mussel Pot (Havelock)', icon: '🦪' },
      { name: 'Fergburger Gourmet Burgers', description: 'Massive legendary burgers made with prime New Zealand beef, brie cheese, and cranberry sauce.', mustTrySpot: 'Fergburger (Queenstown)', icon: '🍔' }
    ],
    travelTips: [
      { title: 'Book the Interislander Ferry Early', advice: 'Cruising the Cook Strait between North and South Islands is one of the world’s most scenic ferry routes.', badge: 'Transit' },
      { title: 'Respect the Tiaki Promise', advice: 'Pledge to protect the pristine nature and sacred Māori heritage by leaving zero trace behind.', badge: 'Eco Pledge' }
    ],
    transitInfo: 'Scenic road tripping via car or campervan on well-maintained scenic highways with drive-on-the-left rules.',
    visaInfo: 'NZeTA (New Zealand Electronic Travel Authority) easily obtained online for citizens of 60 visa-waiver nations.'
  },
  {
    id: 'morocco',
    name: 'Morocco',
    flag: '🇲🇦',
    capital: 'Rabat',
    continent: 'Adventure & Wilderness',
    tagline: 'Imperial Medinas, Spiced Souks & Sahara Desert Stargazing',
    rating: 4.89,
    safetyScore: 91,
    voyagerVotes: '32.1k reviews',
    whyBest: 'Morocco is a sensory kaleidoscope just hours from Europe. From the bustling labyrinth of Marrakech’s Jemaa el-Fnaa square filled with storytellers and acrobats to the dreamy blue-washed streets of Chefchaouen, and luxury Berber glamping under the star-studded Sahara desert sky atop rippling golden dunes.',
    heroImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
    ],
    bestSeason: {
      title: 'Spring (Mar–May) & Autumn (Sep–Nov)',
      months: 'March–May & September–November',
      climateSummary: 'Comfortable desert and city weather (20°C–26°C), avoiding the intense heat of summer.',
      seasons: [
        { name: 'Spring', period: 'Mar – May', temp: '24°C', highlight: 'Green valleys in the Atlas mountains, blooming roses in Kelaat M’Gouna' },
        { name: 'Autumn', period: 'Sep – Nov', temp: '25°C', highlight: 'Warm desert nights for Sahara glamping, dates harvest season' }
      ]
    },
    dailyBudget: {
      backpacker: 35,
      comfort: 90,
      luxury: 240,
      currency: 'MAD',
      currencySymbol: 'DH',
      breakdownNote: 'Staying in historic traditional Riads with central mosaic courtyards offers incredible luxury at affordable prices.'
    },
    topAttractions: [
      {
        name: 'Marrakech Medina & Jemaa el-Fnaa',
        location: 'Marrakech',
        description: 'Labyrinthine spice souks, snake charmers, Bahia Palace mosaics, and rooftop mint tea at sunset.',
        tag: 'Imperial Medina',
        image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Erg Chebbi Sahara Desert Dunes',
        location: 'Merzouga',
        description: 'Camel trekking across 150m high golden sand dunes, drumming by the campfire, and stargazing at the Milky Way.',
        tag: 'Desert Magic',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Chefchaouen - The Blue Pearl City',
        location: 'Rif Mountains',
        description: 'Every alleyway, staircase, and doorway is painted in soothing shades of cobalt and powder blue.',
        tag: 'Fairytale Town',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'
      }
    ],
    signatureDishes: [
      { name: 'Slow-Cooked Claypot Tagine', description: 'Tender lamb or chicken simmered with preserved lemons, green olives, prunes, and toasted almonds.', mustTrySpot: 'Historic Riads in Marrakech and Fes', icon: '🍲' },
      { name: 'Fresh Moroccan Mint Tea (Berber Whiskey)', description: 'Gunpowder green tea brewed with fresh spearmint leaves and poured from high above into ornate glasses.', mustTrySpot: 'Rooftop cafes overlooking Jemaa el-Fnaa', icon: '🍵' },
      { name: 'Fluffy Seven-Vegetable Couscous', description: 'Steamed semolina grains topped with braised beef, pumpkin, carrots, zucchini, and spiced broth.', mustTrySpot: 'Traditional Friday family feasts in Fes', icon: '🥘' }
    ],
    travelTips: [
      { title: 'Friendly Haggling in Souks', advice: 'Bargaining for carpets, leather, and spices is a polite social dance; counter with around 50% of the opening quote.', badge: 'Souk Secret' },
      { title: 'Stay in a Traditional Riad', advice: 'Skip Western hotels; historic Riads offer tranquil interior fountains, tiled pools, and personalized hospitality.', badge: 'Stay Tip' }
    ],
    transitInfo: 'The Al Boraq high-speed train connects Tangier to Casablanca in just 2 hours at 320 km/h.',
    visaInfo: 'Visa-free entry for up to 90 days for travelers from US, EU, UK, Canada, Australia, and many others.'
  }
];
