import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../config/firebase';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Shield, User, CheckCircle } from 'lucide-react';

export default function CreateAuthorityUser() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAuthorityUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'authority@kriti.gov.in',
        'Authority@123'
      );

      const user = userCredential.user;
      console.log('✅ User created in Authentication:', user.uid);

      // Add user document to Firestore with CORRECT field names
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: 'authority@kriti.gov.in',
        name: 'Kriti Authority Admin',
        role: 'authority',
        status: 'approved', // ← THIS IS THE CORRECT FIELD NAME!
        phone: '+91 98765 43210',
        employeeId: 'KRT-AUTH-001',
        department: 'Digital Credentials Division',
        designation: 'Chief Authorization Officer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User document created in Firestore');
      setSuccess(true);
      
      // Auto-logout to allow fresh login
      await auth.signOut();
      
    } catch (error: any) {
      console.error('❌ Error creating authority user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Authority user already exists. Try logging in with: authority@kriti.gov.in');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="fixed top-4 right-4 w-80 bg-accent/5 border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-accent">
            <CheckCircle className="h-5 w-5" />
            <span>Authority Created!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> authority@kriti.gov.in</p>
            <p><strong>Password:</strong> Authority@123</p>
            <p><strong>Role:</strong> Authority</p>
          </div>
          <div className="bg-accent/10 p-2 rounded text-xs text-accent">
            ✅ You can now login with these credentials!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Create Authority User</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <p className="text-sm">{error}</p>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>This will create an authority user with:</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Email: authority@kriti.gov.in</li>
            <li>• Password: Authority@123</li>
            <li>• Role: Authority</li>
            <li>• Status: Approved (can login immediately)</li>
          </ul>
        </div>

        <Button
          onClick={createAuthorityUser}
          disabled={loading}
          className="w-full"
          variant="default"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Create Authority User
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}