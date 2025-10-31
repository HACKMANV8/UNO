/**
 * Security Testing Script
 * 
 * This script demonstrates how the new verification system detects tampered credentials
 */

import { hashCredentialData, verifyCredentialIntegrity } from '../src/services/blockchain';

// Example original credential data
const originalCredential = {
  studentKritiId: "KRITI-2024-001",
  issuerUid: "issuer123",
  issuerName: "VTU University",
  credentialType: "degree",
  credentialData: {
    degree: "Bachelor of Engineering",
    stream: "Computer Science",
    cgpa: "8.5",
    yearOfPassing: "2024"
  },
  verified: true
};

// Example tampered credential data (someone changed CGPA)
const tamperedCredential = {
  studentKritiId: "KRITI-2024-001",
  issuerUid: "issuer123",
  issuerName: "VTU University",
  credentialType: "degree",
  credentialData: {
    degree: "Bachelor of Engineering",
    stream: "Computer Science",
    cgpa: "9.8", // ⚠️ TAMPERED: Changed from 8.5 to 9.8
    yearOfPassing: "2024"
  },
  verified: true
};

console.log('🔒 Security Testing - Blockchain Verification');
console.log('==============================================\n');

// Generate hash for original credential
const originalHash = hashCredentialData(originalCredential);
console.log('✅ Original credential hash:', originalHash);

// Test verification with original data
const originalIsValid = verifyCredentialIntegrity(originalCredential, originalHash);
console.log('✅ Original credential verification:', originalIsValid ? 'VALID' : 'INVALID');

// Test verification with tampered data
const tamperedIsValid = verifyCredentialIntegrity(tamperedCredential, originalHash);
console.log('🚨 Tampered credential verification:', tamperedIsValid ? 'VALID' : 'INVALID');

console.log('\n📊 Security Test Results:');
console.log('--------------------------');
console.log(`Original Data: ${originalIsValid ? '✅ VERIFIED' : '❌ FAILED'}`);
console.log(`Tampered Data: ${tamperedIsValid ? '❌ SECURITY BREACH!' : '🛡️ TAMPERING DETECTED'}`);

if (!tamperedIsValid) {
  console.log('\n🎉 SUCCESS: The blockchain verification system successfully detected data tampering!');
  console.log('   Even if someone modifies data in Firebase, the verification will fail.');
} else {
  console.log('\n🚨 FAILURE: Security vulnerability detected! The system did not catch tampering.');
}

export { originalCredential, tamperedCredential, originalHash };