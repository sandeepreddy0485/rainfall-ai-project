# 🚀 Quick Start Guide - RainCast Frontend

## Prerequisites

- Node.js 14+ installed
- FastAPI backend running on `http://127.0.0.1:8000`
- npm or yarn package manager

## Setup Steps (5 minutes)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages including:

- React and React Router
- Tailwind CSS
- Recharts for charts
- React Leaflet for maps
- Framer Motion for animations
- And more...

### Step 2: Configure API Connection

The frontend is already configured to connect to the backend on `http://127.0.0.1:8000`

Optional: Edit `.env.local` if your backend runs on a different URL:

```env
REACT_APP_API_URL=http://your-backend-url:8000
```

### Step 3: Start Development Server

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

You should see:

- 🌧️ RainCast branding
- Sidebar with navigation menu
- Dashboard with current weather
- Location search in header

### Step 4: Verify Setup

Check that the following features work:

✅ **Weather Data Loading**

- Current temperature and conditions display
- Hourly forecast chart
- 7-day forecast cards

✅ **Navigation**

- Click menu items to navigate
- Active page is highlighted
- Sidebar toggles on mobile

✅ **Dark Mode**

- Click moon icon in header
- Theme preference saves to localStorage
- Text remains readable

✅ **Location Search**

- Type location in search bar
- Click suggestion to update location
- Weather data refreshes automatically

## Troubleshooting

### Issue: "Cannot GET /title/evaluate" (prediction endpoint was removed)

**Solution:** Ensure FastAPI backend is running

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm start
```

### Issue: "Blank page or errors in console"

**Solution:** Clear cache and dependencies

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: "Maps not displaying"

**Solution:** Ensure all dependencies are installed

```bash
npm install leaflet react-leaflet
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Main page components
│   ├── components/      # Reusable UI components
│   ├── context/         # Global state management
│   ├── utils/           # Helper functions
│   ├── api.js          # Backend API calls
│   └── App.js          # Main component
├── public/
│   └── index.html      # HTML template
├── tailwind.config.js  # Tailwind CSS config
└── package.json        # Project dependencies
```

## Key Features to Explore

### 1. **Dashboard** (Home)

- Overview of current weather
- Multiple detail cards
- 24-hour temperature trend

### 2. **Hourly Forecast**

- Toggle between temperature and rain views
- Interactive charts

### 3. **7-Day Forecast**

- Weekly overview

### 4. **Radar Map**

- Interactive map
- Double-click to change location
- Drag marker to adjust position

### 5. **Title Evaluator**

- Enter a research paper title and receive a score
- Word/character count plus reading statistics
- Suggestions for clarity and keywords

### 6. **Historical Analysis**

- Stats cards
- Charts for patterns
- Detailed data table

### 7. **Drought Monitor**

- Current drought status
- Regional analysis
- Conservation recommendations

### 8. **Exact Location**

- Precise coordinates
- Copy to clipboard
- Edit coordinates manually
- Open in Google Maps

### 9. **About**

- Project info
- Technology stack
- Data sources

## Development Tips

### Hot Reload

The app automatically refreshes when you save changes. No need to restart!

### Chrome DevTools

1. Open Chrome DevTools (F12)
2. Check console for errors
3. Use "React" tab to inspect components
4. Use "Network" tab to monitor API calls

### Disable Dark Mode for Testing

Remove from `localStorage`:

```javascript
// In browser console
localStorage.removeItem("theme");
```

### Test Location Select

Try these cities:

- London
- Tokyo
- Sydney
- New York
- Mumbai

## Production Build

Create optimized production build:

```bash
npm run build
```

This creates a `build/` folder with optimized files (typically 40-50KB gzipped).

## Next Steps

1. ✅ Get backend running
2. ✅ Install frontend dependencies
3. ✅ Start development server
4. 📖 Read `FRONTEND_README.md` for detailed docs
5. 🎨 Customize colors in `tailwind.config.js`
6. 🎯 Deploy to Vercel, Netlify, or your server

## Common Ports

- **Frontend:** http://localhost:3000
- **Backend:** http://127.0.0.1:8000
- **Docs:** http://127.0.0.1:8000/docs

## Need Help?

- Check browser console for error messages
- Verify backend is running: `curl http://127.0.0.1:8000/`
- Clear browser cache: Ctrl+Shift+Delete
- Check `.env.local` configuration

---

**You're all set! 🎉 Start exploring RainCast!**
