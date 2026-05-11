import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Download, Plus, Trash2, Eye, Archive, ArchiveRestore, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Resume {
  id: string;
  studentId: string;
  studentName: string;
  cgpa: number;
  branch: string;
  skills: string[];
  appliedCompanies: number;
}

interface ResumeBatch {
  id: string;
  name: string;
  batch: string;
  branch: string;
  year: number;
  resumeCount: number;
  status: 'active' | 'archived';
  createdDate: string;
  updatedDate: string;
  resumes?: Resume[];
}

export default function ResumeBooks() {
  const [batches, setBatches] = useState<ResumeBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ResumeBatch | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/api/v1/resume-books`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBatches(data.data);
      } else {
        setError('Failed to fetch resume books');
      }
    } catch (err) {
      console.error('Error fetching resume books:', err);
      setError('Error loading resume books');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleViewDetails = async (batch: ResumeBatch) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/resume-books/${batch.id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSelectedBatch(data.data);
      } else {
        setSelectedBatch(batch);
      }
    } catch (err) {
      console.error('Error fetching batch details:', err);
      setSelectedBatch(batch);
    }
    setShowDetails(true);
  };

  const handleExport = (batch: ResumeBatch) => {
    const csvContent = [
      ['Student ID', 'Name', 'CGPA', 'Branch', 'Skills', 'Applied Companies'].join(','),
      ...(batch.resumes?.map(r => 
        [r.studentId, r.studentName, r.cgpa, r.branch, r.skills.join(';'), r.appliedCompanies].join(',')
      ) || []),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleArchive = async (batchId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/resume-books/${batchId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchBatches();
      }
    } catch (err) {
      console.error('Error archiving batch:', err);
    }
  };

  const handleRestore = async (batchId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/resume-books/${batchId}/restore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchBatches();
      }
    } catch (err) {
      console.error('Error restoring batch:', err);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this resume book?')) return;
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/resume-books/${batchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchBatches();
      }
    } catch (err) {
      console.error('Error deleting batch:', err);
    }
  };

  const activeBatches = batches.filter(b => b.status === 'active');
  const archivedBatches = batches.filter(b => b.status === 'archived');
  const totalResumes = batches.reduce((sum, b) => sum + b.resumeCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg w-fit">
            <FolderOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Resume Books</h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">Manage batch resume collections and distributions</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="text-center p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="animate-pulse text-slate-600 dark:text-slate-400">Loading resume books...</div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center p-4 sm:p-6 mb-6 sm:mb-8 border-red-200 bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">{batches.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Total Books</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{totalResumes}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Resumes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{activeBatches.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">{archivedBatches.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Archived</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-2 sm:p-4">
              <Button size="sm" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-xs sm:text-sm">
                <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                <span>New Book</span>
              </Button>
            </CardContent>
          </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="active">
              Active ({activeBatches.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedBatches.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Batches Tab */}
          <TabsContent value="active">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {activeBatches.length > 0 ? (
                activeBatches.map(batch => (
                  <Card key={batch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1 sm:mb-2">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white truncate">
                              {batch.name}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 text-[0.65rem] sm:text-xs">
                              {batch.resumeCount} Resumes
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {batch.batch} • {batch.branch} • Batch {batch.year}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2">
                            Updated: {new Date(batch.updatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(batch)}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(batch)}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Export</span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(batch.id)}
                          className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 h-8 sm:h-10"
                        >
                          <Archive className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Archive</span>
                          <span className="sm:hidden">Archive</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(batch.id)}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-700 h-8 sm:h-10"
                        >
                          <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center p-6 sm:p-8">
                  <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">No active resume books</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Archived Batches Tab */}
          <TabsContent value="archived">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {archivedBatches.length > 0 ? (
                archivedBatches.map(batch => (
                  <Card key={batch.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1 sm:mb-2">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white truncate">
                              {batch.name}
                            </h3>
                            <Badge className="bg-slate-200 text-slate-800 text-[0.65rem] sm:text-xs">
                              {batch.resumeCount} Resumes
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {batch.batch} • {batch.branch} • Batch {batch.year}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2">
                            Archived: {new Date(batch.updatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(batch)}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(batch)}
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <Download className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Export</span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(batch.id)}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 h-8 sm:h-10 col-span-2 sm:col-span-1"
                        >
                          <ArchiveRestore className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Restore</span>
                          <span className="sm:hidden">Restore</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(batch.id)}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-700 h-8 sm:h-10 col-span-2 sm:col-span-1"
                        >
                          <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center p-6 sm:p-8">
                  <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">No archived resume books</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
          </>
        )}

        {/* Details Modal */}
        {showDetails && selectedBatch && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {selectedBatch.name} - Resume Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Book Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 rounded">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Batch</p>
                    <p className="font-semibold text-sm sm:text-base">{selectedBatch.batch}</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 rounded">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Branch</p>
                    <p className="font-semibold text-sm sm:text-base">{selectedBatch.branch}</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 rounded">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Year</p>
                    <p className="font-semibold text-sm sm:text-base">{selectedBatch.year}</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 rounded">
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">Status</p>
                    <Badge className={selectedBatch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'} style={{ fontSize: '0.7rem' }}>
                      {selectedBatch.status}
                    </Badge>
                  </div>
                </div>

                {/* Resumes Table */}
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Resumes ({selectedBatch.resumes?.length || 0})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 sm:p-3 text-slate-600 dark:text-slate-400 font-semibold">Student</th>
                          <th className="text-left p-2 sm:p-3 text-slate-600 dark:text-slate-400 font-semibold">ID</th>
                          <th className="text-left p-2 sm:p-3 text-slate-600 dark:text-slate-400 font-semibold">CGPA</th>
                          <th className="text-left p-2 sm:p-3 text-slate-600 dark:text-slate-400 font-semibold hidden sm:table-cell">Skills</th>
                          <th className="text-left p-2 sm:p-3 text-slate-600 dark:text-slate-400 font-semibold">Applied</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatch.resumes && selectedBatch.resumes.length > 0 ? (
                          selectedBatch.resumes.map(resume => (
                            <tr key={resume.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="p-2 sm:p-3 text-slate-900 dark:text-white font-medium">{resume.studentName}</td>
                              <td className="p-2 sm:p-3 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{resume.studentId}</td>
                              <td className="p-2 sm:p-3">
                                <Badge className="bg-blue-100 text-blue-800 text-[0.65rem]">{resume.cgpa}</Badge>
                              </td>
                              <td className="p-2 sm:p-3 hidden sm:table-cell text-slate-600 dark:text-slate-400 text-[10px]">
                                <div className="flex flex-wrap gap-1">
                                  {resume.skills.slice(0, 2).map((skill, idx) => (
                                    <Badge key={idx} className="bg-purple-100 text-purple-800 text-[0.6rem]">{skill}</Badge>
                                  ))}
                                  {resume.skills.length > 2 && (
                                    <Badge className="bg-purple-100 text-purple-800 text-[0.6rem]">+{resume.skills.length - 2}</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 text-slate-900 dark:text-white font-semibold">{resume.appliedCompanies}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-600 dark:text-slate-400">
                              No resumes in this book
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
