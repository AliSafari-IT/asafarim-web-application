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

  // Get single user by ID (for admin - uses admin/all endpoint)
  static async getUser(id: string): Promise<IApiResponse<IUser>> {
    try {
      // Since there's no direct user-by-id endpoint, we'll use the admin/all endpoint
      // and filter for the specific user
      const response = await fetch(`${API_BASE_URL}/users/admin/all?pageSize=1000`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await handleResponse<any>(response);
      
      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to fetch users',
          statusCode: result.statusCode || 0,
          timestamp: new Date()
        };
      }

      // Handle different possible response structures
      let users: any[] = [];
      
      if (result.data) {
        if (Array.isArray(result.data)) {
          // Direct array in result.data
          users = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          // Array in result.data.data
          users = result.data.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          // Array in result.data.items
          users = result.data.items;
        }
      }

      const user = users.find((u: any) => u.id === id);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404,
          timestamp: new Date()
        };
      }

      return {
        success: true,
        data: user,
        message: 'User fetched successfully',
        statusCode: 200,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Update user (handles both own profile and admin updates)
  static async updateUser(id: string, userData: Partial<IUser>, isAdmin: boolean = false, currentUserId?: string): Promise<IApiResponse<IUser>> {
    try {
      let endpoint: string;
      
      // Determine which endpoint to use
      if (isAdmin) {
        // Admin updating any user
        endpoint = `${API_BASE_URL}/users/admin/${id}/profile`;
      } else if (currentUserId === id) {
        // User updating their own profile
        endpoint = `${API_BASE_URL}/users/profile`;
      } else {
        // Non-admin trying to update someone else's profile
        return {
          success: false,
          message: 'Unauthorized: You can only update your own profile',
          statusCode: 403,
          timestamp: new Date()
        };
      }

      const response = await fetch(endpoint, {
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
      const response = await fetch(`${API_BASE_URL}/users/admin/${id}`, {
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

  // Bulk delete users (admin only) - uses individual delete calls since backend doesn't support bulk delete
  static async bulkDeleteUsers(userIds: string[]): Promise<IApiResponse<null>> {
    try {
      const deletePromises = userIds.map(id => 
        fetch(`${API_BASE_URL}/users/admin/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map(response => handleResponse<null>(response)));
      
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length > 0) {
        return {
          success: false,
          message: `Failed to delete ${failedDeletes.length} out of ${userIds.length} users`,
          statusCode: 400,
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: `Successfully deleted ${userIds.length} users`,
        statusCode: 200,
        timestamp: new Date()
      };
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

// Named exports for compatibility with existing components
export const fetchUserDetails = async (id: string): Promise<IUser> => {
  const response = await UserService.getUser(id);
  if (response.success && response.data) {
    return response.data;
  } else {
    throw new Error(response.message || 'Failed to fetch user details');
  }
};

export const updateUser = async (id: string, userData: Partial<IUser>, isAdmin: boolean = false, currentUserId?: string): Promise<IUser> => {
  const response = await UserService.updateUser(id, userData, isAdmin, currentUserId);
  if (response.success && response.data) {
    return response.data;
  } else {
    throw new Error(response.message || 'Failed to update user');
  }
};
