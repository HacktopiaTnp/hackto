/**
 * Authentication Service
 * Manages user authentication state and API calls
 */

import api, { LoginRequest, RegisterRequest, User } from './api';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Initialize auth (check if user is already logged in)
   */
  async initialize(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.authState.isAuthenticated = false;
      this.notifyListeners();
      return;
    }

    api.setAccessToken(token);
    
    // Try to fetch current user
    const response = await api.getCurrentUser();
    if (response.success && response.data) {
      this.authState.user = response.data;
      this.authState.isAuthenticated = true;
    } else {
      // Token is invalid, clear it
      localStorage.removeItem('access_token');
      this.authState.isAuthenticated = false;
    }
    
    this.notifyListeners();
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<boolean> {
    this.authState.isLoading = true;
    this.authState.error = null;
    this.notifyListeners();

    try {
      const response = await api.register(data);
      
      if (response.success && response.data) {
        this.authState.user = response.data.user;
        this.authState.isAuthenticated = true;
        this.authState.isLoading = false;
        localStorage.setItem('refresh_token', response.data.refresh_token);
        this.notifyListeners();
        return true;
      } else {
        this.authState.error = response.error || 'Registration failed';
        this.authState.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.authState.error = error instanceof Error ? error.message : 'Registration failed';
      this.authState.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<boolean> {
    this.authState.isLoading = true;
    this.authState.error = null;
    this.notifyListeners();

    try {
      const response = await api.login(data);
      
      if (response.success && response.data) {
        this.authState.user = response.data.user;
        this.authState.isAuthenticated = true;
        this.authState.isLoading = false;
        localStorage.setItem('refresh_token', response.data.refresh_token);
        this.notifyListeners();
        return true;
      } else {
        this.authState.error = response.error || 'Login failed';
        this.authState.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.authState.error = error instanceof Error ? error.message : 'Login failed';
      this.authState.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    api.clearTokens();
    this.authState.user = null;
    this.authState.isAuthenticated = false;
    this.authState.error = null;
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.authState.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
