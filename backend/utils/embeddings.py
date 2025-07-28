import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
import re

class EmbeddingUtils:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """Initialize embedding utilities with specified model"""
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for a single text"""
        if not text.strip():
            return [0.0] * self.model.get_sentence_embedding_dimension()
        
        embedding = self.model.encode([text])[0]
        return embedding.tolist()
    
    def create_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for multiple texts"""
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [text if text.strip() else "empty" for text in texts]
        
        embeddings = self.model.encode(valid_texts)
        return [embedding.tolist() for embedding in embeddings]
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        if not embedding1 or not embedding2:
            return 0.0
        
        # Convert to numpy arrays
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity)
    
    def find_most_similar(self, query_embedding: List[float], candidate_embeddings: List[List[float]]) -> List[Tuple[int, float]]:
        """Find most similar embeddings to query"""
        similarities = []
        
        for i, candidate in enumerate(candidate_embeddings):
            similarity = self.calculate_similarity(query_embedding, candidate)
            similarities.append((i, similarity))
        
        # Sort by similarity (highest first)
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text before embedding"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', '', text)
        
        # Normalize case
        text = text.lower()
        
        return text.strip()
    
    def chunk_text_semantic(self, text: str, max_chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Chunk text semantically for better embeddings"""
        if not text or len(text) <= max_chunk_size:
            return [text] if text else []
        
        # Split by sentences first
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            # If adding this sentence would exceed max size
            if len(current_chunk + sentence) > max_chunk_size:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    
                    # Create overlap
                    words = current_chunk.split()
                    if len(words) > overlap:
                        overlap_text = ' '.join(words[-overlap:])
                        current_chunk = overlap_text + " " + sentence
                    else:
                        current_chunk = sentence
                else:
                    # Single sentence is too long, split by words
                    words = sentence.split()
                    for i in range(0, len(words), max_chunk_size // 10):
                        word_chunk = ' '.join(words[i:i + max_chunk_size // 10])
                        chunks.append(word_chunk)
                    current_chunk = ""
            else:
                current_chunk += (" " + sentence if current_chunk else sentence)
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def enhance_query(self, query: str, context: List[str] = None) -> str:
        """Enhance query with context for better retrieval"""
        enhanced_query = query
        
        if context:
            # Add relevant context terms
            context_text = ' '.join(context)
            # Extract key terms from context
            key_terms = self._extract_key_terms(context_text)
            if key_terms:
                enhanced_query += " " + " ".join(key_terms[:5])
        
        return enhanced_query
    
    def _extract_key_terms(self, text: str) -> List[str]:
        """Extract key terms from text"""
        if not text:
            return []
        
        # Simple keyword extraction
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'that', 'with', 'have', 'this', 'will', 'been', 'from', 'they', 
            'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very',
            'when', 'come', 'here', 'just', 'like', 'what', 'said', 'each',
            'which', 'their', 'would', 'there', 'could', 'other'
        }
        
        # Count word frequency
        word_freq = {}
        for word in words:
            if word not in stop_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top terms
        key_terms = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [term[0] for term in key_terms[:10]]
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings from this model"""
        return self.model.get_sentence_embedding_dimension()
    
    def save_embeddings(self, embeddings: List[List[float]], filepath: str):
        """Save embeddings to file"""
        np.save(filepath, np.array(embeddings))
    
    def load_embeddings(self, filepath: str) -> List[List[float]]:
        """Load embeddings from file"""
        embeddings_array = np.load(filepath)
        return embeddings_array.tolist()