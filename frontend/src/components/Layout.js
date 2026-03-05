import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, MapPin, ChevronDown } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import LocationSearch from './LocationSearch';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme, currentLocation } = useWeather();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Today', icon: '🏠' },
    { path: '/hourly', label: 'Hourly', icon: '📊' },
    { path: '/weekly', label: '7-Day', icon: '📅' },
    { path: '/radar', label: 'Radar', icon: '🗺️' },
    { path: '/historical', label: 'Historical', icon: '📈' },
    { path: '/drought', label: 'Drought', icon: '🌵' },
    { path: '/ai-predictions', label: 'AI Predictions', icon: '🤖' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Header - AccuWeather Style */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm sticky">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">🌧️</div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">RainCast</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Weather</p>
              </div>
            </Link>

            {/* Search Bar - Center */}
            <div className="hidden md:block flex-1 mx-4 max-w-md">
              <LocationSearch />
            </div>

            {/* Location Display + Theme */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <MapPin size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex flex-col gap-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">📍 Location</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentLocation.city}
                  </span>
                </div>
                <ChevronDown size={16} className="text-slate-500 ml-2" />
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-slate-600" />}
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <LocationSearch />
          </div>
        </div>

        {/* Horizontal Navigation */}
        <nav className="hidden md:flex bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2',
                  isActive(item.path)
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <aside className="fixed inset-0 z-30 md:hidden bg-black/50">
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 shadow-lg p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      isActive(item.path)
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 RainCast. Research Title Analysis
      </footer>
    </div>
  );
};

export default Layout;
