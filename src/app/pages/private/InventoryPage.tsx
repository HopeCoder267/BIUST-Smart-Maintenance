/**
 * BIUST Smart Maintenance System - Inventory Management Page
 * 
 * Manage inventory items with automatic updates from job card completions.
 * Features:
 * - View all inventory items
 * - Filter and search
 * - Low stock alerts
 * - Add/edit inventory items
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateStock } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * Filter inventory based on search
   */
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  /**
   * Calculate inventory stats
   */
  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter((i) => i.status === 'in_stock').length,
    lowStock: inventory.filter((i) => i.status === 'low_stock').length,
    outOfStock: inventory.filter((i) => i.status === 'out_of_stock').length,
  };
  
  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-amber-100 text-amber-800',
      out_of_stock: 'bg-red-100 text-red-800',
      discontinued: 'bg-slate-100 text-slate-800',
    };
    
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage maintenance supplies</p>
        </div>
        <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalItems}</p>
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
                <p className="text-3xl font-bold text-foreground">{stats.lowStock}</p>
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
                <p className="text-3xl font-bold text-foreground">{stats.outOfStock}</p>
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
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
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
                        P {item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        P {item.totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status.replace('_', ' ')}
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
      {stats.lowStock > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory
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
