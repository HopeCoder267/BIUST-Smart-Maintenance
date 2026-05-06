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
import { auth, db } from '../../firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
  increment
} from 'firebase/firestore';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPublicSide: boolean;
  isFinanceUnlocked: boolean;
  studentDatabase: Record<string, User>;
  authListeners: (() => void)[];

  loginPublic: (authData: PublicAuthData) => Promise<void>;
  loginPrivate: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  unlockFinance: (pin: string) => boolean;
  lockFinance: () => void;
  importStudents: (students: StudentImportData[]) => Promise<void>;
  addRoom: (roomData: any) => Promise<boolean>;
  updateRoom: (roomId: string, updates: any) => Promise<boolean>;
  deleteRoom: (roomId: string) => Promise<boolean>;

  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessFinance: () => boolean;
  initializeAuth: () => void;
  cleanupAuth: () => void;
}


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
      authListeners: [],

      /**
       * Initialize Firebase Auth listener
       */
      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          // FIX: Only block Firebase Auth if we have a confirmed resident session
          // This prevents Firebase Auth from overwriting resident logins
          const currentState = get();
          if (currentState.isPublicSide && currentState.isAuthenticated && currentState.user?.role === 'student') {
             console.log("Resident session active, skipping Firebase Auth sync");
             return;
          }

          if (firebaseUser) {
            try {
              // FIX: Fetch the actual document from the 'users' collection
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDoc = await getDoc(userDocRef);

              if (userDoc.exists()) {
                const userData = userDoc.data();
                set({
                  user: {
                    id: firebaseUser.uid,
                    name: userData.name || firebaseUser.email?.split('@')[0] || 'User',
                    role: userData.role as UserRole, // Pulls 'coordinator' from Firestore
                    email: firebaseUser.email || '',
                  },
                  isAuthenticated: true,
                  isPublicSide: false,
                  isFinanceUnlocked: false
                });
                console.log('Staff profile loaded from Firestore:', userData.role);
              } else {
                // FIX: Handle missing Firestore document gracefully
                // For coordinator accounts that don't have Firestore documents, 
                // create a basic user profile from Firebase auth data
                const email = firebaseUser.email || '';
                const emailDomain = email.split('@')[1] || '';
                
                // Determine role based on email domain or create default
                let userRole: UserRole = 'operator'; // default role
                if (emailDomain.includes('biust.ac.bw')) {
                  // For BIUST emails, check if they might be coordinators based on email pattern
                  // or set a reasonable default
                  userRole = 'coordinator';
                }
                
                set({
                  user: {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    role: userRole,
                    email: email,
                  },
                  isAuthenticated: true,
                  isPublicSide: false,
                  isFinanceUnlocked: false
                });
                console.log('Created fallback profile for Firebase user:', userRole);
              }
            } catch (error) {
              console.error('Firestore fetch error:', error);
              // Even if Firestore fails, create a basic profile
              const email = firebaseUser.email || '';
              set({
                user: {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || email.split('@')[0] || 'User',
                  role: 'operator', // safe default
                  email: email,
                },
                isAuthenticated: true,
                isPublicSide: false,
                isFinanceUnlocked: false
              });
              console.log('Created emergency fallback profile due to Firestore error');
            }
          } else {
            set({ user: null, isAuthenticated: false, isPublicSide: false, isFinanceUnlocked: false });
          }
        });
        
        set(state => ({ authListeners: [...state.authListeners, unsubscribe] }));
      },






      /**
       * Signs in a resident using their room details via Firestore
       */
      loginPublic: async (authData) => {
        try {
          // Query rooms collection for matching room
          const roomsQuery = query(
            collection(db, 'rooms'),
            where('blockName', '==', authData.block),
            // Force check against roomID which is what we standardized in Phase 1
            where('roomID', '==', authData.room), 
            where('digitalKey', '==', authData.digitalKey)
          );
          
          const querySnapshot = await getDocs(roomsQuery);
          
          if (querySnapshot.empty) {
            throw new Error('Invalid room details or digital key');
          }
          
          if (querySnapshot.docs.length > 1) {
            throw new Error('Multiple rooms found with same details. Please contact administrator.');
          }
          
          const roomDoc = querySnapshot.docs[0];
          const roomData = roomDoc.data();
          
          // Create user object from room data
          const residentUser: User = {
            id: `resident-${roomDoc.id}`,
            name: roomData.residentName || 'Resident',
            role: 'student',
            block: authData.block,
            room: authData.room,
            email: `${roomData.residentName?.toLowerCase().replace(/\s+/g, '.') || 'resident'}@studentmail.biust.ac.bw`
          };
          
          set({ 
            user: residentUser, 
            isAuthenticated: true, 
            isPublicSide: true, 
            isFinanceUnlocked: false 
          });
          
          toast.success('Login successful!');
        } catch (error: any) {
          console.error('Resident login failed:', error);
          toast.error(error.message || 'Authentication failed. Please verify your room details and key.');
          throw error;
        }
      },

      /**
       * Authenticates staff using Firebase Auth
       */
      loginPrivate: async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // User document will be fetched by onAuthStateChanged listener
          toast.success('Login successful!');
        } catch (error: any) {
          console.error('Staff login failed:', error);
          let errorMessage = 'Login failed';
          
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage = 'User not found';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Incorrect password';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email address';
              break;
            case 'auth/user-disabled':
              errorMessage = 'Account disabled';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed attempts. Please try again later.';
              break;
            default:
              errorMessage = error.message || 'Authentication failed';
          }
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Ends the current session and clears all security tokens
       */
      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, isPublicSide: false, isFinanceUnlocked: false });
          toast.success('Logged out successfully');
        } catch (error: any) {
          console.error('Logout error:', error);
          toast.error('Error during logout');
        }
      },

      /**
       * Access control for sensitive financial data
       */
      unlockFinance: (pin) => {
        const isCoord = get().user?.role === 'coordinator';
        if (isCoord && pin === '1234') {
          set({ isFinanceUnlocked: true });
          toast.success('Finance module unlocked');
          return true;
        }
        toast.error('Invalid PIN or insufficient permissions');
        return false;
      },

      lockFinance: () => {
        set({ isFinanceUnlocked: false });
        toast.success('Finance module locked');
      },

      /**
       * Imports student records to Firestore rooms collection
       */
      importStudents: async (studentData) => {
        if (get().user?.role !== 'coordinator') {
          toast.error('Restricted to coordinators only.');
          throw new Error('Restricted to coordinators only.');
        }

        try {
          const batch = [];
          
          for (const student of studentData) {
            const roomData = {
              blockName: student.block,
              // Store both to prevent "undefined" errors in different components
              roomID: student.room, 
              roomId: student.room,
              digitalKey: student.digitalKey,
              residentName: student.name, // CRITICAL: This was missing!
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            batch.push(addDoc(collection(db, 'rooms'), roomData));
          }
          
          await Promise.all(batch);
          toast.success(`Successfully imported ${studentData.length} student records`);
        } catch (error: any) {
          console.error('Import error:', error);
          toast.error(error.message || 'Failed to import student records');
          throw error;
        }
      },

      /**
       * Add new room to Firestore
       */
      addRoom: async (roomData) => {
        try {
          const docRef = await addDoc(collection(db, 'rooms'), {
            ...roomData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Room added successfully');
          return true;
        } catch (error: any) {
          console.error('Add room error:', error);
          toast.error(error.message || 'Failed to add room');
          return false;
        }
      },

      /**
       * Update room in Firestore
       */
      updateRoom: async (roomId: string, updates: any) => {
        try {
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Room updated successfully');
          return true;
        } catch (error: any) {
          console.error('Update room error:', error);
          toast.error(error.message || 'Failed to update room');
          return false;
        }
      },

      /**
       * Delete room from Firestore
       */
      deleteRoom: async (roomId: string) => {
        try {
          await deleteDoc(doc(db, 'rooms', roomId));
          toast.success('Room deleted successfully');
          return true;
        } catch (error: any) {
          console.error('Delete room error:', error);
          toast.error(error.message || 'Failed to delete room');
          return false;
        }
      },

      /**
       * Helper methods for UI-side permission checks
       */
      hasRole: (role) => get().user?.role === role,
      hasAnyRole: (roles) => roles.includes(get().user?.role as UserRole),
      canAccessFinance: () => get().user?.role === 'coordinator' && get().isFinanceUnlocked,
      
      /**
       * Cleanup auth listeners
       */
      cleanupAuth: () => {
        const { authListeners } = get();
        authListeners.forEach(unsubscribe => unsubscribe());
        set({ authListeners: [] });
      }
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