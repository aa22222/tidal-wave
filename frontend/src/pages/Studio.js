import React, { useState, useRef, useEffect } from 'react';
import './Studio.css';

function Studio() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioBuffer1, setAudioBuffer1] = useState(null);
  const [audioBuffer2, setAudioBuffer2] = useState(null);
  const [audioSource1, setAudioSource1] = useState(null);
  const [audioSource2, setAudioSource2] = useState(null);
  const [playing1, setPlaying1] = useState(false);
  const [playing2, setPlaying2] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);

  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const audioCtxRef = useRef(null);
  const startTime1Ref = useRef(0);
  const startTime2Ref = useRef(0);
  const offset1Ref = useRef(0);
  const offset2Ref = useRef(0);
  const animationFrame1Ref = useRef(null);
  const animationFrame2Ref = useRef(null);
  const waveformData1Ref = useRef(null);
  const waveformData2Ref = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const drawWaveformStatic = (canvas, buffer, waveformDataRef) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    console.log('Drawing waveform:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      dataLength: data.length,
      step
    });

    // Store waveform drawing data for redrawing with playhead
    waveformDataRef.current = { buffer, canvas };

    // Clear and fill background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0099ff';
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i++) {
      const segment = data.slice(i * step, (i + 1) * step);
      const min = Math.min(...segment);
      const max = Math.max(...segment);
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  };

  const drawPlayhead = (canvas, buffer, progress) => {
    if (!canvas || !buffer) return;

    const ctx = canvas.getContext('2d');
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0099ff';
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i++) {
      const segment = data.slice(i * step, (i + 1) * step);
      const min = Math.min(...segment);
      const max = Math.max(...segment);
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Draw red playhead
    const playheadX = (progress / 100) * canvas.width;
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
  };

  const generateWaveform = async (file, canvasRef, setAudioBuffer, waveformDataRef) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

      setAudioBuffer(audioBuffer);

      // Wait for next frame to ensure canvas is rendered
      setTimeout(() => {
        if (canvasRef.current) {
          const width = canvasRef.current.parentElement.offsetWidth - 60; // Account for play button
          console.log('Canvas sizing:', { width, parentWidth: canvasRef.current.parentElement.offsetWidth });
          canvasRef.current.width = width;
          canvasRef.current.height = 120;
          drawWaveformStatic(canvasRef.current, audioBuffer, waveformDataRef);
        }
      }, 100);
    } catch (err) {
      console.error('Error generating waveform:', err);
      setAudioBuffer(null);
    }
  };

  const playFromPosition1 = (offsetSeconds) => {
    if (!audioBuffer1) return;

    // Stop current playback if playing
    if (playing1 && audioSource1) {
      audioSource1.stop();
      if (animationFrame1Ref.current) {
        cancelAnimationFrame(animationFrame1Ref.current);
      }
    }

    // Start playing from offset
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer1;
    source.connect(audioCtxRef.current.destination);
    startTime1Ref.current = audioCtxRef.current.currentTime;
    offset1Ref.current = offsetSeconds;
    source.start(0, offsetSeconds);

    source.onended = () => {
      setPlaying1(false);
      setAudioSource1(null);
      offset1Ref.current = 0;
      if (animationFrame1Ref.current) {
        cancelAnimationFrame(animationFrame1Ref.current);
      }
      // Redraw without playhead
      if (waveformData1Ref.current) {
        drawWaveformStatic(canvas1Ref.current, audioBuffer1, waveformData1Ref);
      }
    };

    setAudioSource1(source);
    setPlaying1(true);

    // Animation loop for playhead
    const animate = () => {
      const elapsed = audioCtxRef.current.currentTime - startTime1Ref.current;
      const currentTime = offset1Ref.current + elapsed;
      const progress = (currentTime / audioBuffer1.duration) * 100;

      if (progress <= 100 && canvas1Ref.current && audioBuffer1) {
        drawPlayhead(canvas1Ref.current, audioBuffer1, progress);
      }

      if (progress < 100) {
        animationFrame1Ref.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const togglePlay1 = () => {
    if (!audioBuffer1) return;

    if (playing1 && audioSource1) {
      // Pause - stop playing and save current position
      audioSource1.stop();
      setAudioSource1(null);
      setPlaying1(false);
      if (animationFrame1Ref.current) {
        cancelAnimationFrame(animationFrame1Ref.current);
      }
      // Calculate current position and save it
      const elapsed = audioCtxRef.current.currentTime - startTime1Ref.current;
      offset1Ref.current = offset1Ref.current + elapsed;
    } else {
      // Resume from current offset
      playFromPosition1(offset1Ref.current);
    }
  };

  const handleCanvas1Click = (e) => {
    if (!audioBuffer1 || !canvas1Ref.current) return;

    const rect = canvas1Ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const offsetSeconds = (percent / 100) * audioBuffer1.duration;

    offset1Ref.current = offsetSeconds;

    if (playing1) {
      // If playing, restart from new position
      playFromPosition1(offsetSeconds);
    } else {
      // If paused, just update the visual
      drawPlayhead(canvas1Ref.current, audioBuffer1, percent);
    }
  };

  const playFromPosition2 = (offsetSeconds) => {
    if (!audioBuffer2) return;

    // Stop current playback if playing
    if (playing2 && audioSource2) {
      audioSource2.stop();
      if (animationFrame2Ref.current) {
        cancelAnimationFrame(animationFrame2Ref.current);
      }
    }

    // Start playing from offset
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer2;
    source.connect(audioCtxRef.current.destination);
    startTime2Ref.current = audioCtxRef.current.currentTime;
    offset2Ref.current = offsetSeconds;
    source.start(0, offsetSeconds);

    source.onended = () => {
      setPlaying2(false);
      setAudioSource2(null);
      offset2Ref.current = 0;
      if (animationFrame2Ref.current) {
        cancelAnimationFrame(animationFrame2Ref.current);
      }
      // Redraw without playhead
      if (waveformData2Ref.current) {
        drawWaveformStatic(canvas2Ref.current, audioBuffer2, waveformData2Ref);
      }
    };

    setAudioSource2(source);
    setPlaying2(true);

    // Animation loop for playhead
    const animate = () => {
      const elapsed = audioCtxRef.current.currentTime - startTime2Ref.current;
      const currentTime = offset2Ref.current + elapsed;
      const progress = (currentTime / audioBuffer2.duration) * 100;

      if (progress <= 100 && canvas2Ref.current && audioBuffer2) {
        drawPlayhead(canvas2Ref.current, audioBuffer2, progress);
      }

      if (progress < 100) {
        animationFrame2Ref.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const togglePlay2 = () => {
    if (!audioBuffer2) return;

    if (playing2 && audioSource2) {
      // Pause - stop playing and save current position
      audioSource2.stop();
      setAudioSource2(null);
      setPlaying2(false);
      if (animationFrame2Ref.current) {
        cancelAnimationFrame(animationFrame2Ref.current);
      }
      // Calculate current position and save it
      const elapsed = audioCtxRef.current.currentTime - startTime2Ref.current;
      offset2Ref.current = offset2Ref.current + elapsed;
    } else {
      // Resume from current offset
      playFromPosition2(offset2Ref.current);
    }
  };

  const handleCanvas2Click = (e) => {
    if (!audioBuffer2 || !canvas2Ref.current) return;

    const rect = canvas2Ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const offsetSeconds = (percent / 100) * audioBuffer2.duration;

    offset2Ref.current = offsetSeconds;

    if (playing2) {
      // If playing, restart from new position
      playFromPosition2(offsetSeconds);
    } else {
      // If paused, just update the visual
      drawPlayhead(canvas2Ref.current, audioBuffer2, percent);
    }
  };

  const handleFile1Change = (e) => {
    const file = e.target.files[0];
    setFile1(file);
    setError(null);
    setProgress1(0);
    setPlaying1(false);
    offset1Ref.current = 0;
    if (audioSource1) {
      audioSource1.stop();
      setAudioSource1(null);
    }
    if (animationFrame1Ref.current) {
      cancelAnimationFrame(animationFrame1Ref.current);
    }
    if (file) {
      generateWaveform(file, canvas1Ref, setAudioBuffer1, waveformData1Ref);
    }
  };

  const handleFile2Change = (e) => {
    const file = e.target.files[0];
    setFile2(file);
    setError(null);
    setProgress2(0);
    setPlaying2(false);
    offset2Ref.current = 0;
    if (audioSource2) {
      audioSource2.stop();
      setAudioSource2(null);
    }
    if (animationFrame2Ref.current) {
      cancelAnimationFrame(animationFrame2Ref.current);
    }
    if (file) {
      generateWaveform(file, canvas2Ref, setAudioBuffer2, waveformData2Ref);
    }
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
      const response = await fetch('/api/upload', {
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
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">READY TO UPLOAD</span>
            </div>
          </div>
          <div className="header-right">
            <div className="music-heart">
              <span className="heart-icon">♥</span>
              <div className="music-notes">
                <span className="note note-1">♪</span>
                <span className="note note-2">♫</span>
                <span className="note note-3">♪</span>
              </div>
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
                <div className="track-name">REFERENCE TRACK</div>
                <div className={`track-status ${file1 ? 'armed' : ''}`}>
                  {file1 ? '●' : '○'}
                </div>
              </div>

              <div className="track-body">
                <div className="track-waveform">
                  {audioBuffer1 ? (
                    <div className="waveform-container">
                      <canvas
                        ref={canvas1Ref}
                        className="waveform-canvas"
                        onClick={handleCanvas1Click}
                      ></canvas>
                      <button
                        className="play-button"
                        onClick={togglePlay1}
                      >
                        {playing1 ? '⏸' : '▶'}
                      </button>
                    </div>
                  ) : file1 ? (
                    <div className="waveform-loading">
                      <span>Analyzing audio...</span>
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
                      <span className="info-label">REFERENCE TRACK</span>
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
                <div className="track-name">YOUR TRACK</div>
                <div className={`track-status ${file2 ? 'armed' : ''}`}>
                  {file2 ? '●' : '○'}
                </div>
              </div>

              <div className="track-body">
                <div className="track-waveform">
                  {audioBuffer2 ? (
                    <div className="waveform-container">
                      <canvas
                        ref={canvas2Ref}
                        className="waveform-canvas"
                        onClick={handleCanvas2Click}
                      ></canvas>
                      <button
                        className="play-button"
                        onClick={togglePlay2}
                      >
                        {playing2 ? '⏸' : '▶'}
                      </button>
                    </div>
                  ) : file2 ? (
                    <div className="waveform-loading">
                      <span>Analyzing audio...</span>
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