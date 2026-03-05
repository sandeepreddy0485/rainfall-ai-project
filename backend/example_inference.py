"""
Example inference script for the LSTM rainfall predictor.

Run from the `backend` folder (ensure venv activated):

    C:/Users/yaram/Desktop/ai-rainfall-system/backend/.venv/Scripts/python.exe example_inference.py

This script:
- loads the pre-trained model and scaler via `LSTMRainfallPredictor`
- fetches historical data using `fetch_historical_weather`
- runs a 7-day prediction and prints results

Adjust `lat` and `lon` as needed.
"""

from app.ml_model_lstm import LSTMRainfallPredictor
from app.weather import fetch_historical_weather

if __name__ == '__main__':
    lat = 28.5355
    lon = 77.3910
    days_of_history = 365

    print("Loading predictor...")
    predictor = LSTMRainfallPredictor()

    print(f"Fetching historical data for {lat},{lon}...")
    df = fetch_historical_weather(lat, lon)
    if df is None or df.empty:
        raise RuntimeError("No historical data available for inference")

    # Use the last N days of history (training used ~365)
    hist = df.tail(days_of_history).to_dict(orient='records')

    print("Running prediction (7 days)...")
    result = predictor.predict_rainfall(hist, days=7)

    print("Prediction result:")
    from pprint import pprint
    pprint(result)
