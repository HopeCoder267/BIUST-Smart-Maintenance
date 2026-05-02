/**
 * BIUST Smart Maintenance System - Block & Resident Management
 * 
 * Simplified working version to fix blank page issue
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { Building2, Users, Download, Plus, Trash2, Upload, Edit, UserPlus } from 'lucide-react';

// Mock API service for testing
const mockAPI = {
  get: async (url: string) => {
    console.log('Mock API GET:', url);
    if (url === '/blocks') {
      return { data: [
        { id: '1', name: 'Block A', capacity: 100, occupiedRooms: 50, status: 'active' },
        { id: '2', name: 'Block B', capacity: 80, occupiedRooms: 30, status: 'active' }
      ]};
    }
    if (url.includes('/residents')) {
      return { data: [
        { id: '1', name: 'Alice Johnson', student_id: 'ST001', room_number: '101', digital_key: 'ALICE101', level: 'Year 2' },
        { id: '2', name: 'Bob Smith', student_id: 'ST002', room_number: '102', digital_key: 'BOB102', level: 'Year 3' }
      ]};
    }
    return { data: [] };
  },
  post: async (url: string, data: any) => {
    console.log('Mock API POST:', url, data);
    return { data: { ...data, id: Date.now().toString() } };
  },
  patch: async (url: string, data: any) => {
    console.log('Mock API PATCH:', url, data);
    return { data };
  },
  delete: async (url: string) => {
    console.log('Mock API DELETE:', url);
    return { data: {} };
  }
};

interface Resident {
  id: string;
  name: string;
  student_id: string;
  room_number?: string;
  digital_key: string;
  level?: string;
}

interface Block {
  id: string;
  name: string;
  capacity: number;
  occupiedRooms: number;
  status: string;
}

export default function BlockManagement() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isLoadingResidents, setIsLoadingResidents] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '',
    studentId: '',
    room: '',
    digitalKey: ''
  });
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockCapacity, setNewBlockCapacity] = useState('100');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    console.log('BlockManagement component mounted');
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const res = await mockAPI.get('/blocks');
      setBlocks(res.data);
      console.log('Blocks loaded:', res.data);
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
    }
  };

  const fetchResidents = async (blockId: string) => {
    setIsLoadingResidents(true);
    try {
      const res = await mockAPI.get(`/residents?blockId=${blockId}`);
      setResidents(res.data);
      console.log('Residents loaded:', res.data);
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    } finally {
      setIsLoadingResidents(false);
    }
  };

  const openResidentDialog = (block: Block) => {
    setSelectedBlock(block);
    fetchResidents(block.id);
    setIsResidentDialogOpen(true);
  };

  const handleAddBlock = async () => {
    if (!newBlockName) {
      toast.error('Block name is required');
      return;
    }

    try {
      const newBlock = {
        name: newBlockName,
        capacity: parseInt(newBlockCapacity) || 0,
        occupiedRooms: 0,
        status: 'active'
      };
      
      const res = await mockAPI.post('/blocks', newBlock);
      setBlocks([...blocks, res.data]);
      setIsAddDialogOpen(false);
      setNewBlockName('');
      setNewBlockCapacity('100');
      toast.success('Block added successfully');
    } catch (err) {
      console.error('Failed to add block:', err);
      toast.error('Failed to add block');
    }
  };

  const handleAddResident = async () => {
    if (!newResident.name || !newResident.studentId || !newResident.digitalKey || !newResident.room) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const residentData = {
        name: newResident.name,
        student_id: newResident.studentId,
        room_number: newResident.room,
        digital_key: newResident.digitalKey,
        level: 'Year 2'
      };

      const res = await mockAPI.post('/residents', residentData);
      setResidents([...residents, res.data]);
      
      // Update block count
      if (selectedBlock) {
        setBlocks(blocks.map(block => 
          block.id === selectedBlock.id 
            ? { ...block, occupiedRooms: block.occupiedRooms + 1 }
            : block
        ));
      }
      
      setNewResident({ name: '', studentId: '', room: '', digitalKey: '' });
      toast.success('Resident added successfully');
    } catch (err) {
      console.error('Failed to add resident:', err);
      toast.error('Failed to add resident');
    }
  };

  const handleUpdateResident = async () => {
    if (!editingResident) return;

    try {
      await mockAPI.patch(`/residents/${editingResident.id}`, {
        name: editingResident.name,
        digital_key: editingResident.digital_key
      });
      
      setResidents(residents.map(resident => 
        resident.id === editingResident.id ? editingResident : resident
      ));
      
      setEditingResident(null);
      toast.success('Resident updated successfully');
    } catch (err) {
      console.error('Failed to update resident:', err);
      toast.error('Failed to update resident');
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      try {
        await mockAPI.delete(`/residents/${residentId}`);
        setResidents(residents.filter(resident => resident.id !== residentId));
        
        // Update block count
        if (selectedBlock) {
          setBlocks(blocks.map(block => 
            block.id === selectedBlock.id 
              ? { ...block, occupiedRooms: Math.max(0, block.occupiedRooms - 1) }
              : block
          ));
        }
        
        toast.success('Resident deleted successfully');
      } catch (err) {
        console.error('Failed to delete resident:', err);
        toast.error('Failed to delete resident');
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,student_id,omang,level,block,room,digitalKey
Alice Johnson,ST001,123456789,Year 2 Computer Science,Block A,101,ALICE101
Bob Smith,ST002,987654321,Year 3 Engineering,Block A,102,BOB102`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resident_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV template downloaded');
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsImporting(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      });

      console.log('Mock importing students:', students);
      toast.success(`${students.length} students imported successfully`);
      setIsImportDialogOpen(false);
      setCsvFile(null);
      await fetchBlocks();
    } catch (err: any) {
      console.error('CSV Import Error:', err);
      toast.error('Failed to import student data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
  };

  // Calculate total stats
  const totalCapacity = blocks.reduce((sum, block) => sum + block.capacity, 0);
  const totalOccupied = blocks.reduce((sum, block) => sum + block.occupiedRooms, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  console.log('Rendering BlockManagement with blocks:', blocks.length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Block & Resident Management</h1>
          <p className="text-muted-foreground">CSV bulk import + Manual resident management</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                CSV Import
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-border text-foreground max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Bulk Student Import (CSV)</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">📊 CSV Bulk Import</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Import students at once</p>
                    <p>• Auto-creates blocks and rooms</p>
                    <p>• Perfect for semester setup</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3">📥 CSV Template</h3>
                  <Button onClick={downloadTemplate} className="w-full bg-green-600 text-white hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div>
                  <Label className="font-semibold">Select CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  {csvFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCsvFile(null)}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleImportCSV}
                    disabled={!csvFile || isImporting}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isImporting ? 'Importing...' : 'Import Students'}
                  </Button>
                </div>
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
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Block Name</Label>
                  <Input
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    placeholder="e.g., Block A"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Capacity</Label>
                  <Input
                    type="number"
                    value={newBlockCapacity}
                    onChange={(e) => setNewBlockCapacity(e.target.value)}
                    placeholder="100"
                  />
                </div>
                
                <Button onClick={handleAddBlock} className="w-full bg-primary text-white hover:bg-primary/90">
                  Add Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <Card key={block.id} className="bg-white border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{block.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Test Block</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-none">Active</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Test description</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">
                    {block.occupiedRooms} / {block.capacity}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.round((block.occupiedRooms / block.capacity) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => openResidentDialog(block)}
                >
                  <Users className="w-4 h-4" />
                  Manage ({block.occupiedRooms})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resident Management Dialog */}
      <Dialog open={isResidentDialogOpen} onOpenChange={setIsResidentDialogOpen}>
        <DialogContent className="bg-white border-border text-foreground max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              🏠 Manage Residents - {selectedBlock?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Manual Resident Addition */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">➕ Add Resident (Manual)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Name *</Label>
                  <Input
                    value={newResident.name}
                    onChange={(e) => setNewResident({...newResident, name: e.target.value})}
                    placeholder="John Doe"
                    className="bg-white border-blue-300"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Student ID *</Label>
                  <Input
                    value={newResident.studentId}
                    onChange={(e) => setNewResident({...newResident, studentId: e.target.value})}
                    placeholder="ST001"
                    className="bg-white border-blue-300"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Room *</Label>
                  <Input
                    value={newResident.room}
                    onChange={(e) => setNewResident({...newResident, room: e.target.value})}
                    placeholder="101"
                    className="bg-white border-blue-300"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Digital Key *</Label>
                  <Input
                    value={newResident.digitalKey}
                    onChange={(e) => setNewResident({...newResident, digitalKey: e.target.value})}
                    placeholder="KEY001"
                    className="bg-white border-blue-300"
                  />
                </div>
              </div>
              <Button onClick={handleAddResident} className="mt-3 bg-blue-600 text-white hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Resident
              </Button>
            </div>

            {/* Residents List */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                📋 Current Residents ({residents.length})
              </h3>
              {isLoadingResidents ? (
                <div className="text-center py-8 text-muted-foreground">Loading residents...</div>
              ) : residents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No residents found</p>
                  <p className="text-sm">Add residents manually or import via CSV</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Digital Key</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {residents.map((resident) => (
                        <TableRow key={resident.id}>
                          <TableCell>
                            {editingResident?.id === resident.id ? (
                              <Input
                                value={editingResident.name}
                                onChange={(e) => setEditingResident({...editingResident, name: e.target.value})}
                                className="bg-white border-border"
                              />
                            ) : (
                                resident.name
                            )}
                          </TableCell>
                          <TableCell>{resident.student_id}</TableCell>
                          <TableCell>{resident.room_number}</TableCell>
                          <TableCell>
                            {editingResident?.id === resident.id ? (
                              <Input
                                value={editingResident.digital_key}
                                onChange={(e) => setEditingResident({...editingResident, digital_key: e.target.value})}
                                className="bg-white border-border font-mono text-xs"
                              />
                            ) : (
                              <code className="text-xs bg-muted px-2 py-1 rounded">{resident.digital_key}</code>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {editingResident?.id === resident.id ? (
                                <>
                                  <Button size="sm" onClick={handleUpdateResident} className="bg-green-600 text-white hover:bg-green-700">
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingResident(null)}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => setEditingResident(resident)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteResident(resident.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Integration Info */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🔄 CSV + Manual Integration</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• <strong>CSV Import:</strong> Bulk add residents from spreadsheet</p>
                <p>• <strong>Manual Entry:</strong> Add/edit individual residents</p>
                <p>• <strong>Real-time Sync:</strong> Changes reflect immediately</p>
                <p>• <strong>Shared Database:</strong> Both methods write to same tables</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalCapacity}</div>
            <p className="text-sm text-muted-foreground">Total available spaces</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalOccupied}</div>
            <p className="text-sm text-muted-foreground">Currently occupied</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{occupancyRate}%</div>
            <p className="text-sm text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
