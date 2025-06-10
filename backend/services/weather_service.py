import httpx
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("WEATHER_API_KEY")
        self.base_url = os.getenv("WEATHER_API_URL", "https://api.openweathermap.org/data/2.5")
        
    async def get_current_weather(self, location: str) -> Dict[str, Any]:
        """Get current weather for a location"""
        if not self.api_key:
            return {"error": "Weather API key not configured"}
            
        url = f"{self.base_url}/weather"
        params = {
            "q": location,
            "appid": self.api_key,
            "units": "metric",
            "lang": "vi"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    async def get_weather_forecast(self, location: str, days: int = 5) -> Dict[str, Any]:
        """Get weather forecast for multiple days"""
        if not self.api_key:
            return {"error": "Weather API key not configured"}
            
        url = f"{self.base_url}/forecast"
        params = {
            "q": location,
            "appid": self.api_key,
            "units": "metric",
            "lang": "vi",
            "cnt": days * 8  # 8 forecasts per day (every 3 hours)
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def format_weather_response(self, current_data: dict, forecast_data: dict) -> Dict[str, Any]:
        """Format weather data for frontend"""
        if "error" in current_data or "error" in forecast_data:
            return {"error": "Không thể lấy dữ liệu thời tiết"}
        
        # Format current weather
        current = {
            "temperature": current_data["main"]["temp"],
            "feels_like": current_data["main"]["feels_like"],
            "humidity": current_data["main"]["humidity"],
            "pressure": current_data["main"]["pressure"],
            "visibility": current_data.get("visibility", 0) / 1000,  # Convert to km
            "wind_speed": current_data["wind"]["speed"],
            "description": current_data["weather"][0]["description"],
            "icon": current_data["weather"][0]["icon"]
        }
        
        # Format forecast
        forecast = []
        if "list" in forecast_data:
            daily_forecasts = {}
            for item in forecast_data["list"]:
                date = datetime.fromtimestamp(item["dt"]).date()
                if date not in daily_forecasts:
                    daily_forecasts[date] = {
                        "date": date.isoformat(),
                        "temp_min": item["main"]["temp_min"],
                        "temp_max": item["main"]["temp_max"],
                        "description": item["weather"][0]["description"],
                        "icon": item["weather"][0]["icon"],
                        "humidity": item["main"]["humidity"],
                        "wind_speed": item["wind"]["speed"]
                    }
                else:
                    # Update min/max temperatures
                    daily_forecasts[date]["temp_min"] = min(
                        daily_forecasts[date]["temp_min"], 
                        item["main"]["temp_min"]
                    )
                    daily_forecasts[date]["temp_max"] = max(
                        daily_forecasts[date]["temp_max"], 
                        item["main"]["temp_max"]
                    )
            
            forecast = list(daily_forecasts.values())[:5]  # Only return 5 days
        
        return {
            "location": current_data["name"],
            "current": current,
            "forecast": forecast
        }

# Global instance
weather_service = WeatherService()