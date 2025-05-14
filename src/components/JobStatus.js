import { useState, useEffect } from 'react';
import { API_URL, API_USERNAME, API_PASSWORD } from '../config';

function JobStatus({ jobId, onJobCompleted, onJobFailed, onReset }) {
  const [status, setStatus] = useState({
    status: 'loading',
    message: 'Loading job status...',
    progress: 0,
    details: {}
  });

  // We're setting loading state but using status.status instead for UI rendering
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('Fetching job status from:', `${API_URL}/job/${jobId}`);

        // Create base64 encoded credentials
        const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`);

        const response = await fetch(`${API_URL}/job/${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${credentials}`
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Job status response:', data);
        setStatus(data);

        // If job is completed or failed, call the appropriate callback
        if (data.status === 'completed') {
          onJobCompleted();
        } else if (data.status === 'failed') {
          onJobFailed(data.message);
        }
      } catch (err) {
        console.error('Error fetching job status:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          request: err.request,
          config: err.config
        });

        // More detailed error logging
        if (err.response) {
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
      }
    };

    // Fetch status immediately
    fetchStatus();

    // Then set up polling every 5 seconds if job is still running
    const interval = setInterval(() => {
      if (status.status === 'running' || status.status === 'queued') {
        fetchStatus();
      }
    }, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [jobId, status.status, onJobCompleted, onJobFailed]);

  // Function to render status badge
  const renderStatusBadge = (status) => {
    let bgColor = 'bg-gray-500';

    if (status === 'completed') {
      bgColor = 'bg-green-500';
    } else if (status === 'failed') {
      bgColor = 'bg-red-500';
    } else if (status === 'running') {
      bgColor = 'bg-blue-500';
    } else if (status === 'queued') {
      bgColor = 'bg-yellow-500';
    }

    return (
      <span className={`${bgColor} text-white text-sm font-medium px-2.5 py-0.5 rounded`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Job Status
        </h2>
        {renderStatusBadge(status.status)}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Job ID:</span> {jobId}
        </p>
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">Status:</span> {status.message}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${(status.progress || 0) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 text-right">
          {Math.round((status.progress || 0) * 100)}% Complete
        </p>
      </div>

      {/* Job details */}
      {status.details && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Job Details
          </h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Academic Year:</span> {status.details.academic_year}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Scraping Attendance:</span> {status.details.scrape_attendance ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Scraping Mid Marks:</span> {status.details.scrape_mid_marks ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Scraping Personal Details:</span> {status.details.scrape_personal_details ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Uploading to Supabase:</span> {status.details.upload_to_supabase ? 'Yes' : 'No'}
            </p>
            {status.details.upload_to_supabase && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Force Update:</span> {status.details.force_update ? 'Yes' : 'No'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results section (only show when completed) */}
      {status.status === 'completed' && status.details?.results && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Results
          </h3>
          <div className="bg-gray-50 p-4 rounded">
            {status.details.results.attendance && (
              <div className="mb-2">
                <p className="font-semibold text-gray-700">Attendance:</p>
                <p className="text-sm text-gray-600">
                  {status.details.results.attendance.success
                    ? 'Successfully scraped attendance data'
                    : 'Failed to scrape attendance data'}
                </p>
                {status.details.results.attendance.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(status.details.results.attendance.stats).join(', ')}
                  </p>
                )}
              </div>
            )}

            {status.details.results.mid_marks && (
              <div className="mb-2">
                <p className="font-semibold text-gray-700">Mid Marks:</p>
                <p className="text-sm text-gray-600">
                  {status.details.results.mid_marks.success
                    ? 'Successfully scraped mid marks data'
                    : 'Failed to scrape mid marks data'}
                </p>
                {status.details.results.mid_marks.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(status.details.results.mid_marks.stats).join(', ')}
                  </p>
                )}
              </div>
            )}

            {status.details.results.personal_details && (
              <div className="mb-2">
                <p className="font-semibold text-gray-700">Personal Details:</p>
                <p className="text-sm text-gray-600">
                  {status.details.results.personal_details.success
                    ? 'Successfully scraped personal details'
                    : 'Failed to scrape personal details'}
                </p>
                {status.details.results.personal_details.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(status.details.results.personal_details.stats).join(', ')}
                  </p>
                )}
              </div>
            )}

            {status.details.results.upload && (
              <div>
                <p className="font-semibold text-gray-700">Supabase Upload:</p>
                <p className="text-sm text-gray-600">
                  {status.details.results.upload.success
                    ? 'Successfully uploaded data to Supabase'
                    : 'Failed to upload data to Supabase'}
                </p>
                {status.details.results.upload.stats && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(status.details.results.upload.stats).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center">
        <button
          onClick={onReset}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Start New Job
        </button>
      </div>
    </div>
  );
}

export default JobStatus;
