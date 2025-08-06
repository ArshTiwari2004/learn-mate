from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class ContentChunk(BaseModel):
    id: str
    text: str
    embedding: List[float]
    metadata: dict
    
class TutorRequest(BaseModel):
    query: str
    student_id: str
    difficulty: str = "intermediate"
    learning_style: str = "visual"
    subject: str = "physics"

class TutorResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
    confidence: float
    suggested_followups: List[str] = []

class PDFUpload(BaseModel):
    filename: str
    subject: str
    chapters: List[str]
    pages: int

class UserProfile(BaseModel):
    user_id: str
    name: str
    grade: str
    preferred_subjects: List[str] = []
    learning_style: Optional[str] = None
    weak_areas: List[str] = []