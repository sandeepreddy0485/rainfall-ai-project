"""
Drought prediction and monitoring module
Analyzes rainfall patterns, soil moisture, and vegetation health
"""

import numpy as np
from typing import Dict, List, Tuple
import datetime as dt


class DroughtPredictor:
    """Predicts drought risk based on rainfall, temperature, and vegetation patterns"""
    
    def __init__(self):
        self.drought_threshold_mm = 5.0  # Less than 5mm per week
        self.normal_rainfall = 20.0  # Normal weekly rainfall in mm
        self.severe_drought_threshold = 2.0  # Less than 2mm per week
        
    def analyze_drought_risk(self, historical_data: List[Dict], 
                            rainfall_predictions: List[float],
                            temperature_predictions: Dict) -> Dict:
        """
        Comprehensive drought risk analysis
        
        Args:
            historical_data: Past weather records
            rainfall_predictions: 7-day rainfall forecast
            temperature_predictions: Temperature forecast data
        
        Returns:
            Dictionary with drought metrics and recommendations
        """
        try:
            # Extract historical rainfall and temperature
            if not historical_data or len(historical_data) == 0:
                return self._default_drought_analysis()
            
            # Get historical patterns
            rainfall_history = self._extract_rainfall_history(historical_data)
            temp_history = self._extract_temperature_history(historical_data)
            
            # numpy arrays evaluate ambiguously in boolean context; check size explicitly
            if rainfall_history is None or rainfall_history.size == 0:
                return self._default_drought_analysis()
            
            # Calculate current drought indicators
            drought_index = self._calculate_drought_index(
                rainfall_history, 
                temperature_predictions.get('temp_avg', [25]*7),
                rainfall_predictions
            )
            
            # Determine drought severity
            severity = self._classify_drought_severity(drought_index)
            
            # Calculate rainfall deficit
            recent_rainfall = np.sum(rainfall_history[-30:]) if len(rainfall_history) >= 30 else np.sum(rainfall_history)
            normal_30day = self.normal_rainfall * 4.3  # ~4.3 weeks in a month
            rainfall_deficit = max(0, normal_30day - recent_rainfall)
            deficit_percentage = (rainfall_deficit / normal_30day * 100) if normal_30day > 0 else 0
            
            # Soil moisture estimation
            soil_moisture = self._estimate_soil_moisture(
                rainfall_history[-60:] if len(rainfall_history) >= 60 else rainfall_history,
                temp_history[-60:] if len(temp_history) >= 60 else temp_history
            )
            
            # Vegetation stress estimate (based on lack of moisture and high temperature)
            vegetation_stress = self._calculate_vegetation_stress(
                drought_index,
                np.mean(temp_history[-30:]) if len(temp_history) >= 30 else 25,
                soil_moisture
            )
            
            # Forecast next 30 days
            continued_dry_period = self._forecast_drought_continuation(
                rainfall_predictions,
                rainfall_history[-7:]
            )
            
            # Generate recommendations
            recommendations = self._get_drought_recommendations(
                severity,
                rainfall_deficit,
                soil_moisture,
                vegetation_stress,
                continued_dry_period
            )
            
            return {
                'drought_index': float(drought_index),
                'severity': severity,
                'severity_level': self._get_severity_level(drought_index),
                'rainfall_deficit_mm': float(rainfall_deficit),
                'deficit_percentage': float(deficit_percentage),
                'soil_moisture_status': soil_moisture,
                'vegetation_stress_level': float(vegetation_stress),
                'expected_rainfall_7day': float(np.sum(rainfall_predictions[:7])) if rainfall_predictions else 0,
                'continued_dry_period_risk': continued_dry_period,
                'drought_probability': float(self._calculate_drought_probability(drought_index)),
                'recommendations': recommendations,
                'alert_status': self._get_alert_status(drought_index, rainfall_deficit, soil_moisture)
            }
            
        except Exception as e:
            print(f"Drought analysis error: {e}")
            return self._default_drought_analysis()
    
    def _extract_rainfall_history(self, historical_data: List[Dict]) -> np.ndarray:
        """Extract rainfall values from historical data"""
        try:
            rainfall = []
            for record in historical_data:
                if 'precipitation' in record:
                    rainfall.append(record.get('precipitation', 0))
                elif 'precipitation_sum' in record:
                    rainfall.append(record.get('precipitation_sum', 0))
                else:
                    rainfall.append(record.get('rainfall_mm', 0))
            return np.array(rainfall, dtype=np.float32)
        except:
            return np.array([], dtype=np.float32)
    
    def _extract_temperature_history(self, historical_data: List[Dict]) -> np.ndarray:
        """Extract average temperature from historical data"""
        try:
            temps = []
            for record in historical_data:
                temp_max = record.get('temperature_2m_max', 25)
                temp_min = record.get('temperature_2m_min', 15)
                avg_temp = (temp_max + temp_min) / 2
                temps.append(avg_temp)
            return np.array(temps, dtype=np.float32)
        except:
            return np.array([], dtype=np.float32)
    
    def _calculate_drought_index(self, rainfall_history: np.ndarray, 
                                temperature: List[float],
                                rainfall_external: List[float]) -> float:
        """Compute a simple drought index (0-100). Higher means drier."""
        try:
            # Recent observed totals (last 30 days)
            recent = rainfall_history[-30:] if rainfall_history.size >= 30 else rainfall_history
            recent_total = float(np.sum(recent)) if recent.size > 0 else 0.0

            # Forecasted rainfall total (next 7 days)
            forecast_total = float(np.sum(rainfall_external)) if rainfall_external else 0.0

            # Expected normal monthly rainfall (approx.)
            normal_monthly = self.normal_rainfall * 4.3

            # Deficit ratio: proportion of expected water missing
            missing = max(0.0, normal_monthly - (recent_total + forecast_total))
            deficit_ratio = missing / (normal_monthly + 1e-6)

            # Temperature factor: hotter temps increase drought risk
            temp_avg = float(np.mean(temperature)) if temperature else 25.0
            temp_factor = max(0.0, (temp_avg - 20.0) / 20.0)

            # Weighted drought index
            drought_index = min(100.0, (deficit_ratio * 80.0 + temp_factor * 20.0) * 100.0 / 100.0)
            return float(drought_index)
        except Exception as e:
            print(f"Error computing drought index: {e}")
            return 50.0
    
    def _get_severity_level(self, drought_index: float) -> str:
        """Get simple severity level description"""
        if drought_index < 20:
            return 'None'
        elif drought_index < 40:
            return 'Mild'
        elif drought_index < 60:
            return 'Moderate'
        elif drought_index < 80:
            return 'Severe'
        else:
            return 'Extreme'
    
    def _get_alert_status(self, drought_index: float, rainfall_deficit: float,
                         soil_moisture: str) -> str:
        """Determine alert status"""
        if drought_index > 70 or rainfall_deficit > 100 or 'Very Low' in soil_moisture:
            return 'Critical - Immediate Action Required'
        elif drought_index > 50 or rainfall_deficit > 50:
            return 'Warning - Near-term Action Needed'
        elif drought_index > 30:
            return 'Advisory - Monitor Situation'
        else:
            return 'Normal - No Action Required'
    
    def _default_drought_analysis(self) -> Dict:
        """Return default drought analysis when data is insufficient"""
        return {
            'drought_index': 50.0,
            'severity': {
                'category': 'Unknown',
                'color': 'gray',
                'description': 'Insufficient data for drought analysis'
            },
            'severity_level': 'Unknown',
            'rainfall_deficit_mm': 0.0,
            'deficit_percentage': 0.0,
            'soil_moisture_status': 'Unknown',
            'vegetation_stress_level': 50.0,
            'expected_rainfall_7day': 0.0,
            'continued_dry_period_risk': 'Unknown',
            'drought_probability': 0.5,
            'recommendations': ['Collect more weather data for accurate drought assessment'],
            'alert_status': 'Normal - No Action Required'
        }
