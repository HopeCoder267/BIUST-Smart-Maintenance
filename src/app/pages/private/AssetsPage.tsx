/**
 * BIUST Smart Maintenance System - Assets Page
 * 
 * Comprehensive asset management for maintenance coordinators.
 * Features asset tracking, maintenance scheduling, depreciation, and lifecycle management.
 * 
 * FEATURES: Asset Management, Maintenance Scheduling, Depreciation Tracking, Lifecycle
 */

import { useState, useEffect, useMemo } from 'react';
import { usePrivateAuthStore } from '../../store/privateAuthStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import {
  Box, Plus, Search, Filter, Calendar, Clock, User,
  MapPin, DollarSign, CheckCircle2, AlertCircle, Eye, Edit,
  Trash2, Download, Wrench, Building, Settings, Package,
  Barcode, Camera, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { User as UserType, Asset, AssetStatus, AssetCategory, MaintenanceRecord } from '../../types';

export default function AssetsPage() {
  const { 
    assets, 
    fetchAssets, 
    addAsset, 
    updateAsset, 
    deleteAsset,
    fetchUsers,
    fetchBlocks,
    users 
  } = useDataStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    assetNumber: '',
    name: '',
    description: '',
    category: 'equipment',
    status: 'operational',
    location: '',
    purchaseDate: '',
    purchaseCost: 0,
    currentValue: 0,
    warrantyExpiry: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    assignedTo: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    specifications: {}
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchBlocks(),
        fetchAssets()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchUsers, fetchBlocks, fetchAssets]);

  // Filter assets based on search and filters
  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => 
      true // Removed user role check
    );

    // Apply search filter
    if (query) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        asset.assetNumber?.toLowerCase().includes(query.toLowerCase()) ||
        asset.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  }, [assets, query]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      operational: 'bg-green-100 text-green-700',
      maintenance_required: 'bg-amber-100 text-amber-700',
      out_of_service: 'bg-red-100 text-red-700',
      retired: 'bg-slate-100 text-slate-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  // Get category badge styling
  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      electrical: 'bg-blue-100 text-blue-700',
      hvac: 'bg-cyan-100 text-cyan-700',
      plumbing: 'bg-indigo-100 text-indigo-700',
      mechanical: 'bg-purple-100 text-purple-700',
      furniture: 'bg-pink-100 text-pink-700',
      it: 'bg-emerald-100 text-emerald-700'
    };
    return styles[category] || 'bg-gray-100 text-gray-700';
  };

  // Calculate asset health score
  const getHealthScore = (asset: Asset) => {
    const ageInYears = (new Date().getTime() - new Date(asset.purchaseDate || '').getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = 0.1; // 10% per year
    const expectedValue = (asset.purchaseCost || 0) * Math.exp(-depreciationRate * ageInYears);
    const valueRetention = (asset.currentValue || 0) / (asset.purchaseCost || 1);
    
    // Consider maintenance status
    let maintenanceScore = 1;
    if (asset.status === 'maintenance_required') maintenanceScore = 0.7;
    if (asset.status === 'out_of_service') maintenanceScore = 0.3;
    if (asset.status === 'retired') maintenanceScore = 0.1;
    
    return Math.round((valueRetention * maintenanceScore) * 100);
  };

  // Handle creating new asset
  const handleAddAsset = async () => {
    if (!formData.name) {
      toast.error('Asset name is required');
      return;
    }

    const assetPayload = {
      ...formData,
      assetNumber: formData.assetNumber || `AST-${Date.now().toString().slice(-6)}`,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      currentValue: parseFloat(formData.currentValue.toString()) || parseFloat(formData.purchaseCost.toString()) || 0,
      purchaseCost: parseFloat(formData.purchaseCost.toString()) || 0
    };

    const success = await addAsset(assetPayload);
    if (success) {
      setFormData({
        assetNumber: '',
        name: '',
        description: '',
        category: 'equipment',
        status: 'operational',
        location: '',
        purchaseDate: '',
        purchaseCost: 0,
        currentValue: 0,
        warrantyExpiry: '',
        lastMaintenanceDate: '',
        nextMaintenanceDate: '',
        assignedTo: '',
        model: '',
        manufacturer: '',
        serialNumber: '',
        specifications: {}
      });
      setIsAddDialogOpen(false);
      
      // CRITICAL: Refresh assets to show new asset immediately
      await fetchAssets();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground">
            Manage and track facility assets and equipment
          </p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddAsset(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Central Air Conditioning Unit"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="it">IT Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the asset"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Block A - Mechanical Room"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purchaseCost">Purchase Cost *</Label>
                    <Input
                      id="purchaseCost"
                      type="number"
                      value={formData.purchaseCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseCost: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g., 15000"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., ACU-2000X"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                      placeholder="e.g., CoolTech Industries"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="e.g., CT-2000X-12345"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select value={formData.assignedTo || 'unassigned'} onValueChange={(value: any) => setFormData(prev => ({ ...prev, assignedTo: value === 'unassigned' ? '' : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
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
                
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Asset
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Asset Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Assets</p>
                <p className="text-3xl font-bold text-foreground">{assets.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Box className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operational</p>
                <p className="text-3xl font-bold text-foreground">
                  {assets.filter(a => a.status === 'operational').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Maintenance Required</p>
                <p className="text-3xl font-bold text-foreground">
                  {assets.filter(a => a.status === 'maintenance_required').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-3xl font-bold text-foreground">
                  ${assets.reduce((sum, a) => sum + (a.currentValue || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance_required">Maintenance Required</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="it">IT Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Assets ({filteredAssets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assets found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first asset to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.assetNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadge(asset.category)}>
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(asset.status)}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getHealthScore(asset)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{getHealthScore(asset)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${asset.currentValue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          ${asset.purchaseCost.toLocaleString()} purchase
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {asset.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(asset.nextMaintenanceDate, 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedAsset(asset);
                          setEditFormData(asset);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this asset?')) {
                              const success = await deleteAsset(asset.id);
                              if (success) {
                                toast.success('Asset deleted successfully');
                                await fetchAssets();
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Asset Details Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                {selectedAsset.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadge(selectedAsset.status)}>
                    {selectedAsset.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <Badge className={getCategoryBadge(selectedAsset.category)}>
                    {selectedAsset.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Health Score</Label>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getHealthScore(selectedAsset)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{getHealthScore(selectedAsset)}%</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Value</Label>
                  <div>
                    <p className="font-medium">${selectedAsset.currentValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      ${selectedAsset.purchaseCost.toLocaleString()} purchase
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedAsset.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-sm">{selectedAsset.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Asset Number</Label>
                  <p className="text-sm">{selectedAsset.assetNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <p className="text-sm">{selectedAsset.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Date</Label>
                  <p className="text-sm">{format(selectedAsset.purchaseDate, 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Warranty Expiry</Label>
                  <p className="text-sm">{format(selectedAsset.warrantyExpiry, 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Maintenance</Label>
                  <p className="text-sm">{format(selectedAsset.lastMaintenanceDate, 'PPP')}</p>
                </div>
              </div>
              
              {selectedAsset.specifications && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-3">Specifications</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedAsset.specifications).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAsset.maintenanceHistory.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-3">Maintenance History</Label>
                  <div className="space-y-2">
                    {selectedAsset.maintenanceHistory.map((maintenance: MaintenanceRecord, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{maintenance.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(maintenance.date, 'PPP')} by {maintenance.performedBy.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${maintenance.cost}</p>
                          <Badge variant="outline" className="text-xs">
                            {maintenance.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Asset
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
