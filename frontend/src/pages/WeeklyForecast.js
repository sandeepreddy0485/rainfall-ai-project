import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { getDailyChartData, getWeatherIcon, formatRainfall } from '../utils/weatherUtils';

const WeeklyForecast = () => {
  const { dailyForecast, loading, currentLocation } = useWeather();


  if (loading || !dailyForecast) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading 7-day forecast...</p>
        </div>
      </div>
    );
  }

  const chartData = getDailyChartData(dailyForecast);
  const totalRainfall = chartData.reduce((sum, day) => sum + day.precipitation, 0);
  const avgTemp = chartData.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / chartData.length;
  const maxTemp = Math.max(...chartData.map(d => d.tempMax));
  const minTemp = Math.min(...chartData.map(d => d.tempMin));
  const rainyDays = chartData.filter(d => d.precipitation > 0).length;

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">📅 7-Day Forecast</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Extended weather outlook for {currentLocation.city}
        </p>
      </motion.div>


      {/* Statistics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-lg">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Total Rainfall</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalRainfall.toFixed(1)}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">mm for the week</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 shadow-lg">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Avg Temperature</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{avgTemp.toFixed(1)}°</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">average daily</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">High Temp</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{maxTemp.toFixed(0)}°</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">max temperature</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 shadow-lg">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Low Temp</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{minTemp.toFixed(0)}°</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">min temperature</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 shadow-lg">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Rainy Days</p>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{rainyDays}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">out of 7 days</p>
        </div>
      </motion.div>

      {/* Rainfall Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Droplets className="text-blue-500" size={24} />
          Daily Precipitation (mm)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '2px solid #0ea5e9',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="precipitation" fill="url(#rainGrad)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Temperature Trend */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
      >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Temperature Trend (°C)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="tempMax"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 5 }}
              name="High"
            />
            <Line
              type="monotone"
              dataKey="tempMin"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              name="Low"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Daily Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📊 7-Day Daily Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {chartData.map((day, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              whileHover={{ scale: 1.05 }}
            >
              {/* Day Name */}
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                {day.date.split(' ')[0]}
              </p>

              {/* Weather Icon */}
              <div className="flex justify-center mb-4 text-3xl opacity-80">
                {getWeatherIcon(0)}
              </div>

              {/* Temperature */}
              <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 rounded-lg p-3 mb-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Temperature</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°
                </p>
              </div>

              {/* Precipitation */}
              <div className={`rounded-lg p-3 ${day.precipitation > 0 ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Rainfall</p>
                <p className={`text-lg font-bold ${day.precipitation > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {formatRainfall(day.precipitation)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* Info Box */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-500 rounded-xl p-6 shadow-lg"
      >
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          💡 7-Day Forecast Tips
        </h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <li>✓ <strong>Temperature trends</strong> help plan activities and appropriate clothing</li>
          <li>✓ <strong>Total rainfall</strong> this week is {totalRainfall.toFixed(1)}mm - important for agriculture</li>
          <li>✓ <strong>Rainy days:</strong> {rainyDays} days expected to have precipitation</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyForecast;
