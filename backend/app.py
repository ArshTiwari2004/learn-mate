
import os
import shutil
import uuid
from datetime import datetime, date
from typing import List, Optional, Literal
from fastapi import Query

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator

# Import only required services
from services.pdf_parser import PDFParser
from services.llm_service import LLMService
from models.student import TestResult

# Initialize FastAPI app
app = FastAPI(
    title="Personalized Learning Copilot",
    description="LLM-powered personalized learning assistant (no vector DB)",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService(use_gemini=True)
pdf_parser = PDFParser()

# Create uploads folder
os.makedirs("uploads", exist_ok=True)

# ---------------- Models ----------------

class QueryRequest(BaseModel):
    query: str
    difficulty_level: Optional[str] = "intermediate"
    learning_style: Optional[str] = "visual"

class WeakArea(BaseModel):
    topic: str
    confidence_score: float
    difficulty_level: str
    focus_areas: Optional[List[str]] = []
    study_approach: Optional[str] = ""

class ScheduleRequest(BaseModel):
    student_id: str
    exam_date: date
    daily_study_hours: int
    difficulty_level: Literal["beginner", "intermediate", "advanced"]
    learning_style: Literal["visual", "auditory", "kinesthetic"]
    focus_areas: List[str] = []

    weak_areas: List[dict] = []
    study_time: int = 60
    days: int = 7

    @validator("weak_areas", always=True)
    def generate_weak_areas(cls, v, values):
        return [{"topic": area, "confidence_score": 0.3, "difficulty_level": values.get("difficulty_level", "intermediate")} for area in values.get("focus_areas", [])]

    @validator("study_time", always=True)
    def compute_study_time(cls, v, values):
        return values.get("daily_study_hours", 4) * 60

    @validator("days", always=True)
    def compute_days(cls, v, values):
        days_left = (values["exam_date"] - date.today()).days
        return max(days_left, 1)

# ---------------- Routes ----------------

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "🚀 Personalized Learning Copilot API (LLM-only) is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "✅ Healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/upload-test-result")
async def upload_test_result(file: UploadFile = File(...), student_id: str = "default_student"):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join("uploads", f"{file_id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        test_results = pdf_parser.extract_test_results(file_path)
        if "error" in test_results:
            raise HTTPException(status_code=400, detail=test_results["error"])

        weak_areas = llm_service.analyze_weak_areas(test_results)

        test_result = TestResult(
            test_id=file_id,
            subject=test_results.get('subject', 'Unknown'),
            topic=test_results.get('topic', 'General'),
            score=test_results.get('score', 0),
            total_questions=test_results.get('total', 0),
            correct_answers=test_results.get('score', 0),
            incorrect_topics=test_results.get('incorrect_topics', []),
            upload_date=datetime.now(),
            student_id=student_id
        )

        os.remove(file_path)

        return {
            "test_result": test_result.dict(),
            "weak_areas": weak_areas,
            "recommendations": [f"Focus on {w['topic']}" for w in weak_areas[:3]],
            "message": "✅ Test result analyzed"
        }

    except Exception as e:
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process test: {str(e)}")

@app.post("/generate-schedule")
async def generate_schedule(request: ScheduleRequest):
    try:
        schedule = llm_service.generate_revision_schedule(
            weak_areas=request.weak_areas,
            study_time=request.study_time,
            days=request.days
        )
        return {
            "schedule": schedule,
            "message": "✅ Revision schedule generated"
        }
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate schedule: {str(e)}")

@app.post("/ask-question")
async def ask_question(request: QueryRequest):
    try:
        answer = llm_service.explain_concept(
            topic=request.query,
            difficulty=request.difficulty_level,
            learning_style=request.learning_style
        )
        return {
            "question": request.query,
            "answer": answer,
            "message": "✅ Answer generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to answer question: {str(e)}")

@app.post("/generate-practice-questions")
async def generate_practice_questions(
    topic: str,
    difficulty: str = "intermediate",
    num_questions: int = 5
):
    try:
        if num_questions > 10:
            raise HTTPException(status_code=400, detail="Max 10 questions allowed")
        
        questions = llm_service.generate_practice_questions(topic, difficulty, num_questions)
        return {
            "topic": topic,
            "questions": questions,
            "message": "✅ Practice questions generated"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@app.post("/check-answer")
async def check_answer(
    question: str,
    student_answer: str,
    correct_answer: str
):
    try:
        feedback = llm_service.check_answer(question, student_answer, correct_answer)
        return {
            "question": question,
            "student_answer": student_answer,
            "feedback": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check answer: {str(e)}")

@app.get("/search-content")
async def search_content(query: str = Query(...), topic: Optional[str] = "", difficulty: str = "intermediate"):
    try:
        result = llm_service.search_content(query=query, topic=topic, difficulty=difficulty)
        return {
            "query": query,
            "result": result,
            "message": "✅ Content found"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# ---------------- Run ----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
