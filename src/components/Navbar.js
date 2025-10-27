import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="logo-icon">
            <span className="wave-line"></span>
            <span className="wave-line"></span>
            <span className="wave-line"></span>
          </div>
          <span className="logo-text">TIDAL<span className="logo-accent">WAVE</span></span>
        </div>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            <span className="nav-icon">◆</span>
            Home
          </Link>
          <Link to="/studio" className="nav-link">
            <span className="nav-icon">▶</span>
            Studio
          </Link>
        </div>

        <div className="navbar-controls">
          <button className="control-btn" onClick={() => navigate('/')} title="Home">
            <span className="control-indicator"></span>
          </button>
          <button className="control-btn record" onClick={() => navigate('/studio')} title="Studio">
            <span className="control-indicator"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
