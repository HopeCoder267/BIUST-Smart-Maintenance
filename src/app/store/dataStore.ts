/**
 * BIUST Smart Maintenance System - Mock Data Store
 * 
 * This file provides mock data management for frontend-only operation.
 * Replace with real dataStore when connecting to backend.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/mockData';
import { Block, Resident, Ticket } from '../types';

interface DataState {
  blocks: Block[];
  residents: Resident[];
  tickets: Ticket[];
  users: any[];
  notifications: any[];
  isLoading: boolean;
  error: string | null;

  // Block operations
  fetchBlocks: () => Promise<void>;
  addBlock: (blockData: Partial<Block>) => Promise<boolean>;
  updateBlock: (id: string, updates: Partial<Block>) => Promise<boolean>;
  deleteBlock: (id: string) => Promise<boolean>;

  // Resident operations
  fetchResidents: (blockId?: string) => Promise<void>;
  addResident: (residentData: Partial<Resident>) => Promise<boolean>;
  deleteResident: (id: string) => Promise<boolean>;

  // Ticket operations
  fetchTickets: () => Promise<void>;
  addTicket: (ticketData: Partial<Ticket>) => Promise<boolean>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<boolean>;
  deleteTicket: (id: string) => Promise<boolean>;

  // User operations
  fetchUsers: () => Promise<void>;
  assignTechnician: (ticketId: string, technicianId: string) => Promise<boolean>;
  updateProgress: (ticketId: string, progress: any) => Promise<boolean>;
  updateStatus: (ticketId: string, status: string) => Promise<boolean>;
  updatePriority: (ticketId: string, priority: string) => Promise<boolean>;

  // Notification operations
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: any) => Promise<boolean>;

  // Analytics
  getAnalytics: () => any;
  dashboardAnalytics: any;
  fetchAnalytics: () => Promise<void>;

  // Public login operations
  fetchPublicBlocks: () => Promise<void>;
  fetchPublicRooms: (blockId: string) => Promise<string[]>;

  // Budget and inventory operations
  budget: any;
  inventory: any[];
  fetchBudget: () => Promise<void>;
  fetchInventory: () => Promise<void>;

  // Attachment operations
  attachments: any[];
  uploadAttachment: (file: File, ticketId?: string) => Promise<boolean>;
  deleteAttachment: (attachmentId: string) => Promise<boolean>;

  // Asset operations
  assets: any[];
  fetchAssets: () => Promise<void>;
  addAsset: (asset: any) => Promise<boolean>;
  updateAsset: (assetId: string, updates: any) => Promise<boolean>;
  deleteAsset: (assetId: string) => Promise<boolean>;

  // Project operations
  projects: any[];
  fetchProjects: () => Promise<void>;
  addProject: (project: any) => Promise<boolean>;

  // Preventive maintenance operations
  preventiveMaintenance: any[];
  fetchPreventiveMaintenance: () => Promise<void>;
  addPreventiveMaintenance: (maintenance: any) => Promise<boolean>;
  updatePreventiveMaintenance: (maintenanceId: string, updates: any) => Promise<boolean>;
  deletePreventiveMaintenance: (maintenanceId: string) => Promise<boolean>;
}

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
      dashboardAnalytics: {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        completedTickets: 0,
        totalBlocks: 0,
        totalResidents: 0,
        totalCapacity: 0,
        totalOccupied: 0,
      },
      budget: {
        total: 500000,
        spent: 125000,
        remaining: 375000,
        allocations: {
          maintenance: 80000,
          repairs: 30000,
          materials: 15000
        }
      },
      inventory: [],
      attachments: [],
      assets: [],
      projects: [],
      preventiveMaintenance: [],

      fetchBlocks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get('/blocks');
          set({ blocks: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addBlock: async (blockData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.post('/blocks', blockData);
          set(state => ({ 
            blocks: [...state.blocks, response.data], 
            isLoading: false 
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateBlock: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.put(`/blocks/${id}`, updates);
          set(state => ({
            blocks: state.blocks.map(block => 
              block.id === id ? response.data : block
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deleteBlock: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await API.delete(`/blocks/${id}`);
          set(state => ({
            blocks: state.blocks.filter(block => block.id !== id),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      fetchResidents: async (blockId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get('/students');
          const residents = blockId 
            ? response.data.filter((r: any) => r.block_name === blockId)
            : response.data;
          set({ residents, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addResident: async (residentData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.post('/students', residentData);
          set(state => ({ 
            residents: [...state.residents, response.data], 
            isLoading: false 
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deleteResident: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await API.delete(`/students/${id}`);
          set(state => ({
            residents: state.residents.filter(resident => resident.id !== id),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get('/tickets');
          set({ tickets: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addTicket: async (ticketData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.post('/tickets', ticketData);
          set(state => ({ 
            tickets: [...state.tickets, response.data], 
            isLoading: false 
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateTicket: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.put(`/tickets/${id}`, updates);
          set(state => ({
            tickets: state.tickets.map(ticket => 
              ticket.id === id ? response.data : ticket
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deleteTicket: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await API.delete(`/tickets/${id}`);
          set(state => ({
            tickets: state.tickets.filter(ticket => ticket.id !== id),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      getAnalytics: () => {
        const { blocks, residents, tickets, users } = get();
        return {
          totalBlocks: blocks.length,
          totalResidents: residents.length,
          totalTickets: tickets.length,
          openTickets: tickets.filter(t => t.status === 'open').length,
          inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          totalCapacity: blocks.reduce((sum, block) => sum + block.capacity, 0),
          totalOccupied: blocks.reduce((sum, block) => sum + block.total_residents, 0),
          technicianPerformance: users
            .filter(u => u.role === 'technician')
            .map(technician => ({
              technician: technician,
              name: technician.name,
              total: tickets.filter(t => t.assignedTo === technician.id).length,
              completed: tickets.filter(t => t.assignedTo === technician.id && t.status === 'completed').length,
              avgTime: 2.5, // Mock average completion time in days
              efficiency: Math.round((tickets.filter(t => t.assignedTo === technician.id && t.status === 'completed').length / Math.max(tickets.filter(t => t.assignedTo === technician.id).length, 1)) * 100)
            })),
        };
      },

      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get('/users');
          set({ users: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      assignTechnician: async (ticketId, technicianId) => {
        set({ isLoading: true, error: null });
        try {
          await API.put(`/tickets/${ticketId}`, { assigned_to: technicianId });
          set(state => ({
            tickets: state.tickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, assigned_to: technicianId, updated_at: new Date().toISOString() }
                : ticket
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateProgress: async (ticketId, progress) => {
        set({ isLoading: true, error: null });
        try {
          await API.put(`/tickets/${ticketId}`, { progress });
          set(state => ({
            tickets: state.tickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, progress, updated_at: new Date().toISOString() }
                : ticket
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateStatus: async (ticketId: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            tickets: state.tickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, status, updated_at: new Date().toISOString() }
                : ticket
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updatePriority: async (ticketId: string, priority: string) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            tickets: state.tickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, priority, updated_at: new Date().toISOString() }
                : ticket
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock notifications data
          const mockNotifications = [
            { id: '1', type: 'maintenance', message: 'Scheduled maintenance for Block A', read: false },
            { id: '2', type: 'emergency', message: 'Emergency repair needed in Room 101', read: false },
          ];
          set({ notifications: mockNotifications, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addNotification: async (notification) => {
        try {
          const newNotification = {
            id: `notif-${Date.now()}`,
            ...notification,
            created_at: new Date().toISOString(),
            read: false
          };
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        }
      },

      fetchAnalytics: async () => {
        set({ isLoading: true, error: null });
        try {
          const analytics = get().getAnalytics();
          set({ 
            dashboardAnalytics: analytics,
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchPublicBlocks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.get('/blocks');
          set({ blocks: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchPublicRooms: async (blockId: string) => {
        try {
          // Generate room numbers based on block data
          const block = get().blocks.find(b => b.id === blockId);
          if (!block) {
            throw new Error('Block not found');
          }
          
          // Generate room numbers from 101 to (100 + total_rooms)
          const rooms = [];
          for (let i = 1; i <= block.total_rooms; i++) {
            rooms.push((100 + i).toString());
          }
          
          return rooms;
        } catch (error: any) {
          throw new Error('Failed to fetch rooms');
        }
      },

      fetchBudget: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock budget data - already set in initial state
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchInventory: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock inventory data
          const mockInventory = [
            { id: 'inv-1', name: 'Light Bulbs', quantity: 150, unit: 'pieces', category: 'Electrical' },
            { id: 'inv-2', name: 'Pipe Fittings', quantity: 75, unit: 'sets', category: 'Plumbing' },
            { id: 'inv-3', name: 'Door Locks', quantity: 30, unit: 'pieces', category: 'Hardware' },
            { id: 'inv-4', name: 'Paint Buckets', quantity: 25, unit: 'buckets', category: 'General' },
            { id: 'inv-5', name: 'Electrical Tape', quantity: 100, unit: 'rolls', category: 'Electrical' }
          ];
          set({ inventory: mockInventory, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      uploadAttachment: async (file: File, ticketId?: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock file upload
          const newAttachment = {
            id: `att-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            ticketId: ticketId || null,
            uploadedAt: new Date().toISOString(),
            url: `mock-url/${file.name}`
          };
          
          set(state => ({
            attachments: [...state.attachments, newAttachment],
            isLoading: false
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deleteAttachment: async (attachmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            attachments: state.attachments.filter(att => att.id !== attachmentId),
            isLoading: false
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Asset operations
      fetchAssets: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock assets data
          const mockAssets = [
            { id: 'asset-1', name: 'HVAC System', purchaseDate: '2023-01-15', purchaseCost: 50000, currentValue: 45000, location: 'Block A', status: 'operational' },
            { id: 'asset-2', name: 'Generator', purchaseDate: '2023-03-20', purchaseCost: 75000, currentValue: 68000, location: 'Block B', status: 'maintenance' },
            { id: 'asset-3', name: 'Water Pump', purchaseDate: '2023-06-10', purchaseCost: 12000, currentValue: 11000, location: 'Block C', status: 'operational' }
          ];
          set({ assets: mockAssets, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addAsset: async (asset: any) => {
        set({ isLoading: true, error: null });
        try {
          const newAsset = {
            id: `asset-${Date.now()}`,
            ...asset,
            purchaseDate: asset.purchaseDate || new Date().toISOString().split('T')[0],
            currentValue: asset.currentValue || asset.purchaseCost,
            status: asset.status || 'operational'
          };
          set(state => ({
            assets: [...state.assets, newAsset],
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateAsset: async (assetId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            assets: state.assets.map(asset => 
              asset.id === assetId ? { ...asset, ...updates } : asset
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deleteAsset: async (assetId: string) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            assets: state.assets.filter(asset => asset.id !== assetId),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Project operations
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock projects data
          const mockProjects = [
            { id: 'proj-1', name: 'Block A Renovation', status: 'in_progress', budget: 100000, spent: 45000, startDate: '2024-01-01', endDate: '2024-06-30' },
            { id: 'proj-2', name: 'Solar Panel Installation', status: 'planned', budget: 200000, spent: 0, startDate: '2024-07-01', endDate: '2024-12-31' }
          ];
          set({ projects: mockProjects, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addProject: async (project: any) => {
        set({ isLoading: true, error: null });
        try {
          const newProject = {
            id: `proj-${Date.now()}`,
            ...project,
            status: project.status || 'planned',
            spent: project.spent || 0
          };
          set(state => ({
            projects: [...state.projects, newProject],
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Preventive maintenance operations
      fetchPreventiveMaintenance: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock preventive maintenance data
          const mockPreventiveMaintenance = [
            { id: 'pm-1', title: 'HVAC Monthly Check', frequency: 'monthly', lastPerformed: '2024-01-15', nextDue: '2024-02-15', assignedTo: 'John Doe' },
            { id: 'pm-2', title: 'Generator Weekly Test', frequency: 'weekly', lastPerformed: '2024-01-20', nextDue: '2024-01-27', assignedTo: 'Jane Smith' }
          ];
          set({ preventiveMaintenance: mockPreventiveMaintenance, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addPreventiveMaintenance: async (maintenance: any) => {
        set({ isLoading: true, error: null });
        try {
          const newMaintenance = {
            id: `pm-${Date.now()}`,
            ...maintenance,
            lastPerformed: maintenance.lastPerformed || new Date().toISOString().split('T')[0],
            status: maintenance.status || 'scheduled'
          };
          set(state => ({
            preventiveMaintenance: [...state.preventiveMaintenance, newMaintenance],
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updatePreventiveMaintenance: async (maintenanceId: string, updates: any) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            preventiveMaintenance: state.preventiveMaintenance.map(pm => 
              pm.id === maintenanceId ? { ...pm, ...updates } : pm
            ),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      deletePreventiveMaintenance: async (maintenanceId: string) => {
        set({ isLoading: true, error: null });
        try {
          set(state => ({
            preventiveMaintenance: state.preventiveMaintenance.filter(pm => pm.id !== maintenanceId),
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
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
      }),
    }
  )
);
