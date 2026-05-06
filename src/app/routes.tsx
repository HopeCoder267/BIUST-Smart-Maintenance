/**
 * BIUST Smart Maintenance System - Main Application Router
 * 
 * This file configures all routes for the application using React Router.
 * It defines paths for both public and private sides of the system.
 */

import { createBrowserRouter } from 'react-router-dom';

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
import ProtectedRoute from './components/ProtectedRoute';

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
        element: (
          <ProtectedRoute requiredAuth="public">
            <ResidentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ticket/:ticketId',
        element: (
          <ProtectedRoute requiredAuth="public">
            <TicketDetails />
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute roles={['operator']}>
            <OperatorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'technician',
        element: (
          <ProtectedRoute roles={['technician']}>
            <TechnicianDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assistant',
        element: (
          <ProtectedRoute roles={['campus_assistant']}>
            <CampusAssistantDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'coordinator',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <CoordinatorDashboard />
          </ProtectedRoute>
        ),
      },
      
      // Shared pages (accessible based on role permissions)
      {
        path: 'finance',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <FinanceDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory',
        element: (
          <ProtectedRoute roles={['technician', 'coordinator']}>
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'blocks',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <BlockManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'preventive-maintenance',
        element: (
          <ProtectedRoute roles={['coordinator', 'operator']}>
            <PreventiveMaintenancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'job-cards',
        element: (
          <ProtectedRoute roles={['technician', 'coordinator']}>
            <JobCardsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <ProjectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assets',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <AssetsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'suppliers',
        element: (
          <ProtectedRoute roles={['coordinator']}>
            <SuppliersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute roles={['operator', 'coordinator']}>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
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
