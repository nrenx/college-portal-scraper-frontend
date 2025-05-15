import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { API_URL, API_USERNAME, API_PASSWORD } from '../config';

function ScraperForm({ onJobCreated }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    academic_year: '',
    scrape_attendance: true,
    scrape_mid_marks: true,
    scrape_personal_details: true,
    upload_to_supabase: true,
    force_update: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // List of academic years
  const academicYears = [
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
    '2019-20',
    '2018-19'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debug info
    console.log('API URL:', API_URL);
    console.log('API Username:', API_USERNAME);
    console.log('Form Data:', formData);
    console.log('Origin:', window.location.origin);

    try {
      const apiUrl = `${API_URL}/scrape`;
      console.log('Sending request to:', apiUrl);

      // Create base64 encoded credentials
      const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`);

      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Origin': window.location.origin
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
        // Don't include credentials for CORS requests with Basic Auth
        credentials: 'omit'
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText || 'No details'}`);
      }

      const data = await response.json();
      console.log('Response received:', data);

      if (data && data.job_id) {
        onJobCreated(data.job_id);
      } else {
        setError('Invalid response from server: Missing job_id');
      }
    } catch (err) {
      console.error('Error starting scrape job:', err);

      // Check for specific error types
      if (err.name === 'AbortError') {
        setError('Network Error: Request timed out. The server might be down or unreachable.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(`Network Error: Unable to connect to the server. This might be due to CORS restrictions or the server being down.
                 Please check if the backend is running and accessible at ${API_URL}.`);
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        setError(`Network Error: ${err.response.status} - ${err.response.statusText || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request details:', err.request);
        setError('Network Error: No response received from server. Check your network connection and server status.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError(`Network Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Start Scraping
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">{error.includes('Authentication failed') ? 'Login Error' : 'Error'}</p>
          <p>{error}</p>
          {error.includes('Authentication failed') && (
            <div className="mt-2">
              <p>Please check that:</p>
              <ul className="list-disc ml-5">
                <li>Your username and password are correct</li>
                <li>Your college portal account is active</li>
                <li>The college portal website is accessible</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="academic_year">
            Academic Year
          </label>
          <select
            id="academic_year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Academic Year</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <p className="block text-gray-700 text-sm font-bold mb-2">
            Data to Scrape
          </p>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="scrape_attendance"
                checked={formData.scrape_attendance}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Attendance Data</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="scrape_mid_marks"
                checked={formData.scrape_mid_marks}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Mid Marks Data</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="scrape_personal_details"
                checked={formData.scrape_personal_details}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Personal Details</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="upload_to_supabase"
                checked={formData.upload_to_supabase}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Upload to Supabase</span>
            </label>

            {formData.upload_to_supabase && (
              <label className="inline-flex items-center ml-6">
                <input
                  type="checkbox"
                  name="force_update"
                  checked={formData.force_update}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Force Update (Overwrite Existing Files)</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Starting...' : 'Start Scraping'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScraperForm;
