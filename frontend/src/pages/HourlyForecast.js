import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { CloudRain } from 'lucide-react';
import { getHourlyChartData, getWeatherIcon } from '../utils/weatherUtils';
import clsx from 'clsx';

const HourlyForecast = () => {
  const [viewMode, setViewMode] = useState('temperature');
  const { hourlyForecast, loading, currentLocation } = useWeather();

  if (loading || !hourlyForecast) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading hourly forecast...</p>
        </div>
      </div>
    );
  }

  const chartData = getHourlyChartData(hourlyForecast, 0, 24);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">⏰ 24-Hour Forecast</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Detailed hourly weather predictions for {currentLocation.city}
        </p>
      </motion.div>

      {/* View Mode Toggle */}
      <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
        <button
          onClick={() => setViewMode('temperature')}
          className={clsx(
            'px-5 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2',
            viewMode === 'temperature'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:shadow-xl border border-slate-200 dark:border-slate-700'
          )}
        >
          🌡️ Temperature Trend
        </button>
        <button
          onClick={() => setViewMode('precipitation')}
          className={clsx(
            'px-5 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2',
            viewMode === 'precipitation'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:shadow-xl border border-slate-200 dark:border-slate-700'
          )}
        >
          🌧️ Rainfall Pattern
        </button>
        <button
          onClick={() => setViewMode('combined')}
          className={clsx(
            'px-5 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2',
            viewMode === 'combined'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:shadow-xl border border-slate-200 dark:border-slate-700'
          )}
        >
          📊 Combined View
        </button>
      </motion.div>

      {/* Chart Container */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
      >
        {viewMode === 'temperature' ? (
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-red-500">🌡️</span> Temperature Trend (°C)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  dot={{ fill: '#ef4444', r: 5 }}
                  strokeWidth={3}
                  isAnimationActive={true}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : viewMode === 'precipitation' ? (
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500">🌧️</span> Rainfall Pattern (mm)
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '2px solid #0ea5e9',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="precipitation" fill="url(#rainGradient)" radius={[8, 8, 0, 0]} name="Rainfall" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-purple-500">📊</span> Combined Forecast
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="combGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '2px solid #8b5cf6',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="precipitation" fill="url(#combGradient)" radius={[8, 8, 0, 0]} name="Rainfall (mm)" />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Temperature (°C)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Statistics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌡️</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Avg Temperature</p>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {(chartData.reduce((sum, h) => sum + h.temperature, 0) / chartData.length).toFixed(1)}°C
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌧️</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Total Rainfall</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {chartData.reduce((sum, h) => sum + h.precipitation, 0).toFixed(1)} mm
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Peak Temp</p>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {Math.max(...chartData.map(h => h.temperature)).toFixed(1)}°C
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📉</span>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Min Temp</p>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {Math.min(...chartData.map(h => h.temperature)).toFixed(1)}°C
          </p>
        </div>
      </motion.div>

      {/* Hourly Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          ⏱️ Hour-by-Hour Details
        </h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-3 min-w-min pb-4">
            {chartData.map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-lg p-4 min-w-[140px] text-center hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
              >
                {/* Time */}
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  {item.time}
                </p>

                {/* Icon */}
                <div className="flex justify-center mb-3 text-2xl">
                  {getWeatherIcon(0)}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {/* Temperature */}
                  <div className="flex items-center justify-center gap-1 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                      {Math.round(item.temperature)}°
                    </span>
                  </div>

                  {/* Precipitation */}
                  {item.precipitation > 0 ? (
                    <div className="flex items-center justify-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {item.precipitation.toFixed(1)}mm
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">No rain</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-500 rounded-xl p-6 shadow-lg"
      >
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          💡 Hourly Forecast Tips
        </h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <li>✓ <strong>Temperature trends</strong> help plan outdoor activities and dress accordingly</li>
          <li>✓ <strong>Rainfall pattern</strong> shows when to expect rain throughout the day</li>
          <li>✓ <strong>Combined view</strong> displays both metrics for complete weather understanding</li>
          <li>✓ Use hourly data for precise planning of your daily schedule</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default HourlyForecast;
