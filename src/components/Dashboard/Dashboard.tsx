import { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('project-overview');
  
  // Sample data for the dashboard
  const currentProjects = [
    { id: 1, title: 'IGS-Pharma', state: 'In Progress', demoUrl: '/md-docs/projects/igs-pharma.md', techStack: 'React, Node.js' },
    { id: 2, title: 'Active Projects', state: 'Active', demoUrl: 'http/md-docs/projects/active-projects.md', techStack: 'Angular, Express' },
    { id: 3, title: 'Documentation Pages', state: 'Completed', demoUrl: '/md-docs/projects/documentation-pages.md', techStack: 'Vue.js, Flask' },
    { id: 4, title: 'System Uptime', state: 'Pending', demoUrl: '/md-docs/projects/system-uptime.md', techStack: 'Ruby on Rails' }
  ];

  return (
    <div className={`dashboard-container ${theme}`}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>ASafariM Dashboard</p>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'project-overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('project-overview')}
        >
          Projects
        </button>
        <button 
          className={`tab-button ${activeTab === 'public-packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('public-packages')}
        >
          Public Packages
        </button>
        <button 
          className={`tab-button ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          Topics
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'project-overview' && (
          <div className="projects-grid">
            {currentProjects.map(project => (
              <div key={project.id} className="project-card">
                <h3 className='project-title'>{project.title}</h3>
                <div className="project-state">{project.state}</div>
                <div className={`project-demo-url ${project.demoUrl.startsWith('http') ? 'external' : 'internal'}`}>
                  <Link to={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    {project.demoUrl.startsWith('http') ? 'View Demo' : 'View Documentation'}
                  </Link>
                </div>
                <div className="project-tech-stack">{project.techStack}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'public-packages' && (
          <div className="public-packages-content">
            <h2>Published NPM Packages</h2>
            <p className="packages-intro">17 packages published on NPM with active development and maintenance</p>
            <div className="packages-grid">
              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/complete-md-viewer</h3>
                  <span className="package-version">v1.1.1</span>
                </div>
                <p className="package-description">A flexible markdown viewer with support for both standalone and integrated routing usecases</p>
                <div className="package-stats">
                  <span className="tech-stack">React • TypeScript • Routing</span>
                  <span className="package-updated">Updated 1 day ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/complete-md-viewer" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/complete-md-viewer.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/simple-md-viewer</h3>
                  <span className="package-version">v1.5.2</span>
                </div>
                <p className="package-description">A professional markdown viewer with file tree navigation, directory content browsing, and advanced YAML front matter support</p>
                <div className="package-stats">
                  <span className="tech-stack">React • YAML • Navigation</span>
                  <span className="package-updated">Updated 3 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/simple-md-viewer" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/simple-md-viewer.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/md-file-explorer</h3>
                  <span className="package-version">v1.0.1</span>
                </div>
                <p className="package-description">A TypeScript package for recursively exploring markdown files and folders with lazy loading capabilities</p>
                <div className="package-stats">
                  <span className="tech-stack">Node.js • TypeScript • Lazy Loading</span>
                  <span className="package-updated">Updated 10 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/md-file-explorer" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/md-file-explorer.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/project-card</h3>
                  <span className="package-version">v1.0.3</span>
                </div>
                <p className="package-description">A React component for displaying project cards with title, image, description, tech stack, and links</p>
                <div className="package-stats">
                  <span className="tech-stack">React • TypeScript • UI Components</span>
                  <span className="package-updated">Updated 11 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/project-card" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/project-card.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/paginated-project-grid</h3>
                  <span className="package-version">v1.0.2</span>
                </div>
                <p className="package-description">A responsive React component for displaying paginated project cards with built-in search functionality</p>
                <div className="package-stats">
                  <span className="tech-stack">React • Pagination • Search</span>
                  <span className="package-updated">Updated 11 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/paginated-project-grid" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/paginated-project-grid.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/sidebar</h3>
                  <span className="package-version">v1.2.0</span>
                </div>
                <p className="package-description">A collapsible sidebar component for React applications</p>
                <div className="package-stats">
                  <span className="tech-stack">React • UI Components • Responsive</span>
                  <span className="package-updated">Updated 12 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/sidebar" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/sidebar.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>@asafarim/display-code</h3>
                  <span className="package-version">v1.0.1</span>
                </div>
                <p className="package-description">A React component for displaying syntax-highlighted code blocks with copy functionality and theme support</p>
                <div className="package-stats">
                  <span className="tech-stack">React • Syntax Highlighting • Themes</span>
                  <span className="package-updated">Updated 15 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/@asafarim/display-code" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/display-code.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>

              <div className="package-card">
                <div className="package-header">
                  <h3>asafarim-navlinks</h3>
                  <span className="package-version">v3.4.0</span>
                </div>
                <p className="package-description">A versatile React navigation component with unlimited multi-level dropdowns, four alignment options, mobile responsiveness, and customizable styling</p>
                <div className="package-stats">
                  <span className="tech-stack">React • Navigation • Multi-level</span>
                  <span className="package-updated">Updated 18 days ago</span>
                </div>
                <div className="package-links">
                  <a href="https://www.npmjs.com/package/asafarim-navlinks" target="_blank" rel="noopener noreferrer">
                    📦 NPM
                  </a>
                  <a href="/md-docs/packages/asafarim/navlinks.md" target="_blank" rel="noopener noreferrer">
                    📖 Docs
                  </a>
                </div>
              </div>
            </div>
            
            <div className="packages-footer">
              <p>
                <strong>17 total packages</strong> • 
                <a href="https://www.npmjs.com/~asafarim.be" target="_blank" rel="noopener noreferrer" className="npm-profile-link">
                  View complete NPM profile →
                </a>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="topics-content">
            <h2>Technical Topics & Research Areas</h2>
            <div className="topics-categories">
              <div className="topic-category">
                <h3>🧪 Scientific Computing</h3>
                <div className="topic-items">
                  <Link to="/md-docs/projects/advanced-hydrological-modeling-and-simulation-platform.md" className="topic-item">
                    <span className="topic-title">Hydrological Modeling</span>
                    <span className="topic-desc">AquaFlow platform for water resource management and flood prediction</span>
                    <div className="topic-tags">
                      <span>Python</span>
                      <span>TensorFlow</span>
                      <span>PostGIS</span>
                    </div>
                  </Link>
                  <Link to="/md-docs/techdocs/data-analysis/data-analysis-intro.md" className="topic-item">
                    <span className="topic-title">Data Analysis & Visualization</span>
                    <span className="topic-desc">Statistical analysis, data processing, and visualization techniques</span>
                    <div className="topic-tags">
                      <span>D3.js</span>
                      <span>React</span>
                      <span>Python</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="topic-category">
                <h3>💻 Frontend Development</h3>
                <div className="topic-items">
                  <Link to="/md-docs/techdocs/projects/d3js-react-ui.md" className="topic-item">
                    <span className="topic-title">Data-Driven UI with D3.js</span>
                    <span className="topic-desc">Creating interactive visualizations using React and D3.js</span>
                    <div className="topic-tags">
                      <span>React</span>
                      <span>D3.js</span>
                      <span>TypeScript</span>
                    </div>
                  </Link>
                  <Link to="/md-docs/techdocs/frontend/react" className="topic-item">
                    <span className="topic-title">Modern React Patterns</span>
                    <span className="topic-desc">Advanced React concepts, hooks, and best practices</span>
                    <div className="topic-tags">
                      <span>React 18</span>
                      <span>Hooks</span>
                      <span>TypeScript</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="topic-category">
                <h3>☁️ Cloud & DevOps</h3>
                <div className="topic-items">
                  <Link to="/md-docs/techdocs/cloud/cloud-computing.md" className="topic-item">
                    <span className="topic-title">Cloud Architecture</span>
                    <span className="topic-desc">AWS, Azure, and cloud-native application development</span>
                    <div className="topic-tags">
                      <span>AWS</span>
                      <span>Docker</span>
                      <span>Kubernetes</span>
                    </div>
                  </Link>
                  <Link to="/md-docs/techdocs/devops/ci-cd-pipelines.md" className="topic-item">
                    <span className="topic-title">CI/CD Pipelines</span>
                    <span className="topic-desc">Automated deployment and continuous integration strategies</span>
                    <div className="topic-tags">
                      <span>GitHub Actions</span>
                      <span>Docker</span>
                      <span>Automation</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="topic-category">
                <h3>🔬 Machine Learning & AI</h3>
                <div className="topic-items">
                  <Link to="/md-docs/techdocs/machinelearning" className="topic-item">
                    <span className="topic-title">ML Projects & Research</span>
                    <span className="topic-desc">Machine learning applications and research implementations</span>
                    <div className="topic-tags">
                      <span>TensorFlow</span>
                      <span>Python</span>
                      <span>Jupyter</span>
                    </div>
                  </Link>
                  <Link to="/md-docs/techdocs/data-analysis/data-science-python" className="topic-item">
                    <span className="topic-title">Data Science with Python</span>
                    <span className="topic-desc">Scientific computing, analysis, and modeling techniques</span>
                    <div className="topic-tags">
                      <span>NumPy</span>
                      <span>Pandas</span>
                      <span>Scikit-learn</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
