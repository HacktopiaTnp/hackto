import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Award, BarChart3, Download, RefreshCw, Sparkles, Zap, Flag, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

interface ResumeAnalysis {
  overallScore: number;
  atsScore: number;
  readabilityScore: number;
  keywordMatches: number;
  totalKeywords: number;
  sections: SectionAnalysis[];
  recommendations: Recommendation[];
  keywordsMissing: string[];
  keywordsPresent: string[];
  fileSize: number;
  uploadedDate: string;
  detailedScores: DetailedScores;
}

interface DetailedScores {
  keywordsMatch: number;
  formatStructure: number;
  skillsOptimization: number;
  quantifiedAchievements: number;
  jobTitleMatching: number;
  projectRelevance: number;
  datesExperience: number;
  fileTypeNaming: number;
  atsKillers: number;
}

interface SectionAnalysis {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  suggestions: string[];
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number;
}

interface ResumeAtsAnalysisProps {
  userRole: 'student' | 'coordinator' | 'admin';
}

export default function ResumeAtsAnalysis({ userRole }: ResumeAtsAnalysisProps) {
  const [uploadedResume, setUploadedResume] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jobKeywords: Record<string, string[]> = {
    'Software Engineer': ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'REST API', 'SQL', 'Problem Solving', 'Data Structures', 'Algorithms', 'Docker', 'AWS'],
    'Data Scientist': ['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'Statistics', 'SQL', 'Data Visualization', 'Scikit-learn', 'R', 'Tableau'],
    'UI/UX Designer': ['Figma', 'Design Thinking', 'Prototyping', 'User Research', 'Adobe XD', 'Responsive Design', 'Wireframing', 'Usability Testing'],
    'Product Manager': ['Product Strategy', 'User Research', 'Analytics', 'Roadmapping', 'Stakeholder Management', 'Metrics', 'Agile'],
  };

  // 🔍 COMPREHENSIVE ATS SCORING ALGORITHM
  const analyzeResumeContent = (resumeText: string, fileName: string) => {
    const jobKeywordsList = jobKeywords[selectedJobTitle] || jobKeywords['Software Engineer'];
    const keywordsInResume = jobKeywordsList.filter(keyword => 
      resumeText.toLowerCase().includes(keyword.toLowerCase())
    );
    const missingKeywords = jobKeywordsList.filter(keyword => 
      !resumeText.toLowerCase().includes(keyword.toLowerCase())
    );

    // ⭐⭐⭐ 1. KEYWORDS MATCH (35% weight) - MOST IMPORTANT
    const keywordScore = (keywordsInResume.length / jobKeywordsList.length) * 100;
    const keywordBonus = jobDescription ? 
      (jobDescription.split(/\s+/).filter(word => 
        resumeText.toLowerCase().includes(word.toLowerCase()) && word.length > 3
      ).length / Math.max(jobDescription.split(/\s+/).length / 2, 1)) * 50 : 0;
    const finalKeywordScore = Math.min(100, (keywordScore * 0.6 + keywordBonus * 0.4));

    // ⭐⭐ 2. RESUME FORMAT & STRUCTURE (15% weight)
    const formatIssues = [];
    const hasTableIndicators = /\|.*\|/g.test(resumeText);
    const hasExcessiveFormatting = (resumeText.match(/[★✓●○◆]/g) || []).length > 10;
    const hasProperSections = /summary|experience|education|skills|projects/i.test(resumeText);
    
    let formatScore = 100;
    if (hasTableIndicators) { formatScore -= 20; formatIssues.push('Tables detected - use bullet points'); }
    if (hasExcessiveFormatting) { formatScore -= 15; formatIssues.push('Excessive symbols/formatting'); }
    if (!hasProperSections) { formatScore -= 25; formatIssues.push('Missing standard sections'); }
    formatScore = Math.max(0, formatScore);

    // ⭐⭐⭐ 3. SKILLS SECTION OPTIMIZATION (20% weight)
    const skillsMatch = resumeText.match(/skills?:?\s*([^\n]+)/gi);
    let skillsScore = 0;
    let skillsIssues = [];
    
    if (skillsMatch && skillsMatch.length > 0) {
      const skillsContent = skillsMatch.join(' ').toLowerCase();
      const categorizedSkills = /languages?|technologies?|tools?|frameworks?/i.test(skillsContent);
      skillsScore = Math.min(100, 50 + (keywordScore * 0.3) + (categorizedSkills ? 30 : 10));
    } else {
      skillsScore = 20;
      skillsIssues.push('Skills section missing or not clearly labeled');
    }
    if (keywordsInResume.length < jobKeywordsList.length / 2) {
      skillsScore -= 15;
      skillsIssues.push(`Only ${keywordsInResume.length}/${jobKeywordsList.length} key skills found`);
    }

    // ⭐⭐ 4. QUANTIFIED ACHIEVEMENTS (15% weight)
    const metricPatterns = /(\d+[%\+\-*]|\d+\s*(?:x|times|years?|months?|weeks?|days?|projects?|clients?|users?|requests?|performance|improvement|impact|increase|reduction))/gi;
    const achievementMatches = resumeText.match(metricPatterns) || [];
    const achievementScore = Math.min(100, (achievementMatches.length * 8)) + 20;
    const achievementIssues = achievementMatches.length < 5 ? 
      [`Only ${achievementMatches.length} quantified metrics found - add more (e.g., "Improved response time by 30%")`] : [];

    // ⭐⭐⭐ 5. JOB TITLE & ROLE MATCHING (15% weight)
    const jobTitles = ['Engineer', 'Developer', 'Manager', 'Architect', 'Lead', 'Intern', 'Coordinator', 'Analyst', 'Specialist', 'Consultant'];
    const hasRelevantTitles = jobTitles.filter(title => 
      new RegExp(`\\b${title}\\b`, 'i').test(resumeText)
    ).length > 0;
    
    let jobTitleScore = hasRelevantTitles ? 75 : 40;
    if (resumeText.toLowerCase().includes(selectedJobTitle.toLowerCase())) {
      jobTitleScore = 95;
    }
    const jobTitleIssues = !hasRelevantTitles ? 
      ['Add relevant job titles in experience section'] : [];

    // ⭐⭐⭐ 6. PROJECT RELEVANCE (15% weight)
    const projectMatch = resumeText.match(/projects?:?\s*([^\n]+)/gi);
    let projectScore = 30;
    const projectIssues = [];
    
    if (projectMatch) {
      projectScore = 60;
      const projectsHaveTechStack = /(\w+\s*(?:framework|library|language|tech|technology|stack|built|using|tools?))/gi.test(
        projectMatch.join(' ')
      );
      if (projectsHaveTechStack) {
        projectScore += 30;
      } else {
        projectIssues.push('Projects missing tech stack details');
        projectScore -= 10;
      }
      const projectsHaveImpact = /(\d+|impact|resulted|solved|improved|optimized)/gi.test(projectMatch.join(' '));
      if (projectsHaveImpact) {
        projectScore += 10;
      } else {
        projectIssues.push('Add problem-solution-impact details to projects');
      }
    } else {
      projectIssues.push('Projects section not found or not labeled');
    }
    projectScore = Math.min(100, projectScore);

    // ⭐⭐ 7. PROPER DATES & EXPERIENCE ORDER (10% weight)
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}|(?:January|February|March|April|June|July|August|September|October|November|December)\s*\d{4}/gi;
    const dateMatches = resumeText.match(datePattern) || [];
    const experienceMatch = resumeText.match(/experience:?\s*([^\n]+)/gi);
    
    let dateScore = dateMatches.length >= 4 ? 80 : dateMatches.length >= 2 ? 60 : 30;
    if (experienceMatch) dateScore += 15;
    dateScore = Math.min(100, dateScore);
    const dateIssues = dateMatches.length < 4 ? 
      ['Use consistent date format (e.g., Jan 2024 – Mar 2024)'] : [];

    // ⭐⭐ 8. FILE TYPE & NAMING (5% weight)
    const validFileTypes = ['.pdf', '.docx', '.doc'];
    const hasValidType = validFileTypes.some(ext => fileName.toLowerCase().endsWith(ext));
    let fileScore = hasValidType ? 90 : 30;
    
    const validFileNamePattern = /^[a-zA-Z0-9_\-]+\.(pdf|docx|doc)$/;
    if (validFileNamePattern.test(fileName)) {
      fileScore += 10;
    }
    fileScore = Math.min(100, fileScore);
    const fileIssues = !hasValidType ? 
      [`Invalid file type: Use PDF or DOCX (current: ${fileName.split('.').pop()})`] : [];

    // 🚫 9. ATS KILLERS (Negative factors)
    const atsKillerIssues = [];
    let killerPenalty = 0;
    
    if (/^\s*[^\S\n]*$/m.test(resumeText)) {
      atsKillerIssues.push('Excessive whitespace detected');
      killerPenalty += 10;
    }
    if (/\b(?:click here|www\.)/gi.test(resumeText)) {
      atsKillerIssues.push('Hyperlinks detected - replace with plain text');
      killerPenalty += 8;
    }
    if (/[!@#$%^&*()=+\[\]{};:'",<>?/~`]/g.test(resumeText.slice(0, 50))) {
      atsKillerIssues.push('Special characters in header/early sections');
      killerPenalty += 8;
    }
    if (resumeText.length < 200) {
      atsKillerIssues.push('Resume appears too short');
      killerPenalty += 15;
    }

    // Calculate weighted ATS score
    const weights = {
      keywords: 0.35,
      format: 0.15,
      skills: 0.20,
      achievements: 0.15,
      jobTitle: 0.15,
      projects: 0.15,
      dates: 0.10,
      file: 0.05,
    };

    let atsScore = Math.round(
      (finalKeywordScore * weights.keywords) +
      (formatScore * weights.format) +
      (skillsScore * weights.skills) +
      (achievementScore * weights.achievements) +
      (jobTitleScore * weights.jobTitle) +
      ((projectScore * 0.5 + (projectMatch ? 50 : 0)) * weights.projects) +
      (dateScore * weights.dates) +
      (fileScore * weights.file)
    );

    atsScore = Math.min(100, Math.max(0, atsScore - killerPenalty));
    const readabilityScore = Math.round((formatScore + dateScore + fileScore) / 3);
    const overallScore = Math.round((atsScore * 0.7) + (readabilityScore * 0.3));

    // Build sections analysis
    const sections: SectionAnalysis[] = [
      {
        name: '🔑 Keywords Match',
        score: Math.round(finalKeywordScore),
        status: finalKeywordScore >= 80 ? 'excellent' : finalKeywordScore >= 60 ? 'good' : finalKeywordScore >= 40 ? 'fair' : 'poor',
        issues: missingKeywords.length > 0 ? [`Missing ${missingKeywords.length} key keywords`] : [],
        suggestions: [
          `Add these keywords: ${missingKeywords.slice(0, 3).join(', ')}`,
          'Use exact terminology from job description',
          'Keywords account for 35% of ATS score'
        ]
      },
      {
        name: '📋 Format & Structure',
        score: formatScore,
        status: formatScore >= 80 ? 'excellent' : formatScore >= 60 ? 'good' : 'fair',
        issues: formatIssues,
        suggestions: ['Use standard sections: Summary, Skills, Experience, Education, Projects', 'Avoid tables, images, and complex formatting']
      },
      {
        name: '💼 Skills Optimization',
        score: Math.round(skillsScore),
        status: skillsScore >= 80 ? 'excellent' : skillsScore >= 60 ? 'good' : 'fair',
        issues: skillsIssues,
        suggestions: ['Categorize skills: Languages, Technologies, Tools, Frameworks', `Include all ${jobKeywordsList.length} job-relevant skills`]
      },
      {
        name: '📊 Quantified Achievements',
        score: Math.round(achievementScore),
        status: achievementScore >= 80 ? 'excellent' : achievementScore >= 60 ? 'good' : 'fair',
        issues: achievementIssues,
        suggestions: ['Add metrics: "Improved API response time by 30%"', 'Include: Revenue, Users, Performance, Time saved']
      },
      {
        name: '🎯 Job Title Matching',
        score: jobTitleScore,
        status: jobTitleScore >= 80 ? 'excellent' : jobTitleScore >= 60 ? 'good' : 'fair',
        issues: jobTitleIssues,
        suggestions: ['Use titles like "Software Engineer", "Backend Developer", "Full-Stack Engineer"']
      },
      {
        name: '🏗️ Project Relevance',
        score: Math.round(projectScore),
        status: projectScore >= 80 ? 'excellent' : projectScore >= 60 ? 'good' : 'fair',
        issues: projectIssues,
        suggestions: ['Include tech stack for each project', 'Show problem → solution → impact']
      },
      {
        name: '📅 Dates & Experience',
        score: dateScore,
        status: dateScore >= 80 ? 'excellent' : dateScore >= 60 ? 'good' : 'fair',
        issues: dateIssues,
        suggestions: ['Use format: Jan 2024 – Mar 2024', 'List experiences in reverse chronological order']
      }
    ];

    // Build recommendations
    const recommendations: Recommendation[] = [];
    
    if (missingKeywords.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: `Add ${missingKeywords.length} Missing Keywords`,
        description: `Your resume is missing: ${missingKeywords.slice(0, 5).join(', ')}. These are critical for ATS parsing.`,
        impact: Math.min(25, missingKeywords.length * 5)
      });
    }
    
    if (skillsScore < 70) {
      recommendations.push({
        priority: 'critical',
        title: 'Strengthen Skills Section',
        description: 'Skills account for 20% of ATS score. Organize by category and include more technical keywords.',
        impact: 15
      });
    }
    
    if (achievementMatches.length < 5) {
      recommendations.push({
        priority: 'high',
        title: 'Add Quantified Metrics',
        description: `Only ${achievementMatches.length} metrics found. Recruiters prefer: "Improved X by Y%", "Handled Z+ transactions"`,
        impact: 12
      });
    }

    if (projectScore < 70) {
      recommendations.push({
        priority: 'high',
        title: 'Enhance Project Details',
        description: 'Projects should include: tech stack, problem solved, and measurable impact.',
        impact: 10
      });
    }

    if (formatScore < 70) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Resume Formatting',
        description: 'Use consistent formatting, bullet points, and clear section headers for better ATS parsing.',
        impact: 8
      });
    }

    if (!jobDescription) {
      recommendations.push({
        priority: 'medium',
        title: 'Add Job Description',
        description: 'Provide the job description for more accurate ATS scoring and tailored recommendations.',
        impact: 5
      });
    }

    return {
      overallScore,
      atsScore,
      readabilityScore,
      keywordMatches: keywordsInResume.length,
      totalKeywords: jobKeywordsList.length,
      sections,
      recommendations: recommendations.slice(0, 6),
      keywordsMissing: missingKeywords,
      keywordsPresent: keywordsInResume,
      detailedScores: {
        keywordsMatch: Math.round(finalKeywordScore),
        formatStructure: formatScore,
        skillsOptimization: Math.round(skillsScore),
        quantifiedAchievements: Math.round(achievementScore),
        jobTitleMatching: jobTitleScore,
        projectRelevance: Math.round(projectScore),
        datesExperience: dateScore,
        fileTypeNaming: fileScore,
        atsKillers: 100 - killerPenalty
      }
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const text = await file.text();
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = analyzeResumeContent(text, file.name);
      
      const result: ResumeAnalysis = {
        ...analysis,
        fileSize: Math.round(file.size / 1024),
        uploadedDate: new Date().toLocaleDateString(),
      };
      
      setUploadedResume(result);

      // Save analysis to backend
      await saveAnalysisToBackend(result, file);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please ensure it\'s a valid text-based PDF or DOCX.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Save analysis results to backend database
   */
  const saveAnalysisToBackend = async (analysis: ResumeAnalysis, file: File) => {
    try {
      // Get user ID from local storage or context (you may need to adjust this)
      const userId = localStorage.getItem('userId') || 'user-default';
      const tenantId = localStorage.getItem('tenantId') || 'default';

      const payload = {
        userId,
        fileName: file.name,
        fileType: file.type === 'application/pdf' ? 'pdf' : 'docx',
        fileSizeKb: Math.round(file.size / 1024),
        jobTitle: selectedJobTitle,
        jobDescription: jobDescription || undefined,
        analysisData: {
          overallScore: analysis.overallScore,
          atsScore: analysis.atsScore,
          readabilityScore: analysis.readabilityScore,
          detailedScores: analysis.detailedScores,
          keywordMatches: analysis.keywordMatches,
          totalKeywords: analysis.totalKeywords,
          keywordsPresent: analysis.keywordsPresent,
          keywordsMissing: analysis.keywordsMissing,
          sections: analysis.sections,
          recommendations: analysis.recommendations,
        },
      };

      const response = await fetch('/api/v1/resume-ats/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Backend error:', error);
        alert('Failed to save analysis to database');
        return;
      }

      const savedData = await response.json();
      console.log('✅ Analysis saved to database:', savedData.data);
    } catch (error) {
      console.error('Error saving analysis to backend:', error);
      // Don't show alert here as analysis is already complete on frontend
    }
  };

  const handleReanalyze = () => {
    // Clear previous analysis and reset to upload state
    setUploadedResume(null);
    setJobDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
      fileInputRef.current.click();
    }
  };

  /**
   * Generate and download analysis report as text file
   */
  const handleDownloadReport = () => {
    if (!uploadedResume) {
      alert('No analysis to download');
      return;
    }

    try {
      const report = generateReportContent(uploadedResume);
      const element = document.createElement('a');
      const file = new Blob([report], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Resume_ATS_Report_${uploadedResume.uploadedDate.replace(/\//g, '-')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  /**
   * Generate formatted report content
   */
  const generateReportContent = (analysis: ResumeAnalysis): string => {
    const divider = '='.repeat(80);
    const subDivider = '-'.repeat(80);

    let report = `
${divider}
                    RESUME ATS ANALYSIS REPORT
${divider}

ANALYSIS DATE: ${analysis.uploadedDate}

${divider}
SUMMARY SCORES
${divider}

Overall Score:        ${analysis.overallScore}%
ATS Score:            ${analysis.atsScore}%
Readability Score:    ${analysis.readabilityScore}%

Keyword Matches:      ${analysis.keywordMatches}/${analysis.totalKeywords}

${divider}
DETAILED FACTOR ANALYSIS (10-FACTOR SCORING)
${divider}

⭐⭐⭐ Keywords Match (35% weight):          ${analysis.detailedScores.keywordsMatch}%
⭐⭐⭐ Skills Optimization (20% weight):     ${analysis.detailedScores.skillsOptimization}%
⭐⭐⭐ Job Title Matching (15% weight):      ${analysis.detailedScores.jobTitleMatching}%
⭐⭐⭐ Project Relevance (15% weight):       ${analysis.detailedScores.projectRelevance}%
⭐⭐ Format & Structure (15% weight):        ${analysis.detailedScores.formatStructure}%
⭐⭐ Achievements (15% weight):              ${analysis.detailedScores.quantifiedAchievements}%
⭐⭐ Dates & Experience (10% weight):        ${analysis.detailedScores.datesExperience}%
⭐⭐ File Type & Naming (5% weight):         ${analysis.detailedScores.fileTypeNaming}%
ATS Killers Score:                          ${analysis.detailedScores.atsKillers}%

${divider}
KEYWORDS ANALYSIS
${divider}

KEYWORDS PRESENT (${analysis.keywordsPresent.length}):
${analysis.keywordsPresent.map(kw => `  ✓ ${kw}`).join('\n')}

KEYWORDS MISSING (${analysis.keywordsMissing.length}):
${analysis.keywordsMissing.map(kw => `  ✗ ${kw}`).join('\n')}

${divider}
SECTION-BY-SECTION ANALYSIS
${divider}

${analysis.sections.map(section => `
${section.name}
Score: ${section.score}% | Status: ${section.status.toUpperCase()}
${section.issues.length > 0 ? `Issues:\n${section.issues.map(i => `  • ${i}`).join('\n')}` : ''}
${section.suggestions.length > 0 ? `Suggestions:\n${section.suggestions.map(s => `  💡 ${s}`).join('\n')}` : ''}
`).join('\n' + subDivider + '\n')}

${divider}
RECOMMENDATIONS FOR IMPROVEMENT
${divider}

${analysis.recommendations.map((rec, idx) => `
${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.title}
   ${rec.description}
   Potential Impact: +${rec.impact}% to score
`).join('\n')}

${divider}
HOW TO IMPROVE YOUR ATS SCORE
${divider}

1. KEYWORDS MATCH (Most Important - 35%)
   • Add the following keywords to your resume: ${analysis.keywordsMissing.slice(0, 5).join(', ')}
   • Use exact terminology from the job description
   • Ensure keywords appear in multiple sections (summary, skills, experience)

2. SKILLS SECTION (20%)
   • Organize skills by category: Languages, Technologies, Tools, Frameworks
   • Include at least 10-15 relevant skills
   • Match skills to the job description

3. JOB TITLE MATCHING (15%)
   • Use relevant job titles in your experience section
   • Include titles like: "Software Engineer", "Backend Developer", "Full-Stack Engineer"
   • Avoid generic titles like "Freelancer" or "Consultant"

4. PROJECTS (15%)
   • Include tech stack for each project
   • Show problem → solution → impact
   • Add quantified metrics (users, performance improvements, etc.)

5. FORMATTING (15%)
   • Use bullet points instead of paragraphs
   • Avoid tables, images, and fancy formatting
   • Use standard section headers: Summary, Skills, Experience, Education, Projects

6. QUANTIFIED ACHIEVEMENTS (15%)
   • Add metrics to every bullet point if possible
   • Examples: "Improved API response time by 40%", "Handled 10K+ daily transactions"
   • Use numbers, percentages, and tangible impact measurements

7. DATES & EXPERIENCE (10%)
   • Use consistent date format: "Jan 2024 – Mar 2024"
   • List experiences in reverse chronological order
   • Include dates for all work experience and education

8. FILE & NAMING (5%)
   • Save as PDF or DOCX
   • Use professional filename: "FirstName_JobTitle_Resume.pdf"
   • Avoid filenames like "Resume_FINAL_v2.pdf"

${divider}
SCORE INTERPRETATION GUIDE
${divider}

80-100%: EXCELLENT - Your resume is ATS-friendly and ready to submit
60-79%:  GOOD - Your resume should pass most ATS systems, but has room for improvement
40-59%:  FAIR - Your resume may be filtered by some ATS systems - consider improvements
0-39%:   POOR - Your resume likely won't pass ATS screening - significant improvements needed

${divider}
NEXT STEPS
${divider}

1. Implement the recommendations above
2. Re-upload your updated resume for re-analysis
3. Track your score improvements over time
4. Target 80%+ ATS score before submitting to companies

${divider}
Generated by Resume ATS Analysis System v1.0
${divider}
`;

    return report.trim();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Resume ATS Analysis</h1>
              <p className="text-slate-600 dark:text-slate-400">Professional AI-powered scoring with 10-factor analysis</p>
            </div>
          </div>
        </div>

        {!uploadedResume ? (
          // Upload Section
          <div className="space-y-6">
            {/* Job Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Step 1: Target Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Job Title</label>
                  <select 
                    value={selectedJobTitle} 
                    onChange={(e) => setSelectedJobTitle(e.target.value)}
                    className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700"
                  >
                    {Object.keys(jobKeywords).map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Job Description (Optional)</label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description here for more accurate analysis..."
                    className="w-full border rounded-lg p-3 h-32 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">💡 Adding job description improves keyword matching accuracy</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full">
                          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Upload Your Resume</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Support formats: PDF, DOCX (Max 5MB)
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileUpload}
                        className="hidden"
                        title="Upload resume file"
                        aria-label="Choose resume file to upload"
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-500">or drag and drop</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scoring Factors */}
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">10 Scoring Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐ Keywords Match</span>
                      <Badge>35%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐ Skills Optimization</span>
                      <Badge>20%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐ Job Title Match</span>
                      <Badge>15%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐⭐ Project Relevance</span>
                      <Badge>15%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐ Format & Structure</span>
                      <Badge>15%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐ Achievements</span>
                      <Badge>15%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐ Dates & Experience</span>
                      <Badge>10%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⭐⭐ File Type & Naming</span>
                      <Badge>5%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(uploadedResume.overallScore)}`}>
                      {uploadedResume.overallScore}%
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Overall Score</p>
                    <Progress value={uploadedResume.overallScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(uploadedResume.atsScore)}`}>
                      {uploadedResume.atsScore}%
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">ATS Score</p>
                    <Progress value={uploadedResume.atsScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(uploadedResume.readabilityScore)}`}>
                      {uploadedResume.readabilityScore}%
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Readability</p>
                    <Progress value={uploadedResume.readabilityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                      {uploadedResume.keywordMatches}/{uploadedResume.totalKeywords}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Keywords Match</p>
                    <Progress value={(uploadedResume.keywordMatches / uploadedResume.totalKeywords) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Factor Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Detailed Factor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐⭐ Keywords Match (35%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.keywordsMatch)}`}>{uploadedResume.detailedScores.keywordsMatch}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.keywordsMatch} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐⭐ Skills Optimization (20%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.skillsOptimization)}`}>{uploadedResume.detailedScores.skillsOptimization}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.skillsOptimization} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐⭐ Job Title Matching (15%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.jobTitleMatching)}`}>{uploadedResume.detailedScores.jobTitleMatching}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.jobTitleMatching} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐⭐ Project Relevance (15%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.projectRelevance)}`}>{uploadedResume.detailedScores.projectRelevance}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.projectRelevance} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐ Format & Structure (15%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.formatStructure)}`}>{uploadedResume.detailedScores.formatStructure}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.formatStructure} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐ Achievements (15%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.quantifiedAchievements)}`}>{uploadedResume.detailedScores.quantifiedAchievements}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.quantifiedAchievements} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐ Dates & Experience (10%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.datesExperience)}`}>{uploadedResume.detailedScores.datesExperience}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.datesExperience} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">⭐⭐ File Type & Naming (5%)</span>
                        <span className={`font-bold ${getScoreColor(uploadedResume.detailedScores.fileTypeNaming)}`}>{uploadedResume.detailedScores.fileTypeNaming}%</span>
                      </div>
                      <Progress value={uploadedResume.detailedScores.fileTypeNaming} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sections" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="recommendations">Tips</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  {/* Sections Tab */}
                  <TabsContent value="sections" className="space-y-3">
                    {uploadedResume.sections.map((section, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">{section.name}</h3>
                              <Badge className={`mt-2 ${section.score >= 80 ? 'bg-green-100 text-green-800' : section.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                Score: {section.score}%
                              </Badge>
                            </div>
                            {section.status === 'excellent' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {section.status === 'poor' && <AlertCircle className="w-5 h-5 text-red-600" />}
                          </div>
                          {section.issues.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Issues:</p>
                              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                {section.issues.map((issue, i) => (
                                  <li key={i}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.suggestions.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Suggestions:</p>
                              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                {section.suggestions.map((suggestion, i) => (
                                  <li key={i}>💡 {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Keywords Tab */}
                  <TabsContent value="keywords" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Keywords Present ({uploadedResume.keywordsPresent.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uploadedResume.keywordsPresent.map((keyword, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Keywords Missing ({uploadedResume.keywordsMissing.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uploadedResume.keywordsMissing.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="border-red-300 text-red-800 dark:text-red-400">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Recommendations Tab */}
                  <TabsContent value="recommendations" className="space-y-3">
                    {uploadedResume.recommendations.map((rec, idx) => (
                      <Card key={idx} className={`border-l-4 ${rec.priority === 'critical' ? 'border-l-red-500' : rec.priority === 'high' ? 'border-l-orange-500' : rec.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">{rec.title}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{rec.description}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">Potential impact: +{rec.impact}% to score</p>
                            </div>
                            <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Latest Analysis</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Uploaded on {uploadedResume.uploadedDate}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleReanalyze} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Re-upload Resume
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Card className="w-80">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="font-semibold text-slate-900 dark:text-white mb-2">Analyzing Resume...</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Using AI to scan and score your resume</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
