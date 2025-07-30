import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const GenerateSchedule = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [formData, setFormData] = useState({
    examDate: '',
    dailyHours: 4,
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

    if (!formData.examDate) {
      setError("Exam date is required");
      return;
    }

    const today = new Date();
    const examDate = new Date(formData.examDate);
    const days = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      setError("Please choose a future exam date");
      return;
    }

    const payload = {
      weak_areas: formData.focusAreas,
      study_time: formData.dailyHours,
      days: days
    };

    try {
      const { data, error: apiError } = await makeRequest('/generate-schedule', 'POST', payload);
      if (apiError || !data.schedule) {
        setError(apiError?.message || 'Failed to generate schedule');
        return;
      }

      setSchedule(data.schedule);
      setError(null);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📅 Generate Study Schedule</h1>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Exam Date</label>
          <input
            type="date"
            name="examDate"
            value={formData.examDate}
            onChange={handleInputChange}
            required
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Daily Study Hours</label>
          <input
            type="number"
            name="dailyHours"
            min="1"
            max="12"
            value={formData.dailyHours}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Focus Areas</label>
          <div className="grid grid-cols-2 gap-2">
            {focusAreaOptions.map(area => (
              <label key={area} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.focusAreas.includes(area)}
                  onChange={() => handleFocusAreaChange(area)}
                  className="accent-blue-600"
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Generate Schedule'}
        </button>
      </form>

      {schedule && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">📆 Your Schedule</h2>
          {schedule.map((day, idx) => (
            <div key={idx} className="border p-3 bg-white rounded shadow-sm">
              <h3 className="font-bold text-blue-700 mb-1">Day {idx + 1}</h3>
              {Array.isArray(day.topics) && day.topics.length > 0 ? (
                day.topics.map((topic, i) => (
                  <div key={i} className="text-sm text-gray-700 ml-4">
                    🔹 <strong>{topic.topic}</strong> ({topic.study_method}) – {topic.time_allocated} min
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 ml-4">No topics assigned</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateSchedule;
