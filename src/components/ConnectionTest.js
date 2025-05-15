import { useState } from 'react';
import { API_URL, API_USERNAME, API_PASSWORD } from '../config';

function ConnectionTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Test the CORS endpoint
      console.log('Testing connection to:', `${API_URL}/cors-test`);

      // Create base64 encoded credentials
      const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`);

      const response = await fetch(`${API_URL}/cors-test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText || 'No details'}`);
      }

      const data = await response.json();
      console.log('Test response:', data);
      setTestResult(data);

    } catch (err) {
      console.error('Connection test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test the health endpoint
  const testHealth = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log('Testing health endpoint:', `${API_URL}/health`);

      // Create base64 encoded credentials
      const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`);

      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText || 'No details'}`);
      }

      const data = await response.json();
      console.log('Health response:', data);
      setTestResult(data);

    } catch (err) {
      console.error('Health test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Connection Test
      </h2>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          {loading ? 'Testing...' : 'Test CORS Connection'}
        </button>

        <button
          onClick={testHealth}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {testResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Success!</p>
          <pre className="mt-2 text-sm">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>API URL: {API_URL}</p>
        <p>API Username: {API_USERNAME}</p>
        <p>Origin: {window.location.origin}</p>
      </div>
    </div>
  );
}

export default ConnectionTest;
