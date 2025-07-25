import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Home = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`home-container ${theme}`}>
      <section className="hero">
        <h1>Welcome to ASafariM Application</h1>
        <p>A modern application with integrated markdown documentation viewer</p>
        
        <div className="cta-buttons">
          <Link to="/dashboard" className="cta-button primary">
            Go to Dashboard
          </Link>
          <Link to="/docs" className="cta-button secondary">
            Browse Documentation
          </Link>
        </div>
      </section>
      
      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Interactive Dashboard</h3>
            <p>Visualize your data with our powerful dashboard tools</p>
          </div>
          <div className="feature-card">
            <h3>Markdown Documentation</h3>
            <p>Seamlessly integrated markdown documentation viewer</p>
          </div>
          <div className="feature-card">
            <h3>Theme Support</h3>
            <p>Light and dark mode for comfortable viewing</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
