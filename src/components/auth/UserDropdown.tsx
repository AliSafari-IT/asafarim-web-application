import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/ProjectService';
import { IProjectSummary } from '../../interfaces/IProject';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userProjects, setUserProjects] = useState<IProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Load user projects when dropdown opens
  const loadUserProjects = async () => {
    if (projectsLoaded || projectsLoading || !user?.id) return;
    
    setProjectsLoading(true);
    try {
      const response = await ProjectService.getProjects(1, 5, undefined, undefined, undefined, undefined, user.id); // Load first 5 user projects
      if (response.success && response.data && response.data.items) {
        setUserProjects(response.data.items || []);
      } else if (response.statusCode === 401) {
        // Authentication error - don't show projects
        console.warn('Authentication required for user projects');
        setUserProjects([]);
      } else {
        console.error('Failed to load user projects:', response.message);
        setUserProjects([]);
      }
    } catch (error) {
      console.error('Error loading user projects:', error);
      setUserProjects([]);
    } finally {
      setProjectsLoading(false);
      setProjectsLoaded(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load projects when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserProjects();
    }
  }, [isOpen, user]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username;

  const initials = user.firstName && user.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : user.username.charAt(0).toUpperCase();

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={displayName} className="avatar-image" />
          ) : (
            <span className="avatar-initials">{initials}</span>
          )}
        </div>
        <span className="user-name">{displayName}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 9L1.5 4.5h9L6 9z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="avatar-image" />
                ) : (
                  <span className="avatar-initials">{initials}</span>
                )}
              </div>
              <div className="user-details">
                <div className="user-display-name">{displayName}</div>
                <div className="user-email">{user.email}</div>
                {!user.isEmailVerified && (
                  <div className="verification-status">
                    <span className="status-badge unverified">Email not verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <Link 
              to="/profile" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Profile
            </Link>
            
            <Link 
              to="/dashboard" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              Dashboard
            </Link>
            
            {/* User Projects Section */}
            <div className="dropdown-section projects-section">
              <div className="section-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span>My Projects</span>
                <Link 
                  to="/projects" 
                  className="view-all-link"
                  onClick={() => setIsOpen(false)}
                >
                  View All
                </Link>
              </div>
              
              {projectsLoading ? (
                <div className="projects-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading projects...</span>
                </div>
              ) : userProjects && userProjects.length > 0 ? (
                <div className="projects-list">
                  {userProjects?.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="project-item"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="project-info">
                        <div className="project-title">{project.title}</div>
                        <div className="project-meta">
                          <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                            {project.status}
                          </span>
                          <span className="project-progress">{project.progress}%</span>
                        </div>
                      </div>
                      {project.thumbnailUrl && (
                        <div className="project-thumbnail">
                          <img src={project.thumbnailUrl} alt={project.title} />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="no-projects">
                  <div className="no-projects-message">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                    <span>No projects yet</span>
                  </div>
                  {user ? (
                    <Link 
                      to="/projects/new" 
                      className="create-project-link"
                      onClick={() => setIsOpen(false)}
                    >
                      Create your first project
                    </Link>
                  ) : (
                    <div className="auth-required-message">
                      <span>Please log in to view your projects</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Link 
              to="/settings" 
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5a3.5,3.5 0 0,1 3.5,3.5A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
              Settings
            </Link>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button 
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
