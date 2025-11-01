// OCR service using Gemini API for document extraction
import { GoogleGenerativeAI } from '@google/generative-ai';

// Document data structure matching your Python code
export interface ExtractedDocumentData {
  document_type: 
    | "10th/SSC Marks Card"
    | "12th/PUC/HSC Marks Card" 
    | "University Marksheet (Degree/Diploma)"
    | "Internship/Experience Certificate"
    | "Other Academic Document";
  full_name: string;
  institution_name: string;
  degree_or_course: string;
  registration_number: string;
  completion_year: string;
  total_marks_or_grade: number;
  marks_format: string;
}

export interface OCRResult {
  success: boolean;
  data?: ExtractedDocumentData;
  error?: string;
  processingTime?: number;
}

class DocumentOCRService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async extractDocumentData(imageFile: File): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting OCR extraction for:', imageFile.name);

      // Convert file to base64
      const imageData = await this.fileToGenerativePart(imageFile);

      // Create the prompt - exactly matching your Python code
      const prompt = `Analyze this academic document or marks card and extract all relevant details following the schema strictly as JSON. Detect fields like name, roll number, year, total marks, and marks format accurately.

Return the data in this exact JSON format:
{
  "document_type": "10th/SSC Marks Card" | "12th/PUC/HSC Marks Card" | "University Marksheet (Degree/Diploma)" | "Internship/Experience Certificate" | "Other Academic Document",
  "full_name": "extracted full name",
  "institution_name": "extracted institution name",
  "degree_or_course": "extracted degree or course",
  "registration_number": "extracted registration number",
  "completion_year": "extracted year",
  "total_marks_or_grade": number,
  "marks_format": "extracted marks format like Percentage, CGPA, etc"
}`;

      // Generate content with image
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();

      console.log('📄 Raw Gemini response:', text);

      // Parse JSON response
      let extractedData: ExtractedDocumentData;
      try {
        // Clean the response text - remove any markdown formatting
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        return {
          success: false,
          error: 'Could not parse extracted data. Please ensure the document is clear and readable.',
          processingTime: Date.now() - startTime
        };
      }

      // Validate required fields
      if (!this.validateExtractedData(extractedData)) {
        return {
          success: false,
          error: 'Extracted data is incomplete or invalid. Please check document quality.',
          processingTime: Date.now() - startTime
        };
      }

      console.log('✅ Document extraction successful:', extractedData);

      return {
        success: true,
        data: extractedData,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ OCR extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during extraction',
        processingTime: Date.now() - startTime
      };
    }
  }

  private async fileToGenerativePart(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const base64 = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private validateExtractedData(data: ExtractedDocumentData): boolean {
    return !!(
      data.document_type &&
      data.full_name &&
      data.institution_name &&
      data.degree_or_course &&
      data.registration_number &&
      data.completion_year &&
      typeof data.total_marks_or_grade === 'number' &&
      data.marks_format
    );
  }

  getDocumentTypeIcon(documentType: string): string {
    switch (documentType) {
      case "10th/SSC Marks Card":
      case "12th/PUC/HSC Marks Card":
        return "🎓";
      case "University Marksheet (Degree/Diploma)":
        return "📜";
      case "Internship/Experience Certificate":
        return "💼";
      default:
        return "📄";
    }
  }

  formatProcessingTime(ms: number): string {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

// Export singleton instance
export const documentOCRService = new DocumentOCRService();