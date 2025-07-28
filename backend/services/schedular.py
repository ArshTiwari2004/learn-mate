# Revision scheduling 
from typing import List, Dict
from datetime import datetime, timedelta
import json

class SchedulerService:
    def __init__(self):
        pass
    
    def create_study_schedule(self, weak_areas: List[Dict], study_time_per_day: int = 60, days: int = 7) -> Dict:
        """Create a structured study schedule"""
        
        # Sort topics by priority (lowest confidence first)
        sorted_topics = sorted(weak_areas, key=lambda x: x.get('confidence_score', 0))
        
        schedule = []
        base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for day in range(days):
            current_date = base_date + timedelta(days=day)
            daily_schedule = {
                "day": day + 1,
                "date": current_date.strftime("%Y-%m-%d"),
                "day_name": current_date.strftime("%A"),
                "topics": [],
                "total_time": 0
            }
            
            remaining_time = study_time_per_day
            topic_index = 0
            
            while remaining_time > 15 and topic_index < len(sorted_topics):  # Minimum 15 min per topic
                topic = sorted_topics[topic_index]
                
                # Calculate time allocation based on priority and remaining time
                if topic.get('confidence_score', 0) < 0.3:
                    time_needed = min(45, remaining_time)  # High priority: up to 45 min
                elif topic.get('confidence_score', 0) < 0.6:
                    time_needed = min(30, remaining_time)  # Medium priority: up to 30 min
                else:
                    time_needed = min(20, remaining_time)  # Low priority: up to 20 min
                
                if time_needed >= 15:  # Only add if we can allocate meaningful time
                    study_session = {
                        "topic": topic.get('topic', 'Unknown'),
                        "time_allocated": time_needed,
                        "confidence_score": topic.get('confidence_score', 0),
                        "difficulty_level": topic.get('difficulty_level', 'intermediate'),
                        "study_method": self._get_study_method(topic, day),
                        "priority": self._get_priority_level(topic.get('confidence_score', 0)),
                        "resources": self._get_resources(topic),
                        "goals": self._get_session_goals(topic, time_needed)
                    }
                    
                    daily_schedule["topics"].append(study_session)
                    daily_schedule["total_time"] += time_needed
                    remaining_time -= time_needed
                
                topic_index += 1
                
                # If we've gone through all topics and still have time, start over
                if topic_index >= len(sorted_topics) and remaining_time >= 15:
                    topic_index = 0
            
            schedule.append(daily_schedule)
        
        return {
            "schedule": schedule,
            "summary": self._generate_schedule_summary(schedule, weak_areas),
            "study_tips": self._get_general_study_tips(),
            "total_planned_time": sum(day["total_time"] for day in schedule)
        }
    
    def _get_study_method(self, topic: Dict, day: int) -> str:
        """Get appropriate study method based on topic and day"""
        difficulty = topic.get('difficulty_level', 'intermediate')
        confidence = topic.get('confidence_score', 0)
        
        methods = {
            'beginner': [
                'Read basics and take notes',
                'Watch educational videos',
                'Create concept maps',
                'Practice simple exercises',
                'Review with flashcards'
            ],
            'intermediate': [
                'Solve practice problems',
                'Work through examples',
                'Create summary sheets',
                'Discuss with study group',
                'Take practice quizzes'
            ],
            'advanced': [
                'Solve complex problems',
                'Analyze case studies',
                'Create teaching materials',
                'Research additional sources',
                'Practice exam questions'
            ]
        }
        
        method_list = methods.get(difficulty, methods['intermediate'])
        return method_list[day % len(method_list)]
    
    def _get_priority_level(self, confidence_score: float) -> str:
        """Determine priority level based on confidence score"""
        if confidence_score < 0.3:
            return "high"
        elif confidence_score < 0.6:
            return "medium"
        else:
            return "low"
    
    def _get_resources(self, topic: Dict) -> List[str]:
        """Get recommended resources for a topic"""
        base_resources = ["textbook", "online tutorials"]
        
        difficulty = topic.get('difficulty_level', 'intermediate')
        topic_name = topic.get('topic', '').lower()
        
        # Add specific resources based on subject area
        if any(word in topic_name for word in ['math', 'calculus', 'algebra', 'geometry']):
            base_resources.extend(["Khan Academy", "practice worksheets", "graphing calculator"])
        elif any(word in topic_name for word in ['physics', 'chemistry', 'science']):
            base_resources.extend(["lab experiments", "simulation software", "scientific calculator"])
        elif any(word in topic_name for word in ['biology', 'anatomy']):
            base_resources.extend(["diagrams", "lab specimens", "educational apps"])
        elif any(word in topic_name for word in ['literature', 'english', 'writing']):
            base_resources.extend(["sample essays", "grammar guides", "vocabulary lists"])
        elif any(word in topic_name for word in ['history', 'social']):
            base_resources.extend(["timeline charts", "historical documents", "documentaries"])
        
        return base_resources[:4]  # Limit to 4 resources
    
    def _get_session_goals(self, topic: Dict, time_allocated: int) -> List[str]:
        """Set specific goals for each study session"""
        goals = []
        confidence = topic.get('confidence_score', 0)
        topic_name = topic.get('topic', 'this topic')
        
        if confidence < 0.3:
            goals = [
                f"Understand basic concepts of {topic_name}",
                "Identify key terms and definitions",
                "Complete foundational exercises"
            ]
        elif confidence < 0.6:
            goals = [
                f"Practice intermediate problems in {topic_name}",
                "Review and fix common mistakes",
                "Strengthen understanding of core principles"
            ]
        else:
            goals = [
                f"Master advanced concepts in {topic_name}",
                "Solve challenging problems",
                "Prepare for assessment"
            ]
        
        # Adjust goals based on time allocated
        if time_allocated <= 20:
            return goals[:1]
        elif time_allocated <= 35:
            return goals[:2]
        else:
            return goals
    
    def _generate_schedule_summary(self, schedule: List[Dict], weak_areas: List[Dict]) -> Dict:
        """Generate a summary of the study schedule"""
        total_days = len(schedule)
        total_time = sum(day["total_time"] for day in schedule)
        unique_topics = set()
        
        priority_distribution = {"high": 0, "medium": 0, "low": 0}
        
        for day in schedule:
            for session in day["topics"]:
                unique_topics.add(session["topic"])
                priority_distribution[session["priority"]] += 1
        
        return {
            "total_days": total_days,
            "total_study_time": total_time,
            "average_daily_time": total_time // total_days if total_days > 0 else 0,
            "topics_covered": len(unique_topics),
            "priority_distribution": priority_distribution,
            "weakest_areas": [area["topic"] for area in sorted(weak_areas, key=lambda x: x.get('confidence_score', 0))[:3]]
        }
    
    def _get_general_study_tips(self) -> List[str]:
        """Get general study tips"""
        return [
            "Take regular breaks every 25-30 minutes (Pomodoro Technique)",
            "Create a distraction-free study environment",
            "Review previously studied material before starting new topics",
            "Use active recall techniques instead of passive reading",
            "Teach concepts to someone else to reinforce understanding",
            "Get adequate sleep and maintain a healthy diet",
            "Track your progress and celebrate small wins"
        ]
    
    def update_schedule_progress(self, schedule: Dict, completed_sessions: List[Dict]) -> Dict:
        """Update schedule with completed sessions"""
        updated_schedule = schedule.copy()
        
        for completed in completed_sessions:
            day = completed.get('day')
            topic = completed.get('topic')
            status = completed.get('status', 'completed')  # completed, partial, skipped
            
            if day and topic:
                for schedule_day in updated_schedule['schedule']:
                    if schedule_day['day'] == day:
                        for session in schedule_day['topics']:
                            if session['topic'] == topic:
                                session['status'] = status
                                session['completed_at'] = datetime.now().isoformat()
                                if 'notes' in completed:
                                    session['notes'] = completed['notes']
        
        return updated_schedule
    
    def get_next_study_session(self, schedule: Dict) -> Dict:
        """Get the next recommended study session"""
        current_date = datetime.now().date()
        
        for day in schedule['schedule']:
            schedule_date = datetime.strptime(day['date'], "%Y-%m-%d").date()
            
            if schedule_date >= current_date:
                for session in day['topics']:
                    if session.get('status', 'pending') == 'pending':
                        return {
                            "next_session": session,
                            "day_info": {
                                "day": day['day'],
                                "date": day['date'],
                                "day_name": day['day_name']
                            },
                            "recommendation": f"Focus on {session['topic']} for {session['time_allocated']} minutes using {session['study_method']}"
                        }
        
        return {"message": "No pending study sessions found"}
    
    def adjust_schedule_difficulty(self, schedule: Dict, feedback: Dict) -> Dict:
        """Adjust schedule based on student feedback"""
        # feedback = {"too_easy": ["topic1"], "too_hard": ["topic2"], "good": ["topic3"]}
        
        updated_schedule = schedule.copy()
        
        for day in updated_schedule['schedule']:
            for session in day['topics']:
                topic = session['topic']
                
                if topic in feedback.get('too_easy', []):
                    # Increase difficulty and reduce time
                    session['time_allocated'] = max(15, session['time_allocated'] - 10)
                    session['study_method'] = self._upgrade_study_method(session['study_method'])
                
                elif topic in feedback.get('too_hard', []):
                    # Decrease difficulty and increase time
                    session['time_allocated'] = min(60, session['time_allocated'] + 10)
                    session['study_method'] = self._simplify_study_method(session['study_method'])
        
        return updated_schedule
    
    def _upgrade_study_method(self, current_method: str) -> str:
        """Upgrade study method to more advanced"""
        upgrades = {
            "Read basics and take notes": "Solve practice problems",
            "Watch educational videos": "Work through examples",
            "Practice simple exercises": "Solve complex problems",
            "Review with flashcards": "Take practice quizzes"
        }
        return upgrades.get(current_method, current_method)
    
    def _simplify_study_method(self, current_method: str) -> str:
        """Simplify study method to more basic"""
        simplifications = {
            "Solve complex problems": "Practice simple exercises",
            "Work through examples": "Watch educational videos",
            "Take practice quizzes": "Review with flashcards",
            "Analyze case studies": "Read basics and take notes"
        }
        return simplifications.get(current_method, current_method)