/**
 * User Profile Service (Frontend)
 * Manages user profile state and API interactions
 */

import api, { User, ApiResponse } from './api';
import { logger } from '@/utils/logger';

export interface UserProfileState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean; // Track unsaved changes
}

class UserProfileServiceFrontend {
  private state: UserProfileState = {
    profile: null,
    isLoading: false,
    error: null,
    isDirty: false,
  };

  private listeners: Set<(state: UserProfileState) => void> = new Set();

  /**
   * Subscribe to profile state changes
   */
  subscribe(listener: (state: UserProfileState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state
   */
  getState(): UserProfileState {
    return { ...this.state };
  }

  /**
   * Load user profile
   */
  async loadProfile(): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await api.getProfile();

      if (response.success && response.data) {
        this.state.profile = response.data;
        this.state.isLoading = false;
        this.notifyListeners();
        return true;
      } else {
        this.state.error = response.error || 'Failed to load profile';
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'An error occurred';
      this.state.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Update user profile (saves to database)
   */
  async updateProfile(updates: Partial<User>): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await api.updateProfile({
        ...this.state.profile,
        ...updates,
      });

      if (response.success && response.data) {
        this.state.profile = response.data;
        this.state.isDirty = false;
        this.state.isLoading = false;
        this.notifyListeners();
        return true;
      } else {
        this.state.error = response.error || 'Failed to update profile';
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'An error occurred';
      this.state.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Update avatar
   */
  async updateAvatar(avatarUrl: string): Promise<boolean> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await api.updateAvatar(avatarUrl);

      if (response.success && response.data) {
        this.state.profile = response.data;
        this.state.isDirty = false;
        this.state.isLoading = false;
        this.notifyListeners();
        return true;
      } else {
        this.state.error = response.error || 'Failed to update avatar';
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'An error occurred';
      this.state.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Mark profile as dirty (has unsaved changes)
   */
  markDirty(): void {
    this.state.isDirty = true;
    this.notifyListeners();
  }

  /**
   * Mark profile as clean (no unsaved changes)
   */
  markClean(): void {
    this.state.isDirty = false;
    this.notifyListeners();
  }

  /**
   * Delete profile
   */
  async deleteProfile(): Promise<boolean> {
    if (!confirm('Are you sure you want to delete your profile?')) {
      return false;
    }

    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await api.deleteProfile();

      if (response.success) {
        this.state.profile = null;
        this.state.isLoading = false;
        this.notifyListeners();
        return true;
      } else {
        this.state.error = response.error || 'Failed to delete profile';
        this.state.isLoading = false;
        this.notifyListeners();
        return false;
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'An error occurred';
      this.state.isLoading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Clear profile (on logout)
   */
  clear(): void {
    this.state = {
      profile: null,
      isLoading: false,
      error: null,
      isDirty: false,
    };
    this.notifyListeners();
  }
}

export const userProfileService = new UserProfileServiceFrontend();
export default userProfileService;
