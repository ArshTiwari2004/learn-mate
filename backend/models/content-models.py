from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ContentMetadata(BaseModel):
    title: str
    subject: str
    topic: str
    subtopic: Optional[str] = None
    difficulty_level: str = "intermediate"  # "beginner", "intermediate", "advanced"
    content_type: str = "text"  # "text", "video", "image", "audio"
    source: Optional[str] = None
    author: Optional[str] = None
    upload_date: datetime
    tags: List[str] = []

class EducationalContent(BaseModel):
    content_id: str
    content: str
    metadata: ContentMetadata
    embedding_id: Optional[str] = None
    
class SearchResult(BaseModel):
    content: str
    metadata: Dict
    similarity_score: float
    content_id: str

class ContentChunk(BaseModel):
    chunk_id: str
    content: str
    chunk_index: int
    parent_content_id: str
    metadata: Dict