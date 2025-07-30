import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const PracticeQuestion = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);
  const [generationParams, setGenerationParams] = useState({
    topic: '',
    difficulty: 'intermediate',
    numQuestions: 5
  });
  const [practiceMode, setPracticeMode] = useState('generate');

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setGenerationParams(prev => ({ ...prev, [name]: value }));
  };

  const generateQuestions = async (e) => {
    e.preventDefault();
    try {
      if (!generationParams.topic.trim()) {
        setError('Please fill in the topic');
        return;
      }

      const numQuestions = parseInt(generationParams.numQuestions);
      if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 10) {
        setError('Please select between 1-10 questions');
        return;
      }

      const params = new URLSearchParams({
        topic: generationParams.topic.trim(),
        difficulty: generationParams.difficulty,
        num_questions: numQuestions.toString()
      });

      const { data, error: apiError } = await makeRequest(
        `/generate-practice-questions?${params.toString()}`,
        'POST'
      );

      if (apiError) {
        setError(apiError.message || 'Failed to generate questions');
        return;
      }

      if (!data?.questions?.length) {
        setError('No questions were generated. Please try again.');
        return;
      }

      // Normalize data: add IDs
      const normalized = data.questions.map((q, index) => ({
        id: `q${index + 1}`,
        ...q
      }));

      setQuestions(normalized);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setScore(null);
      setPracticeMode('practice');
      setError(null);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleAnswerChange = (questionId, answerKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerKey
    }));
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!userAnswers[currentQuestion.id]) {
      setError('Please select an answer');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setError(null);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const correctCount = questions.reduce((count, question) => {
      return userAnswers[question.id] === question.answer ? count + 1 : count;
    }, 0);

    setScore({
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    });
    setShowResults(true);
    setError(null);
  };

  const resetPractice = () => {
    setPracticeMode('generate');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(null);
    setError(null);
  };

  const renderQuestion = (question) => {
    const userAnswer = userAnswers[question.id] || '';
    const isCorrect = userAnswer === question.answer;
    const showResultsClass = showResults ?
      (isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : '';

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {question.question}
          </h3>
        </div>

        <div className="space-y-2">
          {question.options && typeof question.options === 'object' ? (
            Object.entries(question.options).map(([key, option]) => (
              <label key={`${question.id}-${key}`} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={key}
                  checked={userAnswer === key}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  disabled={showResults}
                />
                <span className="text-gray-700">{key}. {option}</span>
              </label>
            ))
          ) : (
            <p className="text-red-500 text-sm">⚠️ Error: Options are not properly loaded</p>
          )}
        </div>

        {showResults && (
          <div className={`p-4 rounded-lg border ${showResultsClass}`}>
            <p className="font-medium text-gray-900 mb-1">Your Answer:</p>
            <p className={`text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {userAnswer || 'No answer selected'}
            </p>

            <p className="font-medium text-gray-900 mt-3 mb-1">Correct Answer:</p>
            <p className="text-sm text-gray-800">{question.answer}</p>

            {question.explanation && (
              <div className="mt-3">
                <p className="font-medium text-gray-900 mb-1">Explanation:</p>
                <p className="text-gray-700">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Practice Questions</h1>
        <p className="text-gray-600">Generate and practice multiple-choice questions to test your knowledge.</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {practiceMode === 'generate' ? (
        <div className="card mb-8 p-6 bg-white rounded-lg shadow">
          <form onSubmit={generateQuestions}>
            <h2 className="text-xl font-semibold mb-4">Generate Practice Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={generationParams.topic}
                  onChange={handleParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Thermodynamics, Calculus"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  name="difficulty"
                  value={generationParams.difficulty}
                  onChange={handleParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <select
                  name="numQuestions"
                  value={generationParams.numQuestions}
                  onChange={handleParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generate Questions'}
            </button>
          </form>
        </div>
      ) : questions.length > 0 && !showResults ? (
        <div className="card mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <button
              onClick={resetPractice}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              New Questions
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {renderQuestion(questions[currentQuestionIndex])}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={submitAnswer}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      ) : showResults && score ? (
        <div className="space-y-6">
          <div className="card p-6 bg-white rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Results</h2>
              <div className="flex justify-center items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{score.correct}/{score.total}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    score.percentage >= 80 ? 'text-green-600' :
                    score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {score.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                score.percentage >= 80 ? 'bg-green-100 text-green-800' :
                score.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {score.percentage >= 80 ? '🎉 Excellent!' :
                 score.percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={resetPractice}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try New Questions
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Review Answers
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">📝 Answer Review</h3>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={`review-${question.id}`} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                  </div>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PracticeQuestion;