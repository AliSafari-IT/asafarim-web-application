import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Home = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`home-container ${theme}`}>
      <section className="hero">
        <h1>ASafariM Web Application</h1>
        <p className="hero-subtitle">Developer Portfolio & Scientific Computing Platform</p>
        <p className="hero-description">
          Explore 17 published NPM packages, scientific computing projects, and comprehensive 
          technical documentation in modern web development and data analysis.
        </p>
        
        <div className="cta-buttons">
          <Link to="/dashboard" className="cta-button primary">
            🚀 Explore Dashboard
          </Link>
          <Link to="/docs" className="cta-button secondary">
            📚 Browse Documentation
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">17</span>
            <span className="stat-label">NPM Packages</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4</span>
            <span className="stat-label">Research Areas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
      </section>
      
      <section className="features">
        <h2>Platform Highlights</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Scientific Computing</h3>
            <p>Advanced hydrological modeling, data analysis, and machine learning applications with Python and TensorFlow</p>
            <Link to="/dashboard?tab=topics" className="feature-link">Explore Research →</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>NPM Package Ecosystem</h3>
            <p>17 published packages including React components, markdown viewers, and developer tools</p>
            <Link to="/dashboard?tab=public-packages" className="feature-link">View Packages →</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Modern Web Development</h3>
            <p>React, TypeScript, D3.js visualizations, and cloud-native application development</p>
            <Link to="/docs/techdocs/frontend" className="feature-link">Learn More →</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud & DevOps</h3>
            <p>AWS, Docker, Kubernetes, and CI/CD pipelines for scalable application deployment</p>
            <Link to="/docs/techdocs/cloud" className="feature-link">View Architecture →</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Interactive Documentation</h3>
            <p>Comprehensive markdown documentation with advanced viewer and file tree navigation</p>
            <Link to="/docs" className="feature-link">Browse Docs →</Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Theme System</h3>
            <p>Advanced theming with automatic dark/light mode detection and smooth transitions</p>
            <a href="https://www.npmjs.com/package/@asafarim/react-themes" target="_blank" rel="noopener noreferrer" className="feature-link">View Package →</a>
          </div>
        </div>
      </section>

      <section className="recent-work">
        <h2>Recent Contributions</h2>
        <div className="work-grid">
          <div className="work-item">
            <div className="work-header">
              <h3>@asafarim/complete-md-viewer</h3>
              <span className="work-badge new">New</span>
            </div>
            <p>Flexible markdown viewer with routing support</p>
            <div className="work-meta">
              <span>Published 1 day ago</span>
              <a href="https://www.npmjs.com/package/@asafarim/complete-md-viewer" target="_blank" rel="noopener noreferrer">View on NPM</a>
            </div>
          </div>
          <div className="work-item">
            <div className="work-header">
              <h3>AquaFlow Platform</h3>
              <span className="work-badge active">Active</span>
            </div>
            <p>Advanced hydrological modeling and simulation</p>
            <div className="work-meta">
              <span>Scientific Computing</span>
              <Link to="/docs/projects/advanced-hydrological-modeling">Learn More</Link>
            </div>
          </div>
          <div className="work-item">
            <div className="work-header">
              <h3>Data Visualization Suite</h3>
              <span className="work-badge research">Research</span>
            </div>
            <p>React + D3.js interactive data visualizations</p>
            <div className="work-meta">
              <span>Frontend Development</span>
              <Link to="/docs/techdocs/projects/d3js-react-ui">View Project</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
