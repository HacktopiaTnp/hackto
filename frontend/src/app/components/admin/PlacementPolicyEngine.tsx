import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle, Copy, Eye, Zap, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Toggle } from '@/app/components/ui/toggle';

interface PolicyRule {
  id: string;
  name: string;
  type: 'one-offer' | 'branch-rule' | 'cgpa-rule' | 'blacklist' | 'bonus-points' | 'custom';
  enabled: boolean;
  description: string;
  conditions: string[];
  action: string;
  priority: number;
  appliedTo: string; // batch/branch/all
  startDate: string;
  endDate: string;
  createdDate: string;
  createdBy: string;
}

interface PlacementPolicyEngineProps {
  userRole: 'admin' | 'coordinator';
}

export default function PlacementPolicyEngine({ userRole }: PlacementPolicyEngineProps) {
  const [policies, setPolicies] = useState<PolicyRule[]>([
    {
      id: '1',
      name: 'One Offer Policy 2026',
      type: 'one-offer',
      enabled: true,
      description: 'Students can accept only one offer per academic year',
      conditions: ['Student has accepted an offer', 'Another offer received'],
      action: 'Block second offer acceptance',
      priority: 1,
      appliedTo: 'all',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      createdDate: '2026-03-15',
      createdBy: 'Admin',
    },
    {
      id: '2',
      name: 'CSE Branch Premium Package',
      type: 'bonus-points',
      enabled: true,
      description: 'CSE students get 5% bonus in scoring',
      conditions: ['Branch = CSE', 'Package >= 15 LPA'],
      action: 'Add 5% bonus to score',
      priority: 2,
      appliedTo: 'CSE',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      createdDate: '2026-04-01',
      createdBy: 'Admin',
    },
  ]);

  const [formData, setFormData] = useState<Partial<PolicyRule>>({
    name: '',
    type: 'custom',
    enabled: true,
    description: '',
    conditions: [],
    action: '',
    appliedTo: 'all',
    priority: 5,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [conditionInput, setConditionInput] = useState('');

  const policyTypes = [
    { value: 'one-offer', label: 'One Offer Policy - Limit student to single acceptance' },
    { value: 'branch-rule', label: 'Branch Rules - Apply branch-specific policies' },
    { value: 'cgpa-rule', label: 'CGPA Rules - CGPA-based eligibility' },
    { value: 'blacklist', label: 'Blacklist - Block students from offers' },
    { value: 'bonus-points', label: 'Bonus Points - Add bonus to scoring' },
    { value: 'custom', label: 'Custom Rule - Define custom logic' },
  ];

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...(prev.conditions || []), conditionInput],
      }));
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index),
    }));
  };

  const handleAddPolicy = () => {
    if (editingId) {
      setPolicies(policies.map(p => p.id === editingId ? { ...formData, id: editingId, createdDate: p.createdDate, createdBy: p.createdBy } as PolicyRule : p));
      setEditingId(null);
    } else {
      const newPolicy: PolicyRule = {
        id: Date.now().toString(),
        ...formData as PolicyRule,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Current Admin',
      };
      setPolicies([...policies, newPolicy]);
    }
    setFormData({
      name: '',
      type: 'custom',
      enabled: true,
      description: '',
      conditions: [],
      action: '',
      appliedTo: 'all',
      priority: 5,
    });
    setShowDialog(false);
  };

  const handleEditPolicy = (policy: PolicyRule) => {
    setFormData(policy);
    setEditingId(policy.id);
    setShowDialog(true);
  };

  const handleDeletePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one-offer':
        return 'bg-red-100 text-red-800';
      case 'branch-rule':
        return 'bg-purple-100 text-purple-800';
      case 'cgpa-rule':
        return 'bg-blue-100 text-blue-800';
      case 'blacklist':
        return 'bg-orange-100 text-orange-800';
      case 'bonus-points':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activePolicies = policies.filter(p => p.enabled).length;
  const totalPolicies = policies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex-shrink-0">
                <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white break-words">
                  Placement Policy Engine
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  Define and manage placement rules & regulations
                </p>
              </div>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-xs sm:text-sm">
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden xs:inline">New Policy</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">{editingId ? 'Edit Policy Rule' : 'Create New Policy Rule'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Policy Name *</Label>
                    <Input
                      placeholder="e.g., One Offer Policy 2026"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Policy Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {policyTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm">{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Description</Label>
                    <Textarea
                      placeholder="Describe this policy..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="h-16 sm:h-20 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Action *</Label>
                    <Input
                      placeholder="e.g., Block second offer acceptance"
                      value={formData.action || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                      className="text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Priority (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.priority || 3}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Applied To</Label>
                      <Select value={formData.appliedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, appliedTo: value }))}>
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs sm:text-sm">All Students</SelectItem>
                          <SelectItem value="CSE" className="text-xs sm:text-sm">CSE Branch</SelectItem>
                          <SelectItem value="IT" className="text-xs sm:text-sm">IT Branch</SelectItem>
                          <SelectItem value="ECE" className="text-xs sm:text-sm">ECE Branch</SelectItem>
                          <SelectItem value="batch-2025" className="text-xs sm:text-sm">Batch 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">Start Date</Label>
                      <Input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">End Date</Label>
                      <Input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-xs sm:text-sm">Conditions</Label>
                    <div className="flex gap-1 sm:gap-2 mb-3">
                      <Input
                        placeholder="Add a condition..."
                        value={conditionInput}
                        onChange={(e) => setConditionInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                        className="text-xs sm:text-sm flex-1"
                      />
                      <Button onClick={handleAddCondition} size="sm" variant="outline" className="text-xs sm:text-sm">
                        <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      {formData.conditions?.map((condition, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs sm:text-sm gap-2">
                          <span className="line-clamp-1">{condition}</span>
                          <button title="Remove condition" onClick={() => handleRemoveCondition(idx)} className="text-red-600 hover:text-red-700 flex-shrink-0">
                            <X className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button onClick={handleAddPolicy} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-xs sm:text-sm">
                      {editingId ? 'Update Policy' : 'Create Policy'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDialog(false)} className="text-xs sm:text-sm">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">{totalPolicies}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Total Policies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{activePolicies}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Active Policies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{totalPolicies - activePolicies}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Disabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Policies List */}
        <div className="space-y-3 sm:space-y-4">
          {policies.map((policy) => (
            <Card key={policy.id} className={`transition-all ${!policy.enabled ? 'opacity-60' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">{policy.name}</h3>
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={getTypeColor(policy.type)} style={{ fontSize: '0.65rem' }}>{policy.type.replace('-', ' ')}</Badge>
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-[10px] sm:text-xs">
                          P:{policy.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{policy.description}</p>
                  </div>
                  <Toggle
                    pressed={policy.enabled}
                    onPressedChange={() => handleTogglePolicy(policy.id)}
                    className="flex-shrink-0"
                  >
                    <Lock className="w-3 sm:w-4 h-3 sm:h-4" />
                  </Toggle>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Action</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{policy.action}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Applied To</p>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">{policy.appliedTo}</Badge>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Duration</p>
                    <p className="text-[10px] sm:text-xs text-slate-900 dark:text-white">
                      {new Date(policy.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(policy.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">Created By</p>
                    <p className="text-[10px] sm:text-xs text-slate-900 dark:text-white">{policy.createdBy}</p>
                  </div>
                </div>

                {/* Conditions */}
                {policy.conditions.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Conditions:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {policy.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] sm:text-xs line-clamp-1">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPolicy(policy)}
                    className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">✎</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newPolicy = { ...policy, id: Date.now().toString(), name: `${policy.name} (Copy)` };
                      setPolicies([...policies, newPolicy]);
                    }}
                    className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Duplicate</span>
                    <span className="sm:hidden">⧉</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto sm:ml-0 text-red-600 hover:text-red-700 text-[10px] sm:text-xs flex-1 sm:flex-none"
                    onClick={() => handleDeletePolicy(policy.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {policies.length === 0 && (
          <Card className="text-center p-6 sm:p-8">
            <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No policies created yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
