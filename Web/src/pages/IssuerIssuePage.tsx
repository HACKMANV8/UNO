import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, Award, Users, ChevronDown, GraduationCap, Award as AwardIcon, FileText, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CREDENTIAL_TYPES = [
  { value: 'academic', label: 'Academic Certificate' },
  { value: 'professional', label: 'Professional Certification' },
  { value: 'skill', label: 'Skill Verification' },
  { value: 'training', label: 'Training Completion' },
  { value: 'achievement', label: 'Achievement Award' },
];

const CERTIFICATE_TYPES = [
  { value: 'degree', label: 'Degree Certificate', icon: GraduationCap },
  { value: 'result', label: 'Result Certificate', icon: FileText },
  { value: 'experience', label: 'Experience Certificate', icon: Briefcase },
];

export default function IssuerIssuePage() {
  const { user } = useAuth();
  const [certificateType, setCertificateType] = useState(user?.role === 'issuer_staff' ? 'result' : '');
  const [issuanceData, setIssuanceData] = useState({
    recipientName: '',
    recipientEmail: '',
    credentialType: '',
    title: '',
    description: '',
    validFrom: '',
    validUntil: '',
    skills: '',
    // Degree specific fields
    university: '',
    degree: '',
    field: '',
    graduationYear: '',
    gpa: '',
    // Result specific fields
    examName: '',
    rollNumber: '',
    marks: '',
    percentage: '',
    grade: '',
    // Experience specific fields
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
    achievements: '',
  });
  const [isIssuing, setIsIssuing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    
    // Simulate credential issuance
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsIssuing(false);
    setSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setSuccess(false);
      setCertificateType('');
      setIssuanceData({
        recipientName: '',
        recipientEmail: '',
        credentialType: '',
        title: '',
        description: '',
        validFrom: '',
        validUntil: '',
        skills: '',
        university: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: '',
        examName: '',
        rollNumber: '',
        marks: '',
        percentage: '',
        grade: '',
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        responsibilities: '',
        achievements: '',
      });
    }, 3000);
  };

  const isFormValid = issuanceData.recipientName && 
                     issuanceData.recipientEmail && 
                     issuanceData.credentialType && 
                     issuanceData.title;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Issue Credential</h1>
          <Badge variant="secondary">{user?.role === 'issuer_admin' ? 'Admin' : 'Staff'}</Badge>
        </div>
        
        {user?.role === 'issuer_staff' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {certificateType ? 
                  CERTIFICATE_TYPES.find(type => type.value === certificateType)?.label || 'Select Certificate Type'
                  : 'Select Certificate Type'
                }
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {CERTIFICATE_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => setCertificateType(type.value)}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {type.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Credential issued successfully! The recipient will receive a notification.
          </AlertDescription>
        </Alert>
      )}

      {(user?.role === 'issuer_admin' || certificateType) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {certificateType === 'degree' && 'Degree Certificate Issuance'}
              {certificateType === 'result' && 'Result Certificate Issuance'}
              {certificateType === 'experience' && 'Experience Certificate Issuance'}
              {user?.role === 'issuer_admin' && !certificateType && 'New Credential Issuance'}
            </CardTitle>
            <CardDescription>
              {certificateType === 'degree' && 'Issue a degree certificate to a graduate'}
              {certificateType === 'result' && 'Issue a result certificate with marks and grades'}
              {certificateType === 'experience' && 'Issue an experience certificate for employment'}
              {user?.role === 'issuer_admin' && !certificateType && 'Issue a verifiable credential to a recipient'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common fields for all types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    placeholder="John Doe"
                    value={issuanceData.recipientName}
                    onChange={(e) => setIssuanceData({ ...issuanceData, recipientName: e.target.value })}
                    disabled={isIssuing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={issuanceData.recipientEmail}
                    onChange={(e) => setIssuanceData({ ...issuanceData, recipientEmail: e.target.value })}
                    disabled={isIssuing}
                    required
                  />
                </div>
              </div>

              {/* Degree Certificate Form */}
              {certificateType === 'degree' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University/Institution *</Label>
                      <Input
                        id="university"
                        placeholder="e.g., Harvard University"
                        value={issuanceData.university}
                        onChange={(e) => setIssuanceData({ ...issuanceData, university: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Select
                        value={issuanceData.degree}
                        onValueChange={(value) => setIssuanceData({ ...issuanceData, degree: value })}
                        disabled={isIssuing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="field">Field of Study *</Label>
                      <Input
                        id="field"
                        placeholder="e.g., Computer Science"
                        value={issuanceData.field}
                        onChange={(e) => setIssuanceData({ ...issuanceData, field: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year *</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        placeholder="2024"
                        value={issuanceData.graduationYear}
                        onChange={(e) => setIssuanceData({ ...issuanceData, graduationYear: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA/CGPA (Optional)</Label>
                    <Input
                      id="gpa"
                      placeholder="e.g., 3.8"
                      value={issuanceData.gpa}
                      onChange={(e) => setIssuanceData({ ...issuanceData, gpa: e.target.value })}
                      disabled={isIssuing}
                    />
                  </div>
                </>
              )}

              {/* Result Certificate Form */}
              {certificateType === 'result' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examName">Examination Name *</Label>
                      <Input
                        id="examName"
                        placeholder="e.g., Final Semester Examination"
                        value={issuanceData.examName}
                        onChange={(e) => setIssuanceData({ ...issuanceData, examName: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input
                        id="rollNumber"
                        placeholder="e.g., CS2024001"
                        value={issuanceData.rollNumber}
                        onChange={(e) => setIssuanceData({ ...issuanceData, rollNumber: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marks">Total Marks *</Label>
                      <Input
                        id="marks"
                        placeholder="e.g., 850/1000"
                        value={issuanceData.marks}
                        onChange={(e) => setIssuanceData({ ...issuanceData, marks: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Percentage *</Label>
                      <Input
                        id="percentage"
                        placeholder="e.g., 85%"
                        value={issuanceData.percentage}
                        onChange={(e) => setIssuanceData({ ...issuanceData, percentage: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade *</Label>
                      <Select
                        value={issuanceData.grade}
                        onValueChange={(value) => setIssuanceData({ ...issuanceData, grade: value })}
                        disabled={isIssuing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="distinction">Distinction</SelectItem>
                          <SelectItem value="first_class">First Class</SelectItem>
                          <SelectItem value="second_class">Second Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Experience Certificate Form */}
              {certificateType === 'experience' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization *</Label>
                      <Input
                        id="company"
                        placeholder="e.g., Tech Solutions Inc."
                        value={issuanceData.company}
                        onChange={(e) => setIssuanceData({ ...issuanceData, company: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position/Designation *</Label>
                      <Input
                        id="position"
                        placeholder="e.g., Senior Software Developer"
                        value={issuanceData.position}
                        onChange={(e) => setIssuanceData({ ...issuanceData, position: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={issuanceData.startDate}
                        onChange={(e) => setIssuanceData({ ...issuanceData, startDate: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={issuanceData.endDate}
                        onChange={(e) => setIssuanceData({ ...issuanceData, endDate: e.target.value })}
                        disabled={isIssuing}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Key Responsibilities *</Label>
                    <Textarea
                      id="responsibilities"
                      placeholder="Describe the key responsibilities and duties..."
                      value={issuanceData.responsibilities}
                      onChange={(e) => setIssuanceData({ ...issuanceData, responsibilities: e.target.value })}
                      disabled={isIssuing}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievements">Achievements (Optional)</Label>
                    <Textarea
                      id="achievements"
                      placeholder="Notable achievements and contributions..."
                      value={issuanceData.achievements}
                      onChange={(e) => setIssuanceData({ ...issuanceData, achievements: e.target.value })}
                      disabled={isIssuing}
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Admin form (original form) */}
              {user?.role === 'issuer_admin' && !certificateType && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="credentialType">Credential Type *</Label>
                    <Select
                      value={issuanceData.credentialType}
                      onValueChange={(value) => setIssuanceData({ ...issuanceData, credentialType: value })}
                      disabled={isIssuing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credential type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDENTIAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Credential Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Bachelor of Computer Science"
                      value={issuanceData.title}
                      onChange={(e) => setIssuanceData({ ...issuanceData, title: e.target.value })}
                      disabled={isIssuing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the credential and its requirements..."
                      value={issuanceData.description}
                      onChange={(e) => setIssuanceData({ ...issuanceData, description: e.target.value })}
                      disabled={isIssuing}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={issuanceData.validFrom}
                        onChange={(e) => setIssuanceData({ ...issuanceData, validFrom: e.target.value })}
                        disabled={isIssuing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={issuanceData.validUntil}
                        onChange={(e) => setIssuanceData({ ...issuanceData, validUntil: e.target.value })}
                        disabled={isIssuing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Associated Skills</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                      value={issuanceData.skills}
                      onChange={(e) => setIssuanceData({ ...issuanceData, skills: e.target.value })}
                      disabled={isIssuing}
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isFormValid || isIssuing}
              >
                {isIssuing ? (
                  <>
                    <Users className="mr-2 h-4 w-4 animate-spin" />
                    Issuing Credential...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Issue {certificateType === 'degree' ? 'Degree' : certificateType === 'result' ? 'Result' : certificateType === 'experience' ? 'Experience' : ''} Certificate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}