"""
LSTM Time-Series Model Training Script
Trains a multi-layer LSTM model for 7-day rainfall prediction
using historical weather data from Open-Meteo API.
"""

import numpy as np
import pandas as pd
import pickle
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import warnings
warnings.filterwarnings('ignore')

# For data fetching - replace with your actual data source
from app.weather import fetch_historical_weather


class LSTMDataProcessor:
    """Handles data preparation and sequence creation for LSTM training"""
    
    def __init__(self, sequence_length=14, forecast_length=7):
        """
        Args:
            sequence_length: Number of days to use as input (timesteps)
            forecast_length: Number of days to predict (output length)
        """
        self.sequence_length = sequence_length
        self.forecast_length = forecast_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def fetch_data(self, lat, lon, days=365, max_retries=3, backoff=5):
        """Fetch historical weather data from Open-Meteo with retry logic.

        Parameters added to handle transient network issues. If the API
        returns fewer days than requested we'll still continue, but the
        user will be warned.
        """
        print(f"Fetching {days} days of historical data for ({lat}, {lon})...")
        attempt = 0
        df = None
        while attempt < max_retries:
            try:
                df = fetch_historical_weather(lat, lon)
                break
            except Exception as exc:
                attempt += 1
                print(f"Attempt {attempt} failed: {exc}")
                if attempt < max_retries:
                    print(f"Retrying in {backoff} seconds...")
                    import time
                    time.sleep(backoff)
                else:
                    raise
        
        if df is None or df.empty:
            raise ValueError("Failed to fetch historical data after retries")
        
        # Use most recent data if we have more than needed
        if len(df) > days:
            df = df.tail(days).reset_index(drop=True)
        
        print(f"Retrieved {len(df)} days of data")
        return df
    
    def prepare_data(self, df):
        """Prepare and scale features from raw data.

        Ensures required columns exist by filling defaults when necessary so
        training can proceed even when the API response is incomplete.
        """
        # fill missing temperature columns with reasonable defaults
        if 'temperature_2m_max' not in df:
            print("Warning: 'temperature_2m_max' missing from data; using mean+5")
            df['temperature_2m_max'] = df.get('temperature_2m_mean', 25) + 5
        if 'temperature_2m_min' not in df:
            print("Warning: 'temperature_2m_min' missing from data; using mean-5")
            df['temperature_2m_min'] = df.get('temperature_2m_mean', 15) - 5
        
        # ensure precipitation exists
        if 'precipitation' not in df and 'precipitation_sum' not in df:
            print("Warning: precipitation data missing; filling zeros")
            df['precipitation'] = 0
        
        # Extract features
        features = np.array([
            df['temperature_2m_max'].values,
            df['temperature_2m_min'].values,
            df.get('precipitation', df.get('precipitation_sum', pd.Series([0]*len(df)))).values,
        ]).T  # Shape: (samples, 3)
        
        print(f"Feature shape before scaling: {features.shape}")
        
        # Scale all features to [0,1]
        scaled_data = self.scaler.fit_transform(features)
        print(f"Feature shape after scaling: {scaled_data.shape}")
        
        return scaled_data
    
    def create_sequences(self, scaled_data):
        """
        Create sequences for time-series prediction using sliding window.
        
        Example with sequence_length=14, forecast_length=7:
        - Input: days 0-13 (14 days) → Output: days 14-20 (7 days rainfall)
        - Input: days 1-14 (14 days) → Output: days 15-21 (7 days rainfall)
        - etc.
        """
        X, y = [], []
        
        for i in range(len(scaled_data) - self.sequence_length - self.forecast_length + 1):
            # Get input sequence (sequence_length days, all 3 features)
            X.append(scaled_data[i:i + self.sequence_length])
            
            # Get output sequence (forecast_length days, only precipitation/feature 2)
            y.append(scaled_data[i + self.sequence_length:i + self.sequence_length + self.forecast_length, 2])
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"\nSequence shapes:")
        print(f"  X (input):  {X.shape}  - (samples, timesteps=14, features=3)")
        print(f"  y (output): {y.shape}  - (samples, forecast_days=7)")
        
        return X, y
    
    def train_test_split_timeseries(self, X, y, test_size=0.2):
        """
        Split time-series data without shuffling.
        Uses last test_size% for validation.
        """
        split_idx = int(len(X) * (1 - test_size))
        
        X_train = X[:split_idx]
        y_train = y[:split_idx]
        X_test = X[split_idx:]
        y_test = y[split_idx:]
        
        print(f"\nTrain/Test split (no shuffle):")
        print(f"  Train: X{X_train.shape}, y{y_train.shape}")
        print(f"  Test:  X{X_test.shape}, y{y_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    def save_scaler(self, filepath):
        """Save the fitted scaler for inference"""
        with open(filepath, 'wb') as f:
            pickle.dump(self.scaler, f)
        print(f"Scaler saved to {filepath}")


def build_lstm_model(input_shape):
    """
    Build multi-layer LSTM model for rainfall prediction.
    
    Architecture:
    - LSTM(64, return_sequences=True) + Dropout(0.2)
    - LSTM(32) + Dropout(0.2)
    - Dense(16) + Dropout(0.2)
    - Dense(7)  - Output layer for 7-day forecast
    
    Args:
        input_shape: Tuple (sequence_length, num_features) = (14, 3)
    
    Returns:
        Compiled Keras model
    """
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape, activation='relu'),
        Dropout(0.2),
        
        LSTM(32, return_sequences=False, activation='relu'),
        Dropout(0.2),
        
        Dense(16, activation='relu'),
        Dropout(0.2),
        
        Dense(7)  # Output: 7 days of rainfall
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    return model


def train_lstm_model(
    lat=28.5355, 
    lon=77.3910,
    sequence_length=14,
    forecast_length=7,
    epochs=100,
    batch_size=32,
    model_output_path='models/rainfall_lstm_model.keras',
    scaler_output_path='models/lstm_scaler.pkl'
):
    """
    Complete training pipeline for LSTM rainfall prediction model.
    
    Args:
        lat, lon: Location for data fetching
        sequence_length: Input sequence length (default: 14 days)
        forecast_length: Forecast length (default: 7 days)
        epochs: Training epochs
        batch_size: Batch size
        model_output_path: Path to save trained model
        scaler_output_path: Path to save scaler
    """
    print("=" * 70)
    print("LSTM RAINFALL PREDICTION MODEL TRAINING")
    print("=" * 70)
    
    # 1. Data preparation
    processor = LSTMDataProcessor(
        sequence_length=sequence_length,
        forecast_length=forecast_length
    )
    
    # Fetch data
    df = processor.fetch_data(lat, lon, days=365)
    
    # if dataset is too small for sequences warn user
    if len(df) < sequence_length + forecast_length + 1:
        print(f"Warning: only {len(df)} days available; may be insufficient for training")
    
    # Prepare and scale (handles missing columns internally) (handles missing columns internally)
    scaled_data = processor.prepare_data(df)
    
    # Create sequences
    X, y = processor.create_sequences(scaled_data)
    
    # Train/test split (no shuffle for time-series)
    X_train, X_test, y_train, y_test = processor.train_test_split_timeseries(X, y, test_size=0.2)
    
    # Save scaler for later inference
    processor.save_scaler(scaler_output_path)
    
    # 2. Model building
    print("\nBuilding LSTM model...")
    model = build_lstm_model(input_shape=(sequence_length, 3))
    
    print("\nModel architecture:")
    model.summary()
    
    # 3. Training
    print("\n" + "=" * 70)
    print("TRAINING")
    print("=" * 70)
    
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=1
    )
    
    # 4. Evaluation
    print("\n" + "=" * 70)
    print("MODEL EVALUATION")
    print("=" * 70)
    
    # Predict on test set
    y_pred = model.predict(X_test, verbose=0)
    
    # Calculate metrics (these are in scaled space 0-1)
    mae_scaled = mean_absolute_error(y_test, y_pred)
    rmse_scaled = np.sqrt(mean_squared_error(y_test, y_pred))
    r2_scaled = r2_score(y_test.flatten(), y_pred.flatten())
    
    print("\nMetrics (in scaled space [0-1]):")
    print(f"  MAE:  {mae_scaled:.6f}")
    print(f"  RMSE: {rmse_scaled:.6f}")
    print(f"  R²:   {r2_scaled:.6f}")
    
    # Inverse transform to get actual rainfall values
    # Note: y_test and y_pred are already in feature space (only precipitation)
    # We need to inverse transform them properly
    
    # Create dummy arrays for inverse transform (only precipitation matters)
    y_test_dummy = np.zeros((y_test.shape[0], y_test.shape[1], 3))
    y_test_dummy[:, :, 2] = y_test  # precipitation is feature 2
    
    y_pred_dummy = np.zeros_like(y_test_dummy)
    y_pred_dummy[:, :, 2] = y_pred
    
    # Reshape for inverse transform
    y_test_flat = y_test_dummy.reshape(-1, 3)
    y_pred_flat = y_pred_dummy.reshape(-1, 3)
    
    # Inverse scale
    y_test_orig = processor.scaler.inverse_transform(y_test_flat)[:, 2]
    y_pred_orig = processor.scaler.inverse_transform(y_pred_flat)[:, 2]
    
    # Reshape back
    y_test_orig = y_test_orig.reshape(y_test.shape)
    y_pred_orig = y_pred_orig.reshape(y_pred.shape)
    
    # Calculate metrics in original space (mm rainfall)
    mae_original = mean_absolute_error(y_test_orig, y_pred_orig)
    rmse_original = np.sqrt(mean_squared_error(y_test_orig, y_pred_orig))
    r2_original = r2_score(y_test_orig.flatten(), y_pred_orig.flatten())
    
    print("\nMetrics (in original rainfall space - mm):")
    print(f"  MAE:  {mae_original:.4f} mm")
    print(f"  RMSE: {rmse_original:.4f} mm")
    print(f"  R²:   {r2_original:.6f}")
    
    # Sample prediction
    print("\nSample predictions (first test sample):")
    print(f"  Actual rainfall (7 days):   {y_test_orig[0].round(2)} mm")
    print(f"  Predicted rainfall (7 days): {y_pred_orig[0].round(2)} mm")
    
    # 5. Save model
    print("\n" + "=" * 70)
    print("SAVING MODEL")
    print("=" * 70)
    
    model.save(model_output_path)
    print(f"Model saved to {model_output_path}")
    
    # Save metrics
    metrics = {
        'mae_scaled': float(mae_scaled),
        'rmse_scaled': float(rmse_scaled),
        'r2_scaled': float(r2_scaled),
        'mae_original': float(mae_original),
        'rmse_original': float(rmse_original),
        'r2_original': float(r2_original),
        'sequence_length': sequence_length,
        'forecast_length': forecast_length,
        'training_samples': len(X_train),
        'test_samples': len(X_test),
    }
    
    with open(model_output_path.replace('.keras', '_metrics.pkl'), 'wb') as f:
        pickle.dump(metrics, f)
    
    print(f"Metrics saved to {model_output_path.replace('.keras', '_metrics.pkl')}")
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    
    return model, processor.scaler, metrics


if __name__ == '__main__':
    # Train the model
    # Location: Delhi, India (adjust as needed)
    model, scaler, metrics = train_lstm_model(
        lat=28.5355,
        lon=77.3910,
        sequence_length=14,
        forecast_length=7,
        epochs=100,
        batch_size=32,
        model_output_path='models/rainfall_lstm_model.keras',
        scaler_output_path='models/lstm_scaler.pkl'
    )
