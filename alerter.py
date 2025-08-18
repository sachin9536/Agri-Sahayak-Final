#!/usr/bin/env python3
"""
Agri-Sahayak Proactive Weather Alerting System

This standalone script monitors weather conditions and sends targeted SMS alerts
to farmers based on their district location.
"""

import os
import requests
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from twilio.rest import Client
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment from .env if present
load_dotenv()

# Environment Variables - Set these in your environment or .env file
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# Optional: set to '1' or 'true' to disable actual SMS sending
DRY_RUN = os.getenv("DRY_RUN", "0").lower() in {"1", "true", "yes", "y"}

# Database setup
DATABASE_URL = "sqlite:///backend/documents.db"
Base = declarative_base()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class User(Base):
    """User model matching the main application database schema"""
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone_number = Column(String(15))
    district = Column(String(100))
    state = Column(String(100))
    crop = Column(String(100))
    language = Column(String(10))

# Hardcoded coordinates for demo districts (lat, lon)
DISTRICT_COORDINATES = {
    'bangalore': (12.9716, 77.5946),
    'mysore': (12.2958, 76.6394),
    'mumbai': (19.0760, 72.8777),
    'pune': (18.5204, 73.8567),
    'ludhiana': (30.9010, 75.8573),
    'amritsar': (31.6340, 74.8723),
    'lucknow': (26.8467, 80.9462),
    'kanpur': (26.4499, 80.3319),
    'agra': (27.1767, 78.0081),
    'varanasi': (25.3176, 82.9739),
    'hoshiarpur': (31.5344, 75.9119),
    'patiala': (30.3398, 76.3869),
    'noida': (28.5355, 77.3910),
    'hubballi': (15.3647, 75.1240),
    'gorakhpur': (26.7606, 83.3732)
}

def create_database_connection():
    """Create and return database engine and session"""
    try:
        engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()
        logger.info("Database connection established successfully")
        return engine, session
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None, None

def fetch_all_users(session):
    """Fetch all registered users from the database"""
    try:
        users = session.query(User).all()
        logger.info(f"Fetched {len(users)} users from database")
        return users
    except Exception as e:
        logger.error(f"Failed to fetch users: {e}")
        return []

def get_unique_districts(users):
    """Extract unique districts from user list"""
    districts = set()
    for user in users:
        if user.district:
            districts.add(user.district.lower())
    logger.info(f"Found {len(districts)} unique districts: {list(districts)}")
    return list(districts)

def fetch_weather_data(district):
    """Fetch weather data for a specific district using OpenWeatherMap API"""
    if district not in DISTRICT_COORDINATES:
        logger.warning(f"Coordinates not found for district: {district}")
        return None
    
    lat, lon = DISTRICT_COORDINATES[district]
    
    try:
        # Use current weather API (always available on free tier)
        current_url = f"https://api.openweathermap.org/data/2.5/weather"
        current_params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        current_response = requests.get(current_url, params=current_params, timeout=10)
        current_response.raise_for_status()
        current_data = current_response.json()
        
        # Try to get 5-day forecast (free tier)
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast"
        forecast_params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=10)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        
        # Convert to format similar to One Call API
        weather_data = {
            'current': {
                'temp': current_data['main']['temp'],
                'humidity': current_data['main']['humidity'],
                'wind_speed': current_data['wind']['speed'],
                'weather': current_data['weather']
            },
            'daily': []
        }
        
        # Process forecast data to create daily summaries
        daily_temps = {}
        for item in forecast_data['list'][:16]:  # Next 48 hours (3-hour intervals)
            date = item['dt_txt'][:10]  # Extract date (YYYY-MM-DD)
            
            if date not in daily_temps:
                daily_temps[date] = {
                    'temps': [],
                    'humidity': [],
                    'wind_speed': [],
                    'rain': 0.0
                }
            
            daily_temps[date]['temps'].append(item['main']['temp'])
            daily_temps[date]['humidity'].append(item['main']['humidity'])
            daily_temps[date]['wind_speed'].append(item['wind']['speed'])
            
            # Safely accumulate rain (mm) over 3h buckets
            rain_mm = item.get('rain', {}).get('3h', 0.0) or 0.0
            try:
                rain_mm = float(rain_mm)
            except (TypeError, ValueError):
                rain_mm = 0.0
            daily_temps[date]['rain'] += rain_mm
        
        # Create daily summaries
        for date, data in list(daily_temps.items())[:2]:  # Next 2 days
            daily_summary = {
                'temp': {
                    'max': max(data['temps']),
                    'min': min(data['temps'])
                },
                'humidity': sum(data['humidity']) / len(data['humidity']) if data['humidity'] else 0,
                'wind_speed': max(data['wind_speed']) if data['wind_speed'] else 0,
                'rain_mm': data['rain']  # Total rain over the day (approx. next 24h)
            }
            weather_data['daily'].append(daily_summary)
        
        logger.info(f"Successfully fetched weather data for {district}")
        return weather_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch weather data for {district}: {e}")
        return None

def analyze_weather_alerts(weather_data, district):
    """Analyze weather data and return list of alerts"""
    if not weather_data or 'daily' not in weather_data:
        return []
    
    alerts = []
    
    # Check next 2 days (48 hours)
    for day_idx in range(min(2, len(weather_data['daily']))):
        day_data = weather_data['daily'][day_idx]
        
        # Extract weather parameters
        max_temp = float(day_data['temp']['max'])
        min_temp = float(day_data['temp']['min'])
        rain_mm = float(day_data.get('rain_mm', 0))
        wind_speed_kmh = float(day_data['wind_speed']) * 3.6  # Convert m/s to km/h
        humidity = float(day_data['humidity'])
        
        day_name = "today" if day_idx == 0 else "tomorrow"
        
        # Rules Engine - Check for alert conditions
        if max_temp > 38:
            alerts.append({
                'type': 'heatwave',
                'message': f"Heatwave warning for {district.title()}: Temperature expected to reach {max_temp:.1f}°C {day_name}. Ensure adequate irrigation and provide shade for livestock.",
                'severity': 'high'
            })
        
        if rain_mm > 30:
            alerts.append({
                'type': 'heavy_rain',
                'message': f"Heavy rainfall alert for {district.title()}: {rain_mm:.1f}mm rain expected {day_name}. Protect crops from waterlogging and ensure proper drainage.",
                'severity': 'high'
            })
        
        if wind_speed_kmh > 25:
            alerts.append({
                'type': 'high_wind',
                'message': f"High wind warning for {district.title()}: Wind speeds up to {wind_speed_kmh:.1f} km/h expected {day_name}. Secure farm structures and protect young plants.",
                'severity': 'medium'
            })
        
        if min_temp < 7:
            alerts.append({
                'type': 'frost',
                'message': f"Frost warning for {district.title()}: Temperature may drop to {min_temp:.1f}°C {day_name}. Protect sensitive crops from frost damage.",
                'severity': 'high'
            })
        
        if humidity > 85 and max_temp > 28:
            alerts.append({
                'type': 'disease_risk',
                'message': f"Disease risk alert for {district.title()}: High humidity ({int(round(humidity))}%) and temperature ({max_temp:.1f}°C) {day_name} may increase fungal disease risk. Monitor crops closely.",
                'severity': 'medium'
            })
    
    logger.info(f"Generated {len(alerts)} alerts for {district}")
    return alerts

def build_sms_message(user_name, district, alerts, max_len=140):
    """Build a compact, ASCII-only SMS message within length limits.
    - Keeps frontend message unchanged elsewhere
    - Removes emoji/non-ASCII to avoid UCS-2 segmentation limits
    - Shortens content and caps overall length for Twilio trial accounts
    """
    # Short type labels
    type_map = {
        'heatwave': 'Heat',
        'heavy_rain': 'Rain',
        'high_wind': 'Wind',
        'frost': 'Frost',
        'disease_risk': 'Disease'
    }

    # Compose short fragments from alerts (limit to first 3)
    frags = []
    for alert in alerts[:3]:
        t = type_map.get(alert.get('type', ''), 'Alert')
        msg = alert.get('message', '')
        # Use only the first sentence after the colon if present
        short = msg
        if ':' in msg:
            short = msg.split(':', 1)[1].strip()
        if '.' in short:
            short = short.split('.', 1)[0]
        frags.append(f"{t}: {short}")

    prefix = f"Agri-Sahayak {district.title()}: "
    suffix = " | More in app"
    core = " | ".join(frags) if frags else "Weather update"
    text = prefix + core + suffix

    # Strip non-ASCII to keep GSM-7-compatible payload where possible
    ascii_text = text.encode('ascii', 'ignore').decode('ascii')

    # Enforce max length with ellipsis
    if len(ascii_text) > max_len:
        ascii_text = ascii_text[: max_len - 3].rstrip() + '...'

    return ascii_text

def send_sms_alerts(users_in_district, alerts, district):
    """Send SMS alerts to users in the affected district"""
    if not alerts:
        return
    # If dry-run, don't initialize Twilio
    client = None
    if not DRY_RUN:
        try:
            if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER):
                logger.error("Twilio credentials/phone missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER or enable DRY_RUN.")
                return
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")
            return

    # Log the FROM number being used for traceability
    logger.info(f"Using Twilio FROM number: {TWILIO_PHONE_NUMBER}")

    for user in users_in_district:
        if not user.phone_number:
            continue
        
        # Combine all alerts for this user
        alert_messages = []
        for alert in alerts:
            alert_messages.append(alert['message'])
        
        # Create full, rich message (frontend/logs)
        message_body = f"🌾 Agri-Sahayak Alert for {user.name}:\n\n"
        message_body += "\n\n".join(alert_messages)
        message_body += f"\n\nStay safe and protect your crops. For more farming tips, visit Agri-Sahayak app."

        # Create compact SMS-safe message (ASCII-only, limited length)
        sms_message_body = build_sms_message(user.name, district, alerts)
        
        # Normalize/check recipient number format
        to_number = user.phone_number.strip()
        if not to_number.startswith("+"):
            logger.warning(f"Recipient number not in E.164 format: '{to_number}' for user {user.name}. Expected format like +9198XXXXXXXX. Delivery may fail.")

        try:
            if DRY_RUN:
                logger.info(f"[DRY_RUN] Would send SMS to {user.name} ({to_number}): {sms_message_body}")
            else:
                # Send SMS
                message = client.messages.create(
                    body=sms_message_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=to_number
                )
                logger.info(f"SMS queued with SID {message.sid} to {user.name} ({to_number}). Initial status: {message.status}")
                # Fetch delivery status for diagnostics
                try:
                    fetched = client.messages(message.sid).fetch()
                    logger.info(f"Delivery status for {to_number}: status={fetched.status}, error_code={fetched.error_code}, error_message={fetched.error_message}")
                except Exception as fetch_err:
                    logger.warning(f"Could not fetch message status for SID {message.sid}: {fetch_err}")
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {user.name} ({to_number}): {e}")

def main():
    """Main function to orchestrate the alerting system"""
    logger.info("Starting Agri-Sahayak Weather Alerting System")
    
    # Validate required environment variables
    if not OPENWEATHER_API_KEY:
        logger.error("OPENWEATHER_API_KEY is not set. Set it in environment or .env file.")
        return
    if not DRY_RUN and (not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER):
        logger.error("Twilio credentials not set. Either set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER or enable DRY_RUN=1.")
        return
    
    # Connect to database
    engine, session = create_database_connection()
    if not session:
        logger.error("Cannot proceed without database connection")
        return
    
    try:
        # Fetch all users
        users = fetch_all_users(session)
        if not users:
            logger.warning("No users found in database")
            return
        
        # Get unique districts
        districts = get_unique_districts(users)
        if not districts:
            logger.warning("No districts found for users")
            return
        
        # Process each district
        total_alerts_sent = 0
        for district in districts:
            logger.info(f"Processing district: {district}")
            
            # Fetch weather data
            weather_data = fetch_weather_data(district)
            if not weather_data:
                continue
            
            # Analyze for alerts
            alerts = analyze_weather_alerts(weather_data, district)
            if not alerts:
                logger.info(f"No alerts generated for {district}")
                continue
            
            # Find users in this district
            users_in_district = [
                user for user in users 
                if user.district and user.district.lower() == district.lower()
            ]
            
            if not users_in_district:
                logger.warning(f"No users found for district: {district}")
                continue
            
            logger.info(f"Sending alerts to {len(users_in_district)} users in {district}")
            
            # Send SMS alerts
            send_sms_alerts(users_in_district, alerts, district)
            total_alerts_sent += len(users_in_district) * len(alerts)
        
        logger.info(f"Alerting system completed. Total alerts processed: {total_alerts_sent}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
    
    finally:
        # Close database session
        if session:
            session.close()
            logger.info("Database session closed")

if __name__ == '__main__':
    main()
