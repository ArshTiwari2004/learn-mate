import asyncio
from services.pdf_service import PDFProcessor
from services.vector_service import VectorService
import os
import json

async def initialize_vector_db():
    pdf_path = "./data/leph101.pdf"
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at {pdf_path}")

    print("⚡ Initializing vector database...")
    
    # Process PDF
    pdf_processor = PDFProcessor()
    result = pdf_processor.process_and_save("leph101.pdf")
    print(f"✅ PDF processed: {result}")

    # Load processed data
    vector_service = VectorService()
    processed_path = f"./data/processed/leph101.json"
    if not os.path.exists(processed_path):
        raise FileNotFoundError(f"Processed file not found: {processed_path}")

    with open(processed_path, "r") as f:
        data = json.load(f)

    print(f"📖 Loading {len(data['chapters'])} chapters into vector DB...")
    
    total_docs = 0
    for chapter, pages in data["chapters"].items():
        for page_num, text in pages.items():
            metadata = {
                "source": "leph101.pdf",
                "chapter": chapter,
                "page": page_num,
                "subject": "physics"
            }
            await vector_service.add_document(text=text, metadata=metadata)
            total_docs += 1

    print(f"✅ Successfully loaded {total_docs} documents into vector DB")

if __name__ == "__main__":
    asyncio.run(initialize_vector_db())