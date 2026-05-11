import React, { useState } from 'react';
import { Building2, Plus, Edit, Trash2, Eye, CheckCircle, Briefcase, Users } from 'lucide-react';
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

interface Role {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  department: string;
  location: string;
  jobType: 'FT' | 'Internship';
  minSalary: number;
  maxSalary: number;
  experienceLevel: 'Fresher' | 'Junior' | 'Mid' | 'Senior';
  requiredSkills: string[];
  description: string;
  numPositions: number;
  status: 'draft' | 'active' | 'closed' | 'archived';
  createdDate: string;
  createdBy: string;
}

export default function RoleCreation() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      title: 'Software Engineer',
      companyId: 'comp1',
      companyName: 'Tech Innovations',
      department: 'Engineering',
      location: 'Bangalore',
      jobType: 'FT',
      minSalary: 500000,
      maxSalary: 800000,
      experienceLevel: 'Junior',
      requiredSkills: ['Java', 'Spring Boot', 'REST APIs'],
      description: 'Looking for talented software engineers',
      numPositions: 3,
      status: 'active',
      createdDate: '2026-04-01',
      createdBy: 'Recruiter1',
    },
  ]);

  const [formData, setFormData] = useState<Partial<Role>>({
    title: '',
    jobType: 'FT',
    experienceLevel: 'Fresher',
    requiredSkills: [],
    status: 'draft',
    numPositions: 1,
  });

  const [skillInput, setSkillInput] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), skillInput],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter((_, i) => i !== index),
    }));
  };

  const handleCreateRole = () => {
    if (editingId) {
      setRoles(roles.map(r => r.id === editingId ? { ...formData, id: editingId, createdDate: r.createdDate, createdBy: r.createdBy } as Role : r));
      setEditingId(null);
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData as Role,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Current Recruiter',
      };
      setRoles([...roles, newRole]);
    }
    setFormData({
      title: '',
      jobType: 'FT',
      experienceLevel: 'Fresher',
      requiredSkills: [],
      status: 'draft',
      numPositions: 1,
    });
    setShowDialog(false);
  };

  const handleEditRole = (role: Role) => {
    setFormData(role);
    setEditingId(role.id);
    setShowDialog(true);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const activeRoles = roles.filter(r => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Role Creation</h1>
                <p className="text-slate-600 dark:text-slate-400">Create and manage job roles</p>
              </div>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Role Title *</Label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        placeholder="Your Company"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input
                        placeholder="Engineering"
                        value={formData.department || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Job Type</Label>
                      <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FT">Full-time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fresher">Fresher</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Positions</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.numPositions || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, numPositions: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Min Salary (Annual)</Label>
                      <Input
                        type="number"
                        placeholder="500000"
                        value={formData.minSalary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, minSalary: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Max Salary (Annual)</Label>
                      <Input
                        type="number"
                        placeholder="1000000"
                        value={formData.maxSalary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxSalary: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="City/Remote"
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Role description..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="h-20"
                    />
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button onClick={handleAddSkill} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills?.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button onClick={() => handleRemoveSkill(idx)}>✕</button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCreateRole} className="flex-1 bg-gradient-to-r from-green-600 to-teal-600">
                      {editingId ? 'Update' : 'Create'} Role
                    </Button>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{roles.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{activeRoles}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{roles.reduce((sum, r) => sum + r.numPositions, 0)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Roles List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{role.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{role.companyName}</p>
                  </div>
                  <Badge className={role.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {role.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Type</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{role.jobType}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Experience</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{role.experienceLevel}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Positions</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{role.numPositions}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Salary Range</p>
                    <p className="font-semibold text-slate-900 dark:text-white">₹{(role.minSalary/100000).toFixed(0)}-{(role.maxSalary/100000).toFixed(0)}L</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {role.requiredSkills?.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                  {role.requiredSkills && role.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{role.requiredSkills.length - 3}</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditRole(role)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteRole(role.id)} className="text-red-600">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-teal-600">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
