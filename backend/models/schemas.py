from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Chat schemas
class UserContext(BaseModel):
    userId: Optional[int] = None
    email: Optional[str] = None
    username: Optional[str] = None
    fullName: Optional[str] = None
    isAuthenticated: bool = False

class ChatMessage(BaseModel):
    message: str
    user_context: Optional[UserContext] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ChatSessionCreate(BaseModel):
    title: Optional[str] = None

class ChatSessionResponse(BaseModel):
    id: int
    session_id: str
    title: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Weather schemas
class WeatherRequest(BaseModel):
    location: str
    days: Optional[int] = 5

class WeatherResponse(BaseModel):
    location: str
    current: dict
    forecast: List[dict]

# Booking schemas
class BookingBase(BaseModel):
    booking_type: str
    booking_data: dict

class BookingCreate(BookingBase):
    pass

class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    status: str
    total_amount: float
    booking_type: str
    booking_data: dict
    created_at: datetime
    
    class Config:
        from_attributes = True

# Flight booking
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    class_type: Optional[str] = "economy"

class FlightBookingRequest(BaseModel):
    flight_id: str
    passenger_details: List[dict]

# Hotel booking
class HotelSearchRequest(BaseModel):
    location: str
    check_in: str
    check_out: str
    guests: int = 1
    rooms: int = 1

class HotelBookingRequest(BaseModel):
    hotel_id: str
    room_type: str
    guest_details: dict

# Train booking
class TrainSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    passengers: int = 1

class TrainBookingRequest(BaseModel):
    train_id: str
    passenger_details: List[dict]

# Search schemas
class SearchRequest(BaseModel):
    query: str
    type: Optional[str] = "general"  # general, places, hotels, flights

class SearchResponse(BaseModel):
    results: List[dict]
    total_count: int