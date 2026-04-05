/**
 * BIUST Smart Maintenance System - Private Side Layout
 * 
 * IDE-style workspace layout for operations staff.
 * Features top toolbar, left sidebar, right sidebar, and bottom panel.
 */

import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ClipboardList,
  Package,
  FolderKanban,
  Box,
  Users,
  BarChart3,
  DollarSign,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../components/ui/utils';

/**
 * PrivateLayout Component
 * 
 * IDE-style workspace with:
 * - Top toolbar: Search, alerts, reports, settings
 * - Left sidebar: Main navigation
 * - Right sidebar: Filters, notes, quick actions
 * - Bottom panel: Logs, system messages
 * - Central content area
 */
export default function PrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isPublicSide, logout, hasRole, hasAnyRole } = useAuthStore();
  
  /**
   * Redirect to login if user is not authenticated or is on public side
   */
  useEffect(() => {
    if (!isAuthenticated || isPublicSide) {
      navigate('/private', { replace: true });
      return;
    }
    
    // Redirect to appropriate dashboard based on role
    if (location.pathname === '/dashboard') {
      const roleRoutes: Record<string, string> = {
        operator: '/dashboard/operator',
        technician: '/dashboard/technician',
        campus_assistant: '/dashboard/assistant',
        coordinator: '/dashboard/coordinator',
      };
      
      if (user?.role && roleRoutes[user.role]) {
        navigate(roleRoutes[user.role], { replace: true });
      }
    }
  }, [isAuthenticated, isPublicSide, navigate, location, user]);
  
  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/private', { replace: true });
  };
  
  // Don't render if not authenticated
  if (!isAuthenticated || isPublicSide || !user) {
    return null;
  }
  
  /**
   * Navigation items based on user role
   */
  const getNavigationItems = () => {
    const baseItems = [
      {
        label: 'Tickets',
        icon: ClipboardList,
        path: `/dashboard/${user.role === 'campus_assistant' ? 'assistant' : user.role}`,
        roles: ['operator', 'technician', 'campus_assistant', 'coordinator'],
      },
      {
        label: 'Job Cards',
        icon: FileText,
        path: '/dashboard/job-cards',
        roles: ['technician', 'coordinator'],
      },
      {
        label: 'Inventory',
        icon: Package,
        path: '/dashboard/inventory',
        roles: ['operator', 'technician', 'coordinator'],
      },
      {
        label: 'Projects',
        icon: FolderKanban,
        path: '/dashboard/projects',
        roles: ['coordinator'],
      },
      {
        label: 'Assets',
        icon: Box,
        path: '/dashboard/assets',
        roles: ['coordinator'],
      },
      {
        label: 'Suppliers',
        icon: Users,
        path: '/dashboard/suppliers',
        roles: ['coordinator'],
      },
      {
        label: 'Analytics',
        icon: BarChart3,
        path: '/dashboard/analytics',
        roles: ['operator', 'coordinator'],
      },
      {
        label: 'Finance',
        icon: DollarSign,
        path: '/dashboard/finance',
        roles: ['coordinator'],
      },
      {
        label: 'Blocks & Areas',
        icon: Building2,
        path: '/dashboard/blocks',
        roles: ['coordinator'],
      },
    ];
    
    // Filter items based on user role
    return baseItems.filter(item => item.roles.includes(user.role));
  };
  
  const navItems = getNavigationItems();
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Toolbar */}
      <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">BIUST Maintenance</span>
        </div>
        
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets, jobs, inventory..."
              className="w-full bg-muted text-foreground placeholder-muted-foreground rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Toolbar Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-muted rounded-md border border-border">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="w-56 bg-white border-r border-border flex flex-col">
          <nav className="flex-1 py-4">
            <div className="px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>System Status: Online</span>
            </div>
          </div>
        </aside>
        
        {/* Center Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
