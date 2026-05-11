import React, { useState } from 'react';
import { Gift, CheckCircle, Clock, AlertCircle, TrendingUp, Send, Edit, Archive, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

interface Offer {
  id: string;
  studentName: string;
  studentEmail: string;
  companyName: string;
  position: string;
  salary: number;
  ctc: number;
  joiningDate: string;
  offerDate: string;
  expiryDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  benefits: string[];
  terms: string;
  responseDeadline: string;
}

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      studentName: 'Rahul Kumar',
      studentEmail: 'rahul@college.edu',
      companyName: 'Google',
      position: 'Software Engineer',
      salary: 800000,
      ctc: 1000000,
      joiningDate: '2026-07-15',
      offerDate: '2026-04-10',
      expiryDate: '2026-04-20',
      status: 'pending',
      benefits: ['Health Insurance', '5 weeks leave', 'Stock Options'],
      terms: 'Full-time, Permanent',
      responseDeadline: '2026-04-20',
    },
    {
      id: '2',
      studentName: 'Priya Singh',
      studentEmail: 'priya@college.edu',
      companyName: 'Microsoft',
      position: 'SDE Intern',
      salary: 50000,
      ctc: 0,
      joiningDate: '2026-05-01',
      offerDate: '2026-03-15',
      expiryDate: '2026-04-15',
      status: 'accepted',
      benefits: ['Stipend', 'Accommodation', 'Meals'],
      terms: '3-month internship',
      responseDeadline: '2026-04-15',
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Offer>>({});
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-slate-100 text-slate-800';
      case 'revoked':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateOfferStatus = (id: string, status: Offer['status']) => {
    setOffers(offers.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleSendOffer = () => {
    const newOffer: Offer = {
      id: Date.now().toString(),
      ...formData as Offer,
      offerDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setOffers([...offers, newOffer]);
    setFormData({});
    setShowDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white truncate">Offer Management</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Track and manage offer letters</p>
              </div>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm flex-shrink-0">
                  <Send className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">New Offer</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-80 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Student Name *</Label>
                      <Input value={formData.studentName || ''} onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input value={formData.studentEmail || ''} onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company *</Label>
                      <Input value={formData.companyName || ''} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Position *</Label>
                      <Input value={formData.position || ''} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Salary / Stipend</Label>
                      <Input type="number" value={formData.salary || ''} onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) }))} />
                    </div>
                    <div>
                      <Label>CTC</Label>
                      <Input type="number" value={formData.ctc || ''} onChange={(e) => setFormData(prev => ({ ...prev, ctc: parseInt(e.target.value) }))} />
                    </div>
                  </div>

                  <div>
                    <Label>Joining Date</Label>
                    <Input type="date" value={formData.joiningDate || ''} onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))} />
                  </div>

                  <Button onClick={handleSendOffer} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Send Offer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{offers.length}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Total Offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">{pendingOffers}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{acceptedOffers}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">Accepted</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 text-xs sm:text-sm">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs sm:text-sm">Accepted</TabsTrigger>
            <TabsTrigger value="rejected" className="hidden sm:block text-xs sm:text-sm">Rejected</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:block text-xs sm:text-sm">Archived</TabsTrigger>
          </TabsList>

          {/* All Offers */}
          <TabsContent value="all">
            <OffersList offers={offers} onUpdateStatus={handleUpdateOfferStatus} onViewDetails={(offer) => { setSelectedOffer(offer); setShowDetailsModal(true); }} />
          </TabsContent>

          {/* Pending */}
          <TabsContent value="pending">
            <OffersList offers={offers.filter(o => o.status === 'pending')} onUpdateStatus={handleUpdateOfferStatus} onViewDetails={(offer) => { setSelectedOffer(offer); setShowDetailsModal(true); }} />
          </TabsContent>

          {/* Accepted */}
          <TabsContent value="accepted">
            <OffersList offers={offers.filter(o => o.status === 'accepted')} onUpdateStatus={handleUpdateOfferStatus} onViewDetails={(offer) => { setSelectedOffer(offer); setShowDetailsModal(true); }} />
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected">
            <OffersList offers={offers.filter(o => o.status === 'rejected')} onUpdateStatus={handleUpdateOfferStatus} onViewDetails={(offer) => { setSelectedOffer(offer); setShowDetailsModal(true); }} />
          </TabsContent>

          {/* Archived */}
          <TabsContent value="archived">
            <OffersList offers={offers.filter(o => o.status === 'expired' || o.status === 'revoked')} onUpdateStatus={handleUpdateOfferStatus} onViewDetails={(offer) => { setSelectedOffer(offer); setShowDetailsModal(true); }} />
          </TabsContent>
        </Tabs>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedOffer?.studentName} - Offer Details</DialogTitle>
            </DialogHeader>
            {selectedOffer && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Student Email</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{selectedOffer.studentEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Status</p>
                    <Badge className={getStatusColor(selectedOffer.status)}>{selectedOffer.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Company</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{selectedOffer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Position</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{selectedOffer.position}</p>
                  </div>
                </div>

                {/* Compensation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Salary/Stipend</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">₹{(selectedOffer.salary / 100000).toFixed(1)}L</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">CTC</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">₹{(selectedOffer.ctc / 100000).toFixed(1)}L</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">Joining Date</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{new Date(selectedOffer.joiningDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Offer Date</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{new Date(selectedOffer.offerDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Expiry Date</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{new Date(selectedOffer.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Response Deadline</p>
                    <p className="text-sm sm:text-base text-slate-900 dark:text-white">{new Date(selectedOffer.responseDeadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Terms</p>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{selectedOffer.terms}</p>
                </div>

                {/* Benefits */}
                {selectedOffer.benefits && selectedOffer.benefits.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.benefits.map((benefit, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs sm:text-sm">{benefit}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function OffersList({ offers, onUpdateStatus, onViewDetails }: { offers: Offer[]; onUpdateStatus: (id: string, status: Offer['status']) => void; onViewDetails: (offer: Offer) => void }) {
  if (!offers.length) {
    return (
      <Card className="text-center p-6 sm:p-8">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">No offers in this category</p>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-slate-100 text-slate-800';
      case 'revoked': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-white truncate">{offer.studentName}</h3>
                  <Badge className={`text-xs sm:text-sm ${getStatusColor(offer.status)}`}>{offer.status}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{offer.companyName} - {offer.position}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Salary</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">₹{(offer.salary / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">CTC</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">₹{(offer.ctc / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Joining</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{new Date(offer.joiningDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Expires</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{Math.ceil((new Date(offer.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</p>
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {offer.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => onUpdateStatus(offer.id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Accept</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(offer.id, 'rejected')} className="text-red-600 hover:text-red-700 text-xs sm:text-sm">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Reject</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" className="ml-auto text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" onClick={() => onViewDetails(offer)}>
                <Eye className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">View</span>
                <span className="sm:hidden">📋</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
