import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import UserDropdown from '../auth/UserDropdown';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleLoginClick = () => {
    setShowLoginModal(true);
    handleNavLinkClick();
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
    handleNavLinkClick();
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <>
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
          {isAuthenticated && (
            <Link to="/dashboard" className="navbar-item" onClick={handleNavLinkClick}>Dashboard</Link>
          )}
          <Link to="/md-docs" className="navbar-item" onClick={handleNavLinkClick}>Documentation</Link>
          
          <div className="navbar-actions">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {!isLoading && (
              <div className="auth-section">
                {isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <div className="auth-buttons">
                    <button 
                      className="btn btn-outline"
                      onClick={handleLoginClick}
                      title='Sign In'
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleRegisterClick}
                      title='Sign Up'
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="6" x2="19" y2="16" strokeWidth="2.5"/>
                        <line x1="24" y1="11" x2="14" y2="11" strokeWidth="2.5"/>
                      </svg>
                      
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Navbar;
