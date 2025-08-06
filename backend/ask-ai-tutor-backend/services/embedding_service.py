from sentence_transformers import SentenceTransformer
from core.config import settings

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    def generate_embedding(self, text: str):
        return self.model.encode(text)
    
    def batch_embed(self, texts: list):
        return self.model.encode(texts)