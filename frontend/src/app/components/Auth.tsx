import { useState, useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Mail, Lock, User, Building2, BookOpen, Calendar, Phone, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface AuthProps {
  onLogin: (user: { name: string; email: string; role: 'student' | 'coordinator' | 'admin'; branch?: string; year?: string }) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [useClerkAuth, setUseClerkAuth] = useState(true); // Default to Clerk auth
  const [showPassword, setShowPassword] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'coordinator' | 'admin',
    branch: '',
    year: '',
    phone: '',
    rollNumber: '',
  });

  // Auto login when Clerk authentication is successful
  useEffect(() => {
    if (isLoaded && isSignedIn && user && useClerkAuth && !hasLoggedIn) {
      setHasLoggedIn(true);
      onLogin({
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: 'student',
        branch: 'Computer Science',
        year: '2026',
      });
    }
  }, [isLoaded, isSignedIn, user, useClerkAuth, hasLoggedIn, onLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Mock login with role detection
      const isAdmin = formData.email === 'admin@tnp.edu';
      const isCoordinator = formData.email === 'coordinator@tnp.edu';
      
      onLogin({
        name: isAdmin ? 'Dr. Rajesh Kumar' : isCoordinator ? 'Priya Sharma' : 'Rahul Kumar',
        email: formData.email,
        role: isAdmin ? 'admin' : isCoordinator ? 'coordinator' : 'student',
        branch: isAdmin || isCoordinator ? undefined : 'Computer Science',
        year: isAdmin || isCoordinator ? undefined : '2026',
      });
    } else {
      // Mock signup
      onLogin({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        branch: formData.role === 'student' ? formData.branch : undefined,
        year: formData.role === 'student' ? formData.year : undefined,
      });
    }
  };

  const quickLogin = (role: 'student' | 'coordinator' | 'admin') => {
    if (role === 'student') {
      onLogin({
        name: 'Rahul Kumar',
        email: 'rahul.kumar@student.edu',
        role: 'student',
        branch: 'Computer Science',
        year: '2026',
      });
    } else if (role === 'coordinator') {
      onLogin({
        name: 'Priya Sharma',
        email: 'priya.sharma@tnp.edu',
        role: 'coordinator',
      });
    } else {
      onLogin({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@tnp.edu',
        role: 'admin',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg">
              <div className="size-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TnP AI Platform
                </h1>
                <p className="text-sm text-slate-600">Smart Placement Management</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                Your Gateway to
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Career Success
                </span>
              </h2>
              <p className="text-lg text-slate-600">
                AI-powered platform for opportunity discovery, recruiter engagement, and interview preparation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Building2,
                  title: 'Smart Opportunity Discovery',
                  desc: 'AI matches you with best-fit jobs from 100+ companies',
                  color: 'from-blue-500 to-blue-600',
                },
                {
                  icon: User,
                  title: 'Mock Interview Practice',
                  desc: 'AI-powered interviews with real-time feedback',
                  color: 'from-purple-500 to-purple-600',
                },
                {
                  icon: Building2,
                  title: 'Recruiter Network',
                  desc: 'Direct access to 500+ HR professionals',
                  color: 'from-green-500 to-green-600',
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-md border border-slate-100">
                    <div className={`size-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">2,500+</p>
                <p className="text-sm text-slate-600">Students Placed</p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">500+</p>
                <p className="text-sm text-slate-600">Companies</p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">₹15L</p>
                <p className="text-sm text-slate-600">Avg Package</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="w-full p-4 sm:p-6 md:p-8 shadow-2xl border-0 bg-white/80 backdrop-blur">
          {/* Clerk Auth Toggle */}
          <div className="mb-6 text-center">
            <Button
              variant={useClerkAuth ? "default" : "outline"}
              onClick={() => {
                setUseClerkAuth(!useClerkAuth);
                setHasLoggedIn(false);
              }}
              className="mb-4 w-full sm:w-auto"
            >
              {useClerkAuth ? "Using Clerk Authentication" : "Switch to Clerk Auth"}
            </Button>
          </div>

          {/* Show Clerk SignIn/SignUp components if enabled */}
          {useClerkAuth ? (
            <div className="flex flex-col items-center w-full">
              <div className="flex gap-2 mb-6 w-full max-w-md">
                <Button
                  variant={isLogin ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </Button>
                <Button
                  variant={!isLogin ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </Button>
              </div>
              
              <div className="w-full flex justify-center">
                {isLogin ? (
                  <SignIn 
                    routing="hash"
                    signUpUrl="#/sign-up"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none w-full",
                        formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                        footerActionLink: "text-blue-600 hover:text-blue-700"
                      },
                      layout: {
                        socialButtonsPlacement: "bottom",
                        socialButtonsVariant: "iconButton"
                      }
                    }}
                  />
                ) : (
                  <SignUp 
                    routing="hash"
                    signInUrl="#/sign-in"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none w-full",
                        formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                        footerActionLink: "text-blue-600 hover:text-blue-700"
                      },
                      layout: {
                        socialButtonsPlacement: "bottom",
                        socialButtonsVariant: "iconButton"
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Quick Login Buttons for Demo */}
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-3 text-center">Quick Demo Login:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => quickLogin('student')}
                    className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <User className="size-4 mr-2" />
                    Student
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => quickLogin('coordinator')}
                    className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                  >
                    <Building2 className="size-4 mr-2" />
                    Coordinator
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => quickLogin('admin')}
                    className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50"
                  >
                    <Building2 className="size-4 mr-2" />
                    Admin
                  </Button>
                </div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <Button
                  variant={isLogin ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button
                  variant={!isLogin ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-11 border-slate-300"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" className="text-slate-700 font-medium">I am a</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'student' | 'coordinator' | 'admin') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="mt-1.5 h-11 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="coordinator">TnP Coordinator</SelectItem>
                      <SelectItem value="admin">TnP Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch" className="text-slate-700 font-medium">Branch</Label>
                      <div className="relative mt-1.5">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                        <Select
                          value={formData.branch}
                          onValueChange={(value) => setFormData({ ...formData, branch: value })}
                        >
                          <SelectTrigger className="pl-10 h-11 border-slate-300">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">Computer Science</SelectItem>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="ECE">Electronics & Communication</SelectItem>
                            <SelectItem value="EEE">Electrical Engineering</SelectItem>
                            <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-slate-700 font-medium">Passout Year</Label>
                      <div className="relative mt-1.5">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                        <Select
                          value={formData.year}
                          onValueChange={(value) => setFormData({ ...formData, year: value })}
                        >
                          <SelectTrigger className="pl-10 h-11 border-slate-300">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                            <SelectItem value="2028">2028</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'student' && (
                  <div>
                    <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="pl-10 h-11 border-slate-300"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="pl-10 h-11 border-slate-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 border-slate-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 h-11 border-slate-300"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="size-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                  {isLogin ? 'Login to Account' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </div>

              {!isLogin && (
                <p className="mt-4 text-xs text-center text-slate-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
