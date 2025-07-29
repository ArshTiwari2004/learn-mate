import React, { useState, useEffect } from 'react';
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
    subject: '',
    topic: '',
    difficulty: 'intermediate',
    questionType: 'mixed',
    numQuestions: 5
  });
  const [practiceMode, setPracticeMode] = useState('generate'); // 'generate' or 'practice'

  const questionTypes = {
    'multiple_choice': '🔘 Multiple Choice',
    'true_false': '✓/✗ True/False',
    'short_answer': '📝 Short Answer',
    'mixed': '🎯 Mixed Types'
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setGenerationParams(prev => ({ ...prev, [name]: value }));
  };

  const generateQuestions = async (e) => {
    e.preventDefault();
    if (!generationParams.subject || !generationParams.topic) {
      setError('Please fill in subject and topic');
      return;
    }

    const { data } = await makeRequest('/generate-questions', 'POST', {
      subject: generationParams.subject,
      topic: generationParams.topic,
      difficulty_level: generationParams.difficulty,
      question_type: generationParams.questionType === 'mixed' ? null : generationParams.questionType,
      num_questions: parseInt(generationParams.numQuestions)
    });

    if (data && data.questions) {
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setScore(null);
      setPracticeMode('practice');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!userAnswers[currentQuestion.id]) {
      setError('Please select or enter an answer');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correct_answer) correctCount++;
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct_answer.toString()) correctCount++;
      } else if (question.type === 'short_answer') {
        // Simple comparison - in real app, you'd want more sophisticated matching
        const correct = question.correct_answer.toLowerCase().trim();
        const user = userAnswer.toLowerCase().trim();
        if (correct === user || correct.includes(user) || user.includes(correct)) {
          correctCount++;
        }
      }
    });

    setScore({
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    });
    setShowResults(true);
  };

  const resetPractice = () => {
    setPracticeMode('generate');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(null);
  };

  const renderQuestion = (question) => {
    const userAnswer = userAnswers[question.id] || '';

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {question.question}
          </h3>
          <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full ml-4">
            {questionTypes[question.type]?.replace(/[🔘✓✗📝🎯] /, '') || question.type}
          </span>
        </div>

        {question.type === 'multiple_choice' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-2">
            {['true', 'false'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 capitalize">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'short_answer' && (
          <div>
            <textarea
              value={userAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="input-field min-h-24"
              placeholder="Enter your answer here..."
              rows={3}
            />
          </div>
        )}

        {showResults && (
          <div className={`p-4 rounded-lg border ${
            (() => {
              if (question.type === 'multiple_choice') {
                return userAnswer === question.correct_answer 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50';
              } else if (question.type === 'true_false') {
                return userAnswer === question.correct_answer.toString()
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50';
              } else {
                const correct = question.correct_answer.toLowerCase().trim();
                const user = userAnswer.toLowerCase().trim();
                return (correct === user || correct.includes(user) || user.includes(correct))
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50';
              }
            })()
          }`}>
            <p className="font-medium text-gray-900 mb-2">Correct Answer:</p>
            <p className="text-gray-700">{question.correct_answer}</p>
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Practice Questions</h1>
        <p className="text-gray-600">Generate and practice questions to test your knowledge.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {practiceMode === 'generate' && (
        <div className="card mb-8">
          <form onSubmit={generateQuestions}>
            <h2 className="text-xl font-semibold mb-4">Generate Practice Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={generationParams.subject}
                  onChange={handleParamChange}
                  className="input-field"
                  placeholder="e.g., Physics, Mathematics"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={generationParams.topic}
                  onChange={handleParamChange}
                  className="input-field"
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
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select
                  name="questionType"
                  value={generationParams.questionType}
                  onChange={handleParamChange}
                  className="input-field"
                >
                  {Object.entries(questionTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <select
                  name="numQuestions"
                  value={generationParams.numQuestions}
                  onChange={handleParamChange}
                  className="input-field"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generate Questions'}
            </button>
          </form>
        </div>
      )}

      {practiceMode === 'practice' && questions.length > 0 && !showResults && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={resetPractice}
                className="btn-secondary text-sm"
              >
                New Questions
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {renderQuestion(questions[currentQuestionIndex])}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary"
            >
              Previous
            </button>
            
            <button
              onClick={submitAnswer}
              className="btn-primary"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className="card">
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
                  className="btn-primary"
                >
                  Try New Questions
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="btn-secondary"
                >
                  Review Answers
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">📝 Answer Review</h3>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                  </div>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeQuestion;