import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      {/* Floating musical notes across the landing page */}
      <div className="floating-notes" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`floating-note note-${(i % 4) + 1}`}
            style={{
              left: `${Math.random() * 88 + 4}%`,
              bottom: `${Math.random() * 120 - 10}%`,
              animationDelay: `${(Math.random() * 6).toFixed(2)}s`
            }}
          >
            <svg viewBox="0 0 24 24" className="note-svg" aria-hidden="true">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
        ))}
      </div>

      <div className="landing-container">
        {/* Hero Section */}
        <div className="hero-section">
          {/* Floating musical notes in background */}
          <div className="floating-notes" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`floating-note note-${(i % 4) + 1}`}
                style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.8}s` }}
              >
                <svg viewBox="0 0 24 24" className="note-svg" aria-hidden="true">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                </svg>
              </div>
            ))}
          </div>
          <div className="waveform-visualizer">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar"
                style={{ animationDelay: `${i * 0.05}s` }}
              ></div>
            ))}
          </div>

          <div className="hero-content">
            <div className="hero-tag">
              <span className="tag-dot"></span>
              AUDIO PROCESSING SUITE
            </div>
            <h1 className="hero-title">
              <span className="title-clear">Create. Process.</span>{' '}
              <span className="title-gradient">Master.</span>
            </h1>
            <p className="hero-description">
              Professional-grade file processing engine designed for audio producers,
              sound designers, and creative professionals.
            </p>

            <div className="hero-actions">
              <Link to="/studio" className="cta-button primary">
                <span className="button-icon">▶</span>
                Launch Studio
              </Link>
              <button className="cta-button secondary">
                <span className="button-icon">◉</span>
                Watch Demo
              </button>
            </div>

            <div className="cta-subtext">No account required — start in seconds</div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">192kHz</div>
                <div className="stat-label">Sample Rate</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">32-bit</div>
                <div className="stat-label">Processing</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">0ms</div>
                <div className="stat-label">Latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section removed as requested */}

        {/* Console Section */}
        <div className="console-section">
          <div className="console-window">
            <div className="console-header">
              <div className="console-controls">
                <span className="console-dot red"></span>
                <span className="console-dot yellow"></span>
                <span className="console-dot green"></span>
              </div>
              <div className="console-title">system.log</div>
            </div>
            <div className="console-body">
              <div className="console-line">
                <span className="line-number">01</span>
                <span className="line-text">
                  <span className="text-success">[OK]</span> System initialized
                </span>
              </div>
              <div className="console-line">
                <span className="line-number">02</span>
                <span className="line-text">
                  <span className="text-info">[INFO]</span> Processing engine: <span className="text-highlight">online</span>
                </span>
              </div>
              <div className="console-line">
                <span className="line-number">03</span>
                <span className="line-text">
                  <span className="text-success">[OK]</span> Ready for input
                </span>
              </div>
              <div className="console-line">
                <span className="line-number">04</span>
                <span className="line-text">
                  <span className="cursor-blink">_</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
