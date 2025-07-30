import os
import shutil
import uuid
from datetime import date, datetime
from typing import List, Dict, Optional, Literal

# Third-party imports
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

# Import our services
from services.pdf_parser import PDFParser
from services.vector_service import VectorService
from services.llm_service import LLMService
from services.schedular import SchedulerService
from models.student import StudentProfile, TestResult, WeakArea, RevisionSchedule
from utils.embeddings import EmbeddingUtils

# Initialize FastAPI app
app = FastAPI(
    title="Personalized Learning Copilot",
    description="AI-powered personalized learning assistant with RAG capabilities",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pdf_parser = PDFParser()
vector_service = VectorService()
llm_service = LLMService(use_gemini=True)  # Set to False to use OpenAI
scheduler_service = SchedulerService()
embedding_utils = EmbeddingUtils()

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("content", exist_ok=True)
os.makedirs("data", exist_ok=True)

# Request/Response Models
class QueryRequest(BaseModel):
    query: str
    student_id: str
    difficulty_level: Optional[str] = "intermediate"
    learning_style: Optional[str] = "visual"



class ScheduleRequest(BaseModel):
    student_id: str
    exam_date: date
    daily_study_hours: int = Field(alias="daily_study_hours")
    difficulty_level: Literal["beginner", "intermediate", "advanced"]
    learning_style: Literal["visual", "auditory", "kinesthetic"]
    focus_areas: List[str] = []

    # derived fields
    weak_areas: List[dict] = []
    study_time: int = 60
    days: int = 7

    @validator("weak_areas", always=True)
    def generate_weak_areas(cls, v, values):
        focus_areas = values.get("focus_areas", [])
        return [{"topic": area} for area in focus_areas]  


    @validator("study_time", always=True)
    def compute_study_time(cls, v, values):
        return values.get("daily_study_hours", 4) * 60  # hours to minutes

    @validator("days", always=True)
    def compute_days(cls, v, values):
        exam_date = values.get("exam_date")
        if not exam_date:
            return 7
        days_left = (exam_date - date.today()).days
        return max(days_left, 1)


class ContentUploadResponse(BaseModel):
    message: str
    content_id: str
    chunks_added: int

class AnswerResponse(BaseModel):
    question: str
    answer: str
    sources: List[Dict]
    confidence: float
    response_time: float

# Populate sample content on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the application with sample data"""
    try:
        vector_service.populate_sample_content()
        print("✅ Application started successfully!")
        print(f"📊 Vector DB stats: {vector_service.get_collection_stats()}")
    except Exception as e:
        print(f"❌ Startup error: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🎓 Personalized Learning Copilot API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check vector service
        stats = vector_service.get_collection_stats()
        
        return {
            "status": "healthy",
            "services": {
                "vector_db": "operational",
                "llm_service": "operational",
                "pdf_parser": "operational"
            },
            "database_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.post("/upload-test-result")
async def upload_test_result(file: UploadFile = File(...), student_id: str = "default_student"):
    """Upload and analyze test result PDF"""
    
    # Validate file
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are allowed"
        )
    
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_path = os.path.join("uploads", f"{file_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📄 Processing test result: {file.filename}")
        
        # Parse test results
        test_results = pdf_parser.extract_test_results(file_path)
        
        if "error" in test_results:
            raise HTTPException(status_code=400, detail=test_results["error"])
        
        # Analyze weak areas using LLM
        weak_areas = llm_service.analyze_weak_areas(test_results)
        
        # Create test result object
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
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return {
            "test_result": test_result.dict(),
            "weak_areas": weak_areas,
            "parsing_confidence": test_results.get('parsing_confidence', 0),
            "recommendations": [
                f"Focus on {area.get('topic', 'unknown topic')}" 
                for area in weak_areas[:3]
            ],
            "message": "✅ Test result analyzed successfully"
        }
        
    except Exception as e:
        # Clean up file if error occurs
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"❌ Error processing test result: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process test result: {str(e)}")

@app.post("/generate-schedule")
async def generate_schedule(request: ScheduleRequest):
    """Generate personalized revision schedule"""
    try:
        print(f"📅 Generating schedule for student: {request.student_id}")
        
        # Generate schedule using both AI and rule-based approaches
        ai_schedule = llm_service.generate_revision_schedule(
            request.weak_areas, 
            request.study_time, 
            request.days
        )
        
        # Generate structured schedule using scheduler service
        structured_schedule = scheduler_service.create_study_schedule(
            request.weak_areas,
            request.study_time,
            request.days
        )
        
        # Combine both approaches
        final_schedule = {
            "student_id": request.student_id,
            "ai_generated": ai_schedule,
            "structured_schedule": structured_schedule,
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "total_days": request.days,
                "daily_study_time": request.study_time,
                "weak_areas_count": len(request.weak_areas)
            }
        }
        
        return {
            "schedule": final_schedule,
            "next_session": scheduler_service.get_next_study_session(structured_schedule),
            "message": "✅ Personalized schedule generated successfully"
        }
        
    except Exception as e:
        print(f"❌ Error generating schedule: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate schedule: {str(e)}")

@app.post("/ask-question")
async def ask_question(request: QueryRequest):
    """Answer student questions using RAG (Retrieval-Augmented Generation)"""
    try:
        start_time = datetime.now()
        
        print(f"❓ Processing question: {request.query[:50]}...")
        
        # Search for relevant content in vector database
        relevant_content = vector_service.search_similar_content(
            query=request.query,
            n_results=5
        )
        
        if not relevant_content:
            return {
                "question": request.query,
                "answer": "I couldn't find relevant information in the database. Please try rephrasing your question or upload more educational content.",
                "sources": [],
                "confidence": 0.0,
                "response_time": 0.0
            }
        
        # Prepare context from search results
        context = "\n\n".join([
            f"Source {i+1}: {item['content'][:300]}..." 
            for i, item in enumerate(relevant_content[:3])
        ])
        
        # Generate explanation using LLM with context
        explanation = llm_service.explain_concept(
            topic=request.query,
            context=context,
            difficulty=request.difficulty_level,
            learning_style=request.learning_style
        )
        
        # Calculate response time
        response_time = (datetime.now() - start_time).total_seconds()
        
        # Calculate confidence based on source similarity
        confidence = sum(item['similarity_score'] for item in relevant_content[:3]) / 3
        
        return AnswerResponse(
            question=request.query,
            answer=explanation,
            sources=relevant_content,
            confidence=round(confidence, 3),
            response_time=round(response_time, 2)
        )
        
    except Exception as e:
        print(f"❌ Error answering question: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to answer question: {str(e)}")

@app.post("/add-educational-content")
async def add_educational_content(
    file: UploadFile = File(...),
    subject: str = "General",
    topic: str = "General",
    difficulty_level: str = "intermediate"
):
    """Add educational content to vector database"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file
        content_id = str(uuid.uuid4())
        file_path = os.path.join("content", f"{content_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"📚 Processing educational content: {file.filename}")
        
        # Extract content from PDF
        raw_content = pdf_parser.extract_notes_content(file_path)
        
        if not raw_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Chunk the content for better vector storage
        chunks = pdf_parser.chunk_text(raw_content, chunk_size=800, overlap=100)
        
        # Prepare metadata
        base_metadata = {
            "filename": file.filename,
            "subject": subject,
            "topic": topic,
            "difficulty_level": difficulty_level,
            "upload_date": datetime.now().isoformat(),
            "content_type": "educational_material"
        }
        
        # Add chunks to vector database
        chunk_ids = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **base_metadata,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "parent_content_id": content_id
            }
            
            chunk_id = vector_service.add_educational_content(
                content=chunk,
                metadata=chunk_metadata,
                content_id=f"{content_id}chunk{i}"
            )
            chunk_ids.append(chunk_id)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return ContentUploadResponse(
            message="✅ Educational content added successfully",
            content_id=content_id,
            chunks_added=len(chunk_ids)
        )
        
    except Exception as e:
        # Clean up file if error occurs
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        print(f"❌ Error adding educational content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add content: {str(e)}")

@app.post("/generate-practice-questions")
async def generate_practice_questions(
    topic: str,
    difficulty: str = "intermediate",
    num_questions: int = 5
):
    """Generate practice questions for a topic"""
    try:
        if num_questions > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 questions allowed")
        
        print(f"🧠 Generating {num_questions} practice questions for: {topic}")
        
        questions = llm_service.generate_practice_questions(
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions
        )
        
        return {
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions,
            "total_questions": len(questions),
            "message": "✅ Practice questions generated successfully"
        }
        
    except Exception as e:
        print(f"❌ Error generating practice questions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@app.post("/check-answer")
async def check_answer(
    question: str,
    student_answer: str,
    correct_answer: str
):
    """Check student answer and provide feedback"""
    try:
        feedback = llm_service.check_answer(question, student_answer, correct_answer)
        return {
            "question": question,
            "student_answer": student_answer,
            "correct_answer": correct_answer,
            "feedback": feedback,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error checking answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to check answer: {str(e)}")

@app.get("/search-content")
async def search_content(
    query: str,
    limit: int = 5,
    subject: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Search educational content"""
    try:
        # Prepare filters
        filters = {}
        if subject:
            filters["subject"] = subject
        if difficulty:
            filters["difficulty_level"] = difficulty
        
        # Search content
        results = vector_service.search_similar_content(
            query=query,
            n_results=limit,
            filter_metadata=filters if filters else None
        )
        
        return {
            "query": query,
            "results": results,
            "total_found": len(results),
            "filters_applied": filters
        }
        
    except Exception as e:
        print(f"❌ Error searching content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search content: {str(e)}")

@app.get("/database-stats")
async def get_database_stats():
    """Get vector database statistics"""
    try:
        stats = vector_service.get_collection_stats()
        return {
            "database_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error getting database stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.delete("/content/{content_id}")
async def delete_content(content_id: str):
    """Delete content from vector database"""
    try:
        success = vector_service.delete_content(content_id)
        if success:
            return {"message": f"✅ Content {content_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Content not found")
    except Exception as e:
        print(f"❌ Error deleting content: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete content: {str(e)}")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Endpoint not found", "status": "error"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "status": "error"}
    )

if _name_ == "_main_":
    import uvicorn
    
    print("🚀 Starting Personalized Learning Copilot API...")
    print("📚 Using Gemini AI for LLM services")
    print("🔍 Vector search powered by ChromaDB")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )