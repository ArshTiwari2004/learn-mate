import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Home = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data } = await makeRequest('/health');
        if (data) {
          setHealthData(data);
        }
      } catch (err) {
        setError('Failed to fetch system status');
      }
    };
    fetchHealth();
  }, [makeRequest]);

  const features = [
    {
      title: "Test Analysis",
      icon: "📄",
      description: "Upload your test results and get AI-powered analysis of your weak areas",
      color: "from-blue-50 to-blue-100",
      border: "border-blue-200"
    },
    {
      title: "Smart Q&A", 
      icon: "🧠",
      description: "Ask questions and get detailed explanations with relevant sources",
      color: "from-green-50 to-green-100",
      border: "border-green-200"
    },
    {
      title: "Study Schedules",
      icon: "📅",
      description: "Generate personalized revision schedules based on your needs",
      color: "from-purple-50 to-purple-100",
      border: "border-purple-200"
    },
    {
      title: "Practice Questions",
      icon: "✍️",
      description: "Generate and practice questions based on your weak areas",
      color: "from-orange-50 to-orange-100",
      border: "border-orange-200"
    },
    {
      title: "Content Search",
      icon: "🔍",
      description: "Search through educational materials with AI-powered relevance",
      color: "from-pink-50 to-pink-100",
      border: "border-pink-200"
    },
    {
      title: "Learning Analytics",
      icon: "📊",
      description: "Track your learning progress and identify improvement areas",
      color: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200"
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center justify-center mb-6 px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full shadow-sm">
          <span className="text-sm font-medium text-blue-800">AI-Powered Learning Platform</span>
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Your Personal <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Learning Copilot</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Transform your study sessions with AI-powered tools that adapt to your learning style, 
          identify knowledge gaps, and accelerate your progress.
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          Get Started
        </button>
      </section>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Powerful Features to <span className="text-blue-600">Enhance Your Learning</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 border ${feature.border} hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
          <span className="bg-blue-100 p-3 rounded-lg mr-4">🔧</span>
          <span>System Status</span>
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner text="Checking system status..." />
          </div>
        ) : healthData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">API Status</h3>
              <p className="text-green-600 font-medium">Operational</p>
              <p className="text-xs text-gray-500 mt-2">Last checked: Just now</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-3">
                {healthData.database_stats?.total_documents || 0}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Documents</h3>
              <p className="text-blue-600 font-medium">In Knowledge Base</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Vector DB</h3>
              <p className="text-purple-600 font-medium">Operational</p>
              <p className="text-xs text-gray-500 mt-2">Embeddings ready</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">LLM Service</h3>
              <p className="text-indigo-600 font-medium">Operational</p>
              <p className="text-xs text-gray-500 mt-2">GPT-4 available</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Service Unavailable</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're unable to connect to the backend services. Please try again later or contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retry Connection
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Join thousands of students who are already accelerating their learning with AI.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
            Start Free Trial
          </button>
          <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200">
            See Demo
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;