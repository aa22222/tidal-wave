import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
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
          <Link to="/about" className="nav-link">
            <span className="nav-icon">◉</span>
            About
          </Link>
        </div>

        <div className="navbar-controls">
          <button className="control-btn">
            <span className="control-indicator"></span>
          </button>
          <button className="control-btn record">
            <span className="control-indicator"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
