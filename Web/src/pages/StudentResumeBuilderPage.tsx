import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Crown, Lock, Plus, Trash2, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { generateResumePDF } from '@/lib/pdfGenerator';
import { ProfessionalResumeTemplate } from '@/components/ProfessionalResumeTemplate';

// Mock data for resume templates
const RESUME_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Clean, traditional layout perfect for corporate roles',
    isPremium: false,
    thumbnail: '/api/placeholder/300/400',
    category: 'Traditional'
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Contemporary design with clean lines and typography',
    isPremium: false,
    thumbnail: '/api/placeholder/300/400',
    category: 'Modern'
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Eye-catching design for creative professionals',
    isPremium: true,
    thumbnail: '/api/placeholder/300/400',
    category: 'Creative'
  },
  {
    id: 'executive',
    name: 'Executive Elite',
    description: 'Premium template for senior leadership positions',
    isPremium: true,
    thumbnail: '/api/placeholder/300/400',
    category: 'Executive'
  },
  {
    id: 'tech',
    name: 'Tech Professional',
    description: 'Perfect for software developers and IT professionals',
    isPremium: false,
    thumbnail: '/api/placeholder/300/400',
    category: 'Technology'
  },
  {
    id: 'academic',
    name: 'Academic Scholar',
    description: 'Designed for researchers and academic positions',
    isPremium: true,
    thumbnail: '/api/placeholder/300/400',
    category: 'Academic'
  }
];

// Mock data for user's previous resumes
const PREVIOUS_RESUMES = [
  {
    id: 'resume-1',
    name: 'Software Developer Resume',
    template: 'Modern Minimalist',
    createdAt: '2024-01-15',
    lastModified: '2024-01-20',
    downloadCount: 5,
    fileSize: '245 KB'
  },
  {
    id: 'resume-2',
    name: 'Full-Stack Engineer Resume',
    template: 'Tech Professional',
    createdAt: '2024-02-10',
    lastModified: '2024-02-12',
    downloadCount: 2,
    fileSize: '298 KB'
  }
];

export default function StudentResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [previewTemplate, setPreviewTemplate] = useState<typeof RESUME_TEMPLATES[0] | null>(null);

  const handleUseTemplate = (templateId: string) => {
    navigate(`/student/resume/editor/${templateId}`);
  };

  const handlePreviewTemplate = (template: typeof RESUME_TEMPLATES[0]) => {
    setPreviewTemplate(template);
  };

  const handlePremiumTemplate = () => {
    // Show premium upgrade modal or redirect
    alert('Upgrade to Premium to access this template!');
  };

  const handleEditResume = (resumeId: string) => {
    navigate(`/student/resume/edit/${resumeId}`);
  };

  const handleDownloadResume = async (resumeId: string) => {
    try {
      // In a real app, fetch the resume data from the API
      const mockResumeData = {
        personalInfo: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          summary: 'Experienced software developer with expertise in full-stack development and team leadership. Proven track record of delivering high-quality solutions and mentoring junior developers.',
        },
        experience: [
          {
            id: '1',
            company: 'Tech Corp',
            position: 'Senior Software Developer',
            startDate: '2022-01',
            endDate: 'Present',
            description: 'Led development of cloud-based applications using React and Node.js. Improved system performance by 40% and mentored junior developers.',
          },
          {
            id: '2',
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            startDate: '2020-06',
            endDate: '2021-12',
            description: 'Built scalable web applications from scratch. Collaborated with design and product teams to deliver user-centered solutions.',
          },
        ],
        education: [
          {
            id: '1',
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            graduationDate: '2020-05',
            gpa: '3.8',
          },
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB'],
      };

      // Create a temporary container for the resume
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.innerHTML = `
        <div id="resume-template" style="
          font-family: Georgia, serif;
          line-height: 1.5;
          font-size: 14px;
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          padding: 0.75in;
          box-sizing: border-box;
          background: white;
          color: black;
        ">
          ${renderResumeHTML(mockResumeData)}
        </div>
      `;
      
      document.body.appendChild(tempContainer);

      // Generate PDF
      await generateResumePDF(mockResumeData, `resume-${resumeId}.pdf`);
      
      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const renderResumeHTML = (data: any) => {
    return `
      <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #ccc;">
        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #2c3e50; letter-spacing: 1px;">
          ${data.personalInfo.fullName}
        </h1>
        <div style="display: flex; justify-content: center; gap: 1.5rem; font-size: 0.875rem; color: #666;">
          <span>${data.personalInfo.email}</span>
          <span>•</span>
          <span>${data.personalInfo.phone}</span>
          <span>•</span>
          <span>${data.personalInfo.location}</span>
        </div>
      </div>

      ${data.personalInfo.summary ? `
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #34495e; padding-bottom: 0.25rem;">
            Professional Summary
          </h2>
          <p style="color: #555; line-height: 1.6; text-align: justify;">
            ${data.personalInfo.summary}
          </p>
        </div>
      ` : ''}

      ${data.experience.length > 0 ? `
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #34495e; padding-bottom: 0.25rem;">
            Professional Experience
          </h2>
          ${data.experience.map((exp: any) => `
            <div style="margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div style="flex: 1;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: #2c3e50;">
                    ${exp.position}
                  </h3>
                  <p style="font-style: italic; color: #34495e; font-weight: 500;">
                    ${exp.company}
                  </p>
                </div>
                <div style="color: #7f8c8d; font-weight: 500; min-width: 140px; text-align: right;">
                  ${exp.startDate} - ${exp.endDate || 'Present'}
                </div>
              </div>
              <ul style="list-style-type: disc; padding-left: 1.25rem; line-height: 1.6; color: #555;">
                ${exp.description.split('.').filter((line: string) => line.trim()).map((line: string) => 
                  `<li style="margin-bottom: 0.25rem;">${line.trim()}${line.trim() ? '.' : ''}</li>`
                ).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${data.education.length > 0 ? `
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #34495e; padding-bottom: 0.25rem;">
            Education
          </h2>
          ${data.education.map((edu: any) => `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: #2c3e50;">
                    ${edu.degree} in ${edu.field}
                  </h3>
                  <p style="font-style: italic; color: #34495e; font-weight: 500;">
                    ${edu.institution}
                  </p>
                  ${edu.gpa ? `<p style="color: #7f8c8d;">GPA: ${edu.gpa}</p>` : ''}
                </div>
                <div style="color: #7f8c8d; font-weight: 500; min-width: 100px; text-align: right;">
                  ${edu.graduationDate}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${data.skills.length > 0 ? `
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #34495e; padding-bottom: 0.25rem;">
            Core Competencies
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${data.skills.map((skill: string, index: number) => 
              `<span style="margin-right: 1rem; margin-bottom: 0.25rem; color: #2c3e50; font-weight: 500;">
                ${skill}${index < data.skills.length - 1 ? ' •' : ''}
              </span>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ccc; text-align: center; font-size: 0.75rem; color: #888;">
        References available upon request
      </div>
    `;
  };

  const handleDeleteResume = (resumeId: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      console.log('Deleting resume:', resumeId);
      // Remove from state in real implementation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create professional resumes with our templates and AI assistance
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-resumes">My Resumes ({PREVIOUS_RESUMES.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Choose a Template</h2>
              <p className="text-muted-foreground">Select from our collection of professional resume templates</p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Crown className="h-3 w-3" />
              <span>Premium Available</span>
            </Badge>
          </div>

          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Free templates are available to all users. Upgrade to Premium for access to exclusive designs and advanced features.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESUME_TEMPLATES.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="relative">
                  <div className="aspect-[3/4] bg-muted rounded-t-lg flex items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                  {template.isPremium && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => template.isPremium ? handlePremiumTemplate() : handleUseTemplate(template.id)}
                      disabled={template.isPremium}
                    >
                      {template.isPremium ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Use Template
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-resumes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">My Resumes</h2>
              <p className="text-muted-foreground">Manage and download your previously created resumes</p>
            </div>
            <Button onClick={() => setActiveTab('templates')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
          </div>

          {PREVIOUS_RESUMES.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first professional resume using our templates
                </p>
                <Button onClick={() => setActiveTab('templates')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {PREVIOUS_RESUMES.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{resume.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>Template: {resume.template}</span>
                            <span>•</span>
                            <span>Created: {new Date(resume.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Size: {resume.fileSize}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>Last modified: {new Date(resume.lastModified).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Downloaded {resume.downloadCount} times</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditResume(resume.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadResume(resume.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteResume(resume.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{previewTemplate?.name}</span>
                  {previewTemplate?.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {previewTemplate?.description}
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Preview Image */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="aspect-[8.5/11] bg-white shadow-lg rounded border mx-auto max-w-2xl">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <FileText className="h-24 w-24 text-gray-400 mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-800">{previewTemplate?.name}</h3>
                      <p className="text-gray-600">{previewTemplate?.category} Template</p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>• Professional header with contact information</p>
                        <p>• Clean section dividers and typography</p>
                        <p>• Optimized for ATS compatibility</p>
                        <p>• Modern, professional layout</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </Button>
              {previewTemplate && (
                <Button 
                  onClick={() => {
                    if (previewTemplate.isPremium) {
                      handlePremiumTemplate();
                    } else {
                      handleUseTemplate(previewTemplate.id);
                    }
                    setPreviewTemplate(null);
                  }}
                  disabled={previewTemplate.isPremium}
                >
                  {previewTemplate.isPremium ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Use This Template
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}