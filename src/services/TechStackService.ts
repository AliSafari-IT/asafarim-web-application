import { ITechStack } from '../interfaces/ITechStack';
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

export class TechStackService {
  // Get paginated tech stacks (admin only)
  static async getTechStacks(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    categoryFilter?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<IApiResponse<any>> {
    try {
      console.log('TechStackService: Making API call to:', `${API_BASE_URL}/techstacks`);
      
      // Backend doesn't support pagination/filtering, so we'll get all and handle client-side
      const response = await fetch(`${API_BASE_URL}/techstacks`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('TechStackService: API response status:', response.status);
      console.log('TechStackService: API response ok:', response.ok);

      const result = await handleResponse<ITechStack[]>(response);
      
      console.log('TechStackService: Processed result:', result);
      
      if (!result.success) {
        console.log('TechStackService: API call failed:', result.message);
        return result;
      }

      // The backend returns data in the format { success: true, data: ITechStack[], message: string }
      // So result.data should contain the array of tech stacks
      const techStacks = result.data || [];
      
      console.log('TechStackService: Extracted techStacks:', techStacks);
      console.log('TechStackService: TechStacks count:', techStacks.length);
      console.log('TechStackService: TechStacks is array:', Array.isArray(techStacks));

      // Client-side filtering
      let filteredStacks = techStacks;
      
      if (searchTerm) {
        filteredStacks = filteredStacks.filter(stack => 
          stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (stack.description && stack.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (categoryFilter) {
        filteredStacks = filteredStacks.filter(stack => 
          stack.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }

      // Client-side sorting
      filteredStacks.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'category':
            aVal = a.category.toLowerCase();
            bVal = b.category.toLowerCase();
            break;
          case 'createdAt':
          default:
            aVal = new Date(a.createdAt || 0);
            bVal = new Date(b.createdAt || 0);
            break;
        }
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      // Client-side pagination
      const totalCount = filteredStacks.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedStacks = filteredStacks.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          techStacks: paginatedStacks,
          totalCount,
          totalPages,
          currentPage: page,
          pageSize
        },
        message: result.message,
        statusCode: 200,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching tech stacks:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tech stacks',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Get single tech stack by ID
  static async getTechStack(id: string): Promise<IApiResponse<ITechStack>> {
    try {
      const response = await fetch(`${API_BASE_URL}/techstacks/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse<ITechStack>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tech stack',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Create new tech stack (admin only)
  static async createTechStack(techStackData: Omit<ITechStack, 'id' | 'createdAt' | 'updatedAt'>): Promise<IApiResponse<ITechStack>> {
    try {
      const response = await fetch(`${API_BASE_URL}/techstacks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(techStackData)
      });

      return await handleResponse<ITechStack>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create tech stack',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Update tech stack (admin only)
  static async updateTechStack(id: string, techStackData: Partial<ITechStack>): Promise<IApiResponse<ITechStack>> {
    try {
      const response = await fetch(`${API_BASE_URL}/techstacks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(techStackData)
      });

      return await handleResponse<ITechStack>(response);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update tech stack',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Delete tech stack (admin only)
  static async deleteTechStack(id: string): Promise<IApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/techstacks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await handleResponse<null>(response);
      
      // Log the detailed error for debugging
      if (!result.success) {
        console.error('Delete tech stack failed:', {
          id,
          status: response.status,
          statusText: response.statusText,
          result
        });
      }

      return result;
    } catch (error) {
      console.error('Delete tech stack error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete tech stack',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  // Bulk delete tech stacks (admin only) - uses individual delete calls since backend doesn't support bulk delete
  static async bulkDeleteTechStacks(techStackIds: string[]): Promise<IApiResponse<null>> {
    try {
      const deletePromises = techStackIds.map(id => 
        fetch(`${API_BASE_URL}/techstacks/${id}`, {
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
          message: `Failed to delete ${failedDeletes.length} out of ${techStackIds.length} tech stacks`,
          statusCode: 400,
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: `Successfully deleted ${techStackIds.length} tech stacks`,
        statusCode: 200,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete tech stacks',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }
}
