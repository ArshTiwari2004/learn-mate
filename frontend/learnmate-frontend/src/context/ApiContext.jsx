import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

const API_BASE = 'http://localhost:8000';

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (endpoint, method = 'GET', data = null, files = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE}${endpoint}`;
      let response;

      if (files) {
        const formData = new FormData();
        Object.keys(files).forEach(key => {
          formData.append(key, files[key]);
        });
        if (data) {
          Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
          });
        }
        response = await axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const config = { method: method.toLowerCase(), url };
        if (data) {
          if (method === 'GET') {
            config.params = data;
          } else {
            config.data = data;
          }
        }
        response = await axios(config);
      }

      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    makeRequest,
    loading,
    error,
    setError
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
