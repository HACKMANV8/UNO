import React from 'react';
import { FileText, User, Briefcase, GraduationCap, Star } from 'lucide-react';

interface TemplatePreviewProps {
  templateId: string;
  templateName: string;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId, templateName }) => {
  const getPreviewContent = () => {
    switch (templateId) {
      case 'modern':
        return (
          <div className="bg-white aspect-[8.5/11] p-4 text-xs">
            <div className="mb-6">
              <h1 className="text-2xl font-light text-blue-900 mb-2">Alex Modern</h1>
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-3">
                <span>alex.modern@email.com</span>
                <span>|</span>
                <span>(555) 123-4567</span>
                <span>|</span>
                <span>San Francisco, CA</span>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-900"></div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-2">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Profile</h2>
                  <p className="text-xs leading-relaxed text-gray-600">Innovation-driven professional with expertise in modern technologies...</p>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">Experience</h2>
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-blue-900">Product Manager</h3>
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-medium text-blue-500">InnovateCorp</div>
                      <div className="text-xs text-gray-500 italic">Mar 2021 - Present</div>
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        <span>Led product development initiatives...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">Education</h2>
                  <h3 className="text-xs font-semibold text-blue-900">Bachelor of Science</h3>
                  <div className="text-xs text-blue-500">Computer Science</div>
                  <div className="text-xs text-gray-500">Stanford University</div>
                </div>
                
                <div>
                  <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">Skills</h2>
                  <div className="space-y-1">
                    {['React', 'Node.js', 'Python', 'AWS'].map((skill, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="aspect-[8.5/11] bg-gradient-to-br from-purple-600 to-blue-600 flex">
            <div className="w-1/3 bg-black bg-opacity-20 p-3 text-white">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold">
                  CP
                </div>
                <h1 className="text-sm font-bold">CREATIVE PRO</h1>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase mb-2">Contact</h3>
                <div className="text-xs space-y-1">
                  <div>creative@email.com</div>
                  <div>(555) 123-4567</div>
                  <div>Los Angeles, CA</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase mb-2">Skills</h3>
                <div className="space-y-1">
                  {['Photoshop', 'Illustrator', 'Figma', 'InDesign'].map((skill, idx) => (
                    <div key={idx} className="text-xs bg-white bg-opacity-10 p-1 rounded text-center border border-white border-opacity-20">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-2/3 bg-white p-3">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-purple-600 border-b-2 border-purple-600 pb-1 mb-2">About Me</h2>
                <p className="text-xs text-gray-600">Passionate designer with a keen eye for visual storytelling...</p>
              </div>
              
              <div className="mb-4">
                <h2 className="text-sm font-bold text-purple-600 border-b-2 border-purple-600 pb-1 mb-3">Experience</h2>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-2 relative">
                  <div className="absolute -left-2 top-3 w-3 h-3 bg-purple-600 rounded-full"></div>
                  <h3 className="text-xs font-bold">Creative Director</h3>
                  <div className="text-xs font-semibold text-purple-600">Design Studio</div>
                  <div className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">2022 - Present</div>
                  <div className="text-xs mt-1">
                    <div className="flex items-start">
                      <span className="text-purple-600 mr-1">★</span>
                      <span>Conceptualized award-winning campaigns...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="bg-white aspect-[8.5/11] p-4 text-xs">
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-blue-900 mb-3" style={{ fontVariant: 'small-caps' }}>Dr. Academic Scholar</h1>
              <div className="text-xs text-gray-600 mb-2">academic.scholar@university.edu</div>
              <div className="text-xs text-gray-600 mb-4">(555) 123-4567 • University City, State</div>
              <div className="w-3/5 mx-auto h-px bg-yellow-700"></div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-sm font-bold text-yellow-700 text-center uppercase tracking-wider mb-3" style={{ fontVariant: 'small-caps' }}>Research Interests</h2>
              <p className="text-xs leading-relaxed text-gray-700 text-justify" style={{ textIndent: '1em' }}>
                Advanced computational methods in quantum mechanics with applications to materials science and renewable energy systems...
              </p>
            </div>
            
            <div className="mb-4">
              <h2 className="text-sm font-bold text-yellow-700 text-center uppercase tracking-wider mb-3" style={{ fontVariant: 'small-caps' }}>Education</h2>
              <div className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-blue-900">Ph.D. in Theoretical Physics</h3>
                    <div className="text-xs italic text-gray-600">Massachusetts Institute of Technology</div>
                    <div className="text-xs text-gray-500">Cumulative GPA: 3.9</div>
                  </div>
                  <div className="text-xs text-gray-600 italic">May 2020</div>
                </div>
                <div className="h-px bg-gray-300 mt-2"></div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-sm font-bold text-yellow-700 text-center uppercase tracking-wider mb-3" style={{ fontVariant: 'small-caps' }}>Academic Experience</h2>
              <div className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-blue-900">Postdoctoral Research Fellow</h3>
                    <div className="text-xs italic text-gray-600">Stanford University</div>
                  </div>
                  <div className="text-xs text-gray-600 italic">September 2020 – Present</div>
                </div>
                <div className="text-xs mt-2 ml-4 text-gray-700">
                  <div className="mb-1">• Conducted cutting-edge research in quantum computing applications...</div>
                </div>
                <div className="h-px bg-gray-300 mt-3"></div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-sm font-bold text-yellow-700 text-center uppercase tracking-wider mb-3" style={{ fontVariant: 'small-caps' }}>Publications</h2>
              <div className="text-xs text-gray-600 italic text-center">
                [Publications will be listed here upon completion of research work]
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500 italic border-t border-yellow-700 pt-3 mt-6">
              Curriculum Vitae • References Available Upon Request
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 aspect-[8.5/11] flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">{templateName}</h3>
              <p className="text-sm text-gray-500">Professional Template Preview</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-hidden rounded-lg shadow-lg border">
      {getPreviewContent()}
    </div>
  );
};