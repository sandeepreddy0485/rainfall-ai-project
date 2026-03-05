"""
Example inference script for LSTM Rainfall Predictor
Demonstrates how to use the trained model for predictions.
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from app.ml_model_lstm import LSTMRainfallPredictor
from app.weather import fetch_historical_weather


def example_1_single_location():
    """Example 1: Get predictions for a single location"""
    print("\n" + "=" * 70)
    print("EXAMPLE 1: Single Location Prediction")
    print("=" * 70)
    
    # Initialize predictor (loads model at startup)
    try:
        predictor = LSTMRainfallPredictor(
            model_path='backend/models/rainfall_lstm_model.keras',
            scaler_path='backend/models/lstm_scaler.pkl'
        )
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please train the model first using: python backend/train_lstm_model.py")
        return
    
    # Get historical data
    lat, lon = 28.5355, 77.3910  # Delhi, India
    print(f"\nFetching historical data for Delhi ({lat}, {lon})...")
    historical_data = fetch_historical_weather(lat, lon)
    
    if historical_data is None or historical_data.empty:
        print("Failed to fetch historical data")
        return
    
    hist_list = historical_data.to_dict(orient='records')
    
    # Make prediction
    print("\nGenerating 7-day rainfall forecast...")
    result = predictor.predict_rainfall(hist_list, days=7)
    
    # Display results
    print("\n7-Day Rainfall Predictions:")
    print("-" * 70)
    for day, rainfall in enumerate(result['predictions_mm'], 1):
        print(f"  Day {day}: {rainfall:.2f} mm")
    
    print(f"\nTotal predicted rainfall: {result['total_predicted_rainfall']:.2f} mm")
    
    print("\nModel Metrics:")
    print("-" * 70)
    metrics = result['model_metrics']
    print(f"  Model Type:     {metrics['model_type']}")
    print(f"  MAE:            {metrics['mae']:.4f} mm")
    print(f"  RMSE:           {metrics['rmse']:.4f} mm")
    print(f"  R² Score:       {metrics['r2']:.4f}")
    print(f"  Sequence Length: {metrics['sequence_length']} days")
    print(f"  Data Points:    {metrics['data_points_used']}")
    
    print("\nCurrent Conditions:")
    print("-" * 70)
    current = result['current_conditions']
    print(f"  Temperature:         {current['temperature']:.1f}°C")
    print(f"  Temperature Range:   {current['temperature_min']:.1f}°C - {current['temperature_max']:.1f}°C")
    print(f"  Last Rainfall:       {current['last_rainfall']:.2f} mm")
    print(f"  Avg Rainfall (30d):  {current['average_rainfall_30d']:.2f} mm")
    print(f"  Avg Temperature:     {current['average_temperature_30d']:.1f}°C")
    
    print("\nTravel Recommendation:")
    print("-" * 70)
    travel = result['recommendations']['travel']
    print(f"  Score:    {travel['travel_score']}")
    print(f"  Reason:   {travel['reason']}")
    print(f"  Activity: {', '.join(travel['recommended_activities'][:2])}")
    
    return result


def example_2_multiple_locations():
    """Example 2: Get predictions for multiple locations"""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Multiple Locations")
    print("=" * 70)
    
    try:
        predictor = LSTMRainfallPredictor()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return
    
    locations = [
        ('Delhi', 28.5355, 77.3910),
        ('Mumbai', 19.0760, 72.8777),
        ('Bangalore', 12.9716, 77.5946),
    ]
    
    summary = {}
    
    for city, lat, lon in locations:
        print(f"\n{city} ({lat}, {lon}):")
        print("-" * 40)
        
        try:
            historical_data = fetch_historical_weather(lat, lon)
            hist_list = historical_data.to_dict(orient='records')
            
            result = predictor.predict_rainfall(hist_list)
            total_rain = result['total_predicted_rainfall']
            travel_score = result['recommendations']['travel']['travel_score']
            
            summary[city] = {
                'forecast_mm': total_rain,
                'travel_score': travel_score,
                'r2': result['model_metrics']['r2']
            }
            
            print(f"  7-day forecast: {total_rain:.2f} mm")
            print(f"  Travel score:   {travel_score}")
            print(f"  Model R²:       {result['model_metrics']['r2']:.4f}")
        except Exception as e:
            print(f"  Error: {e}")
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    for city, data in summary.items():
        print(f"{city:15} Forecast: {data['forecast_mm']:6.2f}mm  Score: {data['travel_score']}")


def example_3_inference_timing():
    """Example 3: Measure inference time"""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Inference Performance")
    print("=" * 70)
    
    import time
    
    try:
        predictor = LSTMRainfallPredictor()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return
    
    lat, lon = 28.5355, 77.3910
    historical_data = fetch_historical_weather(lat, lon)
    hist_list = historical_data.to_dict(orient='records')
    
    # Warm up
    predictor.predict_rainfall(hist_list)
    
    # Measure inference time
    num_runs = 10
    times = []
    
    print(f"\nRunning {num_runs} inferences...")
    for i in range(num_runs):
        start = time.time()
        result = predictor.predict_rainfall(hist_list)
        elapsed_ms = (time.time() - start) * 1000
        times.append(elapsed_ms)
        print(f"  Run {i+1:2d}: {elapsed_ms:6.2f}ms")
    
    print("\nPerformance Summary:")
    print("-" * 40)
    print(f"  Min:     {min(times):.2f}ms")
    print(f"  Max:     {max(times):.2f}ms")
    print(f"  Average: {sum(times)/len(times):.2f}ms")
    print(f"  Total:   {sum(times):.2f}ms for {num_runs} requests")


def example_4_json_output():
    """Example 4: Full JSON output for API response"""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Complete JSON Response")
    print("=" * 70)
    
    try:
        predictor = LSTMRainfallPredictor()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return
    
    lat, lon = 28.5355, 77.3910
    historical_data = fetch_historical_weather(lat, lon)
    hist_list = historical_data.to_dict(orient='records')
    
    result = predictor.predict_rainfall(hist_list)
    
    # Pretty print JSON
    print("\nAPI Response (JSON):")
    print("-" * 70)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("LSTM RAINFALL PREDICTOR - INFERENCE EXAMPLES")
    print("=" * 70)
    
    # Run examples (comment out to skip)
    try:
        result1 = example_1_single_location()
        
        # Uncomment to run additional examples:
        # example_2_multiple_locations()
        # example_3_inference_timing()
        # example_4_json_output()
        
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("Done")
    print("=" * 70)
