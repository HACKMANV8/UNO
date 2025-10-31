import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  signUp as firebaseSignUp, 
  signIn as firebaseSignIn, 
  logOut as firebaseLogOut,
  getUserData,
  KritiUser,
  UserRole,
  ApplicationStatus
} from '../services/firebase';

interface AuthState {
  user: KritiUser | null;
  firebaseUser: FirebaseUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    aadhaarNumber?: string;
    institutionName?: string;
    institutionType?: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
    allowedCredentialTypes?: import('../services/firebase').CredentialType[];
  }) => Promise<{ user: FirebaseUser; kritiId: string }>;
  logout: () => Promise<void>;
  setUser: (user: KritiUser | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoggedIn: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user: firebaseUser, userData } = await firebaseSignIn(email, password);
          
          console.log('Login successful - userData:', userData);
          console.log('Login successful - user role:', userData?.role);
          
          set({ 
            user: userData,
            firebaseUser,
            isLoggedIn: true,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.message === 'Account pending approval') {
            errorMessage = 'Your account is pending approval. Please wait for admin approval.';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'User not found. Please check your email address.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid password. Please try again.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
          }
          
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await firebaseSignUp(userData.email, userData.password, userData);
          
          set({ 
            firebaseUser: result.user,
            isLoading: false 
          });
          
          return result;
        } catch (error: any) {
          console.error('Signup error:', error);
          let errorMessage = 'Signup failed. Please try again.';
          
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email address is already in use.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
          }
          
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await firebaseLogOut();
          set({ 
            user: null,
            firebaseUser: null,
            isLoggedIn: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          set({ isLoading: true });
          
          if (firebaseUser) {
            try {
              const userData = await getUserData(firebaseUser.uid);
              if (userData && userData.status === 'approved') {
                set({ 
                  user: userData,
                  firebaseUser,
                  isLoggedIn: true,
                  isInitialized: true,
                  isLoading: false 
                });
              } else {
                // User exists but not approved yet
                set({ 
                  user: null,
                  firebaseUser,
                  isLoggedIn: false,
                  isInitialized: true,
                  isLoading: false,
                  error: userData?.status === 'pending' ? 'Account pending approval' : 'Account not found'
                });
              }
            } catch (error) {
              console.error('Error getting user data:', error);
              set({ 
                user: null,
                firebaseUser,
                isLoggedIn: false,
                isInitialized: true,
                isLoading: false 
              });
            }
          } else {
            set({ 
              user: null,
              firebaseUser: null,
              isLoggedIn: false,
              isInitialized: true,
              isLoading: false 
            });
          }
        });

        // Return unsubscribe function
        return unsubscribe;
      },

      refreshUserData: async () => {
        const { firebaseUser } = get();
        if (firebaseUser) {
          try {
            const userData = await getUserData(firebaseUser.uid);
            if (userData) {
              set({ user: userData });
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
        }
      },
    }),
    {
      name: 'kriti-auth-store',
      partialize: (state) => ({ 
        user: state.user,
        isLoggedIn: state.isLoggedIn 
      }),
    }
  )
);

// Initialize auth on app start
let authInitialized = false;
export const initializeAuth = () => {
  if (!authInitialized) {
    useAuthStore.getState().initializeAuth();
    authInitialized = true;
  }
};