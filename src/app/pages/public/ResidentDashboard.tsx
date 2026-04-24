/**
 * BIUST Smart Maintenance System - Resident Dashboard
 * 
 * Main dashboard for students and staff on the public side.
 * Features:
 * - Submit new maintenance reports
 * - View submitted tickets with progress
 * - See notifications
 * - Duplicate prevention (one pending issue per room)
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User as UserIcon,
  FileText,
  Bell,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { Ticket, TicketCategory } from '../../types';
import ProgressTimeline from '../../components/ProgressTimeline';
import { format } from 'date-fns';

/**
 * ResidentDashboard Component
 * 
 * Central hub for residents to manage their maintenance requests
 */
export default function ResidentDashboard() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets, fetchNotifications, addTicket, getTicketsByUser, getFilteredNotifications, updateTicket } = useDataStore();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [tempAvailability, setTempAvailability] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchTickets(),
        fetchNotifications()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchNotifications]);
  
  // Form state for new ticket submission
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '' as TicketCategory | '',
    availability: '',
  });
  
  if (!user) return null;
  
  /**
   * Get user's tickets from data store
   */
  const userTickets = getTicketsByUser(user.id, user.role);
  
  const userNotifications = getFilteredNotifications(user);
  
  /**
   * Check for duplicate tickets in a smart way
   * Checks for open/in-progress tickets in the same category and compares keywords
   * Returns the duplicate ticket if found
   */
  const findDuplicateTicket = (title: string, category: string, description: string) => {
    if (!category) return null;
    
    // Keywords to ignore (common words)
    const stopWords = new Set(['the', 'and', 'a', 'is', 'in', 'it', 'to', 'for', 'with', 'on', 'at', 'by', 'from', 'my', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'as', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once']);
    
    // Extract keywords from title and description
    const getKeywords = (text: string) => 
      text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
        
    const newKeywords = new Set([...getKeywords(title), ...getKeywords(description)]);
    
    return userTickets.find(ticket => {
      // Only check open or in-progress tickets
      if (ticket.status !== 'open' && ticket.status !== 'in_progress') return false;
      
      // Category match is required for "smart" duplication check
      if (ticket.category !== category) return false;
      
      // Check if any significant keywords overlap
      const existingKeywords = getKeywords(`${ticket.title} ${ticket.description}`);
      const overlap = existingKeywords.filter(word => newKeywords.has(word));
      
      // If there's significant overlap (at least 2 keywords or 50% of the shorter keyword list), mark as duplicate
      const threshold = Math.min(2, Math.ceil(existingKeywords.length * 0.5));
      return overlap.length >= threshold;
    });
  };
  
  /**
   * Handle new ticket submission
   */
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check for smart duplicate tickets
    const duplicate = findDuplicateTicket(newTicket.title, newTicket.category, newTicket.description);
    
    if (duplicate) {
      toast.error('Potential duplicate ticket detected', {
        description: `You already have an active ticket (#${duplicate.ticketNumber}: "${duplicate.title}") in this category that seems similar.`,
      });
      return;
    }
    
    // Add ticket to data store
    addTicket({
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      block: user.block || '',
      room: user.room || '',
      submittedBy: user,
      residentAvailability: newTicket.availability
    });
    
    // Reset form and close dialog
    setNewTicket({ title: '', description: '', category: '', availability: '' });
    setIsSubmitDialogOpen(false);
  };
  
  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  /**
   * Get status badge variant
   */
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  /**
   * Calculate stats for dashboard
   */
  const stats = {
    total: userTickets.length,
    open: userTickets.filter((t) => t.status === 'open').length,
    inProgress: userTickets.filter((t) => t.status === 'in_progress').length,
    completed: userTickets.filter((t) => t.status === 'completed').length,
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-primary rounded-xl p-6 text-white shadow-lg shadow-primary/20">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-orange-50 font-medium">
          {user.block} • Room {user.room}
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Total Reports</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Open</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.open}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">In Progress</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-muted border-border w-full sm:w-auto">
            <TabsTrigger value="tickets" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-foreground flex-1 sm:flex-initial">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-foreground flex-1 sm:flex-initial">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
              {userNotifications.length > 0 && (
                <Badge className="ml-1 px-1.5 py-0 text-xs bg-red-500 text-white border-none">
                  {userNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Submit New Report Button */}
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Submit New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Submit Maintenance Report</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Describe the issue you're experiencing in your room
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4 text-foreground">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Broken shower head"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    required
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">Category *</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) =>
                      setNewTicket({ ...newTicket, category: value as TicketCategory })
                    }
                  >
                    <SelectTrigger id="category" className="bg-muted border-border text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border text-foreground">
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="carpentry">Carpentry</SelectItem>
                      <SelectItem value="hvac">HVAC / Cooling</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, description: e.target.value })
                    }
                    required
                    className="bg-muted border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be as specific as possible to help us resolve your issue quickly
                  </p>
                </div>
                
                {/* Availability */}
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-foreground">Your Availability</Label>
                  <Input
                    id="availability"
                    placeholder="e.g., Weekdays after 4 PM, Saturdays all day"
                    value={newTicket.availability}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, availability: e.target.value })
                    }
                    className="bg-muted border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tell the technician when you will be in your room to fix the issue
                  </p>
                </div>
                
                {/* Smart Duplication Check UI Feedback removed - replaced by dynamic check on submit */}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-foreground hover:bg-muted"
                    onClick={() => setIsSubmitDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90">
                    Submit Report
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          {userTickets.length === 0 ? (
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  No tickets yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any maintenance reports yet.
                </p>
                <Button onClick={() => setIsSubmitDialogOpen(true)} className="gap-2 bg-primary text-white hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Submit Your First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.isArray(userTickets) && userTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white border-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={() => setSelectedTicket(ticket)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg text-foreground">{ticket.title}</CardTitle>
                          {ticket.priority && (
                            <Badge
                              className={`${getPriorityColor(ticket.priority)} text-white border-none`}
                            >
                              {ticket.priority}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-muted-foreground">
                          Ticket #{ticket.ticketNumber} • <span className="capitalize">{ticket.category}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1">
                        {ticket.status ? ticket.status.replace('_', ' ') : 'Open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'No date'}
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-primary" />
                          {ticket.assignedTo.name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {userNotifications.length === 0 ? (
            <Card className="bg-white border-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  No notifications
                </h3>
                <p className="text-muted-foreground">
                  You're all caught up! Check back later for updates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Array.isArray(userNotifications) && userNotifications.map((notification) => (
                <Card key={notification.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notification.priority === 'urgent'
                            ? 'bg-red-100 text-red-600'
                            : notification.priority === 'high'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {notification.createdAt ? format(new Date(notification.createdAt), 'MMM d, HH:mm') : 'No date'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => {
        if (!open) {
          setSelectedTicket(null);
          setIsEditingAvailability(false);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-border text-foreground">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl mb-2 text-foreground">
                      {selectedTicket.title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Ticket #{selectedTicket.ticketNumber} • Submitted on{' '}
                      {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMMM d, yyyy') : 'No date'}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.priority && (
                      <Badge
                        className={`${getPriorityColor(selectedTicket.priority)} text-white border-none`}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1">
                      {selectedTicket.status ? selectedTicket.status.replace('_', ' ') : 'Open'}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Ticket Details */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground bg-muted p-4 rounded-lg border border-border">{selectedTicket.description}</p>
                </div>

                {/* Resident Availability - Added for technician visibility */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Your Availability for Technician</h4>
                    </div>
                    {selectedTicket.status !== 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          setIsEditingAvailability(true);
                          setTempAvailability(selectedTicket.residentAvailability || '');
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditingAvailability ? (
                    <div className="space-y-3 mt-3">
                      <Input 
                        value={tempAvailability}
                        onChange={(e) => setTempAvailability(e.target.value)}
                        placeholder="e.g., Weekdays after 4 PM"
                        className="bg-white border-border text-foreground"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsEditingAvailability(false)}
                          className="border-border text-foreground"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary text-white"
                          onClick={() => {
                            updateTicket(selectedTicket.id, { residentAvailability: tempAvailability });
                            setSelectedTicket({ ...selectedTicket, residentAvailability: tempAvailability });
                            setIsEditingAvailability(false);
                            toast.success('Availability updated', {
                              description: 'Technician will see your updated schedule'
                            });
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground font-medium italic">
                      {selectedTicket.residentAvailability || "Not specified. Click edit to let the technician know when you're available."}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Providing your availability helps technicians fix your issue faster.
                  </p>
                </div>
                
                {/* Progress Timeline */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Progress Timeline</h4>
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <ProgressTimeline
                      currentStage={selectedTicket.currentStage}
                      progressHistory={selectedTicket.progressHistory}
                      variant="horizontal"
                      showNotes={true}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}