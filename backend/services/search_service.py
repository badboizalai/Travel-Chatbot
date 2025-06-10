import httpx
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class SearchService:
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        self.search_api_key = os.getenv("SEARCH_API_KEY")
    
    async def search(self, query: str, search_type: str = "general") -> Dict[str, Any]:
        """General search using Google Custom Search API"""
        if not self.google_api_key or not self.google_cse_id:
            return {"error": "Search API not configured"}
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": self.google_api_key,
            "cx": self.google_cse_id,
            "q": query,
            "num": 10
        }
        
        # Add search type specific parameters
        if search_type == "places":
            params["q"] += " travel destination attractions"
        elif search_type == "hotels":
            params["q"] += " hotels accommodation booking"
        elif search_type == "flights":
            params["q"] += " flights booking airline"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    async def search_places(self, query: str) -> Dict[str, Any]:
        """Search for travel places and attractions"""
        # Mock implementation for places search
        places = [
            {
                "name": f"{query} - Điểm tham quan 1",
                "description": "Một điểm tham quan tuyệt vời với phong cảnh đẹp",
                "rating": 4.5,
                "image_url": "https://example.com/place1.jpg",
                "location": query
            },
            {
                "name": f"{query} - Điểm tham quan 2", 
                "description": "Nơi lý tưởng để khám phá văn hóa địa phương",
                "rating": 4.2,
                "image_url": "https://example.com/place2.jpg",
                "location": query
            }
        ]
        
        return {"places": places}
    
    async def get_suggestions(self, query: str) -> List[str]:
        """Get search suggestions"""
        # Mock suggestions based on query
        suggestions = [
            f"{query} attractions",
            f"{query} hotels",
            f"{query} restaurants",
            f"{query} weather",
            f"best time to visit {query}"
        ]
        
        return suggestions[:5]

# Global instance
search_service = SearchService()