import React, { useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { Cloud, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, AlertCircle } from 'lucide-react';
import { getWeatherIcon, getLargeWeatherIcon, getWeatherDescription, calculateFeelsLike, formatRainfall } from '../utils/weatherUtils';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const Dashboard = () => {
  const { currentWeather, hourlyForecast, dailyForecast, loading, error } = useWeather();

  // AnimatePresence for smooth error/loading/page transitions
  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          className="flex items-center justify-center h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-xl p-8 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 dark:text-red-300 font-medium">Unable to load weather data</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (loading || !currentWeather) {
    return (
      <AnimatePresence>
        <motion.div
          className="flex items-center justify-center h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading weather data...</p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const temp = Math.round(currentWeather.temperature);
  const windSpeed = currentWeather.wind_speed || 0;
  const weatherCode = currentWeather.weather_code || 0;
  const humidity = dailyForecast?.relative_humidity_2m?.[0] || 65;
  const feelsLike = calculateFeelsLike(temp, windSpeed, humidity);

  // Extract daily forecast data
  const daily = dailyForecast || {};
  const todayData = {
    maxTemp: daily.temperature_2m_max?.[0] || temp + 5,
    minTemp: daily.temperature_2m_min?.[0] || temp - 5,
    precipitation: daily.precipitation_sum?.[0] || 0,
    // keep only HH:MM portion of ISO timestamp
    sunrise: (daily.sunrise?.[0] || '06:00').slice(-5),
    sunset: (daily.sunset?.[0] || '18:00').slice(-5),
    windSpeed: windSpeed,
    humidity: humidity,
    visibility: 10,
    pressure: 1013,
  };

  // Extract hourly data for sparklines
  const hourly = hourlyForecast || {};
  const nextHours = 24;
  const hourlyTemps = (hourly.temperature_2m || []).slice(0, nextHours);
  const hourlyPrecipitation = (hourly.precipitation || []).slice(0, nextHours);

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
      >
        {/* Main Weather Display - AccuWeather Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Temperature Display */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 rounded-2xl p-8 text-white shadow-2xl min-h-[340px] flex flex-col justify-between"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-4 font-semibold tracking-wide">TODAY</p>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-8xl font-black">{temp}°</h2>
                <span className="text-3xl font-bold text-blue-100">C</span>
              </div>
              <p className="text-xl text-blue-100 mb-3">{getWeatherDescription(weatherCode)}</p>
              <p className="text-lg text-blue-200">Feels like <span className="font-bold">{feelsLike}°C</span></p>
            </div>
            <div className="text-9xl opacity-90 animate-bounce" style={{ animationDuration: '3s' }}>
              {getLargeWeatherIcon(weatherCode)}
            </div>
          </div>

            <div className="mt-8 pt-8 border-t-2 border-blue-400/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-400/20 rounded-xl p-4 hover:shadow-lg transition-all">
              <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">High/Low</p>
              <p className="text-3xl font-black">{Math.round(todayData.maxTemp)}°/{Math.round(todayData.minTemp)}°</p>
            </div>
            <div className="bg-blue-400/20 rounded-xl p-4 hover:shadow-lg transition-all">
              <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">Rainfall</p>
              <p className="text-3xl font-black">{formatRainfall(todayData.precipitation)}</p>
            </div>
            <div className="bg-blue-400/20 rounded-xl p-4 hover:shadow-lg transition-all">
              <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">Humidity</p>
              <p className="text-3xl font-black">{todayData.humidity}%</p>
            </div>
          </div>
          </motion.div>

          {/* Right: Key Details */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-emerald-100 text-xs uppercase tracking-widest font-bold mb-2">Wind Speed</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black">{windSpeed.toFixed(1)}</p>
              <p className="text-emerald-100">km/h</p>
            </div>
            <p className="text-emerald-100 text-xs mt-2">💨 Breeze</p>
          </div>

          <div className="bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-sky-100 text-xs uppercase tracking-widest font-bold mb-2">Visibility</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black">{todayData.visibility}</p>
              <p className="text-sky-100">km</p>
            </div>
            <p className="text-sky-100 text-xs mt-2">👁️ Clear View</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
            <p className="text-indigo-100 text-xs uppercase tracking-widest font-bold mb-2">Pressure</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black">{todayData.pressure}</p>
              <p className="text-indigo-100">mb</p>
            </div>
            <p className="text-indigo-100 text-xs mt-2">📊 Normal</p>
          </div>
        </motion.div>
        </div>

        {/* Sunrise & Sunset */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-bold uppercase tracking-wide mb-2">Sunrise</p>
              <p className="text-5xl font-black">{todayData.sunrise.split(':')[0]}:{todayData.sunrise.split(':')[1]}</p>
              <p className="text-orange-100 text-xs mt-2">Morning Light</p>
            </div>
            <Sunrise className="w-20 h-20 opacity-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-wide mb-2">Sunset</p>
              <p className="text-5xl font-black">{todayData.sunset.split(':')[0]}:{todayData.sunset.split(':')[1]}</p>
              <p className="text-indigo-100 text-xs mt-2">Evening Twilight</p>
            </div>
            <Sunset className="w-20 h-20 opacity-100" />
          </div>
        </div>
        </motion.div>

        {/* Detailed Weather Info Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Droplets, label: 'Humidity', value: `${todayData.humidity}%`, color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Wind, label: 'Wind', value: `${windSpeed.toFixed(1)} km/h`, color: 'from-green-400 to-emerald-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Eye, label: 'Visibility', value: `${todayData.visibility} km`, color: 'from-purple-400 to-pink-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Gauge, label: 'Pressure', value: `${todayData.pressure} mb`, color: 'from-orange-400 to-red-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={clsx(item.bg, 'rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700')}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className={clsx('inline-block p-3 rounded-lg bg-gradient-to-br', item.color, 'mb-3')}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
          </motion.div>
        ))}
        </motion.div>

        {/* 24-Hour Temperature Trend */}
        {hourlyTemps.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 mt-8"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">24-Hour Forecast</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Temperature trend throughout the day</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-min pb-4">
                {hourlyTemps.map((t, idx) => (
                  <motion.div
                    key={idx}
                    className="flex flex-col items-center flex-shrink-0"
                    whileHover={{ scale: 1.15, y: -10 }}
                  >
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 h-4">
                      {idx % 3 === 0 ? `${idx}h` : ''}
                    </span>
                    <div className="relative h-24 w-8">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 rounded-t-lg shadow-md hover:from-blue-600 hover:via-blue-500 hover:to-blue-400 transition-all"
                        style={{ height: `${Math.max(20, Math.min(100, (Math.round(t) + 20) * 2))}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white mt-3">
                      {Math.round(t)}°
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-500"></span>
              <span>Height represents hourly temperature • Hover to zoom</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;
