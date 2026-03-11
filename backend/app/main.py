from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, sources, documents, highlights, notes
from app.core.config import settings

app = FastAPI(
    title="Synapse API",
    description="AI-powered learning and creation platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(highlights.router, prefix="/api/highlights", tags=["highlights"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])


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
