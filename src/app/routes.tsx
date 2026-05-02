/**
 * BIUST Smart Maintenance System - Main Application Router
 * 
 * This file configures all routes for the application using React Router.
 * It defines paths for both public and private sides of the system.
 */

import { createBrowserRouter } from 'react-router';

// Public Side Pages
import PublicLogin from './pages/public/PublicLogin';
import ResidentDashboard from './pages/public/ResidentDashboard';
import TicketDetails from './pages/public/TicketDetails';

// Private Side Pages
import PrivateLogin from './pages/private/PrivateLogin';
import OperatorDashboard from './pages/private/OperatorDashboard';
import TechnicianDashboard from './pages/private/TechnicianDashboard';
import CampusAssistantDashboard from './pages/private/CampusAssistantDashboard';
import CoordinatorDashboard from './pages/private/CoordinatorDashboard';
import FinanceDashboard from './pages/private/FinanceDashboard';
import InventoryPage from './pages/private/InventoryPage';
import BlockManagement from './pages/private/BlockManagement';
import PreventiveMaintenancePage from './pages/private/PreventiveMaintenancePage';
import JobCardsPage from './pages/private/JobCardsPage';
import ProjectsPage from './pages/private/ProjectsPage';
import AssetsPage from './pages/private/AssetsPage';
import SuppliersPage from './pages/private/SuppliersPage';
import AnalyticsPage from './pages/private/AnalyticsPage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';

/**
 * Main application router configuration
 * 
 * Structure:
 * - /: Public login (block → room → digital key)
 * - /resident/*: Public side pages for students/staff
 * - /private: Private login (JWT authentication)
 * - /dashboard/*: Private side pages for staff (operators, technicians, etc.)
 */
export const router = createBrowserRouter([
  // ============================================================================
  // PUBLIC SIDE ROUTES
  // ============================================================================
  {
    path: '/',
    element: <PublicLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/resident',
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <ResidentDashboard />,
      },
      {
        path: 'ticket/:ticketId',
        element: <TicketDetails />,
      },
    ],
  },
  
  // ============================================================================
  // PRIVATE SIDE ROUTES
  // ============================================================================
  {
    path: '/private',
    element: <PrivateLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/dashboard',
    element: <PrivateLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Role-specific dashboards
      {
        path: 'operator',
        element: <OperatorDashboard />,
      },
      {
        path: 'technician',
        element: <TechnicianDashboard />,
      },
      {
        path: 'assistant',
        element: <CampusAssistantDashboard />,
      },
      {
        path: 'coordinator',
        element: <CoordinatorDashboard />,
      },
      
      // Shared pages (accessible based on role permissions)
      {
        path: 'finance',
        element: <FinanceDashboard />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'blocks',
        element: <BlockManagement />,
      },
      {
        path: 'preventive-maintenance',
        element: <PreventiveMaintenancePage />,
      },
      {
        path: 'job-cards',
        element: <JobCardsPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'assets',
        element: <AssetsPage />,
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
  
  // ============================================================================
  // ERROR ROUTES
  // ============================================================================
  {
    path: '*',
    element: <NotFound />,
  },
]);
