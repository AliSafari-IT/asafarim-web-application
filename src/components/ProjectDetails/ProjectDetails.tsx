import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectService } from '../../services/ProjectService';
import { IProject } from '../../interfaces/IProject';
import { useAuth } from '../../context/AuthContext';
import './ProjectDetails.css';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<IProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError('Project ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await ProjectService.getProject(id);
        if (response.success && response.data) {
          setProject(response.data);
        } else {
          setError(response.message || 'Failed to load project');
        }
      } catch (error) {
        setError('An unexpected error occurred');
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await ProjectService.deleteProject(project.id);
      if (response.success) {
        navigate('/projects');
      } else {
        setError(response.message || 'Failed to delete project');
      }
    } catch (error) {
      setError('An unexpected error occurred while deleting');
      console.error('Error deleting project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="project-details-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-container">
        <div className="error-message">
          {error}
        </div>
        <Link to="/projects" className="btn btn-secondary">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-container">
        <div className="error-message">
          Project not found
        </div>
        <Link to="/projects" className="btn btn-secondary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const canEdit = user && (user.id === project.userId || user.role === 'admin');

  return (
    <div className="project-details-container">
      <div className="project-header">
        <div className="project-header-content">
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <div className="project-meta">
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
              <span className={`priority-badge ${project.priority.toLowerCase()}`}>
                {project.priority} Priority
              </span>
              <span className="progress-badge">
                {project.progress}% Complete
              </span>
            </div>
          </div>
          
          <div className="project-actions">
            {canEdit && (
              <>
                <Link 
                  to={`/projects/${project.id}/edit`} 
                  className="btn btn-primary"
                >
                  Edit Project
                </Link>
                <button 
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </>
            )}
            <Link to="/projects" className="btn btn-secondary">
              Back to Projects
            </Link>
          </div>
        </div>
        
        {project.thumbnailUrl && (
          <div className="project-thumbnail">
            <img src={project.thumbnailUrl} alt={project.title} />
          </div>
        )}
      </div>

      <div className="project-content">
        <div className="project-main">
          <section className="project-section">
            <h2>Description</h2>
            <div className="project-description">
              {project.description || 'No description provided.'}
            </div>
          </section>

          {project.tags && project.tags.length > 0 && (
            <section className="project-section">
              <h2>Tags</h2>
              <div className="tags-display">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="project-section">
            <h2>Project Links</h2>
            <div className="project-links">
              {project.repositoryUrl && (
                <a 
                  href={project.repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Repository
                </a>
              )}
              
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                  </svg>
                  Live Demo
                </a>
              )}
            </div>
          </section>
        </div>

        <div className="project-sidebar">
          <section className="project-section">
            <h2>Project Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Created</label>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              
              {project.startDate && (
                <div className="detail-item">
                  <label>Start Date</label>
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {project.endDate && (
                <div className="detail-item">
                  <label>End Date</label>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {project.dueDate && (
                <div className="detail-item">
                  <label>Due Date</label>
                  <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {project.budget && (
                <div className="detail-item">
                  <label>Budget</label>
                  <span>${project.budget.toLocaleString()}</span>
                </div>
              )}
              
              <div className="detail-item">
                <label>Visibility</label>
                <span>{project.isPublic ? 'Public' : 'Private'}</span>
              </div>
              
              <div className="detail-item">
                <label>Featured</label>
                <span>{project.isFeatured ? 'Yes' : 'No'}</span>
              </div>
              
              {project.userUsername && (
                <div className="detail-item">
                  <label>Author</label>
                  <span>{project.userUsername}</span>
                </div>
              )}
              
              {project.techStackName && (
                <div className="detail-item">
                  <label>Tech Stack</label>
                  <span>{project.techStackName}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
