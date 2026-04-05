/**
 * BIUST Smart Maintenance System - Progress Timeline Component
 * 
 * Visual representation of ticket progress through 9 stages.
 * Shows completed, current, and pending stages with timestamps and notes.
 */

import { Check, Circle, Clock } from 'lucide-react';
import { ProgressStage, ProgressHistoryEntry } from '../../types';
import { format } from 'date-fns';

/**
 * Progress stage definitions with labels and descriptions
 */
const PROGRESS_STAGES: Array<{
  stage: ProgressStage;
  label: string;
  description: string;
}> = [
  {
    stage: 'report_submitted',
    label: 'Report Submitted',
    description: 'Initial report filed',
  },
  {
    stage: 'operator_review',
    label: 'Operator Review',
    description: 'Under review by operations team',
  },
  {
    stage: 'sourcing_funds',
    label: 'Sourcing Funds',
    description: 'Budget allocation in progress',
  },
  {
    stage: 'sourcing_materials',
    label: 'Sourcing Materials',
    description: 'Ordering required materials',
  },
  {
    stage: 'technician_assigned',
    label: 'Technician Assigned',
    description: 'Assigned to maintenance technician',
  },
  {
    stage: 'scheduled_visit',
    label: 'Scheduled Visit',
    description: 'Visit appointment scheduled',
  },
  {
    stage: 'work_in_progress',
    label: 'Work In Progress',
    description: 'Repair work underway',
  },
  {
    stage: 'completed',
    label: 'Completed',
    description: 'Work completed by technician',
  },
  {
    stage: 'closed',
    label: 'Closed',
    description: 'Ticket verified and closed',
  },
];

/**
 * Props for ProgressTimeline component
 */
interface ProgressTimelineProps {
  currentStage: ProgressStage;
  progressHistory: ProgressHistoryEntry[];
  variant?: 'horizontal' | 'vertical';  // Layout orientation
  showNotes?: boolean;                   // Show stage notes
}

/**
 * ProgressTimeline Component
 * 
 * Displays the 9-stage progress timeline for a maintenance ticket.
 * 
 * Visual indicators:
 * - Completed stages: Green with checkmark
 * - Current stage: Blue with pulse animation
 * - Pending stages: Gray with circle
 */
export default function ProgressTimeline({
  currentStage,
  progressHistory,
  variant = 'horizontal',
  showNotes = true,
}: ProgressTimelineProps) {
  /**
   * Get the index of the current stage
   */
  const currentStageIndex = PROGRESS_STAGES.findIndex(
    (s) => s.stage === currentStage
  );
  
  /**
   * Check if a stage is completed
   */
  const isStageCompleted = (stage: ProgressStage): boolean => {
    return progressHistory.some((h) => h.stage === stage);
  };
  
  /**
   * Get history entry for a specific stage
   */
  const getStageHistory = (stage: ProgressStage): ProgressHistoryEntry | undefined => {
    return progressHistory.find((h) => h.stage === stage);
  };
  
  /**
   * Get status for a stage (completed, current, pending)
   */
  const getStageStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'pending';
  };
  
  /**
   * Render horizontal timeline (default)
   */
  if (variant === 'horizontal') {
    return (
      <div className="w-full">
        {/* Timeline bar */}
        <div className="flex items-center justify-between relative mb-8">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200" />
          
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (PROGRESS_STAGES.length - 1)) * 100}%`,
            }}
          />
          
          {/* Stage indicators */}
          {PROGRESS_STAGES.map((stageInfo, index) => {
            const status = getStageStatus(index);
            const history = getStageHistory(stageInfo.stage);
            
            return (
              <div
                key={stageInfo.stage}
                className="relative flex flex-col items-center z-10"
                style={{ flex: 1 }}
              >
                {/* Stage icon */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-4
                    transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-100'
                        : status === 'current'
                        ? 'bg-blue-600 border-blue-100 animate-pulse'
                        : 'bg-white border-slate-300'
                    }
                  `}
                >
                  {status === 'completed' && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                  {status === 'current' && (
                    <Clock className="w-5 h-5 text-white" />
                  )}
                  {status === 'pending' && (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                
                {/* Stage label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={`text-xs font-medium ${
                      status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {stageInfo.label}
                  </p>
                  
                  {/* Timestamp for completed stages */}
                  {history && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {format(new Date(history.timestamp), 'MMM d, HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current stage details */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Current Stage: {PROGRESS_STAGES[currentStageIndex].label}
              </h4>
              <p className="text-sm text-blue-800">
                {PROGRESS_STAGES[currentStageIndex].description}
              </p>
              
              {/* Show notes if available */}
              {showNotes && getStageHistory(currentStage)?.notes && (
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-slate-700">
                    {getStageHistory(currentStage)?.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* History of completed stages */}
        {showNotes && progressHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 mb-3">Progress History</h4>
            <div className="space-y-2">
              {progressHistory
                .slice()
                .reverse()
                .map((entry, index) => {
                  const stageInfo = PROGRESS_STAGES.find(
                    (s) => s.stage === entry.stage
                  );
                  
                  return (
                    <div
                      key={`${entry.stage}-${index}`}
                      className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-slate-900">
                            {stageInfo?.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-slate-600">{entry.notes}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Updated by: {entry.updatedBy.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  /**
   * Render vertical timeline
   */
  return (
    <div className="w-full">
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200" />
        
        {/* Progress line */}
        <div
          className="absolute left-2.5 top-0 w-0.5 bg-blue-600 transition-all duration-500"
          style={{
            height: `${(currentStageIndex / (PROGRESS_STAGES.length - 1)) * 100}%`,
          }}
        />
        
        {/* Stage items */}
        <div className="space-y-6">
          {PROGRESS_STAGES.map((stageInfo, index) => {
            const status = getStageStatus(index);
            const history = getStageHistory(stageInfo.stage);
            
            return (
              <div key={stageInfo.stage} className="relative">
                {/* Stage indicator */}
                <div
                  className={`
                    absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-100'
                        : status === 'current'
                        ? 'bg-blue-600 border-blue-100'
                        : 'bg-white border-slate-300'
                    }
                  `}
                >
                  {status === 'completed' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                  {status === 'current' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Stage content */}
                <div
                  className={`
                    p-3 rounded-lg
                    ${
                      status === 'current'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-slate-50 border border-slate-200'
                    }
                  `}
                >
                  <p
                    className={`font-medium text-sm ${
                      status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {stageInfo.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {stageInfo.description}
                  </p>
                  
                  {history && (
                    <>
                      <p className="text-xs text-slate-500 mt-2">
                        {format(new Date(history.timestamp), 'MMMM d, yyyy • HH:mm')}
                      </p>
                      {history.notes && showNotes && (
                        <p className="text-xs text-slate-700 mt-2 p-2 bg-white rounded">
                          {history.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
