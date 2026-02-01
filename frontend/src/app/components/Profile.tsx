import { useState } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, MapPin, Briefcase, Award, FileText, Edit, Save, Download, Upload } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface ProfileProps {
  user: {
    name: string;
    email: string;
    role: 'student' | 'coordinator' | 'admin';
    branch?: string;
    year?: string;
  };
  onUpdate: (user: any) => void;
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+91 98765 43210',
    rollNumber: 'CS21B1042',
    branch: user.branch || 'Computer Science',
    year: user.year || '2026',
    cgpa: '8.5',
    location: 'Hyderabad, India',
    linkedin: 'linkedin.com/in/rahulkumar',
    github: 'github.com/rahulkumar',
    portfolio: 'rahulkumar.dev',
    about: 'Passionate software engineer with strong problem-solving skills and experience in full-stack development. Looking for opportunities to work on challenging projects and contribute to innovative solutions.',
  });

  const skills = [
    { name: 'Python', level: 90 },
    { name: 'JavaScript', level: 85 },
    { name: 'React', level: 88 },
    { name: 'Node.js', level: 82 },
    { name: 'SQL', level: 80 },
    { name: 'Data Structures', level: 92 },
    { name: 'Algorithms', level: 88 },
    { name: 'System Design', level: 70 },
  ];

  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce platform using MERN stack with payment integration',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      duration: 'Jan 2025 - Present',
    },
    {
      title: 'AI Chatbot',
      description: 'Developed an intelligent chatbot using NLP for customer support automation',
      tech: ['Python', 'TensorFlow', 'Flask', 'React'],
      duration: 'Sep 2024 - Dec 2024',
    },
    {
      title: 'Task Management App',
      description: 'Created a collaborative task management application with real-time updates',
      tech: ['React', 'Firebase', 'Material-UI'],
      duration: 'Jun 2024 - Aug 2024',
    },
  ];

  const certifications = [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2025' },
    { name: 'Google Cloud Professional', issuer: 'Google', date: '2024' },
    { name: 'Full Stack Development', issuer: 'Coursera', date: '2024' },
  ];

  const achievements = [
    'Winner - Smart India Hackathon 2024',
    'First Prize - College Coding Competition',
    'Published Research Paper in IEEE Conference',
    'Google Code Jam - Top 100 India',
  ];

  const handleSave = () => {
    onUpdate({
      ...user,
      name: profileData.name,
      email: profileData.email,
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="size-32 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-5xl font-bold border-4 border-white/30 shadow-2xl">
                {profileData.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{profileData.name}</h1>
                <p className="text-blue-100 text-lg mb-4">{profileData.email}</p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white/20 backdrop-blur text-white border-white/30 px-3 py-1">
                    <BookOpen className="size-4 mr-1.5" />
                    {profileData.branch}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur text-white border-white/30 px-3 py-1">
                    <Calendar className="size-4 mr-1.5" />
                    Batch {profileData.year}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur text-white border-white/30 px-3 py-1">
                    <Award className="size-4 mr-1.5" />
                    CGPA: {profileData.cgpa}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur text-white border-white/30 px-3 py-1">
                    <MapPin className="size-4 mr-1.5" />
                    {profileData.location}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-white text-blue-600 hover:bg-blue-50">
                  <Edit className="size-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="size-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills & Projects</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-600 font-medium">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="mt-1.5"
                      />
                    ) : (
                      <p className="mt-1.5 text-slate-900 font-medium">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Roll Number</Label>
                    <p className="mt-1.5 text-slate-900 font-medium">{profileData.rollNumber}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Email</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="mt-1.5"
                      />
                    ) : (
                      <p className="mt-1.5 text-slate-900 font-medium">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="mt-1.5"
                      />
                    ) : (
                      <p className="mt-1.5 text-slate-900 font-medium">{profileData.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Branch</Label>
                    <p className="mt-1.5 text-slate-900 font-medium">{profileData.branch}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Passout Year</Label>
                    <p className="mt-1.5 text-slate-900 font-medium">{profileData.year}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">CGPA</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.cgpa}
                        onChange={(e) => setProfileData({ ...profileData, cgpa: e.target.value })}
                        className="mt-1.5"
                      />
                    ) : (
                      <p className="mt-1.5 text-slate-900 font-medium">{profileData.cgpa}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-600 font-medium">Location</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="mt-1.5"
                      />
                    ) : (
                      <p className="mt-1.5 text-slate-900 font-medium">{profileData.location}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-slate-600 font-medium">About Me</Label>
                  {isEditing ? (
                    <Textarea
                      value={profileData.about}
                      onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                      className="mt-1.5"
                      rows={4}
                    />
                  ) : (
                    <p className="mt-1.5 text-slate-700 leading-relaxed">{profileData.about}</p>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Profile Completion</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Overall</span>
                        <span className="text-sm font-bold text-green-600">85%</span>
                      </div>
                      <Progress value={85} className="h-3" />
                    </div>
                    <div className="pt-4 border-t space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">✓ Personal Info</span>
                        <span className="text-green-600 font-medium">Complete</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">✓ Skills</span>
                        <span className="text-green-600 font-medium">Complete</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">✓ Projects</span>
                        <span className="text-green-600 font-medium">Complete</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">○ Resume</span>
                        <span className="text-orange-600 font-medium">Pending</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Social Links</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-600">LinkedIn</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-blue-600">{profileData.linkedin}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">GitHub</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.github}
                          onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-blue-600">{profileData.github}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Portfolio</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.portfolio}
                          onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-blue-600">{profileData.portfolio}</p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">Placement Status</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">Active</p>
                  <p className="text-sm text-green-700">Eligible for all drives</p>
                </Card>
              </div>
            </div>

            {/* Certifications */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="size-5 text-purple-600" />
                Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                    <p className="font-bold text-slate-900 mb-1">{cert.name}</p>
                    <p className="text-sm text-slate-600">{cert.issuer} • {cert.date}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="size-5 text-yellow-600" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                    <span className="text-2xl">🏆</span>
                    <p className="text-sm text-slate-700 font-medium">{achievement}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {/* Skills */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Technical Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{skill.name}</span>
                      <span className="text-sm font-bold text-blue-600">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2.5" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Projects */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Projects</h3>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-5 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-lg text-slate-900">{project.title}</h4>
                      <Badge variant="outline">{project.duration}</Badge>
                    </div>
                    <p className="text-slate-600 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card className="p-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="size-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="size-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Resume Manager</h3>
                <p className="text-slate-600 mb-8">Upload and manage your resume for job applications</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="size-5 mr-2" />
                    Upload Resume
                  </Button>
                  <Button size="lg" variant="outline">
                    <Download className="size-5 mr-2" />
                    Download Current
                  </Button>
                </div>

                <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                  <p className="text-sm text-slate-600 mb-2">Current Resume: <span className="font-bold">Rahul_Kumar_Resume_2026.pdf</span></p>
                  <p className="text-xs text-slate-500">Last updated: January 28, 2026</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label>Email Notifications</Label>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="size-4 rounded" />
                      <span className="text-sm text-slate-700">New job matches</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="size-4 rounded" />
                      <span className="text-sm text-slate-700">Application updates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="size-4 rounded" />
                      <span className="text-sm text-slate-700">Interview reminders</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Privacy Settings</Label>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="size-4 rounded" />
                      <span className="text-sm text-slate-700">Make profile visible to recruiters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="size-4 rounded" />
                      <span className="text-sm text-slate-700">Show contact information</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
