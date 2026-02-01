import { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar, MessageSquare, Building2, User, Clock, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface RecruiterOutreachProps {
  userRole: 'student' | 'coordinator' | 'admin';
  searchQuery?: string;
  setView?: (view: 'dashboard' | 'opportunities' | 'recruiters' | 'interview' | 'analytics') => void;
}

interface Recruiter {
  id: number;
  name: string;
  company: string;
  designation: string;
  email: string;
  phone: string;
  linkedin: string;
  status: 'active' | 'pending' | 'inactive';
  lastContact: string;
  nextFollowup: string;
  interactions: Interaction[];
  notes: string;
  tags: string[];
}

interface Interaction {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'campus-visit';
  date: string;
  summary: string;
  outcome: 'successful' | 'pending' | 'unsuccessful';
  nextSteps: string;
}

export default function RecruiterOutreach({ userRole, searchQuery: globalSearchQuery = '', setView }: RecruiterOutreachProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [showAddRecruiter, setShowAddRecruiter] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'campus-visit',
    summary: '',
    outcome: 'successful' as 'successful' | 'pending' | 'unsuccessful',
    nextSteps: '',
  });
  
  // Use global search if provided, otherwise use local search
  const activeSearchQuery = globalSearchQuery || searchQuery;

  const recruiters: Recruiter[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      company: 'Google India',
      designation: 'Senior Talent Acquisition Partner',
      email: 'priya.sharma@google.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/priyasharma',
      status: 'active',
      lastContact: '2026-01-28',
      nextFollowup: '2026-02-05',
      notes: 'Looking for SDE roles for 2026 batch. Interested in campus drive in March.',
      tags: ['High Priority', 'Campus Drive'],
      interactions: [
        {
          id: 1,
          type: 'call',
          date: '2026-01-28',
          summary: 'Discussed upcoming campus drive for SDE roles. They are looking for 15-20 candidates with strong DSA skills.',
          outcome: 'successful',
          nextSteps: 'Send student profiles by Feb 5. Schedule campus visit for March 15.',
        },
        {
          id: 2,
          type: 'email',
          date: '2026-01-20',
          summary: 'Initial outreach email sent introducing our college and placement statistics.',
          outcome: 'successful',
          nextSteps: 'Follow up call scheduled.',
        },
      ],
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      company: 'Microsoft',
      designation: 'University Recruiting Lead',
      email: 'rajesh.kumar@microsoft.com',
      phone: '+91 98765 43211',
      linkedin: 'linkedin.com/in/rajeshkumar',
      status: 'active',
      lastContact: '2026-01-25',
      nextFollowup: '2026-02-08',
      notes: 'Interested in both Full-time and Internship positions. Preference for students with Azure certification.',
      tags: ['Campus Drive', 'Internship'],
      interactions: [
        {
          id: 1,
          type: 'meeting',
          date: '2026-01-25',
          summary: 'Virtual meeting to discuss partnership opportunities. Showed interest in our AI/ML lab projects.',
          outcome: 'successful',
          nextSteps: 'Send detailed proposal by Feb 1. Plan campus visit for late February.',
        },
      ],
    },
    {
      id: 3,
      name: 'Anjali Verma',
      company: 'Amazon',
      designation: 'Campus Recruitment Manager',
      email: 'anjali.verma@amazon.com',
      phone: '+91 98765 43212',
      linkedin: 'linkedin.com/in/anjaliverma',
      status: 'pending',
      lastContact: '2026-01-15',
      nextFollowup: '2026-02-01',
      notes: 'Awaiting response on campus drive proposal. Last year hired 12 students.',
      tags: ['Follow-up Required', 'Previous Recruiter'],
      interactions: [
        {
          id: 1,
          type: 'email',
          date: '2026-01-15',
          summary: 'Sent proposal for 2026 campus recruitment drive with placement statistics.',
          outcome: 'pending',
          nextSteps: 'Follow up if no response by Feb 1.',
        },
      ],
    },
    {
      id: 4,
      name: 'Vikram Singh',
      company: 'Flipkart',
      designation: 'Talent Acquisition Specialist',
      email: 'vikram.singh@flipkart.com',
      phone: '+91 98765 43213',
      linkedin: 'linkedin.com/in/vikramsingh',
      status: 'active',
      lastContact: '2026-01-30',
      nextFollowup: '2026-02-10',
      notes: 'Looking for Product Management and SDE roles. Campus drive confirmed for Feb 20.',
      tags: ['Campus Drive', 'Confirmed'],
      interactions: [
        {
          id: 1,
          type: 'campus-visit',
          date: '2026-01-30',
          summary: 'Campus visit conducted. Met with students and faculty. Finalized drive details.',
          outcome: 'successful',
          nextSteps: 'Send final list of registered students by Feb 15.',
        },
      ],
    },
    {
      id: 5,
      name: 'Sneha Reddy',
      company: 'TCS',
      designation: 'HR Manager',
      email: 'sneha.reddy@tcs.com',
      phone: '+91 98765 43214',
      linkedin: 'linkedin.com/in/snehareddy',
      status: 'inactive',
      lastContact: '2025-12-10',
      nextFollowup: '2026-03-01',
      notes: 'Will visit campus in March for Digital Transformation roles.',
      tags: ['Scheduled for Later'],
      interactions: [
        {
          id: 1,
          type: 'call',
          date: '2025-12-10',
          summary: 'Discussed potential roles for 2026 batch. Tentatively scheduled for March.',
          outcome: 'successful',
          nextSteps: 'Reconnect in February for final confirmation.',
        },
      ],
    },
  ];

  const filteredRecruiters = recruiters.filter(recruiter =>
    recruiter.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    recruiter.company.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Recruiters', value: recruiters.length, icon: User, color: 'bg-blue-500' },
    { label: 'Active Outreach', value: recruiters.filter(r => r.status === 'active').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Follow-ups', value: recruiters.filter(r => r.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Campus Drives', value: 8, icon: Building2, color: 'bg-purple-500' },
  ];

  const handleAddInteraction = () => {
    if (selectedRecruiter && newInteraction.summary) {
      alert('Interaction logged successfully!');
      setShowAddInteraction(false);
      setNewInteraction({
        type: 'call',
        summary: '',
        outcome: 'successful',
        nextSteps: '',
      });
    }
  };

  if (userRole !== 'coordinator') {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="size-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Coordinator Access Only</h2>
          <p className="text-slate-600">
            This module is only accessible to TnP coordinators for managing recruiter relationships.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">Recruiter Outreach</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">
              Manage company contacts, track interactions, and coordinate campus visits
            </p>
          </div>
          <Button onClick={() => setShowAddRecruiter(true)} className="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base">
            <Plus className="size-4 mr-2" />
            Add Recruiter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`${stat.color} p-1.5 md:p-2 rounded-lg`}>
                  <Icon className="size-4 md:size-5 text-white" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs md:text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card className="p-4 md:p-6 mb-6 border-2 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
            <Input
              placeholder="Search recruiters by name, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-10 h-10 md:h-11 text-sm md:text-base border-2 border-slate-300 focus:border-blue-500"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto h-10 md:h-11 text-sm md:text-base">Export Data</Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Recruiters ({filteredRecruiters.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({recruiters.filter(r => r.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({recruiters.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({recruiters.filter(r => r.status === 'inactive').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredRecruiters.map((recruiter) => (
            <Card key={recruiter.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shrink-0">
                    {recruiter.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{recruiter.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          recruiter.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                          recruiter.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }
                      >
                        {recruiter.status}
                      </Badge>
                      {recruiter.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{recruiter.designation} at {recruiter.company}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <a href={`mailto:${recruiter.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <Mail className="size-4" />
                        <span>{recruiter.email}</span>
                      </a>
                      <a href={`tel:${recruiter.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <Phone className="size-4" />
                        <span>{recruiter.phone}</span>
                      </a>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="size-4" />
                        <span>Last Contact: {recruiter.lastContact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="size-4" />
                        <span>Next Follow-up: {recruiter.nextFollowup}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 italic">"{recruiter.notes}"</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={() => setSelectedRecruiter(recruiter)}>
                        <MessageSquare className="size-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedRecruiter(recruiter); setShowAddInteraction(true); }}>
                        <Plus className="size-4 mr-2" />
                        Log Interaction
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${recruiter.phone}`}>
                          <Phone className="size-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`mailto:${recruiter.email}`}>
                          <Mail className="size-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {filteredRecruiters.filter(r => r.status === 'active').map((recruiter) => (
            <Card key={recruiter.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                  {recruiter.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{recruiter.name}</h3>
                  <p className="text-sm text-slate-600">{recruiter.company}</p>
                  <Button size="sm" className="mt-3" onClick={() => setSelectedRecruiter(recruiter)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {filteredRecruiters.filter(r => r.status === 'pending').map((recruiter) => (
            <Card key={recruiter.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700">
                  {recruiter.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{recruiter.name}</h3>
                  <p className="text-sm text-slate-600">{recruiter.company}</p>
                  <p className="text-sm text-yellow-600 mt-2">Follow-up due: {recruiter.nextFollowup}</p>
                  <Button size="sm" className="mt-3" onClick={() => setSelectedRecruiter(recruiter)}>
                    Follow Up Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4 mt-6">
          {filteredRecruiters.filter(r => r.status === 'inactive').map((recruiter) => (
            <Card key={recruiter.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                  {recruiter.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{recruiter.name}</h3>
                  <p className="text-sm text-slate-600">{recruiter.company}</p>
                  <Button size="sm" className="mt-3" onClick={() => setSelectedRecruiter(recruiter)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Recruiter Details Dialog */}
      <Dialog open={!!selectedRecruiter && !showAddInteraction} onOpenChange={(open) => !open && setSelectedRecruiter(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedRecruiter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecruiter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-xl">
                    {selectedRecruiter.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedRecruiter.designation}</h3>
                    <p className="text-slate-600">{selectedRecruiter.company}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={
                          selectedRecruiter.status === 'active' ? 'bg-green-50 text-green-700' :
                          selectedRecruiter.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-slate-50 text-slate-700'
                        }
                      >
                        {selectedRecruiter.status}
                      </Badge>
                      {selectedRecruiter.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-slate-600">Email</h4>
                    <a href={`mailto:${selectedRecruiter.email}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                      {selectedRecruiter.email}
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-slate-600">Phone</h4>
                    <a href={`tel:${selectedRecruiter.phone}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                      {selectedRecruiter.phone}
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-slate-600">LinkedIn</h4>
                    <a 
                      href={`https://${selectedRecruiter.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      View Profile
                      <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-slate-600">Last Contact</h4>
                    <p className="text-slate-900">{selectedRecruiter.lastContact}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-slate-600">Next Follow-up</h4>
                    <p className="text-slate-900">{selectedRecruiter.nextFollowup}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-slate-600 italic">"{selectedRecruiter.notes}"</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Interaction History ({selectedRecruiter.interactions.length})</h4>
                  <div className="space-y-3">
                    {selectedRecruiter.interactions.map((interaction) => (
                      <Card key={interaction.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            interaction.type === 'call' ? 'bg-blue-100' :
                            interaction.type === 'email' ? 'bg-purple-100' :
                            interaction.type === 'meeting' ? 'bg-green-100' :
                            'bg-orange-100'
                          }`}>
                            {interaction.type === 'call' && <Phone className="size-4 text-blue-600" />}
                            {interaction.type === 'email' && <Mail className="size-4 text-purple-600" />}
                            {interaction.type === 'meeting' && <MessageSquare className="size-4 text-green-600" />}
                            {interaction.type === 'campus-visit' && <Building2 className="size-4 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">{interaction.type.replace('-', ' ')}</Badge>
                              <span className="text-sm text-slate-600">{interaction.date}</span>
                              <Badge
                                variant="outline"
                                className={
                                  interaction.outcome === 'successful' ? 'bg-green-50 text-green-700' :
                                  interaction.outcome === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                }
                              >
                                {interaction.outcome}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-900 mb-2">{interaction.summary}</p>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">Next Steps:</span> {interaction.nextSteps}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t flex-wrap">
                  <Button onClick={() => setShowAddInteraction(true)}>
                    <Plus className="size-4 mr-2" />
                    Log New Interaction
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`tel:${selectedRecruiter.phone}`}>
                      <Phone className="size-4 mr-2" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedRecruiter.email}`}>
                      <Mail className="size-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`https://${selectedRecruiter.linkedin}`} target="_blank" rel="noopener noreferrer">
                      <Building2 className="size-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline">
                    <Edit className="size-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Interaction Dialog */}
      <Dialog open={showAddInteraction} onOpenChange={setShowAddInteraction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Interaction Type</Label>
              <Select value={newInteraction.type} onValueChange={(value: any) => setNewInteraction({...newInteraction, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="campus-visit">Campus Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea
                placeholder="Describe what was discussed..."
                value={newInteraction.summary}
                onChange={(e) => setNewInteraction({...newInteraction, summary: e.target.value})}
                rows={4}
              />
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={newInteraction.outcome} onValueChange={(value: any) => setNewInteraction({...newInteraction, outcome: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Steps</Label>
              <Textarea
                placeholder="What are the next action items..."
                value={newInteraction.nextSteps}
                onChange={(e) => setNewInteraction({...newInteraction, nextSteps: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddInteraction(false)}>Cancel</Button>
            <Button onClick={handleAddInteraction}>Save Interaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Recruiter Dialog */}
      <Dialog open={showAddRecruiter} onOpenChange={setShowAddRecruiter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Recruiter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Recruiter name" />
            </div>
            <div>
              <Label>Company</Label>
              <Input placeholder="Company name" />
            </div>
            <div>
              <Label>Designation</Label>
              <Input placeholder="Job title" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="email@company.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any additional notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecruiter(false)}>Cancel</Button>
            <Button onClick={() => { alert('Recruiter added successfully!'); setShowAddRecruiter(false); }}>
              Add Recruiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
