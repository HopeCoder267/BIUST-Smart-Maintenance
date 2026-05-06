/**
 * BIUST Smart Maintenance System - Projects Page
 * 
 * Comprehensive project management for maintenance coordinators.
 * Features project creation, tracking, resource allocation, and timeline management.
 */

import { useState, useEffect, useMemo } from 'react';
import { usePrivateAuthStore } from '../../store/privateAuthStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  User, 
  Clock, 
  FolderKanban, 
  Target, 
  Download, 
  Eye, 
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const { user } = usePrivateAuthStore();
  const { 
    projects, 
    users, // Destructured missing users array
    fetchProjects, 
    addProject, 
    updateProject, 
    deleteProject,
    fetchUsers 
  } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all'); // Defined missing state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null); // Defined missing state
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    projectNumber: '',
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    spent: 0,
    startDate: '',
    endDate: '',
    progress: 0,
    assignedTo: '',
    tasks: [] as any[]
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchUsers();
        await fetchProjects();
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchUsers, fetchProjects]);

  const filteredProjects = useMemo(() => {
    // Ensures case-insensitive role check
    let filtered = projects.filter(() => user?.role?.toLowerCase() === 'coordinator');

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }

    return filtered;
  }, [projects, user, searchQuery, statusFilter, priorityFilter]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-700',
      inProgress: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return styles[priority] || 'bg-gray-500 text-white';
  };

  // Unified function name to match onSubmit
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    const projectData = {
      ...formData,
      project_number: formData.projectNumber || `PRJ-${Date.now().toString().slice(-6)}`,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date().toISOString(),
      budget: Number(formData.budget),
      progress: Number(formData.progress),
      coordinatorId: user?.id || '',
      createdBy: user?.id || ''
    };

    const success = await addProject(projectData);
    if (success) {
      setIsAddDialogOpen(false);
      setFormData({
        projectNumber: '',
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        budget: 0,
        spent: 0,
        startDate: '',
        endDate: '',
        progress: 0,
        assignedTo: '',
        tasks: []
      });
    }
  };

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), name: '', completed: false }]
    }));
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index].name = value;
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const success = await deleteProject(id);
      if (success) {
        toast.success('Project deleted successfully');
        // CRITICAL: Refresh projects to show updated list immediately
        await fetchProjects();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage maintenance projects and track progress</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new maintenance project with timeline and budget
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Block A HVAC Upgrade"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
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
                    placeholder="Detailed description of the project scope"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget *</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Project Manager</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.filter(u => u.role === 'technician' || u.role === 'coordinator').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Project Tasks</Label>
                  {formData.tasks.map((task, index) => (
                    <div key={task.id} className="flex gap-2">
                      <Input
                        value={task.name}
                        onChange={(e) => handleTaskChange(index, e.target.value)}
                        placeholder={`Task ${index + 1}`}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveTask(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddTask} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Task
                  </Button>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Export</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Projects</p><p className="text-3xl font-bold">{projects.length}</p></div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center"><FolderKanban className="w-6 h-6 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-3xl font-bold">{projects.filter(p => p.status === 'inProgress').length}</p></div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-amber-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">P{projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}</p></div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Avg Progress</p><p className="text-3xl font-bold">{projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0}%</p></div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center"><Target className="w-6 h-6 text-purple-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </CardContent></Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5" />Projects ({filteredProjects.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div><p>Loading...</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p></div></TableCell>
                    <TableCell><Badge className={getStatusBadge(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell><Badge className={getPriorityBadge(p.priority)}>{p.priority}</Badge></TableCell>
                    <TableCell><div className="w-24"><Progress value={p.progress} className="h-2" /><span className="text-[10px]">{p.progress}%</span></div></TableCell>
                    <TableCell>P{p.budget?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3" />
                        {users.find(u => u.id === p.assignedTo)?.name || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProject(p)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5" />{selectedProject.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div><Label className="text-xs">Status</Label><Badge className={getStatusBadge(selectedProject.status)}>{selectedProject.status}</Badge></div>
                <div><Label className="text-xs">Priority</Label><Badge className={getPriorityBadge(selectedProject.priority)}>{selectedProject.priority}</Badge></div>
                <div><Label className="text-xs">Progress</Label><Progress value={selectedProject.progress} /><p className="text-[10px]">{selectedProject.progress}%</p></div>
                <div><Label className="text-xs">Budget</Label><p className="font-medium text-sm">P{selectedProject.budget?.toLocaleString()}</p></div>
              </div>
              <div><Label className="text-xs">Description</Label><p className="text-sm">{selectedProject.description}</p></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-xs">Start Date</Label><p className="text-sm">{selectedProject.startDate ? format(new Date(selectedProject.startDate), 'PPP') : 'N/A'}</p></div>
                <div><Label className="text-xs">End Date</Label><p className="text-sm">{selectedProject.endDate ? format(new Date(selectedProject.endDate), 'PPP') : 'N/A'}</p></div>
                <div><Label className="text-xs">Manager</Label><p className="text-sm">{users.find(u => u.id === selectedProject.assignedTo)?.name || 'Unassigned'}</p></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
                <Button onClick={() => toast.info('Exporting report...')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}