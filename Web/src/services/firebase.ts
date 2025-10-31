import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { hashCredentialData, issueCredentialOnBlockchain } from './blockchain';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

// Types
export type UserRole = 'student' | 'issuer_staff' | 'issuer_admin' | 'recruiter' | 'authority';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'deleted';
export type CredentialType = 'degree' | 'certificate' | 'diploma' | 'skill' | 'experience';

export interface KritiUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  kritiId?: string; // Only for students (KT prefix)
  phone?: string;
  aadhaarNumber?: string;
  status: ApplicationStatus;
  createdAt: any;
  updatedAt: any;
  isActive?: boolean; // For staff management
  
  // Role-specific fields
  // For issuers
  institutionName?: string;
  institutionType?: string;
  allowedCredentialTypes?: CredentialType[];
  
  // For issuer staff
  employeeId?: string;
  department?: string;
  designation?: string;
  parentAdminUid?: string; // Track which admin created this staff
  
  // For recruiters
  companyName?: string;
  companySize?: string;
  industry?: string;
}

export interface StudentCredential {
  id: string;
  studentKritiId: string;
  issuerUid: string;
  issuerName: string;
  credentialType: CredentialType;
  credentialData: any;
  issuedDate: any;
  expiryDate?: any;
  blockchainHash?: string;
  signature?: string;
  verified: boolean;
}

export interface ApplicantStatus {
  id: string;
  recruiterUid: string;
  studentKritiId: string;
  status: 'applied' | 'reviewed' | 'interviewed' | 'hired' | 'rejected' | 'waitlisted';
  position: string;
  notes?: string;
  updatedAt: any;
}

// Auth functions
export const signUp = async (email: string, password: string, userData: Partial<KritiUser>) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: userData.name });

    // Generate KT ID for students (simple generation without uniqueness check during signup)
    let kritiId = '';
    if (userData.role === 'student') {
      // Generate KT ID format: KT + 8 random characters + timestamp suffix for uniqueness
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timeSuffix = Date.now().toString().slice(-4);
      kritiId = `KT${randomPart}${timeSuffix}`;
    }

    // Create user document in Firestore
    const userDoc: KritiUser = {
      uid: user.uid,
      email: user.email!,
      name: userData.name!,
      role: userData.role!,
      kritiId,
      phone: userData.phone || '',
      aadhaarNumber: userData.aadhaarNumber || '',
      status: userData.role === 'student' ? 'approved' : 'pending', // Students auto-approved, others need approval
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Include only valid KritiUser fields from userData
      ...(userData.institutionName && { institutionName: userData.institutionName }),
      ...(userData.institutionType && { institutionType: userData.institutionType }),
      ...(userData.department && { department: userData.department }),
      ...(userData.companyName && { companyName: userData.companyName }),
      ...(userData.companySize && { companySize: userData.companySize }),
      ...(userData.industry && { industry: userData.industry }),
    };

    await setDoc(doc(firestore, 'users', user.uid), userDoc);

    // Send email verification
    await sendEmailVerification(user);

    return { user, kritiId };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data() as KritiUser;

    // Check if user is approved (except students who are auto-approved)
    if (userData.status !== 'approved') {
      throw new Error('Account pending approval');
    }

    return { user, userData };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// User management functions
export const getUserData = async (uid: string): Promise<KritiUser | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as KritiUser) : null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

export const updateUserStatus = async (uid: string, status: ApplicationStatus, allowedCredentialTypes?: CredentialType[]) => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (allowedCredentialTypes) {
      updateData.allowedCredentialTypes = allowedCredentialTypes;
    }

    await updateDoc(doc(firestore, 'users', uid), updateData);
  } catch (error) {
    console.error('Update user status error:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, profileData: Partial<Pick<KritiUser, 'name' | 'phone' | 'aadhaarNumber'>>) => {
  try {
    const updateData: any = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(firestore, 'users', uid), updateData);
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

export const getPendingUsers = async (role?: UserRole): Promise<KritiUser[]> => {
  try {
    console.log('Getting pending users for role:', role);
    
    // Simple query without orderBy to avoid composite index requirement
    let q;
    if (role) {
      q = query(
        collection(firestore, 'users'),
        where('status', '==', 'pending'),
        where('role', '==', role)
      );
    } else {
      q = query(
        collection(firestore, 'users'),
        where('status', '==', 'pending')
      );
    }

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data() as KritiUser;
      return {
        ...data,
        uid: doc.id // Ensure uid is set
      };
    });
    
    console.log(`Found ${users.length} pending users for role ${role}:`, users);
    
    // Sort manually by createdAt (client-side sorting)
    return users.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime(); // Newest first
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    return [];
  }
};

// Generate unique KT ID for students
const generateUniqueKritiId = async (): Promise<string> => {
  let isUnique = false;
  let kritiId = '';

  while (!isUnique) {
    // Generate KT ID format: KT + 8 random characters
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    kritiId = `KT${randomPart}`;

    // Check if this ID already exists
    const q = query(
      collection(firestore, 'users'),
      where('kritiId', '==', kritiId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    isUnique = querySnapshot.empty;
  }

  return kritiId;
};

// Credential management functions
export const issueCredential = async (credentialData: Omit<StudentCredential, 'id' | 'issuedDate'>) => {
  try {
    // Create the credential with timestamp
    const credentialWithTimestamp: Omit<StudentCredential, 'id'> = {
      ...credentialData,
      issuedDate: serverTimestamp(),
    };

    // Generate blockchain hash for integrity verification
    const blockchainHash = hashCredentialData(credentialWithTimestamp);
    
    // Add the hash to the credential
    const credential: Omit<StudentCredential, 'id'> = {
      ...credentialWithTimestamp,
      blockchainHash,
      verified: true, // Set as verified since we're generating the hash
    };

    // Save to Firebase first
    const docRef = await addDoc(collection(firestore, 'credentials'), credential);
    
    console.log('Credential issued with blockchain hash:', {
      id: docRef.id,
      hash: blockchainHash
    });

    // Optional: Register on blockchain (in production, you'd want proper error handling)
    try {
      const studentDID = `did:kriti:student:${credentialData.studentKritiId}`;
      const issuerDID = `did:kriti:issuer:${credentialData.issuerUid}`;
      
      const txHash = await issueCredentialOnBlockchain(
        docRef.id,
        studentDID,
        issuerDID,
        blockchainHash,
        credentialData.credentialType,
        '' // IPFS hash - can be added later
      );
      
      console.log('Credential registered on blockchain:', txHash);
      
      // Update credential with blockchain transaction hash
      await updateDoc(doc(firestore, 'credentials', docRef.id), {
        blockchainTxHash: txHash
      });
    } catch (blockchainError) {
      console.warn('Failed to register on blockchain (credential still valid locally):', blockchainError);
      // Don't fail the entire operation if blockchain registration fails
      // In production, you might want to queue this for retry
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Issue credential error:', error);
    throw error;
  }
};

export const getStudentCredentials = async (kritiId: string): Promise<StudentCredential[]> => {
  try {
    const q = query(
      collection(firestore, 'credentials'),
      where('studentKritiId', '==', kritiId)
    );

    const querySnapshot = await getDocs(q);
    const credentials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudentCredential));
    
    // Sort by issuedDate in memory instead of using Firestore orderBy
    return credentials.sort((a, b) => {
      const dateA = a.issuedDate?.toDate ? a.issuedDate.toDate() : new Date(a.issuedDate);
      const dateB = b.issuedDate?.toDate ? b.issuedDate.toDate() : new Date(b.issuedDate);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });
  } catch (error) {
    console.error('Get student credentials error:', error);
    return [];
  }
};

export const getStudentByKritiId = async (kritiId: string): Promise<KritiUser | null> => {
  try {
    const q = query(
      collection(firestore, 'users'),
      where('kritiId', '==', kritiId),
      where('role', '==', 'student'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as KritiUser);
  } catch (error) {
    console.error('Get student by Kriti ID error:', error);
    return null;
  }
};

export const getIssuerCredentials = async (issuerUid: string): Promise<StudentCredential[]> => {
  try {
    const q = query(
      collection(firestore, 'credentials'),
      where('issuerUid', '==', issuerUid)
    );

    const querySnapshot = await getDocs(q);
    const credentials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudentCredential));
    
    // Sort by issuedDate in memory (newest first)
    return credentials.sort((a, b) => {
      const dateA = a.issuedDate?.toDate ? a.issuedDate.toDate() : new Date(a.issuedDate);
      const dateB = b.issuedDate?.toDate ? b.issuedDate.toDate() : new Date(b.issuedDate);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Get issuer credentials error:', error);
    return [];
  }
};

// Applicant management functions
export const updateApplicantStatus = async (
  recruiterUid: string,
  studentKritiId: string,
  status: ApplicantStatus['status'],
  position: string,
  notes?: string
) => {
  try {
    const applicantData: Omit<ApplicantStatus, 'id'> = {
      recruiterUid,
      studentKritiId,
      status,
      position,
      updatedAt: serverTimestamp(),
      // Only include notes if it's not undefined
      ...(notes !== undefined && { notes }),
    };

    // Check if record exists
    const q = query(
      collection(firestore, 'applicants'),
      where('recruiterUid', '==', recruiterUid),
      where('studentKritiId', '==', studentKritiId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create new record
      await addDoc(collection(firestore, 'applicants'), applicantData);
    } else {
      // Update existing record
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, applicantData);
    }
  } catch (error) {
    console.error('Update applicant status error:', error);
    throw error;
  }
};

export const getApplicantsByRecruiter = async (recruiterUid: string): Promise<ApplicantStatus[]> => {
  try {
    const q = query(
      collection(firestore, 'applicants'),
      where('recruiterUid', '==', recruiterUid),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ApplicantStatus));
  } catch (error) {
    console.error('Get applicants by recruiter error:', error);
    return [];
  }
};

// Staff management functions for Issuer Admins
export const createIssuerStaff = async (
  adminUid: string,
  staffData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    employeeId?: string;
    department?: string;
    designation?: string;
  }
) => {
  try {
    // Get admin data to inherit institution info
    const adminDoc = await getDoc(doc(firestore, 'users', adminUid));
    if (!adminDoc.exists()) {
      throw new Error('Admin user not found');
    }
    
    const adminData = adminDoc.data() as KritiUser;
    if (adminData.role !== 'issuer_admin') {
      throw new Error('Only issuer admins can create staff accounts');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, staffData.email, staffData.password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: staffData.name });

    // Create user document in Firestore
    const userDoc: KritiUser = {
      uid: user.uid,
      email: user.email!,
      name: staffData.name,
      role: 'issuer_staff',
      status: 'approved', // Staff are auto-approved
      phone: staffData.phone || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Inherit institution info from admin
      institutionName: adminData.institutionName,
      institutionType: adminData.institutionType,
      allowedCredentialTypes: adminData.allowedCredentialTypes,
      
      // Staff-specific fields
      employeeId: staffData.employeeId || '',
      department: staffData.department || '',
      designation: staffData.designation || 'Credential Officer',
      parentAdminUid: adminUid, // Track which admin created this staff
    };

    await setDoc(doc(firestore, 'users', user.uid), userDoc);

    // Send email verification
    await sendEmailVerification(user);

    return { user, userData: userDoc };
  } catch (error) {
    console.error('Create issuer staff error:', error);
    throw error;
  }
};

export const getIssuerStaffByAdmin = async (adminUid: string): Promise<KritiUser[]> => {
  try {
    const q = query(
      collection(firestore, 'users'),
      where('role', '==', 'issuer_staff'),
      where('parentAdminUid', '==', adminUid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as KritiUser;
      return {
        ...data,
        uid: doc.id
      };
    });
  } catch (error) {
    console.error('Get issuer staff error:', error);
    return [];
  }
};

export const updateStaffStatus = async (staffUid: string, isActive: boolean) => {
  try {
    await updateDoc(doc(firestore, 'users', staffUid), {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Update staff status error:', error);
    throw error;
  }
};

export const deleteIssuerStaff = async (adminUid: string, staffUid: string) => {
  try {
    // Verify admin permission
    const staffDoc = await getDoc(doc(firestore, 'users', staffUid));
    if (!staffDoc.exists()) {
      throw new Error('Staff user not found');
    }

    const staffData = staffDoc.data() as KritiUser;
    if (staffData.parentAdminUid !== adminUid) {
      throw new Error('You can only delete staff you created');
    }

    // Soft delete - mark as inactive instead of actual deletion
    await updateDoc(doc(firestore, 'users', staffUid), {
      isActive: false,
      status: 'deleted',
      updatedAt: serverTimestamp()
    });

    // Note: We don't delete from Firebase Auth to preserve audit trail
    // In production, you might want to disable the auth account
  } catch (error) {
    console.error('Delete issuer staff error:', error);
    throw error;
  }
};