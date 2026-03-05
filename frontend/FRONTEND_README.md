# 📝 TitleEvaluator Frontend - Weather Dashboard & Research Title Tool

A modern, interactive React-based weather dashboard with an integrated research title evaluation utility. Features real-time weather data, academic title analysis, drought monitoring, and beautiful visualizations.

## 🚀 Features

### Core Features

- **📊 Real-Time Weather Dashboard** - Current conditions, temperature, humidity, wind speed
- **⏰ Hourly Forecast** - 24-hour detailed breakdown with interactive charts
- **📅 7-Day Forecast** - Weekly overview with temperature trends
- **🗺️ Interactive Radar Map** - Live map with precipitation visualization and satellite layers
- **📝 Title Evaluator** - Analyze and score research paper titles for clarity and keywords
- **📈 Historical Analysis** - Deep dive into weather patterns and statistics
- **🌵 Drought Monitor** - Real-time drought index with regional analysis
- **📍 Exact Location** - Precise coordinates with interactive map editing

### User Experience

- 🌙 **Dark/Light Mode** - Automatic theme switching with localStorage persistence
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile devices
- ✨ **Smooth Animations** - Framer Motion for delightful micro-interactions
- 🎨 **Beautiful UI** - Tailwind CSS with gradient cards and modern design
- 🔍 **Location Search** - Autocomplete location search with live suggestions

## 📋 Prerequisites

- Node.js 14+ and npm/yarn
- FastAPI backend running on `http://127.0.0.1:8000`
- Modern browser with ES6+ support

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create/update `.env.local`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_WEATHER_API_URL=https://api.open-meteo.com/v1
REACT_APP_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.js        # Main layout with sidebar
│   │   └── LocationSearch.js# Autocomplete search
│   ├── pages/               # Page components
│   │   ├── Dashboard.js     # Today/home page
│   │   ├── HourlyForecast.js
│   │   ├── WeeklyForecast.js
│   │   ├── RadarMap.js
│   │   ├── TitleEvaluator.js
│   │   ├── HistoricalAnalysis.js
│   │   ├── DroughtMonitor.js
│   │   ├── ExactLocation.js
│   │   └── About.js
│   ├── context/             # React Context
│   │   └── WeatherContext.js # Global state management
│   ├── utils/               # Utility functions
│   │   ├── weatherUtils.js  # Weather-specific helpers
│   │   └── helpers.js       # General utilities
│   ├── api.js               # API service layer
│   ├── App.js               # Main app component
│   ├── index.js             # React entry point
│   └── index.css            # Global styles with Tailwind
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── README.md               # This file
```

## 🔧 Key Technologies

### Frontend Framework

- **React 19.2.4** - Component-based UI library
- **React Router 6.28.3** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework

### Data & Charts

- **Recharts 3.7.0** - Composable charting library
- **Axios 1.13.5** - HTTP client

### Maps & Visualization

- **React Leaflet 4.2.3** - React wrapper for Leaflet
- **Leaflet 1.9.4** - Interactive maps

### Animations & UX

- **Framer Motion 11.7.0** - Production-ready animation library
- **Lucide React 0.408.0** - Beautiful icon library
- **clsx 2.1.1** - Conditional className management

## 🎨 Styling & Theming

The app uses Tailwind CSS with custom configuration:

- **Color Scheme**: Blue primary with gradient overlays
- **Dark Mode**: Automatic based on system preference, toggle in header
- **Responsive**: Mobile-first with breakpoints (sm, md, lg, xl, 2xl)
- **Animations**: Custom Framer Motion transitions and Tailwind keyframes

### Custom Utilities

- `.glass` - Glassmorphism effect
- `.gradient-primary` - Blue gradient
- `.gradient-sunset` - Orange gradient
- `.gradient-storm` - Dark gradient
- `.transition-all-300` - Smooth transitions

## 🌐 API Integration

### Context API (WeatherContext.js)

Global state management for:

- Current weather data
- Hourly/daily forecasts
- Historical data
- Title evaluation
- User preferences (theme, location, favorites)
- Loading and error states

### API Service Layer (api.js)

```javascript
// Location API
locationAPI.search(query);

// Weather API
weatherAPI.getCurrentWeather(lat, lon);
weatherAPI.getHistoricalWeather(lat, lon);

// Prediction API
predictionAPI.predictRainfall(lat, lon, days);
```

#### Service Endpoints

- `GET /` - Health check
- `GET /location?query=string` - Location search
- `GET /weather/current?lat&lon` - Current weather
- `GET /weather/historical?lat&lon` - Historical data
- `GET /title/evaluate?title=...` - Research title analysis

## 📊 Pages Overview

### Dashboard (Today)

- Large weather icon and current temperature
- High/low temperature and rainfall
- Weather details cards (humidity, wind, pressure, visibility)
- Sunrise/sunset times
- 24-hour temperature trend

### Hourly Forecast

- Toggle between temperature and precipitation views
- Line chart for temperature trends
- Bar chart for precipitation
- 24 hourly detail cards

### 7-Day Forecast

- Daily rainfall bar chart
- Temperature range area chart
- 7 forecast cards with weather details
- Optional AI prediction overlay

### Radar Map

- Interactive map with draggable marker
- Tile layer switching (satellite, vector)
- Precipitation heatmap visualization
- Click-to-search location feature

### Title Evaluator

- Enter your proposed research paper title
- Get real-time analysis including word/character count
- See calculated score and average word length
- Identify research keywords and filler words
- Receive suggestions for improving clarity and focus

### Historical Analysis

- Weather statistics cards
- Daily rainfall area chart
- Temperature range visualization
- Detailed data table with sorting

### Drought Monitor

- Current drought status with visual gauge
- Regional drought analysis
- Water availability and irrigation needs
- Conservation action recommendations

### Exact Location

- Precision coordinate display
- Manual coordinate editing
- Interactive map with draggable marker
- Copy to clipboard functionality
- Google Maps integration

### About

- Project description
- Technology stack showcase
- Key features highlight
- Team information
- Contact links

## 🎯 Usage Examples

### Basic Setup

```javascript
import { useWeather } from "./context/WeatherContext";

function MyComponent() {
  const { currentWeather, loading, fetchCurrentWeather } = useWeather();

  useEffect(() => {
    fetchCurrentWeather(lat, lon);
  }, []);

  return loading ? <Spinner /> : <Content data={currentWeather} />;
}
```

### Location Search

```javascript
const { searchLocation, setLocation } = useWeather();

// Search for location
const result = await searchLocation("Hyderabad");

// Set specific coordinates
await setLocation(17.385, 78.4867, "Hyderabad");
```

### Fetch Predictions

```javascript
const { predictions, fetchPredictions } = useWeather();

// Fetch 7-day predictions
await fetchPredictions(7);

// Access prediction data
const rainfallData = predictions?.predicted_rainfall;
```

## 🔌 Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://127.0.0.1:8000

# Optional: Custom API endpoints
REACT_APP_WEATHER_API_URL=https://api.open-meteo.com/v1
REACT_APP_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 🚢 Build & Deployment

### Development Build

```bash
npm start
```

### Production Build

```bash
npm run build
```

Output files in `build/` directory, ready for deployment.

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag `build` folder to Netlify
```

## 🐛 Troubleshooting

### Map not loading

- Ensure Leaflet CSS is imported
- Check browser console for CORS errors
- Verify tile server URL is accessible

### API connection errors

- Ensure FastAPI backend is running on `http://127.0.0.1:8000`
- Check browser console for CORS issues
- Verify network tab in DevTools

### Dark mode not working

- Clear localStorage: `localStorage.clear()`
- Check system theme preference
- Verify Tailwind dark mode class on root element

### Chart data not displaying

- Check API response in Network tab
- Verify data structure matches expected format
- Ensure data array is not empty

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Guide](https://recharts.org/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Open-Meteo API](https://open-meteo.com/en/docs)

## 📝 License

MIT License - Feel free to use this project for personal or commercial use.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review component stories

---

**Made with ❤️ by the RainCast Team**

_Empowering better decisions through AI-driven weather intelligence._
