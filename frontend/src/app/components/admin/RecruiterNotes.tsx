import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Building2, User, Mail, Phone, FileText, Star, Edit2, Trash2, X, CheckCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface RecruiterNote {
  id: string;
  recruiterName: string;
  companyType: 'product' | 'service' | 'startup';
  industry: string;
  recruitmentStatus: string;
  hiringType: 'internship' | 'full-time' | 'internship-ppo';
  offeredRoles: string[];
  numberOfOpenings: number;
  packageCTC: number;
  bond: 'yes' | 'no';
  bondDuration?: number;
  selectionRounds: string[];
  eligibility: {
    cgpa: number;
    backlogsAllowed: 'yes' | 'no';
  };
  driveMode: 'online' | 'offline' | 'hybrid';
  expectedDriveDate: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  communicationStatus: string;
  internalNotes: string;
  priorityLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface RecruiterNotesProps {
  searchQuery?: string;
}

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Cognizant', 'HCL', 'Tech Mahindra', 'Accenture', 'Deloitte'];
const INDUSTRIES = ['IT', 'FinTech', 'EdTech', 'Healthcare', 'E-Commerce', 'Consulting', 'Manufacturing', 'Telecom'];
const OFFERED_ROLES = ['SDE', 'Data Analyst', 'ML Engineer', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'Product Manager'];
const SELECTION_ROUNDS = ['Aptitude Test', 'Technical Interview', 'HR Interview', 'Coding Round', 'Group Discussion', 'Case Study'];

export default function RecruiterNotes({ searchQuery = '' }: RecruiterNotesProps) {
  const [notes, setNotes] = useState<RecruiterNote[]>([]);
  const [localSearch, setLocalSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<RecruiterNote | null>(null);
  const [formData, setFormData] = useState<Partial<RecruiterNote>>({
    recruiterName: '',
    companyType: 'product',
    industry: '',
    recruitmentStatus: 'initial-contact',
    hiringType: 'full-time',
    offeredRoles: [],
    numberOfOpenings: 1,
    packageCTC: 2,
    bond: 'no',
    bondDuration: undefined,
    selectionRounds: [],
    eligibility: { cgpa: 6.0, backlogsAllowed: 'no' },
    driveMode: 'online',
    expectedDriveDate: '',
    contactPerson: { name: '', email: '', phone: '' },
    communicationStatus: 'email-sent',
    internalNotes: '',
    priorityLevel: 'medium',
  });

  const activeSearch = searchQuery || localSearch;

  useEffect(() => {
    const savedNotes = localStorage.getItem('recruiterNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNote = () => {
    if (!validateForm()) return;

    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { ...formData as RecruiterNote, id: editingNote.id, createdAt: editingNote.createdAt, updatedAt: new Date().toISOString() }
          : note
      );
      setNotes(updatedNotes);
      localStorage.setItem('recruiterNotes', JSON.stringify(updatedNotes));
    } else {
      // Create new note
      const newNote: RecruiterNote = {
        ...(formData as RecruiterNote),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('recruiterNotes', JSON.stringify(updatedNotes));
    }

    closeDialog();
  };

  const deleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this recruiter note?')) {
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('recruiterNotes', JSON.stringify(updatedNotes));
    }
  };

  const editNote = (note: RecruiterNote) => {
    setEditingNote(note);
    setFormData(note);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingNote(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      recruiterName: '',
      companyType: 'product',
      industry: '',
      recruitmentStatus: 'initial-contact',
      hiringType: 'full-time',
      offeredRoles: [],
      numberOfOpenings: 1,
      packageCTC: 2,
      bond: 'no',
      bondDuration: undefined,
      selectionRounds: [],
      eligibility: { cgpa: 6.0, backlogsAllowed: 'no' },
      driveMode: 'online',
      expectedDriveDate: '',
      contactPerson: { name: '', email: '', phone: '' },
      communicationStatus: 'email-sent',
      internalNotes: '',
      priorityLevel: 'medium',
    });
  };

  const validateForm = () => {
    if (!formData.recruiterName) {
      alert('Recruiter Name is required');
      return false;
    }
    if (!formData.contactPerson?.email || !/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
      alert('Valid email is required');
      return false;
    }
    if (formData.packageCTC && (formData.packageCTC < 2 || formData.packageCTC > 100)) {
      alert('Package must be between 2 and 100 LPA');
      return false;
    }
    return true;
  };

  const toggleRole = (role: string) => {
    const currentRoles = formData.offeredRoles || [];
    if (currentRoles.includes(role)) {
      setFormData({ ...formData, offeredRoles: currentRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, offeredRoles: [...currentRoles, role] });
    }
  };

  const toggleRound = (round: string) => {
    const currentRounds = formData.selectionRounds || [];
    if (currentRounds.includes(round)) {
      setFormData({ ...formData, selectionRounds: currentRounds.filter(r => r !== round) });
    } else {
      setFormData({ ...formData, selectionRounds: [...currentRounds, round] });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.recruiterName?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    note.industry?.toLowerCase().includes(activeSearch.toLowerCase()) ||
    note.recruitmentStatus?.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">Recruiter Notes</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and manage recruiter communications</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Recruiter Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                {editingNote ? 'Edit Recruiter Note' : 'Add New Recruiter Note'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 py-4">
              {/* 🧩 CORE RECRUITER DETAILS */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  🧩 Core Recruiter Details
                </h3>

                {/* 1. Recruiter Name */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="recruiterName" className="text-xs sm:text-sm font-medium">
                    1. Recruiter Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.recruiterName}
                    onValueChange={(value) => setFormData({ ...formData, recruiterName: value })}
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Select company..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map(company => (
                        <SelectItem key={company} value={company} className="text-xs sm:text-sm">
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Company Type */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    2. Company Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {['product', 'service', 'startup'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="companyType"
                          value={type}
                          checked={formData.companyType === type}
                          onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-xs sm:text-sm capitalize">{type.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Industry / Domain */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="industry" className="text-xs sm:text-sm font-medium">
                    3. Industry / Domain <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Select industry..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry} className="text-xs sm:text-sm">
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 📋 RECRUITMENT PROCESS DETAILS */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  📋 Recruitment Process Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 4. Recruitment Status */}
                  <div className="space-y-2">
                    <Label htmlFor="recruitmentStatus" className="text-xs sm:text-sm font-medium">
                      4. Recruitment Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.recruitmentStatus}
                      onValueChange={(value) => setFormData({ ...formData, recruitmentStatus: value })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial-contact" className="text-xs sm:text-sm">Initial Contact</SelectItem>
                        <SelectItem value="interested" className="text-xs sm:text-sm">Interested</SelectItem>
                        <SelectItem value="shortlisted" className="text-xs sm:text-sm">Shortlisted</SelectItem>
                        <SelectItem value="drive-scheduled" className="text-xs sm:text-sm">Drive Scheduled</SelectItem>
                        <SelectItem value="closed" className="text-xs sm:text-sm">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 5. Hiring Type */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">
                      5. Hiring Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col gap-2">
                      {['internship', 'full-time', 'internship-ppo'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hiringType"
                            value={type}
                            checked={formData.hiringType === type}
                            onChange={(e) => setFormData({ ...formData, hiringType: e.target.value as any })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-xs sm:text-sm capitalize">{type.replace('-', ' + ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Offered Roles */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    6. Offered Roles <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {OFFERED_ROLES.map(role => (
                      <Badge
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`cursor-pointer text-[10px] sm:text-xs px-2 sm:px-3 py-1 ${
                          formData.offeredRoles?.includes(role)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {role}
                        {formData.offeredRoles?.includes(role) && (
                          <X className="w-3 h-3 ml-1 inline" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* 7. Number of Openings */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfOpenings" className="text-xs sm:text-sm font-medium">
                      7. Number of Openings <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numberOfOpenings"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.numberOfOpenings || ''}
                      onChange={(e) => setFormData({ ...formData, numberOfOpenings: parseInt(e.target.value) || 1 })}
                      className="text-xs sm:text-sm"
                    />
                  </div>

                  {/* 8. Package / CTC */}
                  <div className="space-y-2">
                    <Label htmlFor="packageCTC" className="text-xs sm:text-sm font-medium">
                      8. Package / CTC (LPA) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="packageCTC"
                      type="number"
                      min="2"
                      max="100"
                      step="0.5"
                      value={formData.packageCTC || ''}
                      onChange={(e) => setFormData({ ...formData, packageCTC: parseFloat(e.target.value) || 2 })}
                      className="text-xs sm:text-sm"
                      placeholder="Min: 2, Max: 100"
                    />
                  </div>
                </div>

                {/* 9. Bond / Service Agreement */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    9. Bond / Service Agreement <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    {['yes', 'no'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="bond"
                          value={option}
                          checked={formData.bond === option}
                          onChange={(e) => setFormData({ ...formData, bond: e.target.value as any, bondDuration: e.target.value === 'no' ? undefined : formData.bondDuration })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-xs sm:text-sm capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  {formData.bond === 'yes' && (
                    <div className="mt-2">
                      <Label htmlFor="bondDuration" className="text-xs sm:text-sm font-medium">
                        Bond Duration (months)
                      </Label>
                      <Input
                        id="bondDuration"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.bondDuration || ''}
                        onChange={(e) => setFormData({ ...formData, bondDuration: parseInt(e.target.value) || undefined })}
                        className="text-xs sm:text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 🧪 SELECTION PROCESS */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  🧪 Selection Process
                </h3>

                {/* 10. Selection Rounds */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    10. Selection Rounds <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SELECTION_ROUNDS.map(round => (
                      <label key={round} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.selectionRounds?.includes(round)}
                          onCheckedChange={() => toggleRound(round)}
                        />
                        <span className="text-xs sm:text-sm">{round}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 11. Eligibility Criteria */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    11. Eligibility Criteria <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cgpa" className="text-xs text-gray-600">CGPA Cutoff</Label>
                      <Input
                        id="cgpa"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.eligibility?.cgpa || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          eligibility: { ...formData.eligibility!, cgpa: parseFloat(e.target.value) || 0 }
                        })}
                        className="text-xs sm:text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Backlogs Allowed?</Label>
                      <div className="flex gap-4 mt-2">
                        {['yes', 'no'].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="backlogs"
                              value={option}
                              checked={formData.eligibility?.backlogsAllowed === option}
                              onChange={(e) => setFormData({
                                ...formData,
                                eligibility: { ...formData.eligibility!, backlogsAllowed: e.target.value as any }
                              })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-xs sm:text-sm capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 12. Mode of Drive */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">
                      12. Mode of Drive <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col gap-2">
                      {['online', 'offline', 'hybrid'].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="driveMode"
                            value={mode}
                            checked={formData.driveMode === mode}
                            onChange={(e) => setFormData({ ...formData, driveMode: e.target.value as any })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-xs sm:text-sm capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 13. Expected Drive Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expectedDriveDate" className="text-xs sm:text-sm font-medium">
                      13. Expected Drive Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expectedDriveDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.expectedDriveDate || ''}
                      onChange={(e) => setFormData({ ...formData, expectedDriveDate: e.target.value })}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 📞 CONTACT & COMMUNICATION */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  📞 Contact & Communication
                </h3>

                {/* 14. Contact Person */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs sm:text-sm font-medium">
                    14. Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="Name"
                      value={formData.contactPerson?.name || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactPerson: { ...formData.contactPerson!, name: e.target.value }
                      })}
                      className="text-xs sm:text-sm"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.contactPerson?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactPerson: { ...formData.contactPerson!, email: e.target.value }
                      })}
                      className="text-xs sm:text-sm"
                    />
                    <Input
                      type="tel"
                      placeholder="+91-XXXXXXXXXX"
                      value={formData.contactPerson?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactPerson: { ...formData.contactPerson!, phone: e.target.value }
                      })}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* 15. Communication Status */}
                <div className="space-y-2">
                  <Label htmlFor="communicationStatus" className="text-xs sm:text-sm font-medium">
                    15. Communication Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.communicationStatus}
                    onValueChange={(value) => setFormData({ ...formData, communicationStatus: value })}
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email-sent" className="text-xs sm:text-sm">Email Sent</SelectItem>
                      <SelectItem value="follow-up-required" className="text-xs sm:text-sm">Follow-up Required</SelectItem>
                      <SelectItem value="confirmed" className="text-xs sm:text-sm">Confirmed</SelectItem>
                      <SelectItem value="no-response" className="text-xs sm:text-sm">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 📝 NOTES & PRIORITY */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  📝 Notes & Priority
                </h3>

                {/* 16. Internal Notes */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="internalNotes" className="text-xs sm:text-sm font-medium flex items-center justify-between">
                    <span>16. Internal Notes <span className="text-red-500">*</span></span>
                    <span className="text-xs text-gray-500">
                      {formData.internalNotes?.length || 0} / 500
                    </span>
                  </Label>
                  <Textarea
                    id="internalNotes"
                    maxLength={500}
                    rows={4}
                    value={formData.internalNotes || ''}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    placeholder="Add important notes about this recruiter..."
                    className="text-xs sm:text-sm resize-none"
                  />
                </div>

                {/* 17. Priority Level */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    17. Priority Level <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'low', label: '🟢 Low', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                      { value: 'medium', label: '🟡 Medium', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                      { value: 'high', label: '🔴 High', color: 'bg-red-100 text-red-700 hover:bg-red-200' }
                    ].map(priority => (
                      <Badge
                        key={priority.value}
                        onClick={() => setFormData({ ...formData, priorityLevel: priority.value as any })}
                        className={`cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-2 border ${
                          formData.priorityLevel === priority.value
                            ? 'ring-2 ring-offset-2 ring-blue-500 ' + priority.color
                            : priority.color
                        }`}
                      >
                        {priority.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeDialog} className="text-xs sm:text-sm">
                Cancel
              </Button>
              <Button onClick={saveNote} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingNote ? 'Update Note' : 'Save Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      {!searchQuery && (
        <Card className="p-3 sm:p-4 border border-gray-200 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <Input
              placeholder="Search by recruiter, industry, or status..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 sm:pl-9 h-9 sm:h-10 text-xs sm:text-sm bg-gray-50 border-gray-200"
            />
          </div>
        </Card>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card className="p-8 sm:p-12 border border-gray-200 text-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No recruiter notes found</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {activeSearch ? 'Try adjusting your search criteria' : 'Click "Add Recruiter Note" to create your first note'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-4 sm:p-5 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{note.recruiterName}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">{note.industry || 'N/A'}</Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs capitalize">{note.companyType || 'N/A'}</Badge>
                    <Badge className={`text-[10px] sm:text-xs ${getPriorityColor(note.priorityLevel || 'medium')}`}>
                      {getPriorityIcon(note.priorityLevel || 'medium')} {note.priorityLevel || 'medium'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editNote(note)}
                    className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                    title="Edit note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-[10px] sm:text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="capitalize">{note.recruitmentStatus?.replace('-', ' ') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="capitalize">{note.hiringType?.replace('-', ' + ') || 'N/A'}</span>
                  <span className="text-gray-400">•</span>
                  <span>₹{note.packageCTC || 0} LPA</span>
                </div>
                {note.offeredRoles?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.offeredRoles.slice(0, 3).map(role => (
                      <Badge key={role} variant="outline" className="text-[9px] sm:text-[10px]">{role}</Badge>
                    ))}
                    {note.offeredRoles.length > 3 && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px]">+{note.offeredRoles.length - 3}</Badge>
                    )}
                  </div>
                )}
                {note.contactPerson?.name && (
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{note.contactPerson.name}</span>
                  </div>
                )}
                {note.internalNotes && (
                  <p className="text-gray-500 line-clamp-2 mt-2">{note.internalNotes}</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t text-[10px] text-gray-400">
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
