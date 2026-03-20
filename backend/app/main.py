from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, sources, documents, highlights, notes, ai
from app.core.config import settings
from app.core.database import engine, Base
import logging

# Import all models to register them with Base.metadata
from app.models import User, Source, Document, Highlight, Note

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Synapse API",
    description="AI-powered learning and creation platform",
    version="1.0.0"
)

# CORS middleware - allow all origins for extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Create database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
        print("Database tables created/verified")
        
        # Create temp user if not exists
        from sqlalchemy.orm import Session
        from app.models.user import User
        session = Session(bind=engine)
        try:
            existing_user = session.query(User).filter(User.id == "temp-user-123").first()
            if not existing_user:
                temp_user = User(
                    id="temp-user-123",
                    email="temp@synapse.local",
                    hashed_password="temp",
                    name="Temp User"
                )
                session.add(temp_user)
                session.commit()
                logger.info("Temp user created")
                print("Temp user created")
        except Exception as e:
            logger.warning(f"Could not create temp user: {e}")
            print(f"Could not create temp user: {e}")
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        print(f"Database initialization error: {e}")


@app.get("/health")
def health_check():
    """Health check endpoint for Railway"""
    return {"status": "healthy"}


# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(highlights.router, prefix="/api/highlights", tags=["highlights"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
