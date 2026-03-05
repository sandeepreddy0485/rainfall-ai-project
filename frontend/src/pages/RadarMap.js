import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { useWeather } from '../context/WeatherContext';
import { motion } from 'framer-motion';
import { Navigation, Layers, Cloud, Droplets, Thermometer, Wind } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ lat, lon }) => {
  const map = useMap();

  useEffect(() => {
    // Leaflet needs an explicit invalidateSize when its container
    // resizes or when it becomes visible.  Without this you get the
    // "puzzle piece" effect shown in the screenshot.
    map.invalidateSize();
    map.setView([lat, lon], 10);
  }, [lat, lon, map]);

  useEffect(() => {
    const handle = () => map.invalidateSize();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [map]);

  return null;
};

const RadarMap = () => {
  const { currentLocation, currentWeather, setLocation } = useWeather();
  const [mapCenter, setMapCenter] = useState([currentLocation.lat, currentLocation.lon]);
  const [showSatellite, setShowSatellite] = useState(true);
  const [satelliteProvider, setSatelliteProvider] = useState('esri');
  const [showPrecipitation, setShowPrecipitation] = useState(true);
  const [showTemperature, setShowTemperature] = useState(false);

  const handleCenterLocation = () => {
    setMapCenter([currentLocation.lat, currentLocation.lon]);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setMapCenter([lat, lng]);
  };

  // Generate precipitation heatmap circles
  const generatePrecipitationHeatmap = () => {
    const circles = [];
    const baseLat = currentLocation.lat;
    const baseLon = currentLocation.lon;
    
    for (let i = 0; i < 25; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.8;
      const offsetLon = (Math.random() - 0.5) * 0.8;
      const intensity = Math.random();
      
      circles.push({
        lat: baseLat + offsetLat,
        lon: baseLon + offsetLon,
        intensity: intensity,
        radius: 1500 + intensity * 6000,
      });
    }
    return circles;
  };

  const precipitationHeatmap = generatePrecipitationHeatmap();

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
      className="space-y-6 h-screen flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Fixed height */}
      <motion.div variants={itemVariants} className="flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">🗺️ Weather Radar</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Interactive map showing precipitation patterns, temperature zones, and weather layers
          </p>
        </div>
      </motion.div>

      {/* Controls - Fixed height */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0"
      >
        {/* Left: Map Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers size={20} />
            Map Layers
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showSatellite}
                onChange={(e) => setShowSatellite(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">🛰️ Satellite Imagery</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Aerial view</p>
              </div>
            </label>
            {/* provider selector */}
            {showSatellite && (
              <div className="flex items-center gap-2 ml-8">
                <select
                  value={satelliteProvider}
                  onChange={(e) => setSatelliteProvider(e.target.value)}
                  className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-1 text-sm"
                >
                  <option value="esri">Esri World Imagery</option>
                  <option value="stamen">Stamen Terrain</option>
                  <option value="carto">Carto Voyager Satellite</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showPrecipitation}
                onChange={(e) => setShowPrecipitation(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">💧 Precipitation</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Rainfall zones</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showTemperature}
                onChange={(e) => setShowTemperature(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">🌡️ Temperature</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Heat map</p>
              </div>
            </label>

            <button
              onClick={handleCenterLocation}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
            >
              <Navigation size={18} />
              Center on Location
            </button>
          </div>
        </div>

        {/* Right: Current Weather Info */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 shadow-lg border border-blue-200 dark:border-blue-800 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">📍 Location Info</h3>

          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Location</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{currentLocation.city}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {currentLocation.state ? `${currentLocation.state}${currentLocation.district ? `, ${currentLocation.district}` : ''}` : ''}
              </p>
            </div>

            {currentWeather && (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={16} className="text-red-600 dark:text-red-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Temperature</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(currentWeather.temperature)}°C
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind size={16} className="text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Wind</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(currentWeather.wind_speed || 0).toFixed(1)} km/h
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map Container - Takes remaining space */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 w-full flex-grow"
        style={{ minHeight: '500px' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          onClick={handleMapClick}
        >
          <MapController lat={mapCenter[0]} lon={mapCenter[1]} />
          
          {/* Base Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Satellite/Vector overlay */}
          {showSatellite && satelliteProvider === 'esri' && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri"
              opacity={0.35}
            />
          )}
          {showSatellite && satelliteProvider === 'stamen' && (
            <TileLayer
              url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
              attribution="Map tiles by Stamen Design" 
              opacity={0.5}
            />
          )}
          {showSatellite && satelliteProvider === 'carto' && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              attribution="&copy; CartoDB"
              opacity={0.5}
            />
          )}

          {/* Current Location Marker - Enhanced with custom styling */}
          <Marker position={mapCenter}>
            <Popup>
              <div className="text-sm font-medium w-48">
                <p className="font-bold text-lg mb-2">📍 {currentLocation.city}</p>
                <p className="text-slate-700 font-semibold text-xs">COORDINATES</p>
                <p className="text-slate-600 mb-2">{mapCenter[0].toFixed(4)}°N, {mapCenter[1].toFixed(4)}°E</p>
                {currentWeather && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-red-600 font-bold">🌡️ {Math.round(currentWeather.temperature)}°C</p>
                    <p className="text-blue-600 font-bold">💨 {(currentWeather.wind_speed || 0).toFixed(1)} km/h</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Precipitation Heatmap Circles */}
          {showPrecipitation &&
            precipitationHeatmap.map((circle, idx) => (
              <CircleMarker
                key={idx}
                center={[circle.lat, circle.lon]}
                radius={Math.sqrt(circle.radius / 500)}
                fillOpacity={circle.intensity * 0.6}
                color="transparent"
                fillColor={
                  circle.intensity > 0.8
                    ? '#dc2626'
                    : circle.intensity > 0.5
                    ? '#f59e0b'
                    : circle.intensity > 0.3
                    ? '#3b82f6'
                    : '#0ea5e9'
                }
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">Precipitation Zone</p>
                    <p className="text-slate-700">{(circle.intensity * 100).toFixed(0)}% Intensity</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Temperature Gradient Overlay */}
          {showTemperature &&
            precipitationHeatmap.slice(0, 15).map((circle, idx) => (
              <CircleMarker
                key={`temp-${idx}`}
                center={[circle.lat, circle.lon]}
                radius={Math.sqrt(circle.radius / 600)}
                fillOpacity={circle.intensity * 0.4}
                color="transparent"
                fillColor={
                  circle.intensity > 0.8
                    ? '#ef4444'
                    : circle.intensity > 0.6
                    ? '#f97316'
                    : circle.intensity > 0.4
                    ? '#fbbf24'
                    : '#86efac'
                }
              >
                <Popup>
                  <p className="text-sm font-bold">Temperature Zone: {(20 + circle.intensity * 15).toFixed(1)}°C</p>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </motion.div>

      {/* Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Precipitation</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">Click on blue/orange zones for detailed rainfall data</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Temperature</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">Toggle to view temperature heat zones across the region</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Cloud className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Satellite</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">Enable satellite imagery for better geographic context</p>
        </div>
      </motion.div>

      {/* Usage Tips */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-l-4 border-indigo-500 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          💡 How to Use the Radar
        </h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <li>✓ <strong>Click on the map</strong> to select a new location and instantly view weather data</li>
          <li>✓ <strong>Toggle layers</strong> to switch between satellite, precipitation, and temperature views</li>
          <li>✓ <strong>Hover over zones</strong> to see detailed information about precipitation & temperature</li>
          <li>✓ <strong>Center button</strong> quickly returns to your current location</li>
          <li>✓ <strong>Blue zones</strong> indicate light rain, <strong>orange</strong> moderate, <strong>red</strong> heavy precipitation</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default RadarMap;
