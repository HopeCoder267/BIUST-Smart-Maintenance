/**
 * BIUST Smart Maintenance System - Public Side Layout
 * 
 * for Residents (students and staff) on the public side.
 * Includes user profile summary, location context, and global navigation.
 * 
 * FEATURES: Public Header, User Context, Room Info, Sign Out
 */

import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Bell, LogOut, User, Home } from 'lucide-react';
import { useEffect } from 'react';

export default function PublicLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isPublicSide, logout } = useAuthStore();
  
  /**
   * Guards the public area from unauthorized or mismatched session types.
   */
  useEffect(() => {
    if (!isAuthenticated || !isPublicSide) navigate('/', { replace: true });
  }, [isAuthenticated, isPublicSide, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  
  if (!isAuthenticated || !isPublicSide || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-none">SMART MAINTAINENCE</h1>
              <p className="text-[11px] text-slate-500 font-medium uppercase mt-1">
                {user.block || 'Main Campus'} • Room {user.room || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-lg border">
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="sm:hidden text-slate-600">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Primary Page Content */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <Outlet />
      </main>
      
      {/* Minimal Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            © 2026 BIUST Smart Maintenance Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
