/**
 * BIUST Smart Maintenance System - System Information Component
 * 
 * Displays system information, version, and help resources.
 * Can be used in both public and private sides.
 */

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Info,
  Check,
  AlertCircle,
  Mail,
  Phone,
  ExternalLink,
  FileText,
  Shield,
  Clock,
} from 'lucide-react';

/**
 * Props for SystemInfo component
 */
interface SystemInfoProps {
  variant?: 'public' | 'private';  // Styling variant
  showContact?: boolean;            // Show contact information
  showVersion?: boolean;            // Show version info
}

/**
 * SystemInfo Component
 * 
 * Displays system status, version, and help information
 */
export default function SystemInfo({
  variant = 'public',
  showContact = true,
  showVersion = true,
}: SystemInfoProps) {
  const isDark = variant === 'private';
  
  /**
   * System statistics and information
   */
  const systemInfo = {
    version: '1.0.0',
    status: 'online',
    lastUpdated: 'March 28, 2026',
    uptime: '99.9%',
    totalUsers: '1,500+',
    totalTickets: '2,340',
  };
  
  /**
   * Feature list
   */
  const features = [
    'Two-sided architecture (Public & Private)',
    '9-stage progress timeline',
    'Role-based access control',
    'Real-time notifications',
    'Inventory management',
    'Finance dashboard (PIN-locked)',
    'Block & area management',
    'Analytics & reporting',
    'Mobile responsive design',
    'Audit logging',
  ];
  
  /**
   * Support channels
   */
  const supportChannels = [
    {
      icon: Mail,
      label: 'Email Support',
      value: 'support@biust.ac.bw',
      link: 'mailto:support@biust.ac.bw',
    },
    {
      icon: Mail,
      label: 'IT Support',
      value: 'it.support@biust.ac.bw',
      link: 'mailto:it.support@biust.ac.bw',
    },
    {
      icon: Phone,
      label: 'Help Desk',
      value: 'Campus Extension: 1234',
      link: null,
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* System Status Card */}
      {showVersion && (
        <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
              <Info className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">Online</Badge>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {systemInfo.uptime} uptime
                  </span>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Version
                  </p>
                </div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {systemInfo.version}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Last Updated
                  </p>
                </div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {systemInfo.lastUpdated}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    Total Users
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {systemInfo.totalUsers}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    Total Tickets
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {systemInfo.totalTickets}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Features Card */}
      <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : ''}>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  isDark ? 'bg-slate-700' : 'bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Contact Support Card */}
      {showContact && (
        <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : ''}>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportChannels.map((channel, index) => {
                const Icon = channel.icon;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isDark ? 'bg-slate-700' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-blue-600' : 'bg-blue-100'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isDark ? 'text-white' : 'text-blue-600'}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {channel.label}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {channel.value}
                        </p>
                      </div>
                    </div>
                    {channel.link && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className={isDark ? 'hover:bg-slate-600' : ''}
                      >
                        <a href={channel.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Security Notice */}
      <Card
        className={`border-2 ${
          isDark
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield
              className={`w-6 h-6 flex-shrink-0 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <div>
              <h3
                className={`font-semibold mb-2 ${
                  isDark ? 'text-blue-200' : 'text-blue-900'
                }`}
              >
                Security & Privacy
              </h3>
              <p
                className={`text-sm ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}
              >
                This system employs industry-standard security measures including JWT
                authentication, role-based access control, and encrypted data transmission.
                Your personal information is protected and only accessible by authorized
                personnel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Documentation Links */}
      <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : ''}>Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="outline"
              className={`w-full justify-between ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
              }`}
            >
              User Guide
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className={`w-full justify-between ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
              }`}
            >
              Quick Start Guide
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className={`w-full justify-between ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
              }`}
            >
              System Specification
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Copyright */}
      <div className="text-center">
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          © 2026 BIUST University. All rights reserved.
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
          Computerised Maintenance Management System (CMMS)
        </p>
      </div>
    </div>
  );
}
