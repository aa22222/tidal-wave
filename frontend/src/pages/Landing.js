import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      <div className="landing-container">
        {/* Hero Section */}
        <div className="hero-section">
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
              Become a Piano <span className="title-gradient">Master</span>
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
            </div>

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

        {/* Features Section */}
        <div className="features-section">
          <div className="section-header">
            <div className="section-tag">FEATURES</div>
            <h2 className="section-title">Studio-Grade Tools</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-track track-1"></div>
                <div className="icon-track track-2"></div>
                <div className="icon-track track-3"></div>
              </div>
              <h3 className="feature-title">Multi-Track Processing</h3>
              <p className="feature-description">
                Process multiple files simultaneously with real-time monitoring
                and visual feedback.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon spectrum">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="spectrum-bar"></div>
                ))}
              </div>
              <h3 className="feature-title">Spectrum Analysis</h3>
              <p className="feature-description">
                Advanced analytics engine with detailed metadata extraction
                and content inspection.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon waveform">
                <svg viewBox="0 0 100 40" className="wave-svg">
                  <path
                    d="M 0 20 Q 10 5, 20 20 T 40 20 T 60 20 T 80 20 T 100 20"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#0099ff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Processing</h3>
              <p className="feature-description">
                Lightning-fast processing engine with instant feedback
                and zero-latency workflow.
              </p>
            </div>
          </div>
        </div>

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
