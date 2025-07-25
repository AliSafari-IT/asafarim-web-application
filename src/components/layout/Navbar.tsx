import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile menu when clicking a link
  const handleNavLinkClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <img src="/logoT.svg" width={30} alt="Logo" className="logo-image" />
          <span className="logo-text">
          ASafariM
          </span>
        </Link>

        {/* Hamburger menu button for mobile */}
        <button 
          className={`hamburger-menu ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="navbar-item" onClick={handleNavLinkClick}>Home</Link>
        <Link to="/dashboard" className="navbar-item" onClick={handleNavLinkClick}>Dashboard</Link>
        <Link to="/md-docs" className="navbar-item" onClick={handleNavLinkClick}>Documentation</Link>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
