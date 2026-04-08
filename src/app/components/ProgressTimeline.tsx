/**
 * BIUST Smart Maintenance System - Progress Timeline
 * 
 * A visual tracker for the 9-stage maintenance lifecycle.
 * Maps historical data to a clean, interactive UI.
 * 
 * SEARCHABLE FEATURES: Progress Tracking, Lifecycle, Milestones, PPCF Stages
 */

import { Check, Circle, Clock } from 'lucide-react';
import { ProgressStage, ProgressHistoryEntry } from '../../types';
import { format } from 'date-fns';
import { cn } from './ui/utils';

const STAGES: Array<{ stage: ProgressStage; label: string; desc: string }> = [
  { stage: 'report_submitted', label: 'Submitted', desc: 'Initial report filed' },
  { stage: 'operator_review', label: 'Review', desc: 'Under review by ops' },
  { stage: 'sourcing_funds', label: 'Funding', desc: 'Budget allocation' },
  { stage: 'sourcing_materials', label: 'Procurement', desc: 'Ordering materials' },
  { stage: 'technician_assigned', label: 'Assigned', desc: 'Technician assigned' },
  { stage: 'scheduled_visit', label: 'Scheduled', desc: 'Visit appointment set' },
  { stage: 'work_in_progress', label: 'In Progress', desc: 'Repair work underway' },
  { stage: 'completed', label: 'Completed', desc: 'Work finished' },
  { stage: 'closed', label: 'Closed', desc: 'Verified and closed' },
];

interface TimelineProps {
  currentStage: ProgressStage;
  progressHistory: ProgressHistoryEntry[];
  variant?: 'horizontal' | 'vertical';
  showNotes?: boolean;
}

export default function ProgressTimeline({ currentStage, progressHistory, variant = 'horizontal', showNotes = true }: TimelineProps) {
  const currentIndex = STAGES.findIndex(s => s.stage === currentStage);
  const getHistory = (stage: ProgressStage) => progressHistory.find(h => h.stage === stage);
  const getStatus = (idx: number) => idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'pending';

  const renderIcon = (status: string) => {
    if (status === 'completed') return <Check className="w-5 h-5 text-white" />;
    if (status === 'current') return <Clock className="w-5 h-5 text-white" />;
    return <Circle className="w-4 h-4 text-slate-400" />;
  };

  if (variant === 'horizontal') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between relative mb-8 px-4">
          <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />
          <div className="absolute top-5 left-0 h-1 bg-primary transition-all duration-700 rounded-full" style={{ width: `${(currentIndex / 8) * 100}%` }} />
          
          {STAGES.map((s, i) => {
            const status = getStatus(i);
            const history = getHistory(s.stage);
            return (
              <div key={s.stage} className="relative flex flex-col items-center z-10 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all shadow-sm",
                  status === 'completed' ? "bg-green-500 border-green-100" : status === 'current' ? "bg-primary border-primary/20 animate-pulse" : "bg-white border-slate-200"
                )}>
                  {renderIcon(status)}
                </div>
                <div className="mt-3 text-center">
                  <p className={cn("text-[10px] font-bold uppercase tracking-tighter", status === 'pending' ? "text-slate-400" : "text-slate-900")}>{s.label}</p>
                  {history?.timestamp && <p className="text-[9px] text-slate-500 font-medium">{format(new Date(history.timestamp), 'MMM d')}</p>}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0"><Clock className="w-5 h-5" /></div>
          <div>
            <h4 className="font-bold text-slate-900 leading-tight">Current: {STAGES[currentIndex]?.label}</h4>
            <p className="text-sm text-slate-600">{STAGES[currentIndex]?.desc}</p>
            {showNotes && getHistory(currentStage)?.notes && (
              <div className="mt-2 p-3 bg-white/80 rounded-lg border text-sm text-slate-700 italic">"{getHistory(currentStage)?.notes}"</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-10 space-y-6">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-700" style={{ height: `${(currentIndex / 8) * 100}%` }} />
      {STAGES.map((s, i) => {
        const status = getStatus(i);
        const history = getHistory(s.stage);
        return (
          <div key={s.stage} className="relative">
            <div className={cn(
              "absolute -left-8.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 shadow-sm",
              status === 'completed' ? "bg-green-500 border-green-100" : status === 'current' ? "bg-primary border-primary/20" : "bg-white border-slate-200"
            )}>
              {status === 'completed' ? <Check className="w-3 h-3 text-white" /> : status === 'current' ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : null}
            </div>
            <div className={cn("p-4 rounded-xl border transition-all", status === 'current' ? "bg-white border-primary shadow-sm ring-1 ring-primary/5" : "bg-slate-50/50 border-slate-100")}>
              <p className={cn("text-sm font-bold", status === 'pending' ? "text-slate-400" : "text-slate-900")}>{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              {history?.timestamp && <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{format(new Date(history.timestamp), 'MMMM d, HH:mm')}</p>}
              {showNotes && history?.notes && <p className="text-xs text-slate-600 mt-2 p-2.5 bg-white rounded-lg border border-slate-100 italic">"{history.notes}"</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
