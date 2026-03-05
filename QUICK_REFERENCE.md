# ⚡ RainCast Frontend - Quick Reference

## 🚀 Quick Start (Copy & Paste)

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## 📍 Navigation Map

```
Home (/)
├── 📊 Hourly (/hourly)
├── 📅 Weekly (/weekly)
├── 🗺️ Radar (/radar)
├── 📝 Title evaluator (/title-evaluator)
├── 📈 Historical (/historical)
├── 🌵 Drought (/drought)
├── 📍 Location (/location)
└── ℹ️ About (/about)
```

## 🎨 Colors & Theme

```javascript
// Primary Colors (from tailwind.config.js)
Primary: #0ea5e9 (blue-500)
Dark: #1e293b (slate-900)
Accent: #3b82f6 (blue-600)
Success: #10b981 (green-500)
Warning: #f59e0b (amber-500)
Error: #ef4444 (red-500)
```

## 🔌 API Endpoints

```javascript
// Get current weather
weatherAPI.getCurrentWeather(17.385, 78.4867);

// Get historical data
weatherAPI.getHistoricalWeather(17.385, 78.4867);

// Evaluate a research title
// titleAPI.evaluate("An Analysis of Algorithm Performance");

// Search location
locationAPI.search("London");
```

## 🎯 Key Hooks & Functions

```javascript
// Get weather context
const { currentLocation, currentWeather, loading } = useWeather();

// Fetch weather data
const { fetchCurrentWeather } = useWeather();
await fetchCurrentWeather(lat, lon);

// Search location
const { searchLocation } = useWeather();
await searchLocation("Bangkok");

// Update location
const { setLocation } = useWeather();
await setLocation(lat, lon, city);

// Theme toggle
const { isDark, toggleTheme } = useWeather();
```

## 📊 Chart Components

```javascript
// Line Chart (Temperature)
<LineChart data={data}>
  <XAxis dataKey="day" />
  <YAxis />
  <Line dataKey="temperature" />
</LineChart>

// Bar Chart (Precipitation)
<BarChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Bar dataKey="precipitation" />
</BarChart>

// Area Chart (Historical)
<AreaChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Area dataKey="rainfall" />
</AreaChart>
```

## 🗺️ Map Components

```javascript
// Map Container
<MapContainer center={[lat, lon]} zoom={10}>
  <TileLayer url="openstreetmap" />
  <Marker position={[lat, lon]} />
</MapContainer>

// Marker with popup
<Marker position={[lat, lon]}>
  <Popup>Location info</Popup>
</Marker>

// Draggable marker
<Marker draggable={true}
        eventHandlers={{ dragend: handleDrag }} />
```

## 🎬 Animation Patterns

```javascript
// Container with staggered children
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>

// Hover scale
<motion.div whileHover={{ scale: 1.05 }}>
  Hover me
</motion.div>

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 🎨 Tailwind Classes Quick List

```css
/* Spacing */
p-4 /* padding */
m-4 /* margin */
gap-4 /* flex gap */

/* Colors */
bg-blue-500
text-slate-900
dark:bg-slate-800

/* Layout */
flex flex-col
grid grid-cols-3
w-full h-screen

/* Responsive */
md:grid-cols-2 /* medium+ screens */
lg:p-8 /* large+ screens */

/* Hover/States */
hover:bg-blue-600
focus:ring-2
active:scale-95

/* Dark mode */
dark:bg-slate-800
dark:text-white

/* Animations */
animate-spin
animate-pulse
transition-all duration-300
```

## 🔧 Common Tasks

### Add New Page

```javascript
// 1. Create pages/MyPage.js
export default function MyPage() {
  const { ... } = useWeather();
  return <div>Content</div>;
}

// 2. Add route in App.js
<Route path="/mypage" element={<MyPage />} />

// 3. Add menu item in Layout.js
{ path: '/mypage', label: 'My Page', icon: '📊' }
```

### Add New API Call

```javascript
// 1. Add to api.js
export const myAPI = {
  getData: (params) => api.get('/endpoint', { params })
};

// 2. Add to WeatherContext.js
const { data, setData } = useState(null);
const fetchData = async () => {
  const response = await myAPI.getData(...);
  setData(response.data);
};

// 3. Use in component
const { data } = useWeather();
```

### Create Custom Component

```javascript
// components/MyComponent.js
import { motion } from "framer-motion";
import clsx from "clsx";

export default function MyComponent({ text, variant }) {
  return (
    <motion.div
      className={clsx("rounded-lg p-4", variant === "primary" && "bg-blue-500")}
      whileHover={{ scale: 1.05 }}
    >
      {text}
    </motion.div>
  );
}
```

## 🐛 Debugging Tips

```javascript
// Check current state
const context = useWeather();
console.log("Context:", context);

// Monitor API calls
// Open DevTools → Network tab
// Filter: Fetch/XHR

// Check localStorage
console.log(localStorage);
localStorage.removeItem("theme");

// Check component props
console.log("Props:", props);

// Monitor animations
// React DevTools → Profiler tab
```

## ⚙️ Environment Variables

```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_WEATHER_API_URL=https://api.open-meteo.com/v1
REACT_APP_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 📱 Responsive Design Pattern

```javascript
// Mobile First
<div className="
  grid grid-cols-1      /* 1 column mobile */
  md:grid-cols-2        /* 2 columns tablet */
  lg:grid-cols-3        /* 3 columns desktop */
  gap-4
">
```

## 🎯 Performance Optimizations

```javascript
// Memoize expensive calculations
const memoizedValue = useMemo(() => complexCalculation(data), [data]);

// Debounce search input
const debouncedSearch = useCallback(
  debounce((value) => handleSearch(value), 500),
  [],
);

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>;
```

## 🚢 Deployment Checklist

```
✅ Build: npm run build
✅ Test: npm start (production build locally)
✅ Update .env with production API URL
✅ Check build/index.html exists
✅ Deploy build/ folder
✅ Set environment variables on hosting
✅ Test all routes and API calls
✅ Check dark mode works
✅ Test on mobile device
✅ Monitor console for errors
```

## 📞 Troubleshooting

```javascript
// Blank page
→ Check browser console for errors
→ Verify npm install completed
→ Clear cache: npm cache clean --force

// Styles not loading
→ Check postcss.config.js exists
→ Verify tailwind.config.js paths
→ Try: npm install -D tailwindcss

// API errors
→ Ensure backend running: curl http://127.0.0.1:8000
→ Check CORS headers
→ Verify .env.local has correct URL
→ Check Network tab in DevTools

// Maps not showing
→ Verify leaflet installed: npm install leaflet
→ Check import statements
→ Ensure CSS is imported
→ Try hard refresh: Ctrl+Shift+R
```

## 📚 File Quick Links

- **Routing** → `src/App.js`
- **State** → `src/context/WeatherContext.js`
- **API** → `src/api.js`
- **Layout** → `src/components/Layout.js`
- **Styles** → `src/index.css` + `tailwind.config.js`
- **Utils** → `src/utils/`
- **Docs** → `FRONTEND_README.md`

## 🎓 Learning Resources

- **React Docs:** https://react.dev
- **Tailwind:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org/
- **Leaflet:** https://leafletjs.com/
- **Framer:** https://www.framer.com/motion/

---

**Keep this handy for quick development reference!** 🚀

_Last Updated: 2026_
