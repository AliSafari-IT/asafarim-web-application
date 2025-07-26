import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUserPreferences, IUpdateUserPreferences } from '../interfaces/IUser';
import { ThemeContext } from './ThemeContext';

// Types based on your API DTOs
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  role: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
  statusCode: number;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  register: (data: RegisterData) => Promise<ApiResponse<AuthResponse>>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  preferences: IUserPreferences | null;
  getPreferences: () => Promise<ApiResponse<IUserPreferences> | null>;
  updatePreferences: (preferences: IUpdateUserPreferences) => Promise<ApiResponse<IUserPreferences> | null>;
  applyPreferences: (preferences: IUserPreferences) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL for .NET backend
const DOTNET_API_BASE_URL = 'http://localhost:5242/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<IUserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access theme context to apply theme preferences
  const themeContext = useContext(ThemeContext);

  const isAuthenticated = !!user && !!token;

  // Function to apply user preferences to the current state
  const applyUserPreferences = (userPreferences: IUserPreferences) => {
    try {
      // Apply theme preference
      if (userPreferences.theme && userPreferences.theme !== 'auto') {
        if (themeContext?.setTheme) {
          themeContext.setTheme(userPreferences.theme);
          console.log(`Applied theme preference: ${userPreferences.theme}`);
        }
      }

      // Apply language preference (if you have i18n)
      if (userPreferences.language) {
        // You can add language switching logic here when you implement i18n
        console.log(`User language preference: ${userPreferences.language}`);
      }

      // Apply timezone preference
      if (userPreferences.timezone) {
        // You can store timezone in a global state or context if needed
        console.log(`User timezone preference: ${userPreferences.timezone}`);
      }

      // Store notification preferences for use in components
      if (userPreferences.emailNotifications !== undefined || userPreferences.pushNotifications !== undefined) {
        console.log(`Notification preferences - Email: ${userPreferences.emailNotifications}, Push: ${userPreferences.pushNotifications}`);
      }

      console.log('User preferences applied successfully');
    } catch (error) {
      console.error('Error applying user preferences:', error);
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token is still valid by making a request to profile endpoint
          const response = await fetch(`${DOTNET_API_BASE_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            setToken(storedToken);
            setUser(parsedUser);
            
            // Load preferences from localStorage or fetch from API
            const storedPreferences = localStorage.getItem('user_preferences');
            if (storedPreferences) {
              const parsedPreferences = JSON.parse(storedPreferences);
              setPreferences(parsedPreferences);
              // Apply stored preferences to current state
              applyUserPreferences(parsedPreferences);
            } else {
              // Fetch preferences from API if not in localStorage
              try {
                const prefsResponse = await fetch(`${DOTNET_API_BASE_URL}/users/preferences`, {
                  headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (prefsResponse.ok) {
                  const prefsResult: ApiResponse<IUserPreferences> = await prefsResponse.json();
                  if (prefsResult.success && prefsResult.data) {
                    setPreferences(prefsResult.data);
                    localStorage.setItem('user_preferences', JSON.stringify(prefsResult.data));
                    // Apply fetched preferences to current state
                    applyUserPreferences(prefsResult.data);
                  }
                }
              } catch (error) {
                console.error('Error fetching preferences during initialization:', error);
              }
            }
          } else {
            // Token is invalid, clear stored data
            console.log('Token validation failed, clearing auth data');
            setToken(null);
            setUser(null);
            setPreferences(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('user_preferences');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear auth data on any error
        setToken(null);
        setUser(null);
        setPreferences(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('user_preferences');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await fetch(`${DOTNET_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: ApiResponse<AuthResponse> = await response.json();

      if (result.success && result.data) {
        const { token: authToken, user: userData } = result.data;
        
        // Store in state
        setToken(authToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        // Fetch and apply user preferences after successful login
        try {
          const prefsResponse = await fetch(`${DOTNET_API_BASE_URL}/users/preferences`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (prefsResponse.ok) {
            const prefsResult: ApiResponse<IUserPreferences> = await prefsResponse.json();
            if (prefsResult.success && prefsResult.data) {
              setPreferences(prefsResult.data);
              localStorage.setItem('user_preferences', JSON.stringify(prefsResult.data));
              
              // Apply preferences to current state
              applyUserPreferences(prefsResult.data);
            }
          } else {
            console.log('Preferences not available on login, using defaults');
          }
        } catch (error) {
          console.error('Error fetching preferences after login:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error occurred during login',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await fetch(`${DOTNET_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<AuthResponse> = await response.json();

      if (result.success && result.data) {
        const { token: authToken, user: userData } = result.data;
        
        // Store in state
        setToken(authToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        // For new users, apply default preferences (or fetch if they exist)
        try {
          const prefsResponse = await fetch(`${DOTNET_API_BASE_URL}/users/preferences`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (prefsResponse.ok) {
            const prefsResult: ApiResponse<IUserPreferences> = await prefsResponse.json();
            if (prefsResult.success && prefsResult.data) {
              setPreferences(prefsResult.data);
              localStorage.setItem('user_preferences', JSON.stringify(prefsResult.data));
              
              // Apply preferences to current state
              applyUserPreferences(prefsResult.data);
            }
          } else {
            console.log('No preferences found for new user, using defaults');
          }
        } catch (error) {
          console.error('Error fetching preferences after registration:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error occurred during registration',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await fetch(`${DOTNET_API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear state and localStorage regardless of API call result
      setUser(null);
      setToken(null);
      setPreferences(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('user_preferences');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  // Debug function to check current auth state
  const debugAuthState = () => {
    console.log('=== Auth Debug State ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('token:', token ? `${token.substring(0, 20)}...` : null);
    console.log('localStorage token:', localStorage.getItem('auth_token') ? 'exists' : 'not found');
    console.log('localStorage user:', localStorage.getItem('auth_user') ? 'exists' : 'not found');
    console.log('========================');
  };

  // Add debugAuthState to window for console access
  useEffect(() => {
    (window as any).debugAuth = debugAuthState;
    return () => {
      delete (window as any).debugAuth;
    };
  }, [isAuthenticated, user, token]);

  const getPreferences = async (): Promise<ApiResponse<IUserPreferences> | null> => {
    if (!token) {
      return {
        success: false,
        message: 'Authentication required to access preferences',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
    }

    console.log('Making preferences request with token:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(`${DOTNET_API_BASE_URL}/users/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Preferences API response status:', response.status);
      console.log('Preferences API response headers:', response.headers);

      if (response.status === 401) {
        // Don't invalidate token for preferences - the endpoint might not exist
        // Only invalidate if it's a profile/auth endpoint
        console.log('Preferences endpoint returned 401 - endpoint may not be implemented');
        const errorText = await response.text();
        console.log('401 Error details:', errorText);
        return {
          success: false,
          message: 'User preferences endpoint not available. Using default settings.',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Get Preferences API Error (${response.status}):`, errorText);
        return {
          success: false,
          message: `Server error: ${response.status} - ${response.statusText}. The preferences endpoint may not be implemented in your .NET backend.`,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };
      }

      const result: ApiResponse<IUserPreferences> = await response.json();

      if (result.success && result.data) {
        setPreferences(result.data);
        localStorage.setItem('user_preferences', JSON.stringify(result.data));
        // Apply preferences to current state when manually fetched
        applyUserPreferences(result.data);
      }

      return result;
    } catch (error) {
      console.error('Get preferences error:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching preferences',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const updatePreferences = async (preferencesData: IUpdateUserPreferences): Promise<ApiResponse<IUserPreferences> | null> => {
    if (!token) {
      return {
        success: false,
        message: 'Authentication required to update preferences',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${DOTNET_API_BASE_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData),
      });

      if (response.status === 401) {
        // Don't invalidate token for preferences - the endpoint might not exist
        console.log('Update preferences endpoint returned 401 - endpoint may not be implemented');
        return {
          success: false,
          message: 'User preferences endpoint not available. Cannot save settings.',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Update Preferences API Error (${response.status}):`, errorText);
        return {
          success: false,
          message: `Server error: ${response.status} - ${response.statusText}. The preferences endpoint may not be implemented in your .NET backend.`,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };
      }

      const result: ApiResponse<IUserPreferences> = await response.json();

      if (result.success && result.data) {
        setPreferences(result.data);
        localStorage.setItem('user_preferences', JSON.stringify(result.data));
        // Apply updated preferences to current state immediately
        applyUserPreferences(result.data);
      }

      return result;
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        success: false,
        message: 'Network error occurred while updating preferences',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    preferences,
    getPreferences,
    updatePreferences,
    applyPreferences: applyUserPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
