import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def _init_(self, use_gemini: bool = True):
        """Initialize LLM service with Gemini or OpenAI"""
        self.use_gemini = use_gemini
        
        if self.use_gemini:
            # Configure Gemini
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')

            print("Initialized with Google Gemini")
        else:
            # Fallback to OpenAI (if you want to keep this option)
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
        """Generate response using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return f"Error generating response: {str(e)}"
    
    def _generate_with_openai(self, prompt: str) -> str:
        """Generate response using OpenAI (fallback)"""
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
        """Generate response using configured LLM"""
        if self.use_gemini:
            return self._generate_with_gemini(prompt)
        else:
            return self._generate_with_openai(prompt)
    
    def generate_revision_schedule(self, weak_areas: List[Dict], study_time: int = 60, days: int = 7) -> Dict:
        """Generate personalized revision schedule"""
        weak_areas_text = "\n".join([
            f"- {area.get('topic', 'Unknown')}: Confidence {area.get('confidence_score', 0):.2f}, "
            f"Difficulty: {area.get('difficulty_level', 'intermediate')}"
            for area in weak_areas
        ])
        
        prompt = f"""
        Create a personalized {days}-day revision schedule for a student with these weak areas:
        {weak_areas_text}
        
        Student can study for {study_time} minutes per day.
        
        Requirements:
        1. Prioritize topics with lowest confidence scores
        2. Balance difficulty levels throughout the week
        3. Include specific study methods for each topic
        4. Allocate realistic time per topic
        5. Provide variety in study activities
        
        Return a JSON response with this exact structure:
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
            # Try to extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                parsed_response = json.loads(json_str)
                return parsed_response
            else:
                # Fallback: create a basic schedule
                return self._create_fallback_schedule(weak_areas, study_time, days)
                
        except json.JSONDecodeError:
            print("Failed to parse JSON response, creating fallback schedule")
            return self._create_fallback_schedule(weak_areas, study_time, days)
        except Exception as e:
            print(f"Error generating schedule: {e}")
            return {"error": f"Failed to generate schedule: {str(e)}"}
    
    def _create_fallback_schedule(self, weak_areas: List[Dict], study_time: int, days: int) -> Dict:
        """Create a basic fallback schedule if AI generation fails"""
        schedule = []
        base_date = datetime.now()
        
        # Sort weak areas by confidence score (lowest first)
        sorted_areas = sorted(weak_areas, key=lambda x: x.get('confidence_score', 0))
        
        for day in range(days):
            day_topics = []
            remaining_time = study_time
            topic_index = day % len(sorted_areas) if sorted_areas else 0
            
            while remaining_time > 0 and sorted_areas:
                topic = sorted_areas[topic_index % len(sorted_areas)]
                time_for_topic = min(remaining_time, 45)  # Max 45 min per topic
                
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
            "study_methods": {area.get('topic', 'Unknown'): self._get_study_method(area.get('difficulty_level', 'intermediate')) for area in sorted_areas},
            "total_study_time": study_time * days
        }
    
    def _get_study_method(self, difficulty_level: str) -> str:
        """Get appropriate study method based on difficulty"""
        methods = {
            "beginner": "Read basics and do simple exercises",
            "intermediate": "Practice problems and review examples",
            "advanced": "Solve complex problems and analyze solutions"
        }
        return methods.get(difficulty_level, "Practice and review")
    
    def explain_concept(self, topic: str, context: str = "", difficulty: str = "intermediate", learning_style: str = "visual") -> str:
        """Generate explanation for a concept"""
        prompt = f"""
        Explain the concept of "{topic}" at {difficulty} level for a {learning_style} learner.
        
        Additional Context: {context}
        
        Structure your explanation with:
        1. *Clear Definition*: What is {topic}?
        2. *Key Points*: Main concepts to understand
        3. *Examples*: Real-world applications or examples
        4. *Common Mistakes*: What students often get wrong
        5. *Study Tips*: How to master this concept
        
        Make it engaging and easy to understand. Use analogies if helpful.
        """
        
        response = self.generate_response(prompt)
        return response
    
    def analyze_weak_areas(self, test_results: Dict) -> List[Dict]:
        """Analyze test results to identify weak areas"""
        prompt = f"""
        Analyze these test results and identify weak areas for focused study:
        
        Test Results:
        - Score: {test_results.get('score', 0)}/{test_results.get('total', 0)}
        - Subject: {test_results.get('subject', 'Unknown')}
        - Topic: {test_results.get('topic', 'Unknown')}
        - Incorrect Topics: {test_results.get('incorrect_topics', [])}
        - Parsing Confidence: {test_results.get('parsing_confidence', 0)}
        
        For each weak area identified, provide:
        1. Topic name
        2. Confidence score (0.0 to 1.0, where 0 is weakest)
        3. Difficulty level (beginner/intermediate/advanced)
        4. Specific focus areas within the topic
        5. Recommended study approach
        
        Return as JSON array:
        [
            {{
                "topic": "Topic Name",
                "confidence_score": 0.3,
                "difficulty_level": "intermediate",
                "focus_areas": ["subtopic1", "subtopic2"],
                "study_approach": "Practice more problems"
            }}
        ]
        """
        
        try:
            response = self.generate_response(prompt)
            # Try to extract JSON
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                parsed_response = json.loads(json_str)
                return parsed_response
            else:
                # Fallback analysis
                return self._create_fallback_analysis(test_results)
                
        except json.JSONDecodeError:
            print("Failed to parse weak areas JSON, creating fallback")
            return self._create_fallback_analysis(test_results)
        except Exception as e:
            print(f"Error analyzing weak areas: {e}")
            return []
    
    def _create_fallback_analysis(self, test_results: Dict) -> List[Dict]:
        """Create fallback weak area analysis"""
        weak_areas = []
        
        # Calculate overall confidence based on score
        score = test_results.get('score', 0)
        total = test_results.get('total', 1)
        overall_confidence = score / total if total > 0 else 0
        
        # Add main topic as weak area if score is low
        if overall_confidence < 0.7:
            weak_areas.append({
                "topic": test_results.get('topic', 'General Study'),
                "confidence_score": round(overall_confidence, 2),
                "difficulty_level": "intermediate",
                "focus_areas": test_results.get('incorrect_topics', [])[:3],
                "study_approach": "Review fundamentals and practice"
            })
        
        # Add specific incorrect topics
        for incorrect_topic in test_results.get('incorrect_topics', [])[:3]:
            if incorrect_topic and len(incorrect_topic.strip()) > 2:
                weak_areas.append({
                    "topic": incorrect_topic.strip(),
                    "confidence_score": 0.2,  # Low confidence for incorrect topics
                    "difficulty_level": "intermediate",
                    "focus_areas": [incorrect_topic.strip()],
                    "study_approach": "Focus on understanding basics"
                })
        
        return weak_areas
    
    def generate_practice_questions(self, topic: str, difficulty: str = "intermediate", num_questions: int = 5) -> List[Dict]:
        """Generate practice questions for a topic"""
        prompt = f"""
        Generate {num_questions} practice questions for the topic "{topic}" at {difficulty} level.
        
        For each question, provide:
        1. Question text
        2. Multiple choice options (A, B, C, D)
        3. Correct answer
        4. Explanation of the correct answer
        
        Return as JSON array:
        [
            {{
                "question": "Question text here?",
                "options": {{
                    "A": "Option A",
                    "B": "Option B", 
                    "C": "Option C",
                    "D": "Option D"
                }},
                "correct_answer": "B",
                "explanation": "Explanation here"
            }}
        ]
        """
        
        try:
            response = self.generate_response(prompt)
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            else:
                return []
                
        except Exception as e:
            print(f"Error generating practice questions: {e}")
            return []
    
    def summarize_content(self, content: str, max_length: int = 200) -> str:
        """Summarize educational content"""
        prompt = f"""
        Summarize the following educational content in {max_length} words or less.
        Focus on the key concepts and main points.
        
        Content:
        {content[:2000]}  # Limit input length
        
        Summary:
        """
        
        response = self.generate_response(prompt)
        return response
    
    def check_answer(self, question: str, student_answer: str, correct_answer: str) -> Dict:
        """Check and provide feedback on student answer"""
        prompt = f"""
        Question: {question}
        Student Answer: {student_answer}
        Correct Answer: {correct_answer}
        
        Provide feedback:
        1. Is the student answer correct? (Yes/No)
        2. If incorrect, what's wrong?
        3. Explanation of the correct approach
        4. Hints for improvement
        
        Format as JSON:
        {{
            "is_correct": true/false,
            "feedback": "Detailed feedback",
            "correct_explanation": "Why the correct answer is right",
            "improvement_hints": ["hint1", "hint2"]
        }}
        """
        
        try:
            response = self.generate_response(prompt)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            else:
                return {
                    "is_correct": student_answer.lower().strip() == correct_answer.lower().strip(),
                    "feedback": "Unable to provide detailed feedback",
                    "correct_explanation": f"The correct answer is: {correct_answer}",
                    "improvement_hints": ["Review the topic", "Practice similar problems"]
                }
                
        except Exception as e:
            print(f"Error checking answer: {e}")
            return {"error": f"Failed to check answer: {str(e)}"}