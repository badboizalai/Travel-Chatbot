from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from config.database import get_db
from models.models import User, Booking, ChatSession
from models.schemas import User as UserSchema, BookingResponse
from auth.auth import get_admin_user
from services.langflow_service import langflow_service
from services.flow_id_broadcast_service import flow_id_broadcast_service

router = APIRouter()

class FlowIdUpdateRequest(BaseModel):
    flow_id: str
    source: str = "admin"

class FlowIdBroadcastRequest(BaseModel):
    flow_id: str

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user active status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}

@router.put("/users/{user_id}/make-admin")
async def make_user_admin(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Make user admin (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = True
    db.commit()
    
    return {"message": "User promoted to admin successfully"}

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all bookings (admin only)"""
    bookings = db.query(Booking).offset(skip).limit(limit).all()
    return bookings

@router.get("/stats")
async def get_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system statistics (admin only)"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_bookings = db.query(Booking).count()
    total_chat_sessions = db.query(ChatSession).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_bookings": total_bookings,
        "total_chat_sessions": total_chat_sessions
    }

@router.post("/update-flow-id")
async def update_flow_id(
    request: FlowIdUpdateRequest,
    # admin_user: User = Depends(get_admin_user),  # Comment out for internal calls
):
    """Update Flow ID in the system"""
    try:
        # Update the langflow service with new Flow ID
        langflow_service._cached_flow_id = request.flow_id
        
        # Save to persistent file if possible
        try:
            import os
            os.makedirs("/app/data", exist_ok=True)
            with open("/app/data/flow_id.txt", 'w') as f:
                f.write(request.flow_id)
        except Exception as e:
            print(f"⚠️ Could not save Flow ID to persistent file: {e}")
        
        return {
            "status": "success",
            "message": f"Flow ID updated to {request.flow_id}",
            "flow_id": request.flow_id,
            "source": request.source
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Flow ID: {str(e)}"
        )

@router.post("/broadcast-flow-id")
async def broadcast_flow_id(
    request: FlowIdBroadcastRequest,
    # admin_user: User = Depends(get_admin_user),  # Comment out for internal calls
):
    """Broadcast Flow ID change to all connected clients"""
    try:
        # Use the broadcast service to notify all connected clients
        await flow_id_broadcast_service.broadcast_flow_id_change(request.flow_id)
        
        return {
            "status": "success",
            "message": f"Flow ID broadcasted to all clients",
            "flow_id": request.flow_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to broadcast Flow ID: {str(e)}"
        )

@router.get("/current-flow-id")
async def get_current_flow_id(
    admin_user: User = Depends(get_admin_user),
):
    """Get current Flow ID"""
    try:
        flow_id = await langflow_service.get_flow_id()
        return {
            "status": "success",
            "flow_id": flow_id
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "flow_id": None
        }