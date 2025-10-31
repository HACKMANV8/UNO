import React from 'react';

interface ProfessionalResumeProps {
  resumeData: {
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
  };
}

export const ProfessionalResumeTemplate: React.FC<ProfessionalResumeProps> = ({ resumeData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div 
      id="resume-template" 
      className="bg-white text-black"
      style={{ 
        fontFamily: 'Georgia, serif',
        lineHeight: '1.5',
        fontSize: '13px',
        width: '100%',
        minHeight: '100%',
        margin: '0',
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header Section */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ 
            color: '#2c3e50',
            letterSpacing: '1px',
            fontFamily: 'Georgia, serif',
            fontSize: '28px'
          }}
        >
          {resumeData.personalInfo.fullName}
        </h1>
        <div 
          className="flex justify-center items-center flex-wrap gap-4 text-gray-700 text-sm"
          style={{ fontSize: '11px' }}
        >
          <span>{resumeData.personalInfo.email}</span>
          <span>•</span>
          <span>{resumeData.personalInfo.phone}</span>
          <span>•</span>
          <span>{resumeData.personalInfo.location}</span>
        </div>
      </div>

      {/* Professional Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-8">
          <h2 
            className="text-lg font-bold mb-3 text-gray-800 uppercase tracking-wide"
            style={{ 
              borderBottom: '2px solid #34495e',
              paddingBottom: '4px',
              color: '#2c3e50',
              fontSize: '16px'
            }}
          >
            Professional Summary
          </h2>
          <p 
            className="text-gray-700 leading-relaxed"
            style={{ 
              textAlign: 'justify',
              lineHeight: '1.6'
            }}
          >
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {resumeData.experience.length > 0 && (
        <div className="mb-8">
          <h2 
            className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wide"
            style={{ 
              borderBottom: '2px solid #34495e',
              paddingBottom: '4px',
              color: '#2c3e50',
              fontSize: '16px'
            }}
          >
            Professional Experience
          </h2>
          {resumeData.experience.map((exp, index) => (
            <div key={exp.id} className={`mb-6 ${index !== resumeData.experience.length - 1 ? 'pb-4' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-semibold text-gray-800"
                    style={{ color: '#2c3e50' }}
                  >
                    {exp.position}
                  </h3>
                  <p 
                    className="text-base font-medium text-gray-600 italic"
                    style={{ color: '#34495e' }}
                  >
                    {exp.company}
                  </p>
                </div>
                <div 
                  className="text-sm text-gray-600 font-medium"
                  style={{ 
                    minWidth: '140px',
                    textAlign: 'right',
                    color: '#7f8c8d'
                  }}
                >
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </div>
              </div>
              <ul 
                className="text-gray-700 ml-0"
                style={{ 
                  listStyleType: 'disc',
                  paddingLeft: '20px',
                  lineHeight: '1.6'
                }}
              >
                {exp.description.split('.').filter(line => line.trim()).map((line, idx) => (
                  <li key={idx} className="mb-1">
                    {line.trim()}{line.trim() && '.'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <div className="mb-8">
          <h2 
            className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wide"
            style={{ 
              borderBottom: '2px solid #34495e',
              paddingBottom: '4px',
              color: '#2c3e50',
              fontSize: '16px'
            }}
          >
            Education
          </h2>
          {resumeData.education.map((edu, index) => (
            <div key={edu.id} className={`mb-4 ${index !== resumeData.education.length - 1 ? 'pb-3' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-semibold text-gray-800"
                    style={{ color: '#2c3e50' }}
                  >
                    {edu.degree} in {edu.field}
                  </h3>
                  <p 
                    className="text-base font-medium text-gray-600 italic"
                    style={{ color: '#34495e' }}
                  >
                    {edu.institution}
                  </p>
                  {edu.gpa && (
                    <p 
                      className="text-sm text-gray-600"
                      style={{ color: '#7f8c8d' }}
                    >
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
                <div 
                  className="text-sm text-gray-600 font-medium"
                  style={{ 
                    minWidth: '100px',
                    textAlign: 'right',
                    color: '#7f8c8d'
                  }}
                >
                  {formatDate(edu.graduationDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <div className="mb-8">
          <h2 
            className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wide"
            style={{ 
              borderBottom: '2px solid #34495e',
              paddingBottom: '4px',
              color: '#2c3e50',
              fontSize: '16px'
            }}
          >
            Core Competencies
          </h2>
          <div 
            className="grid grid-cols-3 gap-2"
            style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {resumeData.skills.map((skill, index) => (
              <span 
                key={skill}
                className="text-gray-700"
                style={{ 
                  marginRight: '16px',
                  marginBottom: '4px',
                  color: '#2c3e50',
                  fontWeight: '500'
                }}
              >
                {skill}{index < resumeData.skills.length - 1 ? ' •' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div 
        className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500"
        style={{ 
          position: 'absolute',
          bottom: '0.5in',
          left: '1in',
          right: '1in',
          textAlign: 'center'
        }}
      >
        References available upon request
      </div>
    </div>
  );
};