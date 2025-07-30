# PDF processing 
import PyPDF2
import pdfplumber
import re
from typing import Dict, List, Optional
import pandas as pd
from datetime import datetime

class PDFParser:
    def __init__(self):
        self.test_patterns = {
            'score': [
                r"Score[:\s]+(\d+)[/\s]+(\d+)",
                r"Total[:\s]+(\d+)[/\s]+(\d+)",
                r"Result[:\s]+(\d+)[/\s]+(\d+)",
                r"Marks[:\s]+(\d+)[/\s]+(\d+)"
            ],
            'subject': [
                r"Subject[:\s]+([A-Za-z\s]+)",
                r"Course[:\s]+([A-Za-z\s]+)",
                r"Topic[:\s]+([A-Za-z\s]+)"
            ],
            'incorrect': [
                r"Incorrect[:\s]+(.+?)(?=\n|Correct|$)",
                r"Wrong[:\s]+(.+?)(?=\n|Right|$)",
                r"Failed[:\s]+(.+?)(?=\n|Passed|$)"
            ]
        }
    
    def extract_test_results(self, pdf_path: str) -> Dict:
        """Extract test results from PDF with multiple parsing strategies"""
        try:
            # Try pdfplumber first (better for complex layouts)
            text = self._extract_with_pdfplumber(pdf_path)
            if not text.strip():
                # Fallback to PyPDF2
                text = self._extract_with_pypdf2(pdf_path)
            
            if not text.strip():
                return {"error": "Could not extract text from PDF"}
            
            # Parse the extracted text
            results = self._parse_test_content(text)
            results['raw_text'] = text[:500]  # Store first 500 chars for debugging
            
            return results
        
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return {"error": f"Failed to parse PDF: {str(e)}"}
    
    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")
            return ""
    
    def _extract_with_pypdf2(self, pdf_path: str) -> str:
        """Extract text using PyPDF2 as fallback"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")
            return ""
    
    def _parse_test_content(self, text: str) -> Dict:
        """Parse text content to extract test results using multiple patterns"""
        results = {
            "score": 0,
            "total": 0,
            "subject": "Unknown",
            "topic": "General",
            "incorrect_topics": [],
            "parsing_confidence": 0.0
        }
        
        confidence_score = 0
        
        # Try to extract score
        for pattern in self.test_patterns['score']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    results["score"] = int(match.group(1))
                    results["total"] = int(match.group(2))
                    confidence_score += 0.4
                    break
                except (ValueError, IndexError):
                    continue
        
        # Try to extract subject/topic
        for pattern in self.test_patterns['subject']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                subject = match.group(1).strip()
                if subject and len(subject) > 2:
                    results["subject"] = subject
                    results["topic"] = subject
                    confidence_score += 0.3
                    break
        
        # Try to extract incorrect topics
        for pattern in self.test_patterns['incorrect']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                incorrect_text = match.group(1).strip()
                if incorrect_text:
                    # Split by common separators
                    topics = re.split(r'[,;|\n]+', incorrect_text)
                    results["incorrect_topics"] = [
                        topic.strip() for topic in topics 
                        if topic.strip() and len(topic.strip()) > 2
                    ][:10]  # Limit to 10 topics
                    confidence_score += 0.3
                    break
        
        # If no specific incorrect topics found, try to extract from general text
        if not results["incorrect_topics"]:
            results["incorrect_topics"] = self._extract_topics_from_text(text)
        
        results["parsing_confidence"] = confidence_score
        return results
    
    def _extract_topics_from_text(self, text: str) -> List[str]:
        """Extract potential topics from text using common educational keywords"""
        topics = []
        
        # Common academic topics/keywords
        topic_indicators = [
            r"(algebra|geometry|calculus|statistics|probability)",
            r"(physics|chemistry|biology|science)",
            r"(history|geography|literature|english)",
            r"(programming|coding|computer|software)",
            r"(economics|business|finance|accounting)"
        ]
        
        for pattern in topic_indicators:
            matches = re.findall(pattern, text, re.IGNORECASE)
            topics.extend([match.capitalize() for match in matches])
        
        # Remove duplicates and limit
        return list(set(topics))[:5]
    
    def extract_notes_content(self, pdf_path: str) -> str:
        """Extract educational content from PDF notes"""
        try:
            text = self._extract_with_pdfplumber(pdf_path)
            if not text.strip():
                text = self._extract_with_pypdf2(pdf_path)
            
            # Clean the text
            cleaned_text = self._clean_text(text)
            return cleaned_text
        
        except Exception as e:
            print(f"Error extracting notes: {e}")
            return ""
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove page numbers (simple pattern)
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        
        # Remove common PDF artifacts
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', '', text)
        
        return text.strip()
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks for better vector storage"""
        if not text:
            return []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks