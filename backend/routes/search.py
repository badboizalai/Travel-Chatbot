from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config.database import get_db
from models.schemas import SearchRequest, SearchResponse
from services.search_service import search_service
from auth.auth import get_current_active_user
from models.models import User

router = APIRouter()

@router.post("/", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """General search endpoint"""
    results = await search_service.search(request.query, request.type)
    
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    
    return SearchResponse(
        results=results.get("items", []),
        total_count=len(results.get("items", []))
    )

@router.get("/places/{query}")
async def search_places(
    query: str,
    current_user: User = Depends(get_current_active_user)
):
    """Search for places"""
    results = await search_service.search_places(query)
    return results

@router.get("/suggestions/{query}")
async def get_suggestions(
    query: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get search suggestions"""
    suggestions = await search_service.get_suggestions(query)
    return suggestions