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

interface CreativeTemplateProps {
  resumeData: ResumeData;
  isPreview?: boolean;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ resumeData, isPreview = false }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const scale = isPreview ? 0.75 : 1;
  const scaledPadding = isPreview ? '12mm 8mm' : '0.75in 0.5in';

  return (
    <div 
      id="resume-template" 
      className={`bg-white text-black`}
      style={{ 
        fontFamily: 'Montserrat, Arial, sans-serif',
        lineHeight: '1.4',
        fontSize: '11px',
        width: isPreview ? '210mm' : '8.5in',
        minHeight: isPreview ? '297mm' : '11in',
        margin: '0 auto',
        padding: '0',
        boxSizing: 'border-box',
        color: '#333',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        transform: isPreview ? `scale(${scale})` : 'none',
        transformOrigin: 'top center'
      }}
    >
      {/* Left Sidebar */}
      <div className="flex" style={{ minHeight: '100%' }}>
        <div 
          style={{ 
            width: '35%',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: isPreview ? '20px 15px' : '0.75in 0.5in',
            color: 'white'
          }}
        >
          {/* Profile Section */}
          <div className="text-center mb-6">
            <div 
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {(resumeData.personalInfo.fullName || 'YN').split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h1 
              className="font-bold mb-2"
              style={{ 
                fontSize: '20px',
                margin: '0 0 8px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h3 
              className="font-bold mb-3"
              style={{ 
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Contact
            </h3>
            <div style={{ fontSize: '9px', lineHeight: '1.6' }}>
              <div className="mb-2">{resumeData.personalInfo.email || 'your.email@example.com'}</div>
              <div className="mb-2">{resumeData.personalInfo.phone || '(555) 123-4567'}</div>
              <div>{resumeData.personalInfo.location || 'Your City, State'}</div>
            </div>
          </div>

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h3 
                className="font-bold mb-3"
                style={{ 
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                Skills
              </h3>
              <div style={{ fontSize: '9px' }}>
                {resumeData.skills.map((skill, index) => (
                  <div 
                    key={index}
                    className="mb-2 p-2"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-6">
              <h3 
                className="font-bold mb-3"
                style={{ 
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                Education
              </h3>
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className={index > 0 ? 'mt-4' : ''}>
                  <div 
                    className="p-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <h4 
                      className="font-semibold"
                      style={{ 
                        fontSize: '10px',
                        margin: '0 0 4px 0',
                        color: 'white'
                      }}
                    >
                      {edu.degree}
                    </h4>
                    <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <div>{edu.field}</div>
                      <div>{edu.institution}</div>
                      <div>{formatDate(edu.graduationDate)}</div>
                      {edu.gpa && <div>GPA: {edu.gpa}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div 
          style={{ 
            width: '65%',
            backgroundColor: 'white',
            padding: isPreview ? '25px 25px 25px 20px' : '0.75in 0.75in 0.75in 0.5in'
          }}
        >
          {/* Professional Summary */}
          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <h2 
                className="font-bold mb-3"
                style={{ 
                  fontSize: '16px',
                  color: '#667eea',
                  margin: '0 0 12px 0',
                  borderBottom: '3px solid #667eea',
                  paddingBottom: '4px'
                }}
              >
                About Me
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

          {/* Professional Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h2 
                className="font-bold mb-4"
                style={{ 
                  fontSize: '16px',
                  color: '#667eea',
                  margin: '0 0 16px 0',
                  borderBottom: '3px solid #667eea',
                  paddingBottom: '4px'
                }}
              >
                Experience
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className={index > 0 ? 'mt-5' : ''}>
                  <div 
                    className="p-4"
                    style={{
                      backgroundColor: '#f8f9ff',
                      borderLeft: '4px solid #667eea',
                      borderRadius: '0 8px 8px 0',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '16px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#667eea',
                        borderRadius: '50%'
                      }}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 
                          className="font-bold"
                          style={{ 
                            fontSize: '13px',
                            color: '#333',
                            margin: '0 0 2px 0'
                          }}
                        >
                          {exp.position}
                        </h3>
                        <div 
                          className="font-semibold"
                          style={{ 
                            fontSize: '11px',
                            color: '#667eea',
                            margin: '0'
                          }}
                        >
                          {exp.company}
                        </div>
                      </div>
                      <div 
                        className="text-right"
                        style={{ 
                          fontSize: '10px',
                          color: '#7f8c8d',
                          backgroundColor: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                    <div 
                      className="mt-3"
                      style={{ fontSize: '10px', lineHeight: '1.5', color: '#555' }}
                    >
                      {exp.description.split('.').filter(item => item.trim()).map((item, idx) => (
                        <div key={idx} className="flex items-start mb-1">
                          <span style={{ 
                            marginRight: '8px', 
                            color: '#667eea',
                            fontSize: '12px'
                          }}>★</span>
                          <span>{item.trim()}.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};