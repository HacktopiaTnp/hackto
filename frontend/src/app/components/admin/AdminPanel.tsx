import { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Video, 
  ClipboardList,
  TrendingUp,
  Settings,
  Bell,
  Search,
  LogOut,
  User
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import CompaniesDirectory from './CompaniesDirectory';
import RecruiterNotes from './RecruiterNotes';
import TnPMemberManagement from './TnPMemberManagement';
import StudentReadinessMonitoring from './StudentReadinessMonitoring';
import MockInterviewAnalytics from './MockInterviewAnalytics';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

type AdminView = 'dashboard' | 'companies' | 'notes' | 'members' | 'students' | 'interviews';

interface AdminPanelProps {
  user: {
    name: string;
    email: string;
    role: 'student' | 'coordinator' | 'admin';
  };
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(5);

  const navigation = [
    { id: 'dashboard' as AdminView, name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'companies' as AdminView, name: 'Companies', icon: Building2, badge: null },
    { id: 'notes' as AdminView, name: 'Recruiter Notes', icon: FileText, badge: 3 },
    { id: 'members' as AdminView, name: 'TnP Members', icon: Users, badge: null },
    { id: 'students' as AdminView, name: 'Student Readiness', icon: ClipboardList, badge: 12 },
    { id: 'interviews' as AdminView, name: 'Mock Interviews', icon: Video, badge: null },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'companies':
        return <CompaniesDirectory searchQuery={searchQuery} />;
      case 'notes':
        return <RecruiterNotes />;
      case 'members':
        return <TnPMemberManagement />;
      case 'students':
        return <StudentReadinessMonitoring />;
      case 'interviews':
        return <MockInterviewAnalytics />;
      default:
        return <AdminDashboard />;
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'companies':
        return 'Search companies...';
      case 'notes':
        return 'Search recruiter notes...';
      case 'members':
        return 'Search TnP members...';
      case 'students':
        return 'Search students...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">TnP Admin Portal</h1>
                  <p className="text-xs text-gray-500">Training & Placement Cell</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-xs bg-red-500 border-0">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center text-xs bg-red-500 border-0">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
