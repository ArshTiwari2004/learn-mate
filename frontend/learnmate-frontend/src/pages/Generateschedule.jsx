import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const GenerateSchedule = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [formData, setFormData] = useState({
    studentId: 'student_123',
    examDate: '',
    dailyHours: 4,
    difficultyLevel: 'intermediate',
    learningStyle: 'visual',
    focusAreas: []
  });
  const [schedule, setSchedule] = useState(null);

  const focusAreaOptions = [
    'Math', 'Physics', 'Chemistry', 'Biology', 
    'History', 'Literature', 'Computer Science'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleFocusAreaChange = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data } = await makeRequest('/generate-schedule', 'POST', {
      student_id: formData.studentId,
      exam_date: formData.examDate,
      daily_study_hours: formData.dailyHours,
      difficulty_level: formData.difficultyLevel,
      learning_style: formData.learningStyle,
      focus_areas: formData.focusAreas
    });

    if (data) {
      setSchedule(data);
    }
  };

  const downloadSchedule = () => {
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study_schedule_${formData.studentId}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Generate Study Schedule</h1>
        <p className="text-gray-600">Create a personalized study schedule based on your preferences and goals.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Schedule Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  name="dailyHours"
                  value={formData.dailyHours}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Style
                </label>
                <select
                  name="learningStyle"
                  value={formData.learningStyle}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Areas (Optional)
                </label>
                <div className="space-y-2">
                  {focusAreaOptions.map(area => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.focusAreas.includes(area)}
                        onChange={() => handleFocusAreaChange(area)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : '📅 Generate Schedule'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading && <LoadingSpinner text="Creating your personalized study schedule..." />}

          {schedule && (
            <div className="space-y-6">
              {/* Schedule Overview */}
              {schedule.schedule_overview && (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">📊 Schedule Overview</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {schedule.schedule_overview.total_days || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Days</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {schedule.schedule_overview.total_hours || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {schedule.schedule_overview.topics_count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Topics</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Schedule */}
              {schedule.structured_schedule?.schedule && (
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">📅 Daily Schedule</h2>
                    <button
                      onClick={downloadSchedule}
                      className="btn-secondary text-sm"
                    >
                      📥 Download JSON
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {schedule.structured_schedule.schedule.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <div 
                          className="p-4 bg-gray-50 rounded-t-lg cursor-pointer"
                          onClick={() => {
                            const content = document.getElementById(`day-${index}`);
                            content.classList.toggle('hidden');
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">
                              📅 Day {day.day} - {day.day_name} ({day.date})
                            </h3>
                            <span className="text-sm text-gray-600">
                              Total: {day.total_time || 0} minutes
                            </span>
                          </div>
                        </div>
                        
                        <div id={`day-${index}`} className="p-4 space-y-3">
                          {day.topics?.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="border-l-4 border-blue-400 pl-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium">{session.topic}</h4>
                                  <p className="text-sm text-gray-600">
                                    Method: {session.study_method}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">
                                    {session.time_allocated} min
                                  </div>
                                  <div className="text-sm text-gray-600">Time</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg">
                                    {session.priority === 'high' && '🔴'}
                                    {session.priority === 'medium' && '🟡'}
                                    {session.priority === 'low' && '🟢'}
                                  </div>
                                  <div className="text-sm text-gray-600 capitalize">
                                    {session.priority} Priority
                                  </div>
                                </div>
                              </div>
                              {session.goals && session.goals.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-gray-700">Goals: </span>
                                  <span className="text-sm text-gray-600">
                                    {session.goals.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateSchedule;