import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  ScanLine,
  Copy,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { documentOCRService, ExtractedDocumentData, OCRResult } from '@/services/documentOCR';

interface DocumentOCRProps {
  onDataExtracted?: (data: ExtractedDocumentData) => void;
}

export default function DocumentOCR({ onDataExtracted }: DocumentOCRProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedDocumentData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setExtractedData(null);
    setProcessingTime(null);
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🚀 Processing document:', selectedFile.name);
      const result: OCRResult = await documentOCRService.extractDocumentData(selectedFile);
      
      setProcessingTime(result.processingTime || 0);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setEditedData(result.data);
        console.log('✅ Document processed successfully');
        
        if (onDataExtracted) {
          onDataExtracted(result.data);
        }
      } else {
        setError(result.error || 'Failed to extract document data');
      }
    } catch (error) {
      console.error('❌ Processing error:', error);
      setError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedData) {
      setExtractedData(editedData);
      if (onDataExtracted) {
        onDataExtracted(editedData);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(extractedData);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    if (extractedData) {
      const formattedData = JSON.stringify(extractedData, null, 2);
      navigator.clipboard.writeText(formattedData);
    }
  };

  const downloadResult = () => {
    if (extractedData) {
      const dataStr = JSON.stringify(extractedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `ocr_${extractedData.full_name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      link.click();
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setEditedData(null);
    setError(null);
    setProcessingTime(null);
    setIsProcessing(false);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ScanLine className="h-5 w-5" />
            <span>Document OCR Processing</span>
          </CardTitle>
          <CardDescription>
            Upload academic documents to automatically extract information using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Click to select an image file
              </p>
              <p className="text-xs text-gray-500">
                Supports JPEG, PNG, WebP (max 10MB)
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mt-4"
            >
              Select Document Image
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Selected File Preview */}
          {selectedFile && previewUrl && (
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <div className="flex-grow space-y-2">
                    <h3 className="font-medium">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={processDocument}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {isProcessing ? (
                          <>
                            <Spinner className="w-4 h-4 mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ScanLine className="w-4 h-4 mr-2" />
                            Extract Data
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={clearAll}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Processing Results */}
      {extractedData && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {documentOCRService.getDocumentTypeIcon(extractedData.document_type)}
                  </span>
                  <span>Extracted Information</span>
                </CardTitle>
                <CardDescription>
                  Document type: {extractedData.document_type}
                </CardDescription>
                {processingTime && (
                  <Badge variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Processed in {documentOCRService.formatProcessingTime(processingTime)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadResult}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedData?.full_name || ''}
                        onChange={(e) => setEditedData(prev => 
                          prev ? { ...prev, full_name: e.target.value } : null
                        )}
                      />
                    ) : (
                      <p className="font-medium">{extractedData.full_name}</p>
                    )}
                  </div>

                  <div>
                    <Label>Registration Number</Label>
                    {isEditing ? (
                      <Input
                        value={editedData?.registration_number || ''}
                        onChange={(e) => setEditedData(prev => 
                          prev ? { ...prev, registration_number: e.target.value } : null
                        )}
                      />
                    ) : (
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {extractedData.registration_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Completion Year</Label>
                    {isEditing ? (
                      <Input
                        value={editedData?.completion_year || ''}
                        onChange={(e) => setEditedData(prev => 
                          prev ? { ...prev, completion_year: e.target.value } : null
                        )}
                      />
                    ) : (
                      <p className="font-medium">{extractedData.completion_year}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Institution Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedData?.institution_name || ''}
                        onChange={(e) => setEditedData(prev => 
                          prev ? { ...prev, institution_name: e.target.value } : null
                        )}
                      />
                    ) : (
                      <p className="font-medium">{extractedData.institution_name}</p>
                    )}
                  </div>

                  <div>
                    <Label>Degree/Course</Label>
                    {isEditing ? (
                      <Input
                        value={editedData?.degree_or_course || ''}
                        onChange={(e) => setEditedData(prev => 
                          prev ? { ...prev, degree_or_course: e.target.value } : null
                        )}
                      />
                    ) : (
                      <p className="font-medium">{extractedData.degree_or_course}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Marks/Grade</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editedData?.total_marks_or_grade || 0}
                          onChange={(e) => setEditedData(prev => 
                            prev ? { ...prev, total_marks_or_grade: parseFloat(e.target.value) || 0 } : null
                          )}
                        />
                      ) : (
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                          {extractedData.total_marks_or_grade}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Format</Label>
                      {isEditing ? (
                        <Input
                          value={editedData?.marks_format || ''}
                          onChange={(e) => setEditedData(prev => 
                            prev ? { ...prev, marks_format: e.target.value } : null
                          )}
                        />
                      ) : (
                        <p className="font-medium">{extractedData.marks_format}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}