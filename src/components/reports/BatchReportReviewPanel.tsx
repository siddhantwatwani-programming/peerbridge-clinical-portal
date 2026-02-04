import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, AlertCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReportAnalysis {
  id: string;
  quickSummary: string;
  category: 'normal' | 'abnormal-minor' | 'abnormal-major' | 'requires-attention';
  batchEligible: boolean;
  flagReason?: string;
}

interface BatchGroup {
  category: string;
  count: number;
  description: string;
}

interface BatchReportReviewPanelProps {
  reports: ReportAnalysis[];
  batchGroups: BatchGroup[];
  onBatchSignOff: (category: string) => void;
  onViewReport: (reportId: string) => void;
}

const categoryConfig = {
  'normal': {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Normal'
  },
  'abnormal-minor': {
    icon: AlertCircle,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    label: 'Minor Abnormality'
  },
  'abnormal-major': {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Major Abnormality'
  },
  'requires-attention': {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Needs Review'
  }
};

export const BatchReportReviewPanel: React.FC<BatchReportReviewPanelProps> = ({
  reports,
  batchGroups,
  onBatchSignOff,
  onViewReport
}) => {
  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          AI Batch Review Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Groups */}
        {batchGroups.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
            {batchGroups.map((group, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{group.count} {group.category} reports</p>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                {group.category.toLowerCase() === 'normal' && (
                  <Button 
                    variant="accent" 
                    size="sm"
                    onClick={() => onBatchSignOff(group.category)}
                  >
                    Batch Sign-Off
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Individual Report Summaries */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Report Summaries</p>
          {reports.map((report) => {
            const config = categoryConfig[report.category];
            const Icon = config.icon;
            
            return (
              <div 
                key={report.id}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  report.category === 'requires-attention' 
                    ? 'border-destructive/50 bg-destructive/5' 
                    : 'border-border bg-card hover:bg-muted/20'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <Badge className={cn('text-xs', config.bgColor, config.color)}>
                        {config.label}
                      </Badge>
                      {report.batchEligible && (
                        <Badge variant="outline" className="text-xs">
                          Batch Eligible
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{report.quickSummary}</p>
                    {report.flagReason && (
                      <p className="text-xs text-destructive mt-1">
                        ⚠️ {report.flagReason}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewReport(report.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
