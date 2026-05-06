/**
 * BIUST Smart Maintenance System - Operator Dashboard
 * 
 * Command center for maintenance dispatchers. 
 * Orchestrates ticket flow, technician assignment, and priority management.
 * 
 *  FEATURES: Dispatch, Ticket Management, Assignment, Operational Analytics
 */
//check
import { useState, useEffect, useMemo } from 'react';
import { usePrivateAuthStore } from '../../store/privateAuthStore';
import { useDataStore } from '../../store/dataStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Search, UserPlus, AlertTriangle, TrendingUp, Clock, CheckCircle2, Settings } from 'lucide-react';
import { TicketPriority } from '../../types';
import ProgressTimeline from '../../components/ProgressTimeline';
import { format } from 'date-fns';

export default function OperatorDashboard() {
  const { tickets, users, fetchTickets, fetchUsers, assignTechnician, updatePriority, dashboardAnalytics: stats, fetchAnalytics } = useDataStore();
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ priority: 'all', status: 'all' });
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    fetchTickets();
    fetchAnalytics();
  }, [fetchTickets, fetchAnalytics]);

  const filteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return tickets.filter(t => {
      if (!t) return false;
      const matchSearch = !query || [t.title, t.ticketNumber, t.block].some(f => f && f.toLowerCase().includes(query.toLowerCase()));
      const matchPriority = filters.priority === 'all' || t.priority === filters.priority;
      const matchStatus = filters.status === 'all' || t.status === filters.status;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [tickets, query, filters]);

  // Filter technicians from users data with defensive programming
  useEffect(() => {
    const technicianUsers = users.filter(user => user && user.role === 'technician');
    setTechnicians(technicianUsers);
  }, [users]);

  const priorityStyles: Record<string, string> = {
    critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-blue-500'
  };

  const statusStyles: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700', completed: 'bg-emerald-100 text-emerald-700', closed: 'bg-slate-100 text-slate-700'
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500', 
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return styles[priority] || 'bg-gray-500';
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700', 
      completed: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-slate-100 text-slate-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };
  
  /**
   * Handle technician assignment
   */
  const handleAssignTechnician = async (technicianId: string) => {
    if (!selectedTicket) return;
    
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;
    
    const success = await assignTechnician(selectedTicket.id, technician);
    
    if (success) {
      // Refresh data to ensure consistency
      await fetchTickets();
      await fetchAnalytics();
    }
    
    setIsAssignDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * Handle priority update
   */
  const handleUpdatePriority = async (priority: TicketPriority) => {
    if (!selectedTicket) return;
    
    const success = await updatePriority(selectedTicket.id, priority);
    
    if (success) {
      // Refresh data to ensure consistency
      await fetchTickets();
      await fetchAnalytics();
    }
    
    setIsPriorityDialogOpen(false);
    setSelectedTicket(null);
  };
  
    
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Operator Dashboard</h1>
        <p className="text-slate-400">
          Manage maintenance tickets and assign technicians
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
                <p className="text-3xl font-bold text-foreground">{stats?.openTickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                <p className="text-3xl font-bold text-foreground">{stats?.inProgressTickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{stats?.completedTickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Resolution</p>
                <p className="text-3xl font-bold text-foreground">{stats?.averageResolutionTime || 0}h</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white">All Tickets</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              {/* Priority Filter */}
              <Select value={selectedPriority} onValueChange={(v: any) => setSelectedPriority(v)}>
                <SelectTrigger className="w-full sm:w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tickets Table */}
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Ticket #</TableHead>
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Location</TableHead>
                  <TableHead className="text-slate-300">Priority</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Assigned To</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400">Loading tickets...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredTickets) || filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket, index) => (
                    <TableRow
                      key={`${ticket.id}-${index}`}
                      className="hover:bg-slate-700/30 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <TableCell className="font-mono text-sm text-slate-300">
                        {ticket.ticketNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{ticket.title || 'Untitled'}</p>
                          <p className="text-xs text-slate-400 capitalize">{ticket.category || 'uncategorized'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>
                          <p className="font-medium">{ticket.block || 'Unknown'} • {ticket.room || 'N/A'}</p>
                          {ticket.submittedBy && (
                            <p className="text-xs text-slate-400">
                              {ticket.submittedBy.name || 'Unknown'} ({ticket.submittedBy.studentId || 'N/A'})
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.priority ? (
                          <Badge className={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">
                                {ticket.assignedTo.name?.charAt(0) || ticket.assignedTo.displayName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-sm">{ticket.assignedTo.name || ticket.assignedTo.displayName || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {ticket.createdAt && !isNaN(new Date(ticket.createdAt).getTime()) ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setIsPriorityDialogOpen(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket && !isAssignDialogOpen && !isPriorityDialogOpen} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedTicket.title}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Ticket #{selectedTicket.ticketNumber || 'N/A'} • {selectedTicket.block || 'Unknown'} Room {selectedTicket.room || 'N/A'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Details */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-slate-300">{selectedTicket.description || 'No description provided'}</p>
                </div>
                
                {/* Progress Timeline */}
                <div>
                  <h4 className="font-semibold mb-4">Progress</h4>
                  <ProgressTimeline
                    currentStage={selectedTicket.currentStage}
                    progressHistory={selectedTicket.progressHistory}
                    variant="horizontal"
                    showNotes={true}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    className="gap-2"
                    onClick={() => setIsAssignDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Technician
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setIsPriorityDialogOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                    Set Priority
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Technician Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a technician for this ticket
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Available Technicians</Label>
              <div className="mt-2 space-y-2">
                {users.filter(u => u && u.role === 'technician').map((tech) => (
                  <Button
                    key={tech.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3 border-slate-600"
                    onClick={() => handleAssignTechnician(tech.id)}
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{tech.name?.charAt(0) || tech.displayName?.charAt(0) || '?'}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{tech.name || tech.displayName || 'Unknown Technician'}</p>
                      <p className="text-sm text-slate-400">{tech.role || 'technician'}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Priority Dialog */}
      <Dialog open={isPriorityDialogOpen} onOpenChange={setIsPriorityDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Set Priority</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select the priority level for this ticket
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {Array.isArray(['critical', 'high', 'medium', 'low']) && (['critical', 'high', 'medium', 'low'] as TicketPriority[]).map((priority) => (
              <Button
                key={priority}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 border-slate-600"
                onClick={() => handleUpdatePriority(priority)}
              >
                <Badge className={getPriorityBadge(priority)}>
                  {priority}
                </Badge>
                <span className="capitalize">{priority} Priority</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
