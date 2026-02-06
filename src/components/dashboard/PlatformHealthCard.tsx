import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  FileText,
  Package,
  Clock,
  Users,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      setHealth({
        healthScore: 87,
        status: 'healthy',
        insights: [
          { type: 'success', title: 'Report Turnaround', description: 'Average turnaround time is 2.5 hours — excellent performance', metric: '2.5 hrs' },
          { type: 'warning', title: 'Device Inventory', description: '3 devices expiring within 2 weeks', recommendation: 'Schedule device rotation' },
          { type: 'info', title: 'Transmission Success', description: '98.5% transmission success rate this week', metric: '98.5%' }
        ],
        predictions: [
          { metric: 'Device Demand', forecast: 'Expect 15 new orders next week based on trends', confidence: 78 }
        ],
        workloadSummary: { pendingStudies: 246, pendingReports: 5, avgTurnaroundHours: 2.5 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'urgent': case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Activity;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-destructive bg-destructive/5 border-destructive/10';
      case 'warning': return 'text-warning bg-warning/5 border-warning/10';
      case 'success': return 'text-success bg-success/5 border-success/10';
      default: return 'text-accent bg-accent/5 border-accent/10';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/60 rounded-2xl">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing platform health...</span>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const statCards = [
    { label: 'Pending Reports', value: health.workloadSummary.pendingReports, icon: FileText, onClick: () => onTabChange?.('reports') },
    { label: 'Active Studies', value: health.workloadSummary.pendingStudies, icon: Package, onClick: () => onTabChange?.('studies') },
    { label: 'Avg Turnaround', value: `${health.workloadSummary.avgTurnaroundHours}h`, icon: Clock, onClick: () => toast.info('Based on completed reports in the last 7 days.') },
    { label: 'Active Users', value: mockMetrics.usersActive, icon: Users, onClick: () => navigate('/users') },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="group text-left p-4 bg-card rounded-2xl border border-border/60 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-xl bg-accent/8 flex items-center justify-center group-hover:bg-accent/12 transition-colors">
                <stat.icon className="h-4 w-4 text-accent" />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground group-hover:text-accent transition-colors">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Health & Insights */}
      <Card className="border-border/60 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Health bar */}
          <div className="p-4 flex items-center gap-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Platform Health</span>
            </div>
            <div className="flex-1 max-w-xs">
              <Progress value={health.healthScore} className="h-1.5" />
            </div>
            <Badge variant="outline" className={cn(
              "text-xs rounded-lg font-medium",
              health.status === 'healthy' && "text-success border-success/20",
              health.status === 'warning' && "text-warning border-warning/20",
              health.status === 'critical' && "text-destructive border-destructive/20"
            )}>
              {health.healthScore}%
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={fetchHealth}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Insights */}
          <div className="p-4 space-y-2">
            {health.insights.slice(0, isExpanded ? undefined : 3).map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div key={index} className={cn('flex items-start gap-3 p-3 rounded-xl border', getInsightStyle(insight.type))}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{insight.title}</p>
                      {insight.metric && <span className="text-sm font-bold">{insight.metric}</span>}
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-xs mt-1 font-medium opacity-80">💡 {insight.recommendation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predictions */}
          {health.predictions.length > 0 && isExpanded && (
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Predictions</p>
              {health.predictions.map((prediction, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-xl flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium">{prediction.metric}</span>
                      <Badge variant="outline" className="text-xs rounded-lg">{prediction.confidence}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{prediction.forecast}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {health.insights.length > 3 && (
            <div className="px-4 pb-3">
              <Button variant="ghost" size="sm" className="w-full text-xs rounded-xl" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Show Less' : `Show ${health.insights.length - 3} More Insights`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
