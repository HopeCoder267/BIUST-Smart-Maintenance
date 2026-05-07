/**
 * BIUST Smart Maintenance System - Private Side Layout
 * 
 *
 * role-specific navigation, and system status.
 * 
 * FEATURES: Navigation, Role-Based Access, Sidebar, Toolbar
 */

import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { usePrivateAuthStore } from '../store/privateAuthStore';
import { Button } from '../components/ui/button';
import {
  Search, Bell, Settings, LogOut, User, ClipboardList, Package,
  FolderKanban, Box, Users, BarChart3, DollarSign, Building2,
  FileText, AlertCircle, Menu, X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../components/ui/utils';

export default function PrivateLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = usePrivateAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  /**
   * Security gate: Redirect unauthorized access to login.
   * Also handles intelligent dashboard routing on initial load.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/private', { replace: true });
    } else if (pathname === '/dashboard') {
      const routes: Record<string, string> = {
        operator: '/dashboard/operator',
        technician: '/dashboard/technician',
        assistant: '/dashboard/assistant', // Fixed: was campus_assistant
        coordinator: '/dashboard/coordinator',
      };
      const target = routes[user?.role || ''] || '/private';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, pathname, user]);

  const handleLogout = () => {
    logout();
    navigate('/private', { replace: true });
  };

  /**
   * Navigation mapping based on user permissions.
   * Memoized to prevent unnecessary re-calculating on layout renders.
   */
  const navItems = useMemo(() => {
    if (!user) return [];
    
    const items = [
      { label: 'Tickets', icon: ClipboardList, path: `/dashboard/${user.role}`, roles: ['operator', 'technician', 'assistant', 'coordinator'] },
      { label: 'Job Cards', icon: FileText, path: '/dashboard/job-cards', roles: ['technician', 'coordinator'] },
      { label: 'Inventory', icon: Package, path: '/dashboard/inventory', roles: ['operator', 'technician', 'coordinator'] },
      { label: 'Projects', icon: FolderKanban, path: '/dashboard/projects', roles: ['coordinator'] },
      { label: 'Assets', icon: Box, path: '/dashboard/assets', roles: ['coordinator'] },
      { label: 'Suppliers', icon: Users, path: '/dashboard/suppliers', roles: ['coordinator'] },
      { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', roles: ['operator', 'coordinator'] },
      { label: 'Finance', icon: DollarSign, path: '/dashboard/finance', roles: ['coordinator'] },
      { label: 'Blocks & Areas', icon: Building2, path: '/dashboard/blocks', roles: ['coordinator'] },
    ];
    
    return items.filter(i => i.roles.includes(user.role));
  }, [user]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b flex items-center px-4 gap-4 z-10">
        <div className="flex items-center gap-2 mr-4 min-w-[180px]">

          <div className="inline-flex items-center justify-center w-14 h-10 bg-white rounded-2xl mb-4 shadow-lg shadow-primary/20 overflow-hidden">
            <img
                src="/BIUST-logo (1).svg"
                alt="BIUST Logo"
                className="w-full h-full object-contain p-1"
            />
          </div>

          <span className="font-bold text-sm tracking-tight">SMART MAINTENANCE</span>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search tickets or resources..."
            className="w-full bg-muted rounded-md pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="text-muted-foreground"><Bell className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground"><Settings className="w-5 h-5" /></Button>
          
          <div className="flex items-center gap-3 ml-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:text-destructive"><LogOut className="w-5 h-5" /></Button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        
        {/* Main Navigation Sidebar */}
        <aside className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col transform transition-transform duration-300 ease-in-out",
          "lg:flex lg:static lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <span className="font-bold text-sm tracking-tight">Navigation</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  pathname === item.path ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-4.5 h-4.5 transition-transform group-hover:scale-110', pathname === item.path ? 'text-white' : 'text-muted-foreground')} />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Status: Operational
            </div>
          </div>
        </aside>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Core Content View */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
