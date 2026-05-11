import { useState, useEffect } from 'react';
import { Search, Building2, Mail, Phone, Globe, MapPin, ExternalLink, Users, Edit2, Trash2, Plus } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Company {
  id?: number;
  _id?: string;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  description?: string;
  logo?: string;
}

interface Recruiter {
  _id?: string;
  id?: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface CompaniesDirectoryProps {
  searchQuery?: string;
}

export default function CompaniesDirectory({ searchQuery = '' }: CompaniesDirectoryProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [formData, setFormData] = useState<Company>({
    name: '',
    industry: '',
    location: '',
    website: '',
    contactPerson: '',
    email: '',
    phone: '',
    description: '',
    logo: '🏢',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeSearch = searchQuery || localSearch;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Reset messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!apiBaseUrl) {
        setError('API URL not configured');
        setCompanies([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiBaseUrl}/api/companies`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.companies)) {
        setCompanies(data.companies);
      } else if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies. Ensure backend is running.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiters = async (companyId: string | number) => {
    try {
      setLoadingRecruiters(true);
      const response = await fetch(`${apiBaseUrl}/api/recruiters?companyId=${companyId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.recruiters)) {
        setRecruiters(data.recruiters);
      } else if (Array.isArray(data)) {
        setRecruiters(data);
      } else {
        setRecruiters([]);
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      setRecruiters([]);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setRecruiters([]);
    if (company.id || company._id) {
      fetchRecruiters(company.id || company._id);
    }
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setFormData(company);
  };

  const handleCreateClick = () => {
    setCreatingCompany(true);
    setFormData({
      name: '',
      industry: '',
      location: '',
      website: '',
      contactPerson: '',
      email: '',
      phone: '',
      description: '',
      logo: '🏢',
    });
  };

  const handleDeleteCompany = async (companyId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      setSubmitLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');

      const data = await response.json();
      if (data.success) {
        setSuccess('Company deleted successfully');
        setCompanies(companies.filter(c => (c.id || c._id) !== companyId));
        if (selectedCompany && (selectedCompany.id || selectedCompany._id) === companyId) {
          setSelectedCompany(null);
        }
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      setError('Failed to delete company');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.location || !formData.industry) {
        setError('Required fields: Name, Location, Industry');
        setSubmitLoading(false);
        return;
      }

      if (editingCompany) {
        // Update existing company
        const response = await fetch(`${apiBaseUrl}/api/companies/${editingCompany.id || editingCompany._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update company');
        const data = await response.json();

        if (data.success) {
          setCompanies(companies.map(c => (c.id || c._id) === editingCompany.id || editingCompany._id ? data.data : c));
          setSuccess('Company updated successfully');
          setEditingCompany(null);
          setSelectedCompany(null);
        }
      } else {
        // Create new company
        const response = await fetch(`${apiBaseUrl}/api/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create company');
        const data = await response.json();

        if (data.success) {
          setCompanies([...companies, data.data]);
          setSuccess('Company created successfully');
          setCreatingCompany(false);
        }
      }
    } catch (error) {
      console.error('Error saving company:', error);
      setError('Failed to save company. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    company.industry?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    company.location?.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Companies Directory</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage company partnerships and recruiter contacts</p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Company</span>
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Search */}
      {!searchQuery && (
        <Card className="p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm bg-gray-50 border-gray-200"
            />
          </div>
        </Card>
      )}

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <div className="text-xs sm:text-sm text-gray-500">Loading companies...</div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="p-8 sm:p-12 border border-gray-200 text-center">
          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No companies found</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {activeSearch ? 'Try adjusting your search criteria' : 'No companies available in the directory'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id || company._id} className="p-4 sm:p-5 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                      <span className="text-base sm:text-lg">{company.logo || '🏢'}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{company.name}</h3>
                  </div>
                  {company.industry && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{company.industry}</Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 p-1 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleEditClick(company)}
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 p-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteCompany(company.id || company._id)}
                    disabled={submitLoading}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 text-[10px] sm:text-xs shrink-0 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleViewCompany(company)}
                  >
                    View
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-600">
                {company.location && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                )}
                {company.contactPerson && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{company.contactPerson}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate text-blue-600">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate text-blue-600">{company.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Company Details Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              {selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Company Info */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Company Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                {selectedCompany?.industry && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-gray-500 font-medium">Industry:</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs w-fit">
                      {selectedCompany.industry}
                    </Badge>
                  </div>
                )}
                {selectedCompany?.location && (
                  <div className="flex items-start sm:items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                    <div>
                      <span className="text-gray-500 block sm:inline">Location: </span>
                      <span className="text-gray-900">{selectedCompany.location}</span>
                    </div>
                  </div>
                )}
                {selectedCompany?.contactPerson && (
                  <div className="flex items-start sm:items-center gap-2">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                    <div>
                      <span className="text-gray-500 block sm:inline">Contact: </span>
                      <span className="text-gray-900">{selectedCompany.contactPerson}</span>
                    </div>
                  </div>
                )}
                {selectedCompany?.email && (
                  <div className="flex items-start sm:items-center gap-2">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                    <a 
                      href={`mailto:${selectedCompany.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedCompany.email}
                    </a>
                  </div>
                )}
                {selectedCompany?.phone && (
                  <div className="flex items-start sm:items-center gap-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                    <a 
                      href={`tel:${selectedCompany.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCompany.phone}
                    </a>
                  </div>
                )}
                {selectedCompany?.website && (
                  <div className="col-span-1 sm:col-span-2 flex items-start sm:items-center gap-2">
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0 shrink-0" />
                    <a 
                      href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                    >
                      <span className="break-all">{selectedCompany.website}</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {selectedCompany?.description && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-xs sm:text-sm text-gray-600">{selectedCompany.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  handleEditClick(selectedCompany!);
                  setSelectedCompany(null);
                }}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit2 className="w-4 h-4" />
                Edit Company
              </Button>
              <Button
                onClick={() => {
                  handleDeleteCompany(selectedCompany?.id || selectedCompany?._id);
                  setSelectedCompany(null);
                }}
                variant="outline"
                className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Company Form Dialog */}
      <Dialog
        open={!!editingCompany || creatingCompany}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCompany(null);
            setCreatingCompany(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Edit Company' : 'Create New Company'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Google"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location *</label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mountain View, CA"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <Input
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g., John Doe"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., careers@company.com"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1-234-567-8900"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g., company.com"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the company..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingCompany(null);
                  setCreatingCompany(false);
                }}
                className="flex-1"
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
