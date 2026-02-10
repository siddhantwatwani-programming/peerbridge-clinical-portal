import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface Insight {
  icon: 'trend' | 'alert' | 'success';
  text: string;
}

interface AIInsightsCardProps {
  context: string;
  insights: Insight[];
}

const iconMap = {
  trend: TrendingUp,
  alert: AlertTriangle,
  success: CheckCircle,
};

const iconColorMap = {
  trend: 'text-accent',
  alert: 'text-amber-500',
  success: 'text-emerald-500',
};

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ context, insights }) => {
  return (
    <div className="bg-gradient-to-br from-accent/[0.04] via-card to-accent/[0.02] rounded-2xl border border-accent/15 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-display font-semibold text-foreground">AI Insights</h3>
          <p className="text-[11px] text-muted-foreground/70">{context}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.icon];
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-card/80 border border-border/30 hover:border-accent/20 transition-colors"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColorMap[insight.icon]}`} />
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
