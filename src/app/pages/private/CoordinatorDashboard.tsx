/**
 * BIUST Smart Maintenance System - Coordinator Dashboard
 * 
 * High-level oversight for campus maintenance coordinators.
 * Integrates real-time analytics, budget tracking, and resource management.
 * 
 * FEATURES: Analytics, Budget Control, Performance, Asset Overview
 */
//check

import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Users, DollarSign, Download, Building2 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const COLORS = ['#FF8C00', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CoordinatorDashboard() {
  const { dashboardAnalytics: stats, budget, fetchTickets, fetchInventory, fetchPublicBlocks, fetchBudget, fetchAnalytics } = useDataStore();
  
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
          { label: 'Budget Utilization', value: `${budget?.totalAmount ? Math.round((budget.allocatedAmount / budget.totalAmount) * 100) : 0}%`, icon: DollarSign, color: 'green' },
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
          {['overview', 'analytics', 'budget'].map(t => (
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
              {budget && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Budget Capacity</p>
                      <p className="text-4xl font-black text-slate-900">P {budget.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500">UTILIZATION RATE</p>
                      <p className="text-xl font-black text-primary">{Math.round((budget.allocatedAmount / budget.totalAmount) * 100)}%</p>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden border p-0.5 shadow-inner">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(budget.allocatedAmount / budget.totalAmount) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated Funds</p><p className="text-2xl font-black">P {budget.allocatedAmount?.toLocaleString()}</p></div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Liquid Reserves</p><p className="text-2xl font-black text-primary">P {budget.remainingAmount?.toLocaleString()}</p></div>
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
