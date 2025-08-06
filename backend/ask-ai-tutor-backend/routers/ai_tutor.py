from fastapi import APIRouter, HTTPException
from services.llm_service import LLMService
from services.vector_service import VectorService
from core.models import TutorRequest, TutorResponse
import traceback

router = APIRouter()
llm = LLMService()
vector_db = VectorService()

@router.post("/ask", response_model=TutorResponse)
async def ask_question(request: TutorRequest):
    print("\n🔍 [ask_question] Incoming request:")
    print("  ➤ query:", request.query)
    print("  ➤ student_id:", request.student_id)
    print("  ➤ difficulty:", request.difficulty)
    print("  ➤ learning_style:", request.learning_style)
    print("  ➤ subject:", request.subject)

    try:
        print("🔍 [ask_question] Calling Vector DB search...")
        context = await vector_db.search(request.query)
        print("📚 [ask_question] Vector DB search result:")
        print("  ➤", context)

        if not context:
            print("⚠️  [ask_question] No relevant context found. Raising 404.")
            raise HTTPException(status_code=404, detail="No relevant content found")

        answer = await llm.generate_answer(request.query, context)
        print("🧠 [ask_question] Generated answer:")
        print("  ➤", answer)

        response = {
            "question": request.query,
            "answer": answer,
            "sources": [
                {
                    "chapter": ctx.get("chapter"),
                    "page": ctx.get("page"),
                    "excerpt": ctx.get("content", "")[:200] + "...",
                    "confidence": ctx.get("score", 0.0)
                }
                for ctx in context
            ],
            "confidence": sum(ctx.get("score", 0.0) for ctx in context) / max(len(context), 1),
            "suggested_followups": []
        }

        print("✅ [ask_question] Final response:")
        print(response)
        return response

    except HTTPException as http_exc:
        print(f"🚫 [ask_question] HTTPException {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print("🔥 [ask_question] Unhandled Exception:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")


