/**
 * BIUST Smart Maintenance System - Mock Data Service
 * 
 * This file provides mock data for development and demonstration purposes.
 * In production, this would be replaced with actual API calls to the backend.
 */

import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketCategory,
  ProgressStage,
  User,
  JobCard,
  InventoryItem,
  Block,
  Room,
  Notification,
  Budget,
  Project,
  Supplier,
  DashboardAnalytics
} from '../types';

/**
 * Generate mock tickets for demonstration
 * Creates a variety of tickets in different stages and with different properties
 */
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    ticketNumber: 'TKT-2024-001',
    title: 'Broken shower head in bathroom',
    description: 'The shower head is leaking and water pressure is very low. Needs urgent replacement.',
    category: 'plumbing',
    priority: 'high',
    status: 'in_progress',
    currentStage: 'technician_assigned',
    block: 'Block A',
    room: '101',
    submittedBy: {
      id: 'student-1',
      name: 'Kagiso Tebogo',
      role: 'student',
      studentId: 'ST-2024-001',
      block: 'Block A',
      room: '101'
    },
    assignedTo: {
      id: 'tech-1',
      name: 'Kagiso',
      role: 'technician',
      email: 'technician@biust.ac.bw'
    },
    createdAt: new Date('2024-03-20T10:30:00'),
    updatedAt: new Date('2024-03-22T14:20:00'),
    progressHistory: [
      {
        stage: 'report_submitted',
        timestamp: new Date('2024-03-20T10:30:00'),
        updatedBy: {
          id: 'student-1',
          name: 'Kagiso Tebogo',
          role: 'student'
        },
        notes: 'Initial report submitted by resident'
      },
      {
        stage: 'operator_review',
        timestamp: new Date('2024-03-20T15:45:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Molopo',
          role: 'operator'
        },
        notes: 'Reviewed and assigned high priority'
      },
      {
        stage: 'sourcing_materials',
        timestamp: new Date('2024-03-21T09:00:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Molopo',
          role: 'operator'
        },
        notes: 'Shower head ordered from supplier'
      },
      {
        stage: 'technician_assigned',
        timestamp: new Date('2024-03-22T14:20:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Molopo',
          role: 'operator'
        },
        notes: 'Assigned to Kagiso'
      }
    ],
    notes: [
      {
        id: 'note-1',
        ticketId: 'ticket-1',
        content: 'Parts have arrived. Will schedule visit with resident.',
        createdBy: {
          id: 'tech-1',
          name: 'Kagiso',
          role: 'technician'
        },
        createdAt: new Date('2024-03-22T16:00:00'),
        isInternal: false
      }
    ]
  },
  {
    id: 'ticket-2',
    ticketNumber: 'TKT-2024-002',
    title: 'Faulty electrical outlet',
    description: 'One of the wall outlets is sparking when I plug in devices. Safety hazard.',
    category: 'electrical',
    priority: 'critical',
    status: 'in_progress',
    currentStage: 'work_in_progress',
    block: 'Block A',
    room: '102',
    submittedBy: {
      id: 'student-2',
      name: 'Bonolo Karabo',
      role: 'student',
      studentId: 'ST-2024-002',
      block: 'Block A',
      room: '102'
    },
    assignedTo: {
      id: 'tech-2',
      name: 'Thabo',
      role: 'technician',
      email: 'karabo.korong@biust.ac.bw'
    },
    createdAt: new Date('2024-03-19T08:15:00'),
    updatedAt: new Date('2024-03-23T10:30:00'),
    progressHistory: [
      {
        stage: 'report_submitted',
        timestamp: new Date('2024-03-19T08:15:00'),
        updatedBy: {
          id: 'student-2',
          name: 'Bonolo Karabo',
          role: 'student'
        }
      },
      {
        stage: 'operator_review',
        timestamp: new Date('2024-03-19T09:00:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Korong',
          role: 'operator'
        },
        notes: 'Marked as critical - electrical safety issue'
      },
      {
        stage: 'technician_assigned',
        timestamp: new Date('2024-03-19T10:00:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Korong',
          role: 'operator'
        }
      },
      {
        stage: 'scheduled_visit',
        timestamp: new Date('2024-03-22T14:00:00'),
        updatedBy: {
          id: 'tech-2',
          name: 'Thabo',
          role: 'technician'
        },
        notes: 'Visit scheduled for March 23, 10:00 AM'
      },
      {
        stage: 'work_in_progress',
        timestamp: new Date('2024-03-23T10:30:00'),
        updatedBy: {
          id: 'tech-2',
          name: 'Thabo',
          role: 'technician'
        },
        notes: 'Work started - replacing outlet and checking wiring'
      }
    ]
  },
  {
    id: 'ticket-3',
    ticketNumber: 'TKT-2024-003',
    title: 'Door lock not working properly',
    description: 'The room door lock is jammed. Sometimes I cannot lock or unlock it.',
    category: 'carpentry',
    priority: 'medium',
    status: 'open',
    currentStage: 'sourcing_materials',
    block: 'Block B',
    room: '201',
    submittedBy: {
      id: 'staff-1',
      name: 'Rapelang Rapula',
      role: 'staff',
      block: 'Block B',
      room: '201'
    },
    createdAt: new Date('2024-03-24T11:20:00'),
    updatedAt: new Date('2024-03-25T09:15:00'),
    progressHistory: [
      {
        stage: 'report_submitted',
        timestamp: new Date('2024-03-24T11:20:00'),
        updatedBy: {
          id: 'staff-1',
          name: 'Rapelang Rapula',
          role: 'staff'
        }
      },
      {
        stage: 'operator_review',
        timestamp: new Date('2024-03-24T14:30:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Korong',
          role: 'operator'
        },
        notes: 'Approved. Checking inventory for replacement lock.'
      },
      {
        stage: 'sourcing_materials',
        timestamp: new Date('2024-03-25T09:15:00'),
        updatedBy: {
          id: 'operator-1',
          name: 'Bonolo Korong',
          role: 'operator'
        },
        notes: 'Lock ordered from supplier. ETA: 2-3 days'
      }
    ]
  },
  {
    id: 'ticket-4',
    ticketNumber: 'TKT-2024-004',
    title: 'Air conditioning not cooling',
    description: 'AC unit is running but not cooling the room. Room temperature is uncomfortably high.',
    category: 'hvac',
    priority: 'high',
    status: 'open',
    currentStage: 'operator_review',
    block: 'Block C',
    room: '301',
    submittedBy: {
      id: 'student-3',
      name: 'Pono Molemi',
      role: 'student',
      studentId: 'ST-2024-003',
      block: 'Block C',
      room: '301'
    },
    createdAt: new Date('2024-03-27T16:45:00'),
    updatedAt: new Date('2024-03-27T16:45:00'),
    progressHistory: [
      {
        stage: 'report_submitted',
        timestamp: new Date('2024-03-27T16:45:00'),
        updatedBy: {
          id: 'student-3',
          name: 'Pono Molemi',
          role: 'student'
        }
      }
    ]
  },
  {
    id: 'ticket-5',
    ticketNumber: 'TKT-2024-005',
    title: 'Window pane cracked',
    description: 'One of the bedroom windows has a crack. Might be a security concern.',
    category: 'carpentry',
    priority: 'medium',
    status: 'completed',
    currentStage: 'closed',
    block: 'Block A',
    room: '105',
    submittedBy: {
      id: 'student-4',
      name: 'Korong Molemi',
      role: 'student',
      studentId: 'ST-2024-004',
      block: 'Block A',
      room: '105'
    },
    assignedTo: {
      id: 'tech-1',
      name: 'Kagiso',
      role: 'technician'
    },
    createdAt: new Date('2024-03-10T09:30:00'),
    updatedAt: new Date('2024-03-18T15:00:00'),
    completedAt: new Date('2024-03-17T14:30:00'),
    closedAt: new Date('2024-03-18T15:00:00'),
    progressHistory: [
      {
        stage: 'report_submitted',
        timestamp: new Date('2024-03-10T09:30:00'),
        updatedBy: { id: 'student-4', name: 'Korong Molemi', role: 'student' }
      },
      {
        stage: 'operator_review',
        timestamp: new Date('2024-03-10T11:00:00'),
        updatedBy: { id: 'operator-1', name: 'Bonolo Korong', role: 'operator' }
      },
      {
        stage: 'sourcing_materials',
        timestamp: new Date('2024-03-11T08:00:00'),
        updatedBy: { id: 'operator-1', name: 'Bonolo Korong', role: 'operator' }
      },
      {
        stage: 'technician_assigned',
        timestamp: new Date('2024-03-13T10:00:00'),
        updatedBy: { id: 'operator-1', name: 'Bonolo Korong', role: 'operator' }
      },
      {
        stage: 'scheduled_visit',
        timestamp: new Date('2024-03-15T09:00:00'),
        updatedBy: { id: 'tech-1', name: 'Kagiso', role: 'technician' }
      },
      {
        stage: 'work_in_progress',
        timestamp: new Date('2024-03-17T10:00:00'),
        updatedBy: { id: 'tech-1', name: 'Kagiso', role: 'technician' }
      },
      {
        stage: 'completed',
        timestamp: new Date('2024-03-17T14:30:00'),
        updatedBy: { id: 'tech-1', name: 'Kagiso', role: 'technician' },
        notes: 'Window pane replaced. Resident verified and signed off.'
      },
      {
        stage: 'closed',
        timestamp: new Date('2024-03-18T15:00:00'),
        updatedBy: { id: 'operator-1', name: 'Bonolo Korong', role: 'operator' },
        notes: 'Ticket closed after quality verification'
      }
    ]
  }
];

/**
 * Mock inventory items
 */
export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Shower Head - Standard',
    description: 'Chrome finish, adjustable flow',
    category: 'plumbing_supplies',
    quantity: 15,
    minThreshold: 10,
    unit: 'pieces',
    unitPrice: 250,
    totalValue: 3750,
    status: 'in_stock',
    supplier: 'Palapye Plumbing & Hardware',
    supplierContact: '+267 1234 5678',
    lastRestocked: new Date('2024-03-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'inv-2',
    name: 'Electrical Outlet - 2 Pin',
    description: '13A rated, white color',
    category: 'electrical_supplies',
    quantity: 8,
    minThreshold: 15,
    unit: 'pieces',
    unitPrice: 45,
    totalValue: 360,
    status: 'low_stock',
    supplier: 'Serowe Electrical Mart',
    supplierContact: '+267 2345 6789',
    lastRestocked: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: 'inv-3',
    name: 'Door Lock Set',
    description: 'Brass finish, includes keys',
    category: 'hardware',
    quantity: 0,
    minThreshold: 5,
    unit: 'pieces',
    unitPrice: 450,
    totalValue: 0,
    status: 'out_of_stock',
    supplier: 'Gaborone Security Solutions',
    supplierContact: '+267 3456 7890',
    lastRestocked: new Date('2024-01-20'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-25')
  },
  {
    id: 'inv-4',
    name: 'HVAC Filter - 20x20',
    description: 'High efficiency air filter',
    category: 'hvac_parts',
    quantity: 30,
    minThreshold: 20,
    unit: 'pieces',
    unitPrice: 150,
    totalValue: 4500,
    status: 'in_stock',
    supplier: 'Francistown CoolAir',
    supplierContact: '+267 4567 8901',
    lastRestocked: new Date('2024-03-10'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: 'inv-5',
    name: 'Paint - White Interior',
    description: '5L can, washable finish',
    category: 'paint_supplies',
    quantity: 12,
    minThreshold: 8,
    unit: 'cans',
    unitPrice: 320,
    totalValue: 3840,
    status: 'in_stock',
    supplier: 'Lobatse ColorWorks',
    supplierContact: '+267 5678 9012',
    lastRestocked: new Date('2024-03-05'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-05')
  }
];

/**
 * Mock blocks and rooms
 */
export const mockBlocks: Block[] = [
  {
    id: 'block-1',
    name: 'Block A',
    description: 'Male undergraduate residence',
    capacity: 120,
    occupiedRooms: 115,
    area: 'East Campus',
    buildingType: 'male',
    isActive: true,
    rooms: [],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'block-2',
    name: 'Block B',
    description: 'Female undergraduate residence',
    capacity: 100,
    occupiedRooms: 98,
    area: 'East Campus',
    buildingType: 'female',
    isActive: true,
    rooms: [],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'block-3',
    name: 'Block C',
    description: 'Postgraduate residence',
    capacity: 80,
    occupiedRooms: 72,
    area: 'West Campus',
    buildingType: 'mixed',
    isActive: true,
    rooms: [],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-01-15')
  }
];

/**
 * Mock notifications
 */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    priority: 'high',
    title: 'Water Supply Interruption',
    message: 'Water supply will be interrupted in Block A from 2:00 PM to 4:00 PM today for maintenance work.',
    targetBlocks: ['Block A'],
    createdBy: {
      id: 'coord-1',
      name: 'Kagiso Rapula',
      role: 'coordinator'
    },
    createdAt: new Date('2024-03-28T09:00:00'),
    expiresAt: new Date('2024-03-28T18:00:00'),
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'ticket_update',
    priority: 'normal',
    title: 'Ticket Update',
    message: 'Your ticket TKT-2024-001 has been assigned to a technician.',
    ticketId: 'ticket-1',
    targetUsers: ['student-1'],
    createdBy: {
      id: 'operator-1',
      name: 'Bonolo Korong',
      role: 'operator'
    },
    createdAt: new Date('2024-03-22T14:20:00'),
    isRead: false
  },
  {
    id: 'notif-3',
    type: 'low_inventory',
    priority: 'urgent',
    title: 'Low Stock Alert',
    message: 'Electrical outlets are running low. Current stock: 8 (minimum: 15)',
    targetRoles: ['operator', 'coordinator'],
    createdBy: {
      id: 'system',
      name: 'System',
      role: 'coordinator'
    },
    createdAt: new Date('2024-03-27T08:00:00'),
    isRead: false
  }
];

/**
 * Mock budget data
 */
export const mockBudget: Budget = {
  id: 'budget-1',
  name: 'Maintenance Budget 2024',
  description: 'Annual maintenance budget for residence facilities',
  totalAmount: 500000,
  allocatedAmount: 350000,
  remainingAmount: 150000,
  burnRate: 70000,
  fiscalYear: '2024',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  createdBy: {
    id: 'coord-1',
    name: 'Kagiso Rapula',
    role: 'coordinator'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-03-28')
};

/**
 * Mock analytics data
 */
export const mockAnalytics: DashboardAnalytics = {
  totalTickets: 45,
  openTickets: 12,
  inProgressTickets: 8,
  completedTickets: 20,
  closedTickets: 5,
  averageResolutionTime: 48,
  ticketsByPriority: {
    low: 10,
    medium: 20,
    high: 12,
    critical: 3
  },
  ticketsByCategory: {
    plumbing: 15,
    electrical: 10,
    carpentry: 8,
    hvac: 5,
    cleaning: 4,
    security: 2,
    other: 1
  },
  totalBudget: 500000,
  totalSpent: 350000,
  budgetRemaining: 150000,
  lowStockItems: 1,
  outOfStockItems: 1,
  ticketsThisWeek: 5,
  ticketsThisMonth: 18,
  lastUpdated: new Date()
};

/**
 * Helper function to get tickets by user
 * Filters tickets based on user role and permissions
 */
export const getTicketsByUser = (userId: string, userRole: string): Ticket[] => {
  if (userRole === 'student' || userRole === 'staff') {
    // Students and staff can only see their own tickets
    return mockTickets.filter(t => t.submittedBy.id === userId);
  } else if (userRole === 'technician') {
    // Technicians can see assigned tickets
    return mockTickets.filter(t => t.assignedTo?.id === userId);
  } else {
    // Operators, campus assistants, and coordinators can see all tickets
    return mockTickets;
  }
};

/**
 * Helper function to get notifications by user
 * Filters notifications based on user role, block, and targeting
 */
export const getNotificationsByUser = (user: User): Notification[] => {
  return mockNotifications.filter(notif => {
    // Check if notification targets specific users
    if (notif.targetUsers && !notif.targetUsers.includes(user.id)) {
      return false;
    }
    
    // Check if notification targets specific roles
    if (notif.targetRoles && !notif.targetRoles.includes(user.role)) {
      return false;
    }
    
    // Check if notification targets specific blocks
    if (notif.targetBlocks && user.block && !notif.targetBlocks.includes(user.block)) {
      return false;
    }
    
    // Check if notification has expired
    if (notif.expiresAt && notif.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  });
};
