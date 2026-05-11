import React, { useState } from 'react';
import { BookOpen, Play, Award, Target, TrendingUp, Code, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface ProjectPrep {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  duration: number; // in hours
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
}

export default function ProjectInterviewPrep() {
  const [projects, setProjects] = useState<ProjectPrep[]>([
    {
      id: '1',
      title: 'E-commerce Backend API',
      description: 'Build scalable REST API for e-commerce platform',
      difficulty: 'intermediate',
      technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      duration: 20,
      status: 'in-progress',
      progress: 65,
    },
    {
      id: '2',
      title: 'Task Management App',
      description: 'Full-stack web app with React and Node.js',
      difficulty: 'beginner',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      duration: 15,
      status: 'completed',
      progress: 100,
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Project-Based Interview Prep</h1>
            <p className="text-slate-600 dark:text-slate-400">Build real projects for placement interviews</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                        <Badge className={project.difficulty === 'advanced' ? 'bg-red-100 text-red-800' : project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {project.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.map(tech => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600">
                      <Play className="w-4 h-4 mr-2" />
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: 1, title: 'Master DSA Fundamentals', time: '4 weeks' },
                  { step: 2, title: 'Build CLI Tools', time: '1 week' },
                  { step: 3, title: 'Create Backend APIs', time: '2 weeks' },
                  { step: 4, title: 'Build Full Stack App', time: '3 weeks' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">{item.step}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="space-y-3">
              {['Git & GitHub', 'Docker & Deployment', 'Testing & CI/CD', 'System Design'].map(resource => (
                <Card key={resource}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-slate-900 dark:text-white">{resource}</p>
                    <Button size="sm" variant="outline">Learn</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
