// MOCK API SERVICE - Simulates backend API calls
// All functions simulate network delays and return mock data

import { VerifiableCredential, signVC, generateDemoDID } from '@/lib/crypto';

const API_DELAY = 800; // Simulate network delay

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, API_DELAY));

// Mock credentials database
const mockCredentials: VerifiableCredential[] = [];

/**
 * Fetch user's credentials
 */
export async function fetchCredentials(userId: string): Promise<VerifiableCredential[]> {
  await mockDelay();
  
  // Generate some mock credentials for demo
  if (mockCredentials.length === 0) {
    const mockVC1: Omit<VerifiableCredential, 'proof'> = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'EducationCredential'],
      issuer: generateDemoDID('issuer'),
      issuanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      credentialSubject: {
        id: generateDemoDID('user'),
        degree: 'Bachelor of Technology',
        major: 'Computer Science',
        university: 'Indian Institute of Technology, Delhi',
        graduationYear: 2023,
        cgpa: 8.5,
      },
    };

    const mockVC2: Omit<VerifiableCredential, 'proof'> = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'SkillCredential'],
      issuer: generateDemoDID('issuer'),
      issuanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      credentialSubject: {
        id: generateDemoDID('user'),
        skill: 'Full Stack Development',
        level: 'Advanced',
        certifiedBy: 'Coursera',
        completionDate: '2024-01',
      },
    };

    mockCredentials.push(signVC(mockVC1), signVC(mockVC2));
  }

  return mockCredentials;
}

/**
 * Issue a new credential
 */
export async function issueCredential(
  vcData: Omit<VerifiableCredential, 'proof'>
): Promise<VerifiableCredential> {
  await mockDelay();

  const signedVC = signVC(vcData);
  mockCredentials.push(signedVC);

  return signedVC;
}

/**
 * Verify a credential by Kriti ID
 */
export async function requestVerification(kritiId: string): Promise<{
  success: boolean;
  credentials?: VerifiableCredential[];
  error?: string;
}> {
  await mockDelay();

  // Simulate consent check
  const consentGranted = Math.random() > 0.2; // 80% success rate

  if (!consentGranted) {
    return {
      success: false,
      error: 'User denied consent to share credentials',
    };
  }

  // Return mock credentials
  return {
    success: true,
    credentials: mockCredentials,
  };
}

/**
 * Simulate AI Resume Builder
 */
export async function callResumeAI(userInfo: Record<string, any>): Promise<string> {
  await mockDelay();

  return `# Professional Resume

**${userInfo.name || 'Your Name'}**
${userInfo.email || 'your.email@example.com'}

## Summary
Experienced professional with verified credentials from leading institutions. Skilled in multiple domains with proven track record.

## Education
- Bachelor of Technology in Computer Science
- Indian Institute of Technology, Delhi
- CGPA: 8.5/10.0

## Skills
- Full Stack Development (Advanced)
- Cloud Computing
- Machine Learning
- Project Management

## Certifications
- Full Stack Development Certificate - Coursera
- AWS Solutions Architect

*Generated with Kriti AI Resume Builder*`;
}

/**
 * Simulate AI Interview Prep
 */
export async function callInterviewAI(topic: string): Promise<{
  questions: string[];
  tips: string[];
}> {
  await mockDelay();

  return {
    questions: [
      `Tell me about a challenging ${topic} project you've worked on.`,
      `How do you stay updated with the latest ${topic} trends?`,
      `Explain a complex ${topic} concept to a non-technical person.`,
      `What's your approach to debugging ${topic} issues?`,
      `How do you ensure code quality in ${topic} development?`,
    ],
    tips: [
      'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
      'Reference your verified credentials when discussing qualifications',
      'Be specific with examples and quantify your achievements',
      'Show enthusiasm for continuous learning',
      'Ask thoughtful questions about the role and company',
    ],
  };
}

/**
 * Revoke a credential (Admin only)
 */
export async function revokeCredential(credentialId: string): Promise<void> {
  await mockDelay();
  // Mock implementation
  console.log('Credential revoked:', credentialId);
}

/**
 * Manage issuer staff (Admin only)
 */
export async function manageStaff(action: 'add' | 'remove', staffEmail: string): Promise<void> {
  await mockDelay();
  // Mock implementation
  console.log(`Staff ${action}:`, staffEmail);
}
