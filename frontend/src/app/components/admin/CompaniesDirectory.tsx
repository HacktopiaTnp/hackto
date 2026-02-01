import { useState, useEffect } from 'react';
import { Search, Building2, Mail, Phone, Globe, MapPin, ExternalLink, Users } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Company {
  _id: string;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  description?: string;
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
  const [loading, setLoading] = useState(true);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const activeSearch = searchQuery || localSearch;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies from API...');
      
      const response = await fetch('http://localhost:5000/api/companies');
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Companies API Response:', data);
      
      if (data.success && Array.isArray(data.companies)) {
        console.log('Setting companies:', data.companies.length, 'items');
        setCompanies(data.companies);
      } else if (Array.isArray(data)) {
        console.log('Setting companies (direct array):', data.length, 'items');
        setCompanies(data);
      } else {
        console.error('Unexpected data format:', data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Failed to fetch companies. Please ensure the backend server is running on http://localhost:5000');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiters = async (companyId: string) => {
    try {
      setLoadingRecruiters(true);
      console.log('Fetching recruiters for company ID:', companyId);
      
      const response = await fetch(`http://localhost:5000/api/recruiters?companyId=${companyId}`);
      const data = await response.json();
      
      console.log('Recruiters API Response:', data);
      
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
    fetchRecruiters(company._id);
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    company.industry?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    company.location?.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Companies Directory</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage company partnerships and recruiter contacts</p>
      </div>

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
            <Card key={company._id} className="p-4 sm:p-5 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{company.name}</h3>
                  </div>
                  {company.industry && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{company.industry}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 sm:h-8 text-[10px] sm:text-xs shrink-0 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => handleViewCompany(company)}
                >
                  View
                </Button>
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
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{company.phone}</span>
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
              
              {selectedCompany?.description && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {selectedCompany.description}
                  </p>
                </div>
              )}
            </div>

            {/* Recruiters */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                  Associated Recruiters
                </h4>
                {recruiters.length > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px] sm:text-xs">
                    {recruiters.length} {recruiters.length === 1 ? 'Recruiter' : 'Recruiters'}
                  </Badge>
                )}
              </div>
              
              {loadingRecruiters ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-xs sm:text-sm text-gray-500">Loading recruiters...</div>
                </div>
              ) : recruiters.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {recruiters.map((recruiter, index) => (
                    <Card key={recruiter._id || recruiter.id || index} className="p-3 sm:p-4 border border-gray-200 hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shrink-0">
                              {recruiter.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                {recruiter.name}
                              </h5>
                              {recruiter.position && (
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{recruiter.position}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs">
                            {recruiter.email && (
                              <a 
                                href={`mailto:${recruiter.email}`} 
                                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors break-all"
                              >
                                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                <span className="truncate">{recruiter.email}</span>
                              </a>
                            )}
                            {recruiter.phone && (
                              <a 
                                href={`tel:${recruiter.phone}`} 
                                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                              >
                                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                {recruiter.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 sm:p-8 border border-gray-200 text-center bg-gray-50">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">No recruiters found</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    No recruiters are currently associated with this company
                  </p>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
