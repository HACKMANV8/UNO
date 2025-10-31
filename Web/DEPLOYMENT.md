# 🚀 Kriti HireForge Deployment Guide

## Overview
Kriti HireForge is a blockchain-powered credential verification platform that enables secure, tamper-proof digital credentials for students, educational institutions, and recruiters.

## 🏗️ Architecture

### Core Components
- **Frontend**: React + TypeScript + Vite
- **Authentication**: Firebase Auth with role-based access control
- **Database**: Firebase Firestore
- **Blockchain**: Polygon Amoy Testnet for credential verification
- **Smart Contract**: Custom DID Registry for credential management

### User Roles
1. **Students**: Register, receive credentials, manage profile
2. **Issuers (Admin/Staff)**: Issue verified credentials to students
3. **Recruiters**: Search and verify candidate credentials
4. **Authority**: Approve issuer and recruiter registrations

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Firebase project with Authentication, Firestore, and Storage enabled
- MetaMask wallet with Polygon Amoy MATIC tokens
- Git for version control

### 1. Clone and Install
```bash
git clone <your-repository-url>
cd kriti-hire-forge
npm install
```

### 2. Firebase Setup
1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password
3. Enable Firestore Database in production mode
4. Enable Firebase Storage
5. Get your Firebase configuration from Project Settings

### 3. Environment Configuration
```bash
cp .env.example .env
```

Fill in your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        resource.data.role in ['authority', 'issuer_admin', 'recruiter'];
    }
    
    // Credentials collection
    match /credentials/{credentialId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['issuer_admin', 'issuer_staff'];
    }
    
    // Applicants collection
    match /applicants/{applicantId} {
      allow read, write: if request.auth != null && 
        resource.data.recruiterUid == request.auth.uid;
    }
  }
}
```

### 5. Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /credentials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['issuer_admin', 'issuer_staff'];
    }
    
    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Blockchain Setup

#### Get Polygon Amoy MATIC
1. Visit https://faucet.polygon.technology/
2. Select Polygon Amoy Testnet
3. Enter your wallet address
4. Request test MATIC tokens

#### Deploy Smart Contract
```bash
# Set your private key in .env
PRIVATE_KEY=your_wallet_private_key

# Deploy the DID Registry contract
npm run deploy:contract
```

#### Update Contract Address
After deployment, update `.env` with the contract address:
```env
VITE_DID_REGISTRY_CONTRACT_ADDRESS=0x...
```

### 7. Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security Considerations

### Firebase Security
- Use Firebase Security Rules to restrict data access
- Enable App Check for additional security
- Regularly audit user permissions

### Blockchain Security
- Store private keys securely (never commit to version control)
- Use hardware wallets for production deployments
- Implement proper access controls in smart contracts

### Data Privacy
- Hash sensitive data before storing
- Use IPFS for large files (optional)
- Implement proper consent mechanisms

## 📋 User Workflows

### Student Registration Flow
1. Student signs up with email/password
2. OTP verification via Firebase Auth
3. Automatic KT ID generation (e.g., KT12345678)
4. Profile completion
5. Ready to receive credentials

### Issuer Registration Flow
1. Issuer signs up with institution details
2. Authority reviews and approves
3. Issuer selects credential types they can issue
4. Ready to issue credentials

### Recruiter Registration Flow
1. Recruiter signs up with company details
2. Authority reviews and approves
3. Ready to search and verify candidates

### Credential Issuance Flow
1. Issuer searches for student by KT ID
2. Fills credential form (dynamic based on type)
3. System generates blockchain hash
4. Credential stored in Firestore + blockchain

### Verification Flow
1. Recruiter searches candidate by KT ID
2. Views all credentials
3. Clicks "Verify" to check blockchain authenticity
4. Can add candidate to applicant pipeline

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### Environment Variables for Production
```env
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://your-api.com
```

## 📊 Monitoring & Analytics

### Firebase Analytics
Enable Firebase Analytics in your project for user engagement tracking.

### Error Monitoring
Integrate Sentry for production error tracking:
```bash
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
Use Firebase Performance Monitoring and Web Vitals.

## 🔧 Troubleshooting

### Common Issues

#### Firebase Connection Issues
- Verify API keys and project configuration
- Check Firebase project status
- Ensure billing is enabled for production usage

#### Blockchain Connection Issues
- Verify RPC URL and chain ID
- Check wallet balance for gas fees
- Ensure contract address is correct

#### Build Issues
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

### Debug Mode
Enable debug mode in development:
```env
VITE_DEBUG_MODE=true
```

## 📚 API Reference

### Firebase Collections

#### users
```typescript
{
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'issuer_admin' | 'issuer_staff' | 'recruiter' | 'authority';
  kritiId?: string; // Only for students
  status: 'pending' | 'approved' | 'rejected';
  // Role-specific fields...
}
```

#### credentials
```typescript
{
  id: string;
  studentKritiId: string;
  issuerUid: string;
  credentialType: 'degree' | 'certificate' | 'diploma' | 'skill' | 'experience';
  credentialData: object;
  blockchainHash?: string;
  verified: boolean;
  issuedDate: Timestamp;
}
```

#### applicants
```typescript
{
  id: string;
  recruiterUid: string;
  studentKritiId: string;
  status: 'applied' | 'reviewed' | 'interviewed' | 'hired' | 'rejected' | 'waitlisted';
  position: string;
  notes?: string;
  updatedAt: Timestamp;
}
```

## 🎯 Features

### ✅ Completed Features
- Role-based authentication system
- Dynamic user registration flows
- Authority approval workflows
- Student dashboard with credential display
- Issuer credential management system
- Recruiter verification with applicant tracking
- Blockchain integration setup
- Firebase security implementation

### 🚧 Pending Features
- Smart contract deployment to testnet
- End-to-end blockchain verification
- Email notification system
- Advanced analytics dashboard
- Mobile responsive improvements
- Batch credential operations

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section
2. Review Firebase and Polygon documentation
3. Open an issue in the repository
4. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Coding! 🚀**