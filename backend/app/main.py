from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.weather import fetch_current_weather, fetch_historical_weather
from app import location
from app.ml_model_lstm import LSTMRainfallPredictor
from app.drought import DroughtPredictor

app = FastAPI(title="RainCast AI Weather Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "RainCast AI Weather Backend Running Successfully"}


@app.get("/location")
def get_location(query: str):
    return location.search_location(query)


@app.get("/location/reverse")
def get_location_reverse(lat: float, lon: float):
    """Return structured place info for given coordinates."""
    return location.reverse_location(lat, lon)


@app.get("/weather/current")
def get_current_weather(lat: float, lon: float):
    return fetch_current_weather(lat, lon)


@app.get("/weather/historical")
def get_historical_weather(lat: float, lon: float):
    df = fetch_historical_weather(lat, lon)

    if df is not None:
        return df.to_dict(orient="records")

    return {"error": "Historical data unavailable"}


# Instantiate LSTM predictor once at startup to avoid reloading model per request
predictor = LSTMRainfallPredictor()


@app.get("/predict")
def get_predictions(lat: float, lon: float, days: int = 7):
    """Get 7-day LSTM rainfall predictions with travel and crop recommendations"""
    try:
        # Fetch historical weather data
        historical_data = fetch_historical_weather(lat, lon)
        
        if historical_data is None or historical_data.empty:
            return {"error": "Unable to fetch historical data for predictions"}
        
        # Convert DataFrame to list of dicts for the predictor
        historical_list = historical_data.to_dict(orient="records")

        # Generate predictions using the singleton predictor
        predictions = predictor.predict_rainfall(historical_list, days=min(days, 7))

        return predictions
    
    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}",
            "predictions_mm": [0] * days,
            "recommendations": {
                "travel": {"travel_score": "Unknown"},
                "crops": {"planting_recommendations": []}
            }
        }


@app.get("/drought")
def get_drought_analysis(lat: float, lon: float, days: int = 7):
    """Get drought risk assessment with recommendations"""
    try:
        # Fetch historical and current weather data
        historical_data = fetch_historical_weather(lat, lon)
        
        if historical_data is None or historical_data.empty:
            return {"error": "Unable to fetch historical data for drought analysis"}
        
        # Convert DataFrame to list of dicts
        historical_list = historical_data.to_dict(orient="records")
        
        # Generate rainfall and temperature predictions (reuse predictor)
        predictions = predictor.predict_rainfall(historical_list, days=min(days, 7))
        
        # Get drought analysis
        drought_predictor = DroughtPredictor()
        drought_analysis = drought_predictor.analyze_drought_risk(
            historical_list,
            predictions.get('predictions_mm', []),
            predictions.get('temperature_predictions', {'temp_avg': [25]*7})
        )
        
        return {
            **drought_analysis,
            'predictions': predictions
        }
    
    except Exception as e:
        print(f"Drought analysis error: {str(e)}")
        return {
            "error": f"Drought analysis failed: {str(e)}",
            "drought_index": 50.0,
            "severity_level": "Unknown"
        }