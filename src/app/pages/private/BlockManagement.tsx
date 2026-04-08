/**
 * BIUST Smart Maintenance System - Block & Area Management
 * 
 * Coordinator tool to manage residence blocks and rooms.
 * Features:
 * - View all blocks and their status
 * - Add new blocks mid-semester
 * - Import student data via CSV
 * - Edit/archive blocks
 * - Audit logs for all changes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Upload,
  Edit,
  Archive,
  Users,
  Home,
  CheckCircle2,
} from 'lucide-react';
import API from '../../services/api';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { StudentImportData } from '../../types';

export default function BlockManagement() {
  const { blocks, addBlock, fetchBlocks } = useDataStore();
  const { importStudents } = useAuthStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);
  
  /**
   * Handle block creation
   */
  const handleAddBlock = async () => {
    if (!newBlockName) {
      toast.error('Block name is required');
      return;
    }

    try {
      await addBlock({
        name: newBlockName,
        capacity: 0,
        occupiedRooms: 0,
        status: 'active',
        lastUpdated: new Date()
      });
      setIsAddDialogOpen(false);
      setNewBlockName('');
      await fetchBlocks();
    } catch (err) {
      console.error(err);
    }
  };
  
  /**
   * Handle CSV import
   */
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students: StudentImportData[] = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      });

      try {
        await API.post('/residents/batch', students);
        toast.success(`${students.length} students imported successfully`);
        setIsImportDialogOpen(false);
      } catch (err) {
        toast.error('Failed to import student data');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  
  /**
   * Calculate total stats
   */
  const totalCapacity = blocks.reduce((sum, block) => sum + block.capacity, 0);
  const totalOccupied = blocks.reduce((sum, block) => sum + block.occupiedRooms, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Block & Area Management</h1>
          <p className="text-muted-foreground">Manage residence blocks and student assignments</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
                <Upload className="w-4 h-4" />
                Import Students
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Import Student Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 text-foreground">
                <div>
                  <Label className="text-foreground">CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    className="bg-muted border-border mt-1 text-foreground"
                    onChange={handleImportCSV}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Required columns: name, student_id, omang, level, block, room, digital_key
                  </p>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">
                    <strong>Note:</strong> System will auto-create blocks and rooms from CSV data.
                    Digital keys will be assigned to each room.
                  </p>
                </div>
                
                <Button onClick={handleImportCSV} className="w-full bg-primary text-white hover:bg-primary/90">
                  Upload and Import
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Block
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Add New Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 text-foreground">
                <div>
                  <Label className="text-foreground">Block Name</Label>
                  <Input
                    placeholder="e.g., Block D"
                    className="bg-muted border-border mt-1 text-foreground"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-foreground">Description</Label>
                  <Input
                    placeholder="e.g., Male undergraduate residence"
                    className="bg-muted border-border mt-1 text-foreground"
                  />
                </div>
                
                <div>
                  <Label className="text-foreground">Capacity (Number of Rooms)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="bg-muted border-border mt-1 text-foreground"
                  />
                </div>
                
                <div>
                  <Label className="text-foreground">Area</Label>
                  <Input
                    placeholder="e.g., East Campus"
                    className="bg-muted border-border mt-1 text-foreground"
                  />
                </div>
                
                <Button onClick={handleAddBlock} className="w-full bg-primary text-white hover:bg-primary/90">
                  Create Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Blocks</p>
                <p className="text-3xl font-bold text-foreground">{blocks.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Capacity</p>
                <p className="text-3xl font-bold text-foreground">{totalCapacity}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupied Rooms</p>
                <p className="text-3xl font-bold text-foreground">{totalOccupied}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-foreground">{occupancyRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Blocks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(blocks) ? blocks.map((block) => {
          const occupancyPercent = block.capacity > 0 ? Math.round((block.occupiedRooms / block.capacity) * 100) : 0;
          
          return (
            <Card key={block.id} className="bg-white border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg">{block.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{block.area || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-none">Active</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{block.description || 'No description'}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="text-foreground font-semibold">
                      {block.occupiedRooms} / {block.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 border-border text-foreground hover:bg-muted"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 border-border text-foreground hover:bg-muted"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : <div className="col-span-full py-12 text-center text-muted-foreground">No blocks found</div>}
      </div>
      
    </div>
  );
}
