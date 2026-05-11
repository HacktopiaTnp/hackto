/**
 * API Client Service
 * Handles all backend communication with proper error handling and request/response types
 */

import { detectBackendPort } from '../utils/portDetection';

// Use environment variable if set, otherwise will auto-detect in constructor
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || null;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/**
 * API Client Class
 */
class ApiClient {
  private baseUrl: string | null;
  private baseUrlPromise: Promise<string> | null = null;
  private accessToken: string | null = null;

  constructor(baseUrl: string | null = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // If no base URL provided, we'll auto-detect on first request
    if (!this.baseUrl) {
      this.baseUrlPromise = detectBackendPort();
    }
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
  }

  /**
   * Get the base URL, auto-detecting if necessary
   */
  private async getBaseUrl(): Promise<string> {
    if (this.baseUrl) {
      return this.baseUrl;
    }
    if (this.baseUrlPromise) {
      this.baseUrl = await this.baseUrlPromise;
      return this.baseUrl;
    }
    this.baseUrl = await detectBackendPort();
    return this.baseUrl;
  }

  /**
   * Set access token (after login)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear tokens (on logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Make HTTP request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = `${baseUrl}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add authorization header if token exists
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          data: data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/auth/register', data);
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/login', data);
    if (response.success && response.data?.access_token) {
      this.setAccessToken(response.data.access_token);
    }
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.post<void>('/auth/logout');
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/me');
  }

  // ==================== USER PROFILE ENDPOINTS ====================

  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>('/user/profile');
  }

  /**
   * Create or update user profile
   */
  async updateProfile(profile: Partial<User>): Promise<ApiResponse<User>> {
    return this.post<User>('/user/profile', profile);
  }

  /**
   * Update avatar
   */
  async updateAvatar(avatarUrl: string): Promise<ApiResponse<User>> {
    return this.patch<User>('/user/profile/avatar', { avatar_url: avatarUrl });
  }

  /**
   * Get all profiles (admin/recruiter only)
   */
  async getAllProfiles(skip: number = 0, take: number = 10): Promise<ApiResponse<any>> {
    return this.get(`/user/profiles?skip=${skip}&take=${take}`);
  }

  /**
   * Search profiles
   */
  async searchProfiles(query: string): Promise<ApiResponse<User[]>> {
    return this.get<User[]>(`/user/profiles/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Delete profile
   */
  async deleteProfile(): Promise<ApiResponse<void>> {
    return this.delete<void>('/user/profile');
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get('/health');
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
