import fitz  # PyMuPDF
from typing import Dict, List
import re
from pathlib import Path
from core.models import PDFUpload
import json
import logging

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.processed_dir = self.data_dir / "processed"
        self.processed_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_chapters(self, pdf_path: str) -> Dict[str, Dict[int, str]]:
        """Extract text by chapter and page with improved parsing"""
        doc = fitz.open(pdf_path)
        chapters = {}
        current_chapter = "Introduction"
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            
            chapter_match = re.search(r'(?:CHAPTER|Chapter|Unit)\s*[\d\.]+\s*[-:]?\s*(.+)', text, re.IGNORECASE)
            if chapter_match:
                current_chapter = chapter_match.group(1).strip()
                logger.info(f"Found chapter: {current_chapter}")
            
            if current_chapter not in chapters:
                chapters[current_chapter] = {}
            
          
            clean_text = self._clean_page_text(text)
            chapters[current_chapter][page_num + 1] = clean_text
        
        return chapters
    
    def _clean_page_text(self, text: str) -> str:
        """Remove headers, footers, and excessive whitespace"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def process_and_save(self, pdf_filename: str) -> PDFUpload:
        """Process PDF and save chunks as JSON"""
        pdf_path = self.data_dir / pdf_filename
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file {pdf_filename} not found")
        
        chapters = self.extract_chapters(str(pdf_path))
        output_data = {
            "filename": pdf_filename,
            "subject": "physics",
            "chapters": list(chapters.keys()),
            "pages": sum(len(pages) for pages in chapters.values())
        }
        
        
        output_file = self.processed_dir / f"{pdf_path.stem}.json"
        with open(output_file, "w") as f:
            json.dump({
                "metadata": output_data,
                "chapters": chapters
            }, f, indent=2)
        
        logger.info(f"Processed PDF saved to {output_file}")
        return PDFUpload(**output_data)