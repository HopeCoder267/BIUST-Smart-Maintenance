/**
 * BIUST Smart Maintenance System - Central Data Store
 * 
 * This store is the brain of our application, handling all maintenance tickets, 
 * inventory stock, residential blocks, and system notifications using Zustand.
 * It ensures data stays in sync across the entire system.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import API from '../services/api';
import {
  mockTickets,
  mockInventory,
  mockBlocks,
  mockNotifications,
  mockAnalytics,
  mockBudget
} from '../services/mockData';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketCategory,
  ProgressStage,
  User,
  InventoryItem,
  Block,
  Room,
  Notification,
  ProgressHistoryEntry,
  DashboardAnalytics,
  Budget
} from '../types';

/**
 * Data store state interface
 */
interface DataState {
  // Data collections
  tickets: Ticket[];
  inventory: InventoryItem[];
  blocks: Block[];
  notifications: Notification[];
  
  // Async Data Fetching
  fetchTickets: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchBlocks: () => Promise<void>;
  fetchBudget: () => Promise<void>;
  fetchRooms: (blockName: string) => Promise<string[]>;
  
  // Ticket operations
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => Promise<Ticket>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  assignTechnician: (ticketId: string, technician: User) => Promise<void>;
  updatePriority: (ticketId: string, priority: TicketPriority) => Promise<void>;
  updateStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  updateProgress: (ticketId: string, stage: ProgressStage, notes: string, updatedBy: User) => Promise<void>;
  addTicketNote: (ticketId: string, content: string, createdBy: User, isInternal?: boolean) => Promise<void>;
  
  // Inventory operations
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number, reason: string) => Promise<void>;
  
  // Block operations
  addBlock: (block: Omit<Block, 'id'>) => Promise<void>;
  updateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  
  // Analytics
  dashboardAnalytics: DashboardAnalytics;
  budget: Budget;
  refreshAnalytics: () => Promise<void>;
  
  // Utility functions
  getTicketsByUser: (userId: string, userRole: string) => Ticket[];
  getFilteredNotifications: (user: User) => Notification[];
  getTicketById: (id: string) => Ticket | undefined;
  resetData: () => void;
}

/**
 * Generate unique ticket number
 */
const generateTicketNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TKT-${year}-${random}`;
};

/**
 * Generate unique ID
 */
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Data management store using Zustand with persistence
 */
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initialize with empty collections, data will be fetched from API
      tickets: [],
      inventory: [],
      blocks: [],
      notifications: [],
      dashboardAnalytics: {} as DashboardAnalytics,
      budget: {} as Budget,
      
      /**
       * Brings in all tickets from the server and updates the local state.
       * Once fetched, it automatically refreshes dashboard analytics.
       */
      fetchTickets: async () => {
        try {
          const res = await API.get('/tickets');
          set({ tickets: res.data });
          await get().refreshAnalytics();
        } catch (err) {
          console.error('Oops! Could not fetch tickets:', err);
        }
      },

      /**
       * Synchronizes our local inventory list with the database.
       */
      fetchInventory: async () => {
        try {
          const res = await API.get('/inventory');
          set({ inventory: res.data });
          await get().refreshAnalytics();
        } catch (err) {
          console.error('Inventory sync failed:', err);
        }
      },

      /**
       * Grabs any new notifications for the logged-in user.
       */
      fetchNotifications: async () => {
        try {
          const res = await API.get('/notifications');
          set({ notifications: res.data });
        } catch (err) {
          console.error('Failed to grab notifications:', err);
        }
      },

      /**
       * Loads all physical blocks/buildings managed by the system.
       */
      fetchBlocks: async () => {
        try {
          const res = await API.get('/blocks');
          set({ blocks: Array.isArray(res.data) ? res.data : [] });
        } catch (err) {
          console.error('Could not load building blocks:', err);
          set({ blocks: [] });
        }
      },

      /**
       * Fetches the current institutional budget stats.
       */
      fetchBudget: async () => {
        try {
          const { data } = await API.get('/budget');
          set({ 
            budget: {
              totalAmount: data.total_amount,
              allocatedAmount: data.allocated_amount,
              remainingAmount: data.remaining_amount
            }
          });
        } catch (err) {
          console.error('Budget load failed:', err);
        }
      },

      /**
       * Fetches available rooms for a specific building block.
       */
      fetchRooms: async (blockName: string) => {
        try {
          const res = await API.get(`/rooms?block=${encodeURIComponent(blockName)}`);
          return Array.isArray(res.data) ? res.data.map((r: any) => r.room_number) : [];
        } catch (err) {
          console.error(`Error finding rooms for ${blockName}:`, err);
          return [];
        }
      },
      
      /**
       * Recalculates dashboard metrics based on current ticket and inventory data.
       * Uses a single-pass reduction for maximum performance.
       */
      refreshAnalytics: async () => {
        const { tickets, inventory } = get();
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const analytics: DashboardAnalytics = tickets.reduce((acc, t) => {
          // Status counts
          if (t.status === 'open') acc.openTickets++;
          else if (t.status === 'in_progress') acc.inProgressTickets++;
          else if (t.status === 'completed') acc.completedTickets++;
          else if (t.status === 'closed') acc.closedTickets++;
          
          acc.totalTickets++;
          acc.totalBlocks = blocks.length;
          
          // Priority distribution
          const priority = (t.priority as string).toLowerCase();
          if (priority === 'low') acc.ticketsByPriority.low++;
          else if (priority === 'medium') acc.ticketsByPriority.medium++;
          else if (priority === 'high') acc.ticketsByPriority.high++;
          else if (priority === 'critical' || priority === 'emergency') acc.ticketsByPriority.critical++;
          
          // Category distribution
          const category = (t.category as string).toLowerCase();
          if (Object.prototype.hasOwnProperty.call(acc.ticketsByCategory, category)) {
            acc.ticketsByCategory[category]++;
          } else {
            acc.ticketsByCategory.other++;
          }
          
          // Time-based stats
          const createdDate = new Date(t.createdAt);
          if (createdDate > oneWeekAgo) acc.ticketsThisWeek++;
          if (createdDate > oneMonthAgo) acc.ticketsThisMonth++;
          
          return acc;
        }, {
          totalTickets: tickets.length,
          totalBlocks: blocks.length,
          openTickets: 0,
          inProgressTickets: 0,
          completedTickets: 0,
          closedTickets: 0,
          averageResolutionTime: 48, // Standard average fallback
          ticketsByPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          ticketsByCategory: { plumbing: 0, electrical: 0, carpentry: 0, hvac: 0, cleaning: 0, security: 0, other: 0 },
          lowStockItems: 0,
          outOfStockItems: 0,
          ticketsThisWeek: 0,
          ticketsThisMonth: 0,
          lastUpdated: new Date()
        });
        
        // Inventory stats (separate pass for clarity and since inventory is usually smaller)
        analytics.lowStockItems = inventory.filter(i => i.currentStock <= i.minStock).length;
        analytics.outOfStockItems = inventory.filter(i => i.currentStock === 0).length;
        
        set({ dashboardAnalytics: analytics });
      },
      
      /**
       * Creates a brand new maintenance request.
       * Sets it up in our local list and alerts the user on success.
       */
      addTicket: async (ticketData) => {
        try {
          const res = await API.post('/tickets', ticketData);
          const newTicket = res.data;
          
          set((state) => ({
            tickets: [...state.tickets, newTicket]
          }));
          
          await get().refreshAnalytics();
          
          toast.success('Ticket created!', {
            description: `We've logged ticket ${newTicket.ticketNumber} for you.`
          });
          
          return newTicket;
        } catch (err) {
          console.error('Ticket creation hit a snag:', err);
          toast.error('Could not create ticket. Please try again.');
          throw err;
        }
      },
      
      /**
       * Updates an existing ticket with new details.
       */
      updateTicket: async (id, updates) => {
        try {
          const res = await API.put(`/tickets/${id}`, updates);
          const updatedTicket = res.data;
          
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.id === id ? updatedTicket : ticket
            )
          }));
          
          await get().refreshAnalytics();
          toast.success('Ticket updated smoothly');
        } catch (err) {
          console.error('Update failed:', err);
          toast.error('Failed to save ticket changes.');
          throw err;
        }
      },
      
      /**
       * Removes a ticket from the system.
       */
      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id)
        }));
        
        get().refreshAnalytics();
        
        toast.success('Ticket removed successfully');
      },
      
      /**
       * Hands off a ticket to a technician.
       * Updates both the local state and the database.
       */
      assignTechnician: async (ticketId, technician) => {
        try {
          const res = await API.patch(`/tickets/${ticketId}`, {
            assigned_to: technician.id,
            status: 'in_progress',
            current_stage: 'technician_assigned'
          });
          
          const updatedTicket = res.data;
          
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.id === ticketId ? updatedTicket : t
            )
          }));
          
          await get().refreshAnalytics();
          
          toast.success('Technician assigned successfully', {
            description: `${technician.name} is now on the job!`
          });
        } catch (err) {
          console.error('Assignment failed:', err);
          toast.error('Could not assign technician. System error.');
        }
      },
      
      /**
       * Adjusts the urgency level of a ticket.
       */
      updatePriority: (ticketId, priority) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, priority, updatedAt: new Date() }
              : ticket
          )
        }));
        
        toast.success(`Priority set to ${priority}`);
      },
      
      /**
       * Moves a ticket through its lifecycle (e.g., Open -> In Progress -> Resolved).
       */
      updateStatus: async (ticketId, status) => {
        try {
          const res = await API.patch(`/tickets/${ticketId}`, { status });
          const updatedTicket = res.data;
          
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.id === ticketId ? updatedTicket : t
            )
          }));
          
          await get().refreshAnalytics();
          toast.success(`Status updated to ${status.replace('_', ' ')}`);
        } catch (err) {
          console.error('Status sync failed:', err);
          throw err;
        }
      },
      
      /**
       * Logs a major milestone in the ticket's progress history.
       */
      updateProgress: async (ticketId, stage, notes, updatedBy) => {
        try {
          const res = await API.patch(`/tickets/${ticketId}`, { 
            current_stage: stage,
            latest_notes: notes
          });
          
          const updatedTicket = res.data;
          
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.id === ticketId ? updatedTicket : t
            )
          }));
          
          toast.success('Progress synchronized', {
            description: notes
          });
        } catch (err) {
          console.error('Progress update failed:', err);
          throw err;
        }
      },
      
      /**
       * Adds a personal or system note to a ticket.
       */
      addTicketNote: (ticketId, content, createdBy, isInternal = false) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          toast.error('Ticket not found');
          return;
        }
        
        const newNote = {
          id: generateId('note'),
          ticketId,
          content,
          createdBy,
          createdAt: new Date(),
          isInternal
        };
        
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  notes: [...(t.notes || []), newNote],
                  updatedAt: new Date()
                }
              : t
          )
        }));
        
        toast.success('Note attached');
      },
      
      /**
       * Catalogues a new item in our maintenance inventory.
       */
      addInventoryItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: generateId('inv')
        };
        
        set((state) => ({
          inventory: [...state.inventory, newItem]
        }));
        
        toast.success('Item added to inventory');
      },
      
      /**
       * Modifies an existing inventory item's details.
       */
      updateInventoryItem: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }));
        
        toast.success('Item details updated');
      },
      
      /**
       * Discards an item from the inventory.
       */
      deleteInventoryItem: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id)
        }));
        
        toast.success('Item removed from inventory');
      },
      
      /**
       * Updates the stock level for a specific item (restocks or usage).
       */
      updateStock: (id, quantity, reason) => {
        const item = get().inventory.find((i) => i.id === id);
        if (!item) {
          toast.error('Item not found');
          return;
        }
        
        const newQuantity = item.currentStock + quantity;
        
        if (newQuantity < 0) {
          toast.error('Insufficient stock');
          return;
        }
        
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === id
              ? {
                  ...i,
                  currentStock: newQuantity,
                  lastRestocked: new Date()
                }
              : i
          )
        }));
        
        toast.success('Stock updated', {
          description: reason
        });
      },
      
      /**
       * Registers a new physical building block.
       */
      addBlock: async (block) => {
        try {
          const res = await API.post('/blocks', block);
          const newBlock = res.data;
          
          set((state) => ({
            blocks: [...state.blocks, newBlock]
          }));
          
          toast.success('New block registered');
        } catch (err) {
          console.error('Failed to add block:', err);
          toast.error('Could not register block.');
        }
      },
      
      /**
       * Updates building block info.
       */
      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          )
        }));
        
        toast.success('Block updated');
      },
      
      /**
       * Deletes a building block from the records.
       */
      deleteBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id)
        }));
        
        toast.success('Block removed');
      },
      
      /**
       * Broadcasts a notification to targeted users or blocks.
       * Synchronizes with the backend to ensure all residents receive the alert.
       */
      addNotification: async (notificationData) => {
        try {
          const res = await API.post('/notifications', notificationData);
          const newNotification = res.data;
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications]
          }));
          
          return newNotification;
        } catch (err) {
          console.error('Notification dispatch failed:', err);
          throw err;
        }
      },
      
      /**
       * Clears a notification once it's been seen.
       */
      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        }));
      },
      
      /**
       * Filters tickets based on user permissions and roles.
       */
      getTicketsByUser: (userId, userRole) => {
        const { tickets } = get();
        if (userRole === 'coordinator' || userRole === 'operator') return tickets;
        if (userRole === 'technician') return tickets.filter(t => t.assignedTo?.id === userId);
        return tickets.filter(t => t.submittedBy.id === userId);
      },

      /**
       * Sophisticated notification filtering based on user identity, role, and location.
       */
      getFilteredNotifications: (user) => {
        const { notifications } = get();
        return notifications.filter(n => {
          const isTargeted = n.targetUsers?.includes(user.id);
          const roleMatch = n.targetRoles?.includes(user.role);
          const blockMatch = user.block && n.targetBlocks?.includes(user.block);
          const isGlobal = n.type === 'alert' && (!n.targetUsers?.length) && (!n.targetBlocks?.length);
          
          if (isTargeted) return true;
          if (roleMatch) return n.targetBlocks?.length ? blockMatch : true;
          if (blockMatch) return true;
          return isGlobal;
        });
      },

      /**
       * Finds a specific ticket by its unique ID.
       */
      getTicketById: (id) => get().tickets.find(t => t.id === id),
      
      /**
       * Reverts all system data to its fresh, initial state.
       */
      resetData: () => {
        set({
          tickets: mockTickets || [],
          inventory: mockInventory || [],
          blocks: mockBlocks || [],
          notifications: mockNotifications || [],
          dashboardAnalytics: mockAnalytics || {},
          budget: mockBudget || {}
        });
        
        toast.success('System reset to baseline');
      }
    }),
    {
      name: 'biust-data-storage'
    }
  )
);
