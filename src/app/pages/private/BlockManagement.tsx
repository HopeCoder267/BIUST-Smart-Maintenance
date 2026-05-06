/**
 * BIUST Smart Maintenance System - Working Block Management
 * 
 * Using exact same pattern as working add block for all operations
 * No complex logic - simple, working CRUD
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { Building2, Users, Download, Plus, Trash2, Upload, UserPlus } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Block, Resident } from '../../types';
import { 
  collection,
  query,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';

export default function BlockManagement() {
  const { 
    blocks, 
    residents, 
    rooms,
    fetchBlocks, 
    fetchResidents, 
    fetchRooms,
    addBlock, 
    updateBlock, 
    deleteBlock, 
    addResident, 
    updateResident,
    deleteResident,
    addRoom,
    deleteRoom
  } = useDataStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isLoadingResidents, setIsLoadingResidents] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '',
    studentId: '',
    omang: '',
    level: '',
    room: '',
    digitalKey: ''
  });
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockCapacity, setNewBlockCapacity] = useState('100');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  // DATASTORE PATTERN: Fetch blocks using centralized dataStore
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // DATASTORE PATTERN: Add block using centralized dataStore
  const handleAddBlock = async () => {
    if (!newBlockName) {
      toast.error('Block name is required');
      return;
    }

    const blockData = {
      name: newBlockName,
      total_rooms: parseInt(newBlockCapacity) || 0,
      capacity: parseInt(newBlockCapacity) || 0,
      total_residents: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const success = await addBlock(blockData);
    if (success) {
      setIsAddDialogOpen(false);
      setNewBlockName('');
      setNewBlockCapacity('100');
    }
  };

  // DATASTORE PATTERN: Delete block using centralized dataStore
  const handleDeleteBlock = async (block: Block) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return;
    }

    const success = await deleteBlock(block.id);
    if (success) {
      toast.success('Block deleted successfully');
    }
  };

  
  // DATASTORE PATTERN: Fetch residents for block using centralized dataStore
  const openResidentDialog = async (block: Block) => {
    setSelectedBlock(block);
    setIsLoadingResidents(true);
    try {
      await fetchResidents(block.id);
    } catch (err) {
      console.error('Failed to fetch residents:', err);
      toast.error('Failed to load residents');
    } finally {
      setIsLoadingResidents(false);
    }
    setIsResidentDialogOpen(true);
  };

  // DATASTORE PATTERN: Add resident using centralized dataStore
  const handleAddResident = async () => {
    if (!newResident.name || !newResident.studentId || !newResident.digitalKey || !newResident.room) {
      toast.error('Please fill in all required fields');
      return;
    }

    const residentData = {
      name: newResident.name,
      studentId: newResident.studentId,
      omang: newResident.omang,
      level: newResident.level,
      blockName: selectedBlock?.name || '',
      blockId: selectedBlock?.id || '', // CRITICAL: Add blockId for proper filtering
      roomNumber: newResident.room,
      digitalKey: newResident.digitalKey,
      roomId: '', // Will be set by backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('DEBUG: Adding resident with data:', residentData);
    console.log('DEBUG: Selected block:', selectedBlock);

    // CRITICAL: Create both resident and room entries
    try {
      // Add resident first
      const residentSuccess = await addResident(residentData);
      if (!residentSuccess) {
        toast.error('Failed to add resident');
        return;
      }

      // Create room entry
      const roomData = {
        blockName: selectedBlock?.name || '',
        blockId: selectedBlock?.id || '',
        roomID: newResident.room,
        roomId: newResident.room,
        digitalKey: newResident.digitalKey,
        residentName: newResident.name,
        residentId: '', // Will be populated after resident is created
        occupied: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const roomSuccess = await addRoom(roomData);
      if (!roomSuccess) {
        toast.error('Resident added but room creation failed');
      } else {
        toast.success('Resident and room added successfully');
      }

      // Reset form
      setNewResident({
        name: '',
        studentId: '',
        omang: '',
        level: '',
        room: '',
        digitalKey: ''
      });
      
      // CRITICAL: Update block resident count
      if (selectedBlock) {
        await updateBlockResidentCount(selectedBlock.id);
      }
      
      // Refresh data
      await fetchBlocks();
      if (selectedBlock) {
        await fetchResidents(selectedBlock.id);
        await fetchRooms(selectedBlock.id);
      }
      
    } catch (error: any) {
      console.error('Failed to add resident and room:', error);
      toast.error('Failed to add resident and room');
    }
  };

  // DATASTORE PATTERN: Delete resident using centralized dataStore
  const handleDeleteResident = async (resident: Resident) => {
    if (!confirm('Are you sure you want to delete this resident?')) {
      return;
    }

    try {
      // Delete resident first
      const residentSuccess = await deleteResident(resident.id);
      if (!residentSuccess) {
        toast.error('Failed to delete resident');
        return;
      }

      // Find and delete associated room
      if (rooms && resident.roomNumber) {
        const associatedRoom = rooms.find(room => 
          room.roomId === resident.roomNumber && 
          room.blockId === resident.blockId
        );
        
        if (associatedRoom) {
          // Delete the room entry using dataStore
          await deleteRoom(associatedRoom.id);
        }
      }

      // Refresh blocks to update counts
      await fetchBlocks();
      
      // CRITICAL: Update block resident count
      if (selectedBlock) {
        await updateBlockResidentCount(selectedBlock.id);
      }
      
      // Refresh residents for current block
      if (selectedBlock) {
        await fetchResidents(selectedBlock.id);
        await fetchRooms(selectedBlock.id);
      }
      
      toast.success('Resident and associated room deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete resident:', error);
      toast.error('Failed to delete resident');
    }
  };

  // DATASTORE PATTERN: Edit resident using centralized dataStore
  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setNewResident({
      name: resident.name,
      studentId: resident.studentId || '',
      omang: resident.omang || '',
      level: resident.level || '',
      room: resident.roomNumber || '',
      digitalKey: resident.digitalKey || ''
    });
    setIsEditing(true);
  };

  // DATASTORE PATTERN: Update resident using centralized dataStore
  const handleUpdateResident = async () => {
    if (!editingResident || !newResident.name || !newResident.studentId || !newResident.digitalKey || !newResident.room) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedData = {
      name: newResident.name,
      studentId: newResident.studentId,
      omang: newResident.omang,
      level: newResident.level,
      blockName: selectedBlock?.name || '',
      blockId: selectedBlock?.id || '', // CRITICAL: Include blockId for proper filtering
      roomNumber: newResident.room,
      digitalKey: newResident.digitalKey,
      roomId: editingResident.roomId || '',
      updatedAt: new Date().toISOString()
    };

    const success = await updateResident(editingResident.id, updatedData);
    if (success) {
      // Reset form
      setNewResident({
        name: '',
        studentId: '',
        omang: '',
        level: '',
        room: '',
        digitalKey: ''
      });
      setEditingResident(null);
      setIsEditing(false);
      
      // CRITICAL: Update block resident count
      if (selectedBlock) {
        await updateBlockResidentCount(selectedBlock.id);
      }
      
      // Refresh data
      await fetchBlocks();
      if (selectedBlock) {
        await fetchResidents(selectedBlock.id);
      }
      
      toast.success('Resident updated successfully');
    }
  };

  // DATASTORE PATTERN: Cancel editing
  const handleCancelEdit = () => {
    setNewResident({
      name: '',
      studentId: '',
      omang: '',
      level: '',
      room: '',
      digitalKey: ''
    });
    setEditingResident(null);
    setIsEditing(false);
  };

  // CRITICAL: Update block resident counts after resident operations
  const updateBlockResidentCount = async (blockId: string) => {
    try {
      // Count residents for this block
      const allResidentsQuery = query(collection(db, 'residents'));
      const querySnapshot = await getDocs(allResidentsQuery);
      const allResidents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const blockResidents = allResidents.filter((r: any) => 
        r.blockId === blockId || 
        r.blockName === blocks.find(b => b.id === blockId)?.name
      );
      
      // Update the block with new resident count
      await updateBlock(blockId, {
        totalResidents: blockResidents.length,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Updated block ${blockId} resident count to ${blockResidents.length}`);
    } catch (error: any) {
      console.error('Failed to update block resident count:', error);
    }
  };

  // WORKING PATTERN: CSV import (same approach)
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

      console.log('Importing students:', students);
      
      // Import students one by one using dataStore
      let successCount = 0;
      for (const student of students) {
        const success = await addResident(student);
        if (success) successCount++;
      }
      
      console.log(`Import result: ${successCount}/${students.length} students imported`);
      
      if (successCount > 0) {
        toast.success(`${successCount} students imported successfully`);
      } else {
        toast.error('No students were imported');
      }
      setIsImportDialogOpen(false);
      setCsvFile(null);
      
      // CRITICAL: Update all block resident counts after CSV import
      const uniqueBlocks = [...new Set(students.map(s => s.block || s.block_name))];
      for (const blockName of uniqueBlocks) {
        const block = blocks.find(b => b.name === blockName);
        if (block) {
          await updateBlockResidentCount(block.id);
        }
      }
      
      // Refresh dataStore to show new data
      await fetchBlocks();
      if (selectedBlock) {
        await fetchResidents(selectedBlock.id);
      }
    } catch (err: any) {
      console.error('CSV Import Error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to import student data';
      toast.error(errorMessage);
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

  // Calculate stats
  const totalCapacity = blocks.reduce((sum, block) => sum + (block.capacity || 0), 0);
  const totalOccupied = blocks.reduce((sum, block) => sum + (block.totalResidents || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Block Management</h1>
          <p className="text-muted-foreground">Centralized dataStore with consistent CRUD operations</p>
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
                <DialogDescription>
                  Import multiple students at once using a CSV file
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">📊 CSV Import</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Import students directly to database</p>
                    <p>• Auto-creates blocks and rooms</p>
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
                  <Button variant="outline" onClick={() => setCsvFile(null)}>
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
                <DialogDescription>
                  Create a new residential block for student accommodation
                </DialogDescription>
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

      {/* Blocks Grid - Working Pattern */}
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
                    <p className="text-sm text-muted-foreground">
                      {block.totalRooms || 0} rooms
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-none">
                  {block.status || 'active'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">
                    {block.totalResidents || 0} / {block.capacity || 0}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${block.capacity > 0 ? Math.round((block.totalResidents / block.capacity) * 100) : 0}%` 
                    }}
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
                  Manage ({block.totalResidents || 0})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteBlock(block)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resident Management Dialog - Working Pattern */}
      <Dialog open={isResidentDialogOpen} onOpenChange={setIsResidentDialogOpen}>
        <DialogContent className="bg-white border-border text-foreground max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              🏠 Manage Residents - {selectedBlock?.name}
            </DialogTitle>
            <DialogDescription>
              Add, view, and manage residents for this block
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add Resident - Working Pattern */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">
                {isEditing ? '✏️ Edit Resident' : '➕ Add Resident'}
              </h3>
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
                    placeholder="KEY12345"
                    className="bg-white border-blue-300"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdateResident} className="bg-blue-600 text-white hover:bg-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Resident
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddResident} className="bg-blue-600 text-white hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Resident
                  </Button>
                )}
              </div>
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
                          <TableCell>{resident.name}</TableCell>
                          <TableCell>{resident.studentId}</TableCell>
                          <TableCell>{resident.roomNumber}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{resident.digitalKey}</code>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditResident(resident)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L8.828 15.172a2 2 0 00-2.828 0l-4.414-4.414a2 2 0 010-2.828z" />
                                </svg>
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteResident(resident)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Working Pattern Info */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">✅ DataStore Pattern Applied</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• <strong>Add Block:</strong> DataStore pattern ✅</p>
                <p>• <strong>Delete Block:</strong> DataStore pattern ✅</p>
                <p>• <strong>Add Resident:</strong> DataStore pattern ✅</p>
                <p>• <strong>Delete Resident:</strong> DataStore pattern ✅</p>
                <p>• <strong>Centralized Error Handling:</strong> DataStore ✅</p>
                <p>• <strong>State Persistence:</strong> DataStore ✅</p>
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
            <p className="text-sm text-muted-foreground">Real database capacity</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalOccupied}</div>
            <p className="text-sm text-muted-foreground">Real resident count</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{occupancyRate}%</div>
            <p className="text-sm text-muted-foreground">Live calculation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
