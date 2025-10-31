import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateResumePDF = async (resumeData: any, filename?: string) => {
  try {
    // Get the resume template element
    const resumeElement = document.getElementById('resume-template');
    
    if (!resumeElement) {
      throw new Error('Resume template element not found');
    }

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight,
      windowWidth: 1200,
      windowHeight: 1600,
    });

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Calculate dimensions to fit A4
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const pdfFilename = filename || `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    
    // Save the PDF
    pdf.save(pdfFilename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const generateResumeBlob = async (resumeData: any): Promise<Blob> => {
  try {
    const resumeElement = document.getElementById('resume-template');
    
    if (!resumeElement) {
      throw new Error('Resume template element not found');
    }

    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight,
      windowWidth: 1200,
      windowHeight: 1600,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Failed to generate PDF blob. Please try again.');
  }
};