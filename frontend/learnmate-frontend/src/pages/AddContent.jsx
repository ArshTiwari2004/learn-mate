import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const AddContent = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [uploadType, setUploadType] = useState('files');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'intermediate',
    sourceType: 'textbook',
    url: '',
    title: '',
    content: '',
    tags: ''
  });
  const [uploadResults, setUploadResults] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    const results = [];
    for (const file of files) {
      const { data, error: uploadError } = await makeRequest(
        '/add-content',
        'POST',
        {
          subject: formData.subject,
          topic: formData.topic,
          difficulty_level: formData.difficulty,
          source_type: formData.sourceType
        },
        { file }
      );

      results.push({
        filename: file.name,
        success: !!data,
        error: uploadError,
        data
      });
    }

    setUploadResults(results);
    setFiles([]);
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
      setError('Please enter a URL');
      return;
    }

    const { data } = await makeRequest('/add-content-url', 'POST', {
      url: formData.url,
      subject: formData.subject,
      topic: formData.topic,
      difficulty_level: formData.difficulty,
      source_type: formData.sourceType
    });

    if (data) {
      setUploadResults([{ success: true, data, type: 'url' }]);
      setFormData(prev => ({ ...prev, url: '' }));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Please fill in title and content');
      return;
    }

    const { data } = await makeRequest('/add-manual-content', 'POST', {
      title: formData.title,
      content: formData.content,
      subject: formData.subject,
      topic: formData.topic,
      difficulty_level: formData.difficulty,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      source_type: 'manual_entry'
    });

    if (data) {
      setUploadResults([{ success: true, data, type: 'manual' }]);
      setFormData(prev => ({ ...prev, title: '', content: '', tags: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Add Educational Content</h1>
        <p className="text-gray-600">Upload educational materials to expand the knowledge base.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Upload Type Selection */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Upload Method</h2>
        <div className="flex space-x-4">
          {[
            { key: 'files', label: '📄 Upload Files', desc: 'PDF, TXT, DOCX, MD files' },
            { key: 'url', label: '🌐 Add from URL', desc: 'Web articles, tutorials' },
            { key: 'manual', label: '✍️ Manual Entry', desc: 'Type content directly' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setUploadType(option.key)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                uploadType === option.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Common Fields */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Content Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Physics, Mathematics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Thermodynamics, Calculus"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
            <select
              name="sourceType"
              value={formData.sourceType}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="textbook">Textbook</option>
              <option value="notes">Notes</option>
              <option value="practice_problems">Practice Problems</option>
              <option value="reference">Reference</option>
              <option value="article">Article</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Method Specific Forms */}
      {uploadType === 'files' && (
        <div className="card mb-8">
          <form onSubmit={handleFileUpload}>
            <h2 className="text-xl font-semibold mb-4">📄 Upload Files</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Files
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.md"
                onChange={handleFileChange}
                className="input-field"
              />
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Selected files:</p>
                  <ul className="text-sm space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-gray-700">
                        📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Upload Files'}
            </button>
          </form>
        </div>
      )}

      {uploadType === 'url' && (
        <div className="card mb-8">
          <form onSubmit={handleUrlSubmit}>
            <h2 className="text-xl font-semibold mb-4">🌐 Add from URL</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com/article"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the URL of the educational content you want to add
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.url}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add from URL'}
            </button>
          </form>
        </div>
      )}

      {uploadType === 'manual' && (
        <div className="card mb-8">
          <form onSubmit={handleManualSubmit}>
            <h2 className="text-xl font-semibold mb-4">✍️ Manual Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter content title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="input-field min-h-48"
                  placeholder="Enter the educational content here..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., equations, examples, theory (comma-separated)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add relevant tags separated by commas
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              className="btn-primary mt-4"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add Content'}
            </button>
          </form>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                    <span className="font-medium">
                      {result.filename || result.type === 'url' ? 'URL Content' : 'Manual Content'}
                    </span>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      result.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                {result.error && (
                  <p className="text-red-600 text-sm mt-2">{result.error}</p>
                )}
                
                {result.success && result.data && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Content ID: {result.data.id}</p>
                    {result.data.title && <p>Title: {result.data.title}</p>}
                    {result.data.chunks_created && (
                      <p>Chunks created: {result.data.chunks_created}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setUploadResults([])}
            className="btn-secondary mt-4"
          >
            Clear Results
          </button>
        </div>
      )}
    </div>
  );
};

export default AddContent;