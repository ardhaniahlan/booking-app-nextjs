import { create } from "zustand";
import { User } from "../types/user.types";

interface AuthState {
  user: User | null;
  role: 'admin' | 'user' | 'vendor' | null;
  isAuthenticated: boolean;

  setAuth: (user: User, role: 'admin' | 'user' | 'vendor') => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,

  setAuth: (user, role) => set({ user, role, isAuthenticated: true }),
  clearAuth: () => set({ user: null, role: null, isAuthenticated: false }),
}))