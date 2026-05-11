/**
 * Profile Integration Component
 * Demonstrates complete data persistence: Frontend → API → Backend → Neon Database
 * This component integrates with the backend user profile service
 */

import React, { useEffect, useState } from 'react';
import { userProfileService, UserProfileState } from '@/services/userProfile';
import authService from '@/services/auth';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export const ProfileIntegration: React.FC = () => {
  const [profileState, setProfileState] = useState<UserProfileState>(
    userProfileService.getState()
  );
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  // Subscribe to profile state changes
  useEffect(() => {
    const unsubscribe = userProfileService.subscribe((state) => {
      setProfileState(state);
      
      // Update form with new profile data
      if (state.profile) {
        setFormData({
          first_name: state.profile.first_name || '',
          last_name: state.profile.last_name || '',
          email: state.profile.email || '',
          phone: state.profile.phone || '',
          bio: state.profile.bio || '',
          avatar_url: state.profile.avatar_url || '',
        });
      }
    });

    // Load profile on mount
    userProfileService.loadProfile();

    return unsubscribe;
  }, []);

  /**
   * Handle form input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark as dirty
    userProfileService.markDirty();
  };

  /**
   * Handle form submission
   * Demonstrates data flow: Form → API → Backend → Database
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await userProfileService.updateProfile(formData);
    
    if (success) {
      setSaveCount(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    userProfileService.clear();
    authService.logout();
  };

  // Check if user is authenticated
  const user = authService.getCurrentUser();
  if (!user) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>User Profile Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please log in to view and edit your profile
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="details">Profile Details</TabsTrigger>
        </TabsList>

        {/* Profile Editing Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Edit Your Profile</CardTitle>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Success Message */}
              {showSuccess && (
                <Alert className="mb-4 border-green-500 bg-green-50">
                  <AlertDescription className="text-green-800">
                    ✓ Profile updated successfully and saved to database!
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {profileState.error && (
                <Alert className="mb-4 border-red-500 bg-red-50">
                  <AlertDescription className="text-red-800">
                    ✗ Error: {profileState.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {profileState.isLoading && (
                <Alert className="mb-4 border-blue-500 bg-blue-50">
                  <AlertDescription className="text-blue-800">
                    ⏳ Saving your profile...
                  </AlertDescription>
                </Alert>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User ID (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">User ID (Read-only)</label>
                    <Input
                      type="text"
                      value={profileState.profile?.id || 'Loading...'}
                      disabled
                      className="bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input
                      type="text"
                      value={profileState.profile?.role || 'user'}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      disabled={profileState.isLoading}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      disabled={profileState.isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                    disabled={profileState.isLoading}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    disabled={profileState.isLoading}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    disabled={profileState.isLoading}
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar URL</label>
                  <Input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={profileState.isLoading}
                  />
                </div>

                {/* Avatar Preview */}
                {formData.avatar_url && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar Preview</label>
                    <img
                      src={formData.avatar_url}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).alt = 'Invalid image URL';
                      }}
                    />
                  </div>
                )}

                {/* Profile Status */}
                <div className="text-sm bg-gray-50 p-4 rounded border space-y-2">
                  <p>
                    <strong>Status:</strong>{' '}
                    {profileState.isDirty ? '⚠️ Unsaved changes' : '✓ All changes saved'}
                  </p>
                  <p>
                    <strong>Last updated:</strong>{' '}
                    {profileState.profile?.updated_at
                      ? new Date(profileState.profile.updated_at).toLocaleString()
                      : 'Never'}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {profileState.profile?.created_at
                      ? new Date(profileState.profile.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                  <p>
                    <strong>Total saves:</strong> {saveCount}
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={profileState.isLoading || !profileState.isDirty}
                  >
                    {profileState.isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => userProfileService.loadProfile()}
                    disabled={profileState.isLoading}
                  >
                    Reload
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Flow Tab */}
        <TabsContent value="dataflow">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow & Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Flow Diagram */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold mb-4">Complete Production-Level Data Flow</h3>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <div>
                        <strong>Frontend Form Input</strong>
                        <p className="text-gray-600">User enters data in form fields and clicks "Save Profile"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <div>
                        <strong>API Client Call</strong>
                        <p className="text-gray-600">
                          Frontend calls: <code className="bg-gray-100 px-1 rounded">api.updateProfile(formData)</code>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <div>
                        <strong>HTTP Request</strong>
                        <p className="text-gray-600">
                          POST request sent to: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/v1/user/profile</code>
                        </p>
                        <p className="text-gray-600 mt-1">Headers include Bearer token for authentication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <div>
                        <strong>Backend Controller</strong>
                        <p className="text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">UserProfileController</code>:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          <li>Checks authentication (authMiddleware)</li>
                          <li>Validates input data (express-validator)</li>
                          <li>Extracts tenant_id from token</li>
                          <li>Calls UserProfileService</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">5.</span>
                      <div>
                        <strong>Business Logic Layer</strong>
                        <p className="text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">UserProfileService</code>:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          <li>Logs operation for debugging/monitoring</li>
                          <li>Performs any business logic (validation, transformations)</li>
                          <li>Calls UserProfileRepository</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">6.</span>
                      <div>
                        <strong>Data Access Layer</strong>
                        <p className="text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">UserProfileRepository</code>:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          <li>Uses TypeORM to generate SQL queries</li>
                          <li>Performs upsert (INSERT or UPDATE)</li>
                          <li>Enforces multi-tenant isolation (tenant_id filter)</li>
                          <li>Returns updated UserProfile entity</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">7.</span>
                      <div>
                        <strong>Database (Neon PostgreSQL)</strong>
                        <p className="text-gray-600">
                          Data persisted to table: <code className="bg-gray-100 px-1 rounded">user_profiles</code>
                        </p>
                        <ul className="list-disc list-inside text-gray-600 ml-2 mt-1">
                          <li>Columns: id, user_id, first_name, last_name, email, phone, bio, avatar_url, role, metadata</li>
                          <li>Timestamps: created_at, updated_at</li>
                          <li>Soft delete: deleted_at (NULL for active records)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">8.</span>
                      <div>
                        <strong>Response Back</strong>
                        <p className="text-gray-600">Backend returns JSON response to frontend</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">9.</span>
                      <div>
                        <strong>Frontend State Update</strong>
                        <p className="text-gray-600">
                          userProfileService updates state via subscriber pattern
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↓</span>
                      <div></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">10.</span>
                      <div>
                        <strong>UI Update</strong>
                        <p className="text-gray-600">Component re-renders with updated profile and success message</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">✓ Security</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>• JWT Bearer token authentication</p>
                      <p>• Tenant isolation enforced</p>
                      <p>• Input validation on all endpoints</p>
                      <p>• Error handling prevents data leaks</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">✓ Data Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>• Timestamps auto-tracked</p>
                      <p>• Soft deletes for recovery</p>
                      <p>• Type-safe TypeScript</p>
                      <p>• Database constraints enforced</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">✓ Observability</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>• Structured logging at each layer</p>
                      <p>• Error messages for debugging</p>
                      <p>• State tracking for changes</p>
                      <p>• Performance monitoring ready</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">✓ Production Ready</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>• Error handling comprehensive</p>
                      <p>• Async/await patterns used</p>
                      <p>• Pagination support built-in</p>
                      <p>• Scalable architecture</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Current Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              {profileState.profile ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(profileState.profile, null, 2)}
                    </pre>
                  </div>
                  
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      This data is stored in the Neon PostgreSQL database and can be queried, updated, and deleted through this interface.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No profile data loaded yet. Edit your profile to create one.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileIntegration;
