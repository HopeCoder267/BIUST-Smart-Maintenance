/**
 * BIUST Smart Maintenance System - Campus Assistant Dashboard
 * 
 * Interface for campus assistants to submit campus-wide reports and monitor tickets
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Plus, AlertCircle, Building2, Bell, ShieldAlert } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function CampusAssistantDashboard() {
  const { tickets, addNotification, blocks, fetchTickets, fetchBlocks, fetchNotifications } = useDataStore();
  const { user } = useAuthStore();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchTickets(),
        fetchBlocks(),
        fetchNotifications()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchBlocks, fetchNotifications]);
  
  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    priority: 'normal' as any,
    targetBlock: 'all'
  });
  
  // Get all open tickets (campus assistants can see all open tickets)
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  
  /**
   * Handle campus-wide report submission
   * Directly posts to the API via the dataStore.
   */
  const handleSubmitReport = async () => {
    if (!notificationForm.title || !notificationForm.message || !user) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addNotification({
        type: 'alert',
        priority: notificationForm.priority,
        title: notificationForm.title,
        message: notificationForm.message,
        targetBlocks: notificationForm.targetBlock === 'all' ? [] : [notificationForm.targetBlock],
        createdBy: user,
        isRead: false
      });

      toast.success(notificationForm.targetBlock === 'all' 
        ? 'Campus-wide alert broadcasted' 
        : `Alert dispatched to ${notificationForm.targetBlock}`);
        
      setIsReportDialogOpen(false);
      setNotificationForm({
        title: '',
        message: '',
        priority: 'normal',
        targetBlock: 'all'
      });
    } catch (error) {
      toast.error('System failure: could not dispatch alert.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Campus Assistant Dashboard</h1>
        <p className="text-muted-foreground">Monitor campus issues and submit reports</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
                <p className="text-3xl font-bold text-foreground">{openTickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Campus Reports</p>
                <p className="text-3xl font-bold text-foreground">5</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alerts Sent</p>
                <p className="text-3xl font-bold text-foreground">8</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Submit Campus-Wide Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Submit Campus Alert
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-foreground">
              <div className="space-y-2">
                <Label className="text-foreground">Target Audience</Label>
                <Select 
                  value={notificationForm.targetBlock} 
                  onValueChange={(val) => setNotificationForm({...notificationForm, targetBlock: val})}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    <SelectItem value="all">Whole Campus</SelectItem>
                    {Array.isArray(blocks) ? blocks.map(block => (
                      <SelectItem key={block.id} value={block.name}>{block.name}</SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Priority</Label>
                <Select 
                  value={notificationForm.priority} 
                  onValueChange={(val) => setNotificationForm({...notificationForm, priority: val as any})}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border text-foreground">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent (Red Alert)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Alert Title</Label>
                <Input 
                  className="bg-muted border-border text-foreground" 
                  placeholder="e.g., Water Maintenance"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Message</Label>
                <Textarea 
                  className="bg-muted border-border text-foreground" 
                  rows={4} 
                  placeholder="Provide details about the alert..."
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                />
              </div>

              <Button onClick={handleSubmitReport} className="w-full bg-primary text-white hover:bg-primary/90 mt-2">
                Broadcast Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
          <Bell className="w-4 h-4" />
          Send Alert to Operators
        </Button>
      </div>
      
      {/* Open Tickets List */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Open Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              Loading open tickets...
            </div>
          ) : !Array.isArray(openTickets) || openTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No open tickets found
            </div>
          ) : (
            <div className="space-y-3">
              {openTickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white border-border hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.block} • Room {ticket.room}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-border">{ticket.category}</Badge>
                          {ticket.priority && (
                            <Badge className="bg-primary text-white">{ticket.priority}</Badge>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 border-none">
                        {ticket.status ? ticket.status.replace('_', ' ') : 'Open'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
