import { IRepository } from '../interfaces/IRepository';
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

export class RepositoryService {
  // Get paginated repositories (admin only)
  static async getRepositories(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    platformFilter?: string,
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
      if (platformFilter) params.append('platform', platformFilter);

      const response = await fetch(`${API_BASE_URL}/repositories/admin/all?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch repositories',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Get single repository by ID
  static async getRepository(id: string): Promise<IApiResponse<IRepository>> {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse<IRepository>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch repository',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Create new repository (admin only)
  static async createRepository(repositoryData: Omit<IRepository, 'id' | 'createdAt' | 'updatedAt'>): Promise<IApiResponse<IRepository>> {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(repositoryData)
      });

      return await handleResponse<IRepository>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create repository',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Update repository (admin only)
  static async updateRepository(id: string, repositoryData: Partial<IRepository>): Promise<IApiResponse<IRepository>> {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(repositoryData)
      });

      return await handleResponse<IRepository>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update repository',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Delete repository (admin only)
  static async deleteRepository(id: string): Promise<IApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      return await handleResponse<null>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete repository',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Bulk delete repositories (admin only)
  static async bulkDeleteRepositories(repositoryIds: string[]): Promise<IApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/bulk-delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ repositoryIds })
      });

      return await handleResponse<null>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete repositories',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }
}
