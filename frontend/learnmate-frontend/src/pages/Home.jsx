import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Home = () => {
  const { makeRequest, loading, error, setError } = useApi();
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const { data } = await makeRequest('/health');
      if (data) {
        setHealthData(data);
      }
    };
    fetchHealth();
  }, [makeRequest]);

  const features = [
    {
      title: "📄 Test Analysis",
      description: "Upload your test results and get AI-powered analysis of your weak areas",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "🧠 Smart Q&A", 
      description: "Ask questions and get detailed explanations with relevant sources",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "📅 Study Schedules",
      description: "Generate personalized revision schedules based on your needs",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "🧠 Practice Questions",
      description: "Generate and practice questions based on your weak areas",
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "🔍 Content Search",
      description: "Search through educational materials with AI-powered relevance",
      color: "bg-pink-50 border-pink-200"
    },
    {
      title: "📊 Analytics",
      description: "Track your learning progress and identify improvement areas",
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 Personalized Learning Copilot
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Welcome to your AI-powered learning assistant! This application helps you create 
          personalized study plans, get instant answers to your questions, and track your 
          learning progress using advanced AI technologies.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`card ${feature.color} border-2 hover:shadow-lg transition-shadow duration-200 animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">🔧 System Status</h2>
        
        {loading ? (
          <LoadingSpinner text="Checking system status..." />
        ) : healthData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium text-gray-900">API Status</div>
              <div className="text-xs text-gray-600">Healthy</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {healthData.database_stats?.total_documents || 0}
              </div>
              <div className="text-sm font-medium text-gray-900">Documents</div>
              <div className="text-xs text-gray-600">In Knowledge Base</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">✅</div>
              <div className="text-sm font-medium text-gray-900">Vector DB</div>
              <div className="text-xs text-gray-600">Operational</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">✅</div>
              <div className="text-sm font-medium text-gray-900">LLM Service</div>
              <div className="text-xs text-gray-600">Operational</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Unable to connect to API. Please ensure the backend is running.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;