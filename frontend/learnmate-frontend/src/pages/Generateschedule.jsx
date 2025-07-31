import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const StudyScheduleGenerator = () => {
  const [weakAreas, setWeakAreas] = useState([
    { topic: '', confidence_score: 0.5, difficulty_level: 'intermediate' }
  ]);
  const [studyTime, setStudyTime] = useState(60);
  const [days, setDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleAddWeakArea = () => {
    setWeakAreas([...weakAreas, { topic: '', confidence_score: 0.5, difficulty_level: 'intermediate' }]);
  };

  const handleRemoveWeakArea = (index) => {
    if (weakAreas.length > 1) {
      const updatedAreas = [...weakAreas];
      updatedAreas.splice(index, 1);
      setWeakAreas(updatedAreas);
    }
  };

  const handleAreaChange = (index, field, value) => {
    const updatedAreas = [...weakAreas];
    updatedAreas[index][field] = field === 'confidence_score' ? parseFloat(value) : value;
    setWeakAreas(updatedAreas);
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const validAreas = weakAreas.filter(area => area.topic.trim() !== '');
      
      if (validAreas.length === 0) {
        throw new Error('Please add at least one weak area');
      }

      if (studyTime <= 0 || days <= 0) {
        throw new Error('Study time and days must be positive numbers');
      }

      const response = await fetch(`${API_URL}/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: "temp_student",
          exam_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daily_study_hours: Math.ceil(studyTime / 60),
          difficulty_level: "intermediate",
          learning_style: "visual",
          focus_areas: validAreas.map(area => area.topic),
          weak_areas: validAreas,
          study_time: studyTime,
          days: days
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            const errors = errorData.detail.map(e => `${e.loc.join('.')} - ${e.msg}`).join('\n');
            throw new Error(`Validation errors:\n${errors}`);
          }
          throw new Error(errorData.detail);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSchedule(data.schedule);
    } catch (err) {
      setError(err.message || 'Network error - could not connect to server');
      console.error('Error generating schedule:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <AcademicCapIcon className="h-8 w-8 mr-2 text-blue-600" />
        Study Schedule Generator
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Weak Areas</h2>
        
        {weakAreas.map((area, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={area.topic}
                onChange={(e) => handleAreaChange(index, 'topic', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g. Calculus"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confidence (0-1)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={area.confidence_score}
                onChange={(e) => handleAreaChange(index, 'confidence_score', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={area.difficulty_level}
                onChange={(e) => handleAreaChange(index, 'difficulty_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="easy">Easy</option>
                <option value="intermediate">Intermediate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="flex items-end">
              {weakAreas.length > 1 && (
                <button
                  onClick={() => handleRemoveWeakArea(index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        
        <button
          onClick={handleAddWeakArea}
          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add Another Weak Area
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
            Study Time
          </h2>
          <div className="flex items-center">
            <input
              type="range"
              min="30"
              max="180"
              step="15"
              value={studyTime}
              onChange={(e) => setStudyTime(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-lg font-medium text-gray-700 min-w-[60px]">
              {studyTime} min
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
            Schedule Duration
          </h2>
          <div className="flex items-center">
            <input
              type="range"
              min="3"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-lg font-medium text-gray-700 min-w-[30px]">
              {days} days
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={generateSchedule}
          disabled={isGenerating}
          className={`px-6 py-3 rounded-md text-white font-medium ${isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200`}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Study Schedule'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      )}

      {schedule && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2" />
              Your Personalized Study Schedule
            </h2>
            <p className="text-blue-100 mt-1">
              {days} days • {studyTime} minutes/day • Total: {studyTime * days} minutes
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {schedule.schedule.map((daySchedule) => (
              <div key={daySchedule.day} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Day {daySchedule.day}</h3>
                  <span className="text-sm text-gray-500">{daySchedule.date}</span>
                </div>

                <div className="space-y-3">
                  {daySchedule.topics.map((topic, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {topic.time_allocated} minutes • {topic.study_method}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          topic.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          topic.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {topic.priority} priority
                        </span>
                      </div>
                      
                      {topic.resources && topic.resources.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500">Resources:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                            {topic.resources.map((resource, i) => (
                              <li key={i}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Study Priorities</h3>
                <div className="flex flex-wrap gap-2">
                  {schedule.priorities?.map((priority, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Recommended Methods</h3>
                <div className="space-y-2">
                  {schedule.study_methods && Object.entries(schedule.study_methods).map(([topic, method]) => (
                    <div key={topic} className="text-sm">
                      <span className="font-medium text-gray-700">{topic}:</span> {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyScheduleGenerator;