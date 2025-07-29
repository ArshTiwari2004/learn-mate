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
    difficulty: '',
    sourceType: '',
    tags: ''
  });
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load search history from memory on component mount
    const savedHistory = getSearchHistory();
    setSearchHistory(savedHistory);
  }, []);

  const getSearchHistory = () => {
    // In a real app, this would come from localStorage or API
    // For now, we'll use a simple in-memory storage
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
    
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
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
      limit: 20,
      ...Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value.trim() !== '')
      )
    };

    const { data } = await makeRequest('/search-content', 'POST', searchParams);

    if (data) {
      setSearchResults(data.results || []);
      setHasSearched(true);
      saveToSearchHistory(searchQuery, data.results?.length || 0);
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      topic: '',
      difficulty: '',
      sourceType: '',
      tags: ''
    });
  };

  const useHistorySearch = (historyItem) => {
    setSearchQuery(historyItem.query);
    setFilters(historyItem.filters);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Search Content</h1>
        <p className="text-gray-600">Search through the educational content library.</p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Search Form */}
      <div className="card mb-8">
        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-1"
                placeholder="Enter keywords, concepts, or questions..."
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6"
              >
                {loading ? <LoadingSpinner size="sm" /> : '🔍 Search'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => {
                const filtersDiv = document.getElementById('advanced-filters');
                filtersDiv.classList.toggle('hidden');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
            >
              🔧 Advanced Filters
            </button>
            
            <div id="advanced-filters" className="hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    className="input-field"
                    placeholder="e.g., Physics"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={filters.topic}
                    onChange={handleFilterChange}
                    className="input-field"
                    placeholder="e.g., Thermodynamics"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={filters.difficulty}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                  <select
                    name="sourceType"
                    value={filters.sourceType}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="textbook">Textbook</option>
                    <option value="notes">Notes</option>
                    <option value="practice_problems">Practice Problems</option>
                    <option value="reference">Reference</option>
                    <option value="article">Article</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={filters.tags}
                    onChange={handleFilterChange}
                    className="input-field"
                    placeholder="e.g., equations, examples (comma-separated)"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Search History Sidebar */}
        <div className="lg:col-span-1">
          {searchHistory.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">🕒 Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => useHistorySearch(item)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.resultCount} results • {formatDate(item.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {hasSearched && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results ({searchResults.length})
              </h2>
              {searchResults.length > 0 && (
                <div className="text-sm text-gray-600">
                  Found {searchResults.length} content{searchResults.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {searchResults.length === 0 && hasSearched && !loading && (
            <div className="card text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more content.
              </p>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="space-y-4">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContent(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getSourceTypeIcon(item.source_type)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {highlightText(item.title, searchQuery)}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty_level)}`}>
                      {item.difficulty_level}
                    </span>
                    <div className="text-xs text-gray-500">
                      Score: {(item.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-gray-700 line-clamp-3">
                    {highlightText(item.content_preview || item.content, searchQuery)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    {item.subject && (
                      <span className="flex items-center space-x-1">
                        <span>📚</span>
                        <span>{item.subject}</span>
                      </span>
                    )}
                    {item.topic && (
                      <span className="flex items-center space-x-1">
                        <span>🏷️</span>
                        <span>{item.topic}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {item.created_at && (
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getSourceTypeIcon(selectedContent.source_type)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedContent.title}
                  </h2>
                  <div className="flex items-center space-x-4 mt-1">
                    {selectedContent.subject && (
                      <span className="text-sm text-gray-600">
                        📚 {selectedContent.subject}
                      </span>
                    )}
                    {selectedContent.topic && (
                      <span className="text-sm text-gray-600">
                        🏷️ {selectedContent.topic}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(selectedContent.difficulty_level)}`}>
                      {selectedContent.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedContent.content}
                </div>
              </div>
              
              {selectedContent.tags && selectedContent.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedContent.created_at && (
                <div className="mt-4 text-sm text-gray-500">
                  Added: {formatDate(selectedContent.created_at)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchContent;