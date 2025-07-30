import React, { useState, useEffect } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('questionHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('questionHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    try {
      // Clear previous result while loading new one
      setResult(null);
      
      // Add timestamp before making the request
      const requestStartTime = Date.now();
      
      const response = await makeRequest('/ask-question', 'POST', {
        query: question,
        student_id: studentId,
        difficulty_level: difficulty,
        learning_style: learningStyle
      });

      if (response && response.data) {
        // Calculate response time
        const responseTime = (Date.now() - requestStartTime) / 1000;
        
        // Add response time to the result
        const resultWithTime = {
          ...response.data,
          response_time: responseTime
        };
        
        setResult(resultWithTime);
        
        // Add to history
        const newHistoryItem = {
          question,
          answer: response.data.answer,
          timestamp: new Date().toLocaleString(),
          confidence: response.data.confidence
        };
        
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
        setQuestion('');
      }
    } catch (err) {
      setError('Failed to get answer. Please try again.');
      console.error('API Error:', err);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('questionHistory');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ask Questions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get instant answers to your study questions with AI-powered explanations and personalized learning support.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="card bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg mb-10 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              What would you like to learn about?
            </label>
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input-field w-full h-32 resize-none text-lg p-4 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., Explain Bernoulli's principle with examples"
              />
              {question && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input-field w-full pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field w-full appearance-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Style
              </label>
              <div className="relative">
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="input-field w-full appearance-none"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary w-full py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Get Answer
              </span>
            )}
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner text="Analyzing your question..." />}

      {result && (
        <div className={`card mb-10 rounded-2xl overflow-hidden border-2 ${result.confidence > 0.3 ? 'border-green-200' : 'border-yellow-200'} shadow-lg`}>
          <div className={`p-6 ${result.confidence > 0.3 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Answer</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed">{result.answer}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Confidence</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className={`h-2.5 rounded-full ${result.confidence > 0.7 ? 'bg-green-500' : result.confidence > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-lg font-bold">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Response Time</div>
                <div className="text-lg font-bold text-gray-900">
                  {result.response_time?.toFixed(2) || 'N/A'}s
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Sources Found</div>
                <div className="text-lg font-bold text-gray-900">
                  {result.sources?.length || 0}
                </div>
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Supporting Sources
                </h3>
                <div className="space-y-4">
                  {result.sources.slice(0, 3).map((source, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">
                          Source {index + 1} • {source.metadata?.title || 'Untitled'}
                        </h4>
                        <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded">
                          Similarity: {(source.similarity_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        {source.content?.substring(0, 200)}
                        {source.content?.length > 200 && '...'}
                      </p>
                      {source.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(source.metadata).map(([key, value]) => (
                            key !== 'title' && (
                              <span key={key} className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">
                                {key}: {value}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Questions
          </h2>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear History
            </button>
          )}
        </div>
        
        <div className="p-6">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, isExpanded ? history.length : 3).map((qa, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      <span className="text-blue-600">Q:</span> {qa.question}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{qa.timestamp}</span>
                  </div>
                  <div className="text-gray-700 text-sm flex items-start">
                    <span className="text-green-600 font-medium mr-2">A:</span>
                    <p>{qa.answer}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded">
                      Confidence: {(qa.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              
              {history.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 flex items-center"
                >
                  {isExpanded ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show All ({history.length}) Questions
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
              <p className="text-gray-500">Your question history will appear here once you start asking questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskQuestions;