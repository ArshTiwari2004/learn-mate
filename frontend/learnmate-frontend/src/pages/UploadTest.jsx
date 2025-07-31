import React, { useState } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', studentId);

      const response = await fetch(`${API_URL}/upload-test-result`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload test');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred while uploading the test');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <DocumentArrowUpIcon className="h-8 w-8 mr-2 text-blue-600" />
          Upload Test Result
        </h1>
        <p className="text-gray-600">
          Upload your test result PDF to get personalized analysis and recommendations.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <input
              id="student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your student ID"
              required
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
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !file}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isLoading || !file) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Test Result'
            )}
          </button>
        </form>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Test Results Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.test_result.score}/{results.test_result.total_questions}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((results.test_result.score / results.test_result.total_questions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.test_result.subject || 'General'}
                </div>
                <div className="text-sm text-gray-600">Subject</div>
              </div>
            </div>
          </div>

          {/* Weak Areas Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Weak Areas Analysis</h2>
            {results.weak_areas && results.weak_areas.length > 0 ? (
              <div className="space-y-4">
                {results.weak_areas.map((area, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {area.topic || 'Unknown Topic'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Confidence Score: </span>
                          <span className={`font-semibold ${
                            area.confidence_score < 0.3 ? 'text-red-600' :
                            area.confidence_score < 0.6 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {area.confidence_score?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Difficulty: </span>
                          <span className="font-semibold text-orange-600">
                            {area.difficulty_level || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div>
                        {area.study_approach && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Recommended Approach: </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {area.study_approach}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {area.focus_areas && area.focus_areas.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">Focus Areas:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {area.focus_areas.map((focus, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No weak areas identified.</p>
            )}
          </div>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h2>
              <ul className="space-y-2">
                {results.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{rec}</span>
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

export default UploadTest;