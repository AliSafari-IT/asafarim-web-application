import { ITechStack } from '../interfaces/ITechStack';
import { IApiResponse } from '../interfaces/IApiResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5242/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
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
      data.message = 'Authentication required. Please log in.';
    }
  }
  
  return data;
};

export class TechStackService {
  /**
   * Get all active tech stacks
   */
  static async getTechStacks(): Promise<IApiResponse<ITechStack[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/TechStacks`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<ITechStack[]>(response);
    } catch (error) {
      console.error('Error fetching tech stacks:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching tech stacks',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get a single tech stack by ID
   */
  static async getTechStack(id: string): Promise<IApiResponse<ITechStack>> {
    try {
      const response = await fetch(`${API_BASE_URL}/TechStacks/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<ITechStack>(response);
    } catch (error) {
      console.error('Error fetching tech stack:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching tech stack',
        statusCode: 0,
        timestamp: new Date()
      };
    }
  }
}

export default TechStackService;
