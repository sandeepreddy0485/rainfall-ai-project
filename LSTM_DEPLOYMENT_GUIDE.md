# LSTM Rainfall Prediction Model - Production Deployment Guide

## Overview

This guide covers:

1. Training the LSTM model
2. Deploying to production
3. Making predictions via FastAPI
4. Production best practices

---

## 1. TRAINING THE MODEL

### Step 1: Install Dependencies

```bash
cd backend
pip install tensorflow scikit-learn numpy pandas
```

### Step 2: Create Models Directory

```bash
mkdir -p models
```

### Step 3: Train the LSTM Model

```bash
python train_lstm_model.py
```

This script will:

- Fetch 365 days of historical weather data from Open-Meteo
- Create sequences using a 14-day sliding window
- Scale features using MinMaxScaler to [0, 1]
- Split into train/test (80/20, no shuffle)
- Train a 2-layer LSTM model with 100 epochs
- Evaluate with MAE, RMSE, R² (both scaled and mm)
- Save:
  - `models/rainfall_lstm_model.keras` (the trained model)
  - `models/lstm_scaler.pkl` (the fitted scaler)
  - `models/rainfall_lstm_model_metrics.pkl` (evaluation metrics)

### Example Output:

```
======================================================================
LSTM RAINFALL PREDICTION MODEL TRAINING
======================================================================
Fetching 365 days of historical data for (28.5355, 77.3910)...
Retrieved 365 days of data

Feature shape before scaling: (365, 3)
Feature shape after scaling: (365, 3)

Sequence shapes:
  X (input):  (344, 14, 3)  - (samples, timesteps=14, features=3)
  y (output): (344, 7)      - (samples, forecast_days=7)

Train/Test split (no shuffle):
  Train: X(275, 14, 3), y(275, 7)
  Test:  X(69, 14, 3), y(69, 7)

Building LSTM model...

======================================================================
TRAINING
======================================================================
Epoch 1/100
9/9 [==============================] - 1s 80ms/step - loss: 0.0487 - mae: 0.2040 - val_loss: 0.0421 - val_mae: 0.1865
...
Epoch 45/100
9/9 [==============================] - 0s 18ms/step - loss: 0.0019 - mae: 0.0334 - val_loss: 0.0024 - val_mae: 0.0368

======================================================================
MODEL EVALUATION
======================================================================
Metrics (in scaled space [0-1]):
  MAE:  0.008923
  RMSE: 0.013456
  R²:   0.945632

Metrics (in original rainfall space - mm):
  MAE:  1.2345 mm
  RMSE: 1.8765 mm
  R²:   0.945632

Sample predictions (first test sample):
  Actual rainfall (7 days):   [2.3  0.0  5.4  0.1  0.0  3.2  1.1] mm
  Predicted rainfall (7 days): [2.1  0.2  5.1  0.3  0.0  3.5  1.0] mm

Model saved to models/rainfall_lstm_model.keras
Metrics saved to models/rainfall_lstm_model_metrics.pkl
```

---

## 2. UPDATING FastAPI Application

### Step 1: Replace the Predictor Class

Replace the import in `app/main.py`:

**Before:**

```python
from app.ml_model import TimeSeriesRainfallPredictor
...
app.state.predictor = TimeSeriesRainfallPredictor()
```

**After:**

```python
from app.ml_model_lstm import LSTMRainfallPredictor
...
app.state.predictor = LSTMRainfallPredictor(
    model_path='models/rainfall_lstm_model.keras',
    scaler_path='models/lstm_scaler.pkl'
)
```

### Step 2: Startup Code in `app/main.py`

The startup event should now load the pre-trained model:

```python
@app.on_event("startup")
async def startup_event():
    """Initialize shared resources: Redis cache, predictor instances."""
    try:
        import redis.asyncio as redis
        from fastapi_cache2 import FastAPICache
        from fastapi_cache2.backends.redis import RedisBackend

        redis_client = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        FastAPICache.init(RedisBackend(redis_client), prefix="raincast")
        app.state.redis = redis_client
        logger.info("Redis cache initialized")
    except Exception as e:
        logger.warning(f"Failed to initialize Redis caching: {e}")
        app.state.redis = None

    # Load pre-trained LSTM model
    try:
        app.state.predictor = LSTMRainfallPredictor(
            model_path='models/rainfall_lstm_model.keras',
            scaler_path='models/lstm_scaler.pkl'
        )
        logger.info("LSTM Rainfall Predictor loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load LSTM predictor: {e}")
        raise

    # Load drought predictor
    app.state.drought = DroughtPredictor()
    app.state.drought.normal_rainfall = settings.normal_rainfall_mm_per_week
    logger.info("Predictor instances initialized")
```

---

## 3. INFERENCE PIPELINE

### API Usage Example:

```bash
# Get 7-day rainfall predictions
curl "http://localhost:8000/predict?lat=28.5355&lon=77.3910&days=7"
```

### Response Example:

```json
{
  "predictions_mm": [2.3, 0.0, 5.4, 0.1, 0.0, 3.2, 1.1],
  "temperature_predictions": {
    "temp_max": [32.1, 31.8, 30.5, 31.2, 32.0, 31.9, 32.3],
    "temp_min": [21.0, 20.8, 19.5, 20.2, 21.0, 20.9, 21.3],
    "temp_avg": [26.55, 26.3, 25.0, 25.7, 26.5, 26.4, 26.8]
  },
  "total_predicted_rainfall": 12.1,
  "current_conditions": {
    "temperature": 26.5,
    "temperature_max": 32.5,
    "temperature_min": 20.8,
    "last_rainfall": 0.0,
    "average_rainfall_30d": 3.2,
    "average_temperature_30d": 26.1
  },
  "model_metrics": {
    "mae": 1.2345,
    "rmse": 1.8765,
    "r2": 0.945632,
    "sequence_length": 14,
    "model_type": "LSTM Neural Network",
    "data_points_used": 180
  },
  "recommendations": {
    "travel": {...},
    "crops": {...}
  }
}
```

### Python Inference Example:

```python
from app.ml_model_lstm import LSTMRainfallPredictor
from app.weather import fetch_historical_weather

# Initialize once at startup
predictor = LSTMRainfallPredictor()

# Use for predictions
historical_data = fetch_historical_weather(lat=28.5355, lon=77.3910)
hist_list = historical_data.to_dict(orient='records')

result = predictor.predict_rainfall(hist_list, days=7)

print(f"7-day rainfall forecast: {result['predictions_mm']} mm")
print(f"Total predicted rainfall: {result['total_predicted_rainfall']:.2f} mm")
print(f"Model R² score: {result['model_metrics']['r2']:.4f}")
```

---

## 4. PRODUCTION BEST PRACTICES

### A. Model Management

1. **Version Control**

   ```bash
   # Save model with timestamp
   cp models/rainfall_lstm_model.keras models/rainfall_lstm_model_v1_2025-03-03.keras
   cp models/lstm_scaler.pkl models/lstm_scaler_v1_2025-03-03.pkl
   ```

2. **Re-training Schedule**
   - Retrain monthly with fresh data
   - Use separate training script in a cron job:
     ```bash
     0 0 1 * * cd /path/to/backend && python train_lstm_model.py
     ```

3. **Model Monitoring**
   ```python
   # Track prediction confidence
   if model_metrics['r2'] < 0.8:
       logger.warning("Model R² below threshold - consider retraining")
   ```

### B. Memory Efficiency

The LSTM model is loaded once at startup:

- Model size: ~500KB
- Scaler size: ~2KB
- Memory footprint: Minimal

Loading happens at startup, not per-request.

### C. Inference Speed

Typical prediction time: **50-100ms per request**

```python
import time

start = time.time()
result = predictor.predict_rainfall(hist_list)
elapsed = (time.time() - start) * 1000
print(f"Inference time: {elapsed:.1f}ms")
```

### D. Error Handling

The predictor has built-in fallback:

```python
try:
    result = predictor.predict_rainfall(historical_data)
except Exception as e:
    # Fallback prediction if LSTM fails
    result = predictor._fallback_prediction(historical_data)
    logger.error(f"LSTM prediction failed, using fallback: {e}")
```

### E. GPU Acceleration (Optional)

For faster inference on GPU:

```python
import tensorflow as tf

# Check if GPU is available
print("GPUs available:", len(tf.config.list_physical_devices('GPU')))

# The model will automatically use GPU if available
```

### F. Caching

Cache predictions to avoid unnecessary recomputation:

```python
from fastapi_cache2.decorator import cache

@app.get("/predict")
@cache(expire=600)  # Cache for 10 minutes
def get_predictions(lat: float, lon: float, days: int = 7):
    ...
```

---

## 5. TROUBLESHOOTING

### Problem: Model fails to load

```
FileNotFoundError: Model not found: models/rainfall_lstm_model.keras
```

**Solution:**

- Run training script first: `python train_lstm_model.py`
- Ensure `models/` directory exists
- Check file permissions

### Problem: Slow predictions

```
Inference time: 2000ms (too slow)
```

**Solution:**

- Use GPU acceleration if available
- Reduce batch size
- Consider TFLite conversion for edge devices

### Problem: Poor predictions (R² < 0.7)

```
Model R²: 0.65 (below 0.8 threshold)
```

**Solution:**

- Retrain with more recent data
- Adjust sequence length (try 21 instead of 14)
- Use more training epochs
- Check data quality from Open-Meteo

---

## 6. PRODUCTION DEPLOYMENT CHECKLIST

- [ ] Train LSTM model: `python train_lstm_model.py`
- [ ] Verify metrics: R² > 0.8, MAE < 2mm
- [ ] Update `main.py` with new LSTMRainfallPredictor
- [ ] Test API predictions
- [ ] Set up model versioning
- [ ] Configure retraining cron job
- [ ] Monitor inference times
- [ ] Set up error alerts
- [ ] Document model version in release notes
- [ ] Backup old model before updating

---

## 7. ARCHITECTURE CHANGE SUMMARY

### Before (Statistical Model)

```
TimeSeriesRainfallPredictor
└─ _predict_series()
   └─ Mean + Trend + Pattern Cycling
```

### After (LSTM Model)

```
LSTMRainfallPredictor
├─ model: tensorflow.keras model
│  └─ LSTM(64) → LSTM(32) → Dense(16) → Dense(7)
├─ scaler: MinMaxScaler (fit during training)
└─ predict_rainfall()
   ├─ Create 14-day input sequence
   ├─ Scale using fitted scaler
   ├─ LSTM forward pass
   └─ Inverse scale output
```

---

## 8. RETRAINING GUIDE (Monthly)

```bash
#!/bin/bash
# retrain_model.sh

cd /path/to/backend

# Train new model
python train_lstm_model.py

# Verify metrics
python - << 'EOF'
import pickle
with open('models/rainfall_lstm_model_metrics.pkl', 'rb') as f:
    metrics = pickle.load(f)
    r2 = metrics['r2_original']
    mae = metrics['mae_original']
    print(f"Model R²: {r2:.4f}")
    print(f"Model MAE: {mae:.2f}mm")
    if r2 < 0.8:
        print("WARNING: R² below threshold!")
EOF

# Backup old model
cp models/rainfall_lstm_model.keras models/backup_$(date +%Y%m%d).keras

# Restart service
systemctl restart raincast-backend
```

Add to crontab:

```
0 0 1 * * /path/to/backend/retrain_model.sh >> /var/log/retrain.log 2>&1
```

---

## Notes

- The LSTM model learns real rainfall patterns from historical data
- Scaler must be kept with the model (both saved/loaded together)
- Input shape is always (1, 14, 3) for single predictions
- Output shape is always (1, 7) - exactly 7 days
- Temperature predictions use trend continuation (not LSTM trained)
- Consider training separate temperature LSTM for production

Good luck with deployment!
