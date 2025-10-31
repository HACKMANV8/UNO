import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Plus, 
  Trash2,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ModernTemplate, 
  CreativeTemplate, 
  AcademicTemplate 
} from '@/components/resume-templates';
import { generateResumePDF } from '@/lib/pdfGenerator';
import { getStudentCredentials, StudentCredential, CredentialType, updateUserProfile } from '@/services/firebase';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export default function StudentResumeEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { templateId, resumeId } = useParams();
  const location = useLocation();
  const isEditing = !!resumeId;
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [credentials, setCredentials] = useState<StudentCredential[]>([]);

  // Get template information
  const getTemplateName = (id: string) => {
    const templates = {
      modern: 'Modern Minimalist',
      creative: 'Creative Portfolio',
      academic: 'Academic Scholar'
    };
    return templates[id as keyof typeof templates] || 'Modern Minimalist';
  };

  // Render the correct template component
  const renderTemplate = () => {
    const props = { resumeData, isPreview: false };
    
    switch (templateId) {
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'creative':
        return <CreativeTemplate {...props} />;
      case 'academic':
        return <AcademicTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
    }
  };

  useEffect(() => {
    if (isEditing) {
      // Load existing resume data
      loadResumeData(resumeId);
    } else {
      // Initialize with user profile and credentials
      initializeWithUserProfile();
    }
  }, [templateId, resumeId, isEditing, user]);

  // Initialize with user profile and credentials from Firebase
  const initializeWithUserProfile = async () => {
    if (!user?.kritiId) return;
    
    setIsLoadingProfile(true);
    try {
      // Fetch user's credentials
      const userCredentials = await getStudentCredentials(user.kritiId);
      setCredentials(userCredentials);

      // Extract education from credentials
      const educationFromCredentials = userCredentials
        .filter(cred => cred.credentialType === 'degree' || cred.credentialType === 'diploma' || cred.credentialType === 'certificate')
        .map((cred, index) => ({
          id: cred.id,
          institution: cred.credentialData?.institution || cred.credentialData?.university || cred.issuerName,
          degree: cred.credentialData?.degree || cred.credentialType,
          field: cred.credentialData?.major || cred.credentialData?.field || '',
          graduationDate: cred.credentialData?.graduationYear ? `${cred.credentialData.graduationYear}` : 
                         cred.issuedDate ? new Date(cred.issuedDate.toDate()).getFullYear().toString() : '',
          gpa: cred.credentialData?.cgpa?.toString() || cred.credentialData?.gpa?.toString() || '',
        }));

      // Extract skills from credentials
      const skillsFromCredentials = userCredentials
        .filter(cred => cred.credentialType === 'skill')
        .map(cred => cred.credentialData?.skill || cred.credentialData?.skillName)
        .filter(Boolean);

      // Initialize resume data with user profile and credentials
      setResumeData({
        personalInfo: {
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: '', // We don't store location in user profile yet
          summary: '',
        },
        experience: [], // Start with empty experience
        education: educationFromCredentials,
        skills: skillsFromCredentials,
      });

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadResumeData = async (id: string) => {
    // Load existing resume data (for editing mode)
    // For now, we'll still use mock data but fetch credentials
    if (user?.kritiId) {
      try {
        const userCredentials = await getStudentCredentials(user.kritiId);
        setCredentials(userCredentials);
      } catch (error) {
        console.error('Error loading credentials:', error);
      }
    }

    // Mock loading existing resume - replace with actual resume loading logic
    const mockData: ResumeData = {
      personalInfo: {
        fullName: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: user?.phone || '+1 (555) 123-4567',
        location: 'New York, NY',
        summary: 'Experienced software developer with a passion for creating innovative solutions and leading high-performing teams.',
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
    setResumeData(mockData);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: '',
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  // Helper function to check if a skill comes from credentials
  const isSkillFromCredentials = (skill: string): boolean => {
    return credentials.some(cred => 
      cred.credentialType === 'skill' && 
      (cred.credentialData?.skill === skill || cred.credentialData?.skillName === skill)
    );
  };

  // Function to sync credentials to resume sections
  const syncCredentialsToResume = () => {
    if (credentials.length === 0) return;

    // Update education from degree/diploma/certificate credentials
    const educationFromCredentials = credentials
      .filter(cred => cred.credentialType === 'degree' || cred.credentialType === 'diploma' || cred.credentialType === 'certificate')
      .map((cred) => ({
        id: cred.id,
        institution: cred.credentialData?.institution || cred.credentialData?.university || cred.issuerName,
        degree: cred.credentialData?.degree || cred.credentialType,
        field: cred.credentialData?.major || cred.credentialData?.field || '',
        graduationDate: cred.credentialData?.graduationYear ? `${cred.credentialData.graduationYear}` : 
                       cred.issuedDate ? new Date(cred.issuedDate.toDate()).getFullYear().toString() : '',
        gpa: cred.credentialData?.cgpa?.toString() || cred.credentialData?.gpa?.toString() || '',
      }));

    // Update skills from skill credentials
    const skillsFromCredentials = credentials
      .filter(cred => cred.credentialType === 'skill')
      .map(cred => cred.credentialData?.skill || cred.credentialData?.skillName)
      .filter(Boolean);

    // Merge with existing data (avoid duplicates)
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education.filter(edu => !educationFromCredentials.find(newEdu => newEdu.id === edu.id)),
        ...educationFromCredentials
      ],
      skills: [
        ...prev.skills,
        ...skillsFromCredentials.filter(skill => !prev.skills.includes(skill))
      ]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user profile with any changes from personal info
      if (user?.uid && resumeData.personalInfo.phone && resumeData.personalInfo.phone !== user.phone) {
        await updateUserProfile(user.uid, {
          phone: resumeData.personalInfo.phone,
        });
      }

      // Mock save resume operation - replace with actual resume save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving resume:', resumeData);
      
      // Navigate back to resume builder
      navigate('/student/resume');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateResumePDF(resumeData);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/student/resume')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Builder
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Resume' : 'Create Resume'}
            </h1>
            {templateId && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {getTemplateName(templateId)}
                </Badge>
                <span className="text-sm text-muted-foreground">Template</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownload} disabled={isGeneratingPDF}>
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Resume'}
          </Button>
        </div>
      </div>

      {/* Resume Form */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </div>
                {isLoadingProfile && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading profile...
                  </div>
                )}
              </CardTitle>
              {!isEditing && (
                <p className="text-sm text-muted-foreground">
                  Basic information has been auto-filled from your profile. You can edit it below.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, summary: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Work Experience</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Education</span>
                </CardTitle>
                <div className="flex gap-2">
                  {credentials.length > 0 && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={syncCredentialsToResume}
                      className="text-primary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Sync from Credentials
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={addEducation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </div>
              {!isEditing && credentials.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Your verified credentials have been automatically added. Use "Sync from Credentials" to update with latest data.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      {credentials.some(cred => cred.id === edu.id) && (
                        <Badge variant="secondary" className="text-xs">
                          From Credential
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Graduation Date</Label>
                      <Input
                        type="month"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills</CardTitle>
                {credentials.length > 0 && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={syncCredentialsToResume}
                    className="text-primary"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Sync from Credentials
                  </Button>
                )}
              </div>
              {!isEditing && credentials.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Skills from your verified credentials have been added automatically.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant={isSkillFromCredentials(skill) ? "default" : "secondary"} 
                    className="cursor-pointer relative"
                  >
                    {skill}
                    {isSkillFromCredentials(skill) && (
                      <span className="ml-1 text-xs opacity-70">✓</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-xs"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-3 lg:sticky lg:top-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Resume Preview</span>
                <Badge variant="outline">
                  {getTemplateName(templateId || 'classic')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div 
                className="border-2 border-gray-200 rounded-lg bg-gray-50 shadow-inner overflow-y-auto overflow-x-hidden"
                style={{ 
                  height: '900px',
                  width: '100%',
                  position: 'relative'
                }}
              >
                <div 
                  className="mx-auto bg-white shadow-xl"
                  style={{ 
                    width: '595px', // A4 width in pixels at 72 DPI
                    maxWidth: '100%',
                    minHeight: '842px', // A4 height in pixels at 72 DPI
                    transform: 'scale(0.8)',
                    transformOrigin: 'top center',
                    margin: '20px auto 40px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  {renderTemplate()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}