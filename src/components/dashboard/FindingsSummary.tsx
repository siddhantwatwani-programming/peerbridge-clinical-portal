import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Finding {
  id: string;
  label: string;
  status: 'normal' | 'detected' | 'attention';
  icon: React.ElementType;
  details?: string;
}

const findings: Finding[] = [
  { id: 'nsr', label: 'Normal Sinus Rhythm', status: 'normal', icon: Heart, details: '85% of recording' },
  { id: 'tachy', label: 'Tachycardia Detected', status: 'detected', icon: TrendingUp, details: '12 episodes, max HR 142 bpm' },
  { id: 'brady', label: 'Bradycardia', status: 'normal', icon: Activity, details: 'None detected' },
  { id: 'afib', label: 'Atrial Fibrillation', status: 'normal', icon: Zap, details: 'None detected' },
  { id: 'pvc', label: 'PVCs', status: 'attention', icon: AlertTriangle, details: '234 PVCs (1.2% burden)' },
  { id: 'pause', label: 'Pauses', status: 'normal', icon: Clock, details: 'None >2.0s detected' },
];

export const FindingsSummary: React.FC = () => {
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const getStatusStyles = (status: Finding['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'detected':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'attention':
        return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
    }
  };

  const getStatusIcon = (status: Finding['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'detected':
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'attention':
        return <AlertTriangle className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Findings Summary
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click on a finding to highlight relevant data
        </p>
      </div>

      {/* Findings Chips */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {findings.map((finding) => (
            <button
              key={finding.id}
              onClick={() => setSelectedFinding(selectedFinding === finding.id ? null : finding.id)}
              className={`
                status-chip border
                ${getStatusStyles(finding.status)}
                ${selectedFinding === finding.id ? 'ring-2 ring-offset-2 ring-accent' : ''}
              `}
            >
              <finding.icon className="h-3.5 w-3.5" />
              {finding.label}
              {getStatusIcon(finding.status)}
            </button>
          ))}
        </div>

        {/* Selected Finding Details */}
        {selectedFinding && (
          <div className="mb-6 p-4 bg-secondary/50 rounded-lg animate-scale-in">
            <h4 className="font-medium text-foreground mb-2">
              {findings.find(f => f.id === selectedFinding)?.label}
            </h4>
            <p className="text-sm text-muted-foreground">
              {findings.find(f => f.id === selectedFinding)?.details}
            </p>
            
            {/* Mock ECG strip visualization */}
            <div className="mt-4 h-20 bg-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 400 60" className="w-full h-full">
                <path
                  d="M0,30 L40,30 L50,30 L60,10 L70,50 L80,20 L90,40 L100,30 L140,30 L150,30 L160,5 L170,55 L180,25 L190,35 L200,30 L240,30 L250,30 L260,15 L270,45 L280,22 L290,38 L300,30 L340,30 L350,30 L360,8 L370,52 L380,28 L390,32 L400,30"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Professional Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your clinical interpretation and recommendations..."
            className="input-medical w-full h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Your comments will be included in the final report.
          </p>
        </div>
      </div>
    </div>
  );
};
