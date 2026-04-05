/**
 * BIUST Smart Maintenance System - Technician Dashboard
 * 
 * Interface for technicians to view assigned jobs, update progress, and complete work
 * Features:
 * - View assigned tickets
 * - Update job progress
 * - Add work notes
 * - Mark jobs as complete
 * - Track work history
 */

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Wrench, Calendar, Clock, CheckCircle2, MapPin, FileText, Plus, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import ProgressTimeline from '../../components/ProgressTimeline';
import { Ticket, ProgressStage } from '../../types';

/**
 * TechnicianDashboard Component
 * 
 * Dashboard for technicians to manage their assigned work
 */
export default function TechnicianDashboard() {
  const { user } = useAuthStore();
  const { tickets, getTicketsByUser, updateProgress, updateStatus, addTicketNote } = useDataStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProgressStage>('work_in_progress');
  const [updateNotes, setUpdateNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  
  if (!user) return null;
  
  // Get tickets assigned to current technician
  const assignedTickets = tickets.filter(t => t.assignedTo?.id === user.id);
  const activeTickets = assignedTickets.filter(t => t.status === 'in_progress' || t.status === 'open');
  const completedTickets = assignedTickets.filter(t => t.status === 'completed');
  
  /**
   * Handle progress update
   */
  const handleUpdateProgress = () => {
    if (!selectedTicket || !updateNotes.trim()) return;
    
    updateProgress(selectedTicket.id, selectedStage, updateNotes, user);
    setIsUpdateDialogOpen(false);
    setSelectedTicket(null);
    setUpdateNotes('');
  };
  
  /**
   * Handle job completion
   */
  const handleCompleteJob = () => {
    if (!selectedTicket || !completionNotes.trim()) return;
    
    // Update to completed stage
    updateProgress(selectedTicket.id, 'work_completed', completionNotes, user);
    updateStatus(selectedTicket.id, 'completed');
    
    setIsCompleteDialogOpen(false);
    setSelectedTicket(null);
    setCompletionNotes('');
  };
  
  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority?: string) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white',
    };
    
    return priority ? styles[priority as keyof typeof styles] : 'bg-slate-500 text-white';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Technician Dashboard</h1>
        <p className="text-muted-foreground">View your assigned jobs and complete work</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-foreground">{activeTickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Assigned</p>
                <p className="text-3xl font-bold text-foreground">{assignedTickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{completedTickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Jobs */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Your Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Active Jobs</h3>
              <p className="text-muted-foreground">You have no active jobs assigned at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white border-border hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{ticket.title}</h3>
                          {ticket.priority && (
                            <Badge className={getPriorityBadge(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {ticket.block} • Room {ticket.room}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Stage: {ticket.currentStage.replace(/_/g, ' ')}
                          </div>
                        </div>
                        
                        {/* Resident Availability - Added for technician efficiency */}
                        <div className="mt-3 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                          <div className="flex items-center gap-2 mb-1">
                            <UserIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Resident Availability:</span>
                          </div>
                          <p className="text-sm text-foreground font-medium pl-6">
                            {ticket.residentAvailability || "Not specified by student"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-2 border-border text-foreground hover:bg-muted"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Update Progress
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-2 bg-green-600 text-white hover:bg-green-700"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsCompleteDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete Job
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mini Progress Timeline */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Progress Timeline:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ticket.progressHistory.map((entry, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                            {entry.stage.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="bg-white border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Job Progress</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the progress stage and add notes about the work performed
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4 mt-4 text-foreground">
              {/* Ticket Info */}
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-1">{selectedTicket.title}</p>
                <p className="text-xs text-muted-foreground">{selectedTicket.ticketNumber} • {selectedTicket.block} Room {selectedTicket.room}</p>
              </div>
              
              {/* Progress Stage */}
              <div className="space-y-2">
                <Label className="text-foreground">Progress Stage</Label>
                <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as ProgressStage)}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    <SelectItem value="work_in_progress">Work in Progress</SelectItem>
                    <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                    <SelectItem value="quality_check">Quality Check</SelectItem>
                    <SelectItem value="resident_confirmation">Resident Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-foreground">Work Notes *</Label>
                <Textarea
                  placeholder="Describe the work performed, any issues encountered, parts used, etc..."
                  rows={4}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These notes will be visible to operators and coordinators
                </p>
              </div>
              
              {/* Current Progress */}
              <div className="space-y-2">
                <Label className="text-foreground mb-2">Current Progress Timeline</Label>
                <ProgressTimeline
                  currentStage={selectedTicket.currentStage}
                  progressHistory={selectedTicket.progressHistory}
                  variant="horizontal"
                  showNotes={false}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted"
                  onClick={() => {
                    setIsUpdateDialogOpen(false);
                    setUpdateNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  onClick={handleUpdateProgress}
                  disabled={!updateNotes.trim()}
                >
                  Update Progress
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Complete Job Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="bg-white border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Mark this job as complete and add final notes
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4 mt-4 text-foreground">
              {/* Ticket Info */}
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-1">{selectedTicket.title}</p>
                <p className="text-xs text-muted-foreground">{selectedTicket.ticketNumber} • {selectedTicket.block} Room {selectedTicket.room}</p>
              </div>
              
              {/* Completion Notes */}
              <div className="space-y-2">
                <Label className="text-foreground">Completion Summary *</Label>
                <Textarea
                  placeholder="Summarize the work completed, parts used, and any recommendations..."
                  rows={5}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ This will mark the job as completed and notify the resident
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted"
                  onClick={() => {
                    setIsCompleteDialogOpen(false);
                    setCompletionNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={handleCompleteJob}
                  disabled={!completionNotes.trim()}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
