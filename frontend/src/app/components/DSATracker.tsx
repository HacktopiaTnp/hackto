import React, { useState } from 'react';
import { Code, TrendingUp, Award, Target, CheckCircle, AlertCircle, Clock, BarChart3, Zap, BookOpen, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

interface DSAProblem {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solvedCount: number;
  attempts: number;
  bestTime: number; // in minutes
  status: 'not-started' | 'attempted' | 'solved' | 'mastered';
  topics: string[];
  solutionLink?: string;
}

interface DSATracker {
  category: string;
  total: number;
  solved: number;
  accuracy: number;
  timeSpent: number; // in hours
}

export default function DSATracker() {
  const [problems, setProblems] = useState<DSAProblem[]>([
    { id: '1', title: 'Two Sum', category: 'Arrays', difficulty: 'easy', solvedCount: 1, attempts: 1, bestTime: 15, status: 'solved', topics: ['HashMap', 'Arrays'] },
    { id: '2', title: 'Reverse Linked List', category: 'Linked List', difficulty: 'easy', solvedCount: 1, attempts: 2, bestTime: 20, status: 'solved', topics: ['Recursion', 'Iteration'] },
    { id: '3', title: 'Merge K Sorted Lists', category: 'Linked List', difficulty: 'hard', solvedCount: 0, attempts: 2, bestTime: 45, status: 'attempted', topics: ['Heap', 'Divide & Conquer'] },
    { id: '4', title: 'LRU Cache', category: 'Design', difficulty: 'hard', solvedCount: 0, attempts: 0, bestTime: 0, status: 'not-started', topics: ['Hash Map', 'DoublyLinkedList'] },
    { id: '5', title: 'Longest Substring', category: 'Strings', difficulty: 'medium', solvedCount: 1, attempts: 3, bestTime: 30, status: 'solved', topics: ['Sliding Window'] },
  ]);

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const trackerStats: DSATracker[] = [
    { category: 'Arrays', total: 12, solved: 8, accuracy: 85, timeSpent: 4.5 },
    { category: 'Linked List', total: 10, solved: 6, accuracy: 78, timeSpent: 3.2 },
    { category: 'Strings', total: 8, solved: 5, accuracy: 82, timeSpent: 2.8 },
    { category: 'Trees', total: 15, solved: 3, accuracy: 65, timeSpent: 2.1 },
    { category: 'Graphs', total: 12, solved: 0, accuracy: 0, timeSpent: 0 },
    { category: 'Design', total: 6, solved: 0, accuracy: 0, timeSpent: 0 },
  ];

  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.status === 'solved' || p.status === 'mastered').length;
  const masteredProblems = problems.filter(p => p.status === 'mastered').length;

  const filteredProblems = problems.filter(p => {
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'mastered':
        return <Award className="w-4 h-4 text-yellow-600" />;
      case 'attempted':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleUpdateProblem = (id: string, status: DSAProblem['status']) => {
    setProblems(problems.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">DSA Tracker</h1>
              <p className="text-slate-600 dark:text-slate-400">Track your Data Structures & Algorithms progress</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Problems</p>
              <p className="text-3xl font-bold text-violet-600">{totalProblems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Solved</p>
              <p className="text-3xl font-bold text-green-600">{solvedProblems}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{Math.round((solvedProblems / totalProblems) * 100)}% completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Mastered</p>
              <p className="text-3xl font-bold text-yellow-600">{masteredProblems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Avg. Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(trackerStats.reduce((sum, s) => sum + s.accuracy, 0) / trackerStats.length)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Problems Tab */}
          <TabsContent value="problems">
            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div>
                <label htmlFor="category-filter" className="text-sm text-slate-600 dark:text-slate-400 mr-2">Category:</label>
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                >
                  <option value="all">All</option>
                  {[...new Set(problems.map(p => p.category))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="difficulty-filter" className="text-sm text-slate-600 dark:text-slate-400 mr-2">Difficulty:</label>
                <select
                  id="difficulty-filter"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-1 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                >
                  <option value="all">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Problems Grid */}
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <Card key={problem.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(problem.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{problem.title}</h3>
                            <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                            <Badge variant="outline">{problem.category}</Badge>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <span>Attempts: {problem.attempts}</span>
                            {problem.bestTime > 0 && <span>Best: {problem.bestTime}m</span>}
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">Update</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{problem.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant={problem.status === 'not-started' ? 'default' : 'outline'}
                                onClick={() => handleUpdateProblem(problem.id, 'not-started')}
                              >
                                Not Started
                              </Button>
                              <Button
                                size="sm"
                                variant={problem.status === 'attempted' ? 'default' : 'outline'}
                                onClick={() => handleUpdateProblem(problem.id, 'attempted')}
                              >
                                Attempted
                              </Button>
                              <Button
                                size="sm"
                                variant={problem.status === 'solved' ? 'default' : 'outline'}
                                onClick={() => handleUpdateProblem(problem.id, 'solved')}
                              >
                                Solved
                              </Button>
                              <Button
                                size="sm"
                                variant={problem.status === 'mastered' ? 'default' : 'outline'}
                                onClick={() => handleUpdateProblem(problem.id, 'mastered')}
                              >
                                Mastered
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Category */}
          <TabsContent value="categories">
            <div className="space-y-4">
              {trackerStats.map((stat) => (
                <Card key={stat.category}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{stat.category}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{stat.solved}/{stat.total} problems solved</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.accuracy}%</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{stat.timeSpent}h</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="text-slate-900 dark:text-white font-semibold">{Math.round((stat.solved / stat.total) * 100)}%</span>
                      </div>
                      <Progress value={(stat.solved / stat.total) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strongest Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trackerStats.sort((a, b) => b.accuracy - a.accuracy).slice(0, 3).map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{stat.category}</span>
                      <Badge className="bg-green-100 text-green-800">{stat.accuracy}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Improvement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trackerStats.sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{stat.category}</span>
                      <Badge className="bg-red-100 text-red-800">{stat.accuracy}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
