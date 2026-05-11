import React, { useState } from 'react';
import { AlertCircle, Plus, Trash2, Lock, Unlock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

interface BlacklistStudent {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  reason: string;
  dateBlacklisted: string;
  expiryDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blacklistedBy: string;
  status: 'active' | 'expired' | 'appealed' | 'removed';
}

export default function BlacklistHandling() {
  const [blacklist, setBlacklist] = useState<BlacklistStudent[]>([
    { id: '1', studentId: 'STU001', studentName: 'John Doe', companyName: 'Google', reason: 'Declined offer', dateBlacklisted: '2026-03-15', expiryDate: '2027-03-15', severity: 'medium', blacklistedBy: 'Admin', status: 'active' },
  ]);

  const [formData, setFormData] = useState({ studentName: '', companyName: '', reason: '', severity: 'medium' });
  const [showDialog, setShowDialog] = useState(false);

  const handleAddBlacklist = () => {
    if (formData.studentName && formData.companyName) {
      setBlacklist([...blacklist, {
        id: Date.now().toString(),
        studentId: 'STU' + Math.random(),
        studentName: formData.studentName,
        companyName: formData.companyName,
        reason: formData.reason,
        dateBlacklisted: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        severity: formData.severity as any,
        blacklistedBy: 'Admin',
        status: 'active',
      }]);
      setFormData({ studentName: '', companyName: '', reason: '', severity: 'medium' });
      setShowDialog(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
                Blacklist Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                Manage blocked candidates and violations
              </p>
            </div>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
                <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Add to Blacklist</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Blacklist Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">Student Name *</Label>
                  <Input
                    placeholder="Full name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Company *</Label>
                  <Input
                    placeholder="Company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Reason *</Label>
                  <Textarea
                    placeholder="Reason for blacklist"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="h-16 sm:h-20 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Severity</Label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    aria-label="Severity level"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs sm:text-sm dark:bg-slate-800 dark:border-slate-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Button onClick={handleAddBlacklist} className="w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">{blacklist.filter(b => b.status === 'active').length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">{blacklist.filter(b => b.severity === 'critical').length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-600">{blacklist.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Blacklist Entries */}
        <div className="space-y-2 sm:space-y-3">
          {blacklist.map(entry => (
            <Card key={entry.id} className={`transition-all ${entry.status !== 'active' ? 'opacity-60' : ''}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">
                        {entry.studentName}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={getSeverityColor(entry.severity)} style={{ fontSize: '0.65rem' }}>
                          {entry.severity}
                        </Badge>
                        <Badge
                          className={entry.status === 'active' ? 'bg-red-100 text-red-800 text-[0.65rem]' : 'bg-gray-100 text-gray-800 text-[0.65rem]'}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 line-clamp-2">
                      <span className="font-semibold">{entry.companyName}</span> • {entry.reason}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2">
                      {entry.details && `${entry.details.substring(0, 80)}...`}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                      📅 Expires: {new Date(entry.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBlacklist(blacklist.filter(b => b.id !== entry.id))}
                    className="text-red-600 hover:text-red-700 text-[10px] sm:text-xs flex-shrink-0 w-full sm:w-auto"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Remove</span>
                    <span className="sm:hidden">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blacklist.length === 0 && (
          <Card className="text-center p-6 sm:p-8">
            <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No blacklist entries. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
