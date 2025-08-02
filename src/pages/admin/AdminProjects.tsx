import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProjectService } from "../../services/ProjectService";
import { IProjectSummary } from "../../interfaces/IProject";
import "./AdminProjects.css";
import {
  ButtonComponent,
  CallToActionPageHeader,
  DDItems,
  FancyPageHeader,
  HeaderComponent,
  HeroPageHeader,
  AdminHeader,
  SearchItems,
} from "@asafarim/shared";

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
  sortOrder: "asc" | "desc";
}

const AdminProjects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<AdminProjectsState>({
    projects: [],
    loading: true,
    error: null,
    selectedProjects: new Set(),
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: "",
    statusFilter: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Check if user is admin
  useEffect(() => {
    console.log("AdminProjects: User role check - user:", user);
    console.log("AdminProjects: User role:", user?.role);
    console.log("AdminProjects: Is admin?", user?.role === "Admin");

    if (user && user.role !== "Admin") {
      console.log("AdminProjects: Access denied for user role:", user.role);
      setState((prev) => ({
        ...prev,
        error: "Access denied. Admin privileges required.",
        loading: false,
      }));
      return;
    }
  }, [user]);

  // Load projects
  const loadProjects = async () => {
    if (!user || user.role !== "Admin") return;

    console.log(
      "AdminProjects: Loading projects for admin user:",
      user.username
    );
    console.log("AdminProjects: User role:", user.role);
    console.log("AdminProjects: API call parameters:", {
      currentPage: state.currentPage,
      pageSize: 20,
      searchTerm: state.searchTerm || undefined,
      statusFilter: state.statusFilter || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    });

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await ProjectService.getAdminProjects(
        state.currentPage,
        20, // items per page
        state.searchTerm || undefined,
        state.statusFilter || undefined,
        state.sortBy,
        state.sortOrder
      );

      console.log("AdminProjects: API response:", response);
      console.log("AdminProjects: Response success:", response.success);
      console.log("AdminProjects: Response data:", response.data);
      console.log("AdminProjects: Response type:", typeof response.data);
      console.log("AdminProjects: Is array:", Array.isArray(response.data));

      if (response.success) {
        // Handle paginated response structure
        const data = response.data;
        console.log("AdminProjects: Paginated response data:", data);

        // The response might have different structures, let's handle both
        let projects: IProjectSummary[] = [];
        let totalCount = 0;
        let totalPages = 1;

        if (Array.isArray(data)) {
          // Direct array response
          projects = data;
          totalCount = data.length;
          totalPages = 1;
        } else if (data && typeof data === "object") {
          // Paginated response object
          if ("items" in data && Array.isArray(data.items)) {
            projects = data.items;
            totalCount = data.totalCount || data.items.length;
            totalPages = data.totalPages || 1;
          } else if ("data" in data && Array.isArray(data.data)) {
            projects = data.data;
            totalCount = data.totalCount || data.data.length;
            totalPages = data.totalPages || 1;
          } else {
            // Fallback: check if data itself is the projects array
            console.log(
              "AdminProjects: Unexpected response structure, keys:",
              Object.keys(data)
            );
            const dataValues = Object.values(data);
            const arrayValue = dataValues.find((val) => Array.isArray(val));
            if (arrayValue) {
              projects = arrayValue as IProjectSummary[];
              totalCount = projects.length;
            }
          }
        }

        console.log("AdminProjects: Extracted projects:", projects);
        console.log("AdminProjects: Extracted count:", totalCount);

        setState((prev) => ({
          ...prev,
          projects: projects,
          totalPages: totalPages,
          totalCount: totalCount,
          loading: false,
        }));

        console.log(
          "AdminProjects: Updated state with",
          projects.length,
          "projects"
        );
      } else {
        console.log("AdminProjects: API call failed:", response.message);
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to load projects",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error loading projects",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadProjects();
  }, [
    state.currentPage,
    state.searchTerm,
    state.statusFilter,
    state.sortBy,
    state.sortOrder,
    user,
  ]);

  // Handle project selection
  const toggleProjectSelection = (projectId: string) => {
    setState((prev) => {
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
    setState((prev) => ({
      ...prev,
      selectedProjects: new Set(prev.projects.map((p) => p.id)),
    }));
  };

  const clearSelection = () => {
    setState((prev) => ({ ...prev, selectedProjects: new Set() }));
  };

  // Handle batch operations
  const handleBatchDelete = async () => {
    if (state.selectedProjects.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${state.selectedProjects.size} selected project(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const deletePromises = Array.from(state.selectedProjects).map(
        (projectId) => ProjectService.deleteProject(projectId)
      );

      await Promise.all(deletePromises);

      setState((prev) => ({ ...prev, selectedProjects: new Set() }));
      await loadProjects();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to delete some projects",
        loading: false,
      }));
    }
  };

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (state.selectedProjects.size === 0) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Note: This would require a batch update endpoint in the backend
      // For now, we'll update each project individually
      const updatePromises = Array.from(state.selectedProjects).map(
        async (projectId) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (project) {
            return ProjectService.updateProject(projectId, {
              ...project,
              status: newStatus,
            });
          }
        }
      );

      await Promise.all(updatePromises);

      setState((prev) => ({ ...prev, selectedProjects: new Set() }));
      await loadProjects();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to update some projects",
        loading: false,
      }));
    }
  };

  // Handle individual project deletion
  const handleDeleteProject = async (
    projectId: string,
    projectTitle: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await ProjectService.deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to delete project",
      }));
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setState((prev) => ({
      ...prev,
      sortBy: newSortBy,
      sortOrder:
        prev.sortBy === newSortBy && prev.sortOrder === "asc" ? "desc" : "asc",
      currentPage: 1,
    }));
  };

  if (!user || user.role !== "Admin") {
    return (
      <div className="admin-projects-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const projectManagementIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4H18V2H16V4Z" />
      <path d="M16 8H18V6H16V8Z" />
      <path d="M16 12H18V10H16V12Z" />
      <path d="M13 4H15V2H13V4Z" />
      <path d="M13 8H15V6H13V8Z" />
      <path d="M13 12H15V10H13V12Z" />
      <rect x="2" y="3" width="9" height="2" rx="1" />
      <rect x="2" y="7" width="7" height="2" rx="1" />
      <rect x="2" y="11" width="8" height="2" rx="1" />
      <path d="M20 14H4C3.45 14 3 14.45 3 15V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V15C21 14.45 20.55 14 20 14ZM19 19H5V16H19V19Z" />
      <circle cx="7" cy="17.5" r="0.8" fill="currentColor" />
      <circle cx="12" cy="17.5" r="0.8" fill="currentColor" />
      <circle cx="17" cy="17.5" r="0.8" fill="currentColor" />
    </svg>
  );

  return (
    <div className="admin-projects-container">
      <AdminHeader
        title="Project Management"
        subtitle="Manage user projects efficiently"
        totalCount={state.totalCount}
        itemName="Projects"
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        showPagination={state.totalPages > 1}
        style={{ display: "flex", alignItems: "center", gap: "20px", borderRadius: "25%", backgroundColor: "var(--bg-color)" }}
        key={"admin-projects-header"}
        actions={<ButtonComponent
          onClick={() => navigate("/projects/new")}
          icon="+"
          iconPosition="left"
          replace={"true"}
          disabled={state.loading}
          loading={state.loading}
          className="btn"
          size="lg"
          block={true}
          title="Create New Project"
        />}
      />

      {/* Search and Filters */}
      <div className="admin-controls">
        <SearchItems
          searchTerm={state.searchTerm}
          onSearchChange={(newSearchTerm) =>
            setState((prev) => ({ ...prev, searchTerm: newSearchTerm }))
          }
          placeholder="Search projects..."
          searchType="minimal"
          
        />

        <div className="filter-controls">
          <DDItems
            selectedValue={state.statusFilter}
            onValueChange={(value) =>
              setState((prev) => ({
                ...prev,
                statusFilter: value,
                currentPage: 1,
              }))
            }
            items={[
              { value: "Planning", label: "Planning" },
              { value: "In Progress", label: "In Progress" },
              { value: "On Hold", label: "On Hold" },
              { value: "Completed", label: "Completed" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            placeholder="All Statuses"
            dropdownType="compact"
          />

          <DDItems
            selectedValue={`${state.sortBy}-${state.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              setState((prev) => ({
                ...prev,
                sortBy,
                sortOrder: sortOrder as "asc" | "desc",
                currentPage: 1,
              }));
            }}
            items={[
              { value: "createdAt-desc", label: "Newest First" },
              { value: "createdAt-asc", label: "Oldest First" },
              { value: "title-asc", label: "Title A-Z" },
              { value: "title-desc", label: "Title Z-A" },
              { value: "status-asc", label: "Status A-Z" },
              { value: "progress-desc", label: "Progress High-Low" },
            ]}
            placeholder="Sort by..."
            dropdownType="compact"
          />
        </div>
      </div>

      {/* Batch Operations */}
      {state.selectedProjects.size > 0 && (
        <div className="batch-operations">
          <div className="batch-info">
            <span>{state.selectedProjects.size} project(s) selected</span>
            <button onClick={clearSelection} className="btn btn-link">
              Clear Selection
            </button>
          </div>
          <div className="batch-actions">
            <button
              onClick={() => handleBatchStatusUpdate("On Hold")}
              className="btn btn-warning"
            >
              Set On Hold
            </button>
            <button
              onClick={() => handleBatchStatusUpdate("Completed")}
              className="btn btn-success"
            >
              Mark Completed
            </button>
            <button onClick={handleBatchDelete} className="btn btn-danger">
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
            <button onClick={loadProjects} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : state.projects.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
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
                  checked={
                    state.selectedProjects.size === state.projects.length &&
                    state.projects.length > 0
                  }
                  onChange={
                    state.selectedProjects.size === state.projects.length
                      ? clearSelection
                      : selectAllProjects
                  }
                />
              </div>
              <div
                className="header-cell sortable"
                onClick={() => handleSortChange("title")}
              >
                Project
                {state.sortBy === "title" && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
              <div
                className="header-cell sortable"
                onClick={() => handleSortChange("status")}
              >
                Status
                {state.sortBy === "status" && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
              <div
                className="header-cell sortable"
                onClick={() => handleSortChange("progress")}
              >
                Progress
                {state.sortBy === "progress" && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
              <div className="header-cell">Owner</div>
              <div
                className="header-cell sortable"
                onClick={() => handleSortChange("createdAt")}
              >
                Created
                {state.sortBy === "createdAt" && (
                  <span className={`sort-indicator ${state.sortOrder}`}>
                    {state.sortOrder === "asc" ? "↑" : "↓"}
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
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="project-thumbnail"
                      />
                    )}
                    <div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="project-title"
                      >
                        {project.title}
                      </Link>
                      {project.description && (
                        <p className="project-description">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table-cell">
                  <span
                    className={`status-badge ${project.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
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
                  <span className="owner-info">
                    {project.userUsername || "Unknown"}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="date-info">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="actions-cell table-cell">
                  <ButtonComponent
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    variant="primary"
                    iconPosition="only"
                    icon={
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                      </svg>
                    }
                    outline="info"
                    title="Edit Project"
                    label="Edit"
                  />
                  <ButtonComponent
                    onClick={() =>
                      handleDeleteProject(project.id, project.title)
                    }
                    variant="warning"
                    size="xs"
                    iconPosition="only"
                    icon={
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    }
                    outline="danger"
                    title="Delete Project"
                  />
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
            onClick={() =>
              setState((prev) => ({
                ...prev,
                currentPage: Math.max(1, prev.currentPage - 1),
              }))
            }
            disabled={state.currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>

          <div className="page-info">
            Page {state.currentPage} of {state.totalPages}
          </div>

          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
              }))
            }
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
