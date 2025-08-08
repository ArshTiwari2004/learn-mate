from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_service import PDFProcessor
from services.vector_service import VectorService
from core.models import PDFUpload
import os
import json
import logging

router = APIRouter()
pdf_processor = PDFProcessor()
vector_service = VectorService()

logger = logging.getLogger("upload_pdf")

@router.post("/upload-pdf", response_model=PDFUpload)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_location = f"./data/{file.filename}"
        logger.info(f"Saving uploaded PDF to: {file_location}")

        # Save file
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())

        logger.info(f"File saved. Starting PDF processing...")

        # Process PDF
        result = pdf_processor.process_and_save(file.filename)
        logger.info(f"PDF processed: {result}")

        # Load processed data
        processed_path = f"./data/processed/{os.path.splitext(file.filename)[0]}.json"
        if not os.path.exists(processed_path):
            raise HTTPException(status_code=500, detail=f"Processed file not found: {processed_path}")

        with open(processed_path, "r") as f:
            data = json.load(f)

        logger.info(f"Loaded processed JSON with chapters: {list(data['chapters'].keys())}")

        total_docs = 0

        for chapter, pages in data["chapters"].items():
            for page_num, text in pages.items():
                metadata = {
                    "source": file.filename,
                    "chapter": chapter,
                    "page": page_num,
                    "subject": "physics"
                }

            
                doc_id = await vector_service.add_document(text=text, metadata=metadata)
                total_docs += 1
                logger.debug(f"Added doc ID {doc_id} (chapter: {chapter}, page: {page_num})")

        logger.info(f"✅ Added {total_docs} documents to vector DB.")
        return result

    except Exception as e:
        logger.exception("Error during PDF upload and vector insertion")
        raise HTTPException(status_code=500, detail=str(e))
