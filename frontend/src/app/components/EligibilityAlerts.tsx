import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, Zap, Filter, Archive, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Alert {
  id: string;
  type: 'eligibility' | 'deadline' | 'new-job' | 'application' | 'offer';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
}

export default function EligibilityAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'eligibility',
      title: 'You are eligible for Google Internship',
      message: 'Your CGPA meets minimum requirement of 7.5 for Google Summer Intern 2026',
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionUrl: '/opportunities',
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Application Deadline - Amazon',
      message: 'Only 2 days left to apply for Amazon Software Development role',
      priority: 'critical',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      actionable: true,
    },
    {
      id: '3',
      type: 'new-job',
      title: '5 New Jobs Matching Your Profile',
      message: 'Microsoft, Adobe, and 3 more companies posted roles matching your skills',
      priority: 'medium',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      actionable: true,
    },
    {
      id: '4',
      type: 'offer',
      title: 'Offer Received from Flipkart',
      message: 'Congratulations! You have received an offer for SDE Intern role. 5 days to respond.',
      priority: 'high',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      actionable: true,
    },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.read).length;

  const filteredAlerts = alerts.filter(a => {
    const typeMatch = filterType === 'all' || a.type === filterType;
    const readMatch = filterRead === 'all' || (filterRead === 'unread' ? !a.read : a.read);
    return typeMatch && readMatch;
  });

  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg relative">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Eligibility Alerts</h1>
                <p className="text-slate-600 dark:text-slate-400">Smart notifications for opportunities & deadlines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unread</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-slate-600">{alerts.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            All
          </Button>
          {['eligibility', 'deadline', 'new-job', 'application', 'offer'].map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              size="sm"
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={!alert.read ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {alert.priority === 'critical' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    {alert.priority === 'high' && <Zap className="w-5 h-5 text-orange-600" />}
                    {alert.priority === 'medium' && <Clock className="w-5 h-5 text-yellow-600" />}
                    {alert.priority === 'low' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                        {!alert.read && <Badge className="mt-1 bg-blue-100 text-blue-800">New</Badge>}
                      </div>
                      <Badge className={`${getPriorityColor(alert.priority)} ml-2`}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{alert.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {alert.actionable && (
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Action
                      </Button>
                    )}
                    {!alert.read && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(alert.id)}>
                        Mark Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(alert.id)} className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card className="text-center p-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">All caught up!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
