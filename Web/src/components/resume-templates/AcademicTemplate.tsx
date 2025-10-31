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

interface AcademicTemplateProps {
  resumeData: ResumeData;
  isPreview?: boolean;
}

export const AcademicTemplate: React.FC<AcademicTemplateProps> = ({ resumeData, isPreview = false }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const scale = 0.35; // Consistent scale for previews

  return (
    <div 
      id="resume-template" 
      style={{ 
        fontFamily: 'Garamond, "Times New Roman", serif',
        lineHeight: '1.6',
        fontSize: '12px',
        width: isPreview ? '210mm' : '8.5in',
        minHeight: isPreview ? '297mm' : '11in',
        margin: '0 auto',
        padding: isPreview ? '30px 25px' : '1in 0.75in',
        boxSizing: 'border-box',
        color: '#2c3e50',
        backgroundColor: '#ffffff',
        transform: isPreview ? `scale(${scale})` : 'none',
        transformOrigin: 'top center',
        position: 'relative'
      }}
    >
      {/* Academic Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 
          style={{ 
            fontSize: '26px',
            color: '#2c3e50',
            letterSpacing: '2px',
            margin: '0 0 20px 0',
            fontVariant: 'small-caps',
            fontWeight: 'bold',
            textAlign: 'center',
            display: 'block',
            width: '100%'
          }}
        >
          {resumeData.personalInfo.fullName || 'Your Full Name'}
        </h1>
        
        {/* Contact Information */}
        <div 
          style={{ 
            fontSize: '12px',
            color: '#555',
            lineHeight: '1.6',
            textAlign: 'center',
            marginBottom: '16px'
          }}
        >
          {resumeData.personalInfo.email && (
            <div style={{ marginBottom: '4px' }}>{resumeData.personalInfo.email}</div>
          )}
          {(resumeData.personalInfo.phone || resumeData.personalInfo.location) && (
            <div>
              {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.phone && resumeData.personalInfo.location && <span style={{ margin: '0 8px', color: '#8b4513' }}>•</span>}
              {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
            </div>
          )}
        </div>
        
        <div 
          style={{ 
            height: '2px', 
            background: 'linear-gradient(to right, transparent, #8b4513, transparent)',
            width: '60%',
            margin: '16px auto'
          }}
        />
      </div>

      {/* Research Interests / Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-7">
          <h2 
            className="font-bold mb-3"
            style={{ 
              fontSize: '14px',
              color: '#8b4513',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
              fontVariant: 'small-caps'
            }}
          >
            Research Interests
          </h2>
          <p 
            className="text-justify"
            style={{ 
              fontSize: '11px',
              lineHeight: '1.7',
              color: '#444',
              margin: '0',
              textIndent: '1em'
            }}
          >
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education (Primary focus for academic CV) */}
      {resumeData.education.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 
            style={{ 
              fontSize: '16px',
              color: '#8b4513',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              margin: '0 0 20px 0',
              fontVariant: 'small-caps',
              fontWeight: 'bold'
            }}
          >
            Education
          </h2>
          {resumeData.education
            .filter(edu => edu.degree && edu.field && edu.institution) // Only show complete entries
            .map((edu, index) => (
            <div key={edu.id} style={{ marginBottom: index < resumeData.education.filter(e => e.degree && e.field && e.institution).length - 1 ? '24px' : '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: '1', paddingRight: '20px' }}>
                  <h3 
                    style={{ 
                      fontSize: '14px',
                      color: '#2c3e50',
                      margin: '0 0 6px 0',
                      fontWeight: 'bold',
                      lineHeight: '1.2'
                    }}
                  >
                    {edu.degree} in {edu.field}
                  </h3>
                  <div 
                    style={{ 
                      fontSize: '13px',
                      color: '#666',
                      margin: '0 0 4px 0',
                      fontStyle: 'italic'
                    }}
                  >
                    {edu.institution}
                  </div>
                  {edu.gpa && (
                    <div 
                      style={{ 
                        fontSize: '12px',
                        color: '#888',
                        margin: '4px 0 0 0'
                      }}
                    >
                      Cumulative GPA: {edu.gpa}
                    </div>
                  )}
                </div>
                <div 
                  style={{ 
                    fontSize: '13px',
                    color: '#666',
                    minWidth: '140px',
                    fontStyle: 'italic',
                    textAlign: 'right',
                    paddingTop: '2px'
                  }}
                >
                  {formatDate(edu.graduationDate)}
                </div>
              </div>
              
              {/* Add a subtle separator line between education entries */}
              {index < resumeData.education.filter(e => e.degree && e.field && e.institution).length - 1 && (
                <div 
                  style={{ 
                    height: '1px',
                    background: '#e0e0e0',
                    margin: '16px 0 0 0',
                    width: '100%'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Academic Experience */}
      {resumeData.experience.length > 0 && (
        <div className="mb-7">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: '14px',
              color: '#8b4513',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 16px 0',
              fontVariant: 'small-caps'
            }}
          >
            Academic Experience
          </h2>
          {resumeData.experience.map((exp, index) => (
            <div key={exp.id} className={index > 0 ? 'mt-5' : ''}>
              <div className="flex justify-between items-start mb-2">
                <div style={{ flex: '1' }}>
                  <h3 
                    className="font-bold"
                    style={{ 
                      fontSize: '12px',
                      color: '#2c3e50',
                      margin: '0 0 2px 0'
                    }}
                  >
                    {exp.position}
                  </h3>
                  <div 
                    className="italic"
                    style={{ 
                      fontSize: '11px',
                      color: '#666',
                      margin: '0 0 8px 0'
                    }}
                  >
                    {exp.company}
                  </div>
                </div>
                <div 
                  className="text-right"
                  style={{ 
                    fontSize: '11px',
                    color: '#666',
                    minWidth: '140px',
                    fontStyle: 'italic'
                  }}
                >
                  {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                </div>
              </div>
              {exp.description && (
                <p 
                  style={{ 
                    fontSize: '10px',
                    lineHeight: '1.5',
                    color: '#555',
                    margin: '0 0 8px 0'
                  }}
                >
                  {exp.description}
                </p>
              )}
              {index < resumeData.experience.length - 1 && (
                <div 
                  style={{ 
                    height: '1px', 
                    backgroundColor: '#ddd',
                    margin: '8px 0'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Technical Skills / Competencies */}
      {resumeData.skills.length > 0 && (
        <div className="mb-7">
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: '14px',
              color: '#8b4513',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 16px 0',
              fontVariant: 'small-caps'
            }}
          >
            Technical Competencies
          </h2>
          <div 
            className="grid grid-cols-2 gap-x-4 gap-y-2"
            style={{ 
              fontSize: '11px',
              lineHeight: '1.6'
            }}
          >
            {resumeData.skills.map((skill, index) => (
              <div 
                key={index}
                className="flex items-center"
                style={{ 
                  color: '#444',
                  paddingBottom: '4px'
                }}
              >
                <span 
                  style={{ 
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#8b4513',
                    borderRadius: '50%',
                    marginRight: '8px',
                    flexShrink: 0
                  }}
                />
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications Section (placeholder for academic CVs) */}
      <div className="mb-7">
        <h2 
          className="font-bold mb-4"
          style={{ 
            fontSize: '14px',
            color: '#8b4513',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: '0 0 16px 0',
            fontVariant: 'small-caps'
          }}
        >
          Publications & Research
        </h2>
        <p 
          style={{ 
            fontSize: '11px',
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center'
          }}
        >
          Publications and research work will be listed here as they become available.
        </p>
      </div>

      {/* Footer Note for Academic CV */}
      <div 
        className="text-center mt-8"
        style={{ 
          borderTop: '1px solid #ddd',
          paddingTop: '12px'
        }}
      >
        <p 
          style={{ 
            fontSize: '9px',
            color: '#888',
            fontStyle: 'italic'
          }}
        >
          References available upon request
        </p>
      </div>
    </div>
  );
};