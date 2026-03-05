import {
  Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets,
  Eye, Gauge, Sunrise, Sunset, Zap, AlertCircle,
} from 'lucide-react';

// Weather code to icon mapping
export const getWeatherIcon = (code, isDay = true) => {
  const iconClass = 'w-12 h-12';

  // WMO Weather interpretation codes
  if (code === 0 || code === 1) {
    return <Sun className={`${iconClass} text-yellow-400`} />;
  }
  if (code === 2) {
    return <Cloud className={`${iconClass} text-gray-400`} />;
  }
  if (code === 3) {
    return <Cloud className={`${iconClass} text-gray-500`} />;
  }
  if (code >= 45 && code <= 48) {
    return <Cloud className={`${iconClass} text-gray-400`} />;
  }
  if (code >= 51 && code <= 67) {
    return <CloudRain className={`${iconClass} text-blue-400`} />;
  }
  if (code >= 71 && code <= 77 || code === 85 || code === 86) {
    return <CloudSnow className={`${iconClass} text-blue-200`} />;
  }
  if (code >= 80 && code <= 82) {
    return <CloudRain className={`${iconClass} text-blue-500`} />;
  }
  if (code >= 90 && code <= 99) {
    return <Zap className={`${iconClass} text-purple-400`} />;
  }

  return <Cloud className={`${iconClass} text-gray-400`} />;
};

// Large weather icon for dashboard
export const getLargeWeatherIcon = (code, isDay = true) => {
  const iconClass = 'w-32 h-32';

  if (code === 0 || code === 1) {
    return <Sun className={`${iconClass} text-yellow-500`} />;
  }
  if (code === 2) {
    return <Cloud className={`${iconClass} text-gray-400`} />;
  }
  if (code === 3) {
    return <Cloud className={`${iconClass} text-gray-500`} />;
  }
  if (code >= 45 && code <= 48) {
    return <Cloud className={`${iconClass} text-gray-400`} />;
  }
  if (code >= 51 && code <= 67) {
    return <CloudRain className={`${iconClass} text-blue-400`} />;
  }
  if (code >= 71 && code <= 77 || code === 85 || code === 86) {
    return <CloudSnow className={`${iconClass} text-blue-200`} />;
  }
  if (code >= 80 && code <= 82) {
    return <CloudRain className={`${iconClass} text-blue-500`} />;
  }
  if (code >= 90 && code <= 99) {
    return <Zap className={`${iconClass} text-purple-500`} />;
  }

  return <Cloud className={`${iconClass} text-gray-400`} />;
};

// Get weather description
export const getWeatherDescription = (code) => {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return descriptions[code] || 'Unknown';
};

// Format time
export const formatTime = (dateString, timeString) => {
  if (!dateString || !timeString) return '--:--';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate "feels like" temperature
export const calculateFeelsLike = (temp, windSpeed, humidity) => {
  if (!temp || !windSpeed) return temp;

  // Simplified wind chill calculation
  if (temp < 10) {
    return Math.round(temp - windSpeed * 0.2);
  }

  // Heat index for warm temperatures
  if (temp > 26 && humidity > 40) {
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;

    const T = temp;
    const RH = humidity;

    const HI =
      c1 +
      c2 * T +
      c3 * RH +
      c4 * T * RH +
      c5 * T * T +
      c6 * RH * RH +
      c7 * T * T * RH +
      c8 * T * RH * RH +
      c9 * T * T * RH * RH;

    return Math.round(HI);
  }

  return Math.round(temp);
};

// Get drought level description
export const getDroughtLevel = (index) => {
  if (index <= 20) return { level: 'Normal', color: 'green', description: 'Water is readily available' };
  if (index <= 40) return { level: 'Mild', color: 'yellow', description: 'Minor water restrictions recommended' };
  if (index <= 60) return { level: 'Moderate', color: 'orange', description: 'Significant water conservation needed' };
  if (index <= 80) return { level: 'Severe', color: 'red', description: 'Serious water restrictions in effect' };
  return { level: 'Extreme', color: 'darkred', description: 'Critical drought conditions' };
};

// Generate mock drought data
export const generateMockDroughtIndex = (lat, lon) => {
  // Generate a pseudo-random value based on coordinates
  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  return Math.round(((hash - Math.floor(hash)) * 100));
};

// Format rainfall
export const formatRainfall = (mm) => {
  if (mm === null || mm === undefined) return '0 mm';
  return `${mm.toFixed(1)} mm`;
};

// Get rainfall description
export const getRainfallDescription = (mm) => {
  if (mm === 0) return 'No rain';
  if (mm < 2.5) return 'Light rain';
  if (mm < 10) return 'Moderate rain';
  if (mm < 50) return 'Heavy rain';
  return 'Extreme rain';
};

// Generate hourly data for charts
export const getHourlyChartData = (hourlyData, startIndex = 0, count = 24) => {
  if (!hourlyData) return [];

  const times = hourlyData.time || [];
  const temps = hourlyData.temperature_2m || [];
  const precipitation = hourlyData.precipitation || [];

  return times.slice(startIndex, startIndex + count).map((time, idx) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: temps[startIndex + idx] || 0,
    precipitation: precipitation[startIndex + idx] || 0,
    hour: new Date(time).getHours(),
  }));
};

// Generate daily chart data
export const getDailyChartData = (dailyData) => {
  if (!dailyData) return [];

  const times = dailyData.time || [];
  const tempMax = dailyData.temperature_2m_max || [];
  const tempMin = dailyData.temperature_2m_min || [];
  const precipitation = dailyData.precipitation_sum || [];

  return times.map((time, idx) => ({
    date: new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    tempMax: tempMax[idx] || 0,
    tempMin: tempMin[idx] || 0,
    avgTemp: ((tempMax[idx] || 0) + (tempMin[idx] || 0)) / 2,
    precipitation: precipitation[idx] || 0,
  }));
};
