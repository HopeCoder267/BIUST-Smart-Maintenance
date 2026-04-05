/**
 * BIUST Smart Maintenance System - Finance Dashboard
 * 
 * PIN-locked finance module for coordinators only.
 * Requires additional PIN authentication to access sensitive financial data.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Lock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * FinanceDashboard Component
 * 
 * Coordinator-only finance module with PIN protection.
 * Displays budget summary, spending trends, project costs, and procurement tracking.
 */
export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { user, isFinanceUnlocked, unlockFinance, lockFinance, hasRole } = useAuthStore();
  const { budget } = useDataStore();
  
  const [pin, setPin] = useState('');
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(true);
  
  /**
   * Redirect if user is not coordinator
   */
  useEffect(() => {
    if (!hasRole('coordinator')) {
      toast.error('Access denied', {
        description: 'Only coordinators can access the finance module',
      });
      navigate('/dashboard/coordinator');
    }
  }, [hasRole, navigate]);
  
  /**
   * Check if finance is already unlocked
   */
  useEffect(() => {
    if (isFinanceUnlocked) {
      setIsPinDialogOpen(false);
    }
  }, [isFinanceUnlocked]);
  
  /**
   * Handle PIN submission
   */
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (unlockFinance(pin)) {
      toast.success('Finance module unlocked');
      setIsPinDialogOpen(false);
      setPin('');
    } else {
      toast.error('Invalid PIN', {
        description: 'Please try again',
      });
      setPin('');
    }
  };
  
  /**
   * Handle lock finance
   */
  const handleLock = () => {
    lockFinance();
    setIsPinDialogOpen(true);
    toast.info('Finance module locked');
  };
  
  // Mock spending trend data
  const spendingTrendData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 58000 },
  ];
  
  // Mock project costs data
  const projectCostsData = [
    { name: 'Block A Renovation', planned: 150000, actual: 145000 },
    { name: 'HVAC Upgrade', planned: 80000, actual: 92000 },
    { name: 'Plumbing Repairs', planned: 45000, actual: 41000 },
  ];
  
  return (
    <>
      {/* PIN Unlock Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={() => {}}>
        <DialogContent
          className="bg-white border-border text-foreground"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <Lock className="w-5 h-5" />
              </div>
              Finance Module Access
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePinSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Enter Finance PIN</Label>
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="bg-muted border-border text-center text-2xl tracking-widest text-foreground"
                autoFocus
              />
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-primary font-semibold mb-1">
                    Security Notice
                  </p>
                  <p className="text-xs text-primary/80">
                    This module contains sensitive financial information. Additional
                    authentication is required for security purposes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-muted"
                onClick={() => navigate('/dashboard/coordinator')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90" disabled={pin.length !== 4}>
                Unlock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Finance Dashboard Content */}
      {isFinanceUnlocked && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Finance Dashboard</h1>
              <p className="text-muted-foreground">Budget management and financial tracking</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted" onClick={handleLock}>
                <Lock className="w-4 h-4" />
                Lock Module
              </Button>
              <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
          
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-foreground">
                      P {budget ? budget.totalAmount.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Allocated</p>
                    <p className="text-2xl font-bold text-foreground">
                      P {budget ? budget.allocatedAmount.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-foreground">
                      P {budget ? budget.remainingAmount.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Burn Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      P {budget ? budget.burnRate.toLocaleString() : '0'}/mo
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for Different Views */}
          <Tabs defaultValue="spending" className="space-y-4">
            <TabsList className="bg-muted border-border">
              <TabsTrigger value="spending" className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground">Spending Trends</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground">Project Costs</TabsTrigger>
              <TabsTrigger value="procurement" className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground">Procurement</TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-white text-foreground">Expense Log</TabsTrigger>
            </TabsList>
            
            {/* Spending Trends */}
            <TabsContent value="spending">
              <Card className="bg-white border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Monthly Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={spendingTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="month" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#FF8C00"
                        strokeWidth={2}
                        dot={{ fill: '#FF8C00', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Project Costs */}
            <TabsContent value="projects">
              <Card className="bg-white border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Project Costs: Planned vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={projectCostsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="name" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="planned" fill="#FF8C00" name="Planned" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Procurement Tracker */}
            <TabsContent value="procurement">
              <Card className="bg-white border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Procurement Tracker</CardTitle>
                    <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90">
                      <Plus className="w-4 h-4" />
                      New Order
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { order: 'PO-001', supplier: 'Palapye Plumbing & Hardware', amount: 12500, status: 'Delivered' },
                      { order: 'PO-002', supplier: 'Serowe Electrical Mart', amount: 8300, status: 'In Transit' },
                      { order: 'PO-003', supplier: 'Gaborone Security Solutions', amount: 15000, status: 'Pending' },
                    ].map((item) => (
                      <div key={item.order} className="p-4 bg-muted border border-border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{item.order}</p>
                          <p className="text-sm text-muted-foreground">{item.supplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">P {item.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Expense Log */}
            <TabsContent value="expenses">
              <Card className="bg-white border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Recent Expenses</CardTitle>
                    <Button size="sm" className="gap-2 bg-primary text-white hover:bg-primary/90">
                      <Plus className="w-4 h-4" />
                      Log Expense
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: '#456', description: 'HVAC Repair Materials', amount: 2500, date: '2024-03-25' },
                      { id: '#457', description: 'Plumbing Supplies', amount: 1800, date: '2024-03-24' },
                      { id: '#458', description: 'Electrical Components', amount: 3200, date: '2024-03-23' },
                    ].map((expense) => (
                      <div key={expense.id} className="p-4 bg-muted border border-border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">Invoice {expense.id} • {expense.date}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">P {expense.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}
