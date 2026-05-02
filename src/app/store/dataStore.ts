/**
 * BIUST Smart Maintenance System - Data Store
 * 
 * Zustand store for managing application state with persistence
 * Handles all CRUD operations for blocks, residents, tickets, etc.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';
import { toast } from 'sonner';

// Import types
import {
  Ticket,
  InventoryItem,
  User,
  Block,
  Budget,
  DashboardAnalytics,
  Asset,
  Project,
  Supplier,
  Contract,
  Notification,
  Resident
} from '../types';

/**
 * Data store state interface
 */
interface DataState {
  // Data entities
  tickets: Ticket[];
  inventory: InventoryItem[];
  users: User[];
  blocks: Block[];
  notifications: Notification[];
  residents: Resident[];
  budget: Budget | null;
  dashboardAnalytics: DashboardAnalytics | null;
  assets: Asset[];
  projects: Project[];
  suppliers: Supplier[];
  contracts: Contract[];

  // Loading states
  isLoading: boolean;
  
  // CRUD operations
  fetchTickets: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBlocks: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchResidents: (blockId?: string) => Promise<void>;
  fetchPublicBlocks: () => Promise<void>;
  fetchPublicRooms: (blockId: string) => Promise<string[]>;
  fetchBudget: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  
  // Block operations
  addBlock: (block: Omit<Block, 'id'>) => Promise<void>;
  updateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  
  // Resident operations
  addResident: (resident: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (id: string, updates: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  
  // Analytics
  refreshAnalytics: () => Promise<void>;
}

/**
 * Generate unique ID
 */
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Data management store using Zustand with persistence
 */
export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  tickets: [],
  inventory: [],
  users: [],
  blocks: [],
  notifications: [],
  residents: [],
  budget: null,
  dashboardAnalytics: null,
  assets: [],
  projects: [],
  suppliers: [],
  contracts: [],
  isLoading: false,

  /**
   * Fetch tickets from server
   */
  fetchTickets: async () => {
    try {
      const res = await API.get('/tickets');
      set({ tickets: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      set({ tickets: [] });
    }
  },

  /**
   * Fetch inventory from server
   */
  fetchInventory: async () => {
    try {
      const res = await API.get('/inventory');
      set({ inventory: res.data });
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  },

  /**
   * Fetch users from server
   */
  fetchUsers: async () => {
    try {
      const res = await API.get('/users');
      set({ users: res.data });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  },

  /**
   * Fetch blocks from server
   */
  fetchBlocks: async () => {
    try {
      const res = await API.get('/blocks');
      set({ blocks: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
      set({ blocks: [] });
    }
  },

  /**
   * Fetch notifications from server
   */
  fetchNotifications: async () => {
    try {
      const res = await API.get('/notifications');
      set({ notifications: res.data });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },

  /**
   * Fetch residents from server
   */
  fetchResidents: async (blockId?: string) => {
    try {
      const url = blockId ? `/residents?blockId=${blockId}` : '/residents';
      const res = await API.get(url);
      set({ residents: res.data });
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    }
  },

  /**
   * Fetch public blocks (unauthenticated)
   */
  fetchPublicBlocks: async () => {
    try {
      const res = await API.get('/blocks');
      set({ blocks: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      console.error('Failed to fetch public blocks:', err);
      set({ blocks: [] });
    }
  },

  /**
   * Fetch public rooms for a block (unauthenticated)
   */
  fetchPublicRooms: async (blockId: string) => {
    try {
      if (!blockId) return [];
      const res = await API.get(`/blocks/${blockId}/rooms`);
      const data = Array.isArray(res.data) ? res.data : [];
      return data.map((r: any) => r.room_number || r.roomNumber);
    } catch (err) {
      console.error('Failed to fetch public rooms:', err);
      return [];
    }
  },

  /**
   * Fetch budget details
   */
  fetchBudget: async () => {
    try {
      const res = await API.get('/budget');
      set({ budget: res.data });
    } catch (err) {
      console.error('Failed to fetch budget:', err);
    }
  },

  /**
   * Fetch dashboard analytics
   */
  fetchAnalytics: async () => {
    try {
      const res = await API.get('/analytics');
      set({ dashboardAnalytics: res.data });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  },

  /**
   * Add new block
   */
  addBlock: async (block: Omit<Block, 'id'>) => {
    try {
      const res = await API.post('/blocks', block);
      set(state => ({ blocks: [...state.blocks, res.data] }));
      toast.success('Block added successfully');
    } catch (err) {
      console.error('Failed to add block:', err);
      toast.error('Failed to add block');
      throw err;
    }
  },

  /**
   * Update existing block
   */
  updateBlock: async (id: string, updates: Partial<Block>) => {
    try {
      const res = await API.patch(`/blocks/${id}`, updates);
      set(state => ({
        blocks: state.blocks.map(block => 
          block.id === id ? { ...block, ...res.data } : block
        )
      }));
      toast.success('Block updated successfully');
    } catch (err) {
      console.error('Failed to update block:', err);
      toast.error('Failed to update block');
      throw err;
    }
  },

  /**
   * Delete block
   */
  deleteBlock: async (id: string) => {
    try {
      await API.delete(`/blocks/${id}`);
      set(state => ({
        blocks: state.blocks.filter(block => block.id !== id)
      }));
      toast.success('Block deleted successfully');
    } catch (err) {
      console.error('Failed to delete block:', err);
      toast.error('Failed to delete block');
      throw err;
    }
  },

  /**
   * Add new resident
   */
  addResident: async (resident: Omit<Resident, 'id'>) => {
    try {
      const res = await API.post('/residents', resident);
      set(state => ({ residents: [...state.residents, res.data] }));
      toast.success('Resident added successfully');
    } catch (err) {
      console.error('Failed to add resident:', err);
      toast.error('Failed to add resident');
      throw err;
    }
  },

  /**
   * Update existing resident
   */
  updateResident: async (id: string, updates: Partial<Resident>) => {
    try {
      const res = await API.patch(`/residents/${id}`, updates);
      set(state => ({
        residents: state.residents.map(resident => 
          resident.id === id ? { ...resident, ...res.data } : resident
        )
      }));
      toast.success('Resident updated successfully');
    } catch (err) {
      console.error('Failed to update resident:', err);
      toast.error('Failed to update resident');
      throw err;
    }
  },

  /**
   * Delete resident
   */
  deleteResident: async (id: string) => {
    try {
      await API.delete(`/residents/${id}`);
      set(state => ({
        residents: state.residents.filter(resident => resident.id !== id)
      }));
      toast.success('Resident deleted successfully');
    } catch (err) {
      console.error('Failed to delete resident:', err);
      toast.error('Failed to delete resident');
      throw err;
    }
  },

  /**
   * Add new notification
   */
  addNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const res = await API.post('/notifications', notification);
      set(state => ({ notifications: [...state.notifications, res.data] }));
      toast.success('Notification added successfully');
    } catch (err) {
      console.error('Failed to add notification:', err);
      toast.error('Failed to add notification');
      throw err;
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (id: string) => {
    try {
      await API.patch(`/notifications/${id}`, { isRead: true });
      set(state => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  },

  /**
   * Refresh analytics data
   */
  refreshAnalytics: async () => {
    try {
      const res = await API.get('/analytics');
      set({ dashboardAnalytics: res.data });
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    }
  },
}));
