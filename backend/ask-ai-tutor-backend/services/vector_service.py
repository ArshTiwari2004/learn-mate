import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from core.config import settings
from services.embedding_service import EmbeddingService
import logging

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        logger.info("⚙️ Initializing VectorService...")
        
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False)
        )
        
        logger.info("✅ ChromaDB PersistentClient initialized.")
        
        self.collection = self.client.get_or_create_collection(
            name="ncert_physics",
            metadata={"hnsw:space": "cosine"}
        )
        
        logger.info(f"📚 Vector DB collection loaded: {self.collection.name}")
        self.embedder = EmbeddingService()
        self._ensure_collection_ready()

    def _ensure_collection_ready(self):
        """Verify the collection is ready for operations"""
        try:
            # Try a simple count operation to verify connection
            self.collection.count()
            logger.info("🔍 Vector DB connection verified")
        except Exception as e:
            logger.error(f"Failed to verify vector DB connection: {e}")
            raise

    async def add_document(self, text: str, metadata: dict) -> str:
        """Add a document to the vector DB with improved error handling"""
        if not text.strip():
            raise ValueError("Cannot add empty document")
            
        try:
            embedding = self.embedder.generate_embedding(text).tolist()
            doc_id = f"doc_{hash(text) & 0xFFFFFFFF}"  # Ensure positive ID
            
            self.collection.add(
                documents=[text],
                embeddings=[embedding],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
            logger.debug(f"✅ Added document: {doc_id}")
            return doc_id
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            raise

    async def search(self, query: str, n_results: int = 3) -> List[Dict]:
        """Search with improved error handling and logging"""
        if not query.strip():
            return []
            
        try:
            query_embedding = self.embedder.generate_embedding(query).tolist()
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            response = []
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            ):
                response.append({
                    "content": doc,
                    "metadata": meta or {},
                    "score": 1 - dist,
                    "page": meta.get("page", "N/A") if meta else "N/A",
                    "chapter": meta.get("chapter", "N/A") if meta else "N/A"
                })
            
            logger.info(f"🔍 Found {len(response)} results for query: {query}")
            return response
        except Exception as e:
            logger.error(f"Search failed for query '{query}': {e}")
            return []