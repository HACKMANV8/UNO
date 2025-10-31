// Background script for Chrome Extension

console.log('Kriti Auto-Fill background script loaded');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA732yl1kXSJxa9RSlOSD9BVlKzthnJjY",
  authDomain: "kriti-e1b44.firebaseapp.com",
  projectId: "kriti-e1b44",
  storageBucket: "kriti-e1b44.firebasestorage.app",
  messagingSenderId: "3515192721",
  appId: "1:3515192721:web:b36471d4ae4841e9e7b630",
  measurementId: "G-5G4L6PTXQ4"
};

// Firebase REST API implementation for Chrome Extension
class FirebaseAuth {
  constructor(config) {
    this.config = config;
    this.baseUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;
  }

  async signInWithEmailAndPassword(email, password) {
    const url = `${this.baseUrl}:signInWithPassword?key=${this.config.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Authentication failed');
    }

    const data = await response.json();
    return {
      user: {
        uid: data.localId,
        email: data.email,
        emailVerified: data.emailVerified === 'true'
      },
      idToken: data.idToken,
      refreshToken: data.refreshToken
    };
  }
}

class FirebaseFirestore {
  constructor(config) {
    this.config = config;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
  }

  async getDocument(collection, docId, idToken) {
    const url = `${this.baseUrl}/${collection}/${docId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { exists: false };
      }
      throw new Error('Failed to fetch document');
    }

    const data = await response.json();
    return {
      exists: true,
      data: () => this.parseFirestoreDocument(data.fields || {})
    };
  }

  parseFirestoreDocument(fields) {
    const result = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value.stringValue !== undefined) {
        result[key] = value.stringValue;
      } else if (value.integerValue !== undefined) {
        result[key] = parseInt(value.integerValue);
      } else if (value.booleanValue !== undefined) {
        result[key] = value.booleanValue;
      } else if (value.timestampValue !== undefined) {
        result[key] = new Date(value.timestampValue);
      } else if (value.arrayValue !== undefined) {
        result[key] = value.arrayValue.values?.map(v => this.parseFirestoreValue(v)) || [];
      } else if (value.mapValue !== undefined) {
        result[key] = this.parseFirestoreDocument(value.mapValue.fields || {});
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  parseFirestoreValue(value) {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return parseInt(value.integerValue);
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.timestampValue !== undefined) return new Date(value.timestampValue);
    if (value.mapValue !== undefined) return this.parseFirestoreDocument(value.mapValue.fields || {});
    return value;
  }
}

// Initialize Firebase services
const auth = new FirebaseAuth(firebaseConfig);
const firestore = new FirebaseFirestore(firebaseConfig);

console.log('Firebase services initialized');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Kriti Job Auto-Fill Extension installed');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    handleLogin(request.email, request.password, sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === 'refreshUserData') {
    handleRefreshUserData(sendResponse);
    return true; // Will respond asynchronously
  }
});

async function handleLogin(email, password, sendResponse) {
  console.log('Attempting login for:', email);
  
  try {
    // Sign in with Firebase REST API
    const authResult = await auth.signInWithEmailAndPassword(email, password);
    const user = authResult.user;
    const idToken = authResult.idToken;

    console.log('Authentication successful for user:', user.uid);

    // Fetch user data from Firestore
    const userDoc = await firestore.getDocument('users', user.uid, idToken);

    if (!userDoc.exists) {
      console.log('User profile not found for:', user.uid);
      sendResponse({
        success: false,
        error: 'User profile not found'
      });
      return;
    }

    const userData = userDoc.data();
    console.log('User data fetched successfully');
    
    // Also fetch resume data if it exists
    let resumeData = null;
    try {
      const resumeDoc = await firestore.getDocument('resumes', user.uid, idToken);
      if (resumeDoc.exists) {
        resumeData = resumeDoc.data();
        console.log('Resume data fetched successfully');
      }
    } catch (error) {
      console.log('No resume data found:', error);
    }

    // Store user data in extension storage
    const storageData = {
      kritiUser: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      kritiUserData: userData,
      kritiResumeData: resumeData,
      kritiIdToken: idToken,
      kritiRefreshToken: authResult.refreshToken,
      loginTime: Date.now()
    };

    await chrome.storage.local.set(storageData);
    console.log('User data stored in extension storage');

    sendResponse({
      success: true,
      user: storageData.kritiUser,
      userData: userData,
      resumeData: resumeData
    });

  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed';
    const errorMsg = error.message?.toLowerCase() || '';
    
    if (errorMsg.includes('email_not_found')) {
      errorMessage = 'User not found. Please check your email.';
    } else if (errorMsg.includes('invalid_password')) {
      errorMessage = 'Incorrect password.';
    } else if (errorMsg.includes('invalid_email')) {
      errorMessage = 'Invalid email address.';
    } else if (errorMsg.includes('user_disabled')) {
      errorMessage = 'Account has been disabled.';
    } else if (errorMsg.includes('too_many_attempts')) {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (errorMsg.includes('network')) {
      errorMessage = 'Network error. Please check your connection.';
    }

    sendResponse({
      success: false,
      error: errorMessage
    });
  }
}

async function handleRefreshUserData(sendResponse) {
  try {
    const stored = await chrome.storage.local.get(['kritiUser', 'kritiIdToken']);
    if (!stored.kritiUser || !stored.kritiIdToken) {
      sendResponse({ success: false, error: 'Not logged in' });
      return;
    }

    // Fetch fresh user data
    const userDoc = await firestore.getDocument('users', stored.kritiUser.uid, stored.kritiIdToken);

    if (!userDoc.exists) {
      sendResponse({ success: false, error: 'User data not found' });
      return;
    }

    const userData = userDoc.data();

    // Fetch fresh resume data
    let resumeData = null;
    try {
      const resumeDoc = await firestore.getDocument('resumes', stored.kritiUser.uid, stored.kritiIdToken);
      if (resumeDoc.exists) {
        resumeData = resumeDoc.data();
      }
    } catch (error) {
      console.log('No resume data found:', error);
    }

    // Update storage
    await chrome.storage.local.set({
      kritiUserData: userData,
      kritiResumeData: resumeData
    });

    sendResponse({ success: true });

  } catch (error) {
    console.error('Refresh error:', error);
    sendResponse({ success: false, error: 'Failed to refresh data' });
  }
}