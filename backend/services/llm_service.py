import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self, use_gemini: bool = True):
        self.use_gemini = use_gemini
        
        if self.use_gemini:
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            print("Initialized with Google Gemini")
        else:
            try:
                from langchain.chat_models import ChatOpenAI
                self.model = ChatOpenAI(
                    temperature=0.7,
                    openai_api_key=os.getenv("OPENAI_API_KEY"),
                    model_name="gpt-3.5-turbo"
                )
                print("Initialized with OpenAI GPT")
            except ImportError:
                raise ImportError("OpenAI dependencies not installed. Use Gemini instead.")

    def _generate_with_gemini(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return f"Error generating response: {str(e)}"

    def _generate_with_openai(self, prompt: str) -> str:
        try:
            from langchain.prompts import PromptTemplate
            from langchain.chains import LLMChain
            
            prompt_template = PromptTemplate(
                input_variables=["prompt"],
                template="{prompt}"
            )
            chain = LLMChain(llm=self.model, prompt=prompt_template)
            response = chain.run(prompt=prompt)
            return response
        except Exception as e:
            print(f"OpenAI generation error: {e}")
            return f"Error generating response: {str(e)}"

    def generate_response(self, prompt: str) -> str:
        if self.use_gemini:
            return self._generate_with_gemini(prompt)
        else:
            return self._generate_with_openai(prompt)

    def generate_revision_schedule(self, weak_areas: List[Dict], study_time: int = 60, days: int = 7) -> Dict:
        weak_areas_text = "\n".join([
            f"- {area.get('topic', 'Unknown')}: Confidence {area.get('confidence_score', 0):.2f}, "
            f"Difficulty: {area.get('difficulty_level', 'intermediate')}"
            for area in weak_areas
        ])
        
        prompt = f"""
        Create a personalized {days}-day revision schedule for a student with these weak areas:
        {weak_areas_text}

        The student can study for {study_time} minutes per day.

        Guidelines:
        - Prioritize topics with low confidence scores
        - Balance difficulty levels across days
        - Use different study methods
        - Allocate reasonable time for each topic

        Return the schedule as plain valid JSON. Do not use any special characters or markdown like *, _, or `.

        JSON Format:
        {{
            "schedule": [
                {{
                    "day": 1,
                    "date": "2024-01-15",
                    "topics": [
                        {{
                            "topic": "Topic Name",
                            "time_allocated": 30,
                            "study_method": "Practice problems",
                            "priority": "high",
                            "resources": ["textbook chapter 5", "online exercises"]
                        }}
                    ]
                }}
            ],
            "priorities": ["Topic1", "Topic2", "Topic3"],
            "study_methods": {{
                "Topic1": "Visual learning with diagrams",
                "Topic2": "Practice problems and examples"
            }},
            "total_study_time": {study_time * days}
        }}
        """
        
        try:
            response = self.generate_response(prompt)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                return json.loads(response[json_start:json_end])
            else:
                return self._create_fallback_schedule(weak_areas, study_time, days)
        except Exception as e:
            print(f"Error generating schedule: {e}")
            return self._create_fallback_schedule(weak_areas, study_time, days)

    def _create_fallback_schedule(self, weak_areas: List[Dict], study_time: int, days: int) -> Dict:
        schedule = []
        base_date = datetime.now()
        sorted_areas = sorted(weak_areas, key=lambda x: x.get('confidence_score', 0))
        
        for day in range(days):
            day_topics = []
            remaining_time = study_time
            topic_index = day % len(sorted_areas) if sorted_areas else 0
            
            while remaining_time > 0 and sorted_areas:
                topic = sorted_areas[topic_index % len(sorted_areas)]
                time_for_topic = min(remaining_time, 45)
                
                day_topics.append({
                    "topic": topic.get('topic', 'Unknown Topic'),
                    "time_allocated": time_for_topic,
                    "study_method": self._get_study_method(topic.get('difficulty_level', 'intermediate')),
                    "priority": "high" if topic.get('confidence_score', 0) < 0.5 else "medium",
                    "resources": ["textbook", "online resources"]
                })
                
                remaining_time -= time_for_topic
                topic_index += 1
            
            schedule.append({
                "day": day + 1,
                "date": (base_date + timedelta(days=day)).strftime("%Y-%m-%d"),
                "topics": day_topics
            })

        return {
            "schedule": schedule,
            "priorities": [area.get('topic', 'Unknown') for area in sorted_areas[:3]],
            "study_methods": {
                area.get('topic', 'Unknown'): self._get_study_method(area.get('difficulty_level', 'intermediate')) for area in sorted_areas
            },
            "total_study_time": study_time * days
        }

    def _get_study_method(self, difficulty_level: str) -> str:
        methods = {
            "beginner": "Read basics and do simple exercises",
            "intermediate": "Practice problems and review examples",
            "advanced": "Solve complex problems and analyze solutions"
        }
        return methods.get(difficulty_level, "Practice and review")

    def explain_concept(self, topic: str, context: str = "", difficulty: str = "intermediate", learning_style: str = "visual") -> str:
        prompt = f"""
        Explain the concept "{topic}" at a {difficulty} level for a {learning_style} learner.

        Additional context: {context}

        Guidelines:
        - Use plain English
        - Do not use markdown symbols like *, _,# or backticks
        - Make it easy to understand and beginner-friendly
        - Avoid technical jargon
        - Structure explanation clearly with definition, key points, examples, common mistakes, and study tips
        - Keep it concise, under 200 words
        """
        return self.generate_response(prompt)

    def analyze_weak_areas(self, test_results: Dict) -> List[Dict]:
        prompt = f"""
        Analyze the following test results to identify weak areas.

        Score: {test_results.get('score', 0)}/{test_results.get('total', 0)}
        Subject: {test_results.get('subject', 'Unknown')}
        Topic: {test_results.get('topic', 'Unknown')}
        Incorrect Topics: {test_results.get('incorrect_topics', [])}
        Parsing Confidence: {test_results.get('parsing_confidence', 0)}

        Return plain valid JSON (no markdown/special characters). For each weak area, include:
        - topic
        - confidence_score (0.0 to 1.0)
        - difficulty_level
        - focus_areas
        - study_approach

        JSON Format:
        [
            {{
                "topic": "Sample",
                "confidence_score": 0.3,
                "difficulty_level": "intermediate",
                "focus_areas": ["concept1"],
                "study_approach": "Revise basics"
            }}
        ]
        """
        try:
            response = self.generate_response(prompt)
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start != -1 and json_end != -1:
                return json.loads(response[json_start:json_end])
            else:
                return self._create_fallback_analysis(test_results)
        except Exception as e:
            print(f"Error analyzing weak areas: {e}")
            return self._create_fallback_analysis(test_results)

    def _create_fallback_analysis(self, test_results: Dict) -> List[Dict]:
        weak_areas = []
        score = test_results.get('score', 0)
        total = test_results.get('total', 1)
        confidence = score / total if total > 0 else 0

        if confidence < 0.7:
            weak_areas.append({
                "topic": test_results.get('topic', 'General Study'),
                "confidence_score": round(confidence, 2),
                "difficulty_level": "intermediate",
                "focus_areas": test_results.get('incorrect_topics', [])[:3],
                "study_approach": "Review fundamentals and practice"
            })

        for incorrect in test_results.get('incorrect_topics', [])[:3]:
            if incorrect and len(incorrect.strip()) > 2:
                weak_areas.append({
                    "topic": incorrect.strip(),
                    "confidence_score": 0.2,
                    "difficulty_level": "intermediate",
                    "focus_areas": [incorrect.strip()],
                    "study_approach": "Focus on understanding basics"
                })

        return weak_areas

    def generate_practice_questions(self, topic: str, difficulty: str = "intermediate", num_questions: int = 5) -> List[Dict]:
        prompt = f"""
        Generate {num_questions} multiple-choice practice questions for the topic "{topic}" at a {difficulty} level.

        For each question, include:
        - question
        - 4 options (A, B, C, D)
        - correct answer
        - short explanation

        Output only valid plain JSON without special characters or markdown.
        """
        try:
            response = self.generate_response(prompt)
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start != -1 and json_end != -1:
                return json.loads(response[json_start:json_end])
            else:
                return []
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []

    def summarize_content(self, content: str, max_length: int = 200) -> str:
        prompt = f"""
        Summarize this educational content in under {max_length} words.

        Use plain English. Avoid special characters or formatting. Focus only on important concepts and key ideas.

        Content:
        {content[:2000]}

        Summary:
        """
        return self.generate_response(prompt)

    def check_answer(self, question: str, student_answer: str, correct_answer: str) -> Dict:
        prompt = f"""
        Question: {question}
        Student Answer: {student_answer}
        Correct Answer: {correct_answer}

        Give feedback in this format:
        {{
            "is_correct": true/false,
            "feedback": "Simple feedback",
            "correct_explanation": "Explanation",
            "improvement_hints": ["hint1", "hint2"]
        }}

        Use only valid JSON. No special characters or markdown.
        """
        try:
            response = self.generate_response(prompt)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                return json.loads(response[json_start:json_end])
            else:
                return {
                    "is_correct": student_answer.strip().lower() == correct_answer.strip().lower(),
                    "feedback": "Unable to parse response",
                    "correct_explanation": f"The correct answer is {correct_answer}.",
                    "improvement_hints": ["Review the topic", "Try similar problems"]
                }
        except Exception as e:
            print(f"Error checking answer: {e}")
            return {"error": f"Failed to check answer: {str(e)}"}
    def search_content(self, query: str, topic: Optional[str] = "", difficulty: str = "intermediate") -> str:
     prompt = f"""
    Search for and explain the following query: "{query}" related to the topic "{topic}" at a {difficulty} level.

    Instructions:
    - Provide a simple, clear explanation or summary for the query
    - Only return relevant and useful content (definitions, key points, short examples)
    - Avoid any special characters or markdown formatting
    - Response must be easy to understand and not too technical

    Query: {query}

    Response:
    """
     return self.generate_response(prompt)