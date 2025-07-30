import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Analytics = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    const { data } = await makeRequest('/database-stats', 'GET', {
      time_range: timeRange
    });

    if (data) {
      setAnalyticsData(data);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (loading && !analyticsData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor usage and performance metrics.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {analyticsData && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsData.total_questions)}
                  </p>
                </div>
                <div className="text-3xl">❓</div>
              </div>
              {analyticsData.questions_change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(analyticsData.questions_change)}`}>
                  <span className="mr-1">{getChangeIcon(analyticsData.questions_change)}</span>
                  <span>{formatPercentage(Math.abs(analyticsData.questions_change))} vs previous period</span>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Content Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsData.total_content)}
                  </p>
                </div>
                <div className="text-3xl">📚</div>
              </div>
              {analyticsData.content_change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(analyticsData.content_change)}`}>
                  <span className="mr-1">{getChangeIcon(analyticsData.content_change)}</span>
                  <span>{formatPercentage(Math.abs(analyticsData.content_change))} vs previous period</span>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.average_score ? `${(analyticsData.average_score * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
              {analyticsData.score_change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(analyticsData.score_change)}`}>
                  <span className="mr-1">{getChangeIcon(analyticsData.score_change)}</span>
                  <span>{formatPercentage(Math.abs(analyticsData.score_change))} vs previous period</span>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsData.active_users)}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              {analyticsData.users_change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${getChangeColor(analyticsData.users_change)}`}>
                  <span className="mr-1">{getChangeIcon(analyticsData.users_change)}</span>
                  <span>{formatPercentage(Math.abs(analyticsData.users_change))} vs previous period</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 border-b">
            {[
              { key: 'overview', label: '📊 Overview', icon: '📊' },
              { key: 'content', label: '📚 Content', icon: '📚' },
              { key: 'questions', label: '❓ Questions', icon: '❓' },
              { key: 'performance', label: '🎯 Performance', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedMetric(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  selectedMetric === tab.key
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content based on selected metric */}
          {selectedMetric === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">🕒 Recent Activity</h3>
                <div className="space-y-3">
                  {analyticsData.recent_activity?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.timestamp}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Top Subjects */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">📚 Popular Subjects</h3>
                <div className="space-y-3">
                  {analyticsData.top_subjects?.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{subject.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(subject.count / analyticsData.top_subjects[0].count) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{subject.count}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content by Type */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">📄 Content by Type</h3>
                <div className="space-y-4">
                  {analyticsData.content_by_type?.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {type.name.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(type.count / analyticsData.total_content) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{type.count}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No content data available</p>
                  )}
                </div>
              </div>

              {/* Content by Difficulty */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">📊 Content by Difficulty</h3>
                <div className="space-y-4">
                  {analyticsData.content_by_difficulty?.map((level, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          level.name === 'beginner' ? 'bg-green-500' :
                          level.name === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900 capitalize">{level.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level.name === 'beginner' ? 'bg-green-500' :
                              level.name === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(level.count / analyticsData.total_content) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{level.count}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No difficulty data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Question Types */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">❓ Question Types</h3>
                <div className="space-y-4">
                  {analyticsData.question_types?.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {type.name.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(type.count / analyticsData.total_questions) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{type.count}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No question data available</p>
                  )}
                </div>
              </div>

              {/* Most Asked Topics */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">🔥 Most Asked Topics</h3>
                <div className="space-y-3">
                  {analyticsData.popular_topics?.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{topic.name}</p>
                        <p className="text-sm text-gray-600">{topic.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{topic.count}</p>
                        <p className="text-xs text-gray-600">questions</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No topic data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Score Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">🎯 Score Distribution</h3>
                <div className="space-y-4">
                  {analyticsData.score_distribution?.map((range, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          range.range.includes('90-100') ? 'bg-green-500' :
                          range.range.includes('80-89') ? 'bg-blue-500' :
                          range.range.includes('70-79') ? 'bg-yellow-500' :
                          range.range.includes('60-69') ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{range.range}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              range.range.includes('90-100') ? 'bg-green-500' :
                              range.range.includes('80-89') ? 'bg-blue-500' :
                              range.range.includes('70-79') ? 'bg-yellow-500' :
                              range.range.includes('60-69') ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${range.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{range.count}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No score data available</p>
                  )}
                </div>
              </div>

              {/* Performance Trends */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">📈 Performance Trends</h3>
                <div className="space-y-4">
                  {analyticsData.performance_trends?.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{trend.subject}</span>
                        <span className={`text-sm ${getChangeColor(trend.change)}`}>
                          {getChangeIcon(trend.change)} {formatPercentage(Math.abs(trend.change))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Avg. Score: {(trend.average_score * 100).toFixed(1)}%</span>
                        <span>{trend.total_attempts} attempts</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No trend data available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;