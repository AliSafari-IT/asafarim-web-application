import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TechStackService } from "../../services/TechStackService";
import { ITechStack } from "../../interfaces/ITechStack";
import AdminHeader from "../../components/AdminHeader";
import "./AdminTechStacks.css";

interface AdminTechStacksState {
  techStacks: ITechStack[];
  loading: boolean;
  error: string | null;
  selectedTechStacks: Set<string>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  categoryFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  showCreateForm: boolean;
  editingTechStack: ITechStack | null;
}

interface CreateTechStackForm {
  name: string;
  description: string;
  category:
    | "Frontend"
    | "Backend"
    | "Database"
    | "DevOps"
    | "Mobile"
    | "Language"
    | "Framework"
    | "Library"
    | "Tool"
    | "Cloud";
  techVersion: string;
  url: string;
  icon: string;
  color: string;
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

const AdminTechStacks: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminTechStacksState>({
    techStacks: [],
    loading: true,
    error: null,
    selectedTechStacks: new Set(),
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: "",
    categoryFilter: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    showCreateForm: false,
    editingTechStack: null,
  });

  const [createForm, setCreateForm] = useState<CreateTechStackForm>({
    name: "",
    description: "",
    category: "Frontend",
    techVersion: "",
    url: "",
    icon: "",
    color: "",
    proficiencyLevel: "Beginner",
  });

  // Check if user is admin
  useEffect(() => {
    console.log("AdminTechStacks: User role check - user:", user);
    console.log("AdminTechStacks: User role:", user?.role);
    console.log("AdminTechStacks: Is admin?", user?.role === "Admin");

    if (user && user.role !== "Admin") {
      console.log("AdminTechStacks: Access denied for user role:", user.role);
      setState((prev) => ({
        ...prev,
        error: "Access denied. Admin privileges required.",
        loading: false,
      }));
      return;
    }
  }, [user]);

  // Load tech stacks
  const loadTechStacks = async () => {
    if (!user || user.role !== "Admin") return;

    console.log(
      "AdminTechStacks: Loading tech stacks for admin user:",
      user.username
    );
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await TechStackService.getTechStacks(
        state.currentPage,
        20, // items per page
        state.searchTerm || undefined,
        state.categoryFilter || undefined,
        state.sortBy,
        state.sortOrder
      );

      console.log("AdminTechStacks: API response:", response);

      if (response.success && response.data) {
        const data = response.data;
        let techStacks: ITechStack[] = [];
        let totalCount = 0;
        let totalPages = 1;

        if (Array.isArray(data)) {
          techStacks = data;
          totalCount = data.length;
          totalPages = 1;
        } else if (data && typeof data === "object") {
          if ("techStacks" in data && Array.isArray(data.techStacks)) {
            techStacks = data.techStacks;
            totalCount = data.totalCount || data.techStacks.length;
            totalPages = data.totalPages || 1;
          } else if ("items" in data && Array.isArray(data.items)) {
            techStacks = data.items;
            totalCount = data.totalCount || data.items.length;
            totalPages = data.totalPages || 1;
          } else if ("data" in data && Array.isArray(data.data)) {
            techStacks = data.data;
            totalCount = data.totalCount || data.data.length;
            totalPages = data.totalPages || 1;
          }
        }

        setState((prev) => ({
          ...prev,
          techStacks: techStacks,
          totalPages: totalPages,
          totalCount: totalCount,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to load tech stacks",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error loading tech stacks",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadTechStacks();
  }, [state.currentPage, state.searchTerm, state.categoryFilter, user]);

  // Handle tech stack selection
  const handleSelectTechStack = (techStackId: string) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedTechStacks);
      if (newSelected.has(techStackId)) {
        newSelected.delete(techStackId);
      } else {
        newSelected.add(techStackId);
      }
      return { ...prev, selectedTechStacks: newSelected };
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    setState((prev) => {
      const allSelected =
        prev.selectedTechStacks.size === prev.techStacks.length;
      const newSelected = allSelected
        ? new Set<string>()
        : new Set(prev.techStacks.map((ts) => ts.id));
      return { ...prev, selectedTechStacks: newSelected };
    });
  };

  // Handle create tech stack
  const handleCreateTechStack = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const techStackData = {
        ...createForm,
        isActive: true,
      };

      const response = await TechStackService.createTechStack(techStackData);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          showCreateForm: false,
          loading: false,
        }));
        setCreateForm({
          name: "",
          description: "",
          category: "Frontend",
          techVersion: "",
          url: "",
          icon: "",
          color: "",
          proficiencyLevel: "Beginner",
        });
        await loadTechStacks();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to create tech stack",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error creating tech stack",
        loading: false,
      }));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (state.selectedTechStacks.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${state.selectedTechStacks.size} tech stack(s)?`
      )
    ) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const techStackIds = Array.from(state.selectedTechStacks);
      const response = await TechStackService.bulkDeleteTechStacks(
        techStackIds
      );

      if (response.success) {
        setState((prev) => ({
          ...prev,
          selectedTechStacks: new Set(),
          loading: false,
        }));
        await loadTechStacks();
      } else {
        // Handle bulk delete errors with more specific messaging
        let errorMessage = response.message || "Failed to delete tech stacks";

        if (
          errorMessage.includes("Failed to delete") &&
          errorMessage.includes("out of")
        ) {
          errorMessage +=
            ". Some tech stacks may be in use by projects and cannot be deleted.";
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error deleting tech stacks",
        loading: false,
      }));
    }
  };

  // Handle individual delete
  const handleDeleteTechStack = async (techStackId: string) => {
    if (!confirm("Are you sure you want to delete this tech stack?")) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await TechStackService.deleteTechStack(techStackId);

      console.log("Delete response:", response);

      if (response.success) {
        setState((prev) => ({ ...prev, loading: false }));
        await loadTechStacks();
      } else {
        // Show more specific error message
        let errorMessage = response.message || "Failed to delete tech stack";

        // Handle specific error cases for better UX
        if (
          response.statusCode === 400 &&
          (response.message?.includes("being used by") ||
            response.message?.includes("currently being used"))
        ) {
          const projectCount =
            response.message.match(/(\d+) project\(s?\)/)?.[1] || "some";
          errorMessage = `⚠️ Cannot Delete Tech Stack\n\nThis tech stack is currently being used by ${projectCount} project${
            projectCount === "1" ? "" : "s"
          }. You must remove it from ${
            projectCount === "1" ? "that project" : "those projects"
          } before you can delete it.`;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Delete error:", error);
      setState((prev) => ({
        ...prev,
        error: "Error deleting tech stack",
        loading: false,
      }));
    }
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      searchTerm,
      currentPage: 1,
    }));
  };

  // Handle category filter
  const handleCategoryFilter = (categoryFilter: string) => {
    setState((prev) => ({
      ...prev,
      categoryFilter,
      currentPage: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  if (!user) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (user.role !== "Admin") {
    return (
      <div className="admin-error">
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <Link to="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="admin-techstacks">
      <AdminHeader
        title="Tech Stack Management"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.33,7 14.35,8.12 14.35,9.5C14.35,10.88 13.33,12 12,12C10.67,12 9.65,10.88 9.65,9.5C9.65,8.12 10.67,7 12,7M18,14.25C18,16.18 15.58,17.75 12,17.75C8.42,17.75 6,16.18 6,14.25V13.5C6,13.5 8.21,14.75 12,14.75C15.79,14.75 18,13.5 18,13.5V14.25Z" />
          </svg>
        }
        totalCount={state.totalCount}
        itemName="Tech Stacks"
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        showPagination={state.totalPages > 1}
      />

      {state.error && (
        <div
          className={`admin-error ${
            state.error.includes("currently being used by") ||
            state.error.includes("being used by")
              ? "admin-error-warning"
              : ""
          }`}
        >
          <p>{state.error}</p>
          {(state.error.includes("currently being used by") ||
            state.error.includes("being used by")) && (
            <div className="error-help">
              <small>
                💡 <strong>Tip:</strong> To delete this tech stack, first remove
                it from all projects that are using it, then try deleting again.
              </small>
            </div>
          )}
          <button
            onClick={() => setState((prev) => ({ ...prev, error: null }))}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="admin-controls">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search tech stacks..."
            value={state.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={state.categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
            <option value="Mobile">Mobile</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="action-controls">
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                showCreateForm: !prev.showCreateForm,
              }))
            }
            className="create-btn"
          >
            {state.showCreateForm ? "Cancel" : "Add Tech Stack"}
          </button>

          {state.selectedTechStacks.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
              disabled={state.loading}
            >
              Delete Selected ({state.selectedTechStacks.size})
            </button>
          )}
        </div>
      </div>

      {state.showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateTechStack} className="create-form">
            <h3>Add New Tech Stack</h3>

            <div className="form-row">
              <input
                type="text"
                placeholder="Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="form-input"
              />

              <input
                type="text"
                placeholder="Version"
                value={createForm.techVersion}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    techVersion: e.target.value,
                  }))
                }
                className="form-input"
              />
            </div>

            <div className="form-row">
              <select
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    category: e.target.value as any,
                  }))
                }
                required
                className="form-select"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Mobile">Mobile</option>
                <option value="Language">Language</option>
                <option value="Framework">Framework</option>
                <option value="Library">Library</option>
                <option value="Tool">Tool</option>
                <option value="Cloud">Cloud</option>
              </select>

              <input
                type="url"
                placeholder="Icon URL"
                value={createForm.icon}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="form-input"
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Color (hex)"
                value={createForm.color}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, color: e.target.value }))
                }
                className="form-input"
              />

              <select
                value={createForm.proficiencyLevel}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    proficiencyLevel: e.target.value as any,
                  }))
                }
                className="form-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="form-textarea"
              rows={3}
            />

            <input
              type="url"
              placeholder="URL/Documentation"
              value={createForm.url}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, url: e.target.value }))
              }
              className="form-input"
            />

            <div className="form-buttons">
              <button
                type="submit"
                className="submit-btn"
                disabled={state.loading}
              >
                Create Tech Stack
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, showCreateForm: false }))
                }
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {state.loading ? (
        <div className="admin-loading">Loading tech stacks...</div>
      ) : (
        <>
          <div className="techstacks-table-container">
            <table className="techstacks-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        state.techStacks.length > 0 &&
                        state.selectedTechStacks.size ===
                          state.techStacks.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.techStacks.map((techStack) => (
                  <tr key={techStack.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={state.selectedTechStacks.has(techStack.id)}
                        onChange={() => handleSelectTechStack(techStack.id)}
                      />
                    </td>
                    <td>
                      {techStack.icon && (
                        <img
                          src={techStack.icon}
                          alt={techStack.name}
                          className="tech-icon"
                        />
                      )}
                    </td>
                    <td>
                      <div className="tech-name">
                        {techStack.name}
                        {techStack.url && (
                          <a
                            href={techStack.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-link"
                            title="Documentation"
                          >
                            📚
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`category-badge category-${techStack.category.toLowerCase()}`}
                      >
                        {techStack.category}
                      </span>
                    </td>
                    <td>{techStack.techVersion || "N/A"}</td>
                    <td className="description-cell">
                      {techStack.description &&
                      techStack.description.length > 100
                        ? `${techStack.description.substring(0, 100)}...`
                        : techStack.description || "No description"}
                    </td>
                    <td>
                      {new Date(techStack.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDeleteTechStack(techStack.id)}
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

export default AdminTechStacks;
