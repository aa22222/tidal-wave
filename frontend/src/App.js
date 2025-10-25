import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Studio from './pages/Studio';
import './App.css';

// NEW APP - Music Editor Theme
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

function About() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0a0a0f 100%)',
      minHeight: 'calc(100vh - 80px)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1.5rem',
          fontFamily: 'Courier New, monospace'
        }}>
          About <span style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>TidalWave</span>
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#a8b2d1',
          lineHeight: '1.8'
        }}>
          Professional music analysis tool. Upload your recording alongside a reference track
          to receive AI-powered feedback on tempo, pitch, timing, and technique.
        </p>
      </div>
    </div>
  );
}

export default App;

/* ========================================
   ORIGINAL PURPLE GRADIENT VERSION (COMMENTED OUT)
   ========================================

import React, { useState } from 'react';
import './App.css';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile1Change = (e) => {
    setFile1(e.target.files[0]);
    setError(null);
  };

  const handleFile2Change = (e) => {
    setFile2(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate files
    if (!file1 || !file2) {
      setError('Please select both files');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    // Create FormData object
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      setFile1(null);
      setFile2(null);

      // Clear file inputs
      document.getElementById('file1-input').value = '';
      document.getElementById('file2-input').value = '';

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>File Upload with Python Processing</h1>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-group">
            <label htmlFor="file1-input">
              Select File 1:
            </label>
            <input
              id="file1-input"
              type="file"
              onChange={handleFile1Change}
              disabled={uploading}
            />
            {file1 && (
              <div className="file-info">
                <span>✓ {file1.name}</span>
                <span className="file-size">
                  ({(file1.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          <div className="file-input-group">
            <label htmlFor="file2-input">
              Select File 2:
            </label>
            <input
              id="file2-input"
              type="file"
              onChange={handleFile2Change}
              disabled={uploading}
            />
            {file2 && (
              <div className="file-info">
                <span>✓ {file2.name}</span>
                <span className="file-size">
                  ({(file2.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || !file1 || !file2}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload and Process'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-message">
            <h3>Success!</h3>
            <p>{result.message}</p>
            <div className="result-details">
              <h4>Processed Files:</h4>
              <ul>
                <li>File 1: {result.files.file1}</li>
                <li>File 2: {result.files.file2}</li>
              </ul>
              <h4>Python Script Output:</h4>
              <pre>{result.result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

======================================== */
