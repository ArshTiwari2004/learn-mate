# Student data models 
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class WeakArea(BaseModel):
    topic: str
    confidence_score: float  # 0-1
    last_attempted: Optional[datetime] = None
    difficulty_level: str = "intermediate"  # "beginner", "intermediate", "advanced"
    priority: int = 1  # 1 (high) to 5 (low)

class StudentProfile(BaseModel):
    student_id: str
    name: str
    email: Optional[str] = None
    weak_areas: List[WeakArea] = []
    learning_style: str = "visual"  # "visual", "auditory", "kinesthetic"
    study_time_preference: int = 60  # minutes per session
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TestResult(BaseModel):
    test_id: Optional[str] = None
    subject: str
    topic: str
    score: float
    total_questions: int
    correct_answers: int
    incorrect_topics: List[str] = []
    upload_date: datetime
    student_id: str
    
    @property
    def percentage(self) -> float:
        return (self.score / self.total_questions) * 100 if self.total_questions > 0 else 0

class RevisionItem(BaseModel):
    topic: str
    date: str
    priority: int
    estimated_time: int  # minutes
    resources: List[str] = []
    status: str = "pending"  # "pending", "completed", "skipped"

class RevisionSchedule(BaseModel):
    student_id: str
    schedule: List[RevisionItem]
    total_study_time: int  # minutes
    created_at: datetime
    valid_until: datetime

class QuestionResponse(BaseModel):
    question: str
    answer: str
    sources: List[Dict] = []
    confidence: float = 0.0
    timestamp: datetime