/**
 * BIUST Smart Maintenance System - Public Side Layout
 * 
 * Layout wrapper for public-facing pages (students and staff).
 * Provides header with user info, logout button, and navigation.
 */

import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Bell, LogOut, User, Home } from 'lucide-react';
import { useEffect } from 'react';

/**
 * PublicLayout Component
 * 
 * Wraps all public side pages with consistent header and navigation.
 * Ensures user is authenticated before allowing access.
 */
export default function PublicLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isPublicSide, logout } = useAuthStore();
  
  /**
   * Redirect to login if user is not authenticated or not on public side
   */
  useEffect(() => {
    if (!isAuthenticated || !isPublicSide) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isPublicSide, navigate]);
  
  /**
   * Handle logout
   * Clears session and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  // Don't render if not authenticated
  if (!isAuthenticated || !isPublicSide || !user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-slate-900">
                  BIUST Smart Maintenance
                </h1>
                <p className="text-xs text-slate-500">
                  {user.block} • Room {user.room}
                </p>
              </div>
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications Button */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © 2024 BIUST Smart Maintenance System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
