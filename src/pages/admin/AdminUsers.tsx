import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserService } from "../../services/UserService";
import { IUser } from "../../interfaces/IUser";
import AdminHeader from "../../components/AdminHeader";
import "./AdminUsers.css";

interface AdminUsersState {
  users: IUser[];
  loading: boolean;
  error: string | null;
  selectedUsers: Set<string>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  roleFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminUsersState>({
    users: [],
    loading: true,
    error: null,
    selectedUsers: new Set(),
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: "",
    roleFilter: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Check if user is admin
  useEffect(() => {
    console.log("AdminUsers: User role check - user:", user);
    console.log("AdminUsers: User role:", user?.role);
    console.log("AdminUsers: Is admin?", user?.role === "Admin");

    if (user && user.role !== "Admin") {
      console.log("AdminUsers: Access denied for user role:", user.role);
      setState((prev) => ({
        ...prev,
        error: "Access denied. Admin privileges required.",
        loading: false,
      }));
      return;
    }
  }, [user]);

  // Load users
  const loadUsers = async () => {
    if (!user || user.role !== "Admin") return;

    console.log("AdminUsers: Loading users for admin user:", user.username);
    console.log("AdminUsers: User role:", user.role);
    console.log("AdminUsers: API call parameters:", {
      currentPage: state.currentPage,
      pageSize: 20,
      searchTerm: state.searchTerm || undefined,
      roleFilter: state.roleFilter || undefined,
    });

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await UserService.getUsers(
        state.currentPage,
        20, // items per page
        state.searchTerm || undefined,
        state.roleFilter || undefined,
        state.sortBy,
        state.sortOrder
      );

      console.log("AdminUsers: API response:", response);
      console.log("AdminUsers: Response success:", response.success);
      console.log("AdminUsers: Response data:", response.data);
      console.log("AdminUsers: Response type:", typeof response.data);
      console.log("AdminUsers: Is array:", Array.isArray(response.data));

      if (response.success && response.data) {
        // Handle paginated response structure
        const data = response.data;
        console.log("AdminUsers: Paginated response data:", data);

        // The response might have different structures, let's handle both
        let users: IUser[] = [];
        let totalCount = 0;
        let totalPages = 1;

        if (Array.isArray(data)) {
          // Direct array response
          users = data;
          totalCount = data.length;
          totalPages = 1;
        } else if (data && typeof data === "object") {
          // Paginated response object
          if ("items" in data && Array.isArray(data.items)) {
            users = data.items;
            totalCount = data.totalCount || data.items.length;
            totalPages = data.totalPages || 1;
          } else if ("data" in data && Array.isArray(data.data)) {
            users = data.data;
            totalCount = data.totalCount || data.data.length;
            totalPages = data.totalPages || 1;
          } else {
            // Fallback: check if data itself is the users array
            console.log(
              "AdminUsers: Unexpected response structure, keys:",
              Object.keys(data)
            );
            const dataValues = Object.values(data);
            const arrayValue = dataValues.find((val) => Array.isArray(val));
            if (arrayValue) {
              users = arrayValue as IUser[];
              totalCount = users.length;
            }
          }
        }

        console.log("AdminUsers: Extracted users:", users);
        console.log("AdminUsers: Extracted count:", totalCount);

        setState((prev) => ({
          ...prev,
          users: users,
          totalPages: totalPages,
          totalCount: totalCount,
          loading: false,
        }));

        console.log("AdminUsers: Updated state with", users.length, "users");
      } else {
        console.log("AdminUsers: API call failed:", response.message);
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to load users",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error loading users",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadUsers();
  }, [state.currentPage, state.searchTerm, state.roleFilter, user]);

  // Handle user selection
  const handleSelectUser = (userId: string) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedUsers);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return { ...prev, selectedUsers: newSelected };
    });
  };

  // Handle select all users
  const handleSelectAll = () => {
    setState((prev) => {
      const allSelected = prev.selectedUsers.size === prev.users.length;
      const newSelected = allSelected
        ? new Set<string>()
        : new Set(prev.users.map((u) => u.id));
      return { ...prev, selectedUsers: newSelected };
    });
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (state.selectedUsers.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${state.selectedUsers.size} user(s)?`
      )
    ) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const userIds = Array.from(state.selectedUsers);
      const response = await UserService.bulkDeleteUsers(userIds);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          selectedUsers: new Set(),
          loading: false,
        }));
        await loadUsers(); // Reload users
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to delete users",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error deleting users",
        loading: false,
      }));
    }
  };

  // Handle individual delete
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await UserService.deleteUser(userId);

      if (response.success) {
        setState((prev) => ({ ...prev, loading: false }));
        await loadUsers(); // Reload users
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to delete user",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error deleting user",
        loading: false,
      }));
    }
  };

  // Handle role update
  const handleUpdateRole = async (
    userId: string,
    newRole: "Admin" | "User" | "Moderator" | "Guest"
  ) => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await UserService.updateUserRole(userId, newRole);

      if (response.success) {
        setState((prev) => ({ ...prev, loading: false }));
        await loadUsers(); // Reload users
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to update user role",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Error updating user role",
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

  // Handle role filter
  const handleRoleFilter = (roleFilter: string) => {
    setState((prev) => ({
      ...prev,
      roleFilter,
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

  if (state.loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  const userManagementIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
      <path
        d="M19 7c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zM21 15.5c0-1.99-4-3-6-3 .37.64.6 1.38.6 2.17v2.33h5.4v-1.5z"
        opacity="0.7"
      />
      <path
        d="M8 7c0-1.66-1.34-3-3-3S2 5.34 2 7s1.34 3 3 3 3-1.34 3-3zM3 15.5c0-1.99 4-3 6-3-.37.64-.6 1.38-.6 2.17v2.33H2.6v-1.5z"
        opacity="0.7"
      />
    </svg>
  );

  return (
    <div className="admin-users">
      <AdminHeader
        title="User Management"
        icon={userManagementIcon}
        totalCount={state.totalCount}
        itemName="Users"
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        showPagination={state.totalPages > 1}
      />

      {state.error && (
        <div className="admin-error">
          <p>{state.error}</p>
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
            placeholder="Search users..."
            value={state.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={state.roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Moderator">Moderator</option>
            <option value="User">User</option>
            <option value="Guest">Guest</option>
          </select>
        </div>

        <div className="bulk-actions">
          {state.selectedUsers.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
              disabled={state.loading}
            >
              Delete Selected ({state.selectedUsers.size})
            </button>
          )}
        </div>
      </div>

      {state.loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        state.users.length > 0 &&
                        state.selectedUsers.size === state.users.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={state.selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user.id, e.target.value as any)
                        }
                        className="role-select"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                        <option value="User">User</option>
                        <option value="Guest">Guest</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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

export default AdminUsers;
