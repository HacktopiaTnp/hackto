import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, Lock, Users, Edit, Trash2, Eye, TrendingDown, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface EnforcedPolicy {
  id: string;
  studentId: string;
  studentName: string;
  branch: string;
  batch: string;
  currentOffer: {
    companyName: string;
    position: string;
    salary: number;
    ctc: number;
    acceptedDate: string;
    joiningDate: string;
  };
  blockedOffers: Array<{
    companyName: string;
    position: string;
    salary: number;
    offeredDate: string;
    blockReason: string;
  }>;
  status: 'active' | 'completed' | 'appeal-pending' | 'exception-approved';
  appealDetails?: {
    reason: string;
    submittedDate: string;
    status: string;
  };
  impact?: {
    studentBenefit: string;
    reasonForException?: string;
  };
}

export default function OneOfferPolicyEngine() {
  const [policies, setPolicies] = useState<EnforcedPolicy[]>([
    {
      id: '1',
      studentId: 'STU00145',
      studentName: 'Rahul Kumar',
      branch: 'CSE',
      batch: '2026',
      currentOffer: {
        companyName: 'Google',
        position: 'Senior Software Engineer',
        salary: 1000000,
        ctc: 1200000,
        acceptedDate: '2026-02-15',
        joiningDate: '2026-07-01',
      },
      blockedOffers: [
        {
          companyName: 'Microsoft',
          position: 'Senior Software Engineer',
          salary: 1050000,
          ctc: 1250000,
          offeredDate: '2026-02-18',
          blockReason: 'Student already accepted offer from Google on 2026-02-15.',
        },
        {
          companyName: 'Amazon',
          position: 'SDE-2',
          salary: 980000,
          ctc: 1180000,
          offeredDate: '2026-02-20',
          blockReason: 'Offer blocked as per One-Offer Policy.',
        },
      ],
      status: 'active',
    },
    {
      id: '2',
      studentId: 'STU00287',
      studentName: 'Priya Sharma',
      branch: 'IT',
      batch: '2026',
      currentOffer: {
        companyName: 'Microsoft',
        position: 'Software Engineer',
        salary: 900000,
        ctc: 1080000,
        acceptedDate: '2026-03-01',
        joiningDate: '2026-07-15',
      },
      blockedOffers: [
        {
          companyName: 'Adobe',
          position: 'Software Engineer',
          salary: 920000,
          ctc: 1100000,
          offeredDate: '2026-03-05',
          blockReason: 'Blocked under One-Offer Policy.',
        },
      ],
      status: 'active',
    },
    {
      id: '4',
      studentId: 'STU00203',
      studentName: 'Deepak Verma',
      branch: 'CSE',
      batch: '2026',
      currentOffer: {
        companyName: 'Goldman Sachs',
        position: 'Analyst',
        salary: 1400000,
        ctc: 1680000,
        acceptedDate: '2026-02-10',
        joiningDate: '2026-08-01',
      },
      blockedOffers: [
        {
          companyName: 'Morgan Stanley',
          position: 'Senior Analyst',
          salary: 1500000,
          ctc: 1800000,
          offeredDate: '2026-02-12',
          blockReason: 'Blocked by One-Offer Policy.',
        },
      ],
      status: 'appeal-pending',
      appealDetails: {
        reason: 'Requesting exception for 25% higher package - significant career growth opportunity.',
        submittedDate: '2026-02-13',
        status: 'pending',
      },
    },
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState<EnforcedPolicy | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Handler functions for button actions
  const handleApproveAppeal = (policyId: string) => {
    setPolicies(policies.map(p => 
      p.id === policyId 
        ? {
            ...p,
            status: 'exception-approved',
            appealDetails: p.appealDetails ? { ...p.appealDetails, status: 'approved' } : undefined
          }
        : p
    ));
  };

  const handleRejectAppeal = (policyId: string) => {
    setPolicies(policies.map(p => 
      p.id === policyId 
        ? {
            ...p,
            status: 'active',
            appealDetails: p.appealDetails ? { ...p.appealDetails, status: 'rejected' } : undefined
          }
        : p
    ));
  };

  const handleAcceptOffer = (policyId: string) => {
    // Mark policy as completed when student accepts to move forward
    const policy = policies.find(p => p.id === policyId);
    if (policy) {
      setPolicies(policies.filter(p => p.id !== policyId));
      // In a real app, this would be archived or marked as completed
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'appeal-pending':
        return 'bg-orange-100 text-orange-800';
      case 'exception-approved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex-shrink-0">
              <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white break-words">
                One-Offer Policy Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Enforce single committed offer per student policy with exception management
              </p>
            </div>
          </div>

          {/* Policy Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <Award className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-blue-700 dark:text-blue-400">Ensures commitment to offers accepted</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <TrendingDown className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-400">Reduces company dissatisfaction</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600">
                {policies.filter(p => p.status === 'active').length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Actively Enforced</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">
                {policies.flatMap(p => p.blockedOffers).length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Offers Blocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">
                {policies.filter(p => p.status === 'appeal-pending').length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Appeals Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-[10px] sm:text-sm">
            <TabsTrigger value="active">
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">Active ({policies.filter(p => p.status === 'active').length})</span>
            </TabsTrigger>
            <TabsTrigger value="appeals">
              <span className="hidden sm:inline">Appeals</span>
              <span className="sm:hidden">Appeals ({policies.filter(p => p.status === 'appeal-pending').length})</span>
            </TabsTrigger>
            <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Active Policies Tab */}
          <TabsContent value="active">
            <div className="space-y-2 sm:space-y-3">
              {policies.filter(p => p.status === 'active').map(policy => (
                <Card key={policy.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                            {policy.studentName}
                          </h3>
                          <Badge className={getStatusColor(policy.status)} style={{ fontSize: '0.65rem' }}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {policy.branch} • {policy.studentId}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowDetails(true);
                        }}
                        className="w-full sm:w-auto text-[10px] sm:text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>

                    {/* Current Offer Box */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-600 mb-3">
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        ✓ ACCEPTED OFFER
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                        {policy.currentOffer.companyName}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {policy.currentOffer.position}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                        CTC: ₹{(policy.currentOffer.ctc / 100000).toFixed(1)}L | Accepted:{' '}
                        {new Date(policy.currentOffer.acceptedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Blocked Offers */}
                    {policy.blockedOffers.length > 0 && (
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          🚫 BLOCKED OFFERS ({policy.blockedOffers.length}):
                        </p>
                        <div className="space-y-1 sm:space-y-2">
                          {policy.blockedOffers.map((offer, idx) => (
                            <div
                              key={idx}
                              className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm border-l-4 border-red-600"
                            >
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {offer.companyName}
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">{offer.position}</p>
                              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                                CTC: ₹{(offer.ctc / 100000).toFixed(1)}L (+
                                {(((offer.ctc - policy.currentOffer.ctc) / policy.currentOffer.ctc) * 100).toFixed(1)}
                                %)
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals">
            <div className="space-y-2 sm:space-y-3">
              {policies.filter(p => p.status === 'appeal-pending').length > 0 ? (
                policies.filter(p => p.status === 'appeal-pending').map(policy => (
                  <Card key={policy.id} className="border-2 border-orange-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                            {policy.studentName}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Appeal submitted: {policy.appealDetails?.submittedDate}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 text-[0.65rem]">PENDING</Badge>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded mb-3">
                        <p className="text-[10px] sm:text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">
                          Appeal Reason:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          {policy.appealDetails?.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-1">Current Offer</p>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            ₹{(policy.currentOffer.ctc / 100000).toFixed(1)}L
                          </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                          <p className="text-[10px] text-orange-700 dark:text-orange-400 mb-1">Requested Offer</p>
                          <p className="font-semibold text-sm text-orange-900 dark:text-orange-300">
                            ₹{(policy.blockedOffers[0]?.ctc / 100000).toFixed(1)}L
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          onClick={() => handleApproveAppeal(policy.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => handleRejectAppeal(policy.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center p-6 sm:p-8">
                  <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No pending appeals</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Exceptions Tab */}
          <TabsContent value="exceptions">
            <div className="space-y-2 sm:space-y-3">
              {policies.filter(p => p.status === 'exception-approved').length > 0 ? (
                policies.filter(p => p.status === 'exception-approved').map(policy => (
                  <Card key={policy.id} className="border-2 border-purple-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                            {policy.studentName}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Exception approved
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 text-[0.65rem]">APPROVED</Badge>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                        <p className="text-[10px] sm:text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                          📌 Exception Benefit:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          {policy.impact?.studentBenefit}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center p-6 sm:p-8">
                  <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No approved exceptions</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            <Card className="text-center p-6 sm:p-8">
              <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {policies.filter(p => p.status === 'completed').length} completed policies
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Modal */}
        {selectedPolicy && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{selectedPolicy.studentName} - Policy Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Student Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Student ID</p>
                    <p className="text-sm font-semibold">{selectedPolicy.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Branch</p>
                    <p className="text-sm font-semibold">{selectedPolicy.branch}</p>
                  </div>
                </div>

                {/* Current Offer */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-600">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">ACCEPTED OFFER</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Company</p>
                      <p className="font-semibold">{selectedPolicy.currentOffer.companyName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Position</p>
                        <p className="font-semibold text-sm">{selectedPolicy.currentOffer.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">CTC</p>
                        <p className="font-semibold text-sm">₹{(selectedPolicy.currentOffer.ctc / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Joining Date</p>
                      <p className="font-semibold text-sm">
                        {new Date(selectedPolicy.currentOffer.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blocked Offers */}
                {selectedPolicy.blockedOffers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      BLOCKED OFFERS
                    </p>
                    <div className="space-y-2">
                      {selectedPolicy.blockedOffers.map((offer, idx) => (
                        <div key={idx} className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-600">
                          <p className="font-semibold text-sm">{offer.companyName}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{offer.position}</p>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mt-1">
                            CTC: ₹{(offer.ctc / 100000).toFixed(1)}L (+
                            {(((offer.ctc - selectedPolicy.currentOffer.ctc) / selectedPolicy.currentOffer.ctc) * 100).toFixed(1)}
                            %)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
