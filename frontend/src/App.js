import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WeatherProvider } from './context/WeatherContext';
import Layout from './components/Layout';

// Page imports
import Dashboard from './pages/Dashboard';
import HourlyForecast from './pages/HourlyForecast';
import WeeklyForecast from './pages/WeeklyForecast';
import RadarMap from './pages/RadarMap';
import HistoricalAnalysis from './pages/HistoricalAnalysis';
import DroughtMonitor from './pages/DroughtMonitor';
import ExactLocation from './pages/ExactLocation';
import AIPredictions from './pages/AIPredictions';
import About from './pages/About';

function App() {
  return (
    <WeatherProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hourly" element={<HourlyForecast />} />
            <Route path="/weekly" element={<WeeklyForecast />} />
            <Route path="/radar" element={<RadarMap />} />
            <Route path="/historical" element={<HistoricalAnalysis />} />
            <Route path="/drought" element={<DroughtMonitor />} />
            <Route path="/ai-predictions" element={<AIPredictions />} />
            <Route path="/location" element={<ExactLocation />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </WeatherProvider>
  );
}

export default App;
