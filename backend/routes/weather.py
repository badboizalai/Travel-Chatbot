from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config.database import get_db
from models.schemas import WeatherRequest, WeatherResponse
from services.weather_service import weather_service
from auth.auth import get_current_active_user
from models.models import User

router = APIRouter()

@router.post("/current", response_model=WeatherResponse)
async def get_current_weather(
    request: WeatherRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current weather for a location"""
    current_data = await weather_service.get_current_weather(request.location)
    forecast_data = await weather_service.get_weather_forecast(request.location, request.days)
    
    if "error" in current_data:
        raise HTTPException(status_code=400, detail=current_data["error"])
    
    result = weather_service.format_weather_response(current_data, forecast_data)
    return result

@router.get("/forecast/{location}")
async def get_weather_forecast(
    location: str,
    days: int = 5,
    current_user: User = Depends(get_current_active_user)
):
    """Get weather forecast for a location"""
    forecast_data = await weather_service.get_weather_forecast(location, days)
    
    if "error" in forecast_data:
        raise HTTPException(status_code=400, detail=forecast_data["error"])
    
    return forecast_data