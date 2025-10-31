import { useState } from 'react';
import { Award, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiableCredential } from '@/lib/crypto';
import { QRCodeModal } from './QRCodeModal';

interface CredentialCardProps {
  credential: VerifiableCredential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const [showQR, setShowQR] = useState(false);

  const getCredentialType = () => {
    if (credential.type.includes('EducationCredential')) return 'Education';
    if (credential.type.includes('SkillCredential')) return 'Skill';
    if (credential.type.includes('ExperienceCredential')) return 'Experience';
    return 'Credential';
  };

  const getCredentialTitle = () => {
    const subject = credential.credentialSubject;
    if (subject.degree) return subject.degree;
    if (subject.skill) return subject.skill;
    if (subject.position) return subject.position;
    return 'Professional Credential';
  };

  const getCredentialSubtitle = () => {
    const subject = credential.credentialSubject;
    return subject.university || subject.certifiedBy || subject.company || 'Verified Organization';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="glass-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{getCredentialTitle()}</h3>
                <p className="text-sm text-muted-foreground">{getCredentialSubtitle()}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {getCredentialType()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Details */}
          <div className="space-y-2 text-sm">
            {Object.entries(credential.credentialSubject)
              .filter(([key]) => key !== 'id')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-success font-medium">Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(credential.issuanceDate)}</span>
            </div>
          </div>

          {/* Actions */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowQR(true)}
          >
            Share Credential
          </Button>
        </CardContent>
      </Card>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        credential={credential}
      />
    </>
  );
}
