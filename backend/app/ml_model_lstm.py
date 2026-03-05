"""
LSTM-Based Rainfall Predictor for Production Inference
Loads pre-trained TensorFlow/Keras LSTM model and performs 7-day predictions.
"""

import numpy as np
import json
import pickle
import os
from pathlib import Path
import tensorflow as tf
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')


class LSTMRainfallPredictor:
    """
    Production LSTM model for 7-day rainfall and temperature predictions.
    
    Loads a pre-trained LSTM model and associated scaler at initialization.
    Performs efficient inference on new data without retraining.
    """
    
    def __init__(
        self,
        model_path='models/rainfall_lstm_model.keras',
        scaler_path='models/lstm_scaler.pkl',
        sequence_length=14,
        forecast_length=7
    ):
        """
        Initialize predictor with pre-trained model and scaler.
        
        Args:
            model_path: Path to saved .keras model
            scaler_path: Path to saved scaler pickle file
            sequence_length: Input sequence length (must match training)
            forecast_length: Forecast length (must match training)
        """
        self.sequence_length = sequence_length
        self.forecast_length = forecast_length
        self.model = None
        self.scaler = None
        self.model_metrics = {'mae': 0, 'rmse': 0, 'r2': 0}
        
        # Attempt to load model and scaler but do not raise to allow graceful fallback
        try:
            self._load_model(model_path)
        except Exception as e:
            print(f"Warning: could not load model '{model_path}': {e}")
            self.model = None

        try:
            self._load_scaler(scaler_path)
        except Exception as e:
            print(f"Warning: could not load scaler '{scaler_path}': {e}")
            self.scaler = None
    
    def _load_model(self, model_path):
        """Load pre-trained Keras model"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")

        print(f"Loading LSTM model from {model_path}...")
        self.model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully")

        # Get model metrics if available
        metrics_path = model_path.replace('.keras', '_metrics.pkl')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'rb') as f:
                metrics = pickle.load(f)
                self.model_metrics = {
                    'mae': metrics.get('mae_original', 0),
                    'rmse': metrics.get('rmse_original', 0),
                    'r2': metrics.get('r2_original', 0),
                }
    
    def _load_scaler(self, scaler_path):
        """Load pre-fitted scaler"""
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found: {scaler_path}")

        print(f"Loading scaler from {scaler_path}...")
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        print("Scaler loaded successfully")
    
    def prepare_data_for_prediction(self, historical_data):
        """
        Prepare historical data for LSTM prediction.
        
        Args:
            historical_data: List of dicts with weather data
        
        Returns:
            Dict with numpy arrays for features
        """
        try:
            if not historical_data or len(historical_data) < self.sequence_length:
                print(f"Warning: Not enough data. Have {len(historical_data)}, need {self.sequence_length}")
                return None
            
            # Extract features
            rainfall_values = []
            temp_max_values = []
            temp_min_values = []
            
            # Use most recent data
            for record in historical_data[-180:]:
                rainfall = record.get('precipitation', record.get('precipitation_sum', 0))
                temp_max = record.get('temperature_2m_max', 25)
                temp_min = record.get('temperature_2m_min', 15)
                
                rainfall_values.append(rainfall)
                temp_max_values.append(temp_max)
                temp_min_values.append(temp_min)
            
            if not rainfall_values or not temp_max_values:
                return None
            
            return {
                'rainfall': np.array(rainfall_values, dtype=np.float32),
                'temp_max': np.array(temp_max_values, dtype=np.float32),
                'temp_min': np.array(temp_min_values, dtype=np.float32),
                'temp_avg': (np.array(temp_max_values) + np.array(temp_min_values)) / 2
            }
        except Exception as e:
            print(f"Data preparation error: {e}")
            return None
    
    def _create_input_sequence(self, rainfall, temp_max, temp_min):
        """
        Create LSTM input sequence from the most recent data.
        
        Args:
            rainfall: Array of rainfall values
            temp_max: Array of max temperatures
            temp_min: Array of min temperatures
        
        Returns:
            Scaled input array with shape (1, sequence_length, 3)
        """
        # Use most recent sequence_length days
        if len(rainfall) < self.sequence_length:
            return None

        # Get last sequence_length days
        rainfall = rainfall[-self.sequence_length:]
        temp_max = temp_max[-self.sequence_length:]
        temp_min = temp_min[-self.sequence_length:]

        # Create feature array: (sequence_length, 3)
        features = np.column_stack([temp_max, temp_min, rainfall])

        # Ensure scaler is available
        if self.scaler is None:
            raise RuntimeError("Scaler is not loaded; cannot scale input features")

        # Scale using fitted scaler
        features_scaled = self.scaler.transform(features)

        # Add batch dimension: (1, sequence_length, 3)
        X = np.expand_dims(features_scaled, axis=0)

        return X
    
    def predict_rainfall(self, historical_data, days=7):
        """
        Generate 7-day rainfall predictions using trained LSTM model.
        
        Args:
            historical_data: List of historical weather records
            days: Number of days to predict (default: 7, max: 7)
        
        Returns:
            Dict with predictions, metrics, and recommendations
        """
        try:
            # Ensure max forecast length
            days = min(days, self.forecast_length)
            
            # Prepare data
            data = self.prepare_data_for_prediction(historical_data)
            if data is None:
                print("Data preparation failed, using fallback")
                return self._fallback_prediction(historical_data, days)
            
            rainfall = data['rainfall']
            temp_max = data['temp_max']
            temp_min = data['temp_min']
            temp_avg = data['temp_avg']
            
            # If model or scaler not available, fallback
            if self.model is None or self.scaler is None:
                return self._fallback_prediction(historical_data, days)

            # Create input sequence
            X = self._create_input_sequence(rainfall, temp_max, temp_min)
            if X is None:
                return self._fallback_prediction(historical_data, days)

            # LSTM prediction (shape: (1, forecast_length))
            rainfall_pred_scaled = self.model.predict(X, verbose=0)

            # Remove batch dimension
            rainfall_pred_scaled = np.asarray(rainfall_pred_scaled).reshape(-1)

            # Create dummy array for inverse transform (only precipitation matters)
            dummy = np.zeros((rainfall_pred_scaled.shape[0], 3))
            dummy[:, 2] = rainfall_pred_scaled  # Feature index 2 is precipitation

            # Inverse scale
            rainfall_predictions = self.scaler.inverse_transform(dummy)[:, 2]

            # Ensure non-negative rainfall
            rainfall_predictions = np.maximum(rainfall_predictions, 0.0)
            
            # Temperature predictions (using simple trend continuation)
            # For production, consider training separate temperature LSTM
            recent_temp_max = temp_max[-7:]
            recent_temp_min = temp_min[-7:]
            
            temp_max_trend = np.mean(np.diff(recent_temp_max))
            temp_min_trend = np.mean(np.diff(recent_temp_min))
            
            temp_max_predictions = []
            temp_min_predictions = []
            
            for i in range(days):
                temp_max_predictions.append(temp_max[-1] + temp_max_trend * (i + 1))
                temp_min_predictions.append(temp_min[-1] + temp_min_trend * (i + 1))
            
            temp_max_predictions = np.array(temp_max_predictions)
            temp_min_predictions = np.array(temp_min_predictions)
            temp_avg_predictions = (temp_max_predictions + temp_min_predictions) / 2
            
            # Current conditions
            current_temp_avg = float(temp_avg[-1])
            current_temp_max = float(temp_max[-1])
            current_temp_min = float(temp_min[-1])
            current_rainfall = float(rainfall[-1])
            avg_rainfall = float(np.mean(rainfall))
            avg_temp = float(np.mean(temp_avg))
            
            predictions_7day = rainfall_predictions[:days]
            total_predicted_rainfall = float(np.sum(predictions_7day))
            
            # Get recommendations
            travel_rec = self._get_travel_recommendations(
                predictions_7day, current_temp_avg, current_rainfall
            )
            crop_rec = self._get_crop_recommendations(
                predictions_7day, current_temp_avg, avg_rainfall, avg_temp
            )
            
            return {
                'predictions_mm': [float(p) for p in predictions_7day],
                'temperature_predictions': {
                    'temp_max': [float(t) for t in temp_max_predictions[:days]],
                    'temp_min': [float(t) for t in temp_min_predictions[:days]],
                    'temp_avg': [float(t) for t in temp_avg_predictions[:days]]
                },
                'total_predicted_rainfall': total_predicted_rainfall,
                'current_conditions': {
                    'temperature': current_temp_avg,
                    'temperature_max': current_temp_max,
                    'temperature_min': current_temp_min,
                    'last_rainfall': current_rainfall,
                    'average_rainfall_30d': avg_rainfall,
                    'average_temperature_30d': avg_temp
                },
                'model_metrics': {
                    'mae': float(self.model_metrics['mae']),
                    'rmse': float(self.model_metrics['rmse']),
                    'r2': float(self.model_metrics['r2']),
                    'sequence_length': self.sequence_length,
                    'model_type': 'LSTM Neural Network',
                    'data_points_used': len(rainfall)
                },
                'recommendations': {
                    'travel': travel_rec,
                    'crops': crop_rec
                }
            }
        
        except Exception as e:
            print(f"Prediction error: {e}")
            import traceback
            traceback.print_exc()
            return self._fallback_prediction(historical_data, days)
    
    def _get_travel_recommendations(self, rainfall_predictions, current_temp, current_rainfall):
        """Generate travel recommendations based on weather forecast"""
        total_rainfall_week = float(sum(rainfall_predictions))
        rainy_days = sum(1 for r in rainfall_predictions if r > 5)
        
        if total_rainfall_week < 10 and current_temp > 15 and current_temp < 35:
            score = "Excellent"
            reason = f"Low rainfall ({total_rainfall_week:.1f}mm), comfortable temperature ({current_temp:.1f}°C)"
            activities = ["Outdoor hiking", "Beach activities", "Sightseeing", "Photography tours"]
        elif total_rainfall_week < 25 and rainy_days <= 2:
            score = "Good"
            reason = f"Moderate rainfall ({total_rainfall_week:.1f}mm) with {rainy_days} rainy days"
            activities = ["City tours", "Museum visits", "Moderate hiking", "Local exploration"]
        elif total_rainfall_week < 50:
            score = "Fair"
            reason = f"Significant rainfall ({total_rainfall_week:.1f}mm) expected. {rainy_days} rainy days predicted"
            activities = ["Indoor attractions", "Covered markets", "Local restaurants", "Planning required"]
        else:
            score = "Poor"
            reason = f"High rainfall ({total_rainfall_week:.1f}mm) with {rainy_days} rainy days. Not recommended"
            activities = ["Postpone travel", "Indoor activities only", "Reschedule outdoor plans"]
        
        return {
            "travel_score": score,
            "reason": reason,
            "weekly_rainfall_mm": float(total_rainfall_week),
            "rainy_days": rainy_days,
            "recommended_activities": activities,
            "temperature_range": f"{current_temp - 2:.1f}°C to {current_temp + 2:.1f}°C"
        }
    
    def _get_crop_recommendations(self, rainfall_predictions, current_temp, avg_rainfall, avg_temp):
        """Generate crop planting recommendations"""
        total_rainfall_week = sum(rainfall_predictions)
        recommendations = []
        
        if total_rainfall_week > 30:
            recommendations.append({
                "category": "High Rainfall Window",
                "good_plants": ["Rice", "Sugarcane", "Tobacco", "Jute", "Tea"],
                "reason": f"Predicted rainfall of {total_rainfall_week:.1f}mm - ideal for moisture-loving crops"
            })
        
        if 20 <= current_temp <= 28:
            recommendations.append({
                "category": "Moderate Temperature Window",
                "good_plants": ["Maize", "Cabbage", "Cauliflower", "Carrots", "Lettuce", "Green Beans"],
                "reason": f"Temperature {current_temp:.1f}°C is ideal for diverse crops"
            })
        
        if current_temp > 28:
            recommendations.append({
                "category": "Heat-Tolerant Crops",
                "good_plants": ["Millet", "Sorghum", "Cotton", "Groundnuts", "Sesame", "Sunflower"],
                "reason": f"Higher temperature {current_temp:.1f}°C suits heat-tolerant varieties"
            })
        
        if total_rainfall_week < 15 and avg_rainfall < 5:
            recommendations.append({
                "category": "Dry Period Planning",
                "good_plants": ["Millets (Bajra/Jowar)", "Pulses (Lentils)", "Chickpeas", "Beans", "Drought-resistant Vegetables"],
                "reason": "Low rainfall expected - use drought-resistant varieties and schedule irrigation"
            })
        
        avoid = None
        if total_rainfall_week > 80:
            avoid = {
                "avoid_plants": ["Wheat", "Gram", "Barley"],
                "reason": f"Very high rainfall ({total_rainfall_week:.1f}mm) - risk of flooding and root rot"
            }
        
        return {
            "planting_recommendations": recommendations if recommendations else [
                {"category": "General Crops", "good_plants": ["Vegetables", "Herbs", "Seasonal Crops"],
                 "reason": "Current conditions suitable for general farming"}
            ],
            "avoid_planting": avoid,
            "soil_moisture_status": "Good" if total_rainfall_week > 20 else "Moderate" if total_rainfall_week > 5 else "Low - Plan irrigation",
            "best_time_to_plant": "Within 2-3 days after rainfall" if total_rainfall_week > 10 else "Plan with irrigation schedule"
        }
    
    def _fallback_prediction(self, historical_data, days=7):
        """Fallback simple prediction when LSTM fails"""
        if not historical_data:
            fallback_predictions = [2.5 + np.random.uniform(-1, 2) for _ in range(days)]
            fallback_temp_max = [28 + np.random.uniform(-2, 2) for _ in range(days)]
            fallback_temp_min = [18 + np.random.uniform(-2, 2) for _ in range(days)]
        else:
            try:
                rainfall_vals = [r.get('precipitation', r.get('precipitation_sum', 0)) for r in historical_data[-30:]]
                temp_max_vals = [r.get('temperature_2m_max', 25) for r in historical_data[-30:]]
                temp_min_vals = [r.get('temperature_2m_min', 15) for r in historical_data[-30:]]
                
                avg_rainfall = np.mean(rainfall_vals) if rainfall_vals else 2.5
                std_rainfall = np.std(rainfall_vals) if rainfall_vals else 1.0
                avg_temp_max = np.mean(temp_max_vals) if temp_max_vals else 28
                avg_temp_min = np.mean(temp_min_vals) if temp_min_vals else 18
                
                fallback_predictions = [
                    max(0, avg_rainfall + np.random.normal(0, std_rainfall * 0.5))
                    for _ in range(days)
                ]
                fallback_temp_max = [avg_temp_max + np.random.normal(0, 1.5) for _ in range(days)]
                fallback_temp_min = [avg_temp_min + np.random.normal(0, 1.5) for _ in range(days)]
            except:
                fallback_predictions = [2.5 for _ in range(days)]
                fallback_temp_max = [28 for _ in range(days)]
                fallback_temp_min = [18 for _ in range(days)]
        
        current_temp = 25
        current_rainfall = 0
        
        travel_rec = self._get_travel_recommendations(fallback_predictions, current_temp, current_rainfall)
        crop_rec = self._get_crop_recommendations(fallback_predictions, current_temp, 5, 25)
        
        return {
            'predictions_mm': fallback_predictions,
            'temperature_predictions': {
                'temp_max': fallback_temp_max,
                'temp_min': fallback_temp_min,
                'temp_avg': [(t_max + t_min) / 2 for t_max, t_min in zip(fallback_temp_max, fallback_temp_min)]
            },
            'total_predicted_rainfall': float(sum(fallback_predictions)),
            'current_conditions': {
                'temperature': float(current_temp),
                'temperature_max': float(fallback_temp_max[0]),
                'temperature_min': float(fallback_temp_min[0]),
                'last_rainfall': float(current_rainfall),
                'average_rainfall_30d': 5.0,
                'average_temperature_30d': 25.0
            },
            'model_metrics': {
                'mae': 0,
                'rmse': 0,
                'r2': 0,
                'sequence_length': self.sequence_length,
                'model_type': 'Fallback (LSTM unavailable)'
            },
            'recommendations': {
                'travel': travel_rec,
                'crops': crop_rec
            }
        }
