import { useAuthStore } from '@/store/firebaseAuthStore';

export const useAuth = () => {
  return useAuthStore();
};
