// DEMO CRYPTOGRAPHY UTILITIES - NOT FOR PRODUCTION USE
// These functions use hardcoded demo keys for simulation purposes only

import * as jsrsasign from 'jsrsasign';

// DEMO KEYS - INSECURE - FOR DEMONSTRATION ONLY
const DEMO_PRIVATE_KEY = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIIGlRmgPs5lJnKhw4wVvzWvPCIJXKXJGJLXxLJPNMLSmoAoGCCqGSM49
AwEHoUQDQgAE7wnSPWE6JjfPZhIRLqCk+u4MmMt6oGMBaE9wVh+aLKSdE+Q8mXdH
3a7SkVMHGH3+VL8c1+C5O4XSxJLLmL4nXQ==
-----END EC PRIVATE KEY-----`;

const DEMO_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7wnSPWE6JjfPZhIRLqCk+u4MmMt6
oGMBaE9wVh+aLKSdE+Q8mXdH3a7SkVMHGH3+VL8c1+C5O4XSxJLLmL4nXQ==
-----END PUBLIC KEY-----`;

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: Record<string, any>;
  proof?: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

/**
 * Signs a Verifiable Credential using DEMO ECDSA key
 * WARNING: Uses hardcoded demo keys - NOT SECURE for production
 */
export function signVC(vcData: Omit<VerifiableCredential, 'proof'>): VerifiableCredential {
  try {
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
    sig.init(DEMO_PRIVATE_KEY);
    
    const dataToSign = JSON.stringify(vcData);
    sig.updateString(dataToSign);
    const signatureHex = sig.sign();
    
    // Convert to JWS format (simplified demo)
    const jws = jsrsasign.hextob64(signatureHex);

    const signedVC: VerifiableCredential = {
      ...vcData,
      proof: {
        type: 'EcdsaSecp256k1Signature2019',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:example:issuer#key-1',
        jws: jws,
      },
    };

    return signedVC;
  } catch (error) {
    console.error('Error signing VC:', error);
    throw new Error('Failed to sign credential');
  }
}

/**
 * Verifies a signed Verifiable Credential using DEMO ECDSA public key
 * WARNING: Uses hardcoded demo keys - NOT SECURE for production
 */
export function verifyVCSignature(signedVC: VerifiableCredential): boolean {
  try {
    if (!signedVC.proof || !signedVC.proof.jws) {
      return false;
    }

    const { proof, ...vcData } = signedVC;
    const dataToVerify = JSON.stringify(vcData);
    
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
    sig.init(DEMO_PUBLIC_KEY);
    sig.updateString(dataToVerify);
    
    const signatureHex = jsrsasign.b64tohex(proof.jws);
    const isValid = sig.verify(signatureHex);

    return isValid;
  } catch (error) {
    console.error('Error verifying VC:', error);
    return false;
  }
}

/**
 * Generates a demo DID (Decentralized Identifier)
 */
export function generateDemoDID(type: 'user' | 'issuer' = 'user'): string {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `did:kriti:${type}:${randomId}`;
}
