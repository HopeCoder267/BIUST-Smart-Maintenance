/**
 * BIUST Smart Maintenance System - Type Definitions
 * 
 * This file contains all TypeScript types and interfaces used throughout the system.
 * It ensures type safety and provides clear documentation for data structures.
 */

// ============================================================================
// USER ROLES AND AUTHENTICATION
// ============================================================================

/**
 * Available user roles in the system
 * - Student: Can submit reports and view own tickets
 * - Staff: Same as student but for staff members
 * - Campus Assistant: Can submit campus-wide reports and view all open tickets
 * - Operator: Can assign tasks, set priority, view all tickets
 * - Technician: Can view assigned jobs and complete job cards
 * - Coordinator: Full system access including finance module
 */
export type UserRole = 'student' | 'staff' | 'campus_assistant' | 'operator' | 'technician' | 'coordinator';

/**
 * User authentication data structure
 */
export interface User {
  id: string;
  name: string;
  role: UserRole;
  studentId?: string;  // For students
  omang?: string;      // National ID
  level?: string;      // Academic level for students
  block?: string;      // Residence block
  room?: string;       // Room number
  email?: string;
}

/**
 * Public side authentication (block → room → digital key)
 */
export interface PublicAuthData {
  block: string;
  room: string;
  digitalKey: string;
}

// ============================================================================
// TICKET AND PROGRESS TRACKING
// ============================================================================

/**
 * Ticket progress stages - 9 stages from submission to closure
 * These stages represent the complete lifecycle of a maintenance ticket
 */
export type ProgressStage = 
  | 'report_submitted'      // Stage 1: Initial submission by resident
  | 'operator_review'       // Stage 2: Operator reviews the ticket
  | 'sourcing_funds'        // Stage 3: Finance team sources required funds
  | 'sourcing_materials'    // Stage 4: Procurement of materials
  | 'technician_assigned'   // Stage 5: Technician assigned to the job
  | 'scheduled_visit'       // Stage 6: Visit scheduled with resident
  | 'work_in_progress'      // Stage 7: Work is being performed
  | 'completed'             // Stage 8: Work completed by technician
  | 'closed';               // Stage 9: Ticket closed after verification

/**
 * Priority levels for tickets (assigned by operators, not residents)
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Ticket status for quick filtering
 */
export type TicketStatus = 'open' | 'in_progress' | 'completed' | 'closed';

/**
 * Ticket category types
 */
export type TicketCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'carpentry' 
  | 'hvac' 
  | 'cleaning' 
  | 'security' 
  | 'other';

/**
 * Main ticket data structure
 */
export interface Ticket {
  id: string;
  ticketNumber: string;           // Formatted ticket number (e.g., "TKT-2024-001")
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;      // Set by operator, not by submitter
  status: TicketStatus;
  currentStage: ProgressStage;
  
  // Location information
  block: string;
  room: string;
  
  // User information
  submittedBy: User;
  assignedTo?: User;              // Assigned technician
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  closedAt?: Date;
  
  // Progress tracking
  progressHistory: ProgressHistoryEntry[];
  
  // Additional data
  photos?: string[];              // URLs to uploaded photos
  notes?: TicketNote[];
  residentAvailability?: string;  // When the student is available in their room
}

/**
 * Progress history entry for tracking stage transitions
 * Each entry records when and by whom a stage was completed
 */
export interface ProgressHistoryEntry {
  stage: ProgressStage;
  timestamp: Date;
  updatedBy: User;
  notes?: string;
}

/**
 * Notes added to tickets by staff members
 */
export interface TicketNote {
  id: string;
  ticketId: string;
  content: string;
  createdBy: User;
  createdAt: Date;
  isInternal: boolean;            // Internal notes not visible to residents
}

// ============================================================================
// JOB CARDS (PPCF - Planned Preventive and Corrective Forms)
// ============================================================================

/**
 * Digital job card for technicians
 * Replaces paper-based PPCF forms
 */
export interface JobCard {
  id: string;
  jobNumber: string;
  ticketId: string;
  ticket: Ticket;
  
  technician: User;
  
  // Work details
  workDescription: string;
  materialsUsed: MaterialUsage[];
  hoursWorked: number;
  
  // Visit scheduling
  scheduledDate?: Date;
  scheduledTime?: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  
  // Completion data
  completionNotes?: string;
  photos?: string[];
  residentSignature?: string;     // Digital signature
  technicianSignature?: string;
  
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// INVENTORY MANAGEMENT
// ============================================================================

/**
 * Inventory item categories
 */
export type InventoryCategory = 
  | 'plumbing_supplies'
  | 'electrical_supplies'
  | 'hardware'
  | 'tools'
  | 'cleaning_supplies'
  | 'hvac_parts'
  | 'paint_supplies'
  | 'other';

/**
 * Inventory item status
 */
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

/**
 * Inventory item structure
 */
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  
  // Quantity tracking
  quantity: number;
  minThreshold: number;           // Alert when quantity falls below this
  unit: string;                   // e.g., "pieces", "meters", "liters"
  
  // Pricing
  unitPrice: number;
  totalValue: number;
  
  status: InventoryStatus;
  
  // Supplier information
  supplier?: string;
  supplierContact?: string;
  
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Material usage tracking (links inventory to job cards)
 */
export interface MaterialUsage {
  id: string;
  jobCardId: string;
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
  usedAt: Date;
}

// ============================================================================
// FINANCE MODULE (Coordinator Only, PIN-Locked)
// ============================================================================

/**
 * Budget information
 */
export interface Budget {
  id: string;
  name: string;
  description?: string;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  burnRate: number;               // Average spending per period
  
  fiscalYear: string;
  startDate: Date;
  endDate: Date;
  
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Expense record
 */
export interface Expense {
  id: string;
  expenseNumber: string;
  description: string;
  amount: number;
  category: string;
  
  budgetId?: string;
  projectId?: string;
  ticketId?: string;
  
  // Supplier/Vendor information
  vendor?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  
  // Approval workflow
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: User;
  approvedAt?: Date;
  
  createdBy: User;
  createdAt: Date;
}

/**
 * Project for tracking major maintenance work
 */
export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  description: string;
  
  // Budget information
  plannedBudget: number;
  actualCost: number;
  budget: number;
  spent: number;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  completionPercentage: number;
  progress: number;
  
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  priority: TicketPriority;
  
  // Associated data
  milestones: ProjectMilestone[];
  relatedTickets: string[];       // Ticket IDs
  tasks: ProjectTask[];
  
  coordinator: User;
  assignedTo: User | null;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project milestone
 */
export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
}

/**
 * Supplier information
 */
export interface Supplier {
  id: string;
  name: string;
  description: string;
  status: SupplierStatus;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  
  category: string;               // Types of supplies/services provided
  rating: number;                 // Performance rating
  
  registrationDate: Date;
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  performanceScore: number;
  
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  
  contracts: Contract[];
  documents: SupplierDocument[];
}

// ============================================================================
// BLOCK AND AREA MANAGEMENT
// ============================================================================

/**
 * Residence block structure - matches database schema
 */
export interface Block {
  id: string;
  name: string;
  total_rooms: number;
  capacity: number;
  total_residents: number;
  status: string;                  // 'active', 'inactive', 'maintenance'
  created_at: string;
  updated_at: string;
}

/**
 * Individual room in a block
 */
export interface Room {
  id: string;
  blockId: string;
  roomNumber: string;
  capacity: number;               // Number of occupants
  
  // Current occupants
  occupants: User[];
  digitalKey: string;             // Reset each semester
  
  isOccupied: boolean;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resident information for room assignments
 */
export interface Resident {
  id: string;
  name: string;
  student_id: string;
  omang?: string;
  level?: string;
  room_id: string;
  digital_key: string;
  room_number?: string;
  block_name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * CSV import data for bulk room/student upload
 */
export interface StudentImportData {
  name: string;
  studentId: string;
  omang: string;
  level: string;
  block: string;
  room: string;
  digitalKey: string;
}

// ============================================================================
// NOTIFICATIONS AND ALERTS
// ============================================================================

/**
 * Notification types
 */
export type NotificationType = 
  | 'ticket_update'               // Ticket status changed
  | 'assignment'                  // Task assigned to you
  | 'schedule'                    // Scheduled visit
  | 'alert'                       // Campus-wide or block-specific alert
  | 'low_inventory'               // Inventory below threshold
  | 'budget_alert'                // Budget concerns
  | 'system';                     // System notifications

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification structure
 */
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  title: string;
  message: string;
  
  // Targeting
  targetRoles?: UserRole[];       // Which roles should see this
  targetBlocks?: string[];        // Specific blocks (empty = all)
  targetUsers?: string[];         // Specific user IDs
  
  // Related entities
  ticketId?: string;
  jobCardId?: string;
  projectId?: string;
  
  // Metadata
  createdBy: User;
  createdAt: Date;
  expiresAt?: Date;               // Auto-hide after this date
  
  isRead: boolean;
  readAt?: Date;
}

// ============================================================================
// ANALYTICS AND REPORTING
// ============================================================================

/**
 * Dashboard analytics data
 */
export interface DashboardAnalytics {
  // Ticket metrics
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  closedTickets: number;
  
  // Performance metrics
  averageResolutionTime: number;  // In hours
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<TicketCategory, number>;
  
  // Financial metrics (Coordinator only)
  totalBudget?: number;
  totalSpent?: number;
  budgetRemaining?: number;
  
  // Inventory metrics
  lowStockItems?: number;
  outOfStockItems?: number;
  
  // Facility metrics
  totalBlocks?: number;
  
  // Time-based metrics
  ticketsThisWeek: number;
  ticketsThisMonth: number;
  
  lastUpdated: Date;
}

/**
 * Report filters
 */
export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  blocks?: string[];
  categories?: TicketCategory[];
  priorities?: TicketPriority[];
  statuses?: TicketStatus[];
  assignedTo?: string;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Action types for audit logging
 */
export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'export' 
  | 'import'
  | 'approve'
  | 'reject';

/**
 * Audit log entry for compliance and security
 */
export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;             // e.g., "ticket", "budget", "user"
  entityId: string;
  
  description: string;
  
  performedBy: User;
  performedAt: Date;
  
  // Changed data (for update actions)
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// PREVENTIVE MAINTENANCE
// ============================================================================

/**
 * Preventive maintenance schedule
 */
export interface PreventiveMaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  
  // Schedule information
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastPerformed?: Date;
  nextDue: Date;
  
  // Assignment
  assignedTo?: User;
  
  // Location
  blocks?: string[];              // If empty, applies to all blocks
  specificLocations?: string[];
  
  // Checklist items
  tasks: string[];
  
  status: 'active' | 'paused' | 'completed';
  
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SATISFACTION SURVEYS
// ============================================================================

/**
 * Satisfaction survey submitted by users after ticket completion
 */
export interface SatisfactionSurvey {
  id: string;
  ticketId: string;
  rating: number; // 1-5 scale
  feedback?: string;
  submittedBy: User;
  createdAt: Date;
}

// ============================================================================
// FILE ATTACHMENTS
// ============================================================================

/**
 * File attachment for maintenance tickets
 */
export interface FileAttachment {
  id: string;
  ticketId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedBy: User;
  createdAt: Date;
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

/**
 * Project management types
 */
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'cancelled';

export interface ProjectTask {
  id: string;
  name: string;
  completed: boolean;
  assignedTo: User;
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

/**
 * Asset management types
 */
export type AssetStatus = 'operational' | 'maintenance_required' | 'out_of_service' | 'retired';

export type AssetCategory = 'electrical' | 'hvac' | 'plumbing' | 'mechanical' | 'furniture' | 'it';

export interface MaintenanceRecord {
  date: Date;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  performedBy: User;
}

export interface AssetDocument {
  id: string;
  name: string;
  type: 'manual' | 'warranty' | 'invoice' | 'photo';
  url: string;
  uploadedAt: Date;
  uploadedBy: User;
}

export interface AssetSpecifications {
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  [key: string]: any; // Allow for additional specification fields
}

export interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  purchaseDate: Date;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: Date;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  assignedTo: User | null;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  specifications: AssetSpecifications;
  maintenanceHistory: MaintenanceRecord[];
  documents: AssetDocument[];
}

// ============================================================================
// SUPPLIER MANAGEMENT
// ============================================================================

/**
 * Supplier management types
 */
export type SupplierStatus = 'active' | 'inactive' | 'suspended' | 'under_review';

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  startDate: Date;
  endDate: Date;
  value: number;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  description: string;
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: 'certificate' | 'license' | 'insurance' | 'contract' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: User;
}


// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

/**
 * System settings and configuration
 */
export interface SystemSettings {
  maintenanceMode: boolean;
  allowPublicReporting: boolean;
  requireApprovalForExpenses: boolean;
  lowStockThreshold: number;
  
  // Notification settings
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  
  // Semester settings
  currentSemester: string;
  semesterStartDate: Date;
  semesterEndDate: Date;
  
  // Finance PIN (hashed)
  financePinHash?: string;
}
