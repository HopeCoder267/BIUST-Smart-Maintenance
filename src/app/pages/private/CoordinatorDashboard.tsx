/**
 * BIUST Smart Maintenance System - Coordinator Dashboard
 * 
 * Full system access for coordinators including analytics and management
 */

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

export default function CoordinatorDashboard() {
  const { dashboardAnalytics, budget } = useDataStore();
  
  // Prepare chart data
  const categoryData = dashboardAnalytics?.ticketsByCategory 
    ? Object.entries(dashboardAnalytics.ticketsByCategory).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];
  
  const priorityData = dashboardAnalytics?.ticketsByPriority
    ? Object.entries(dashboardAnalytics.ticketsByPriority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];
  
  const COLORS = ['#FF8C00', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Full system overview and management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Calendar className="w-4 h-4" />
            Schedule Maintenance
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-foreground">{dashboardAnalytics?.totalTickets || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolution Time</p>
                <p className="text-3xl font-bold text-foreground">{dashboardAnalytics?.averageResolutionTime || 0}h</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Budget Used</p>
                <p className="text-3xl font-bold text-foreground">
                  {budget && budget.totalAmount > 0 ? Math.round((budget.allocatedAmount / budget.totalAmount) * 100) : 0}%
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
                <p className="text-sm text-muted-foreground mb-1">Active Blocks</p>
                <p className="text-3xl font-bold text-foreground">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-primary data-[state=active]:text-white">Budget</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tickets by Category */}
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
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
                    <Bar dataKey="value" fill="#FF8C00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Tickets by Priority */}
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Tickets by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg border border-border text-foreground">
                  <p className="text-muted-foreground text-sm mb-2">This Week</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardAnalytics?.ticketsThisWeek || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last week</p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border text-foreground">
                  <p className="text-muted-foreground text-sm mb-2">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardAnalytics?.ticketsThisMonth || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border text-foreground">
                  <p className="text-muted-foreground text-sm mb-2">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-green-600 mt-1">+3% improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budget" className="space-y-4">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budget && (
                  <>
                    <div>
                      <div className="flex justify-between mb-2 text-foreground">
                        <span className="text-muted-foreground">Total Budget</span>
                        <span className="text-foreground font-semibold">
                          P {budget.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(budget.allocatedAmount / budget.totalAmount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 text-foreground">
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <p className="text-muted-foreground text-sm mb-1">Allocated</p>
                        <p className="text-xl font-bold text-foreground">
                          P {budget.allocatedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <p className="text-muted-foreground text-sm mb-1">Remaining</p>
                        <p className="text-xl font-bold text-foreground">
                          P {budget.remainingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
