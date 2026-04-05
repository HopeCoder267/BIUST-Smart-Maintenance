/**
 * BIUST Smart Maintenance System - Main Application Entry Point
 * 
 * This is the root component that initializes the React Router and React Query.
 * It provides the necessary providers for state management and data fetching.
 */

import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

/**
 * Initialize React Query client
 * Configures default options for data fetching and caching
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch data when window regains focus
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Main App Component
 * 
 * Wraps the entire application with necessary providers:
 * - QueryClientProvider: Enables React Query for data fetching
 * - RouterProvider: Enables React Router for navigation
 * - Toaster: Provides toast notifications throughout the app
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
