import { 
  DiseaseDetectionResult, 
  WeatherData, 
  WateringLog, 
  MandiPrice, 
  CropCalendarTask, 
  FarmFieldProfile 
} from '../types';

export const INITIAL_WEATHER: WeatherData = {
  city: 'Mandya (Sugar City)',
  state: 'Karnataka, India',
  condition: 'Partly Cloudy & Pleasant',
  temperature: 28.5,
  feelsLike: 30.1,
  humidity: 71,
  rainProbability: 25,
  windSpeed: 11.2,
  windDirection: 'SSW',
  uvIndex: 6,
  soilTemperature: 24.8,
  sunrise: '06:14 AM',
  sunset: '06:28 PM',
  forecast: [
    { day: 'Today', condition: 'Partly Cloudy', tempMax: 31, tempMin: 22, rainProb: 25, icon: 'partly-cloudy' },
    { day: 'Mon', condition: 'Sunny & Warm', tempMax: 32, tempMin: 21, rainProb: 10, icon: 'sun' },
    { day: 'Tue', condition: 'Heavy Showers', tempMax: 27, tempMin: 21, rainProb: 75, icon: 'rain' },
    { day: 'Wed', condition: 'Thunderstorm', tempMax: 26, tempMin: 20, rainProb: 85, icon: 'thunder' },
    { day: 'Thu', condition: 'Cloudy with Breeze', tempMax: 29, tempMin: 21, rainProb: 30, icon: 'cloud' },
  ],
  farmingAdvisory: {
    irrigation: 'Soil moisture is at 32% (Dry). Supplemental morning drip of 35 mins recommended before midday.',
    spraying: 'Favorable spraying window: 07:00 AM – 10:30 AM (mild wind <12 km/h). Suspend spraying on Tuesday.',
    harvesting: 'Complete pulse drying and threshing within next 48 hours before Tuesday rain showers.',
    fertilizer: 'Apply nitrogen top-dressing to sugarcane and maize during tomorrow morning irrigation cycle.',
    postponeIrrigationReason: 'Upcoming Rain Warning: Heavy showers (75%) forecast for Tuesday. Avoid over-irrigating root crops to prevent waterlogging.'
  }
};

export const INITIAL_MANDI_PRICES: MandiPrice[] = [
  // 1. Grains & Cereals (ಧಾನ್ಯಗಳು)
  {
    id: 'm-1',
    cropName: 'Paddy (Jyothi / Sona Masoori)',
    regionalName: 'ಭತ್ತ (ಜ್ಯೋತಿ / ಸೋನಾ ಮಸೂರಿ)',
    category: 'Grains & Cereals',
    marketName: 'Mandya APMC Market',
    state: 'Karnataka',
    modalPrice: 2450,
    minPrice: 2280,
    maxPrice: 2620,
    priceUnit: '₹ / Quintal',
    changePercent: +2.8,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet / Karnataka State APMC Portal'
  },
  {
    id: 'm-2',
    cropName: 'Paddy (Basmati / Super Fine)',
    regionalName: 'ಭತ್ತ (ಬಾಸ್ಮತಿ / ಸೂಪರ್ ಫೈನ್)',
    category: 'Grains & Cereals',
    marketName: 'Raichur APMC',
    state: 'Karnataka',
    modalPrice: 3250,
    minPrice: 3000,
    maxPrice: 3500,
    priceUnit: '₹ / Quintal',
    changePercent: +1.9,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-3',
    cropName: 'Ragi / Finger Millet (Native Siri)',
    regionalName: 'ರಾಗಿ (ಕರ್ನಾಟಕ ಸಿರಿಧಾನ್ಯ)',
    category: 'Grains & Cereals',
    marketName: 'Ramanagara APMC',
    state: 'Karnataka',
    modalPrice: 3850,
    minPrice: 3600,
    maxPrice: 4100,
    priceUnit: '₹ / Quintal',
    changePercent: -1.2,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-4',
    cropName: 'Maize / Corn (Yellow Feed)',
    regionalName: 'ಮೆಕ್ಕೆಜೋಳ (ಹಳದಿ ಮುಸುಕಿನ ಜೋಳ)',
    category: 'Grains & Cereals',
    marketName: 'Davangere APMC',
    state: 'Karnataka',
    modalPrice: 2240,
    minPrice: 2050,
    maxPrice: 2380,
    priceUnit: '₹ / Quintal',
    changePercent: +1.5,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-5',
    cropName: 'Jowar / White Sorghum',
    regionalName: 'ಬಿಳಿ ಜೋಳ (ಮಾಲ್ದಂಡಿ)',
    category: 'Grains & Cereals',
    marketName: 'Vijayapura APMC',
    state: 'Karnataka',
    modalPrice: 4100,
    minPrice: 3850,
    maxPrice: 4400,
    priceUnit: '₹ / Quintal',
    changePercent: +3.0,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-6',
    cropName: 'Wheat / Sharbati Godhi',
    regionalName: 'ಗೋಧಿ (ಶರಬತಿ)',
    category: 'Grains & Cereals',
    marketName: 'Hubballi APMC',
    state: 'Karnataka',
    modalPrice: 2750,
    minPrice: 2550,
    maxPrice: 2950,
    priceUnit: '₹ / Quintal',
    changePercent: +0.8,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },

  // 2. Vegetables (ತರಕಾರಿಗಳು)
  {
    id: 'm-7',
    cropName: 'Tomato (Hybrid Native)',
    regionalName: 'ಟೊಮೆಟೊ (ಹೈಬ್ರಿಡ್ ನಾಟಿ)',
    category: 'Vegetables',
    marketName: 'Kolar APMC Market (Asia Hub)',
    state: 'Karnataka',
    modalPrice: 1950,
    minPrice: 1650,
    maxPrice: 2250,
    priceUnit: '₹ / Quintal',
    changePercent: +8.4,
    date: 'Today (02 Nov 2026)',
    source: 'Kolar APMC Tomato Mandi'
  },
  {
    id: 'm-8',
    cropName: 'Onion (Red Bellary Medium)',
    regionalName: 'ಈರುಳ್ಳಿ (ಕೆಂಪು ಬಳ್ಳಾರಿ)',
    category: 'Vegetables',
    marketName: 'Yeshwanthpur APMC (Bengaluru)',
    state: 'Karnataka',
    modalPrice: 2850,
    minPrice: 2400,
    maxPrice: 3200,
    priceUnit: '₹ / Quintal',
    changePercent: -2.5,
    date: 'Today (02 Nov 2026)',
    source: 'Karnataka State APMC'
  },
  {
    id: 'm-9',
    cropName: 'Potato / Alugadde (Kufri Jyoti)',
    regionalName: 'ಆಲೂಗಡ್ಡೆ (ಕುಫ್ರಿ ಜ್ಯೋತಿ)',
    category: 'Vegetables',
    marketName: 'Hassan APMC Market',
    state: 'Karnataka',
    modalPrice: 1750,
    minPrice: 1550,
    maxPrice: 1950,
    priceUnit: '₹ / Quintal',
    changePercent: +1.1,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-10',
    cropName: 'Green Chilli (G-4 Fresh)',
    regionalName: 'ಹಸಿಮೆಣಸಿನಕಾಯಿ (ಜಿ-4)',
    category: 'Vegetables',
    marketName: 'Belagavi APMC',
    state: 'Karnataka',
    modalPrice: 4200,
    minPrice: 3800,
    maxPrice: 4600,
    priceUnit: '₹ / Quintal',
    changePercent: +4.2,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-11',
    cropName: 'Cabbage / Elekosu',
    regionalName: 'ಎಲೆಕೋಸು',
    category: 'Vegetables',
    marketName: 'Chikkaballapura APMC',
    state: 'Karnataka',
    modalPrice: 950,
    minPrice: 800,
    maxPrice: 1150,
    priceUnit: '₹ / Quintal',
    changePercent: -3.0,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-12',
    cropName: 'Carrot (Ooty Orange)',
    regionalName: 'ಕ್ಯಾರೆಟ್',
    category: 'Vegetables',
    marketName: 'Bengaluru Binny Mill APMC',
    state: 'Karnataka',
    modalPrice: 3100,
    minPrice: 2800,
    maxPrice: 3450,
    priceUnit: '₹ / Quintal',
    changePercent: +2.0,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-13',
    cropName: 'Brinjal / Eggplant (Gulla / Round)',
    regionalName: 'ಬದನೆಕಾಯಿ (ಮಟ್ಟು ಗುಳ್ಳ / ಉಂಡೆ)',
    category: 'Vegetables',
    marketName: 'Mysuru APMC Bandipalya',
    state: 'Karnataka',
    modalPrice: 1650,
    minPrice: 1400,
    maxPrice: 1900,
    priceUnit: '₹ / Quintal',
    changePercent: +1.7,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-14',
    cropName: 'Capsicum / Bell Pepper (Green)',
    regionalName: 'ದಪ್ಪಮೆಣಸಿನಕಾಯಿ (ಕ್ಯಾಪ್ಸಿಕಂ)',
    category: 'Vegetables',
    marketName: 'Kolar APMC Market',
    state: 'Karnataka',
    modalPrice: 3400,
    minPrice: 3000,
    maxPrice: 3800,
    priceUnit: '₹ / Quintal',
    changePercent: +5.5,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },

  // 3. Plantation & Cash Crops (ವಾಣಿಜ್ಯ ಮತ್ತು ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು)
  {
    id: 'm-15',
    cropName: 'Arecanut / Supari (Rashi Edible)',
    regionalName: 'ಅಡಿಕೆ (ರಾಶಿ ಇಡಿ / ಚಾಲಿ)',
    category: 'Plantation & Cash Crops',
    marketName: 'Shivamogga APMC Arecanut Mandi',
    state: 'Karnataka',
    modalPrice: 51200,
    minPrice: 48500,
    maxPrice: 53800,
    priceUnit: '₹ / Quintal',
    changePercent: +3.6,
    date: 'Today (02 Nov 2026)',
    source: 'MAMCOS / CAMPCO Bulletin'
  },
  {
    id: 'm-16',
    cropName: 'Arecanut / Bette (Channagiri Special)',
    regionalName: 'ಅಡಿಕೆ (ಬೆಟ್ಟೆ - ಚನ್ನಗಿರಿ)',
    category: 'Plantation & Cash Crops',
    marketName: 'Channagiri APMC Market',
    state: 'Karnataka',
    modalPrice: 54600,
    minPrice: 52000,
    maxPrice: 56900,
    priceUnit: '₹ / Quintal',
    changePercent: +2.1,
    date: 'Today (02 Nov 2026)',
    source: 'TUMCOS / Agmarknet'
  },
  {
    id: 'm-17',
    cropName: 'Coconut / Tiptur Copra (Dry Copra)',
    regionalName: 'ತೆಂಗಿನಕಾಯಿ / ಕೊಬ್ಬರಿ (ತಿಪಟೂರು ಉಂಡೆ)',
    category: 'Plantation & Cash Crops',
    marketName: 'Tiptur APMC Market',
    state: 'Karnataka',
    modalPrice: 11400,
    minPrice: 10800,
    maxPrice: 12200,
    priceUnit: '₹ / Quintal',
    changePercent: +4.8,
    date: 'Today (02 Nov 2026)',
    source: 'Coconut Development Board (CDB)'
  },
  {
    id: 'm-18',
    cropName: 'Cotton (Medium / Long Staple DCH-32)',
    regionalName: 'ಹತ್ತಿ (ಡಿ.ಸಿ.ಎಚ್ ೩೨)',
    category: 'Plantation & Cash Crops',
    marketName: 'Raichur Cotton Yard',
    state: 'Karnataka',
    modalPrice: 7350,
    minPrice: 7000,
    maxPrice: 7680,
    priceUnit: '₹ / Quintal',
    changePercent: +3.2,
    date: 'Today (02 Nov 2026)',
    source: 'Cotton Corporation of India (CCI)'
  },
  {
    id: 'm-19',
    cropName: 'Sugarcane (Co-86032 High Brix)',
    regionalName: 'ಕಬ್ಬು (ಸಕ್ಕರೆ ಗಿರಣಿ ದರ)',
    category: 'Plantation & Cash Crops',
    marketName: 'Mandya & Mysuru Sugar Mill Gate',
    state: 'Karnataka',
    modalPrice: 3200,
    minPrice: 3100,
    maxPrice: 3320,
    priceUnit: '₹ / Tonne',
    changePercent: +0.6,
    date: 'Today (02 Nov 2026)',
    source: 'State FRP Sugar Directorate'
  },
  {
    id: 'm-20',
    cropName: 'Coffee (Parchment Arabica)',
    regionalName: 'ಕಾಫಿ (ಅರೇಬಿಕಾ ಪಾರ್ಚ್‌ಮೆಂಟ್)',
    category: 'Plantation & Cash Crops',
    marketName: 'Chikkamagaluru & Hassan Market',
    state: 'Karnataka',
    modalPrice: 17800,
    minPrice: 16900,
    maxPrice: 18600,
    priceUnit: '₹ / 50Kg Bag',
    changePercent: +5.1,
    date: 'Today (02 Nov 2026)',
    source: 'Coffee Board of India'
  },

  // 4. Spices (ಸಾಂಬಾರ ಪದಾರ್ಥಗಳು)
  {
    id: 'm-21',
    cropName: 'Dry Red Chilli (Byadgi Kaddi)',
    regionalName: 'ಬ್ಯಾಡಗಿ ಒಣಮೆಣಸಿನಕಾಯಿ (ಕಡ್ಡಿ)',
    category: 'Spices',
    marketName: 'Byadgi APMC Market (Haveri)',
    state: 'Karnataka',
    modalPrice: 36500,
    minPrice: 32000,
    maxPrice: 41000,
    priceUnit: '₹ / Quintal',
    changePercent: +6.4,
    date: 'Today (02 Nov 2026)',
    source: 'Byadgi APMC Chilli Bulletin'
  },
  {
    id: 'm-22',
    cropName: 'Ginger / Shunti (Fresh Green)',
    regionalName: 'ಶುಂಠಿ (ಹಸಿ ಶುಂಠಿ)',
    category: 'Spices',
    marketName: 'Hunsur & Hassan APMC',
    state: 'Karnataka',
    modalPrice: 6200,
    minPrice: 5600,
    maxPrice: 6900,
    priceUnit: '₹ / 60Kg Bag',
    changePercent: +7.2,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-23',
    cropName: 'Garlic / Bellulli (Special Big)',
    regionalName: 'ಬೆಳ್ಳುಳ್ಳಿ (ನಾಟಿ ದೊಡ್ಡ ಗಾತ್ರ)',
    category: 'Spices',
    marketName: 'Yeshwanthpur APMC (Bengaluru)',
    state: 'Karnataka',
    modalPrice: 18500,
    minPrice: 16500,
    maxPrice: 21000,
    priceUnit: '₹ / Quintal',
    changePercent: -1.8,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-24',
    cropName: 'Turmeric / Arishina (Salem / Finger)',
    regionalName: 'ಅರಿಶಿನ (ಸೇಲಂ ಬೆರಳು)',
    category: 'Spices',
    marketName: 'Chamarajanagar APMC',
    state: 'Karnataka',
    modalPrice: 14200,
    minPrice: 13100,
    maxPrice: 15400,
    priceUnit: '₹ / Quintal',
    changePercent: +2.5,
    date: 'Today (02 Nov 2026)',
    source: 'Spices Board of India'
  },
  {
    id: 'm-25',
    cropName: 'Black Pepper / Menasu (Malabar Bold)',
    regionalName: 'ಕಾಳುಮೆಣಸು (ಮಲಬಾರ್ ಬೋಲ್ಡ್)',
    category: 'Spices',
    marketName: 'Madikeri (Kodagu) APMC',
    state: 'Karnataka',
    modalPrice: 64500,
    minPrice: 62000,
    maxPrice: 67000,
    priceUnit: '₹ / Quintal',
    changePercent: +1.8,
    date: 'Today (02 Nov 2026)',
    source: 'Spices Board of India'
  },

  // 5. Pulses & Oilseeds (ದ್ವಿದಳ ಧಾನ್ಯ & ಎಣ್ಣೆಕಾಳುಗಳು)
  {
    id: 'm-26',
    cropName: 'Tur Dal / Pigeon Pea (Red Gram Gulyal)',
    regionalName: 'ತೊಗರಿ ಬೇಳೆ (ಗುಲ್ಯಾಲ ಕೆಂಪು ತೊಗರಿ)',
    category: 'Pulses & Oilseeds',
    marketName: 'Kalaburagi APMC (Tur Bowl)',
    state: 'Karnataka',
    modalPrice: 9800,
    minPrice: 9200,
    maxPrice: 10400,
    priceUnit: '₹ / Quintal',
    changePercent: +3.8,
    date: 'Today (02 Nov 2026)',
    source: 'Kalaburagi APMC'
  },
  {
    id: 'm-27',
    cropName: 'Bengal Gram / Chana (Desi)',
    regionalName: 'ಕಡಲೆ (ದೇಶಿ ಕಂದು)',
    category: 'Pulses & Oilseeds',
    marketName: 'Gadag APMC Market',
    state: 'Karnataka',
    modalPrice: 6250,
    minPrice: 5900,
    maxPrice: 6550,
    priceUnit: '₹ / Quintal',
    changePercent: +1.2,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-28',
    cropName: 'Groundnut / Peanut (Pod with Shell)',
    regionalName: 'ಕಡಲೆಕಾಯಿ / ನೆಲಗಡಲೆ',
    category: 'Pulses & Oilseeds',
    marketName: 'Challakere APMC (Chitradurga)',
    state: 'Karnataka',
    modalPrice: 6950,
    minPrice: 6500,
    maxPrice: 7350,
    priceUnit: '₹ / Quintal',
    changePercent: +2.4,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },
  {
    id: 'm-29',
    cropName: 'Soyabean (Yellow Round)',
    regionalName: 'ಸೋಯಾಬೀನ್ (ಹಳದಿ)',
    category: 'Pulses & Oilseeds',
    marketName: 'Belagavi APMC',
    state: 'Karnataka',
    modalPrice: 4650,
    minPrice: 4400,
    maxPrice: 4850,
    priceUnit: '₹ / Quintal',
    changePercent: -0.8,
    date: 'Today (02 Nov 2026)',
    source: 'Agmarknet Karnataka'
  },

  // 6. Fruits (ಹಣ್ಣುಗಳು)
  {
    id: 'm-30',
    cropName: 'Banana / Balehannu (Yelakki Native)',
    regionalName: 'ಏಲಕ್ಕಿ ಬಾಳೆಹಣ್ಣು (ನಾಟಿ)',
    category: 'Fruits',
    marketName: 'Maddur / Mandya Banana APMC',
    state: 'Karnataka',
    modalPrice: 3800,
    minPrice: 3400,
    maxPrice: 4200,
    priceUnit: '₹ / Quintal',
    changePercent: +4.5,
    date: 'Today (02 Nov 2026)',
    source: 'HOPCOMS / Mandya APMC'
  },
  {
    id: 'm-31',
    cropName: 'Pomegranate / Dalimbe (Bhagwa Red)',
    regionalName: 'ದಾಳಿಂಬೆ (ಭಗವಾ ಕೆಂಪು)',
    category: 'Fruits',
    marketName: 'Kushtagi / Bagalkote APMC',
    state: 'Karnataka',
    modalPrice: 12500,
    minPrice: 10500,
    maxPrice: 14800,
    priceUnit: '₹ / Quintal',
    changePercent: +5.8,
    date: 'Today (02 Nov 2026)',
    source: 'National Horticulture Board'
  },
  {
    id: 'm-32',
    cropName: 'Mango / Mavina Hannu (Alphonso / Badami)',
    regionalName: 'ಮಾವಿನಹಣ್ಣು (ಬಾದಾಮಿ / ಆಪೂಸ್)',
    category: 'Fruits',
    marketName: 'Srinivasapura APMC (Kolar)',
    state: 'Karnataka',
    modalPrice: 8500,
    minPrice: 7200,
    maxPrice: 9800,
    priceUnit: '₹ / Quintal',
    changePercent: +2.0,
    date: 'Today (02 Nov 2026)',
    source: 'Karnataka State Mango Development Board'
  }
];

export const INITIAL_CROP_TASKS: CropCalendarTask[] = [
  {
    id: 'task-1',
    title: 'Top-Dress Organic Bio-NPK Fertilizer',
    regionalTitle: 'ಜೈವಿಕ ಗೊಬ್ಬರ (Bio-NPK) ಸಿಂಪಡಣೆ',
    category: 'fertilizing',
    dueDate: 'Tomorrow Morning (07:00 AM)',
    status: 'pending',
    growthStage: 'Tillering Phase (Day 42/120)',
    cropName: 'Paddy / Rice (Main Field)',
    instructions: 'Apply 25kg Vermicompost mixed with Azospirillum along irrigation furrows.'
  },
  {
    id: 'task-2',
    title: 'Morning Drip Irrigation Cycle (35 mins)',
    regionalTitle: 'ಬೆಳಗಿನ ಹನಿ ನೀರಾವರಿ (35 ನಿಮಿಷ)',
    category: 'watering',
    dueDate: 'Today (06:30 AM - 07:15 AM)',
    status: 'pending',
    growthStage: 'Vegetative Canopy Growth',
    cropName: 'Tomato (Polyhouse 02)',
    instructions: 'Soil moisture is dry (32%). Drip water before high noon sun.'
  },
  {
    id: 'task-3',
    title: 'Pest Scout & Yellow Sticky Trap Inspection',
    regionalTitle: 'ಕೀಟ ತಪಾಸಣೆ ಮತ್ತು ಹಳದಿ ಬಲೆ ಪರಿಶೀಲನೆ',
    category: 'pest_control',
    dueDate: 'Tuesday Afternoon',
    status: 'pending',
    growthStage: 'Flowering Initiation',
    cropName: 'Tomato (Polyhouse 02)',
    instructions: 'Check leaf undersides for early sucking aphids or whiteflies before midweek rains.'
  },
  {
    id: 'task-4',
    title: 'Pre-Harvest Drain Field Bunds',
    regionalTitle: 'ಭತ್ತ ಕೊಯ್ಲು ಪೂರ್ವ ನೀರು ಬಸಿದು ತೆಗೆಯುವುದು',
    category: 'harvesting',
    dueDate: 'In 3 Weeks',
    status: 'pending',
    growthStage: 'Grain Hardening / Maturity',
    cropName: 'Paddy / Rice (Main Field)',
    instructions: 'Drain remaining field water 10 days before combine harvester entry.'
  }
];

export const SOIL_PH_INFO = {
  sampleValue: 6.5,
  status: 'Slightly Acidic' as const,
  idealRangeText: 'Ideal for most Karnataka field crops (6.0 - 7.0)',
  disclaimer: 'Note: pH alone does not determine exact fertilizer needs. Soil nutrients (NPK), organic matter, and local soil structure must be evaluated.',
  cropSuitability: [
    { crop: 'Paddy / Rice (ಭತ್ತ)', idealPh: '5.5 - 6.5', status: 'Optimal (6.5)' },
    { crop: 'Tomato (ಟೊಮೆಟೊ)', idealPh: '6.0 - 6.8', status: 'Optimal (6.5)' },
    { crop: 'Sugarcane (ಕಬ್ಬು)', idealPh: '6.0 - 7.5', status: 'Optimal (6.5)' },
    { crop: 'Maize (ಮೆಕ್ಕೆಜೋಳ)', idealPh: '5.8 - 7.0', status: 'Optimal (6.5)' },
    { crop: 'Cotton (ಹತ್ತಿ)', idealPh: '6.0 - 7.5', status: 'Optimal (6.5)' },
    { crop: 'Coffee (ಕಾಫಿ)', idealPh: '5.0 - 6.0', status: 'Tolerable (Near upper limit)' }
  ]
};

export const MULTI_FARM_FIELDS: FarmFieldProfile[] = [
  {
    id: 'field-1',
    name: 'Demo Farm (Main Field)',
    regionalName: 'ಮುಖ್ಯ ಗದ್ದೆ (ಭತ್ತ)',
    cropType: 'Paddy (Rice - Sona Masoori)',
    soilType: 'Red Sandy Loam with Clay Subsoil',
    farmSizeAcres: 2.5,
    plantingDate: '15 Sep 2026',
    growthStage: 'Active Tillering (Day 47 of 120)',
    daysSincePlanting: 47,
    totalCycleDays: 120,
    currentMoisture: 32,
    currentPh: 6.5
  },
  {
    id: 'field-2',
    name: 'Polyhouse 02 (Precision Bed)',
    regionalName: 'ಪಾಲಿಹೌಸ್ 02 (ಟೊಮೆಟೊ)',
    cropType: 'Tomato (Hybrid Arka Rakshak)',
    soilType: 'Organic Compost & Cocopeat Mix',
    farmSizeAcres: 1.0,
    plantingDate: '01 Oct 2026',
    growthStage: 'Early Flowering & Trellis',
    daysSincePlanting: 31,
    totalCycleDays: 90,
    currentMoisture: 45,
    currentPh: 6.4
  },
  {
    id: 'field-3',
    name: 'East Plot (Sugarcane Block)',
    regionalName: 'ಪೂರ್ವ ಜಮೀನು (ಕಬ್ಬು)',
    cropType: 'Sugarcane (Co-86032)',
    soilType: 'Alluvial Loam',
    farmSizeAcres: 3.0,
    plantingDate: '15 Jul 2026',
    growthStage: 'Grand Growth Phase (Cane Formation)',
    daysSincePlanting: 108,
    totalCycleDays: 360,
    currentMoisture: 58,
    currentPh: 6.8
  }
];

export const SAMPLE_DISEASES: DiseaseDetectionResult[] = [
  {
    id: 'sample-1',
    cropName: 'Tomato (ಟೊಮೆಟೊ)',
    possibleDisease: 'Tomato Early Blight',
    scientificName: 'Alternaria solani',
    confidence: 94.2,
    severity: 'Moderate',
    symptoms: [
      'Concentric dark rings (target spot appearance) on older lower leaves',
      'Yellow chlorotic halos surrounding brown lesions',
      'Premature defoliation starting from the soil line upwards'
    ],
    immediateSteps: [
      'Prune and safely burn or discard infected lower foliage immediately',
      'Switch strictly to root drip irrigation to keep leaf canopy dry',
      'Disinfect pruning shears with 70% alcohol between plant cuts'
    ],
    organicRemedies: [
      'Neem Seed Kernel Extract (NSKE 5%) sprayed in late afternoon',
      'Copper-based organic fungicide (Bordeaux mixture 1%) or Bacillus subtilis bio-fungicide',
      'Trichoderma harzianum soil drenching around root zones'
    ],
    chemicalRemedies: [
      'Mancozeb 75% WP @ 2.5g per litre of clean water',
      'Azoxystrobin 23% SC @ 1ml per litre in severe outbreak areas'
    ],
    preventionTips: [
      'Practice minimum 3-year crop rotation with non-solanaceous crops',
      'Apply organic mulch (paddy straw) to block soil splash pathogens onto lower leaves',
      'Maintain wide 60cm row spacing for optimal cross-ventilation'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
    analyzedAt: '10:45 AM Today',
    isDemoSample: true
  },
  {
    id: 'sample-2',
    cropName: 'Paddy / Rice (ಭತ್ತ)',
    possibleDisease: 'Rice Leaf Blast',
    scientificName: 'Magnaporthe oryzae',
    confidence: 91.8,
    severity: 'Severe',
    symptoms: [
      'Spindle-shaped / diamond lesions with ash-grey centers and reddish-brown margins',
      'Rapid enlargement and coalescing of lesions leading to scorched leaf tips',
      'Dark necrotic collar rot at leaf blade joints'
    ],
    immediateSteps: [
      'Temporarily suspend excessive chemical urea/nitrogen fertilizer application',
      'Drain excess standing water for 48 hours to aerate root mat',
      'Ensure field bunds and surrounding grass weeds are trimmed'
    ],
    organicRemedies: [
      'Pseudomonas fluorescens 2% foliar spray (10g/L water)',
      'Cow urine (Gomutra) 10% solution fermented with neem leaves'
    ],
    chemicalRemedies: [
      'Tricyclazole 75% WP @ 0.6g per litre of water at first symptom',
      'Isoprothiolane 40% EC @ 1.5ml per litre spray'
    ],
    preventionTips: [
      'Use certified blast-resistant seed varieties (e.g. IR-64, BPT-5204 treated)',
      'Treat seed with Carbendazim before nursery broadcasting',
      'Avoid high plant density in seed beds'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=800&q=80',
    analyzedAt: 'Yesterday, 04:15 PM',
    isDemoSample: true
  },
  {
    id: 'sample-3',
    cropName: 'Corn / Maize (ಮೆಕ್ಕೆಜೋಳ)',
    possibleDisease: 'Common Maize Rust',
    scientificName: 'Puccinia sorghi',
    confidence: 88.5,
    severity: 'Moderate',
    symptoms: [
      'Golden brown to cinnamon-brown powdery pustules on both leaf surfaces',
      'Pustules rupture epidermal skin releasing rust spores in dry breeze',
      'Leaves turn yellow and dry up under heavy spore density'
    ],
    immediateSteps: [
      'Monitor flag leaf status; if upper 3 leaves are clean, crop yield impact is manageable',
      'Ensure balanced potassium (K) nutrition to strengthen leaf cell walls'
    ],
    organicRemedies: [
      'Sulphur dust (wettable sulphur 80% WP) @ 3g/L early morning',
      'Fermented Panchagavya 3% foliar spray every 10 days'
    ],
    chemicalRemedies: [
      'Propiconazole 25% EC @ 1ml per litre of water',
      'Chlorothalonil 75% WP @ 2g per litre'
    ],
    preventionTips: [
      'Plant early in season to escape high humidity sporulation cycles',
      'Deep plough field stubble after harvest to bury overwintering teliospores'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    analyzedAt: 'Yesterday, 11:30 AM',
    isDemoSample: true
  },
  {
    id: 'sample-4',
    cropName: 'Cotton (ಹತ್ತಿ)',
    possibleDisease: 'Healthy Leaf (No Pathogen Detected)',
    scientificName: 'Gossypium hirsutum — Healthy Specimen',
    confidence: 98.6,
    severity: 'Healthy',
    symptoms: [
      'Vibrant deep green cuticle without necrotic blemishes',
      'Smooth leaf venation with robust turgor pressure',
      'Zero sporulation, mold webbing, or insect curling'
    ],
    immediateSteps: [
      'Continue current balanced nutrition and moisture management',
      'Maintain regular pest scout checks for early sucking pests (aphids/whitefly)'
    ],
    organicRemedies: [
      'Maintenance spray of Jeevamrutha or bio-NPK consortia every 14 days'
    ],
    chemicalRemedies: [
      'No chemical treatment needed — preserve beneficial predatory insects!'
    ],
    preventionTips: [
      'Yellow sticky traps (15 traps/acre) for whitefly and jassid early warning',
      'Pheromone traps for pink bollworm monitoring'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80',
    analyzedAt: '2 days ago',
    isDemoSample: true
  }
];

export const INITIAL_WATERING_HISTORY: WateringLog[] = [
  {
    id: 'irr-1',
    startTime: 'Today, 06:15 AM',
    durationMinutes: 35,
    volumeLiters: 420,
    triggerType: 'Automatic',
    moistureBefore: 28,
    moistureAfter: 68,
    status: 'Completed'
  },
  {
    id: 'irr-2',
    startTime: 'Yesterday, 05:40 PM',
    durationMinutes: 20,
    volumeLiters: 240,
    triggerType: 'Manual',
    moistureBefore: 33,
    moistureAfter: 64,
    status: 'Completed'
  },
  {
    id: 'irr-3',
    startTime: 'Yesterday, 06:00 AM',
    durationMinutes: 30,
    volumeLiters: 360,
    triggerType: 'Scheduled',
    moistureBefore: 30,
    moistureAfter: 65,
    status: 'Completed'
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'voice-1',
    text: 'Good morning farmer! Soil moisture is currently 32%. Soil pH is 6.5, slightly acidic.',
    kannadaText: 'ಶುಭೋದಯ ರೈತ ಬಾಂಧವರೇ! ಮಣ್ಣಿನ ತೇವಾಂಶ ೩೨% ಇದೆ. ಮಣ್ಣಿನ ಪಿಎಚ್ ೬.೫ ರಷ್ಟಿದೆ.',
    hindiText: 'शुभ प्रभात किसान भाई! मिट्टी की नमी 32% है और पीएच मान 6.5 है।',
    category: 'system' as const,
    timestamp: '07:00 AM',
    severity: 'info' as const,
    played: true
  },
  {
    id: 'voice-2',
    text: 'Attention! Soil moisture is low. Irrigation is starting for field 1.',
    kannadaText: 'ಗಮನಿಸಿ! ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ. ನೀರಾವರಿ ಪಂಪ್ ಆರಂಭವಾಗುತ್ತಿದೆ.',
    hindiText: 'ध्यान दें! मिट्टी की नमी कम है। सिंचाई शुरू की जा रही है।',
    category: 'irrigation' as const,
    timestamp: '08:30 AM',
    severity: 'warning' as const,
    played: true
  },
  {
    id: 'voice-3',
    text: 'Weather Alert: Heavy rain showers expected on Tuesday. Postpone excessive irrigation.',
    kannadaText: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಮಂಗಳವಾರ ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಹೆಚ್ಚಿನ ನೀರಾವರಿ ಮುಂದೂಡಿ.',
    hindiText: 'मौसम चेतावनी: मंगलवार को भारी बारिश की संभावना है। अधिक सिंचाई टालें।',
    category: 'weather' as const,
    timestamp: '09:15 AM',
    severity: 'warning' as const,
    played: true
  },
  {
    id: 'voice-4',
    text: 'Mandi Update: Tomato prices increased by 8 percent in Kolar APMC today.',
    kannadaText: 'ಮಾರುಕಟ್ಟೆ ವರದಿ: ಕೋಲಾರ ಎಪಿಎಂಸಿಯಲ್ಲಿ ಟೊಮೆಟೊ ಬೆಲೆ ೮% ಹೆಚ್ಚಾಗಿದೆ.',
    hindiText: 'मंडी भाव: आज टमाटर के भाव में 8 प्रतिशत की बढ़ोतरी दर्ज की गई है।',
    category: 'market' as const,
    timestamp: '10:00 AM',
    severity: 'info' as const,
    played: false
  }
];
