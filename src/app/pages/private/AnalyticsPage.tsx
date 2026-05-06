/**
 * BIUST Smart Maintenance System - Analytics Page
 * 
 * Comprehensive analytics dashboard for operators and coordinators.
 * Features maintenance metrics, performance tracking, trend analysis, and reporting.
 * 
 * FEATURES: Analytics Dashboard, Performance Metrics, Trend Analysis, Reporting
 */

import { useState, useEffect, useMemo } from 'react';
import { usePrivateAuthStore } from '../../store/privateAuthStore';
import { useDataStore } from '../../store/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Clock, CheckCircle2, AlertCircle,
  DollarSign, Calendar, Download, Filter, BarChart3, PieChart as PieChartIcon,
  Activity, Target, Zap, FileText
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { User as UserType } from '../../types';

export default function AnalyticsPage() {
  const { user } = usePrivateAuthStore();
  const { tickets, users, blocks, fetchTickets, fetchUsers, fetchBlocks } = useDataStore();
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTickets(), fetchUsers(), fetchBlocks()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchUsers, fetchBlocks]);

  // Filter tickets based on time range
  const filteredTickets = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return tickets.filter(ticket => 
      new Date(ticket.createdAt) >= startDate
    );
  }, [tickets, timeRange]);

  // Daily trend data
  const dailyTrend = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTickets = filteredTickets.filter(t => 
        format(new Date(t.createdAt), 'yyyy-MM-dd') === dateStr
      );
      
      trend.push({
        date: format(date, 'MMM d'),
        total: dayTickets.length,
        completed: dayTickets.filter(t => t.status === 'completed').length,
        open: dayTickets.filter(t => t.status === 'open').length
      });
    }
    
    return trend;
  }, [filteredTickets, timeRange]);
  
  // Performance by technician
  const technicianPerformance = useMemo(() => {
    const performance = users
      .filter(u => u.role === 'technician')
      .map(technician => {
        const techTickets = filteredTickets.filter(t => t.assignedTo?.id === technician.id);
        const completed = techTickets.filter(t => t.status === 'completed').length;
        const avgTime = completed > 0
          ? techTickets
              .filter(t => t.status === 'completed')
              .reduce((sum, ticket) => {
                const created = new Date(ticket.createdAt);
                const resolved = ticket.updatedAt ? new Date(ticket.updatedAt) : new Date();
                const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
                return sum + hours;
              }, 0) / completed
          : 0;
        
        return {
          name: technician.name,
          total: techTickets.length,
          completed,
          avgTime: Math.round(avgTime * 10) / 10,
          efficiency: completed > 0 ? (completed / techTickets.length) * 100 : 0
        };
      });
      
      return performance;
    }, [filteredTickets, users]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalTickets = filteredTickets.length;
    const openTickets = filteredTickets.filter(t => t.status === 'open').length;
    const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress').length;
    const completedTickets = filteredTickets.filter(t => t.status === 'completed').length;
    const closedTickets = filteredTickets.filter(t => t.status === 'closed').length;
    
    // Priority breakdown
    const priorityBreakdown = filteredTickets.reduce((acc, ticket) => {
      const priority = ticket.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Category breakdown
    const categoryBreakdown = filteredTickets.reduce((acc, ticket) => {
      const category = ticket.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Resolution time calculation
    const resolvedTickets = filteredTickets.filter(t => 
      t.status === 'completed' || t.status === 'closed'
    );
    const avgResolutionTime = resolvedTickets.length > 0 
      ? resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt);
          const resolved = ticket.updatedAt ? new Date(ticket.updatedAt) : new Date();
          const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / resolvedTickets.length
      : 0;
    
    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets,
      closedTickets,
      priorityBreakdown,
      categoryBreakdown,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      dailyTrend,
      technicianPerformance
    };
  }, [filteredTickets, dailyTrend, technicianPerformance]);

  // Chart data preparation
  const priorityChartData = Object.entries(analytics.priorityBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const categoryChartData = Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Export analytics
  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalTickets: analytics.totalTickets,
        completedTickets: analytics.completedTickets,
        avgResolutionTime: analytics.avgResolutionTime,
        completionRate: analytics.totalTickets > 0 ? Math.round((analytics.completedTickets / analytics.totalTickets) * 100) : 0
      },
      breakdown: {
        byPriority: analytics.priorityBreakdown,
        byCategory: analytics.categoryBreakdown
      },
      technicianPerformance: analytics.technicianPerformance
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Maintenance performance metrics and insights
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-foreground">{analytics.totalTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completedTickets} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {analytics.totalTickets > 0 ? Math.round((analytics.completedTickets / analytics.totalTickets) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completedTickets} of {analytics.totalTickets}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Resolution</p>
                <p className="text-3xl font-bold text-foreground">
                  {Math.round(analytics.avgResolutionTime)}h
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completedTickets} resolved
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tickets</p>
                <p className="text-3xl font-bold text-foreground">{analytics.openTickets + analytics.inProgressTickets}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.openTickets} open, {analytics.inProgressTickets} in progress
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="open" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`priority-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Technician Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.technicianPerformance.slice(0, 5).map((tech, index) => (
                <div key={tech.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tech.completed} of {tech.total} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tech.efficiency}%</p>
                    <Progress value={tech.efficiency} className="w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Detailed Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Status Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Open</span>
                  <Badge variant="outline">{analytics.openTickets}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <Badge variant="outline">{analytics.inProgressTickets}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge variant="outline">{analytics.completedTickets}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Closed</span>
                  <Badge variant="outline">{analytics.closedTickets}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Avg Resolution Time</span>
                  <span className="text-sm font-medium">{Math.round(analytics.avgResolutionTime)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {analytics.totalTickets > 0 ? Math.round((analytics.completedTickets / analytics.totalTickets) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Tickets</span>
                  <span className="text-sm font-medium">{analytics.openTickets + analytics.inProgressTickets}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">System Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="text-sm font-medium">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Blocks</span>
                  <span className="text-sm font-medium">{blocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Technicians</span>
                  <span className="text-sm font-medium">
                    {users.filter(u => u.role === 'technician').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
