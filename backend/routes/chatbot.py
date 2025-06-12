from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from config.database import get_db
from models.models import User, ChatSession, ChatMessage
from models.schemas import ChatMessage as ChatMessageSchema, ChatResponse, ChatSessionCreate, ChatSessionResponse
from auth.auth import get_current_active_user
from services.langflow_service import langflow_service

router = APIRouter()

@router.post("/send", response_model=ChatResponse)
async def send_message(
    message: ChatMessageSchema,
    session_id: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get or create session
    if session_id:
        session = db.query(ChatSession).filter(
            ChatSession.session_id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        # Create new session
        session = ChatSession(
            user_id=current_user.id,
            session_id=str(uuid.uuid4()),
            title=message.message[:50] + "..." if len(message.message) > 50 else message.message
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Send message to Langflow
    response = await langflow_service.send_message(message.message, session.session_id)
    
    # Save message and response to database
    chat_message = ChatMessage(
        session_id=session.id,
        message=message.message,
        response=response["response"],
        is_user=True
    )
    db.add(chat_message)
    
    # Save bot response
    bot_message = ChatMessage(
        session_id=session.id,
        message=response["response"],
        is_user=False
    )
    db.add(bot_message)
    
    db.commit()
    
    return ChatResponse(
        response=response["response"],
        session_id=session.session_id
    )

@router.get("/sessions", response_model=list[ChatSessionResponse])
async def get_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    return sessions

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return messages

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete all messages first
    db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
    # Delete session
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted successfully"}

@router.get("/flow-id")
async def get_flow_id():
    """Lấy flow ID hiện tại từ Langflow service - Public endpoint"""
    try:
        flow_id = await langflow_service.get_flow_id()
        return {"flow_id": flow_id, "status": "success"}
    except Exception as e:
        # Log error but still return something
        print(f"❌ Error getting flow ID: {e}")
        return {"flow_id": None, "status": "error", "message": str(e)}

@router.get("/health")
async def check_langflow_health():
    """Kiểm tra trạng thái Langflow - Public endpoint"""
    try:
        is_healthy = await langflow_service.health_check()
        return {"healthy": is_healthy, "status": "success"}
    except Exception as e:
        return {"healthy": False, "status": "error", "error": str(e)}