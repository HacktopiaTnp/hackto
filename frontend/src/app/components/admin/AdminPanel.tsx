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
  User,
  Calendar,
  CheckSquare,
  Shield,
  AlertCircle,
  TrendingDown,
  Archive,
  Menu,
  X
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import CompaniesDirectory from './CompaniesDirectory';
import RecruiterNotes from './RecruiterNotes';
import TnPMemberManagement from './TnPMemberManagement';
import StudentReadinessMonitoring from './StudentReadinessMonitoring';
import MockInterviewAnalytics from './MockInterviewAnalytics';
import DriveManagement from './DriveManagement';
import OfferManagement from './OfferManagement';
import PlacementPolicyEngine from './PlacementPolicyEngine';
import BlacklistHandling from './BlacklistHandling';
import OneOfferPolicyEngine from './OneOfferPolicyEngine';
import ResumeBooks from './ResumeBooks';
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

type AdminView = 'dashboard' | 'companies' | 'notes' | 'members' | 'students' | 'interviews' | 'drives' | 'offers' | 'policies' | 'blacklist' | 'one-offer-policy' | 'resumes';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard' as AdminView, name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'companies' as AdminView, name: 'Companies', icon: Building2, badge: null },
    { id: 'notes' as AdminView, name: 'Recruiter Notes', icon: FileText, badge: 3 },
    { id: 'members' as AdminView, name: 'TnP Members', icon: Users, badge: null },
    { id: 'students' as AdminView, name: 'Student Readiness', icon: ClipboardList, badge: 12 },
    { id: 'interviews' as AdminView, name: 'Mock Interviews', icon: Video, badge: null },
    // New Admin Modules
    { id: 'drives' as AdminView, name: 'Drive Management', icon: Calendar, badge: null },
    { id: 'offers' as AdminView, name: 'Offer Management', icon: CheckSquare, badge: 5 },
    { id: 'policies' as AdminView, name: 'Placement Policies', icon: Shield, badge: null },
    { id: 'blacklist' as AdminView, name: 'Blacklist', icon: AlertCircle, badge: 2 },
    { id: 'one-offer-policy' as AdminView, name: 'One-Offer Policy', icon: TrendingDown, badge: null },
    { id: 'resumes' as AdminView, name: 'Resume Books', icon: Archive, badge: null },
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
      // New Admin Modules
      case 'drives':
        return <DriveManagement />;
      case 'offers':
        return <OfferManagement />;
      case 'policies':
        return <PlacementPolicyEngine />;
      case 'blacklist':
        return <BlacklistHandling />;
      case 'one-offer-policy':
        return <OneOfferPolicyEngine />;
      case 'resumes':
        return <ResumeBooks />;
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
      case 'drives':
        return 'Search drives...';
      case 'offers':
        return 'Search offers...';
      case 'blacklist':
        return 'Search blacklist...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* TOP NAVIGATION BAR - Mobile Responsive */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          {/* Header Row 1 - Logo, Menu, Search, Icons */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-6">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Logo Icon */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </div>

              {/* Logo Text - Hidden on small mobile */}
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base font-bold text-gray-900">TnP Admin</h1>
                <p className="text-xs text-gray-500">Placement Cell</p>
              </div>
            </div>

            {/* Desktop Search - Hidden on mobile */}
            <div className="hidden lg:flex relative flex-1 max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-full rounded-lg"
              />
            </div>

            {/* Right Section - Notifications, User Menu */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-gray-100">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500 border-0 font-semibold">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-9 px-2 sm:px-3 hover:bg-gray-100">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm hidden sm:inline font-medium text-gray-900 truncate">
                      {user.name}
                    </span>
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

          {/* Header Row 2 - Mobile Search (visible on mobile/tablet) */}
          {true && (
            <div className="lg:hidden mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm bg-gray-50 border-gray-200 w-full rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR NAVIGATION - Mobile Overlay + Desktop Sidebar */}
        <aside
          className={`fixed md:relative w-56 h-full bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out z-40 md:z-0 max-md:shadow-lg ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-2 md:p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center text-xs bg-red-500 border-0 flex-shrink-0 font-bold">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Overlay Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-30 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto w-full">
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
