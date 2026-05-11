import React, { useState } from 'react';
import { Save, X, Plus, Trash2, FileText, CheckCircle, AlertCircle, Eye, Send, Calendar, MapPin, DollarSign, Users, Briefcase } from 'lucide-react';
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

interface JobAnnouncement {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Contract' | 'Hybrid';
  ctc: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  qualifications: string;
  deadline: string;
  postedDate: string;
  numberOfPositions: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  applicants: number;
  shortlisted: number;
  interviewRound: number;
}

interface JAFProps {
  userRole: 'recruiter' | 'admin' | 'coordinator';
}

export default function JobAnnouncementForm({ userRole }: JAFProps) {
  const [formData, setFormData] = useState<Partial<JobAnnouncement>>({
    jobTitle: '',
    companyName: '',
    location: '',
    jobType: 'Full-time',
    ctc: '',
    experience: '',
    description: '',
    responsibilities: [],
    requiredSkills: [],
    preferredSkills: [],
    qualifications: '',
    deadline: '',
    numberOfPositions: 1,
    status: 'draft',
  });

  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [requiredSkillInput, setRequiredSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [publishedJobs, setPublishedJobs] = useState<JobAnnouncement[]>([
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Tech Corp',
      location: 'Bangalore',
      jobType: 'Full-time',
      ctc: '₹25-35 LPA',
      experience: '3-5 years',
      description: 'Looking for experienced software engineers',
      responsibilities: ['Lead development', 'Code review'],
      requiredSkills: ['Java', 'Spring Boot'],
      preferredSkills: ['Kubernetes', 'Docker'],
      qualifications: 'B.Tech in CS or related field',
      deadline: '2026-05-31',
      postedDate: '2026-04-12',
      numberOfPositions: 5,
      status: 'published',
      applicants: 45,
      shortlisted: 8,
      interviewRound: 1,
    },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...(prev.responsibilities || []), responsibilityInput],
      }));
      setResponsibilityInput('');
    }
  };

  const handleAddRequiredSkill = () => {
    if (requiredSkillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), requiredSkillInput],
      }));
      setRequiredSkillInput('');
    }
  };

  const handleAddPreferredSkill = () => {
    if (preferredSkillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...(prev.preferredSkills || []), preferredSkillInput],
      }));
      setPreferredSkillInput('');
    }
  };

  const handleRemoveItem = (array: string[], index: number, type: 'responsibilities' | 'requiredSkills' | 'preferredSkills') => {
    setFormData(prev => ({
      ...prev,
      [type]: array.filter((_, i) => i !== index),
    }));
  };

  const handlePublish = () => {
    const newJob: JobAnnouncement = {
      id: Date.now().toString(),
      ...formData as JobAnnouncement,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'published',
      applicants: 0,
      shortlisted: 0,
      interviewRound: 0,
    };
    setPublishedJobs([...publishedJobs, newJob]);
    setFormData({
      jobTitle: '',
      companyName: '',
      location: '',
      jobType: 'Full-time',
      ctc: '',
      experience: '',
      description: '',
      responsibilities: [],
      requiredSkills: [],
      preferredSkills: [],
      qualifications: '',
      deadline: '',
      numberOfPositions: 1,
      status: 'draft',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Job Announcement Form (JAF)</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and manage job postings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Job Posting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobTitle" className="text-slate-700 dark:text-slate-300">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.jobTitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-300">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., Tech Corp"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="jobType" className="text-slate-700 dark:text-slate-300">Job Type *</Label>
                      <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value as any }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Bangalore"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="positions" className="text-slate-700 dark:text-slate-300">Number of Positions</Label>
                      <Input
                        id="positions"
                        type="number"
                        min="1"
                        value={formData.numberOfPositions || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, numberOfPositions: parseInt(e.target.value) }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ctc" className="text-slate-700 dark:text-slate-300">CTC / Salary *</Label>
                      <Input
                        id="ctc"
                        placeholder="e.g., ₹25-35 LPA"
                        value={formData.ctc || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ctc: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-slate-700 dark:text-slate-300">Experience Required *</Label>
                      <Input
                        id="experience"
                        placeholder="e.g., 3-5 years"
                        value={formData.experience || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline" className="text-slate-700 dark:text-slate-300">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Job Details</h3>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role, team, and responsibilities..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qualifications" className="text-slate-700 dark:text-slate-300">Qualifications & Education</Label>
                    <Textarea
                      id="qualifications"
                      placeholder="e.g., B.Tech in CS or related field"
                      value={formData.qualifications || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                      className="mt-1 h-24"
                    />
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Key Responsibilities</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility..."
                      value={responsibilityInput}
                      onChange={(e) => setResponsibilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibility()}
                    />
                    <Button onClick={handleAddResponsibility} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities?.map((resp, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded">
                        <span className="text-sm text-slate-700 dark:text-slate-300">• {resp}</span>
                        <button
                          title="Delete responsibility"
                          onClick={() => handleRemoveItem(formData.responsibilities || [], idx, 'responsibilities')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4 border-t pt-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Required Skills *</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add a required skill..."
                        value={requiredSkillInput}
                        onChange={(e) => setRequiredSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRequiredSkill()}
                      />
                      <Button title="Add required skill" onClick={handleAddRequiredSkill} size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills?.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-2 py-2 px-3">
                          {skill}
                          <button
                            title="Remove required skill"
                            onClick={() => handleRemoveItem(formData.requiredSkills || [], idx, 'requiredSkills')}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Preferred Skills</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add a preferred skill..."
                        value={preferredSkillInput}
                        onChange={(e) => setPreferredSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPreferredSkill()}
                      />
                      <Button title="Add preferred skill" onClick={handleAddPreferredSkill} size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferredSkills?.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-2 py-2 px-3">
                          {skill}
                          <button
                            title="Remove preferred skill"
                            onClick={() => handleRemoveItem(formData.preferredSkills || [], idx, 'preferredSkills')}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Job Posting Preview</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="font-semibold text-lg text-slate-900 dark:text-white">{formData.jobTitle}</p>
                          <p className="text-slate-600 dark:text-slate-400">{formData.companyName} • {formData.location}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{formData.jobType}</Badge>
                          <Badge variant="outline">{formData.experience}</Badge>
                          <Badge variant="outline">{formData.ctc}</Badge>
                        </div>
                        <div>
                          <p className="font-semibold mb-2">Description</p>
                          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{formData.description}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={handlePublish} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Send className="w-4 h-4" />
                    Publish Job Posting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Published Jobs Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Published Postings ({publishedJobs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {publishedJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{job.jobTitle}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{job.companyName}</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      <Badge className="text-xs" variant="secondary">{job.numberOfPositions} positions</Badge>
                      <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p>📲 {job.applicants} applicants</p>
                      <p>✅ {job.shortlisted} shortlisted</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Total Positions</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{publishedJobs.reduce((sum, job) => sum + job.numberOfPositions, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Total Applicants</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{publishedJobs.reduce((sum, job) => sum + job.applicants, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
