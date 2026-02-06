import React, { useState } from 'react';
import { 
  Search, Heart, Battery, Wifi, Eye, AlertTriangle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  name: string;
  mrn: string;
  severity: number;
  status: 'new' | 'reviewing' | 'awaiting';
  heartRate: number;
  battery: number;
  signal: 'strong' | 'weak' | 'poor';
  lastUpdate: string;
  findings: string[];
}

const patients: Patient[] = [
  { id: '1', name: 'Joel Larson', mrn: '123456', severity: 8, status: 'new', heartRate: 112, battery: 45, signal: 'strong', lastUpdate: '2 min ago', findings: ['Tachycardia detected', 'Elevated PVC burden'] },
  { id: '2', name: 'Mike Kam', mrn: '7676767', severity: 5, status: 'reviewing', heartRate: 72, battery: 78, signal: 'strong', lastUpdate: '5 min ago', findings: ['Normal sinus rhythm', 'Minor irregularities'] },
  { id: '3', name: 'Ravii Choudhary', mrn: '8668240', severity: 9, status: 'new', heartRate: 134, battery: 23, signal: 'weak', lastUpdate: '1 min ago', findings: ['A-Fib detected', 'Tachycardia episodes', 'Low battery warning'] },
  { id: '4', name: 'Sarah Johnson', mrn: '9876543', severity: 3, status: 'awaiting', heartRate: 68, battery: 92, signal: 'strong', lastUpdate: '12 min ago', findings: ['Normal findings'] },
  { id: '5', name: 'David Chen', mrn: '5432198', severity: 7, status: 'new', heartRate: 98, battery: 56, signal: 'weak', lastUpdate: '3 min ago', findings: ['Bradycardia episodes', 'Pauses detected'] },
];

const NursePulse: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'new' | 'awaiting'>('all');
  const [quickPeekPatient, setQuickPeekPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'new') return p.status === 'new';
    if (filter === 'awaiting') return p.status === 'awaiting' || p.status === 'reviewing';
    return true;
  });

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-destructive';
    if (severity >= 6) return 'text-warning';
    return 'text-success';
  };

  const getSeverityBg = (severity: number) => {
    if (severity >= 8) return 'bg-destructive/10';
    if (severity >= 6) return 'bg-warning/10';
    return 'bg-success/10';
  };

  const getSignalIcon = (signal: Patient['signal']) => {
    const color = signal === 'strong' ? 'text-success' : signal === 'weak' ? 'text-warning' : 'text-destructive';
    return <Wifi className={`h-4 w-4 ${color}`} />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent" />
            Pulse Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time patient transmission monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          {patients.filter(p => p.status === 'new').length} Active Transmissions
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center border-b border-border">
          {[
            { value: 'all', label: 'All Patients' },
            { value: 'new', label: 'New Findings' },
            { value: 'awaiting', label: 'Awaiting Doctor Review' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as 'all' | 'new' | 'awaiting')}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:transition-all after:duration-200 ${
                filter === tab.value ? 'text-accent after:bg-accent' : 'text-muted-foreground hover:text-foreground after:bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search patients..." className="input-medical w-full pl-10" />
        </div>
      </div>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className={`bg-card rounded-2xl border border-border/60 shadow-sm p-5 transition-all duration-300 card-hover ${patient.severity >= 8 ? 'severity-glow-high' : ''} ${patient.severity >= 9 ? 'severity-glow-critical' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityBg(patient.severity)}`}>
                  <span className={`text-lg font-bold ${getSeverityColor(patient.severity)}`}>{patient.severity}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{patient.name}</h3>
                    {patient.severity >= 7 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Attention Required
                      </span>
                    )}
                    {patient.status === 'new' && (
                      <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">New</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">MRN: {patient.mrn}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className={`h-5 w-5 ${patient.heartRate > 100 ? 'text-destructive' : 'text-success'}`} />
                  <div>
                    <p className="text-sm font-medium">{patient.heartRate} BPM</p>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className={`h-5 w-5 ${patient.battery < 30 ? 'text-destructive' : 'text-success'}`} />
                  <div>
                    <p className="text-sm font-medium">{patient.battery}%</p>
                    <p className="text-xs text-muted-foreground">Battery</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSignalIcon(patient.signal)}
                  <div>
                    <p className="text-sm font-medium capitalize">{patient.signal}</p>
                    <p className="text-xs text-muted-foreground">Signal</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Updated {patient.lastUpdate}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg border-border" onClick={() => setQuickPeekPatient(patient)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Quick Peek
                </Button>
                <Button variant="accent" size="sm" className="rounded-lg shadow-sm">Review</Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {patient.findings.map((finding, idx) => (
                <span key={idx} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  finding.toLowerCase().includes('normal') ? 'bg-success/10 text-success' :
                  finding.toLowerCase().includes('warning') || finding.toLowerCase().includes('low') ? 'bg-warning/10 text-warning' :
                  'bg-muted text-foreground'
                }`}>{finding}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Peek Modal */}
      {quickPeekPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-border/60 animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
              <div>
                <h3 className="text-lg font-display font-semibold">{quickPeekPatient.name}</h3>
                <p className="text-sm text-muted-foreground">Latest ECG Snapshot</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setQuickPeekPatient(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="bg-accent/5 rounded-xl p-4 h-48 flex items-center justify-center border border-accent/10">
                <svg viewBox="0 0 600 100" className="w-full h-full">
                  <path d="M0,50 L60,50 L80,50 L100,20 L120,80 L140,30 L160,70 L180,50 L240,50 L260,50 L280,15 L300,85 L320,25 L340,75 L360,50 L420,50 L440,50 L460,22 L480,78 L500,32 L520,68 L540,50 L600,50" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                {[
                  { value: quickPeekPatient.heartRate, label: 'BPM' },
                  { value: `${quickPeekPatient.severity}/10`, label: 'Severity' },
                  { value: `${quickPeekPatient.battery}%`, label: 'Battery' },
                  { value: quickPeekPatient.signal, label: 'Signal' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 bg-muted/50 rounded-xl">
                    <p className="text-2xl font-display font-bold text-foreground capitalize">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Current Findings</h4>
                <div className="flex flex-wrap gap-2">
                  {quickPeekPatient.findings.map((finding, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-muted rounded-lg text-sm">{finding}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border bg-muted/30">
              <Button variant="outline" className="rounded-xl" onClick={() => setQuickPeekPatient(null)}>Close</Button>
              <Button variant="accent" className="rounded-xl shadow-sm">Open Full Review</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursePulse;
