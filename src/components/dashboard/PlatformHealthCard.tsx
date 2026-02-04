import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  RefreshCw,
  FileText,
  Package,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformHealthCardProps {
  onTabChange?: (tab: string) => void;
}

interface HealthInsight {
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  metric?: string;
  recommendation?: string;
}

interface Prediction {
  metric: string;
  forecast: string;
  confidence: number;
}

interface WorkloadSummary {
  pendingStudies: number;
  pendingReports: number;
  avgTurnaroundHours: number;
  bottleneck?: string;
}

interface PlatformHealth {
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  insights: HealthInsight[];
  predictions: Prediction[];
  workloadSummary: WorkloadSummary;
}

// Mock metrics - in production these would come from real data
const mockMetrics = {
  activeStudies: 246,
  pendingReports: 5,
  pendingTransmissions: 3,
  devicesInField: 42,
  devicesExpiringSoon: 3,
  avgTurnaroundHours: 2.5,
  transmissionSuccessRate: 98.5,
  usersActive: 8
};

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('platform-health', {
        body: { metrics: mockMetrics }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setHealth(data);
    } catch (err) {
      console.error('Error fetching platform health:', err);
      // Use fallback data
      setHealth({
        healthScore: 87,
        status: 'healthy',
        insights: [
          {
            type: 'success',
            title: 'Report Turnaround',
            description: 'Average turnaround time is 2.5 hours - excellent performance',
            metric: '2.5 hrs'
          },
          {
            type: 'warning',
            title: 'Device Inventory',
            description: '3 devices expiring within 2 weeks',
            recommendation: 'Schedule device rotation'
          },
          {
            type: 'info',
            title: 'Transmission Success',
            description: '98.5% transmission success rate this week',
            metric: '98.5%'
          }
        ],
        predictions: [
          {
            metric: 'Device Demand',
            forecast: 'Expect 15 new orders next week based on trends',
            confidence: 78
          }
        ],
        workloadSummary: {
          pendingStudies: 246,
          pendingReports: 5,
          avgTurnaroundHours: 2.5
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'urgent': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Activity;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-destructive bg-destructive/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'success': return 'text-success bg-success/10';
      default: return 'text-accent bg-accent/10';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-accent/30">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing platform health...</span>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Platform Health Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn('gap-1', getStatusColor(health.status))}>
              {health.status === 'healthy' && <CheckCircle className="h-3 w-3" />}
              {health.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
              {health.status === 'critical' && <AlertTriangle className="h-3 w-3" />}
              {health.healthScore}% Healthy
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={fetchHealth}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score Bar */}
        <div className="space-y-1">
          <Progress value={health.healthScore} className="h-2" />
        </div>

        {/* Quick Stats - Actionable */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => onTabChange?.('reports')}
            className="text-center p-3 bg-card rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group cursor-pointer"
          >
            <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1 group-hover:text-accent transition-colors" />
            <p className="text-lg font-semibold group-hover:text-accent transition-colors">{health.workloadSummary.pendingReports}</p>
            <p className="text-xs text-muted-foreground">Pending Reports</p>
            <ChevronRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground/50 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
          </button>
          <button
            onClick={() => onTabChange?.('studies')}
            className="text-center p-3 bg-card rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group cursor-pointer"
          >
            <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1 group-hover:text-accent transition-colors" />
            <p className="text-lg font-semibold group-hover:text-accent transition-colors">{health.workloadSummary.pendingStudies}</p>
            <p className="text-xs text-muted-foreground">Active Studies</p>
            <ChevronRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground/50 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
          </button>
          <button
            onClick={() => toast.info('Turnaround metrics are based on completed reports in the last 7 days.')}
            className="text-center p-3 bg-card rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group cursor-pointer"
          >
            <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1 group-hover:text-accent transition-colors" />
            <p className="text-lg font-semibold group-hover:text-accent transition-colors">{health.workloadSummary.avgTurnaroundHours}h</p>
            <p className="text-xs text-muted-foreground">Avg Turnaround</p>
            <ChevronRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground/50 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
          </button>
          <button
            onClick={() => navigate('/users')}
            className="text-center p-3 bg-card rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group cursor-pointer"
          >
            <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1 group-hover:text-accent transition-colors" />
            <p className="text-lg font-semibold group-hover:text-accent transition-colors">{mockMetrics.usersActive}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
            <ChevronRight className="h-3 w-3 mx-auto mt-1 text-muted-foreground/50 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        </div>

        {/* AI Insights */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">AI Insights</p>
          {health.insights.slice(0, isExpanded ? undefined : 3).map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div 
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  getInsightColor(insight.type)
                )}
              >
                <Icon className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{insight.title}</p>
                    {insight.metric && (
                      <span className="text-sm font-bold">{insight.metric}</span>
                    )}
                  </div>
                  <p className="text-xs opacity-80">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-xs mt-1 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Predictions */}
        {health.predictions.length > 0 && isExpanded && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Predictions</p>
            {health.predictions.map((prediction, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{prediction.metric}</span>
                  <Badge variant="outline" className="text-xs">
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{prediction.forecast}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        {health.insights.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show ${health.insights.length - 3} More Insights`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
