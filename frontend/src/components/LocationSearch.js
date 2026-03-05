import React, { useState, useCallback } from 'react';
import { Search, X, Loader, MapPin } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { locationAPI } from '../api';
import { debounce } from '../utils/helpers';
import clsx from 'clsx';

const LocationSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { searchLocation, setLocation, loading } = useWeather();

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsSearching(true);
        // call the location API directly for suggestions so we don't
        // prematurely update the current location context.
        const response = await locationAPI.search(searchQuery);
        // convert server results into our local suggestion format
        const raw = response.data.results || [];
        // dedupe by latitude/longitude to avoid identical entries
        const seen = new Set();
        const results = raw
          .filter((r) => {
            const key = `${r.latitude},${r.longitude}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((r) => ({
            name: r.name,
            display_name: r.display_name, // keep the pre-built text from server
            country: r.country,
            state: r.state || r.admin1 || '',
            district: r.district || '',
            admin1: r.admin1 || '',
            type: r.type || '',
            lat: r.latitude,
            lon: r.longitude,
          }));

        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // clear search box and suggestions
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSelectLocation = (suggestion) => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    // use the server-provided display name which already includes district/state
    const displayName = suggestion.display_name || suggestion.name;
    setLocation(
      suggestion.lat,
      suggestion.lon,
      displayName,
      suggestion.state || suggestion.admin1,
      suggestion.district
    );
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search city, zip code or location..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              // if user hits enter without picking a suggestion, perform a direct search
              searchLocation(query.trim());
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          className={clsx(
            'w-full pl-12 pr-12 py-2.5 rounded-lg border transition-all',
            'bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400',
            'border-slate-300 dark:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'shadow-sm hover:shadow-md'
          )}
        />
        {(query || isSearching) && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectLocation(suggestion)}
              className={clsx(
                'w-full flex items-start gap-3 px-4 py-3 transition-colors text-left',
                'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                idx < suggestions.length - 1 && 'border-b border-slate-200 dark:border-slate-700'
              )}
            >
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {suggestion.display_name || suggestion.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {suggestion.district ? `${suggestion.district}, ` : ''}
                  {suggestion.state ? suggestion.state : suggestion.country}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {suggestion.type && suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
