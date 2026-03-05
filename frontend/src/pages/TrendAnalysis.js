import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { trendAPI } from '../api';
import { AlertCircle, TrendingUp, TrendingDown, Cloud, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

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

const TrendAnalysis = () => {
  const { currentLocation, loading: weatherLoading } = useWeather();
  const [analysis, setAnalysis] = useState(null);
  // start in loading state so we don't render an empty screen on first mount
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('TrendAnalysis effect fired', { currentLocation, weatherLoading });

    const fetchAnalysis = async () => {
      if (!currentLocation || currentLocation.lat == null || currentLocation.lon == null) {
        console.warn('Location not ready yet');
        setError('Location unavailable');
        setLoading(false);
        return;
      }

      console.log('TrendAnalysis: fetching for', currentLocation);
      setLoading(true);
      setError(null);
      try {
        const response = await trendAPI.analyze(currentLocation.lat, currentLocation.lon);
        console.log('TrendAnalysis response', response.data);
        setAnalysis(response.data);
      } catch (err) {
        console.error('TrendAnalysis error', err);
        setError('Failed to load trend analysis');
      } finally {
        setLoading(false);
      }
    };

    if (!weatherLoading) {
      fetchAnalysis();
    }
  }, [currentLocation, weatherLoading]);

  if (loading || weatherLoading) {
    return (
      <motion.div className="flex items-center justify-center h-96" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 dark:border-gray-600 border-t-white mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Analyzing weather trends...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="flex items-center justify-center h-96" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-300 font-semibold mb-2">Error</p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!analysis) {
    // this should rarely happen because loading flag covers the period
    return (
      <motion.div className="flex items-center justify-center h-96" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-slate-600 dark:text-slate-400">Preparing trend analysis...</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold mb-2">📈 Weather Trends & Patterns</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Historical analysis for {currentLocation.city} ({analysis.analysis_period_days} days analyzed)
        </p>
      </motion.div>

      {/* Temperature Analysis */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="text-orange-500" size={28} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Temperature Trends</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Average</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysis.temperature.average}°C</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Highest</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{analysis.temperature.max}°C</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Lowest</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{analysis.temperature.min}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {analysis.temperature.trend === 'warming' ? (
                <TrendingUp className="text-red-500" size={20} />
              ) : (
                <TrendingDown className="text-blue-500" size={20} />
              )}
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {analysis.temperature.trend}
              </span>
            </div>
          </div>
        </div>

        {/* Rainfall Analysis */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="text-blue-500" size={28} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rainfall Patterns</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.rainfall.total_mm} mm</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Daily Avg</p>
                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{analysis.rainfall.average_daily} mm</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Rainy Days</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{analysis.rainfall.rainy_days}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {analysis.rainfall.trend === 'increasing' ? (
                <TrendingUp className="text-blue-500" size={20} />
              ) : (
                <TrendingDown className="text-orange-500" size={20} />
              )}
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {analysis.rainfall.trend}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Drought Analysis */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">🌵 Drought Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">Current Likelihood</p>
            <div className={`p-4 rounded-lg text-white font-bold text-lg capitalize ${
              analysis.drought_analysis.likelihood === 'high'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : analysis.drought_analysis.likelihood === 'moderate'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {analysis.drought_analysis.likelihood} Risk
            </div>
            {analysis.drought_analysis.risk_factors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contributing Factors:</p>
                <ul className="space-y-1">
                  {analysis.drought_analysis.risk_factors.map((factor, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">Dry Streak Info</p>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {analysis.rainfall.max_dry_streak_days}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Maximum consecutive dry days</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Indicates longest period without measurable rainfall
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-500 rounded-xl p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          💡 Key Insights
        </h3>
        <ul className="space-y-2">
          {analysis.insights.map((insight, idx) => (
            <li key={idx} className="text-slate-700 dark:text-slate-300 flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default TrendAnalysis;
