import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Developer {
  id: string;
  email: string;
  name: string;
  company?: string;
  createdAt: Date;
  isVerified: boolean;
}

interface AuthState {
  developer: Developer | null;
  isAuthenticated: boolean;
  setDeveloper: (developer: Developer | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      developer: null,
      isAuthenticated: false,
      setDeveloper: (developer) => set({ 
        developer, 
        isAuthenticated: !!developer 
      }),
      logout: () => set({ 
        developer: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
