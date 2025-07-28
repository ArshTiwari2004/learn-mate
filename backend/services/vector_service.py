# Vector DB operations 
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class VectorService:
    def __init__(self, collection_name: str = "educational_content"):
        """Initialize ChromaDB client and embedding model"""
        self.persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get or create collection
        self.collection_name = collection_name
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        
        print(f"Vector service initialized with collection: {self.collection_name}")
        print(f"Current collection size: {self.collection.count()}")
    
    def add_educational_content(self, content: str, metadata: Dict, content_id: Optional[str] = None) -> str:
        """Add educational content to vector database"""
        try:
            if not content.strip():
                raise ValueError("Content cannot be empty")
            
            # Generate unique ID if not provided
            if not content_id:
                content_id = str(uuid.uuid4())
            
            # Create embedding
            embedding = self.embedding_model.encode([content])[0].tolist()
            
            # Prepare metadata
            processed_metadata = {
                **metadata,
                "content_id": content_id,
                "timestamp": datetime.now().isoformat(),
                "content_length": len(content)
            }
            
            # Add to collection
            self.collection.add(
                embeddings=[embedding],
                documents=[content],
                metadatas=[processed_metadata],
                ids=[content_id]
            )
            
            print(f"Added content with ID: {content_id}")
            return content_id
            
        except Exception as e:
            print(f"Error adding content: {e}")
            raise e
    
    def add_multiple_contents(self, contents: List[Dict]) -> List[str]:
        """Add multiple contents in batch"""
        content_ids = []
        embeddings = []
        documents = []
        metadatas = []
        ids = []
        
        for item in contents:
            content = item.get("content", "")
            metadata = item.get("metadata", {})
            content_id = item.get("content_id", str(uuid.uuid4()))
            
            if not content.strip():
                continue
            
            # Create embedding
            embedding = self.embedding_model.encode([content])[0].tolist()
            embeddings.append(embedding)
            documents.append(content)
            
            # Prepare metadata
            processed_metadata = {
                **metadata,
                "content_id": content_id,
                "timestamp": datetime.now().isoformat(),
                "content_length": len(content)
            }
            metadatas.append(processed_metadata)
            ids.append(content_id)
            content_ids.append(content_id)
        
        if embeddings:
            self.collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"Added {len(embeddings)} contents in batch")
        
        return content_ids
    
    def search_similar_content(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict]:
        """Search for similar educational content"""
        try:
            if not query.strip():
                return []
            
            # Create query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Prepare query parameters
            query_params = {
                "query_embeddings": [query_embedding],
                "n_results": min(n_results, 100),  # Limit to reasonable number
                "include": ["documents", "metadatas", "distances"]
            }
            
            # Add filter if provided
            if filter_metadata:
                query_params["where"] = filter_metadata
            
            # Query the collection
            results = self.collection.query(**query_params)
            
            # Format results
            formatted_results = []
            if results and results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    similarity_score = 1 - results['distances'][0][i]  # Convert distance to similarity
                    
                    formatted_results.append({
                        "content": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i],
                        "similarity_score": round(similarity_score, 4),
                        "content_id": results['metadatas'][0][i].get('content_id', f'unknown_{i}')
                    })
            
            # Sort by similarity score (highest first)
            formatted_results.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return formatted_results
            
        except Exception as e:
            print(f"Error searching content: {e}")
            return []
    
    def search_by_topic(self, topic: str, n_results: int = 5) -> List[Dict]:
        """Search content by topic"""
        return self.search_similar_content(
            query=topic,
            n_results=n_results,
            filter_metadata={"topic": topic}
        )
    
    def get_content_by_id(self, content_id: str) -> Optional[Dict]:
        """Get specific content by ID"""
        try:
            results = self.collection.get(
                ids=[content_id],
                include=["documents", "metadatas"]
            )
            
            if results and results['documents']:
                return {
                    "content": results['documents'][0],
                    "metadata": results['metadatas'][0],
                    "content_id": content_id
                }
            
            return None
            
        except Exception as e:
            print(f"Error getting content by ID: {e}")
            return None
    
    def delete_content(self, content_id: str) -> bool:
        """Delete content by ID"""
        try:
            self.collection.delete(ids=[content_id])
            print(f"Deleted content with ID: {content_id}")
            return True
        except Exception as e:
            print(f"Error deleting content: {e}")
            return False
    
    def get_collection_stats(self) -> Dict:
        """Get collection statistics"""
        try:
            count = self.collection.count()
            
            # Get sample of metadata to analyze topics
            sample_results = self.collection.get(
                limit=min(100, count),
                include=["metadatas"]
            )
            
            topics = {}
            subjects = {}
            difficulty_levels = {}
            
            if sample_results and sample_results['metadatas']:
                for metadata in sample_results['metadatas']:
                    # Count topics
                    topic = metadata.get('topic', 'Unknown')
                    topics[topic] = topics.get(topic, 0) + 1
                    
                    # Count subjects
                    subject = metadata.get('subject', 'Unknown')
                    subjects[subject] = subjects.get(subject, 0) + 1
                    
                    # Count difficulty levels
                    difficulty = metadata.get('difficulty_level', 'Unknown')
                    difficulty_levels[difficulty] = difficulty_levels.get(difficulty, 0) + 1
            
            return {
                "total_documents": count,
                "topics": topics,
                "subjects": subjects,
                "difficulty_levels": difficulty_levels,
                "collection_name": self.collection_name
            }
            
        except Exception as e:
            print(f"Error getting collection stats: {e}")
            return {"error": str(e)}
    
    def populate_sample_content(self):
        """Populate database with sample educational content"""
        sample_contents = [
            {
                "content": "Bernoulli's principle states that an increase in the speed of a fluid occurs simultaneously with a decrease in pressure or a decrease in the fluid's potential energy. This principle is fundamental in fluid dynamics and explains how airplanes generate lift. The principle can be derived from the conservation of energy and is expressed mathematically as P + ½ρv² + ρgh = constant, where P is pressure, ρ is fluid density, v is velocity, g is gravitational acceleration, and h is height.",
                "metadata": {
                    "title": "Bernoulli's Principle",
                    "subject": "Physics", 
                    "topic": "Fluid Dynamics", 
                    "difficulty_level": "intermediate",
                    "tags": ["physics", "fluids", "pressure", "velocity"]
                }
            },
            {
                "content": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar. The chemical equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This process occurs in two main stages: the light-dependent reactions (occur in thylakoids) and the light-independent reactions or Calvin cycle (occur in the stroma). Chlorophyll is the primary pigment that captures light energy.",
                "metadata": {
                    "title": "Photosynthesis Process",
                    "subject": "Biology", 
                    "topic": "Plant Biology", 
                    "difficulty_level": "beginner",
                    "tags": ["biology", "plants", "photosynthesis", "energy"]
                }
            },
            {
                "content": "The derivative of a function measures the rate of change of the function with respect to its variable. For a function f(x) = x², the derivative f'(x) = 2x represents the slope of the tangent line at any point x. The derivative can be found using the limit definition: f'(x) = lim(h→0) [f(x+h) - f(x)]/h. Common derivative rules include the power rule, product rule, quotient rule, and chain rule.",
                "metadata": {
                    "title": "Introduction to Derivatives",
                    "subject": "Mathematics", 
                    "topic": "Calculus", 
                    "difficulty_level": "intermediate",
                    "tags": ["mathematics", "calculus", "derivatives", "limits"]
                }
            },
            {
                "content": "Shakespeare's Romeo and Juliet is a tragedy about two young star-crossed lovers from feuding families in Verona. The play explores themes of love, fate, family conflict, and the consequences of hatred. Key characters include Romeo Montague, Juliet Capulet, Friar Lawrence, Mercutio, and Tybalt. The play's famous balcony scene in Act 2 contains some of the most quoted lines in English literature.",
                "metadata": {
                    "title": "Romeo and Juliet Overview",
                    "subject": "Literature", 
                    "topic": "Shakespeare", 
                    "difficulty_level": "intermediate",
                    "tags": ["literature", "shakespeare", "tragedy", "love"]
                }
            },
            {
                "content": "Python is a high-level, interpreted programming language known for its clear syntax and readability. Variables in Python are created by assignment and don't need explicit declaration. Common data types include integers (int), floating-point numbers (float), strings (str), lists, dictionaries, and tuples. Python uses indentation to define code blocks instead of braces.",
                "metadata": {
                    "title": "Python Programming Basics",
                    "subject": "Computer Science", 
                    "topic": "Programming", 
                    "difficulty_level": "beginner",
                    "tags": ["programming", "python", "variables", "data types"]
                }
            }
        ]
        
        # Check if content already exists
        current_count = self.collection.count()
        if current_count >= len(sample_contents):
            print(f"Sample content already exists ({current_count} documents)")
            return
        
        # Add sample content
        added_ids = self.add_multiple_contents(sample_contents)
        print(f"Added {len(added_ids)} sample contents to the database")
        
        return added_ids