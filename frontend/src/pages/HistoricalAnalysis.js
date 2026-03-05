import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, Cloud, Droplets, Thermometer } from 'lucide-react';
import { getDailyChartData } from '../utils/weatherUtils';
import clsx from 'clsx';

const HistoricalAnalysis = () => {
  const { historicalData, loading } = useWeather();
  const [timeRange, setTimeRange] = useState('all');

  if (loading || !historicalData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading historical data...</p>
        </div>
      </div>
    );
  }

  const data = Array.isArray(historicalData) ? historicalData : [];

  // Calculate statistics
  const totalRainfall = data.reduce((sum, d) => sum + (d.precipitation || 0), 0);
  const rainyDays = data.filter(d => (d.precipitation || 0) > 0).length;
  const avgDailyRainfall = rainyDays > 0 ? (totalRainfall / rainyDays).toFixed(2) : '0';
  const maxRainfall = data.length > 0 ? Math.max(...data.map(d => d.precipitation || 0)).toFixed(2) : '0';

  const avgTemp = data.length > 0
    ? (data.reduce((sum, d) => sum + (d.temp_avg || 0), 0) / data.length).toFixed(2)
    : '0';
  const maxTemp = data.length > 0 ? Math.max(...data.map(d => d.temp_max || 0)).toFixed(2) : '0';
  const minTemp = data.length > 0 ? Math.min(...data.map(d => d.temp_min || 0)).toFixed(2) : '0';

  // Prepare chart data
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    precipitation: d.precipitation || 0,
    temp_max: d.temp_max || 0,
    temp_min: d.temp_min || 0,
    temp_avg: d.temp_avg || 0,
  }));

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Historical Analysis</h1>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {[
          {
            icon: Droplets,
            label: 'Total Rainfall',
            value: `${totalRainfall.toFixed(1)} mm`,
            color: 'blue',
          },
          {
            icon: Cloud,
            label: 'Rainy Days',
            value: rainyDays,
            color: 'gray',
          },
          {
            icon: Droplets,
            label: 'Avg Daily Rain',
            value: `${avgDailyRainfall} mm`,
            color: 'cyan',
          },
          {
            icon: Droplets,
            label: 'Max Daily Rain',
            value: `${maxRainfall} mm`,
            color: 'indigo',
          },
          {
            icon: Thermometer,
            label: 'Avg Temperature',
            value: `${avgTemp}°C`,
            color: 'orange',
          },
          {
            icon: Thermometer,
            label: 'High / Low',
            value: `${maxTemp}° / ${minTemp}°`,
            color: 'red',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Rainfall Trend */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Daily Rainfall Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="precipitation"
              fill="#3b82f6"
              stroke="#0284c7"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Temperature Trend */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Temperature Range
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="temp_max"
              stackId="1"
              fill="#f59e0b"
              stroke="#d97706"
              fillOpacity={0.6}
              name="High"
            />
            <Area
              type="monotone"
              dataKey="temp_min"
              stackId="2"
              fill="#3b82f6"
              stroke="#0284c7"
              fillOpacity={0.6}
              name="Low"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Table */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Detailed Data
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Date</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Rainfall (mm)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">High (°C)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Low (°C)</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Avg (°C)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.slice().reverse().map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{row.date}</td>
                <td className="text-right py-3 px-4">
                  <span className={clsx(
                    row.precipitation > 0 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500'
                  )}>
                    {row.precipitation.toFixed(1)}
                  </span>
                </td>
                <td className="text-right py-3 px-4 text-orange-600 dark:text-orange-400 font-semibold">
                  {row.temp_max.toFixed(1)}
                </td>
                <td className="text-right py-3 px-4 text-blue-600 dark:text-blue-400 font-semibold">
                  {row.temp_min.toFixed(1)}
                </td>
                <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                  {row.temp_avg.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default HistoricalAnalysis;
