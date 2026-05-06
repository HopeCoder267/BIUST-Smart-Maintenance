/**
 * BIUST Smart Maintenance System - Job Cards Page
 * 
 * Comprehensive job card management for technicians and coordinators.
 * Features job creation, assignment, tracking, and completion workflows.
 * 
 * FEATURES: Job Management, Work Orders, Progress Tracking, Resource Allocation
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import {
  ClipboardList, Plus, Search, Filter, Calendar, Clock, User,
  MapPin, Wrench, CheckCircle2, AlertCircle, FileText, Eye,
  Edit, Trash2, Download, Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { Ticket, User as UserType } from '../../types';

export default function JobCardsPage() {
  const { user } = useAuthStore();
  const { tickets, users, fetchTickets, fetchUsers, updateTicket, addTicket } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Ticket | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for creating new job cards
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    block: '',
    room: '',
    assignedTo: '',
    estimatedHours: '',
    materials: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTickets(), fetchUsers()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchUsers]);

  // Convert tickets to job cards
  const jobCards = useMemo(() => {
    let filtered = tickets.filter(ticket => 
      (user?.role === 'technician' && ticket.assignedTo?.id === user.id) ||
      (user?.role === 'coordinator')
    );

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(job => job.priority === priorityFilter);
    }

    return filtered;
  }, [tickets, user, searchQuery, statusFilter, priorityFilter]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string | undefined) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return styles[priority || ''] || 'bg-gray-500 text-white';
  };

  // Handle creating new job card
  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const assignedUser = formData.assignedTo ? users.find(u => u.id === formData.assignedTo) : undefined;
      
      await addTicket({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        priority: formData.priority,
        status: 'open',
        block: formData.block,
        room: formData.room,
        submittedBy: user!,
        currentStage: 'report_submitted',
        progressHistory: []
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        block: '',
        room: '',
        assignedTo: '',
        estimatedHours: '',
        materials: '',
        notes: ''
      });
      
      setIsCreateDialogOpen(false);
      toast.success('Job card created successfully');
    } catch (error) {
      console.error('Failed to create job card:', error);
      toast.error('Failed to create job card');
    }
  };

  // Handle job status update
  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      await updateTicket(jobId, { status: newStatus as any });
      toast.success('Job status updated successfully');
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast.error('Failed to update job status');
    }
  };

  // Handle job assignment
  const handleAssignment = async (jobId: string, technicianId: string) => {
    try {
      const technician = users.find(u => u.id === technicianId);
      if (technician) {
        await updateTicket(jobId, { assignedTo: technician });
        toast.success('Job assigned successfully');
      }
    } catch (error) {
      console.error('Failed to assign job:', error);
      toast.error('Failed to assign job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Cards</h1>
          <p className="text-muted-foreground">
            Manage maintenance work orders and job assignments
          </p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Job Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job Card</DialogTitle>
                <DialogDescription>
                  Create a new maintenance work order with all required details
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateJobCard} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Fix HVAC Unit in Room 201"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="carpentry">Carpentry</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the work required"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="block">Block</Label>
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) => setFormData(prev => ({ ...prev, block: e.target.value }))}
                      placeholder="e.g., Block A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      value={formData.room}
                      onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="e.g., 201"
                    />
                  </div>
                </div>
                
                {user?.role === 'coordinator' && (
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users
                          .filter(u => u.role === 'technician')
                          .map(technician => (
                            <SelectItem key={technician.id} value={technician.id}>
                              {technician.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="e.g., 4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="materials">Materials</Label>
                    <Input
                      id="materials"
                      value={formData.materials}
                      onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                      placeholder="e.g., Pipes, fittings, sealant"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional instructions or notes"
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Job Card
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search job cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Job Cards ({jobCards.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading job cards...</p>
            </div>
          ) : jobCards.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No job cards found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first job card to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">
                      #{job.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {job.description || ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {job.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(job.priority)}>
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm">{job.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {job.block} {job.room}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {user?.role === 'coordinator' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {user?.role === 'technician' && job.status === 'open' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                          >
                            <Wrench className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {user?.role === 'technician' && job.status === 'in_progress' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusUpdate(job.id, 'completed')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Job Card Details - #{selectedJob.ticketNumber}
              </DialogTitle>
              <DialogDescription>
                View and manage job card details, progress, and assignments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadge(selectedJob.status)}>
                    {selectedJob.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <Badge className={getPriorityBadge(selectedJob.priority)}>
                    {selectedJob.priority || 'medium'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="capitalize">{selectedJob.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p>{selectedJob.block} {selectedJob.room}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedJob.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedJob.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">
                    {selectedJob.createdAt ? format(new Date(selectedJob.createdAt), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">
                    {selectedJob.updatedAt ? format(new Date(selectedJob.updatedAt), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>
              
              {user?.role === 'coordinator' && (
                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
