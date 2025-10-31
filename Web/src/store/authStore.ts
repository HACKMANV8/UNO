import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'issuer_staff' | 'issuer_admin' | 'recruiter' | 'authority';
export type AuthorizationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authorizationStatus?: AuthorizationStatus;
  aadhaarNumber?: string;
  kritiId?: string;
  requestedAt?: string;
  authorizedAt?: string;
  authorizedBy?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  pendingUsers: User[];
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    aadhaarNumber?: string;
  }) => Promise<void>;
  getPendingUsers: () => User[];
  authorizeUser: (userId: string, status: 'approved' | 'rejected', authorizedBy: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      pendingUsers: [
        // Mock pending users for testing
        {
          id: 'pending-1',
          email: 'recruiter@company.com',
          name: 'John Recruiter',
          role: 'recruiter' as UserRole,
          authorizationStatus: 'pending' as AuthorizationStatus,
          kritiId: 'KRITI-REC001',
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          id: 'pending-2',
          email: 'admin@university.edu',
          name: 'Jane Admin',
          role: 'issuer_admin' as UserRole,
          authorizationStatus: 'pending' as AuthorizationStatus,
          kritiId: 'KRITI-ADM001',
          requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        }
      ],

      login: async (email, password, role) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          let userRole: UserRole = role || 'student';
          if (!role) {
            if (email.includes('issuer') || email.includes('admin')) {
              userRole = email.includes('admin') ? 'issuer_admin' : 'issuer_staff';
            } else if (email.includes('recruiter')) {
              userRole = 'recruiter';
            } else {
              userRole = 'student';
            }
          }

          // Authorization checks disabled - allow anyone to login as any role
          const mockUser: User = {
            id: 'user-' + Date.now(),
            email,
            name: email.split('@')[0],
            role: userRole,
            authorizationStatus: 'approved',
            kritiId: 'KRITI-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          };

          set({ user: mockUser, isLoggedIn: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1200));

          const { pendingUsers } = get();
          
          // Check if user already exists
          const existingUser = pendingUsers.find(u => u.email === data.email && u.role === data.role);
          if (existingUser) {
            set({ isLoading: false });
            throw new Error('ALREADY_EXISTS');
          }

          const newUser: User = {
            id: 'user-' + Date.now(),
            email: data.email,
            name: data.name,
            role: data.role,
            aadhaarNumber: data.aadhaarNumber,
            kritiId: 'KRITI-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            authorizationStatus: 'approved',
            requestedAt: new Date().toISOString(),
          };

          // Authorization disabled - allow all users to signup and login immediately
          set({ 
            user: newUser, 
            isLoggedIn: true, 
            isLoading: false,
            pendingUsers: [...pendingUsers, newUser]
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getPendingUsers: () => {
        return get().pendingUsers.filter(u => u.authorizationStatus === 'pending');
      },

      authorizeUser: (userId: string, status: 'approved' | 'rejected', authorizedBy: string) => {
        const { pendingUsers } = get();
        const updatedUsers = pendingUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                authorizationStatus: status as AuthorizationStatus,
                authorizedAt: new Date().toISOString(),
                authorizedBy
              }
            : user
        );
        set({ pendingUsers: updatedUsers });
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'kriti-auth-storage',
    }
  )
);