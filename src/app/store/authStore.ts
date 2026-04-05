/**
 * BIUST Smart Maintenance System - Authentication Store
 * 
 * This Zustand store manages authentication state for both public and private sides.
 * It handles user login, logout, session management, and role-based access control.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, PublicAuthData, StudentImportData } from '../types';

/**
 * Authentication store state interface
 */
interface AuthState {
  // Current user and session
  user: User | null;
  isAuthenticated: boolean;
  isPublicSide: boolean;          // True if logged in via public side (block → room → key)
  
  // Finance PIN unlock (for coordinators)
  isFinanceUnlocked: boolean;
  
  // Internal student database (populated via CSV imports)
  studentDatabase: Record<string, User>;
  
  // Actions
  loginPublic: (authData: PublicAuthData) => void;
  loginPrivate: (userData: User, token: string) => void;
  logout: () => void;
  unlockFinance: (pin: string) => boolean;
  lockFinance: () => void;
  importStudents: (students: StudentImportData[]) => void;
  
  // Authorization helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessFinance: () => boolean;
}

/**
 * Mock function to validate public login credentials
 * In production, this would call a backend API
 * 
 * @param authData - Block, room, and digital key
 * @param studentDatabase - Current database of students/keys
 * @returns User data if credentials are valid, null otherwise
 */
const validatePublicLogin = (authData: PublicAuthData, studentDatabase: Record<string, User>): User | null => {
  // Create lookup key from auth data
  // The UI provides block as "Block A" and room as "101"
  const lookupKey = `${authData.block}_${authData.room}_${authData.digitalKey}`;
  return studentDatabase[lookupKey] || null;
};

/**
 * Mock function to validate private login credentials
 * In production, this would call a backend API with JWT authentication
 * 
 * @param email - User email
 * @param password - User password
 * @returns Object with user data and JWT token if valid, null otherwise
 */
const validatePrivateLogin = (email: string, password: string): { user: User; token: string } | null => {
  // Temporary credentials for development/recovery
  const mockStaff: Record<string, User> = {
    'coordinator@biust.ac.bw': {
      id: 'staff-1',
      name: 'Kagiso Rapula',
      role: 'coordinator',
      email: 'coordinator@biust.ac.bw'
    },
    'operator@biust.ac.bw': {
      id: 'staff-2',
      name: 'Bonolo Korong',
      role: 'operator',
      email: 'operator@biust.ac.bw'
    },
    'technician@biust.ac.bw': {
      id: 'staff-3',
      name: 'Kagiso',
      role: 'technician',
      email: 'technician@biust.ac.bw'
    },
    'assistant@biust.ac.bw': {
      id: 'staff-4',
      name: 'Karabo Rapelang',
      role: 'campus_assistant',
      email: 'assistant@biust.ac.bw'
    }
  };

  const passwords: Record<string, string> = {
    'coordinator@biust.ac.bw': 'coord123',
    'operator@biust.ac.bw': 'oper123',
    'technician@biust.ac.bw': 'tech123',
    'assistant@biust.ac.bw': 'assist123'
  };

  if (mockStaff[email] && passwords[email] === password) {
    return {
      user: mockStaff[email],
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2)
    };
  }

  return null;
};


/**
 * Authentication store using Zustand with persistence
 * Persists to localStorage to maintain session across page refreshes
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isPublicSide: false,
      isFinanceUnlocked: false,
      
      // Default student database (empty for production)
      studentDatabase: {},
      
      /**
       * Login via public side (block → room → digital key)
       * Used by students and staff to access the reporting interface
       * 
       * @param authData - Block, room, and digital key combination
       */
      loginPublic: (authData: PublicAuthData) => {
        const { studentDatabase } = get();
        const user = validatePublicLogin(authData, studentDatabase);
        
        if (user) {
          set({
            user,
            isAuthenticated: true,
            isPublicSide: true,
            isFinanceUnlocked: false
          });
        } else {
          throw new Error('Invalid credentials. Please check your block, room, and digital key.');
        }
      },
      
      /**
       * Login via private side (JWT with RBAC)
       * Used by campus assistants, operators, technicians, and coordinators
       * 
       * @param userData - User data from JWT validation
       * @param token - JWT token for API authentication
       */
      loginPrivate: (userData: User, token: string) => {
        set({
          user: userData,
          isAuthenticated: true,
          isPublicSide: false,
          isFinanceUnlocked: false
        });
        
        // Store JWT token for API calls
        localStorage.setItem('jwt_token', token);
      },
      
      /**
       * Logout current user and clear session data
       * Clears all authentication state and removes stored tokens
       */
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isPublicSide: false,
          isFinanceUnlocked: false
        });
        
        // Clear JWT token
        localStorage.removeItem('jwt_token');
      },
      
      /**
       * Unlock finance module with PIN
       * Only coordinators can access the finance module
       * Requires additional PIN authentication for security
       * 
       * @param pin - Finance module PIN
       * @returns True if unlock successful
       */
      unlockFinance: (pin: string): boolean => {
        const { user } = get();
        
        // Only coordinators can access finance
        if (user?.role !== 'coordinator') {
          return false;
        }
        
        // Robust PIN check - in production, this should be a call to a secure server
        // For security, the PIN is never stored in the client state except temporarily
        const isValid = pin === '1234'; // In production, this would be a secure verification
        
        if (isValid) {
          set({ isFinanceUnlocked: true });
          return true;
        }
        
        return false;
      },
      
      /**
       * Lock finance module
       * Used when coordinator navigates away or manually locks
       */
      lockFinance: () => {
        set({ isFinanceUnlocked: false });
      },
      
      /**
       * Import student data from CSV/Excel
       * Only coordinators can perform this action
       * 
       * @param studentData - Array of student details including digital keys
       */
      importStudents: (studentData: StudentImportData[]) => {
        const { user, studentDatabase } = get();
        
        if (user?.role !== 'coordinator') {
          throw new Error('Permission denied. Only coordinators can import student data.');
        }
        
        const newDatabase = { ...studentDatabase };
        
        studentData.forEach(student => {
          const key = `${student.block}_${student.room}_${student.digitalKey}`;
          newDatabase[key] = {
            id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: student.name,
            role: 'student',
            studentId: student.studentId,
            omang: student.omang,
            level: student.level,
            block: student.block,
            room: student.room,
            email: `${student.name.toLowerCase().replace(' ', '.')}@studentmail.biust.ac.bw`
          };
        });
        
        set({ studentDatabase: newDatabase });
      },
      
      /**
       * Check if current user has specific role
       * 
       * @param role - Role to check
       * @returns True if user has the role
       */
      hasRole: (role: UserRole): boolean => {
        const { user } = get();
        return user?.role === role;
      },
      
      /**
       * Check if current user has any of the specified roles
       * 
       * @param roles - Array of roles to check
       * @returns True if user has at least one of the roles
       */
      hasAnyRole: (roles: UserRole[]): boolean => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
      
      /**
       * Check if current user can access finance module
       * Must be coordinator AND have finance unlocked
       * 
       * @returns True if user can access finance
       */
      canAccessFinance: (): boolean => {
        const { user, isFinanceUnlocked } = get();
        return user?.role === 'coordinator' && isFinanceUnlocked;
      }
    }),
    {
      name: 'biust-auth-storage',  // localStorage key
      // Only persist essential data, not sensitive info like PIN
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPublicSide: state.isPublicSide,
        studentDatabase: state.studentDatabase
      })
    }
  )
);