/**
 * BIUST Smart Maintenance System - Firebase Data Store
 * 
 * This file provides Firebase-based data management for application.
 * All data operations are handled through Firebase Firestore and Storage.
 * Now auth-agnostic - individual components handle auth checks.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Block, Resident, Ticket } from '../types';
import { auth, db, storage } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  writeBatch,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
  increment,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { toast } from 'sonner';

interface DataState {
  blocks: Block[];
  residents: Resident[];
  tickets: Ticket[];
  users: any[];
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  listeners: (() => void)[];
  dashboardAnalytics: any;
  budget: any[];
  inventory: any[];
  assets: any[];
  suppliers: any[];
  projects: any[];
  preventiveMaintenance: any[];
  rooms: any[];

  // Room operations
  fetchRooms: (blockId?: string) => Promise<void>;
  addRoom: (roomData: any) => Promise<boolean>;
  updateRoom: (roomId: string, updates: any) => Promise<boolean>;
  deleteRoom: (roomId: string) => Promise<boolean>;

  // Block operations
  fetchBlocks: () => Promise<void>;
  fetchPublicBlocks: () => Promise<void>;
  fetchPublicRooms: (blockId: string) => Promise<string[]>;
  addBlock: (blockData: Partial<Block>) => Promise<boolean>;
  updateBlock: (blockId: string, updates: Partial<Block>) => Promise<boolean>;
  deleteBlock: (blockId: string) => Promise<boolean>;

  // Resident operations
  fetchResidents: (blockId?: string) => Promise<void>;
  importStudents: (students: any[]) => Promise<void>;
  addResident: (residentData: Partial<Resident>) => Promise<boolean>;
  updateResident: (residentId: string, updates: Partial<Resident>) => Promise<boolean>;
  deleteResident: (residentId: string) => Promise<boolean>;

  // Ticket operations
  fetchTickets: () => Promise<void>;
  addTicket: (ticketData: Partial<Ticket>) => Promise<boolean>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<boolean>;
  deleteTicket: (id: string) => Promise<boolean>;
  assignTechnician: (ticketId: string, technicianId: string) => Promise<boolean>;
  updatePriority: (ticketId: string, priority: string) => Promise<boolean>;
  updateStatus: (ticketId: string, status: string) => Promise<boolean>;
  updateProgress: (ticketId: string, progress: any[]) => Promise<boolean>;
  completeTicketWithInventory: (ticketId: string, inventoryUsed: any[]) => Promise<boolean>;

  // User operations
  fetchUsers: () => Promise<void>;

  // Notification operations
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: any) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => Promise<boolean>;

  // Analytics operations
  fetchAnalytics: () => Promise<void>;
  getAnalytics: () => any;

  // Budget operations
  fetchBudget: () => Promise<void>;
  addBudget: (budgetData: any) => Promise<boolean>;
  updateBudget: (budgetId: string, updates: any) => Promise<boolean>;
  deleteBudget: (budgetId: string) => Promise<boolean>;

  // Inventory operations
  fetchInventory: () => Promise<void>;
  addInventory: (inventoryData: any) => Promise<boolean>;
  updateInventory: (inventoryId: string, updates: any) => Promise<boolean>;
  deleteInventory: (inventoryId: string) => Promise<boolean>;

  // Attachment operations
  uploadAttachment: (file: File, ticketId?: string) => Promise<string>;
  deleteAttachment: (attachmentId: string) => Promise<boolean>;

  // Asset operations
  fetchAssets: () => Promise<void>;
  addAsset: (assetData: any) => Promise<boolean>;
  updateAsset: (assetId: string, updates: any) => Promise<boolean>;
  deleteAsset: (assetId: string) => Promise<boolean>;

  // Supplier operations
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplierData: any) => Promise<boolean>;
  updateSupplier: (supplierId: string, updates: any) => Promise<boolean>;
  deleteSupplier: (supplierId: string) => Promise<boolean>;

  // Project operations
  fetchProjects: () => Promise<void>;
  addProject: (projectData: any) => Promise<boolean>;
  updateProject: (projectId: string, updates: any) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;

  // Preventive maintenance operations
  fetchPreventiveMaintenance: () => Promise<void>;
  addPreventiveMaintenance: (maintenanceData: any) => Promise<boolean>;
  updatePreventiveMaintenance: (maintenanceId: string, updates: any) => Promise<boolean>;
  deletePreventiveMaintenance: (maintenanceId: string) => Promise<boolean>;

  // Helper functions
  getFilteredNotifications: (user: any) => any[];
  getTicketsByUser: (userId: string, role: string) => Ticket[];
  cleanupListeners: () => void;
}

/**
 * Centralized data store with Firebase integration
 * Now auth-agnostic - components should handle their own auth checks
 */
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      blocks: [],
      residents: [],
      tickets: [],
      users: [],
      notifications: [],
      isLoading: false,
      error: null,
      listeners: [],
      dashboardAnalytics: null,
      budget: [],
      inventory: [],
      assets: [],
      suppliers: [],
      projects: [],
      preventiveMaintenance: [],
      rooms: [],

      // Room operations
      fetchRooms: async (blockId?: string) => {
        set({ isLoading: true, error: null });
        try {
          let roomsQuery;
          if (blockId) {
            roomsQuery = query(collection(db, 'rooms'), where('blockId', '==', blockId));
          } else {
            roomsQuery = collection(db, 'rooms');
          }
          
          const querySnapshot = await getDocs(roomsQuery);
          const rooms = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          set({ rooms: rooms as any[], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch rooms');
        }
      },

      addRoom: async (roomData) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'rooms'), {
            ...roomData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Room added successfully');
          
          // CRITICAL: Refresh rooms list to show new room immediately
          await get().fetchRooms(roomData.blockId);
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add room');
          return false;
        }
      },

      updateRoom: async (roomId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const roomRef = doc(db, 'rooms', roomId);
          await updateDoc(roomRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Room updated successfully');
          
          // CRITICAL: Refresh rooms list to show updated room immediately
          await get().fetchRooms(updates.blockId);
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update room');
          return false;
        }
      },

      deleteRoom: async (roomId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'rooms', roomId));
          toast.success('Room deleted successfully');
          
          // CRITICAL: Refresh rooms list to show updated list immediately
          await get().fetchRooms();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete room');
          return false;
        }
      },

      // Block operations
      fetchBlocks: async () => {
        set({ isLoading: true, error: null });
        try {
          const querySnapshot = await getDocs(collection(db, 'blocks'));
          const blocks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Block[];
          set({ blocks, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch blocks');
        }
      },

      fetchPublicBlocks: async () => {
        set({ isLoading: true, error: null });
        try {
          const querySnapshot = await getDocs(collection(db, 'blocks'));
          const blocks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Block[];
          set({ blocks, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch blocks');
        }
      },

      fetchPublicRooms: async (blockId: string) => {
        try {
          const blockQuery = query(collection(db, 'rooms'), where('blockId', '==', blockId));
          const querySnapshot = await getDocs(blockQuery);
          return querySnapshot.docs.map(doc => doc.data().roomID || doc.data().roomId);
        } catch (error: any) {
          console.error('Error fetching rooms:', error);
          return [];
        }
      },

      addBlock: async (blockData) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'blocks'), {
            ...blockData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Block added successfully');
          
          // CRITICAL: Refresh blocks list to show new block immediately
          await get().fetchBlocks();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add block');
          return false;
        }
      },

      updateBlock: async (blockId: string, updates: Partial<Block>) => {
        set({ isLoading: true, error: null });
        try {
          const blockRef = doc(db, 'blocks', blockId);
          await updateDoc(blockRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Block updated successfully');
          
          // CRITICAL: Refresh blocks list to show updated block immediately
          await get().fetchBlocks();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update block');
          return false;
        }
      },

      deleteBlock: async (blockId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'blocks', blockId));
          toast.success('Block deleted successfully');
          
          // CRITICAL: Refresh blocks list to show updated list immediately
          await get().fetchBlocks();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete block');
          return false;
        }
      },

      // Resident operations
      fetchResidents: async (blockId?: string) => {
        set({ isLoading: true, error: null });
        try {
          let residentsQuery;
          if (blockId) {
            // Fetch residents for specific block
            residentsQuery = query(collection(db, 'residents'), where('blockId', '==', blockId));
          } else {
            // Fetch all residents
            residentsQuery = collection(db, 'residents');
          }
          
          const querySnapshot = await getDocs(residentsQuery);
          const residents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Resident[];
          set({ residents, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch residents');
        }
      },

      importStudents: async (students: any[]) => {
        set({ isLoading: true, error: null });
        try {
          const batch = [];
          
          for (const student of students) {
            const roomData = {
              blockName: student.block,
              roomID: student.room,
              roomId: student.room,
              digitalKey: student.digitalKey,
              residentName: student.name,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            batch.push(addDoc(collection(db, 'rooms'), roomData));
          }
          
          await Promise.all(batch);
          toast.success(`Successfully imported ${students.length} student records`);
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to import student records');
          throw error;
        }
      },

      addResident: async (residentData) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'residents'), {
            ...residentData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Resident added successfully');
          
          // CRITICAL: Refresh residents list to show new resident immediately
          await get().fetchResidents(residentData.blockId);
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add resident');
          return false;
        }
      },

      updateResident: async (residentId: string, updates: Partial<Resident>) => {
        set({ isLoading: true, error: null });
        try {
          const residentRef = doc(db, 'residents', residentId);
          await updateDoc(residentRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Resident updated successfully');
          
          // CRITICAL: Refresh residents list to show updated resident immediately
          await get().fetchResidents(updates.blockId);
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update resident');
          return false;
        }
      },

      deleteResident: async (residentId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'residents', residentId));
          toast.success('Resident deleted successfully');
          
          // CRITICAL: Refresh residents list to show updated list immediately
          // We need to fetch all residents since we don't know the blockId of deleted resident
          await get().fetchResidents();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete resident');
          return false;
        }
      },

      // Ticket operations
      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          // Clean up existing ticket listeners first
          const { listeners } = get();
          const ticketListenerIndex = listeners.findIndex(listener => 
            listener.toString().includes('tickets')
          );
          if (ticketListenerIndex !== -1) {
            listeners[ticketListenerIndex]();
            listeners.splice(ticketListenerIndex, 1);
            set({ listeners });
          }
          
          // Always fetch tickets - auth checks should be done in components
          const unsubscribe = onSnapshot(collection(db, 'tickets'), (snapshot) => {
            const tickets = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Ticket[];
            set({ tickets, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch tickets');
        }
      },

      addTicket: async (ticketData) => {
        set({ isLoading: true, error: null });
        try {
          // Data validation
          if (!ticketData.title || ticketData.title.trim().length === 0) {
            throw new Error('Ticket title is required');
          }
          if (!ticketData.description || ticketData.description.trim().length === 0) {
            throw new Error('Ticket description is required');
          }
          if (!ticketData.category) {
            throw new Error('Ticket category is required');
          }
          if (!ticketData.block || !ticketData.room) {
            throw new Error('Block and room are required');
          }
          if (!ticketData.submittedBy || !ticketData.submittedBy.id) {
            throw new Error('Submitter information is required');
          }
          
          // Sanitize inputs
          const sanitizedTitle = ticketData.title.trim().replace(/[<>]/g, '');
          const sanitizedDescription = ticketData.description.trim().replace(/[<>]/g, '');
          
          const docRef = await addDoc(collection(db, 'tickets'), {
            ...ticketData,
            title: sanitizedTitle,
            description: sanitizedDescription,
            status: 'open',
            currentStage: 'report_submitted',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          toast.success('Ticket created successfully');
          
          // CRITICAL: Refresh tickets to show new ticket immediately
          await get().fetchTickets();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to create ticket');
          return false;
        }
      },

      updateTicket: async (id: string, updates: Partial<Ticket>) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', id);
          await updateDoc(ticketRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Ticket updated successfully');
          
          // CRITICAL: Refresh tickets to show updated ticket immediately
          await get().fetchTickets();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update ticket');
          return false;
        }
      },

      deleteTicket: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'tickets', id));
          toast.success('Ticket deleted successfully');
          
          // CRITICAL: Refresh tickets to show updated list immediately
          await get().fetchTickets();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete ticket');
          return false;
        }
      },

      assignTechnician: async (ticketId: string, technicianId: string) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', ticketId);
          await updateDoc(ticketRef, {
            assignedTo: technicianId,
            updatedAt: serverTimestamp()
          });
          toast.success('Technician assigned successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to assign technician');
          return false;
        }
      },

      updatePriority: async (ticketId: string, priority: string) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', ticketId);
          await updateDoc(ticketRef, {
            priority,
            updatedAt: serverTimestamp()
          });
          toast.success('Priority updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update priority');
          return false;
        }
      },

      updateStatus: async (ticketId: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', ticketId);
          await updateDoc(ticketRef, {
            status,
            updatedAt: serverTimestamp()
          });
          toast.success('Status updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update status');
          return false;
        }
      },

      updateProgress: async (ticketId: string, progress: any[]) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', ticketId);
          await updateDoc(ticketRef, {
            progress,
            updatedAt: serverTimestamp()
          });
          toast.success('Progress updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update progress');
          return false;
        }
      },

      completeTicketWithInventory: async (ticketId: string, inventoryUsed: any[]) => {
        set({ isLoading: true, error: null });
        try {
          const ticketRef = doc(db, 'tickets', ticketId);
          await updateDoc(ticketRef, {
            status: 'completed',
            inventoryUsed,
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Ticket completed successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to complete ticket');
          return false;
        }
      },

      // User operations
      fetchUsers: async () => {
        // Users can be fetched by any authenticated user - role checks should be in components
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const users = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ users, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch users');
        }
      },

      // Notification operations
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ notifications, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch notifications');
        }
      },

      addNotification: async (notification: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'notifications'), {
            ...notification,
            createdAt: serverTimestamp(),
            read: false
          });
          toast.success('Notification added successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add notification');
          return false;
        }
      },

      markNotificationRead: async (notificationId: string) => {
        set({ isLoading: true, error: null });
        try {
          const notificationRef = doc(db, 'notifications', notificationId);
          await updateDoc(notificationRef, {
            read: true,
            readAt: serverTimestamp()
          });
          toast.success('Notification marked as read');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to mark notification as read');
          return false;
        }
      },

      // Analytics operations
      fetchAnalytics: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock analytics data - replace with real analytics
          const analytics = {
            totalTickets: get().tickets.length,
            openTickets: get().tickets.filter(t => t.status === 'open').length,
            inProgressTickets: get().tickets.filter(t => t.status === 'in-progress').length,
            completedTickets: get().tickets.filter(t => t.status === 'completed').length,
            avgResponseTime: '2.5 hours',
            avgResolutionTime: '24 hours'
          };
          
          set({ dashboardAnalytics: analytics, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch analytics');
        }
      },

      getAnalytics: () => {
        return get().dashboardAnalytics;
      },

      // Budget operations
      fetchBudget: async () => {
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'budget'), (snapshot) => {
            const budget = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ budget, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch budget');
        }
      },

      addBudget: async (budgetData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'budget'), {
            ...budgetData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Budget added successfully');
          
          // CRITICAL: Refresh budget to show new item immediately
          await get().fetchBudget();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add budget');
          return false;
        }
      },

      updateBudget: async (budgetId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const budgetRef = doc(db, 'budget', budgetId);
          await updateDoc(budgetRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Budget updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update budget');
          return false;
        }
      },

      deleteBudget: async (budgetId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'budget', budgetId));
          toast.success('Budget deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete budget');
          return false;
        }
      },

      // Inventory operations
      fetchInventory: async () => {
        // Inventory can be fetched by any authenticated user - role checks should be in components
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
            const inventory = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ inventory, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch inventory');
        }
      },

      addInventory: async (inventoryData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'inventory'), {
            ...inventoryData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Inventory item added successfully');
          
          // CRITICAL: Refresh inventory to show new item immediately
          await get().fetchInventory();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add inventory item');
          return false;
        }
      },

      updateInventory: async (inventoryId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const inventoryRef = doc(db, 'inventory', inventoryId);
          await updateDoc(inventoryRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Inventory item updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update inventory item');
          return false;
        }
      },

      deleteInventory: async (inventoryId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'inventory', inventoryId));
          toast.success('Inventory item deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete inventory item');
          return false;
        }
      },

      // Attachment operations
      uploadAttachment: async (file: File, ticketId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          
          // If ticketId provided, also update the ticket with attachment reference
          if (ticketId) {
            const ticketRef = doc(db, 'tickets', ticketId);
            await updateDoc(ticketRef, {
              attachments: arrayUnion([downloadURL]),
              updatedAt: serverTimestamp()
            });
          }
          
          toast.success('File uploaded successfully');
          return downloadURL;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to upload file');
          throw error;
        }
      },

      deleteAttachment: async (attachmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteObject(ref(storage, attachmentId));
          toast.success('Attachment deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete attachment');
          return false;
        }
      },

      // Asset operations
      fetchAssets: async () => {
        // Assets can be fetched by any authenticated user - role checks should be in components
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
            const assets = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ assets, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch assets');
        }
      },

      addAsset: async (assetData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'assets'), {
            ...assetData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Asset added successfully');
          
          // CRITICAL: Refresh assets to show new item immediately
          await get().fetchAssets();
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add asset');
          return false;
        }
      },

      updateAsset: async (assetId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const assetRef = doc(db, 'assets', assetId);
          await updateDoc(assetRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Asset updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update asset');
          return false;
        }
      },

      deleteAsset: async (assetId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'assets', assetId));
          toast.success('Asset deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete asset');
          return false;
        }
      },

      // Supplier operations
      fetchSuppliers: async () => {
        // Suppliers can be fetched by any authenticated user - role checks should be in components
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
            const suppliers = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ suppliers, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch suppliers');
        }
      },

      addSupplier: async (supplierData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'suppliers'), {
            ...supplierData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Supplier added successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add supplier');
          return false;
        }
      },

      updateSupplier: async (supplierId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const supplierRef = doc(db, 'suppliers', supplierId);
          await updateDoc(supplierRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Supplier updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update supplier');
          return false;
        }
      },

      deleteSupplier: async (supplierId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'suppliers', supplierId));
          toast.success('Supplier deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete supplier');
          return false;
        }
      },

      // Project operations
      fetchProjects: async () => {
        // Projects can be fetched by any authenticated user - role checks should be in components
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ projects, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch projects');
        }
      },

      addProject: async (projectData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'projects'), {
            ...projectData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Project added successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add project');
          return false;
        }
      },

      updateProject: async (projectId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const projectRef = doc(db, 'projects', projectId);
          await updateDoc(projectRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Project updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update project');
          return false;
        }
      },

      deleteProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'projects', projectId));
          toast.success('Project deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete project');
          return false;
        }
      },

      // Preventive maintenance operations
      fetchPreventiveMaintenance: async () => {
        set({ isLoading: true, error: null });
        try {
          const unsubscribe = onSnapshot(collection(db, 'preventiveMaintenance'), (snapshot) => {
            const maintenance = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            set({ preventiveMaintenance: maintenance, isLoading: false });
          });
          
          set(state => ({ listeners: [...state.listeners, unsubscribe] }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to fetch preventive maintenance');
        }
      },

      addPreventiveMaintenance: async (maintenanceData: any) => {
        set({ isLoading: true, error: null });
        try {
          await addDoc(collection(db, 'preventiveMaintenance'), {
            ...maintenanceData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          toast.success('Preventive maintenance added successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to add preventive maintenance');
          return false;
        }
      },

      updatePreventiveMaintenance: async (maintenanceId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          const maintenanceRef = doc(db, 'preventiveMaintenance', maintenanceId);
          await updateDoc(maintenanceRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          toast.success('Preventive maintenance updated successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to update preventive maintenance');
          return false;
        }
      },

      deletePreventiveMaintenance: async (maintenanceId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deleteDoc(doc(db, 'preventiveMaintenance', maintenanceId));
          toast.success('Preventive maintenance deleted successfully');
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || 'Failed to delete preventive maintenance');
          return false;
        }
      },

      // Helper functions
      getFilteredNotifications: (user: any) => {
        const notifications = get().notifications;
        return notifications.filter(n => 
          n.targetUserId === user.id || 
          n.targetRole === user.role ||
          n.targetAll === true
        );
      },

      getTicketsByUser: (userId: string, role: string) => {
        const tickets = get().tickets;
        if (role === 'student') {
          // Residents only see tickets from their room
          return tickets.filter(t => 
            t.submittedBy?.id === userId || 
            (t.block && t.room && t.submittedBy?.block === t.block && t.submittedBy?.room === t.room)
          );
        } else {
          // Staff can see all tickets
          return tickets;
        }
      },

      cleanupListeners: () => {
        const { listeners } = get();
        listeners.forEach(unsubscribe => unsubscribe());
        set({ listeners: [] });
      }
    }),
    {
      name: 'biust-data-storage',
      partialize: (state) => ({
        blocks: state.blocks,
        residents: state.residents,
        tickets: state.tickets,
        users: state.users,
        notifications: state.notifications,
        dashboardAnalytics: state.dashboardAnalytics,
        budget: state.budget,
        inventory: state.inventory,
        assets: state.assets,
        suppliers: state.suppliers,
        projects: state.projects,
        preventiveMaintenance: state.preventiveMaintenance,
      }),
    }
  )
);
