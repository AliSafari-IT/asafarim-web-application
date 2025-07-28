import { 
  IProject, 
  ICreateProject, 
  IUpdateProject, 
  IPaginatedProjectsResponse 
} from '../interfaces/IProject';
import { IApiResponse } from '../interfaces/IApiResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5242/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  console.log('ProjectService Debug - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
  
  // Additional token debugging
  if (token) {
    const tokenParts = token.split('.');
    console.log('ProjectService Debug - Token parts count:', tokenParts.length);
    console.log('ProjectService Debug - Token length:', token.length);
    
    // Try to decode JWT payload (for debugging)
    try {
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('ProjectService Debug - Token payload:', {
          exp: payload.exp ? new Date(payload.exp * 1000) : 'no expiry',
          iat: payload.iat ? new Date(payload.iat * 1000) : 'no issued at',
          sub: payload.sub || 'no subject',
          expired: payload.exp ? Date.now() > payload.exp * 1000 : 'unknown'
        });
      }
    } catch (e) {
      console.log('ProjectService Debug - Could not decode token:', e instanceof Error ? e.message : 'unknown error');
    }
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('ProjectService Debug - Authorization header set');
  } else {
    console.log('ProjectService Debug - No token found, no Authorization header');
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
      // Clear all auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optionally redirect to login
      console.warn('Authentication failed - token may be expired or invalid');
      // You could add: window.location.href = '/login';
    } else if (response.status === 403) {
      data.message = 'You do not have permission to access this resource.';
    }
  }
  
  return data;
};

export class ProjectService {
  /**
   * Get paginated list of projects with optional filters
   */
  static async getProjects(
    page: number = 1,
    pageSize: number = 12,
    search?: string,
    status?: string,
    isPublic?: boolean,
    isFeatured?: boolean,
    userId?: string
  ): Promise<IApiResponse<IPaginatedProjectsResponse>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (isPublic !== undefined) queryParams.append('isPublic', isPublic.toString());
      if (isFeatured !== undefined) queryParams.append('isFeatured', isFeatured.toString());
      if (userId) queryParams.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/projects?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<IPaginatedProjectsResponse>(response);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching projects',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get paginated list of current user's projects
   */
  static async getUserProjects(
    page: number = 1,
    pageSize: number = 12,
    search?: string,
    status?: string
  ): Promise<IApiResponse<IPaginatedProjectsResponse>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const response = await fetch(`${API_BASE_URL}/users/projects?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<IPaginatedProjectsResponse>(response);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching user projects',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProject(id: string): Promise<IApiResponse<IProject>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<IProject>(response);
    } catch (error) {
      console.error('Error fetching project:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching project',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: ICreateProject): Promise<IApiResponse<IProject>> {
    try {
      const headers = getAuthHeaders();
      const body = JSON.stringify(projectData);
      
      // Debug logging
      console.log('API Request URL:', `${API_BASE_URL}/projects`);
      console.log('API Request Headers:', headers);
      console.log('API Request Body:', body);
      console.log('API Request Data Object:', projectData);
      
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers,
        body,
      });

      // Debug: Log response details
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      // Try to get response text for debugging
      const responseClone = response.clone();
      try {
        const responseText = await responseClone.text();
        console.log('API Response Text:', responseText);
      } catch (e) {
        console.log('Could not read response text:', e);
      }

      return await handleResponse<IProject>(response);
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: 'Network error occurred while creating project',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, projectData: IUpdateProject): Promise<IApiResponse<IProject>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      return await handleResponse<IProject>(response);
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: 'Network error occurred while updating project',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<IApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse<void>(response);
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: 'Network error occurred while deleting project',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Toggle project public status
   */
  static async toggleProjectPublic(id: string, isPublic: boolean): Promise<IApiResponse<IProject>> {
    return this.updateProject(id, { isPublic });
  }

  /**
   * Toggle project featured status
   */
  static async toggleProjectFeatured(id: string, isFeatured: boolean): Promise<IApiResponse<IProject>> {
    return this.updateProject(id, { isFeatured });
  }

  /**
   * Update project progress
   */
  static async updateProjectProgress(id: string, progress: number): Promise<IApiResponse<IProject>> {
    return this.updateProject(id, { progress });
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(id: string, status: string): Promise<IApiResponse<IProject>> {
    return this.updateProject(id, { status });
  }

  /**
   * Get all projects for admin with optional filters (admin endpoint)
   */
  static async getAdminProjects(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<IApiResponse<IPaginatedProjectsResponse>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      console.log('ProjectService: Making admin projects API call to:', `${API_BASE_URL}/projects/admin/all?${queryParams.toString()}`);

      const response = await fetch(`${API_BASE_URL}/projects/admin/all?${queryParams.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('ProjectService: Admin projects API response status:', response.status);
      console.log('ProjectService: Admin projects API response ok:', response.ok);

      const result = await handleResponse<IPaginatedProjectsResponse>(response);
      console.log('ProjectService: Admin projects processed result:', result);

      return result;
    } catch (error) {
      console.error('Error fetching admin projects:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching admin projects',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }
}

export default ProjectService;
