/**
 * BIUST Smart Maintenance System - Inventory Management
 * 
 * Centralized control for maintenance supplies and hardware.
 * Features automated low-stock detection and category-based filtering.
 * 
 * FEATURES: Inventory Tracking, Stock Levels, Procurement Alerts, Supplies
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Package, Search, AlertTriangle, Plus, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

export default function InventoryPage() {
  const { inventory, fetchInventory, addInventory } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      itemName: '',
      category: 'electrical',
      quantity: 0,
      minThreshold: 5,
      unitPrice: 0,
      unit: 'pieces',
      supplier: '',
      location: ''
    }
  });

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  
  const filtered = useMemo(() => inventory.filter(i => 
    [i.name, i.category].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [inventory, searchQuery]);

  const stats = useMemo(() => ({
    total: inventory.length,
    inStock: inventory.filter(i => i.status === 'in_stock').length,
    low: inventory.filter(i => i.status === 'low_stock').length,
    out: inventory.filter(i => i.status === 'out_of_stock').length,
  }), [inventory]);

  const badgeStyles: Record<string, string> = {
    in_stock: 'bg-emerald-100 text-emerald-800',
    low_stock: 'bg-amber-100 text-amber-800',
    out_of_stock: 'bg-rose-100 text-rose-800'
  };
  
  const categories = [
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'safety', label: 'Safety' },
    { value: 'tools', label: 'Tools' },
    { value: 'other', label: 'Other' }
  ];
  
  const units = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'liters', label: 'Liters' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'meters', label: 'Meters' },
    { value: 'sets', label: 'Sets' }
  ];
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const inventoryData = {
        name: data.itemName,
        category: data.category,
        quantity: Number(data.quantity),
        minThreshold: Number(data.minThreshold),
        unitPrice: Number(data.unitPrice),
        totalValue: Number(data.quantity) * Number(data.unitPrice),
        unit: data.unit,
        supplier: data.supplier || 'N/A',
        location: data.location || 'Main Store',
        status: Number(data.quantity) > Number(data.minThreshold) ? 'in_stock' : 
                Number(data.quantity) === 0 ? 'out_of_stock' : 'low_stock'
      };
      
      const success = await addInventory(inventoryData);
      if (success) {
        setIsAddDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage maintenance supplies</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itemName"
                    rules={{ required: 'Item name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    rules={{ 
                      required: 'Quantity is required',
                      min: { value: 0, message: 'Quantity must be positive' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minThreshold"
                    rules={{ 
                      required: 'Min threshold is required',
                      min: { value: 1, message: 'Minimum threshold must be at least 1' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    rules={{ required: 'Unit is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    rules={{ 
                      required: 'Unit price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price (P)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Supplier name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Store" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Stock</p>
                <p className="text-3xl font-bold text-foreground">{stats.inStock}</p>
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
                <p className="text-sm text-muted-foreground mb-1">Low Stock</p>
                <p className="text-3xl font-bold text-foreground">{stats.low}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-foreground">{stats.out}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory Table */}
      <Card className="bg-white border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">All Items</CardTitle>
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
                  <TableHead className="text-muted-foreground">Item Name</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Quantity</TableHead>
                  <TableHead className="text-muted-foreground">Min Threshold</TableHead>
                  <TableHead className="text-muted-foreground">Unit Price</TableHead>
                  <TableHead className="text-muted-foreground">Total Value</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filtered) || filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 border-border">
                      <TableCell className="text-foreground font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {item.category.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <span className={item.quantity <= item.minThreshold ? 'text-orange-500 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground text-sm">{item.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.minThreshold} {item.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        P {item.unitPrice || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        P {item.totalValue || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeStyles[item.status || 'in_stock']}>
                          {(item.status || 'in_stock').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.supplier || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Low Stock Alerts */}
      {stats.low > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(inventory) && inventory
                .filter((item) => item.status === 'low_stock' || item.status === 'out_of_stock')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-lg border border-orange-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: <span className="text-orange-600 font-bold">{item.quantity} {item.unit}</span> • Minimum: {item.minThreshold} {item.unit}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                      <Package className="w-4 h-4" />
                      Reorder
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
