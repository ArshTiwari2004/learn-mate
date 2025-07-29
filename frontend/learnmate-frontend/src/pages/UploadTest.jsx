import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const UploadTest = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('student_123');
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    const { data } = await makeRequest(
      '/upload-test-result',
      'POST',
      { student_id: studentId },
      { file }
    );

    if (data) {
      setResults(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Upload Test Result</h1>
        <p className="text-gray-600">Upload your test result PDF to get personalized analysis and recommendations.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input-field"
              placeholder="Enter your student ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Result PDF
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF files only</p>
                {file && (
                  <p className="text-sm text-green-600 mt-2">Selected: {file.name}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Test Result'}
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner text="Analyzing your test result..." />}

      {results && (
        <div className="space-y-6">
          {/* Test Results Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.test_result.score}/{results.test_result.total_questions}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.test_result.percentage?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {results.parsing_confidence?.toFixed(2) || 0}
                </div>
                <div className="text-sm text-gray-600">Parsing Confidence</div>
              </div>
            </div>
          </div>

          {/* Weak Areas */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🎯 Identified Weak Areas</h2>
            {results.weak_areas && results.weak_areas.length > 0 ? (
              <div className="space-y-4">
                {results.weak_areas.map((area, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      📚 {area.topic || 'Unknown Topic'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                          <span className="ml-2 text-blue-600 font-semibold">
                            {area.confidence_score?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                          <span className="ml-2 text-orange-600 font-semibold">
                            {area.difficulty_level || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div>
                        {area.focus_areas && area.focus_areas.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Focus Areas:</span>
                            <ul className="mt-1 text-sm text-gray-600">
                              {area.focus_areas.map((focus, idx) => (
                                <li key={idx} className="ml-2">• {focus}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700">Study Approach:</span>
                          <p className="mt-1 text-sm text-gray-600">
                            {area.study_approach || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No weak areas identified.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTest;
