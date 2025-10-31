import React from 'react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
}

interface ModernTemplateProps {
  resumeData: ResumeData;
  isPreview?: boolean;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ resumeData, isPreview = false }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const scale = isPreview ? 0.75 : 1;
  const scaledPadding = isPreview ? '12mm' : '0.75in';

  return (
    <div 
      id="resume-template" 
      className={`bg-white text-black`}
      style={{ 
        fontFamily: 'Helvetica, Arial, sans-serif',
        lineHeight: '1.5',
        fontSize: '11px',
        width: isPreview ? '210mm' : '8.5in',
        minHeight: isPreview ? '297mm' : '11in',
        margin: '0 auto',
        padding: scaledPadding,
        boxSizing: 'border-box',
        color: '#333',
        transform: isPreview ? `scale(${scale})` : 'none',
        transformOrigin: 'top center'
      }}
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 
          className="font-light mb-2"
          style={{ 
            fontSize: '32px',
            color: '#2c3e50',
            letterSpacing: '0.5px',
            margin: '0 0 4px 0',
            fontWeight: '300'
          }}
        >
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        <div 
          className="flex items-center gap-4 text-gray-600 mb-4"
          style={{ 
            fontSize: '10px',
            flexWrap: 'wrap'
          }}
        >
          <span>{resumeData.personalInfo.email || 'your.email@example.com'}</span>
          <span>|</span>
          <span>{resumeData.personalInfo.phone || '(555) 123-4567'}</span>
          <span>|</span>
          <span>{resumeData.personalInfo.location || 'Your City, State'}</span>
        </div>
        <div 
          style={{ 
            height: '2px', 
            background: 'linear-gradient(to right, #3498db, #2c3e50)',
            width: '100%'
          }}
        />
      </div>

      {/* Professional Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-6">
          <h2 
            className="font-semibold mb-3"
            style={{ 
              fontSize: '14px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 12px 0'
            }}
          >
            Profile
          </h2>
          <p 
            className="text-justify"
            style={{ 
              fontSize: '11px',
              lineHeight: '1.6',
              color: '#555',
              margin: '0'
            }}
          >
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column */}
        <div style={{ flex: '2' }}>
          {/* Professional Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h2 
                className="font-semibold mb-4"
                style={{ 
                  fontSize: '14px',
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 16px 0'
                }}
              >
                Experience
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className={index > 0 ? 'mt-5' : ''}>
                  <div className="mb-2">
                    <h3 
                      className="font-semibold"
                      style={{ 
                        fontSize: '12px', 
                        color: '#2c3e50',
                        margin: '0 0 2px 0'
                      }}
                    >
                      {exp.position}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div 
                        className="font-medium"
                        style={{ 
                          fontSize: '11px',
                          color: '#3498db',
                          margin: '0'
                        }}
                      >
                        {exp.company}
                      </div>
                      <div 
                        style={{ 
                          fontSize: '10px',
                          color: '#7f8c8d',
                          fontStyle: 'italic'
                        }}
                      >
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="mt-2"
                    style={{ fontSize: '10px', lineHeight: '1.5', color: '#555' }}
                  >
                    {exp.description.split('.').filter(item => item.trim()).map((item, idx) => (
                      <div key={idx} className="flex items-start mb-1">
                        <span style={{ 
                          marginRight: '8px', 
                          color: '#3498db',
                          fontWeight: 'bold'
                        }}>→</span>
                        <span>{item.trim()}.</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: '1' }}>
          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-6">
              <h2 
                className="font-semibold mb-4"
                style={{ 
                  fontSize: '14px',
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 16px 0'
                }}
              >
                Education
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className={index > 0 ? 'mt-4' : ''}>
                  <h3 
                    className="font-semibold"
                    style={{ 
                      fontSize: '11px',
                      color: '#2c3e50',
                      margin: '0 0 2px 0',
                      lineHeight: '1.3'
                    }}
                  >
                    {edu.degree}
                  </h3>
                  <div 
                    style={{ 
                      fontSize: '10px',
                      color: '#3498db',
                      margin: '0 0 2px 0'
                    }}
                  >
                    {edu.field}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '10px',
                      color: '#7f8c8d',
                      lineHeight: '1.3'
                    }}
                  >
                    {edu.institution}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '9px',
                      color: '#95a5a6',
                      fontStyle: 'italic'
                    }}
                  >
                    {formatDate(edu.graduationDate)}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h2 
                className="font-semibold mb-3"
                style={{ 
                  fontSize: '14px',
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 12px 0'
                }}
              >
                Skills
              </h2>
              <div className="space-y-1">
                {resumeData.skills.map((skill, index) => (
                  <div 
                    key={index}
                    className="flex items-center"
                    style={{ marginBottom: '4px' }}
                  >
                    <div 
                      style={{ 
                        width: '4px',
                        height: '4px',
                        backgroundColor: '#3498db',
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#555' }}>
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};