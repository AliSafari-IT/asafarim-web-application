import React from 'react';
import { Link } from 'react-router-dom';
import { IProjectSummary } from '../../interfaces/IProject';
import './ProjectGrid.css';

interface ProjectGridProps {
  projects: IProjectSummary[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  itemsPerPage: number;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="project-grid-loading">
        <div className="loading-spinner"></div>
        <span>Loading projects...</span>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="project-grid-empty">
        <p>No projects found.</p>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => onPageChange(currentPage - 1)}
          className="pagination-btn"
        >
          ‹
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => onPageChange(currentPage + 1)}
          className="pagination-btn"
        >
          ›
        </button>
      );
    }

    return (
      <div className="pagination">
        {pages}
      </div>
    );
  };

  return (
    <div className="project-grid-container">
      <div className="project-grid">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="project-card"
          >
            {project.thumbnailUrl && (
              <div className="project-card-image">
                <img src={project.thumbnailUrl} alt={project.title} />
              </div>
            )}
            <div className="project-card-content">
              <h3 className="project-card-title">{project.title}</h3>
              {project.description && (
                <p className="project-card-description">
                  {project.description.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description}
                </p>
              )}
              <div className="project-card-meta">
                <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
                <span className="progress-badge">
                  {project.progress}%
                </span>
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="project-card-tags">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="tag-more">+{project.tags.length - 3}</span>
                  )}
                </div>
              )}
              <div className="project-card-footer">
                <span className="project-author">{project.userUsername}</span>
                <span className="project-date">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

export default ProjectGrid;
