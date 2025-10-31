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
import { 
  ModernTemplate, 
  CreativeTemplate, 
  AcademicTemplate 
} from '@/components/resume-templates';
import { TemplatePreview } from '@/components/resume-templates/TemplatePreview';

// Enhanced resume templates with detailed descriptions and features
const RESUME_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Contemporary design with clean lines, perfect for tech and startup environments',
    isPremium: false,
    category: 'Modern',
    features: ['Two-Column Layout', 'Color Accents', 'Modern Typography', 'Space Efficient'],
    bestFor: 'Tech companies, Startups, Marketing, Design roles'
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Eye-catching design with visual elements for creative professionals',
    isPremium: true,
    category: 'Creative',
    features: ['Visual Design', 'Color Gradients', 'Unique Layout', 'Portfolio Style'],
    bestFor: 'Designers, Artists, Creative Directors, Marketing'
  },
  {
    id: 'academic',
    name: 'Academic Scholar',
    description: 'Scholarly design optimized for researchers and academic positions',
    isPremium: false,
    category: 'Academic',
    features: ['Academic Format', 'Research Focus', 'Publication Ready', 'CV Style'],
    bestFor: 'Researchers, Professors, PhD candidates, Academic roles'
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

      // Generate PDF using the classic template by default
      await generateResumePDF(mockResumeData, `resume-${resumeId}.pdf`);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
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
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="relative">
                  <div className="aspect-[3/4] bg-muted">
                    <TemplatePreview templateId={template.id} templateName={template.name} />
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
                  
                  {/* Template Features */}
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-2">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Best For */}
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Best for:</div>
                    <div className="text-xs text-gray-600">{template.bestFor}</div>
                  </div>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
            {/* Template Features */}
            {previewTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Best for:</h4>
                  <p className="text-sm text-gray-600">{previewTemplate.bestFor}</p>
                </div>
              </div>
            )}

            {/* Full Template Preview */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="mx-auto max-w-4xl">
                {previewTemplate && (() => {
                  const mockData = {
                    personalInfo: {
                      fullName: 'Alex Johnson',
                      email: 'alex.johnson@email.com',
                      phone: '(555) 123-4567',
                      location: 'San Francisco, CA',
                      summary: 'Dynamic professional with 5+ years of experience in leading cross-functional teams and driving innovative solutions. Proven track record of delivering high-impact projects and fostering collaborative environments that drive business growth and operational excellence.',
                    },
                    experience: [
                      {
                        id: '1',
                        company: 'Innovation Corp',
                        position: 'Senior Project Manager',
                        startDate: '2022-01',
                        endDate: '',
                        description: 'Led cross-functional teams of 15+ members in delivering complex software solutions. Implemented agile methodologies that improved project delivery time by 30%. Managed budgets exceeding $2M and maintained 98% client satisfaction rate.',
                      },
                      {
                        id: '2',
                        company: 'TechStart Solutions',
                        position: 'Product Coordinator',
                        startDate: '2020-06',
                        endDate: '2021-12',
                        description: 'Coordinated product development lifecycle from ideation to launch. Collaborated with engineering, design, and marketing teams to deliver user-centered solutions. Achieved 25% increase in user engagement through strategic feature implementation.',
                      },
                    ],
                    education: [
                      {
                        id: '1',
                        institution: 'University of California, Berkeley',
                        degree: 'Bachelor of Science',
                        field: 'Business Administration',
                        graduationDate: '2020-05',
                        gpa: '3.7',
                      },
                    ],
                    skills: ['Project Management', 'Agile/Scrum', 'Data Analysis', 'Strategic Planning', 'Team Leadership', 'Cross-functional Collaboration', 'Budget Management', 'Stakeholder Communication'],
                  };

                  switch (previewTemplate.id) {
                    case 'modern':
                      return <ModernTemplate resumeData={mockData} isPreview={true} />;
                    case 'creative':
                      return <CreativeTemplate resumeData={mockData} isPreview={true} />;
                    case 'academic':
                      return <AcademicTemplate resumeData={mockData} isPreview={true} />;
                    default:
                      return <ModernTemplate resumeData={mockData} isPreview={true} />;
                  }
                })()}
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