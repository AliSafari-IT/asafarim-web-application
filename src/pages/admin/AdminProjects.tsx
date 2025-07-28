import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/ProjectService';
import { IProjectSummary } from '../../interfaces/IProject';
import './AdminProjects.css';

interface AdminProjectsState {
  projects: IProjectSummary[];
  loading: boolean;
  error: string | null;
  selectedProjects: Set<string>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const AdminProjects: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminProjectsState>({
    projects: [],
    loading: true,
    error: null,
    selectedProjects: new Set(),
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: '',
    statusFilter: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Check if user is admin
  useEffect(() => {
    console.log('AdminProjects: User role check - user:', user);
    console.log('AdminProjects: User role:', user?.role);
    console.log('AdminProjects: Is admin?', user?.role === 'Admin');
    
    if (user && user.role !== 'Admin') {
      console.log('AdminProjects: Access denied for user role:', user.role);
      setState(prev => ({ ...prev, error: 'Access denied. Admin privileges required.', loading: false }));
      return;
    }
  }, [user]);

  // Load projects
  const loadProjects = async () => {
    if (!user || user.role !== 'Admin') return;

    console.log('AdminProjects: Loading projects for admin user:', user.username);
    console.log('AdminProjects: User role:', user.role);
    console.log('AdminProjects: API call parameters:', {
      currentPage: state.currentPage,
      pageSize: 20,
      searchTerm: state.searchTerm || undefined,
      statusFilter: state.statusFilter || undefined
    });

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await ProjectService.getAdminProjects(
        state.currentPage,
        20, // items per page
        state.searchTerm || undefined,
        state.statusFilter || undefined
      );
      
      console.log('AdminProjects: API response:', response);
      console.log('AdminProjects: Response success:', response.success);
      console.log('AdminProjects: Response data:', response.data);
      console.log('AdminProjects: Response type:', typeof response.data);
      console.log('AdminProjects: Is array:', Array.isArray(response.data));

      if (response.success && response.data) {
        // Handle paginated response structure
        const data = response.data;
        console.log('AdminProjects: Paginated response data:', data);
        
        setState(prev => ({
          ...prev,
          projects: data.items || [],
          totalPages: data.totalPages || 1,
          totalCount: data.totalCount || 0,
          loading: false
        }));
        
        console.log('AdminProjects: Updated state with', data.items?.length || 0, 'projects');
      } else {
        console.log('AdminProjects: API call failed:', response.message);
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to load projects',
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error loading projects',
        loading: false
      }));
    }
  };

  useEffect(() => {
    loadProjects();
  }, [state.currentPage, state.searchTerm, state.statusFilter, user]);

  // Handle project selection
  const toggleProjectSelection = (projectId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedProjects);
      if (newSelected.has(projectId)) {
        newSelected.delete(projectId);
      } else {
        newSelected.add(projectId);
      }
      return { ...prev, selectedProjects: newSelected };
    });
  };

  const selectAllProjects = () => {
    setState(prev => ({
      ...prev,
      selectedProjects: new Set(prev.projects.map(p => p.id))
    }));
  };

  const clearSelection = () => {
    setState(prev => ({ ...prev, selectedProjects: new Set() }));
  };

  // Handle batch operations
  const handleBatchDelete = async () => {
    if (state.selectedProjects.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${state.selectedProjects.size} selected project(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const deletePromises = Array.from(state.selectedProjects).map(projectId =>
        ProjectService.deleteProject(projectId)
      );
      
      await Promise.all(deletePromises);
      
      setState(prev => ({ ...prev, selectedProjects: new Set() }));
      await loadProjects();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete some projects',
        loading: false
      }));
    }
  };

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (state.selectedProjects.size === 0) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Note: This would require a batch update endpoint in the backend
      // For now, we'll update each project individually
      const updatePromises = Array.from(state.selectedProjects).map(async (projectId) => {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          return ProjectService.updateProject(projectId, { ...project, status: newStatus });
        }
      });
      
      await Promise.all(updatePromises);
      
      setState(prev => ({ ...prev, selectedProjects: new Set() }));
      await loadProjects();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update some projects',
        loading: false
      }));
    }
  };

  // Handle individual project deletion
  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await ProjectService.deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete project'
      }));
    }
  };

  // Handle search and filters
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (newSortBy: string) => {
    setState(prev => ({
      ...prev,
      sortBy: newSortBy,
      sortOrder: prev.sortBy === newSortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      currentPage: 1
    }));
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="admin-projects-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-projects-container">
      <div className="admin-projects-header">
        <div className="header-content">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.33,7 14.35,8.12 14.35,9.5C14.35,10.88 13.33,12 12,12C10.67,12 9.65,10.88 9.65,9.5C9.65,8.12 10.67,7 12,7M18,14.25C18,16.18 15.58,17.75 12,17.75C8.42,17.75 6,16.18 6,14.25V13.5C6,13.5 8.21,14.75 12,14.75C15.79,14.75 18,13.5 18,13.5V14.25Z"/>
            </svg>
            Admin: Manage All Projects
          </h1>
          <div className="project-stats">
            <span className="stat-item">
              <strong>{state.totalCount}</strong> Total Projects
            </span>
            {state.selectedProjects.size > 0 && (
              <span className="stat-item selected">
                <strong>{state.selectedProjects.size}</strong> Selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filter-controls">
          <select
            value={state.statusFilter}
            onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value, currentPage: 1 }))}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={`${state.sortBy}-${state.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setState(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc', currentPage: 1 }));
            }}
            className="filter-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="status-asc">Status A-Z</option>
            <option value="progress-desc">Progress High-Low</option>
          </select>
        </div>
      </div>

      {/* Batch Operations */}
      {state.selectedProjects.size > 0 && (
        <div className="batch-operations">
          <div className="batch-info">
            <span>{state.selectedProjects.size} project(s) selected</span>
            <button onClick={clearSelection} className="btn btn-link">Clear Selection</button>
          </div>
          <div className="batch-actions">
            <button
              onClick={() => handleBatchStatusUpdate('On Hold')}
              className="btn btn-warning"
            >
              Set On Hold
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('Completed')}
              className="btn btn-success"
            >
              Mark Completed
            </button>
            <button
              onClick={handleBatchDelete}
              className="btn btn-danger"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="projects-table-container">
        {state.loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading projects...</span>
          </div>
        ) : state.error ? (
          <div className="error-state">
            <p>{state.error}</p>
            <button onClick={loadProjects} className="btn btn-primary">Retry</button>
          </div>
        ) : state.projects.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <h3>No Projects Found</h3>
            <p>No projects match your current filters.</p>
          </div>
        ) : (
          <div className="projects-table">
            <div className="table-header">
              <div className="header-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={state.selectedProjects.size === state.projects.length && state.projects.length > 0}
                  onChange={state.selectedProjects.size === state.projects.length ? clearSelection : selectAllProjects}
                />
              </div>
              <div className="header-cell sortable" onClick={() => handleSortChange('title')}>
                Project
                {state.sortBy === 'title' && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="header-cell sortable" onClick={() => handleSortChange('status')}>
                Status
                {state.sortBy === 'status' && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="header-cell sortable" onClick={() => handleSortChange('progress')}>
                Progress
                {state.sortBy === 'progress' && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="header-cell">Owner</div>
              <div className="header-cell sortable" onClick={() => handleSortChange('createdAt')}>
                Created
                {state.sortBy === 'createdAt' && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="header-cell">Actions</div>
            </div>

            {state.projects.map((project) => (
              <div key={project.id} className="table-row">
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={state.selectedProjects.has(project.id)}
                    onChange={() => toggleProjectSelection(project.id)}
                  />
                </div>
                <div className="table-cell project-cell">
                  <div className="project-info">
                    {project.thumbnailUrl && (
                      <img src={project.thumbnailUrl} alt={project.title} className="project-thumbnail" />
                    )}
                    <div>
                      <Link to={`/projects/${project.id}`} className="project-title">
                        {project.title}
                      </Link>
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.status}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                    <span className="progress-text">{project.progress}%</span>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="owner-info">{project.userUsername || 'Unknown'}</span>
                </div>
                <div className="table-cell">
                  <span className="date-info">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="table-cell actions-cell">
                  <Link 
                    to={`/projects/${project.id}/edit`} 
                    className="action-btn edit-btn"
                    title="Edit Project"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="action-btn delete-btn"
                    title="Delete Project"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={state.currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {state.currentPage} of {state.totalPages}
          </div>
          
          <button
            onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            disabled={state.currentPage === state.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
