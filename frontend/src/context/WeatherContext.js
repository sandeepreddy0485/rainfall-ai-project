import React, { createContext, useState, useContext, useEffect } from 'react';
import { weatherAPI, locationAPI } from '../api';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  // Theme management
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  // Location state
  const [currentLocation, setCurrentLocation] = useState(() => {
    const saved = localStorage.getItem('currentLocation');
    return saved
      ? JSON.parse(saved)
      : { lat: 17.3850, lon: 78.4867, city: 'Hyderabad', state: 'Telangana', district: '' };
  });

  // Weather data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);


  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Fetch current weather
  const fetchCurrentWeather = async (lat = currentLocation.lat, lon = currentLocation.lon) => {
    try {
      setLoading(true);
      setError(null);
      const response = await weatherAPI.getCurrentWeather(lat, lon);
      const data = response.data;
      
      setCurrentWeather(data.current_weather);
      if (data.hourly) setHourlyForecast(data.hourly);
      if (data.daily) setDailyForecast(data.daily);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching current weather:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical weather
  const fetchHistoricalWeather = async (lat = currentLocation.lat, lon = currentLocation.lon) => {
    try {
      setLoading(true);
      const response = await weatherAPI.getHistoricalWeather(lat, lon);
      setHistoricalData(response.data);
    } catch (err) {
      console.error('Error fetching historical weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Search location by query or object containing coords. Returns raw API data.
  const searchLocation = async (queryOrObj) => {
    try {
      setLoading(true);
      let locData;

      if (queryOrObj && typeof queryOrObj === 'object' && queryOrObj.latitude && queryOrObj.longitude) {
        // already have coordinates (e.g. user picked suggestion)
        locData = queryOrObj;
      } else {
        const response = await locationAPI.search(queryOrObj);
        locData = response.data;
      }

      // API now returns { results: [...] } for searches
      let primary = locData;
      if (locData.results && Array.isArray(locData.results)) {
        primary = locData.results[0] || {};
      }

      if (primary.latitude && primary.longitude) {
        const newLocation = {
          lat: primary.latitude,
          lon: primary.longitude,
          city: primary.display_name || primary.name || queryOrObj,
          state: primary.state || primary.admin1 || '',
          district: primary.district || '',
        };
        setCurrentLocation(newLocation);
        localStorage.setItem('currentLocation', JSON.stringify(newLocation));
        
        // Fetch weather for new location
        await fetchCurrentWeather(newLocation.lat, newLocation.lon);
        await fetchHistoricalWeather(newLocation.lat, newLocation.lon);
      }
      return locData;
    } catch (err) {
      console.error('Error searching location:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // reverse geocode coordinates to get a more accurate display name
  const reverseLookup = async (lat, lon) => {
    try {
      const res = await locationAPI.reverse(lat, lon);
      if (res.data && !res.data.error) {
        return res.data;
      }
    } catch (err) {
      console.error('Reverse lookup failed', err);
    }
    return null;
  };

  // Update location and fetch data
  const setLocation = async (lat, lon, city = 'Unknown', state = '', district = '') => {
    // attempt reverse lookup if raw coordinates provided without name
    let name = city;
    let st = state;
    let dist = district;
    if (city === 'Unknown' || !city) {
      const rev = await reverseLookup(lat, lon);
      if (rev) {
        name = rev.display_name || rev.name || name;
        st = rev.state || st;
        dist = rev.district || dist;
      }
    }

    const newLocation = { lat, lon, city: name, state: st, district: dist };
    setCurrentLocation(newLocation);
    localStorage.setItem('currentLocation', JSON.stringify(newLocation));
    
    await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchHistoricalWeather(lat, lon),
    ]);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Manage favorites
  const addFavorite = (location) => {
    const newFavorite = { ...location, id: Date.now() };
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const removeFavorite = (id) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Fetch data on load
  useEffect(() => {
    fetchCurrentWeather();
    fetchHistoricalWeather();
  }, []);

  const value = {
    // Theme
    isDark,
    toggleTheme,

    // Location
    currentLocation,
    setLocation,
    searchLocation,
    favorites,
    addFavorite,
    removeFavorite,

    // Weather data
    currentWeather,
    hourlyForecast,
    dailyForecast,
    historicalData,

    // Fetch functions
    fetchCurrentWeather,
    fetchHistoricalWeather,

    // UI state
    loading,
    error,
    setError,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
