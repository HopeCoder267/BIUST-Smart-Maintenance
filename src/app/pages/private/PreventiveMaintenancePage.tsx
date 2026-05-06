/**
 * BIUST Smart Maintenance System - Preventive Maintenance Page
 * 
 * Comprehensive preventive maintenance management interface for coordinators.
 * Features schedule creation, task management, and calendar-based planning.
 * 
 * FEATURES: Schedule Management, Task Lists, Assignment Tracking, Calendar View
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle, Plus, Edit, Trash2, CalendarDays } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, isAfter, isBefore, startOfDay } from 'date-fns';
import { PreventiveMaintenanceSchedule, User } from '../../types';

export default function PreventiveMaintenancePage() {
  const { user } = useAuthStore();
  const { 
    preventiveMaintenance, 
    users, 
    fetchPreventiveMaintenance, 
    addPreventiveMaintenance, 
    updatePreventiveMaintenance, 
    deletePreventiveMaintenance,
    fetchUsers
  } = useDataStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PreventiveMaintenanceSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
    assignedTo: '',
    blocks: [] as string[],
    specificLocations: [] as string[],
    tasks: [''] as string[]
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPreventiveMaintenance(),
        fetchUsers()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchPreventiveMaintenance, fetchUsers]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const active = preventiveMaintenance.filter(pm => pm.status === 'active');
    const overdue = active.filter(pm => isAfter(now, new Date(pm.nextDue)));
    const dueSoon = active.filter(pm => {
      const dueDate = new Date(pm.nextDue);
      return isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 7));
    });
    
    return {
      total: preventiveMaintenance.length,
      active: active.length,
      overdue: overdue.length,
      dueSoon: dueSoon.length
    };
  }, [preventiveMaintenance]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    // Find assigned user if selected
    const assignedUser = formData.assignedTo ? users.find(u => u.id === formData.assignedTo) : undefined;

    // Calculate next due date based on frequency
    let nextDue = new Date();
    switch (formData.frequency) {
      case 'daily': nextDue.setDate(nextDue.getDate() + 1); break;
      case 'weekly': nextDue.setDate(nextDue.getDate() + 7); break;
      case 'monthly': nextDue.setMonth(nextDue.getMonth() + 1); break;
      case 'quarterly': nextDue.setMonth(nextDue.getMonth() + 3); break;
      case 'annually': nextDue.setFullYear(nextDue.getFullYear() + 1); break;
    }

    const scheduleData = {
      name: formData.name,
      description: formData.description,
      frequency: formData.frequency,
      assignedTo: assignedUser,
      blocks: formData.blocks,
      specificLocations: formData.specificLocations,
      tasks: formData.tasks.filter(task => task.trim()),
      status: 'active' as const,
      nextDue,
      createdBy: user!
    };

    try {
      if (editingSchedule) {
        await updatePreventiveMaintenance(editingSchedule.id, scheduleData);
        setEditingSchedule(null);
      } else {
        await addPreventiveMaintenance(scheduleData);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
        assignedTo: '',
        blocks: [],
        specificLocations: [],
        tasks: ['']
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to save preventive maintenance schedule:', error);
    }
  };

  // Handle edit
  const handleEdit = (schedule: PreventiveMaintenanceSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description,
      frequency: schedule.frequency,
      assignedTo: schedule.assignedTo?.id || '',
      blocks: schedule.blocks || [],
      specificLocations: schedule.specificLocations || [],
      tasks: schedule.tasks.length > 0 ? schedule.tasks : ['']
    });
    setIsCreateDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this preventive maintenance schedule?')) {
      try {
        const success = await deletePreventiveMaintenance(id);
        if (success) {
          toast.success('Preventive maintenance schedule deleted successfully');
          // CRITICAL: Refresh schedules to show updated list immediately
          await fetchPreventiveMaintenance();
        }
      } catch (error) {
        console.error('Failed to delete preventive maintenance schedule:', error);
      }
    }
  };

  // Add task to form
  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, '']
    }));
  };

  // Update task in form
  const updateTask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? value : task)
    }));
  };

  // Remove task from form
  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  // Get status badge color
  const getStatusBadge = (schedule: PreventiveMaintenanceSchedule) => {
    const now = new Date();
    const dueDate = new Date(schedule.nextDue);
    
    if (schedule.status === 'paused') return <Badge variant="secondary">Paused</Badge>;
    if (schedule.status === 'completed') return <Badge variant="outline">Completed</Badge>;
    if (isAfter(now, dueDate)) return <Badge variant="destructive">Overdue</Badge>;
    if (isBefore(dueDate, addDays(now, 7))) return <Badge variant="outline">Due Soon</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  if (!user || (user.role !== 'coordinator' && user.role !== 'operator')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Preventive maintenance management requires coordinator or operator privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Preventive Maintenance</h1>
          <p className="text-muted-foreground">Manage scheduled maintenance tasks and ensure system reliability</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Schedules</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold text-foreground">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                <p className="text-3xl font-bold text-foreground">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due Soon</p>
                <p className="text-3xl font-bold text-foreground">{stats.dueSoon}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Maintenance Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading preventive maintenance schedules...</p>
            </div>
          ) : preventiveMaintenance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No preventive maintenance schedules found</p>
              <p className="text-sm text-muted-foreground">Create your first schedule to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {preventiveMaintenance.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{schedule.name}</h3>
                        {getStatusBadge(schedule)}
                      </div>
                      <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-medium capitalize">{schedule.frequency.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next due:</span>
                      <span className="font-medium">{format(new Date(schedule.nextDue), 'MMM dd, yyyy')}</span>
                    </div>
                    {schedule.assignedTo && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium">{schedule.assignedTo.name}</span>
                      </div>
                    )}
                  </div>

                  {schedule.tasks && schedule.tasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Tasks:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {schedule.tasks.map((task, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit Preventive Maintenance Schedule' : 'Create Preventive Maintenance Schedule'}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? 'Update the preventive maintenance schedule details.' : 'Create a new preventive maintenance schedule to ensure regular maintenance tasks.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly HVAC Inspection"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually') => setFormData(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
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
                placeholder="Describe what this preventive maintenance schedule covers..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users
                    .filter((u: User) => u.role === 'technician')
                    .map((technician: User) => (
                      <SelectItem key={technician.id} value={technician.id}>
                        {technician.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tasks</Label>
              <div className="space-y-2">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      placeholder={`Task ${index + 1}`}
                    />
                    {formData.tasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTask}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingSchedule(null);
                  setFormData({
                    name: '',
                    description: '',
                    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
                    assignedTo: '',
                    blocks: [],
                    specificLocations: [],
                    tasks: ['']
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
