/**
 * BIUST Smart Maintenance System - Coordinator Dashboard
 * 
 * High-level oversight for campus maintenance coordinators.
 * Integrates real-time analytics, budget tracking, and resource management.
 * 
 * FEATURES: Analytics, Budget Control, Performance, Asset Overview
 */
//check

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Users, DollarSign, Download, Building2, Check, Search, Clock } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';

const COLORS = ['#FF8C00', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CoordinatorDashboard() {
  const { dashboardAnalytics: stats, budget, tickets, inventory, fetchTickets, fetchInventory, fetchPublicBlocks, fetchBudget, fetchAnalytics, updateTicket } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [fundingApprovals, setFundingApprovals] = useState<Record<string, boolean>>({});
  const [inventoryChecks, setInventoryChecks] = useState<Record<string, boolean>>({});
  
  // Safe date formatting function
  const safeFormatDate = (timestamp: any, formatString: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatString);
    } catch (error) {
      console.warn('Invalid date format:', timestamp);
      return 'N/A';
    }
  };

  // Handle inventory check
  const handleInventoryCheck = async (ticketId: string, checked: boolean) => {
    setInventoryChecks(prev => ({ ...prev, [ticketId]: checked }));
    
    if (checked) {
      // If inventory is confirmed available, advance to technicianAssigned stage
      await updateTicket(ticketId, {
        currentStage: 'technicianAssigned',
        progressHistory: [{
          stage: 'technicianAssigned',
          timestamp: new Date(),
          updatedBy: { id: 'coordinator', name: 'Coordinator', role: 'coordinator' },
          notes: 'Materials confirmed available in inventory, ready for technician assignment'
        }]
      });
      
      await fetchTickets();
    }
    // If unchecked, ticket stays in sourcingFunds stage (no change)
  };
  
  /**
   * Sync core data on load to ensure reports are accurate.
   */
  useEffect(() => {
    fetchTickets();
    fetchInventory();
    fetchPublicBlocks();
    fetchBudget();
    fetchAnalytics();
  }, [fetchTickets, fetchInventory, fetchPublicBlocks, fetchBudget, fetchAnalytics]);
  
  const mapToChart = (data: Record<string, number> = {}) => 
    Object.entries(data).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value }));

  const categoryData = useMemo(() => mapToChart(stats?.ticketsByCategory), [stats?.ticketsByCategory]);
  const priorityData = useMemo(() => mapToChart(stats?.ticketsByPriority), [stats?.ticketsByPriority]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Coordinator Dashboard</h1>
          {/*<p className="text-slate-500 font-medium">Coordinating BIUST campus excellence through data.</p>*/}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold shadow-sm"><Download className="w-4 h-4" /> Export Analytics</Button>
          {/*<Button className="gap-2 font-bold shadow-md"><Calendar className="w-4 h-4" /> Direct Dispatch</Button>*/}
        </div>
      </header>
      
      {/* High-Impact Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Tickets', value: stats?.totalTickets, icon: FileText, color: 'primary' },
          { label: 'Avg. Resolution', value: `${stats?.averageResolutionTime}h`, icon: TrendingUp, color: 'purple' },
          { label: 'Budget Utilization', value: `${budget?.[0]?.totalAmount ? Math.round((budget[0]?.allocatedAmount / budget[0]?.totalAmount) * 100) : 0}%`, icon: DollarSign, color: 'green' },
          { label: 'Facility Blocks', value: stats?.totalBlocks || '0', icon: Building2, color: 'orange' }
        ].map((m, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group hover:-translate-y-1 transition-transform">
            <CardContent className="p-6 flex items-center justify-between relative">
              <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-125 bg-", m.color)} />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{m.label}</p>
                <p className="text-3xl font-black text-slate-900">{m.value || 0}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-", m.color, "/10 text-", m.color)}>
                <m.icon className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl border w-fit">
          {['overview', 'tickets', 'analytics', 'budget'].map(t => (
            <TabsTrigger key={t} value={t} className="rounded-xl px-8 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle className="font-black text-slate-800 tracking-tight">Requests by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#FF8C00" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle className="font-black text-slate-800 tracking-tight">Priority Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-black text-slate-800 tracking-tight">Ticket Management & Funding Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center gap-4 pb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets?.filter(ticket => 
                      ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">#{ticket.ticketNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {ticket.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            ticket.priority === 'critical' ? 'bg-red-500 text-white' :
                            ticket.priority === 'high' ? 'bg-orange-500 text-white' :
                            ticket.priority === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-blue-500 text-white'
                          }>
                            {ticket.priority || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {ticket.currentStage?.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="w-3 h-3" />
                            {ticket.block} {ticket.room}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {safeFormatDate(ticket.createdAt, 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            {/* Funding Approval Button */}
                            {ticket.currentStage === 'operatorReview' && (
                              <div className="flex items-center justify-center gap-2">
                                {fundingApprovals[ticket.id] ? (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">Funding Approved</span>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      setFundingApprovals(prev => ({ ...prev, [ticket.id]: true }));
                                      
                                      await updateTicket(ticket.id, {
                                        currentStage: 'sourcingFunds',
                                        progressHistory: [{
                                          stage: 'sourcingFunds',
                                          timestamp: new Date(),
                                          updatedBy: { id: 'coordinator', name: 'Coordinator', role: 'coordinator' },
                                          notes: 'Funding approved by coordinator'
                                        }]
                                      });
                                    }}
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="w-4 h-4" />
                                    Approve Funding
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            {/* Check Inventory Button */}
                            {ticket.currentStage === 'sourcingFunds' && (
                              <div className="flex items-center justify-center gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={inventoryChecks[ticket.id] || false}
                                    onChange={(e) => handleInventoryCheck(ticket.id, e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label className="text-sm font-medium">Check Inventory</label>
                                </div>
                                {inventoryChecks[ticket.id] && (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">Materials Available</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Quick Status Badge */}
                            <Badge className={
                              ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                              ticket.status === 'inProgress' ? 'bg-amber-100 text-amber-700' :
                              ticket.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle className="font-black">Operational Velocity</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: 'Weekly Flow', v: stats?.ticketsThisWeek, p: '+12%', c: 'text-green-500' },
                { l: 'Monthly Volume', v: stats?.ticketsThisMonth, p: '+8%', c: 'text-green-500' },
                { l: 'Completion Rate', v: '85%', p: '+3%', c: 'text-green-500' }
              ].map((a, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{a.l}</p>
                  <p className="text-4xl font-black text-slate-900">{a.v || 0}</p>
                  <p className={cn("text-xs font-bold mt-2", a.c)}>{a.p} vs last period</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle className="font-black">Financial Integrity</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              {budget?.[0] && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Budget Capacity</p>
                      <p className="text-4xl font-black text-slate-900">P {budget[0].totalAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500">UTILIZATION RATE</p>
                      <p className="text-xl font-black text-primary">{Math.round((budget[0].allocatedAmount / budget[0].totalAmount) * 100)}%</p>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border p-0.5 shadow-inner">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(budget[0].allocatedAmount / budget[0].totalAmount) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated Funds</p><p className="text-2xl font-black">P {budget[0].allocatedAmount?.toLocaleString()}</p></div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Liquid Reserves</p><p className="text-2xl font-black text-primary">P {budget[0].remainingAmount?.toLocaleString()}</p></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper for dynamic colors and styles
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
