import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as api from '../lib/api';

const endpoints = [
  { name: 'Get All Users', func: api.getAllUsers, method: 'GET' },
  { name: 'Search Users', func: api.searchUsers, method: 'GET', params: { query: 'test' } },
  { name: 'Get User Profile', func: api.getUserProfile, method: 'GET' },
  { name: 'Get Chats', func: api.fetchChats, method: 'GET' }
];

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (endpoint, index) => {
    setLoading(prev => ({ ...prev, [index]: true }));
    try {
      const params = endpoint.params || {};
      const result = await endpoint.func(...Object.values(params));
      setResults(prev => ({
        ...prev,
        [index]: {
          success: true,
          data: result
        }
      }));
      toast.success(`Successfully tested: ${endpoint.name}`);
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error);
      setResults(prev => ({
        ...prev,
        [index]: {
          success: false,
          error: error.message || 'Unknown error'
        }
      }));
      toast.error(`Failed to test: ${endpoint.name}`);
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">API Endpoint Tester</h1>
      <p className="mb-6 text-gray-600">
        This page allows you to test various API endpoints in your application.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{endpoint.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {endpoint.method}
              </span>
            </div>
            
            {endpoint.params && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Parameters:</p>
                <code className="text-xs">
                  {JSON.stringify(endpoint.params, null, 2)}
                </code>
              </div>
            )}
            
            <button
              onClick={() => testEndpoint(endpoint, index)}
              disabled={loading[index]}
              className={`w-full py-2 px-4 rounded-md ${
                loading[index]
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors duration-200`}
            >
              {loading[index] ? 'Testing...' : 'Test Endpoint'}
            </button>

            {results[index] && (
              <div className={`mt-4 p-3 rounded-md ${
                results[index].success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  results[index].success ? 'text-green-700' : 'text-red-700'
                } mb-2`}>
                  {results[index].success ? 'Success' : 'Error'}
                </p>
                <div className="overflow-auto max-h-60">
                  <pre className="text-xs">
                    {results[index].success
                      ? JSON.stringify(results[index].data, null, 2)
                      : results[index].error
                    }
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest; 