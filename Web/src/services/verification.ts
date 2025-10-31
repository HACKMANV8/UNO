import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { verifyCredentialCompleteWithBlockchain } from './blockchain';
import type { StudentCredential } from './firebase';

export interface VerificationResult {
  valid: boolean;
  credential?: StudentCredential;
  verificationDetails: {
    exists: boolean;
    signatureValid: boolean;
    integrityValid: boolean;
    blockchainValid: boolean;
    blockchainRegistered: boolean;
  };
  error?: string;
  verificationDate: string;
  verificationId: string;
  securityWarnings?: string[];
}

/**
 * Verify a credential by its ID
 * This performs comprehensive verification including:
 * - Existence check in Firebase
 * - Blockchain hash integrity verification
 * - Digital signature verification (if available)
 */
export async function verifyCredentialById(credentialId: string): Promise<VerificationResult> {
  const verificationId = 'VER-' + Date.now().toString(36).toUpperCase();
  const verificationDate = new Date().toISOString();
  
  try {
    console.log(`Starting verification for credential: ${credentialId}`);
    
    // Step 1: Check if credential exists in Firebase
    const credentialDoc = await getDoc(doc(firestore, 'credentials', credentialId));
    
    if (!credentialDoc.exists()) {
      return {
        valid: false,
        verificationDetails: {
          exists: false,
          signatureValid: false,
          integrityValid: false,
          blockchainValid: false,
          blockchainRegistered: false
        },
        error: 'Credential not found',
        verificationDate,
        verificationId
      };
    }

    const credential = { id: credentialDoc.id, ...credentialDoc.data() } as StudentCredential;
    console.log('Credential found:', credential.id);

    // Step 2: Perform blockchain verification
    const blockchainVerification = await verifyCredentialCompleteWithBlockchain(credential);
    console.log('Blockchain verification result:', blockchainVerification);

    // Step 3: Check for security warnings
    const securityWarnings: string[] = [];
    
    if (!credential.blockchainHash) {
      securityWarnings.push('Credential not registered on blockchain - cannot verify integrity');
    }
    
    if (!blockchainVerification.integrityValid) {
      securityWarnings.push('⚠️ SECURITY ALERT: Credential data has been tampered with!');
      securityWarnings.push('The current data does not match the blockchain hash');
    }
    
    if (!blockchainVerification.blockchainValid) {
      securityWarnings.push('❌ Blockchain verification failed');
      securityWarnings.push('Credential not found or invalid on blockchain network');
    }
    
    if (!blockchainVerification.signatureValid) {
      securityWarnings.push('Digital signature verification failed');
    }

    // Step 4: Determine overall validity
    const valid = blockchainVerification.isValid;

    return {
      valid,
      credential,
      verificationDetails: {
        exists: true,
        signatureValid: blockchainVerification.signatureValid,
        integrityValid: blockchainVerification.integrityValid,
        blockchainValid: blockchainVerification.blockchainValid,
        blockchainRegistered: blockchainVerification.blockchainRegistered
      },
      error: blockchainVerification.error,
      verificationDate,
      verificationId,
      securityWarnings: securityWarnings.length > 0 ? securityWarnings : undefined
    };

  } catch (error) {
    console.error('Verification error:', error);
    
    return {
      valid: false,
      verificationDetails: {
        exists: false,
        signatureValid: false,
        integrityValid: false,
        blockchainValid: false,
        blockchainRegistered: false
      },
      error: 'Verification process failed: ' + (error as Error).message,
      verificationDate,
      verificationId
    };
  }
}

/**
 * Verify credential from QR code data
 * QR codes should contain the credential ID
 */
export async function verifyCredentialFromQR(qrData: string): Promise<VerificationResult> {
  try {
    // Parse QR data - could be just ID or JSON with ID
    let credentialId: string;
    
    if (qrData.startsWith('{')) {
      const parsed = JSON.parse(qrData);
      credentialId = parsed.id || parsed.credentialId;
    } else {
      credentialId = qrData.trim();
    }
    
    if (!credentialId) {
      throw new Error('Invalid QR code - no credential ID found');
    }
    
    return await verifyCredentialById(credentialId);
  } catch (error) {
    return {
      valid: false,
      verificationDetails: {
        exists: false,
        signatureValid: false,
        integrityValid: false,
        blockchainValid: false,
        blockchainRegistered: false
      },
      error: 'Invalid QR code format: ' + (error as Error).message,
      verificationDate: new Date().toISOString(),
      verificationId: 'VER-' + Date.now().toString(36).toUpperCase()
    };
  }
}

/**
 * Get verification statistics for analytics
 */
export function getVerificationStats(result: VerificationResult) {
  return {
    credentialId: result.credential?.id,
    isValid: result.valid,
    hasSecurityWarnings: !!result.securityWarnings,
    verificationTime: result.verificationDate,
    verificationId: result.verificationId,
    checks: {
      existence: result.verificationDetails.exists,
      integrity: result.verificationDetails.integrityValid,
      signature: result.verificationDetails.signatureValid,
      blockchainValid: result.verificationDetails.blockchainValid,
      blockchainRegistered: result.verificationDetails.blockchainRegistered
    }
  };
}