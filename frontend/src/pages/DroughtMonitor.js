import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { weatherAPI } from '../api';
import { AlertCircle, Droplets, TrendingDown, Leaf, AlertTriangle, CheckCircle, MapPin, Cloud, Zap, Gauge, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DroughtMonitor() {
  const { currentLocation } = useWeather();
  const [droughtData, setDroughtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentLocation.lat && currentLocation.lon) {
      fetchDroughtData();
    }
  }, [currentLocation]);

  const fetchDroughtData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await weatherAPI.getDroughtAnalysis(
        currentLocation.lat,
        currentLocation.lon,
        7
      );
      setDroughtData(response.data);
    } catch (err) {
      setError('Failed to fetch drought data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDroughtColor = (index) => {
    if (index < 20) return { bg: 'from-green-600 to-green-700', text: 'green' };
    if (index < 40) return { bg: 'from-yellow-600 to-yellow-700', text: 'yellow' };
    if (index < 60) return { bg: 'from-orange-600 to-orange-700', text: 'orange' };
    if (index < 80) return { bg: 'from-red-600 to-red-700', text: 'red' };
    return { bg: 'from-red-800 to-red-900', text: 'darkred' };
  };

  const getSeverityBadgeColor = (level) => {
    switch (level) {
      case 'None': return 'bg-green-500/20 text-green-300 border-green-600';
      case 'Mild': return 'bg-yellow-500/20 text-yellow-300 border-yellow-600';
      case 'Moderate': return 'bg-orange-500/20 text-orange-300 border-orange-600';
      case 'Severe': return 'bg-red-500/20 text-red-300 border-red-600';
      case 'Extreme': return 'bg-red-700/20 text-red-200 border-red-700';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-300 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading drought analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !droughtData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-600 rounded-xl p-8 max-w-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-red-300 font-bold text-lg">Error</h3>
          </div>
          <p className="text-gray-300">{error || 'Unable to load drought data'}</p>
        </div>
      </div>
    );
  }

  const colors = getDroughtColor(droughtData.drought_index);
  const droughtProbability = Math.round((droughtData.drought_probability || 0) * 100);
  const stressLevel = Math.round(droughtData.vegetation_stress_level || 0);

  const pieData = [
    { name: 'Drought Index', value: Math.round(droughtData.drought_index) },
    { name: 'Remaining', value: 100 - Math.round(droughtData.drought_index) }
  ];

  const pieColors = ['#ef4444', '#22c55e'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/30 to-gray-900 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Droplets className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent">
                🌵 Drought Risk Monitor
              </h1>
              <p className="text-gray-300 mt-2">Real-time drought assessment and recommendations for {currentLocation.city || 'your location'}</p>
            </div>
          </div>

          {/* Main Drought Index Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-8 text-white shadow-2xl mb-8 border border-gray-700`}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8" />
                  Overall Drought Risk
                </h2>
                <div className="mb-6">
                  <div className="text-7xl font-bold mb-2">{Math.round(droughtData.drought_index)}</div>
                  <div className="text-lg opacity-90 mb-4">Risk Index (0-100)</div>
                  <div className={`inline-block px-4 py-2 rounded-full border ${getSeverityBadgeColor(droughtData.severity_level)}`}>
                    {droughtData.severity_level} Drought
                  </div>
                </div>
                <p className="text-base opacity-90 leading-relaxed">
                  {droughtData.severity?.description || 'Analysis based on recent rainfall patterns and temperature data'}
                </p>
              </div>

              <div className="flex justify-center">
                <ResponsiveContainer width={250} height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">💧 Rainfall Deficit</span>
                <Cloud className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-400 mb-2">
                {(droughtData.rainfall_deficit_mm || 0).toFixed(1)}mm
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (droughtData.deficit_percentage || 0))}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">{(droughtData.deficit_percentage || 0).toFixed(1)}% below normal</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg hover:border-green-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">🌱 Vegetation Stress</span>
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-400 mb-2">{stressLevel}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stressLevel}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">Plant health impact</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg hover:border-cyan-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">💦 Soil Moisture</span>
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-sm font-bold text-cyan-400 mb-2 truncate">
                {droughtData.soil_moisture_status || 'Unknown'}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full" 
                  style={{ width: `${droughtData.soil_moisture_status === 'High' ? 80 : droughtData.soil_moisture_status === 'Medium' ? 50 : 20}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">Current status</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg hover:border-yellow-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">⚠️ Drought Probability</span>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400 mb-2">{droughtProbability}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${droughtProbability}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">Occurrence chance</p>
            </motion.div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Alert Status */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-6 border border-orange-700/50 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Alert Status</h3>
              </div>
              <p className={`text-xl font-bold mb-3 ${
                droughtData.alert_status?.includes('Critical') ? 'text-red-300' :
                droughtData.alert_status?.includes('Warning') ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                {droughtData.alert_status || 'Normal'}
              </p>
              <p className="text-gray-300 text-sm">
                {droughtData.alert_status?.includes('Critical') 
                  ? 'Immediate action required to prevent drought impact'
                  : droughtData.alert_status?.includes('Warning')
                  ? 'Monitor situation closely and prepare mitigation measures'
                  : 'Current conditions are manageable'}
              </p>
            </motion.div>

            {/* Forecast Outlook */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-cyan-700/50 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">7-Day Outlook</h3>
              </div>
              <p className="text-lg font-semibold text-cyan-300 mb-2">
                {droughtData.continued_dry_period_risk || 'Unknown'}
              </p>
              <p className="text-gray-300 text-sm">
                Expected Rainfall: <span className="font-bold text-cyan-300">{(droughtData.expected_rainfall_7day || 0).toFixed(1)}mm</span>
              </p>
            </motion.div>
          </div>

          {/* Recommendations */}
          {droughtData.recommendations && droughtData.recommendations.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-700/50 shadow-lg mb-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-2xl font-bold text-white">📋 Recommended Actions</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {droughtData.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="bg-white/5 rounded-lg p-4 border border-green-600/30 backdrop-blur"
                  >
                    <p className="text-gray-200 text-sm leading-relaxed flex items-start gap-3">
                      <span className="text-green-400 font-bold mt-1">→</span>
                      <span>{rec}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <h4 className="text-lg font-bold text-white mb-3">💧 What is Drought?</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                A prolonged period of abnormally low rainfall, leading to a shortage of water. Our monitoring system tracks multiple indicators to assess drought risk.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <h4 className="text-lg font-bold text-white mb-3">📊 How We Calculate</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our drought index combines rainfall patterns (50%), temperature effects (20%), trend analysis (15%), and weather forecast (15%) for comprehensive assessment.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <h4 className="text-lg font-bold text-white mb-3">🌾 Agricultural Impact</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Drought significantly affects crop yields and soil quality. Plan irrigation schedules and select appropriate crop varieties based on our recommendations.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
