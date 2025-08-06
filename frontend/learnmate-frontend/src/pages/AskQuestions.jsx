import React, { useState } from 'react';
import axios from 'axios';

const AskQuestions = () => {
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [learningStyle, setLearningStyle] = useState('visual');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    console.log('Submitting query:', {
      query,
      student_id: studentId,
      difficulty,
      learning_style: learningStyle,
    });

    try {
      const res = await axios.post('http://localhost:8001/api/v1/ask', {
        query,
        student_id: studentId,
        difficulty,
        learning_style: learningStyle,
      });

      console.log('Response from backend:', res.data);
      setResponse(res.data);
    } catch (err) {
      console.error('Full error object:', err);

      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail;

        console.error(`Error from backend ${status}:`, detail);

        if (status === 404) {
          setError('No relevant content found for your query.');
        } else if (status === 422) {
          setError('Invalid input. Please fill all fields correctly.');
        } else if (status === 500) {
          setError('Server error: ' + detail);
        } else {
          setError('Unexpected error: ' + detail);
        }
      } else {
        setError('Network error or server is unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Ask AI Tutor</h2>

        <div>
          <label className="block font-medium">Query:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Learning Style:</label>
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="kinesthetic">Kinesthetic</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Ask'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      {/* Success response */}
      {response && (
        <div className="mt-6 p-4 bg-green-100 rounded text-green-800 space-y-2">
          <div><strong>Question:</strong> {response.question}</div>
          <div><strong>Answer:</strong> {response.answer}</div>

          {response.sources?.length > 0 && (
            <div>
              <strong>Sources:</strong>
              <ul className="list-disc list-inside">
                {response.sources.map((src, idx) => (
                  <li key={idx}>
                    <strong>Chapter:</strong> {src.chapter}, Page: {src.page}, Confidence: {src.confidence.toFixed(2)}<br />
                    <em>{src.excerpt}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuestions;
