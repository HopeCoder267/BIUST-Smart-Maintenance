/**
 * BIUST Smart Maintenance System - Data Store
 * 
 * This Zustand store manages all application data including tickets, inventory, blocks, etc.
 * Provides full CRUD operations for all data entities.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
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
import { 
  mockTickets, 
  mockInventory, 
  mockBlocks, 
  mockNotifications,
  mockAnalytics,
  mockBudget 
} from '../services/mockData';

/**
 * Data store state interface
 */
interface DataState {
  // Data collections
  tickets: Ticket[];
  inventory: InventoryItem[];
  blocks: Block[];
  notifications: Notification[];
  
  // Ticket operations
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => Ticket;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  assignTechnician: (ticketId: string, technician: User) => void;
  updatePriority: (ticketId: string, priority: TicketPriority) => void;
  updateStatus: (ticketId: string, status: TicketStatus) => void;
  updateProgress: (ticketId: string, stage: ProgressStage, notes: string, updatedBy: User) => void;
  addTicketNote: (ticketId: string, content: string, createdBy: User, isInternal?: boolean) => void;
  
  // Inventory operations
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateStock: (id: string, quantity: number, reason: string) => void;
  
  // Block operations
  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  
  // Analytics
  dashboardAnalytics: DashboardAnalytics;
  budget: Budget;
  refreshAnalytics: () => void;
  
  // Utility functions
  getTicketsByUser: (userId: string, userRole: string) => Ticket[];
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
      // Initialize with mock data
      tickets: mockTickets,
      inventory: mockInventory,
      blocks: mockBlocks,
      notifications: mockNotifications,
      dashboardAnalytics: mockAnalytics,
      budget: mockBudget,
      
      /**
       * Refresh dashboard analytics based on current data
       */
      refreshAnalytics: () => {
        const { tickets, inventory } = get();
        
        const analytics: DashboardAnalytics = {
          totalTickets: tickets.length,
          openTickets: tickets.filter(t => t.status === 'open').length,
          inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          closedTickets: tickets.filter(t => t.status === 'closed').length,
          
          averageResolutionTime: 48, // Simplified for now
          
          ticketsByPriority: {
            low: tickets.filter(t => t.priority === 'low').length,
            medium: tickets.filter(t => t.priority === 'medium').length,
            high: tickets.filter(t => t.priority === 'high').length,
            critical: tickets.filter(t => t.priority === 'critical').length,
          },
          
          ticketsByCategory: {
            plumbing: tickets.filter(t => t.category === 'plumbing').length,
            electrical: tickets.filter(t => t.category === 'electrical').length,
            carpentry: tickets.filter(t => t.category === 'carpentry').length,
            hvac: tickets.filter(t => t.category === 'hvac').length,
            cleaning: tickets.filter(t => t.category === 'cleaning').length,
            security: tickets.filter(t => t.category === 'security').length,
            other: tickets.filter(t => t.category === 'other').length,
          },
          
          lowStockItems: inventory.filter(i => i.currentStock <= i.minStock).length,
          outOfStockItems: inventory.filter(i => i.currentStock === 0).length,
          
          ticketsThisWeek: tickets.filter(t => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(t.createdAt) > oneWeekAgo;
          }).length,
          
          ticketsThisMonth: tickets.filter(t => {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return new Date(t.createdAt) > oneMonthAgo;
          }).length,
          
          lastUpdated: new Date()
        };
        
        set({ dashboardAnalytics: analytics });
      },
      
      /**
       * Add a new ticket
       */
      addTicket: (ticketData) => {
        const newTicket: Ticket = {
          ...ticketData,
          id: generateId('ticket'),
          ticketNumber: generateTicketNumber(),
          status: 'open',
          currentStage: 'report_submitted',
          createdAt: new Date(),
          updatedAt: new Date(),
          progressHistory: [
            {
              stage: 'report_submitted',
              timestamp: new Date(),
              updatedBy: ticketData.submittedBy,
              notes: 'Initial report submitted'
            }
          ],
          notes: []
        };
        
        set((state) => ({
          tickets: [...state.tickets, newTicket]
        }));
        
        get().refreshAnalytics();
        
        toast.success('Ticket created successfully', {
          description: `Ticket ${newTicket.ticketNumber} has been created`
        });
        
        return newTicket;
      },
      
      /**
       * Update ticket with partial data
       */
      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id
              ? { ...ticket, ...updates, updatedAt: new Date() }
              : ticket
          )
        }));
        
        get().refreshAnalytics();
        
        toast.success('Ticket updated successfully');
      },
      
      /**
       * Delete a ticket
       */
      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id)
        }));
        
        get().refreshAnalytics();
        
        toast.success('Ticket deleted successfully');
      },
      
      /**
       * Assign technician to a ticket
       */
      assignTechnician: (ticketId, technician) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          toast.error('Ticket not found');
          return;
        }
        
        // Update ticket with assigned technician
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  assignedTo: technician,
                  status: 'in_progress' as TicketStatus,
                  updatedAt: new Date()
                }
              : t
          )
        }));
        
        // Add progress history entry
        get().updateProgress(
          ticketId,
          'technician_assigned',
          `Assigned to ${technician.name}`,
          technician
        );
        
        toast.success('Technician assigned successfully', {
          description: `${technician.name} has been assigned to this ticket`
        });

        // Notify the resident to set/confirm their availability
        if (ticket.submittedBy) {
          get().addNotification({
            title: 'Technician Assigned - Set Availability',
            message: `Technician ${technician.name} has been assigned to your ticket #${ticket.ticketNumber}. Please ensure your availability is up to date.`,
            type: 'info',
            priority: 'high',
            targetUsers: [ticket.submittedBy.id]
          });
        }
      },
      
      /**
       * Update ticket priority
       */
      updatePriority: (ticketId, priority) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, priority, updatedAt: new Date() }
              : ticket
          )
        }));
        
        toast.success('Priority updated', {
          description: `Priority set to ${priority}`
        });
      },
      
      /**
       * Update ticket status
       */
      updateStatus: (ticketId, status) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status, updatedAt: new Date() }
              : ticket
          )
        }));
        
        toast.success('Status updated', {
          description: `Status changed to ${status.replace('_', ' ')}`
        });
      },
      
      /**
       * Update ticket progress stage
       */
      updateProgress: (ticketId, stage, notes, updatedBy) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) {
          toast.error('Ticket not found');
          return;
        }
        
        const newProgressEntry: ProgressHistoryEntry = {
          stage,
          timestamp: new Date(),
          updatedBy,
          notes
        };
        
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  currentStage: stage,
                  progressHistory: [...t.progressHistory, newProgressEntry],
                  updatedAt: new Date()
                }
              : t
          )
        }));
        
        toast.success('Progress updated', {
          description: notes
        });
      },
      
      /**
       * Add note to ticket
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
        
        toast.success('Note added successfully');
      },
      
      /**
       * Add inventory item
       */
      addInventoryItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: generateId('inv')
        };
        
        set((state) => ({
          inventory: [...state.inventory, newItem]
        }));
        
        toast.success('Inventory item added');
      },
      
      /**
       * Update inventory item
       */
      updateInventoryItem: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }));
        
        toast.success('Inventory item updated');
      },
      
      /**
       * Delete inventory item
       */
      deleteInventoryItem: (id) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== id)
        }));
        
        toast.success('Inventory item deleted');
      },
      
      /**
       * Update inventory stock levels
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
       * Add new block
       */
      addBlock: (block) => {
        const newBlock: Block = {
          ...block,
          id: generateId('block')
        };
        
        set((state) => ({
          blocks: [...state.blocks, newBlock]
        }));
        
        toast.success('Block added successfully');
      },
      
      /**
       * Update block
       */
      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          )
        }));
        
        toast.success('Block updated successfully');
      },
      
      /**
       * Delete block
       */
      deleteBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id)
        }));
        
        toast.success('Block deleted successfully');
      },
      
      /**
       * Add notification
       */
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId('notif'),
          createdAt: new Date(),
          read: false
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
      },
      
      /**
       * Mark notification as read
       */
      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        }));
      },
      
      /**
       * Get tickets filtered by user
       */
      getTicketsByUser: (userId, userRole) => {
        const { tickets } = get();
        
        // Students/staff see only their own tickets
        if (userRole === 'student' || userRole === 'staff') {
          return tickets.filter((ticket) => ticket.submittedBy.id === userId);
        }
        
        // Technicians see tickets assigned to them
        if (userRole === 'technician') {
          return tickets.filter((ticket) => ticket.assignedTo?.id === userId);
        }
        
        // Operators, assistants, and coordinators see all tickets
        return tickets;
      },
      
      /**
       * Get ticket by ID
       */
      getTicketById: (id) => {
        return get().tickets.find((ticket) => ticket.id === id);
      },
      
      /**
       * Reset all data to initial mock data
       */
      resetData: () => {
        set({
          tickets: mockTickets,
          inventory: mockInventory,
          blocks: mockBlocks,
          notifications: mockNotifications,
          dashboardAnalytics: mockAnalytics,
          budget: mockBudget
        });
        
        toast.success('Data reset to initial state');
      }
    }),
    {
      name: 'biust-data-storage'
    }
  )
);
