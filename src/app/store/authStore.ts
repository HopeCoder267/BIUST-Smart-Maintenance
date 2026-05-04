/**
 * BIUST Smart Maintenance System - Authentication Store
 * 
 * Manages the entire session lifecycle, from public student logins to 
 * complex RBAC for staff and coordinators. 
 * 
 * FEATURES: Authentication, Session Management, RBAC, Student Database
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, PublicAuthData, StudentImportData } from '../types';
import API from '../services/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPublicSide: boolean;
  isFinanceUnlocked: boolean;
  studentDatabase: Record<string, User>;

  loginPublic: (authData: PublicAuthData) => Promise<void>;
  loginPrivate: (token: string, email: string, role?: UserRole, user_id?: string) => void;
  logout: () => void;
  unlockFinance: (pin: string) => boolean;
  lockFinance: () => void;
  importStudents: (students: StudentImportData[]) => void;

  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessFinance: () => boolean;
}

/**
 * Validates public credentials against the local cache.
 */
const validatePublicLogin = (authData: PublicAuthData, studentDatabase: Record<string, User>): User | null => {
  const key = `${authData.block}_${authData.room}_${authData.digitalKey}`;
  return studentDatabase[key] || null;
};

/**
 * Centralized authentication store with persistence.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isPublicSide: false,
      isFinanceUnlocked: false,
      studentDatabase: {},

      /**
       * Signs in a resident using their room details.
       * Exclusively uses the API for verification.
       */
      loginPublic: async (authData) => {
        try {
          const { data } = await API.post('/login/public', authData);
          if (data.token) localStorage.setItem('token', data.token);

          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isPublicSide: true, 
            isFinanceUnlocked: false 
          });
        } catch (error: any) {
          console.error('Resident login failed:', error);
          throw new Error(error.response?.data?.message || 'Authentication failed. Please verify your room details and key.');
        }
      },

      /**
       * Authenticates staff using a JWT token.
       */
      loginPrivate: (token, email, role, user_id) => {
        try {
          localStorage.setItem('token', token);
          
          if (!role || !user_id) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            role = payload.role;
            user_id = payload.user_id;
          }

          if (!role || !user_id) throw new Error('Incomplete token data');

          set({
            user: { id: user_id, name: email?.split('@')[0] || 'Staff', role, email: email || '' },
            isAuthenticated: true,
            isPublicSide: false,
            isFinanceUnlocked: false
          });
        } catch {
          throw new Error('Could not process the secure token.');
        }
      },

      /**
       * Ends the current session and clears all security tokens.
       */
      logout: () => {
        set({ user: null, isAuthenticated: false, isPublicSide: false, isFinanceUnlocked: false });
        localStorage.removeItem('token');
      },

      /**
       * Access control for sensitive financial data.
       */
      unlockFinance: (pin) => {
        const isCoord = get().user?.role === 'coordinator';
        if (isCoord && pin === '1234') {
          set({ isFinanceUnlocked: true });
          return true;
        }
        return false;
      },

      lockFinance: () => set({ isFinanceUnlocked: false }),

      /**
       * Imports student records for offline validation fallback.
       */
      importStudents: (studentData) => {
        if (get().user?.role !== 'coordinator') throw new Error('Restricted to coordinators only.');

        const newDatabase = { ...get().studentDatabase };
        studentData.forEach(s => {
          const key = `${s.block}_${s.room}_${s.digitalKey}`;
          newDatabase[key] = {
            id: `std-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            name: s.name,
            role: 'student',
            studentId: s.studentId,
            omang: s.omang,
            level: s.level,
            block: s.block,
            room: s.room,
            email: `${s.name.toLowerCase().replace(/\s+/g, '.')}@studentmail.biust.ac.bw`,
          };
        });
        set({ studentDatabase: newDatabase });
      },

      /**
       * Helper methods for UI-side permission checks.
       */
      hasRole: (role) => get().user?.role === role,
      hasAnyRole: (roles) => roles.includes(get().user?.role as UserRole),
      canAccessFinance: () => get().user?.role === 'coordinator' && get().isFinanceUnlocked,
    }),
    {
      name: 'biust-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPublicSide: state.isPublicSide,
        studentDatabase: state.studentDatabase,
      }),
    }
  )
);