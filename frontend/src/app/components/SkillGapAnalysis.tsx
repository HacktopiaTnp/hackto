import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, Zap, Award, AlertCircle, CheckCircle, Lock, LockOpen, BookOpen, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gapScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  resources: string[];
  estimatedDays: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface SkillGapAnalysisProps {
  userRole: 'student' | 'admin';
}

export default function SkillGapAnalysis({ userRole }: SkillGapAnalysisProps) {
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'React',
      category: 'Frontend',
      currentLevel: 45,
      targetLevel: 85,
      gapScore: 40,
      priority: 'high',
      resources: ['React Documentation', 'Udemy Course', 'LeetCode Problems'],
      estimatedDays: 30,
      status: 'in-progress',
    },
    {
      id: '2',
      name: 'System Design',
      category: 'Backend',
      currentLevel: 35,
      targetLevel: 80,
      gapScore: 45,
      priority: 'critical',
      resources: ['System Design Primer', 'Grokking Course', 'Case Studies'],
      estimatedDays: 45,
      status: 'not-started',
    },
    {
      id: '3',
      name: 'Data Structures',
      category: 'Core DSA',
      currentLevel: 65,
      targetLevel: 90,
      gapScore: 25,
      priority: 'high',
      resources: ['GeeksforGeeks', 'LeetCode', 'YouTube tutorials'],
      estimatedDays: 20,
      status: 'in-progress',
    },
    {
      id: '4',
      name: 'Python',
      category: 'Languages',
      currentLevel: 70,
      targetLevel: 85,
      gapScore: 15,
      priority: 'medium',
      resources: ['Python.org docs', 'Real Python', 'Automate Boring Stuff'],
      estimatedDays: 14,
      status: 'not-started',
    },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const criticalGaps = skills.filter(s => s.priority === 'critical');
  const totalGap = skills.reduce((sum, s) => sum + s.gapScore, 0) / skills.length;
  const completedSkills = skills.filter(s => s.status === 'completed').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateSkillStatus = (id: string, status: 'not-started' | 'in-progress' | 'completed') => {
    setSkills(skills.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Skill Gap Analysis</h1>
              <p className="text-slate-600 dark:text-slate-400">Identify & close skill gaps for better placement</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Skills</p>
              <p className="text-3xl font-bold text-emerald-600">{skills.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Avg Gap Score</p>
              <p className="text-3xl font-bold text-orange-600">{Math.round(totalGap)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedSkills}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Critical Gaps</p>
              <p className="text-3xl font-bold text-red-600">{criticalGaps.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-priority">By Priority</TabsTrigger>
            <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-4">
              {skills.map((skill) => (
                <Card key={skill.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{skill.name}</h3>
                          <Badge className={getPriorityColor(skill.priority)}>{skill.priority}</Badge>
                          <Badge variant="outline">{skill.category}</Badge>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">Details</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{skill.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Level: {skill.currentLevel}%</p>
                              <Progress value={skill.currentLevel} className="h-2" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Target Level: {skill.targetLevel}%</p>
                              <Progress value={skill.targetLevel} className="h-2" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-2">Resources:</p>
                              <ul className="space-y-1">
                                {skill.resources.map((res, idx) => (
                                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">• {res}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Est. Time: {skill.estimatedDays} days</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Current</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{skill.currentLevel}%</p>
                        <Progress value={skill.currentLevel} className="h-1 mt-1" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Gap</p>
                        <p className="text-sm font-bold text-orange-600">{skill.gapScore}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Target</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{skill.targetLevel}%</p>
                        <Progress value={skill.targetLevel} className="h-1 mt-1" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={skill.status === 'not-started' ? 'outline' : 'default'}
                        onClick={() => handleUpdateSkillStatus(skill.id, 'not-started')}
                      >
                        Not Started
                      </Button>
                      <Button
                        size="sm"
                        variant={skill.status === 'in-progress' ? 'default' : 'outline'}
                        onClick={() => handleUpdateSkillStatus(skill.id, 'in-progress')}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={skill.status === 'completed' ? 'default' : 'outline'}
                        onClick={() => handleUpdateSkillStatus(skill.id, 'completed')}
                      >
                        Completed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Priority */}
          <TabsContent value="by-priority">
            <div className="space-y-6">
              {['critical', 'high', 'medium', 'low'].map((priority) => {
                const prioritySkills = skills.filter(s => s.priority === priority as any);
                return (
                  <div key={priority}>
                    <h3 className="font-semibold mb-3 text-slate-900 dark:text-white capitalize">{priority} Priority ({prioritySkills.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prioritySkills.map((skill) => (
                        <Card key={skill.id}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">{skill.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Gap: {skill.gapScore}%</span>
                                <Badge>{skill.estimatedDays}d</Badge>
                              </div>
                              <Progress value={100 - skill.gapScore} className="h-1.5" />
                              <p className="text-xs text-slate-500 dark:text-slate-500">{skill.resources.length} resources</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Learning Roadmap */}
          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Learning Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...skills].sort((a, b) => b.gapScore - a.gapScore).map((skill, idx) => (
                    <div key={skill.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-red-600' : idx < 2 ? 'bg-orange-600' : 'bg-blue-600'}`}>
                          {idx + 1}
                        </div>
                        {idx < skills.length - 1 && <div className="w-0.5 h-12 bg-slate-300 dark:bg-slate-600 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{skill.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Gap: {skill.gapScore}% • {skill.estimatedDays} days</p>
                        <div className="flex gap-1 mt-2">
                          {skill.resources.slice(0, 2).map((res, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{res}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
