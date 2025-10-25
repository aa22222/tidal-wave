import React, { useState } from 'react';
import './Studio.css';

function Studio() {
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
    <div className="studio">
      <div className="studio-container">
        {/* Studio Header */}
        <div className="studio-header">
          <div className="header-left">
            <h1 className="studio-title">
              <span className="title-icon">◆</span>
              Processing Studio
            </h1>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">READY</span>
            </div>
          </div>
          <div className="header-right">
            <div className="tempo-display">
              <div className="tempo-label">BPM</div>
              <div className="tempo-value">120</div>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="studio-workspace">
          {/* Track Channels */}
          <div className="track-channels">
            {/* Track 1 */}
            <div className={`track-channel ${file1 ? 'active' : ''}`}>
              <div className="track-header">
                <div className="track-number">01</div>
                <div className="track-name">TRACK A</div>
                <div className={`track-status ${file1 ? 'armed' : ''}`}>
                  {file1 ? '●' : '○'}
                </div>
              </div>

              <div className="track-body">
                <div className="track-waveform">
                  {file1 ? (
                    <div className="waveform-active">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="wave-bar"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="waveform-empty">
                      <span>No file loaded</span>
                    </div>
                  )}
                </div>

                <div className="track-controls">
                  <label htmlFor="file1-input" className="file-input-label">
                    <span className="label-icon">▲</span>
                    {file1 ? 'Replace' : 'Load File'}
                  </label>
                  <input
                    id="file1-input"
                    type="file"
                    onChange={handleFile1Change}
                    disabled={uploading}
                    className="file-input-hidden"
                  />
                </div>

                {file1 && (
                  <div className="track-info">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{file1.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Size:</span>
                      <span className="info-value">{(file1.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                )}

                <div className="track-meter">
                  <div className="meter-bar" style={{ height: file1 ? '60%' : '0%' }}></div>
                </div>
              </div>
            </div>

            {/* Track 2 */}
            <div className={`track-channel ${file2 ? 'active' : ''}`}>
              <div className="track-header">
                <div className="track-number">02</div>
                <div className="track-name">TRACK B</div>
                <div className={`track-status ${file2 ? 'armed' : ''}`}>
                  {file2 ? '●' : '○'}
                </div>
              </div>

              <div className="track-body">
                <div className="track-waveform">
                  {file2 ? (
                    <div className="waveform-active">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="wave-bar"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="waveform-empty">
                      <span>No file loaded</span>
                    </div>
                  )}
                </div>

                <div className="track-controls">
                  <label htmlFor="file2-input" className="file-input-label">
                    <span className="label-icon">▲</span>
                    {file2 ? 'Replace' : 'Load File'}
                  </label>
                  <input
                    id="file2-input"
                    type="file"
                    onChange={handleFile2Change}
                    disabled={uploading}
                    className="file-input-hidden"
                  />
                </div>

                {file2 && (
                  <div className="track-info">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{file2.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Size:</span>
                      <span className="info-value">{(file2.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                )}

                <div className="track-meter">
                  <div className="meter-bar" style={{ height: file2 ? '75%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Master Control */}
          <div className="master-control">
            <div className="master-header">
              <div className="master-title">MASTER</div>
            </div>

            <div className="master-body">
              <button
                onClick={handleSubmit}
                disabled={uploading || !file1 || !file2}
                className={`process-button ${uploading ? 'processing' : ''}`}
              >
                {uploading ? (
                  <>
                    <span className="button-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="button-icon">▶</span>
                    Process Tracks
                  </>
                )}
              </button>

              <div className="master-meter">
                <div className="meter-label">LEVEL</div>
                <div className="meter-track">
                  <div className={`meter-fill ${uploading ? 'animating' : ''}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Output Console */}
        {(error || result) && (
          <div className="output-console">
            <div className="console-header">
              <div className="console-title">
                <span className="console-icon">▣</span>
                Output Console
              </div>
              <button
                className="console-close"
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="console-content">
              {error && (
                <div className="console-error">
                  <div className="console-status">
                    <span className="status-icon error">✕</span>
                    ERROR
                  </div>
                  <div className="console-message">{error}</div>
                </div>
              )}

              {result && (
                <div className="console-success">
                  <div className="console-status">
                    <span className="status-icon success">✓</span>
                    SUCCESS
                  </div>
                  <div className="console-message">{result.message}</div>

                  <div className="console-details">
                    <div className="detail-section">
                      <div className="detail-title">Processed Files:</div>
                      <div className="detail-list">
                        <div className="detail-item">
                          <span className="item-label">Track A:</span>
                          <span className="item-value">{result.files.file1}</span>
                        </div>
                        <div className="detail-item">
                          <span className="item-label">Track B:</span>
                          <span className="item-value">{result.files.file2}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <div className="detail-title">Processing Output:</div>
                      <pre className="detail-output">{result.result}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Studio;
