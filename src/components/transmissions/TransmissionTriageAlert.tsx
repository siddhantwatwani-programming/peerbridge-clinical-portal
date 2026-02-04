import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TriageInfo {
  alertLevel: 'critical' | 'high' | 'moderate' | 'low';
  summary: string;
  symptomCorrelation?: string;
}

interface TransmissionTriageAlertProps {
  triage: TriageInfo;
  compact?: boolean;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'bg-destructive text-destructive-foreground',
    borderColor: 'border-destructive',
    label: 'Critical'
  },
  high: {
    icon: AlertCircle,
    color: 'bg-warning text-warning-foreground',
    borderColor: 'border-warning',
    label: 'High'
  },
  moderate: {
    icon: Info,
    color: 'bg-accent text-accent-foreground',
    borderColor: 'border-accent',
    label: 'Moderate'
  },
  low: {
    icon: CheckCircle,
    color: 'bg-success/10 text-success',
    borderColor: 'border-success/50',
    label: 'Low'
  }
};

export const TransmissionTriageAlert: React.FC<TransmissionTriageAlertProps> = ({
  triage,
  compact = false
}) => {
  const config = alertConfig[triage.alertLevel];
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn('gap-1 cursor-help', config.color)}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium mb-1">AI Clinical Summary</p>
            <p className="text-sm">{triage.summary}</p>
            {triage.symptomCorrelation && (
              <p className="text-xs text-muted-foreground mt-1">
                Correlation: {triage.symptomCorrelation}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('p-3 rounded-lg border', config.borderColor, 'bg-card')}>
      <div className="flex items-start gap-2">
        <Icon className={cn('h-4 w-4 mt-0.5', 
          triage.alertLevel === 'critical' ? 'text-destructive' :
          triage.alertLevel === 'high' ? 'text-warning' :
          triage.alertLevel === 'moderate' ? 'text-accent' : 'text-success'
        )} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn('text-xs', config.color)}>
              {config.label} Priority
            </Badge>
          </div>
          <p className="text-sm text-foreground">{triage.summary}</p>
          {triage.symptomCorrelation && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Symptom Correlation:</span> {triage.symptomCorrelation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
