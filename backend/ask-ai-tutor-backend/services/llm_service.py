import google.generativeai as genai
from core.config import settings
from typing import List, Dict

genai.configure(api_key=settings.GOOGLE_API_KEY)

class LLMService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def generate_answer(self, query: str, context: List[Dict]) -> str:
        context_str = "\n".join(
            f"Source {i+1} (Page {ctx['page']}, Chapter {ctx['chapter']}):\n{ctx['content']}"
            for i, ctx in enumerate(context)
        )
        
        prompt = f"""
You are an expert tutor helping a student. Answer the question using ONLY the provided context.
If the answer isn't in the context, say you don't know. Be precise and include page references.

QUESTION: {query}

CONTEXT:
{context_str}

ANSWER FORMAT:
- Start with a direct answer
- Explain key concepts
- Mention source pages
- Keep it under 200 words
"""

      
        response = await self.model.generate_content_async(
            [{"role": "user", "parts": [prompt]}]
        )

        return response.text
