import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Mail, Phone, Shield, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';

interface TnPMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'coordinator' | 'member';
  department: string;
  responsibilities: string[];
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
}

export default function TnPMemberManagement() {
  const [members, setMembers] = useState<TnPMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TnPMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member' as 'admin' | 'coordinator' | 'member',
    department: '',
    responsibilities: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    const saved = localStorage.getItem('tnpMembers');
    if (saved) {
      setMembers(JSON.parse(saved));
    } else {
      const sampleMembers: TnPMember[] = [
        {
          id: '1',
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@college.edu',
          phone: '+91 98765 43210',
          role: 'admin',
          department: 'Computer Science',
          responsibilities: ['Strategic Planning', 'Company Relations', 'Final Approvals'],
          status: 'active',
          joinedDate: '2024-01-15',
          lastActive: '2026-02-01'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya.sharma@college.edu',
          phone: '+91 98765 43211',
          role: 'coordinator',
          department: 'Training & Placement',
          responsibilities: ['Drive Scheduling', 'Student Communication'],
          status: 'active',
          joinedDate: '2024-03-20',
          lastActive: '2026-02-01'
        }
      ];
      setMembers(sampleMembers);
      localStorage.setItem('tnpMembers', JSON.stringify(sampleMembers));
    }
  }, []);

  const saveMembers = (updatedMembers: TnPMember[]) => {
    setMembers(updatedMembers);
    localStorage.setItem('tnpMembers', JSON.stringify(updatedMembers));
  };

  const handleAddMember = () => {
    const newMember: TnPMember = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      responsibilities: formData.responsibilities.split(',').map(r => r.trim()).filter(r => r),
      status: formData.status,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0]
    };
    saveMembers([...members, newMember]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditMember = () => {
    if (!editingMember) return;
    const updatedMembers = members.map(m => 
      m.id === editingMember.id 
        ? {
            ...m,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            department: formData.department,
            responsibilities: formData.responsibilities.split(',').map(r => r.trim()).filter(r => r),
            status: formData.status
          }
        : m
    );
    saveMembers(updatedMembers);
    resetForm();
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      saveMembers(members.filter(m => m.id !== id));
    }
  };

  const openEditDialog = (member: TnPMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      responsibilities: member.responsibilities.join(', '),
      status: member.status
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'member',
      department: '',
      responsibilities: '',
      status: 'active'
    });
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    admins: members.filter(m => m.role === 'admin').length,
    coordinators: members.filter(m => m.role === 'coordinator').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.coordinators}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              TnP Team Members
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New TnP Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Dr. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@college.edu" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input id="department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <select id="role" aria-label="Select member role" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}>
                        <option value="member">Member</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <select id="status" aria-label="Select member status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities (comma-separated)</Label>
                    <Input id="responsibilities" value={formData.responsibilities} onChange={(e) => setFormData({...formData, responsibilities: e.target.value})} />
                  </div>
                  <Button onClick={handleAddMember} className="w-full">Add Member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <Badge variant={member.role === 'admin' ? 'destructive' : 'default'}>
                          {member.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                          {member.role.toUpperCase()}
                        </Badge>
                        {member.status === 'active' ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <XCircle className="h-3 w-3 mr-1" />Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />{member.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />{member.phone}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Department:</span> {member.department}
                      </div>
                      <div>
                        <span className="text-sm font-medium">Responsibilities:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.responsibilities.map((resp, idx) => (
                            <Badge key={idx} variant="outline">{resp}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(member.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(member)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label>Department *</Label>
                                <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Role *</Label>
                                <select aria-label="Edit member role" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}>
                                  <option value="member">Member</option>
                                  <option value="coordinator">Coordinator</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Status *</Label>
                                <select aria-label="Edit member status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Responsibilities</Label>
                              <Input value={formData.responsibilities} onChange={(e) => setFormData({...formData, responsibilities: e.target.value})} />
                            </div>
                            <Button onClick={handleEditMember} className="w-full">Update</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteMember(member.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No members found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
