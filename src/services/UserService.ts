import { IUser } from '../interfaces/IUser';
import { IApiResponse } from '../interfaces/IApiResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5242/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<IApiResponse<T>> => {
  let data: IApiResponse<T>;
  
  try {
    data = await response.json();
  } catch (error) {
    // If JSON parsing fails, create a generic error response
    data = {
      success: false,
      message: `HTTP ${response.status}: ${response.statusText}`,
      statusCode: response.status,
      timestamp: new Date()
    };
  }
  
  // If the response was not successful, ensure success is false
  if (!response.ok) {
    data.success = false;
    data.statusCode = response.status;
    
    // Handle authentication errors
    if (response.status === 401) {
      data.message = 'Your session has expired. Please log in again.';
    }
  }
  
  return data;
};

export class UserService {
  // Get paginated users (admin only)
  static async getUsers(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    roleFilter?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<IApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`${API_BASE_URL}/users/admin/all?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Get single user by ID
  static async getUser(id: string): Promise<IApiResponse<IUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse<IUser>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Update user (admin only)
  static async updateUser(id: string, userData: Partial<IUser>): Promise<IApiResponse<IUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      return await handleResponse<IUser>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Delete user (admin only)
  static async deleteUser(id: string): Promise<IApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      return await handleResponse<null>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Bulk delete users (admin only)
  static async bulkDeleteUsers(userIds: string[]): Promise<IApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/bulk-delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds })
      });

      return await handleResponse<null>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete users',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Update user role (admin only)
  static async updateUserRole(id: string, role: 'Admin' | 'User' | 'Moderator' | 'Guest'): Promise<IApiResponse<IUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      });

      return await handleResponse<IUser>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user role',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Toggle user status (admin only)
  static async toggleUserStatus(id: string): Promise<IApiResponse<IUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      return await handleResponse<IUser>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle user status',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }
}
