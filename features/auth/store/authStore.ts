import { create } from "zustand";
import { User } from "../types/user.types";

interface AuthState {
  user: User | null;
  role: 'admin' | 'user' | 'vendor' | null;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    [key: string]: any;
  };
  isAuthenticated: boolean;

  setAuth: (user: User, role: 'admin' | 'user' | 'vendor') => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  user_metadata: undefined,
  isAuthenticated: false,

  setAuth: (user, role) => set({ user, role, isAuthenticated: true }),
  clearAuth: () => set({ user: null, role: null, isAuthenticated: false }),
}))