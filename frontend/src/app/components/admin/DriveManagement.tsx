import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Briefcase, Plus, Edit, Trash2, Eye, Bell, Clock, CheckCircle, AlertCircle, Filter, Download, Send, MapPinIcon, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';

interface Drive {
  id: string;
  companyName: string;
  driveDate: string;
  location: string;
  jobTitle: string;
  totalPositions: number;
  registeredStudents: number;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  hostContact: string;
  hostPhone: string;
  roundDetails: RoundDetail[];
  eligibility: {
    cgpa: number;
    branches: string[];
    batch: string;
  };
  postedDate: string;
  createdBy: string;
}

interface RoundDetail {
  roundNumber: number;
  roundName: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
}

interface DriveManagementProps {
  userRole: 'admin' | 'coordinator';
}

export default function DriveManagement({ userRole }: DriveManagementProps) {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [formData, setFormData] = useState<Partial<Drive>>({
    companyName: '',
    driveDate: '',
    location: '',
    jobTitle: '',
    totalPositions: 0,
    status: 'upcoming',
    description: '',
    hostContact: '',
    hostPhone: '',
    eligibility: {
      cgpa: 6.0,
      branches: [],
      batch: '',
    },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/api/v1/drives`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setDrives(data.data);
      } else {
        setError('Failed to fetch drives');
      }
    } catch (err) {
      console.error('Error fetching drives:', err);
      setError('Error loading drives');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrive = async () => {
    try {
      setSubmitLoading(true);
      const url = editingId 
        ? `${apiBaseUrl}/api/v1/drives/${editingId}`
        : `${apiBaseUrl}/api/v1/drives`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchDrives();
        setFormData({
          companyName: '',
          driveDate: '',
          location: '',
          jobTitle: '',
          totalPositions: 0,
          status: 'upcoming',
          description: '',
          hostContact: '',
          hostPhone: '',
        });
        setEditingId(null);
        setShowDialog(false);
      } else {
        setError('Failed to save drive');
      }
    } catch (err) {
      console.error('Error saving drive:', err);
      setError('Error saving drive');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditDrive = (drive: Drive) => {
    setFormData(drive);
    setEditingId(drive.id);
    setShowDialog(true);
  };

  const handleDeleteDrive = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/drives/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await fetchDrives();
      } else {
        setError('Failed to delete drive');
      }
    } catch (err) {
      console.error('Error deleting drive:', err);
      setError('Error deleting drive');
    }
  };

  const filteredDrives = filterStatus === 'all' ? drives : drives.filter(d => d.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: drives.length,
    upcoming: drives.filter(d => d.status === 'upcoming').length,
    ongoing: drives.filter(d => d.status === 'ongoing').length,
    completed: drives.filter(d => d.status === 'completed').length,
    totalPositions: drives.reduce((sum, d) => sum + d.totalPositions, 0),
    totalRegistered: drives.reduce((sum, d) => sum + d.registeredStudents, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white truncate">Drive Management</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Schedule & coordinate recruitment drives</p>
              </div>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs sm:text-sm flex-shrink-0">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Drive</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Drive' : 'Create New Drive'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        placeholder="e.g., Google"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Job Title *</Label>
                      <Input
                        placeholder="e.g., Software Engineer"
                        value={formData.jobTitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Drive Date *</Label>
                      <Input
                        type="date"
                        value={formData.driveDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, driveDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Input
                        placeholder="Venue"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Total Positions</Label>
                      <Input
                        type="number"
                        value={formData.totalPositions || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalPositions: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Drive details..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Host Contact</Label>
                      <Input
                        placeholder="Contact person name"
                        value={formData.hostContact || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, hostContact: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        placeholder="+91-XXXXXXXXXX"
                        value={formData.hostPhone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, hostPhone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleAddDrive} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                      {editingId ? 'Update Drive' : 'Create Drive'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Total Drives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-500">{stats.upcoming}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500">{stats.ongoing}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Ongoing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{stats.totalPositions}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Positions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600">{stats.totalRegistered}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Registered</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-1 sm:gap-2 flex-wrap">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            className={`text-xs sm:text-sm ${filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}`}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('upcoming')}
            className={`text-xs sm:text-sm ${filterStatus === 'upcoming' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}`}
          >
            Upcoming
          </Button>
          <Button
            variant={filterStatus === 'ongoing' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ongoing')}
            className={`text-xs sm:text-sm ${filterStatus === 'ongoing' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}`}
          >
            Ongoing
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
            className={`text-xs sm:text-sm ${filterStatus === 'completed' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}`}
          >
            Completed
          </Button>
        </div>

        {/* Drives List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredDrives.map((drive) => (
            <Card key={drive.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-white truncate">{drive.companyName}</h3>
                      <Badge className={`text-xs sm:text-sm ${getStatusBadge(drive.status)}`}>{drive.status}</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{drive.jobTitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{new Date(drive.driveDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{drive.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{drive.totalPositions} pos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{drive.registeredStudents} reg</span>
                  </div>
                </div>

                {/* Attendance Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{drive.attendees}/{drive.registeredStudents}</span>
                  </div>
                  <Progress value={(drive.attendees / drive.registeredStudents) * 100} className="h-2" />
                </div>

                {/* Host Info */}
                <div className="bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 rounded text-xs sm:text-sm">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Host: {drive.hostContact}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Phone: {drive.hostPhone}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditDrive(drive)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">✏</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDrive(drive.id)}
                    className="flex-1 text-red-600 hover:text-red-700 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedDrive(drive);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Details</span>
                    <span className="sm:hidden">📋</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrives.length === 0 && (
          <Card className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No drives found. Create one to get started!</p>
          </Card>
        )}

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedDrive?.companyName} - Drive Details</DialogTitle>
            </DialogHeader>
            {selectedDrive && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Job Title</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{selectedDrive.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Status</p>
                    <Badge className={getStatusBadge(selectedDrive.status)}>{selectedDrive.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Drive Date</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{new Date(selectedDrive.driveDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Location</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{selectedDrive.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Description</p>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{selectedDrive.description || 'No description provided'}</p>
                </div>

                {/* Positions & Registrations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedDrive.totalPositions}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Positions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{selectedDrive.registeredStudents}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Registered</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{selectedDrive.attendees}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Attendees</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Progress */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Attendance Rate</p>
                  <Progress value={(selectedDrive.attendees / selectedDrive.registeredStudents) * 100} className="h-2" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedDrive.attendees} / {selectedDrive.registeredStudents} ({Math.round((selectedDrive.attendees / selectedDrive.registeredStudents) * 100)}%)</p>
                </div>

                {/* Host Information */}
                <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Host Information</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Contact:</span>
                      <span className="text-xs sm:text-sm text-slate-900 dark:text-white">{selectedDrive.hostContact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm text-slate-900 dark:text-white">{selectedDrive.hostPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Eligibility Criteria</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Minimum CGPA</p>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{selectedDrive.eligibility.cgpa}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Branches</p>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{selectedDrive.eligibility.branches.join(', ') || 'All'}</p>
                    </div>
                  </div>
                </div>

                {/* Round Details */}
                {selectedDrive.roundDetails.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Interview Rounds</p>
                    <div className="space-y-3">
                      {selectedDrive.roundDetails.map((round) => (
                        <Card key={round.roundNumber}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Round {round.roundNumber}: {round.roundName}</p>
                              </div>
                              <Badge className="text-xs">{round.capacity} capacity</Badge>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                              <p>📅 {new Date(round.date).toLocaleDateString()} at {round.time}</p>
                              <p>📍 {round.location}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Information */}
                <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <p>Posted: {new Date(selectedDrive.postedDate).toLocaleDateString()} by {selectedDrive.createdBy}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
