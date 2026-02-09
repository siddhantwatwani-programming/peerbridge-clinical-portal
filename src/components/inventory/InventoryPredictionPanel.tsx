import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Clock, Package, RefreshCw, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Device {
  id: string;
  useByDate: string;
  serviceTag: string;
  firstName: string;
  lastName: string;
  sku: string;
  status: 'Retired' | 'Assigned' | 'Unavailable';
  productName: string;
}

interface PredictionData {
  demandForecast: {
    next30Days: number;
    targetDate: string;
    confidence: number;
    reasoning: string;
  };
  expiringDevices: Array<{
    serviceTag: string;
    useByDate: string;
    daysUntilExpiry: number;
    recommendation: string;
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    metric: string;
  }>;
  utilization: {
    totalDevices: number;
    assigned: number;
    available: number;
    retired: number;
    unavailable: number;
    utilizationRate: number;
  };
  recommendations: string[];
}

interface InventoryPredictionPanelProps {
  devices: Device[];
}

const InventoryPredictionPanel: React.FC<InventoryPredictionPanelProps> = ({ devices }) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-prediction', {
        body: {
          devices,
          currentDate: new Date().toISOString().split('T')[0],
        },
      });

      if (error) throw error;
      setPrediction(data);
      setExpanded(true);
    } catch (err: any) {
      console.error('Prediction error:', err);
      toast.error(err?.message || 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  };

  const severityStyles = {
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    info: 'bg-primary/10 text-primary border-primary/30',
  };

  const severityIcons = {
    critical: <AlertTriangle className="h-4 w-4" />,
    warning: <Clock className="h-4 w-4" />,
    info: <TrendingUp className="h-4 w-4" />,
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">AI Inventory Prediction Engine</h3>
            <p className="text-xs text-muted-foreground">30-day demand forecast & expiration alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runPrediction}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : prediction ? 'Refresh' : 'Run Prediction'}
          </Button>
          {prediction && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!prediction && !loading && (
        <div className="p-6 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Click "Run Prediction" to analyze your inventory and forecast demand.</p>
        </div>
      )}

      {loading && (
        <div className="p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Analyzing inventory patterns...</span>
          </div>
          <div className="w-48 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {prediction && expanded && (
        <div className="p-4 space-y-4">
          {/* Alerts */}
          {prediction.alerts && prediction.alerts.length > 0 && (
            <div className="space-y-2">
              {prediction.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${severityStyles[alert.severity]}`}
                >
                  {severityIcons[alert.severity]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.metric && (
                      <p className="text-xs opacity-75 mt-0.5">{alert.metric}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Demand Forecast Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase">30-Day Demand</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                +{prediction.demandForecast.next30Days}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                devices needed by {prediction.demandForecast.targetDate}
              </p>
              <Badge variant="secondary" className="mt-2 text-xs">
                {prediction.demandForecast.confidence}% confidence
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Utilization</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {prediction.utilization.utilizationRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {prediction.utilization.assigned} assigned / {prediction.utilization.totalDevices} total
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Expiring Soon</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {prediction.expiringDevices?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">devices within 30 days</p>
            </div>
          </div>

          {/* Forecast Reasoning */}
          {prediction.demandForecast.reasoning && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Forecast Reasoning</p>
              <p className="text-sm text-foreground">{prediction.demandForecast.reasoning}</p>
            </div>
          )}

          {/* Expiring Devices Table */}
          {prediction.expiringDevices && prediction.expiringDevices.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Devices Nearing Expiration — Prioritize for Assignment
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">SERVICE TAG</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">USE BY DATE</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">DAYS LEFT</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">RECOMMENDATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.expiringDevices.map((device, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-3 font-medium text-primary">{device.serviceTag}</td>
                        <td className="p-3 text-foreground">{device.useByDate}</td>
                        <td className="p-3">
                          <Badge
                            variant={device.daysUntilExpiry <= 7 ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {device.daysUntilExpiry} days
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{device.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Recommendations</h4>
              <ul className="space-y-1.5">
                {prediction.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryPredictionPanel;
