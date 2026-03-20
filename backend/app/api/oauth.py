"""Google OAuth token exchange endpoint"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.database import get_db
from app.services.auth import AuthService
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class GoogleTokenRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    token_data: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Exchange Google ID token for Synapse JWT token
    
    This endpoint:
    1. Verifies the Google ID token
    2. Creates or retrieves the user
    3. Returns Synapse JWT tokens
    """
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            token_data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user info from Google token
        google_user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        logger.info(f"Google auth for user: {email}")
        
        # Create or get user using AuthService
        auth_service = AuthService(db)
        user = auth_service.get_or_create_google_user(
            google_id=google_user_id,
            email=email,
            name=name,
            picture=picture
        )
        
        # Generate JWT tokens
        tokens = auth_service.generate_tokens(user.id)
        
        return AuthResponse(
            access_token=tokens['access_token'],
            refresh_token=tokens['refresh_token'],
            user={
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'picture': user.avatar
            }
        )
        
    except ValueError as e:
        logger.error(f"Invalid Google token: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
