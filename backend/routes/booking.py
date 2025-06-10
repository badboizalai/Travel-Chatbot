from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import json
from datetime import datetime

from config.database import get_db
from models.models import User, Booking
from models.schemas import (
    FlightSearchRequest, FlightBookingRequest,
    HotelSearchRequest, HotelBookingRequest,
    TrainSearchRequest, TrainBookingRequest,
    BookingResponse
)
from auth.auth import get_current_active_user
from services.booking_service import booking_service

router = APIRouter()

# Flight booking endpoints
@router.post("/flights/search")
async def search_flights(
    request: FlightSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Search for flights"""
    results = await booking_service.search_flights(request)
    return results

@router.post("/flights/book", response_model=BookingResponse)
async def book_flight(
    request: FlightBookingRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Book a flight"""
    booking_result = await booking_service.book_flight(request)
    
    if "error" in booking_result:
        raise HTTPException(status_code=400, detail=booking_result["error"])
    
    # Save booking to database
    booking = Booking(
        user_id=current_user.id,
        booking_type="flight",
        booking_reference=str(uuid.uuid4()),
        status="pending",
        total_amount=booking_result.get("total_amount", 0),
        booking_data=json.dumps(booking_result)
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return booking

# Hotel booking endpoints
@router.post("/hotels/search")
async def search_hotels(
    request: HotelSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Search for hotels"""
    results = await booking_service.search_hotels(request)
    return results

@router.post("/hotels/book", response_model=BookingResponse)
async def book_hotel(
    request: HotelBookingRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Book a hotel"""
    booking_result = await booking_service.book_hotel(request)
    
    if "error" in booking_result:
        raise HTTPException(status_code=400, detail=booking_result["error"])
    
    # Save booking to database
    booking = Booking(
        user_id=current_user.id,
        booking_type="hotel",
        booking_reference=str(uuid.uuid4()),
        status="pending",
        total_amount=booking_result.get("total_amount", 0),
        booking_data=json.dumps(booking_result)
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return booking

# Train booking endpoints
@router.post("/trains/search")
async def search_trains(
    request: TrainSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Search for trains"""
    results = await booking_service.search_trains(request)
    return results

@router.post("/trains/book", response_model=BookingResponse)
async def book_train(
    request: TrainBookingRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Book a train"""
    booking_result = await booking_service.book_train(request)
    
    if "error" in booking_result:
        raise HTTPException(status_code=400, detail=booking_result["error"])
    
    # Save booking to database
    booking = Booking(
        user_id=current_user.id,
        booking_type="train",
        booking_reference=str(uuid.uuid4()),
        status="pending",
        total_amount=booking_result.get("total_amount", 0),
        booking_data=json.dumps(booking_result)
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return booking

# General booking endpoints
@router.get("/my-bookings", response_model=list[BookingResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's bookings"""
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    
    return bookings

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific booking"""
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    booking.status = "cancelled"
    db.commit()
    
    return {"message": "Booking cancelled successfully"}