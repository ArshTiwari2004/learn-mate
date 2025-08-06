from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ai_tutor, content
from core.config import settings
import asyncio
from core.initializer import initialize_vector_db

app = FastAPI(title="Ask AI Tutor API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await initialize_vector_db()


app.include_router(ai_tutor.router, prefix="/api/v1")
app.include_router(content.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "healthy", "version": app.version}