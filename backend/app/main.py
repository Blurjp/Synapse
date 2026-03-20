from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, sources, documents, highlights, notes, ai
from app.core.config import settings
from app.core.database import engine, Base

# Import all models to register them with Base.metadata
from app.models import User, Source, Document, Highlight, Note

app = FastAPI(
    title="Synapse API",
    description="AI-powered learning and creation platform",
    version="1.0.0"
)

# CORS middleware - allow all origins for extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(highlights.router, prefix="/api/highlights", tags=["highlights"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to Synapse API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
