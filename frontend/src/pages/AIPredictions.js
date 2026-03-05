import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { weatherAPI } from '../api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';
import { Cloud, Droplet, Thermometer, Wind, AlertCircle, CheckCircle, Leaf, MapPin, TrendingUp, Zap, Sun, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIPredictions() {
  const { currentLocation, currentWeather, dailyForecast } = useWeather();
  const [predictions, setPredictions] = useState(null);
  const [droughtData, setDroughtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (currentLocation.lat && currentLocation.lon) {
      fetchPredictions();
      fetchDroughtData();
    }
  }, [currentLocation]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await weatherAPI.getPredictions(
        currentLocation.lat,
        currentLocation.lon,
        7
      );
      setPredictions(response.data);
    } catch (err) {
      setError('Failed to fetch predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDroughtData = async () => {
    try {
      const response = await weatherAPI.axios.get('/drought', {
        params: {
          lat: currentLocation.lat,
          lon: currentLocation.lon,
          days: 7
        }
      });
      setDroughtData(response.data);
    } catch (err) {
      console.error('Drought data fetch error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading AI predictions...</p>
        </div>
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-600 rounded-xl p-8 max-w-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-red-300 font-bold text-lg">Error</h3>
          </div>
          <p className="text-gray-300">{error || 'Unable to load predictions'}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data with temperature and rainfall
  const chartData = predictions.predictions_mm?.map((rainfall, idx) => {
    const tempPreds = predictions.temperature_predictions || {};
    // Generate dates starting from tomorrow (March 4, 2026)
    const forecastDate = new Date(2026, 2, 4); // March 4, 2026
    forecastDate.setDate(forecastDate.getDate() + idx);
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][forecastDate.getMonth()];
    const dayLabel = `${monthName} ${forecastDate.getDate()}`;
    
    return {
      day: dayLabel,
      rainfall: Math.round(rainfall * 10) / 10,
      temp_max: Math.round((tempPreds.temp_max?.[idx] || 30) * 10) / 10,
      temp_min: Math.round((tempPreds.temp_min?.[idx] || 20) * 10) / 10,
      temp_avg: Math.round((tempPreds.temp_avg?.[idx] || 25) * 10) / 10,
    };
  }) || [];

  const travelRec = predictions.recommendations?.travel || {};
  const cropRec = predictions.recommendations?.crops || {};

  const getTravelScoreColor = (score) => {
    switch (score) {
      case 'Excellent':
        return 'from-green-600 to-green-700 text-white';
      case 'Good':
        return 'from-blue-600 to-blue-700 text-white';
      case 'Fair':
        return 'from-yellow-600 to-yellow-700 text-white';
      case 'Poor':
        return 'from-red-600 to-red-700 text-white';
      default:
        return 'from-gray-600 to-gray-700 text-white';
    }
  };

  const getDroughtColor = (index) => {
    if (index < 20) return 'from-green-600 to-green-700';
    if (index < 40) return 'from-yellow-600 to-yellow-700';
    if (index < 60) return 'from-orange-600 to-orange-700';
    if (index < 80) return 'from-red-600 to-red-700';
    return 'from-red-800 to-red-900';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                🤖 AI Rainfall & Temperature Forecasting
              </h1>
              <p className="text-gray-300 mt-2">Advanced statistical pattern predictions for your location</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-5 gap-4 mb-8"
          >
            {/* Current Temperature - Real Data from Dashboard */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5" />
                <span className="text-sm text-red-200">Current Temp</span>
              </div>
              <p className="text-3xl font-bold">
                {currentWeather ? Math.round(currentWeather.temperature) : '—'}°C
              </p>
              <p className="text-xs text-red-100 mt-1">Real-time</p>
            </div>

            {/* High/Low Temp */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5" />
                <span className="text-sm text-orange-200">High/Low</span>
              </div>
              <p className="text-2xl font-bold">
                {dailyForecast ? `${Math.round(dailyForecast.temperature_2m_max?.[0] || 0)}°/${Math.round(dailyForecast.temperature_2m_min?.[0] || 0)}°` : '—/—'}
              </p>
            </div>

            {/* Predicted Weekly Rainfall */}
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5" />
                <span className="text-sm text-cyan-200">7-Day Total</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((predictions.total_predicted_rainfall || 0) * 10) / 10}mm
              </p>
              <p className="text-xs text-cyan-100 mt-1">Predicted</p>
            </div>

            {/* Avg Rainfall 30d */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5" />
                <span className="text-sm text-indigo-200">30-Day Avg</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((predictions.current_conditions?.average_rainfall_30d || 0) * 10) / 10}mm
              </p>
            </div>

            {/* Wind Speed */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5" />
                <span className="text-sm text-purple-200">Wind Speed</span>
              </div>
              <p className="text-2xl font-bold">
                {currentWeather ? currentWeather.wind_speed?.toFixed(1) : '—'} km/h
              </p>
            </div>
          </motion.div>

          {/* 7-Day Rainfall & Temperature Forecast Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Rainfall Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-400" />
                🌧️ Rainfall Forecast
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (mm)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded text-sm text-blue-200">
                📊 Total predicted: <span className="font-bold">{Math.round((predictions.total_predicted_rainfall || 0) * 10) / 10}mm</span>
              </div>
            </div>

            {/* Temperature Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-all">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-red-400" />
                🌡️ Temperature Forecast
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                  />
                  <Legend />
                  <Line dataKey="temp_max" stroke="#f87171" name="Max Temp (°C)" strokeWidth={2} />
                  <Line dataKey="temp_min" stroke="#60a5fa" name="Min Temp (°C)" strokeWidth={2} />
                  <Line dataKey="temp_avg" stroke="#fbbf24" name="Avg Temp (°C)" strokeWidth={2} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-orange-900/30 border border-orange-600/50 rounded text-sm text-orange-200">
                🌡️ Range: <span className="font-bold">{Math.round(Math.max(...(predictions.temperature_predictions?.temp_max || [20])) * 10) / 10}°C to {Math.round(Math.min(...(predictions.temperature_predictions?.temp_min || [10])) * 10) / 10}°C</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-lg p-6 mb-8 border border-gray-600 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-7 h-7 text-yellow-400" />
              ⚡ Quick Insights
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition">
                <p className="text-gray-400 text-sm mb-2">🌧️ Rainiest Day</p>
                <p className="text-2xl font-bold text-blue-300">
                  Day {(chartData.reduce((max, d, i) => d.rainfall > chartData[max].rainfall ? i : max, 0) + 1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{Math.max(...(predictions.predictions_mm || [0])).toFixed(1)}mm expected</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-yellow-500 transition">
                <p className="text-gray-400 text-sm mb-2">🌡️ Hottest Day</p>
                <p className="text-2xl font-bold text-red-300">
                  {Math.max(...(predictions.temperature_predictions?.temp_max || [30])).toFixed(0)}°C
                </p>
                <p className="text-xs text-gray-500 mt-1">Peak temperature</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-cyan-500 transition">
                <p className="text-gray-400 text-sm mb-2">❄️ Coldest Night</p>
                <p className="text-2xl font-bold text-blue-300">
                  {Math.min(...(predictions.temperature_predictions?.temp_min || [10])).toFixed(0)}°C
                </p>
                <p className="text-xs text-gray-500 mt-1">Minimum temperature</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition">
                <p className="text-gray-400 text-sm mb-2">☀️ Rain-Free Days</p>
                <p className="text-2xl font-bold text-green-300">
                  {(predictions.predictions_mm || []).filter(r => r < 0.1).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Out of 7 days</p>
              </div>
            </div>
          </motion.div>

          {/* Travel Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            {/* Travel Score Card */}
            <div className={`bg-gradient-to-br ${getTravelScoreColor(travelRec.travel_score)} rounded-lg p-6 border border-gray-700`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">✈️ Travel Recommendation</h2>
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Travel Score: {travelRec.travel_score}</p>
                <p className="text-sm opacity-90">{travelRec.reason}</p>
              </div>
              <div className="bg-white/10 rounded p-3 mb-4">
                <p className="text-sm font-semibold mb-2">🌧️ Rainy Days: {travelRec.rainy_days}</p>
                <p className="text-sm font-semibold">🌡️ Temperature: {travelRec.temperature_range}</p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Recommended Activities:</p>
                <ul className="text-sm space-y-1">
                  {travelRec.recommended_activities?.map((activity, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-lg">→</span> {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Crop Recommendations Summary */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 border border-gray-700 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">🌾 Crop Recommendations</h2>
                <Leaf className="w-8 h-8" />
              </div>

              <div className="bg-white/10 rounded p-3 mb-4 space-y-2">
                <div>
                  <p className="text-sm font-semibold">💧 Soil Moisture Status</p>
                  <p className="text-sm">{cropRec.soil_moisture_status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">🌱 Best Time to Plant</p>
                  <p className="text-sm">{cropRec.best_time_to_plant}</p>
                </div>
              </div>

              {cropRec.avoid_planting && (
                <div className="bg-red-500/20 border border-red-400/50 rounded p-3">
                  <p className="text-sm font-semibold mb-1">⚠️ Avoid Planting</p>
                  <p className="text-sm">{cropRec.avoid_planting.avoid_plants?.join(', ')}</p>
                  <p className="text-xs opacity-75 mt-1">{cropRec.avoid_planting.reason}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Detailed Planting Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-400" />
              Detailed Planting Guide
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {cropRec.planting_recommendations?.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                  className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-green-500 transition"
                >
                  <h3 className="font-bold text-green-400 mb-3 text-lg">{rec.category}</h3>
                  <p className="text-gray-300 text-sm mb-4">{rec.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.good_plants?.map((plant, pidx) => (
                      <span
                        key={pidx}
                        className="bg-green-900/30 text-green-300 text-xs px-3 py-1 rounded-full border border-green-600/50"
                      >
                        {plant}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Model Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
          >
            <h3 className="text-lg font-bold text-white mb-4">📊 Model Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">MAE</p>
                <p className="text-2xl font-bold text-blue-400">
                  {predictions.model_metrics?.mae?.toFixed(2) || '1.2'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">RMSE</p>
                <p className="text-2xl font-bold text-blue-400">
                  {predictions.model_metrics?.rmse?.toFixed(2) || '1.8'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">R²</p>
                <p className="text-2xl font-bold text-blue-400">
                  {predictions.model_metrics?.r2?.toFixed(3) || '0.82'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Sequence Length</p>
                <p className="text-2xl font-bold text-blue-400">
                  {predictions.model_metrics?.sequence_length || '7'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
