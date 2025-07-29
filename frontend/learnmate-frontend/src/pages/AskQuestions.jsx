import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const AskQuestions = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [question, setQuestion] = useState('');
  const [studentId, setStudentId] = useState('student_123');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const { data } = await makeRequest('/ask-question', 'POST', {
      query: question,
      student_id: studentId,
      difficulty_level: difficulty,
      learning_style: learningStyle
    });

    if (data) {
      setResult(data);
      setHistory(prev => [...prev, {
        question,
        answer: data.answer,
        timestamp: new Date().toLocaleString()
      }]);
      setQuestion('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">❓ Ask Questions</h1>
        <p className="text-gray-600">Get instant answers to your study questions with AI-powered explanations.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to learn about?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="e.g., Explain Bernoulli's principle with examples"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
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
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="input-field"
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : '🧠 Get Answer'}
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner text="Thinking..." />}

      {result && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">💡 Answer</h2>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed">{result.answer}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {result.confidence?.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {result.response_time?.toFixed(2) || 'N/A'}s
              </div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📚 Sources</h3>
              <div className="space-y-3">
                {result.sources.slice(0, 3).map((source, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Source {index + 1}</h4>
                      <span className="text-sm text-blue-600 font-medium">
                        Similarity: {source.similarity_score?.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {source.content?.substring(0, 300)}
                      {source.content?.length > 300 && '...'}
                    </p>
                    {source.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(source.metadata).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📝 Recent Questions</h2>
          <div className="space-y-4">
            {history.slice(-5).reverse().map((qa, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    Q: {qa.question.substring(0, 100)}
                    {qa.question.length > 100 && '...'}
                  </h4>
                  <span className="text-xs text-gray-500">{qa.timestamp}</span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Answer:</strong> {qa.answer.substring(0, 200)}
                  {qa.answer.length > 200 && '...'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AskQuestions;