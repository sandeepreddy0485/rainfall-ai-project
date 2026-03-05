import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useWeather } from '../context/WeatherContext';
import { motion } from 'framer-motion';
import { Copy, Check, Navigation } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';
import L from 'leaflet';
import clsx from 'clsx';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationUpdater = ({ onLocationChange }) => {
  useMapEvents({
    dblclick(e) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
};

const ExactLocation = () => {
  const { currentLocation, setLocation, loading } = useWeather();
  const [mapCenter, setMapCenter] = useState([currentLocation.lat, currentLocation.lon]);
  const [copied, setCopied] = useState(false);
  const [markerPos, setMarkerPos] = useState([currentLocation.lat, currentLocation.lon]);
  const [editMode, setEditMode] = useState(false);
  const [customLat, setCustomLat] = useState(currentLocation.lat.toString());
  const [customLon, setCustomLon] = useState(currentLocation.lon.toString());

  const handleMapClick = (lat, lng) => {
    setMarkerPos([lat, lng]);
    setCustomLat(lat.toFixed(6));
    setCustomLon(lng.toFixed(6));
  };

  const handleApplyLocation = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setLocation(lat, lon, `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      setMapCenter([lat, lon]);
      setMarkerPos([lat, lon]);
      setEditMode(false);
    }
  };

  const handleCopyCoordinates = () => {
    copyToClipboard(`${customLat}, ${customLon}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCenter = () => {
    setMapCenter([currentLocation.lat, currentLocation.lon]);
    setMarkerPos([currentLocation.lat, currentLocation.lon]);
  };

  const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 12);
    }, [center, map]);
    return null;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Exact Location</h1>

      {/* Coordinates Display */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Your Coordinates
        </h3>

        {!editMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Latitude</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{customLat}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">Longitude</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{customLon}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyCoordinates}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Coordinates
                  </>
                )}
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                ✎ Edit Coordinates
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  step="0.000001"
                  min="-90"
                  max="90"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  step="0.000001"
                  min="-180"
                  max="180"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApplyLocation}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                ✓ Apply Location
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setCustomLat(currentLocation.lat.toString());
                  setCustomLon(currentLocation.lon.toString());
                }}
                className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Information Box */}
      <motion.div
        className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">💡 Location Precision</h4>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          Your location is displayed with 6 decimal places of precision, allowing accuracy to within ~0.1 meters.
        </p>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• <strong>Double-click on the map</strong> to automatically update coordinates to that location</li>
          <li>• <strong>Drag the marker</strong> on the map to adjust your location</li>
          <li>• <strong>Copy button</strong> saves coordinates to your clipboard</li>
          <li>• <strong>Edit button</strong> allows manual coordinate entry</li>
        </ul>
      </motion.div>

      {/* Interactive Map */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ height: '500px' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          doubleClickZoom={false}
        >
          <MapController center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationUpdater onLocationChange={handleMapClick} />
          <Marker
            position={markerPos}
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                handleMapClick(latlng.lat, latlng.lng);
              },
            }}
            draggable={true}
          />
        </MapContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={handleCenter}
          className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow rounded-lg p-4 flex items-center gap-3 text-left"
        >
          <Navigation className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Center Map</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Return to your current location</p>
          </div>
        </button>

        <button
          onClick={() => {
            const baseUrl = 'https://maps.google.com/?q=';
            window.open(baseUrl + customLat + ',' + customLon, '_blank');
          }}
          className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow rounded-lg p-4 flex items-center gap-3 text-left"
        >
          <span className="text-xl">🗺️</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Open in Google Maps</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">View in external map service</p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ExactLocation;
