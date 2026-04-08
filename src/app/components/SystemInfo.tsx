/**
 * System Info
 *a comprehensive overview of the platform's status, features,
 * and support channels. Shared across public and private dashboards.
 * 
 * FEATURES: System Status, Versioning, Support, Security
 */

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Info, Check, Mail, Phone, Shield, Clock } from 'lucide-react';
import { cn } from './ui/utils';

interface SystemInfoProps {
  variant?: 'public' | 'private';
  showContact?: boolean;
  showVersion?: boolean;
}

export default function SystemInfo({ variant = 'public', showContact = true, showVersion = true }: SystemInfoProps) {
  const isDark = variant === 'private';
  
  const stats = [
    { label: 'Status', value: 'Online', icon: Check, color: 'text-green-500', detail: '99.9% uptime' },
    { label: 'Version', value: '1.0.0', icon: Clock, color: 'text-blue-500' },
    { label: 'Updated', value: 'April 2026', icon: Info, color: 'text-purple-500' },
  ];

  const features = [
    'Dual-side Architecture', '9-Stage Lifecycle', 'Granular RBAC',
    'Real-time Alerts', 'Inventory Control', 'PIN-locked Finance',
    'Asset Tracking', 'Live Analytics', 'Responsive UI', 'Audit Logs'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {showVersion && (
        <Card className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-bold"><Info className="w-5 h-5 text-primary" /> Platform Health</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map(s => (
                <div key={s.label} className={cn("p-4 rounded-xl border transition-all hover:shadow-md", isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100')}>
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black">{s.value}</span>
                    {s.detail && <span className="text-[10px] opacity-60 font-bold">{s.detail}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
          <CardHeader><CardTitle className="font-bold">Core Capabilities</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {features.map(f => (
              <div key={f} className={cn("flex items-center gap-2 p-2.5 rounded-lg text-[11px] font-bold border transition-colors hover:bg-primary/5", isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100')}>
                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
              </div>
            ))}
          </CardContent>
        </Card>

        {showContact && (
          <Card className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
            <CardHeader><CardTitle className="font-bold">Direct Support</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Maintenance Hub', value: 'BSMsupport@biust.ac.bw', icon: Mail },
                { label: 'Campus Help Desk', value: 'Extension: 1234', icon: Phone }
              ].map(c => (
                <div key={c.label} className={cn("flex items-center justify-between p-3.5 rounded-xl border", isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100')}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner"><c.icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">{c.label}</p>
                      <p className="text-sm font-bold tracking-tight">{c.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="p-6 flex gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm"><Shield className="w-7 h-7 text-primary" /></div>
          <div>
            <h3 className="font-black text-slate-900 leading-tight mb-1">Secure & Private</h3>
            {/*<p className="text-sm text-slate-600 leading-relaxed font-medium">*/}
            {/*  Every maintenance request is encrypted with enterprise-grade JWT protocols. */}
            {/*  Our role-based access ensures your data is only seen by those who need it.*/}
            {/*</p>*/}
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-8 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          © 2026 BIUST, All rights reserved.
        </p>
      </div>
    </div>
  );
}
