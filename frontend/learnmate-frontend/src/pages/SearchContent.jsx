import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const SearchContent = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: 'intermediate',
    sourceType: '',
    tags: ''
  });
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedHistory = getSearchHistory();
    setSearchHistory(savedHistory);
  }, []);

  const getSearchHistory = () => {
    return [];
  };

  const saveToSearchHistory = (query, resultCount) => {
    const newEntry = {
      id: Date.now(),
      query,
      resultCount,
      timestamp: new Date().toISOString(),
      filters: { ...filters }
    };
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 9)];
    setSearchHistory(updatedHistory);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    const searchParams = {
      query: searchQuery,
      topic: filters.topic,
      difficulty: filters.difficulty
    };

    try {
      const { data } = await makeRequest('/search-content', 'GET', searchParams);
      if (data) {
        setSearchResults([{
          id: Date.now(),
          title: searchQuery,
          content: data.result,
          difficulty_level: filters.difficulty || "intermediate",
          topic: filters.topic || "",
          subject: filters.subject || "",
          source_type: "manual_entry",
          tags: filters.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          created_at: new Date().toISOString(),
          score: 0.95
        }]);
        setHasSearched(true);
        saveToSearchHistory(searchQuery, 1);
      }
    } catch (err) {
      setError('Failed to fetch content');
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      topic: '',
      difficulty: 'intermediate',
      sourceType: '',
      tags: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceTypeIcon = (sourceType) => {
    const icons = {
      'textbook': '📚',
      'notes': '📝',
      'practice_problems': '🧮',
      'reference': '📖',
      'article': '📄',
      'tutorial': '🎓',
      'manual_entry': '✍️'
    };
    return icons[sourceType] || '📄';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Search Content</h1>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter topic or concept..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="topic"
            value={filters.topic}
            onChange={handleFilterChange}
            className="border px-3 py-2 rounded"
            placeholder="Topic (optional)"
          />
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="border px-3 py-2 rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Search'}
        </button>
      </form>

      {hasSearched && searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map(result => (
            <div key={result.id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getSourceTypeIcon(result.source_type)} {result.title}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(result.difficulty_level)}`}>
                  {result.difficulty_level}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{result.content}</p>
              <div className="text-sm text-gray-500 mt-2">
                {result.topic && <>🏷️ {result.topic} • </>}
                {result.subject && <>📚 {result.subject} • </>}
                {formatDate(result.created_at)}
              </div>
              {result.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasSearched && searchResults.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12">
          <p>😕 No results found. Try changing your query.</p>
        </div>
      )}
    </div>
  );
};

export default SearchContent;
