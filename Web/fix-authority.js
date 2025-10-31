// Run this in your browser console on Firebase Console
// Navigate to: https://console.firebase.google.com/project/kriti-e1b44/firestore

console.log(`
🔧 AUTHORITY USER FIX INSTRUCTIONS:

1. Go to Firebase Console → Firestore Database
2. Click on 'users' collection
3. Find the document with email: "authority@kriti.gov.in"
4. Make sure it has these EXACT fields:

REQUIRED FIELDS:
✅ uid: "your-user-uid"
✅ email: "authority@kriti.gov.in"
✅ name: "Kriti Authority Admin"
✅ role: "authority"
✅ status: "approved"  ← THIS IS THE CRITICAL FIELD!
✅ phone: "+91 98765 43210"

OPTIONAL FIELDS:
- employeeId: "KRT-AUTH-001"
- department: "Digital Credentials Division"
- designation: "Chief Authorization Officer"
- createdAt: (timestamp)
- updatedAt: (timestamp)

❌ REMOVE THESE FIELDS IF THEY EXIST:
- authorizationStatus (wrong field name)
- approvalStatus (wrong field name)

After fixing, try logging in again!
`);

// If you want to check current user data, paste your user UID here:
const checkUserUID = "PASTE_YOUR_USER_UID_HERE";
console.log("To check user data, replace PASTE_YOUR_USER_UID_HERE with actual UID");