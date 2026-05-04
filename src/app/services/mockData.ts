/**
 * BIUST Smart Maintenance System - Mock Data Service
 * 
 * This file contains all mock data and API simulations.
 * Replace this file with real API service when connecting to backend.
 * 
 * TO CONNECT TO REAL BACKEND:
 * 1. Delete this file
 * 2. Create real API service in services/api.ts
 * 3. Update all imports from './mockData' to './api'
 */

// Mock delay to simulate API calls
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users - Complete RBAC System
export const mockUsers = [
  // ADMIN ROLE - Full system access
  {
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@biust.ac.bw',
    role: 'admin' as const,
    password: 'admin123',
    department: 'IT Department',
    phone: '+267 123 456 789'
  },
  
  // COORDINATOR ROLE - Full maintenance system access
  {
    id: 'coord-1',
    name: 'Michael Coordinator',
    email: 'coordinator@biust.ac.bw',
    role: 'coordinator' as const,
    password: 'coord123',
    department: 'Maintenance Department',
    phone: '+267 234 567 890'
  },
  {
    id: 'coord-2',
    name: 'Sarah Maintenance Lead',
    email: 'maintenance.lead@biust.ac.bw',
    role: 'coordinator' as const,
    password: 'lead123',
    department: 'Maintenance Department',
    phone: '+267 345 678 901'
  },
  
  // OPERATOR ROLE - Ticket assignment and management
  {
    id: 'operator-1',
    name: 'Jane Operator',
    email: 'operator@biust.ac.bw',
    role: 'operator' as const,
    password: 'oper123',
    department: 'Operations',
    phone: '+267 456 789 012'
  },
  {
    id: 'operator-2',
    name: 'Robert Dispatcher',
    email: 'dispatcher@biust.ac.bw',
    role: 'operator' as const,
    password: 'dispatch123',
    department: 'Operations',
    phone: '+267 567 890 123'
  },
  
  // TECHNICIAN ROLE - Field work and job cards
  {
    id: 'tech-1',
    name: 'David Technician',
    email: 'technician@biust.ac.bw',
    role: 'technician' as const,
    password: 'tech123',
    department: 'Maintenance',
    phone: '+267 678 901 234',
    specialization: 'Electrical'
  },
  {
    id: 'tech-2',
    name: 'James Plumber',
    email: 'plumber@biust.ac.bw',
    role: 'technician' as const,
    password: 'plumb123',
    department: 'Maintenance',
    phone: '+267 789 012 345',
    specialization: 'Plumbing'
  },
  {
    id: 'tech-3',
    name: 'Peter Carpenter',
    email: 'carpenter@biust.ac.bw',
    role: 'technician' as const,
    password: 'carp123',
    department: 'Maintenance',
    phone: '+267 890 123 456',
    specialization: 'Carpentry'
  },
  
  // CAMPUS ASSISTANT ROLE - Campus-wide reporting
  {
    id: 'assistant-1',
    name: 'Emma Campus Assistant',
    email: 'assistant@biust.ac.bw',
    role: 'campus_assistant' as const,
    password: 'assist123',
    department: 'Student Affairs',
    phone: '+267 901 234 567'
  },
  {
    id: 'assistant-2',
    name: 'Oliver Hall Monitor',
    email: 'hall.monitor@biust.ac.bw',
    role: 'campus_assistant' as const,
    password: 'hall123',
    department: 'Student Affairs',
    phone: '+267 012 345 678'
  },
  
  // FINANCE ROLE - Budget and expense management
  {
    id: 'finance-1',
    name: 'Finance Officer',
    email: 'finance@biust.ac.bw',
    role: 'finance' as const,
    password: 'fin123',
    department: 'Finance Department',
    phone: '+267 123 456 789'
  },
  {
    id: 'finance-2',
    name: 'Budget Manager',
    email: 'budget@biust.ac.bw',
    role: 'finance' as const,
    password: 'budget123',
    department: 'Finance Department',
    phone: '+267 234 567 890'
  }
];

// Mock Blocks with Rooms - matching TypeScript interfaces
export const mockBlocks = [
  {
    id: 'block-1',
    name: 'Block A',
    total_rooms: 50,
    capacity: 100,
    total_residents: 85,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'block-2',
    name: 'Block B',
    total_rooms: 40,
    capacity: 80,
    total_residents: 72,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'block-3',
    name: 'Block C',
    total_rooms: 45,
    capacity: 90,
    total_residents: 68,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'block-4',
    name: 'Block D',
    total_rooms: 35,
    capacity: 70,
    total_residents: 45,
    status: 'maintenance',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Students/Residents - Comprehensive sample data matching Resident interface
export const mockStudents = [
  // Block A Residents
  {
    id: 'student-1',
    name: 'Alice Johnson',
    student_id: 'ST2024001',
    omang: '123456789',
    level: 'Year 2 Computer Science',
    room_id: '101',
    digital_key: 'ALICE101',
    room_number: '101',
    block_name: 'Block A',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-2',
    name: 'Bob Smith',
    student_id: 'ST2024002',
    omang: '987654321',
    level: 'Year 3 Engineering',
    room_id: '102',
    digital_key: 'BOB102',
    room_number: '102',
    block_name: 'Block A',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-3',
    name: 'Carol White',
    student_id: 'ST2024003',
    omang: '456789123',
    level: 'Year 1 Business',
    room_id: '103',
    digital_key: 'CAROL103',
    room_number: '103',
    block_name: 'Block A',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-4',
    name: 'David Brown',
    student_id: 'ST2024004',
    omang: '789123456',
    level: 'Year 4 Medicine',
    room_id: '104',
    digital_key: 'DAVID104',
    room_number: '104',
    block_name: 'Block A',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  // Block B Residents
  {
    id: 'student-5',
    name: 'Emma Davis',
    student_id: 'ST2024005',
    omang: '321654987',
    level: 'Year 2 Nursing',
    room_id: '201',
    digital_key: 'EMMA201',
    room_number: '201',
    block_name: 'Block B',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-6',
    name: 'Frank Wilson',
    student_id: 'ST2024006',
    omang: '654987321',
    level: 'Year 3 Pharmacy',
    room_id: '202',
    digital_key: 'FRANK202',
    room_number: '202',
    block_name: 'Block B',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-7',
    name: 'Grace Martinez',
    student_id: 'ST2024007',
    omang: '987321654',
    level: 'Year 1 Architecture',
    room_id: '203',
    digital_key: 'GRACE203',
    room_number: '203',
    block_name: 'Block B',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  // Block C Residents
  {
    id: 'student-8',
    name: 'Henry Taylor',
    student_id: 'ST2024008',
    omang: '147258369',
    level: 'Year 2 ICT',
    room_id: '301',
    digital_key: 'HENRY301',
    room_number: '301',
    block_name: 'Block C',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-9',
    name: 'Ivy Anderson',
    student_id: 'ST2024009',
    omang: '258369147',
    level: 'Year 4 Education',
    room_id: '302',
    digital_key: 'IVY302',
    room_number: '302',
    block_name: 'Block C',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-10',
    name: 'Jack Thomas',
    student_id: 'ST2024010',
    omang: '369147258',
    level: 'Year 3 Agriculture',
    room_id: '303',
    digital_key: 'JACK303',
    room_number: '303',
    block_name: 'Block C',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  // Block D Residents
  {
    id: 'student-11',
    name: 'Kate Jackson',
    student_id: 'ST2024011',
    omang: '159357258',
    level: 'Year 2 Environmental Science',
    room_id: '401',
    digital_key: 'KATE401',
    room_number: '401',
    block_name: 'Block D',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-12',
    name: 'Liam White',
    student_id: 'ST2024012',
    omang: '357258159',
    level: 'Year 1 Geology',
    room_id: '402',
    digital_key: 'LIAM402',
    room_number: '402',
    block_name: 'Block D',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Maintenance Tickets - Enhanced with more realistic data
export const mockTickets = [
  {
    id: 'ticket-1',
    title: 'Broken Light Fixture',
    description: 'Ceiling light in room 101 not working, needs bulb replacement',
    priority: 'medium' as const,
    status: 'open' as const,
    created_by: 'student-1',
    assigned_to: 'tech-1',
    block: 'Block A',
    room: '101',
    category: 'electrical' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ticketNumber: 'TKT-2024-001'
  },
  {
    id: 'ticket-2',
    title: 'Leaking Bathroom Faucet',
    description: 'Bathroom faucet dripping continuously, needs washer replacement',
    priority: 'high' as const,
    status: 'in_progress' as const,
    created_by: 'student-2',
    assigned_to: 'tech-2',
    block: 'Block A',
    room: '102',
    category: 'plumbing' as const,
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    ticketNumber: 'TKT-2024-002'
  },
  {
    id: 'ticket-3',
    title: 'Broken Window Lock',
    description: 'Window lock mechanism broken, security concern',
    priority: 'critical' as const,
    status: 'completed' as const,
    created_by: 'student-3',
    assigned_to: 'tech-3',
    block: 'Block A',
    room: '103',
    category: 'carpentry' as const,
    created_at: '2024-01-13T08:00:00Z',
    updated_at: '2024-01-14T16:00:00Z',
    ticketNumber: 'TKT-2024-003'
  },
  {
    id: 'ticket-4',
    title: 'AC Not Working',
    description: 'Air conditioning unit not cooling properly',
    priority: 'high' as const,
    status: 'open' as const,
    created_by: 'student-5',
    assigned_to: null,
    block: 'Block B',
    room: '201',
    category: 'hvac' as const,
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
    ticketNumber: 'TKT-2024-004'
  },
  {
    id: 'ticket-5',
    title: 'Water Leak in Ceiling',
    description: 'Water dripping from ceiling in room 302, possible plumbing issue',
    priority: 'critical' as const,
    status: 'in_progress' as const,
    created_by: 'student-9',
    assigned_to: 'tech-2',
    block: 'Block C',
    room: '302',
    category: 'plumbing' as const,
    created_at: '2024-01-16T14:00:00Z',
    updated_at: '2024-01-16T15:00:00Z',
    ticketNumber: 'TKT-2024-005'
  },
  {
    id: 'ticket-6',
    title: 'Broken Door Handle',
    description: 'Room door handle broken, cannot lock door properly',
    priority: 'medium' as const,
    status: 'open' as const,
    created_by: 'student-11',
    assigned_to: null,
    block: 'Block D',
    room: '401',
    category: 'carpentry' as const,
    created_at: '2024-01-17T09:00:00Z',
    updated_at: '2024-01-17T09:00:00Z',
    ticketNumber: 'TKT-2024-006'
  }
];

// Mock API Service
class MockAPI {
  async get(endpoint: string) {
    await delay();
    
    switch(endpoint) {
      case '/users':
        return { data: mockUsers };
      case '/users?role=technician':
        return { data: mockUsers.filter(u => u.role === 'technician') };
      case '/users?role=operator':
        return { data: mockUsers.filter(u => u.role === 'operator') };
      case '/blocks':
        return { data: mockBlocks };
      case '/public/blocks':
        return { data: mockBlocks };
      case '/tickets':
        return { data: mockTickets };
      case '/students':
        return { data: mockStudents };
      default:
        throw new Error(`GET ${endpoint} not implemented in mock`);
    }
  }

  async post(endpoint: string, data: any) {
    await delay();
    
    switch(endpoint) {
      case '/login':
        const user = mockUsers.find(u => u.email === data.email && u.password === data.password);
        if (user) {
          return { 
            data: { 
              token: `mock-token-${user.id}`,
              user: { id: user.id, name: user.name, email: user.email, role: user.role }
            }
          };
        }
        throw new Error('Invalid credentials');
      
      case '/login/public':
        const student = mockStudents.find(s => 
          s.block_name === data.block && 
          s.room_number === data.room && 
          s.digital_key === data.digitalKey
        );
        if (student) {
          return {
            data: {
              token: `mock-token-${student.id}`,
              user: student
            }
          };
        }
        throw new Error('Invalid room details');
      
      case '/blocks':
        const newBlock = {
          id: `block-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockBlocks.push(newBlock);
        return { data: newBlock };
      
      case '/tickets':
        const newTicket = {
          id: `ticket-${Date.now()}`,
          ...data,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockTickets.push(newTicket);
        return { data: newTicket };
      
      default:
        throw new Error(`POST ${endpoint} not implemented in mock`);
    }
  }

  async put(endpoint: string, data: any) {
    await delay();
    
    if (endpoint.startsWith('/blocks/')) {
      const blockId = endpoint.split('/').pop();
      const blockIndex = mockBlocks.findIndex(b => b.id === blockId);
      if (blockIndex >= 0) {
        mockBlocks[blockIndex] = { ...mockBlocks[blockIndex], ...data, updated_at: new Date().toISOString() };
        return { data: mockBlocks[blockIndex] };
      }
    }
    
    throw new Error(`PUT ${endpoint} not implemented in mock`);
  }

  async delete(endpoint: string) {
    await delay();
    
    if (endpoint.startsWith('/blocks/')) {
      const blockId = endpoint.split('/').pop();
      const index = mockBlocks.findIndex(b => b.id === blockId);
      if (index >= 0) {
        mockBlocks.splice(index, 1);
        return { data: { success: true } };
      }
    }
    
    if (endpoint.startsWith('/tickets/')) {
      const ticketId = endpoint.split('/').pop();
      const index = mockTickets.findIndex(t => t.id === ticketId);
      if (index >= 0) {
        mockTickets.splice(index, 1);
        return { data: { success: true } };
      }
    }
    
    throw new Error(`DELETE ${endpoint} not implemented in mock`);
  }
}

export default new MockAPI();
