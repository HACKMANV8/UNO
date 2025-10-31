import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Search, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Award,
  Calendar,
  Building,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { verifyCredentialById, verifyCredentialFromQR, type VerificationResult } from '@/services/verification';

export default function RecruiterVerifyPage() {
  const { user } = useAuth();
  const [verificationMethod, setVerificationMethod] = useState('id');
  const [credentialId, setCredentialId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!credentialId && !qrCodeData) {
      setError('Please provide a credential ID or scan a QR code');
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      let result: VerificationResult;
      
      if (qrCodeData) {
        console.log('Verifying credential from QR code...');
        result = await verifyCredentialFromQR(qrCodeData);
      } else {
        console.log('Verifying credential by ID:', credentialId);
        result = await verifyCredentialById(credentialId);
      }
      
      setVerificationResult(result);
      
      if (!result.valid) {
        setError(result.error || 'Credential verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setCredentialId('');
    setQrCodeData('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Verify Credentials</h1>
        <Badge variant="secondary">Recruiter</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credential Verification</CardTitle>
          <CardDescription>
            Verify the authenticity of candidate credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={verificationMethod} onValueChange={setVerificationMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="id">Credential ID</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="id" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                  id="credentialId"
                  placeholder="Enter credential ID (e.g., CRED-001)"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  disabled={isVerifying}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="qr" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">QR Code Data</Label>
                <Input
                  id="qrCode"
                  placeholder="Scan QR code or paste data here"
                  value={qrCodeData}
                  onChange={(e) => setQrCodeData(e.target.value)}
                  disabled={isVerifying}
                />
              </div>
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    QR Code scanner would be integrated here
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2 mt-6">
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying || (!credentialId && !qrCodeData)}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Credential
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {verificationResult.valid ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <CardTitle>
                {verificationResult.valid ? 'Credential Verified' : 'Verification Failed'}
              </CardTitle>
            </div>
            <CardDescription>
              Verification completed on {new Date(verificationResult.verificationDate).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Security Warnings */}
            {verificationResult.securityWarnings && verificationResult.securityWarnings.length > 0 && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-red-800">Security Alert:</p>
                    {verificationResult.securityWarnings.map((warning, index) => (
                      <p key={index} className="text-red-700">{warning}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {verificationResult.credential ? (
              <div className="space-y-6">
                {/* Credential Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Credential Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {verificationResult.credential.credentialType.charAt(0).toUpperCase() + 
                             verificationResult.credential.credentialType.slice(1)} Certificate
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Student ID: {verificationResult.credential.studentKritiId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{verificationResult.credential.issuerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Credential Data */}
                    {verificationResult.credential.credentialData && (
                      <div>
                        <h4 className="font-medium mb-2">Credential Details</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(verificationResult.credential.credentialData).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Validity Period</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Issued: {new Date(verificationResult.credential.issuedDate?.toDate?.() || verificationResult.credential.issuedDate).toLocaleDateString()}</span>
                        </div>
                        {verificationResult.credential.expiryDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Expires: {new Date(verificationResult.credential.expiryDate?.toDate?.() || verificationResult.credential.expiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Verification Status</h4>
                      <div className="space-y-2">
                        <Badge 
                          className={
                            verificationResult.valid
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }
                          variant="secondary"
                        >
                          {verificationResult.valid ? 'VERIFIED' : 'INVALID'}
                        </Badge>
                        
                        {/* Verification Details */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            {verificationResult.verificationDetails.exists ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Credential exists</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {verificationResult.verificationDetails.integrityValid ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Data integrity verified</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {verificationResult.verificationDetails.blockchainValid ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Blockchain verification</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {verificationResult.verificationDetails.blockchainRegistered ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Blockchain registered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Verification */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Blockchain Verification</h3>
                  <div className="space-y-2 text-sm">
                    {verificationResult.credential.blockchainHash && (
                      <div>
                        <span className="font-medium">Blockchain Hash:</span>
                        <code className="ml-2 text-xs bg-muted px-2 py-1 rounded break-all">
                          {verificationResult.credential.blockchainHash}
                        </code>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Verification ID:</span>
                      <span className="ml-2">{verificationResult.verificationId}</span>
                    </div>
                    <div>
                      <span className="font-medium">Verification Time:</span>
                      <span className="ml-2">{new Date(verificationResult.verificationDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-6">
                  <div className="flex space-x-2">
                    <Button>Download Report</Button>
                    <Button variant="outline">Save to Records</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Credential Verification Failed</p>
                      <p>{verificationResult.error || 'This credential could not be verified.'}</p>
                    </div>
                  </AlertDescription>
                </Alert>
                
                {/* Show what checks failed */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Verification Checks:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      {verificationResult.verificationDetails.exists ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>Credential exists</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {verificationResult.verificationDetails.integrityValid ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>Data integrity verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {verificationResult.verificationDetails.blockchainValid ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>Blockchain verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {verificationResult.verificationDetails.blockchainRegistered ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>Blockchain registered</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}