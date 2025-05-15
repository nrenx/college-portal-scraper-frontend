import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScraperForm from './components/ScraperForm';
import JobStatus from './components/JobStatus';
import Header from './components/Header';
import Footer from './components/Footer';
import ConnectionTest from './components/ConnectionTest';

function App() {
  const [currentJob, setCurrentJob] = useState(null);

  const handleJobCreated = (jobId) => {
    setCurrentJob(jobId);
    toast.success('Scraping job started!');
  };

  const handleJobCompleted = () => {
    toast.success('Scraping job completed!');
  };

  const handleJobFailed = (message) => {
    toast.error(`Scraping job failed: ${message}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            College Portal Scraper
          </h1>

          {!currentJob ? (
            <>
              <ScraperForm onJobCreated={handleJobCreated} />
              <ConnectionTest />
            </>
          ) : (
            <>
              <JobStatus
                jobId={currentJob}
                onJobCompleted={handleJobCompleted}
                onJobFailed={handleJobFailed}
                onReset={() => setCurrentJob(null)}
              />
              <ConnectionTest />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
