export interface WeatherLocation {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface RealWeatherData {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  source: string;
  lastUpdated: string;
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  forecast: {
    day: string;
    date: string;
    condition: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }[];
  farmingAdvisory: {
    irrigation: string;
    spraying: string;
    harvesting: string;
    fertilizer: string;
    postponeIrrigation: boolean;
    postponeReason?: string;
  };
}

// Default regional farming locations in Karnataka
export const PRESET_LOCATIONS: Record<string, WeatherLocation> = {
  mandya: { city: 'Mandya (Sugar City)', state: 'Karnataka', latitude: 12.52, longitude: 76.89 },
  bengaluru: { city: 'Bengaluru Rural', state: 'Karnataka', latitude: 12.97, longitude: 77.59 },
  mysuru: { city: 'Mysuru', state: 'Karnataka', latitude: 12.30, longitude: 76.65 },
  kolar: { city: 'Kolar (Tomato Belt)', state: 'Karnataka', latitude: 13.13, longitude: 78.13 },
  shimoga: { city: 'Shivamogga (Malnad)', state: 'Karnataka', latitude: 13.92, longitude: 75.56 },
  raichur: { city: 'Raichur (Cotton Belt)', state: 'Karnataka', latitude: 16.20, longitude: 77.35 },
  belagavi: { city: 'Belagavi', state: 'Karnataka', latitude: 15.85, longitude: 74.50 },
};

export class WeatherService {
  /**
   * Fetches real live weather data from Open-Meteo API
   */
  public async getLiveWeather(
    latitude = 12.52,
    longitude = 76.89,
    cityName = 'Mandya',
    stateName = 'Karnataka'
  ): Promise<RealWeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
      `&hourly=precipitation_probability,temperature_2m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
      `&timezone=auto`;

    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'RaithaVikasAI/1.0' } });
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformOpenMeteoData(data, latitude, longitude, cityName, stateName);
    } catch (err: any) {
      console.error('[WeatherService Error] Open-Meteo fetch failed:', err?.message || err);
      throw new Error(`Failed to retrieve live weather data from Open-Meteo: ${err?.message || 'Network error'}`);
    }
  }

  private transformOpenMeteoData(
    data: any,
    lat: number,
    lon: number,
    city: string,
    state: string
  ): RealWeatherData {
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const temp = Math.round((current.temperature_2m ?? 28) * 10) / 10;
    const feelsLike = Math.round((current.apparent_temperature ?? temp) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 70);
    const windSpeed = Math.round((current.wind_speed_10m ?? 10) * 10) / 10;
    const windDirDeg = current.wind_direction_10m ?? 180;
    const weatherCode = current.weather_code ?? 0;

    // Calculate max rain probability today from hourly data or daily
    const rainProbToday = daily.precipitation_probability_max?.[0] ?? 20;

    // UV Index
    const uvIndex = Math.round(daily.uv_index_max?.[0] ?? 6);

    // Weather condition string
    const condition = this.interpretWmoCode(weatherCode);

    // Build 5-day daily forecast
    const forecastDays = [];
    const dates = daily.time || [];
    for (let i = 0; i < Math.min(5, dates.length); i++) {
      const d = new Date(dates[i]);
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      forecastDays.push({
        day: dayName,
        date: dates[i],
        condition: this.interpretWmoCode(daily.weather_code?.[i] ?? 0),
        tempMax: Math.round(daily.temperature_2m_max?.[i] ?? temp),
        tempMin: Math.round(daily.temperature_2m_min?.[i] ?? (temp - 6)),
        rainProb: Math.round(daily.precipitation_probability_max?.[i] ?? 10)
      });
    }

    // Determine upcoming rain hazard (next 48h)
    const upcomingHighRain = forecastDays.slice(0, 3).find(f => f.rainProb >= 60);
    const postponeIrrigation = !!upcomingHighRain;
    const postponeReason = postponeIrrigation
      ? `High Rain Probability (${upcomingHighRain.rainProb}%) forecast for ${upcomingHighRain.day}. Postpone deep irrigation to conserve water and prevent root hypoxia.`
      : undefined;

    // Agronomic advisory based on real weather parameters
    const advisory = {
      irrigation: postponeIrrigation
        ? `Rain forecast of ${upcomingHighRain.rainProb}% for ${upcomingHighRain.day}. Postpone heavy irrigation.`
        : `Relative humidity at ${humidity}%. Morning drip cycle recommended before peak solar heat.`,
      spraying: windSpeed > 15
        ? `Wind speed is elevated (${windSpeed} km/h). Postpone foliar spraying until wind drops below 12 km/h.`
        : `Wind speed is calm (${windSpeed} km/h). Suitable for organic neem/biological spraying between 07:00 AM - 10:30 AM.`,
      harvesting: postponeIrrigation
        ? `Complete harvesting of ripe produce before expected rains on ${upcomingHighRain.day}.`
        : `Weather is clear. Favorable conditions for grain threshing and sun-drying.`,
      fertilizer: `Optimal soil absorption window. Apply nutrient top-dressing during the scheduled irrigation cycle.`,
      postponeIrrigation,
      postponeReason
    };

    return {
      city,
      state,
      latitude: lat,
      longitude: lon,
      source: 'Open-Meteo Global Weather API (High-Resolution ECMWF / GFS)',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      condition,
      temperature: temp,
      feelsLike,
      humidity,
      rainProbability: rainProbToday,
      windSpeed,
      windDirection: this.degToCompass(windDirDeg),
      uvIndex,
      forecast: forecastDays,
      farmingAdvisory: advisory
    };
  }

  private interpretWmoCode(code: number): string {
    switch (code) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: case 48: return 'Fog / Mist';
      case 51: case 53: case 55: return 'Light Drizzle';
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 80: case 81: case 82: return 'Rain Showers';
      case 95: case 96: case 99: return 'Thunderstorm';
      default: return 'Partly Cloudy';
    }
  }

  private degToCompass(num: number): string {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return arr[(val % 16)];
  }
}

export const weatherService = new WeatherService();
