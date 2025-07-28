import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RepositoryService } from '../../services/RepositoryService';
import { IRepository } from '../../interfaces/IRepository';
import './AdminRepositories.css';
import AdminHeader from '../../components/AdminHeader';
import SearchItems from '../../components/SearchItems';

interface AdminRepositoriesState {
  repositories: IRepository[];
  loading: boolean;
  error: string | null;
  selectedRepositories: Set<string>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  platformFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showCreateForm: boolean;
  editingRepository: IRepository | null;
}

interface CreateRepositoryForm {
  name: string;
  description: string;
  url: string;
  branch: string;
  isPrivate: boolean;
  language: string;
  stars: number;
  forks: number;
}

const AdminRepositories: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminRepositoriesState>({
    repositories: [],
    loading: true,
    error: null,
    selectedRepositories: new Set(),
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: '',
    platformFilter: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    showCreateForm: false,
    editingRepository: null
  });

  const [createForm, setCreateForm] = useState<CreateRepositoryForm>({
    name: '',
    description: '',
    url: '',
    branch: 'main',
    isPrivate: false,
    language: '',
    stars: 0,
    forks: 0
  });

  // Check if user is admin
  useEffect(() => {
    console.log('AdminRepositories: User role check - user:', user);
    console.log('AdminRepositories: User role:', user?.role);
    console.log('AdminRepositories: Is admin?', user?.role === 'Admin');
    
    if (user && user.role !== 'Admin') {
      console.log('AdminRepositories: Access denied for user role:', user.role);
      setState(prev => ({ ...prev, error: 'Access denied. Admin privileges required.', loading: false }));
      return;
    }
  }, [user]);

  // Load repositories
  const loadRepositories = async () => {
    if (!user || user.role !== 'Admin') return;

    console.log('AdminRepositories: Loading repositories for admin user:', user.username);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await RepositoryService.getRepositories(
        state.currentPage,
        20, // items per page
        state.searchTerm || undefined,
        state.platformFilter || undefined,
        state.sortBy,
        state.sortOrder
      );
      
      console.log('AdminRepositories: API response:', response);

      if (response.success && response.data) {
        const data = response.data;
        let repositories: IRepository[] = [];
        let totalCount = 0;
        let totalPages = 1;
        
        if (Array.isArray(data)) {
          repositories = data;
          totalCount = data.length;
          totalPages = 1;
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            repositories = data.items;
            totalCount = data.totalCount || data.items.length;
            totalPages = data.totalPages || 1;
          } else if ('data' in data && Array.isArray(data.data)) {
            repositories = data.data;
            totalCount = data.totalCount || data.data.length;
            totalPages = data.totalPages || 1;
          }
        }
        
        setState(prev => ({
          ...prev,
          repositories: repositories,
          totalPages: totalPages,
          totalCount: totalCount,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to load repositories',
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error loading repositories',
        loading: false
      }));
    }
  };

  useEffect(() => {
    loadRepositories();
  }, [state.currentPage, state.searchTerm, state.platformFilter, user]);

  // Handle repository selection
  const handleSelectRepository = (repositoryId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedRepositories);
      if (newSelected.has(repositoryId)) {
        newSelected.delete(repositoryId);
      } else {
        newSelected.add(repositoryId);
      }
      return { ...prev, selectedRepositories: newSelected };
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    setState(prev => {
      const allSelected = prev.selectedRepositories.size === prev.repositories.length;
      const newSelected = allSelected ? new Set<string>() : new Set(prev.repositories.map(r => r.id));
      return { ...prev, selectedRepositories: newSelected };
    });
  };

  // Handle create repository
  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const repositoryData = {
        ...createForm,
        isActive: true
      };
      
      const response = await RepositoryService.createRepository(repositoryData);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          showCreateForm: false,
          loading: false 
        }));
        setCreateForm({
          name: '',
          description: '',
          url: '',
          branch: 'main',
          isPrivate: false,
          language: '',
          stars: 0,
          forks: 0
        });
        await loadRepositories();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to create repository',
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Error creating repository',
        loading: false 
      }));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (state.selectedRepositories.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${state.selectedRepositories.size} repository(ies)?`)) {
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const repositoryIds = Array.from(state.selectedRepositories);
      const response = await RepositoryService.bulkDeleteRepositories(repositoryIds);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          selectedRepositories: new Set(), 
          loading: false 
        }));
        await loadRepositories();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to delete repositories',
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Error deleting repositories',
        loading: false 
      }));
    }
  };

  // Handle individual delete
  const handleDeleteRepository = async (repositoryId: string) => {
    if (!confirm('Are you sure you want to delete this repository?')) {
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await RepositoryService.deleteRepository(repositoryId);
      
      if (response.success) {
        setState(prev => ({ ...prev, loading: false }));
        await loadRepositories();
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to delete repository',
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Error deleting repository',
        loading: false 
      }));
    }
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ 
      ...prev, 
      searchTerm, 
      currentPage: 1 
    }));
  };

  // Handle platform filter
  const handlePlatformFilter = (platformFilter: string) => {
    setState(prev => ({ 
      ...prev, 
      platformFilter, 
      currentPage: 1 
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  if (!user) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (user.role !== 'Admin') {
    return (
      <div className="admin-error">
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <Link to="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  const repoManagementIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <path d="M8 6h8v2H8V6zm0 4h8v2H8v-2z"/>
      <rect x="6" y="4" width="12" height="2" rx="1"/>
      <rect x="6" y="18" width="8" height="2" rx="1"/>
    </svg>
  );

  return (
    <div className="admin-repositories">
      <AdminHeader
        title="Repository Management"
        icon={repoManagementIcon}
        itemName='Repositories'
        totalCount={state.totalCount}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
      />    

      {state.error && (
        <div className="admin-error">
          <p>{state.error}</p>
          <button onClick={() => setState(prev => ({ ...prev, error: null }))}>
            Dismiss
          </button>
        </div>
      )}

      <div className="admin-controls">
        <div className="search-controls">
          <SearchItems
            searchTerm={state.searchTerm}
            onSearchChange={handleSearch}
            placeholder="Search repositories..."
            className="search-input"
            searchType="minimal"
          />
          
          <select
            value={state.platformFilter}
            onChange={(e) => handlePlatformFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Languages</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C#">C#</option>
            <option value="Go">Go</option>
            <option value="Rust">Rust</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="action-controls">
          <button
            onClick={() => setState(prev => ({ ...prev, showCreateForm: !prev.showCreateForm }))}
            className="create-btn"
          >
            {state.showCreateForm ? 'Cancel' : 'Add Repository'}
          </button>
          
          {state.selectedRepositories.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
              disabled={state.loading}
            >
              Delete Selected ({state.selectedRepositories.size})
            </button>
          )}
        </div>
      </div>

      {state.showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateRepository} className="create-form">
            <h3>Add New Repository</h3>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Repository Name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="form-input"
              />
              
              <input
                type="url"
                placeholder="Repository URL"
                value={createForm.url}
                onChange={(e) => setCreateForm(prev => ({ ...prev, url: e.target.value }))}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Branch (default)"
                value={createForm.branch}
                onChange={(e) => setCreateForm(prev => ({ ...prev, branch: e.target.value }))}
                className="form-input"
              />
              
              <input
                type="text"
                placeholder="Primary Language"
                value={createForm.language}
                onChange={(e) => setCreateForm(prev => ({ ...prev, language: e.target.value }))}
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <input
                type="number"
                placeholder="Stars"
                value={createForm.stars}
                onChange={(e) => setCreateForm(prev => ({ ...prev, stars: parseInt(e.target.value) || 0 }))}
                className="form-input"
                min="0"
              />
              
              <input
                type="number"
                placeholder="Forks"
                value={createForm.forks}
                onChange={(e) => setCreateForm(prev => ({ ...prev, forks: parseInt(e.target.value) || 0 }))}
                className="form-input"
                min="0"
              />
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={createForm.isPrivate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
                Private Repository
              </label>
            </div>
            
            <textarea
              placeholder="Description"
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              rows={3}
            />
            
            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={state.loading}>
                Create Repository
              </button>
              <button 
                type="button" 
                onClick={() => setState(prev => ({ ...prev, showCreateForm: false }))}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {state.loading ? (
        <div className="admin-loading">Loading repositories...</div>
      ) : (
        <>
          <div className="repositories-table-container">
            <table className="repositories-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={state.repositories.length > 0 && state.selectedRepositories.size === state.repositories.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Language</th>
                  <th>Stars</th>
                  <th>Forks</th>
                  <th>Visibility</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.repositories.map((repository) => (
                  <tr key={repository.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={state.selectedRepositories.has(repository.id)}
                        onChange={() => handleSelectRepository(repository.id)}
                      />
                    </td>
                    <td>
                      <div className="repo-name">
                        <a 
                          href={repository.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="repo-link"
                        >
                          {repository.name}
                        </a>
                      </div>
                    </td>
                    <td>{repository.branch || 'main'}</td>
                    <td>{repository.language || 'N/A'}</td>
                    <td>{repository.stars || 0}</td>
                    <td>{repository.forks || 0}</td>
                    <td>
                      <span className={`visibility-badge ${repository.isPrivate ? 'private' : 'public'}`}>
                        {repository.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td className="description-cell">
                      {repository.description && repository.description.length > 100 
                        ? `${repository.description.substring(0, 100)}...`
                        : (repository.description || 'No description')
                      }
                    </td>
                    <td>{new Date(repository.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDeleteRepository(repository.id)}
                          className="delete-btn"
                          disabled={state.loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {state.currentPage} of {state.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === state.totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminRepositories;
