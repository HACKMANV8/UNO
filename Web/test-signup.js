// Test script to create a pending recruiter for testing
// Run this in browser console after logging in as authority

const testSignup = async () => {
  console.log('Creating test recruiter signup...');
  
  try {
    // Import Firebase functions (if running in browser with Firebase loaded)
    const { createUserWithEmailAndPassword } = window.firebase.auth;
    const { doc, setDoc, serverTimestamp } = window.firebase.firestore;
    
    // Create test user
    const testUser = await createUserWithEmailAndPassword(
      firebase.auth(),
      'test.recruiter@company.com',
      'Test123456'
    );
    
    // Create user document
    await setDoc(doc(firebase.firestore(), 'users', testUser.user.uid), {
      uid: testUser.user.uid,
      email: 'test.recruiter@company.com',
      name: 'Test Recruiter',
      role: 'recruiter',
      status: 'pending',
      companyName: 'Test Company Inc',
      companySize: '100-500',
      industry: 'Technology',
      phone: '+91 9876543210',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Test recruiter created successfully!');
    console.log('Check your authority dashboard now.');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
};

// Instructions
console.log(`
🧪 TEST SIGNUP CREATION

Option 1: Run this script (if Firebase is loaded globally):
testSignup();

Option 2: Manual signup test:
1. Open a new incognito window
2. Go to your app signup page
3. Sign up as a recruiter
4. Check if it appears in authority dashboard

Option 3: Check Firestore directly:
1. Go to Firebase Console → Firestore
2. Look in 'users' collection
3. Look for documents with status: 'pending'
`);

// Export function for potential use
if (typeof module !== 'undefined') {
  module.exports = { testSignup };
}