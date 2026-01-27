import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  FileText,
  Clock,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientSummaryCard } from '@/components/dashboard/PatientSummaryCard';
import { FindingsSummary } from '@/components/dashboard/FindingsSummary';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { ActiveReportsTable } from '@/components/dashboard/ActiveReportsTable';
import { TransmissionsTable } from '@/components/dashboard/TransmissionsTable';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>('mike-kam');
  const [showInterpretation, setShowInterpretation] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Button variant="accent" className="gap-2">
          <Plus className="h-4 w-4" />
          Register New Study
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter by Physician (0)
        </Button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search all"
            className="input-medical w-full pl-10"
          />
        </div>
      </div>

      {/* Main Content - Two Column Layout for Overview */}
      {!showInterpretation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Active Reports
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reports"
                  className="input-medical w-full pl-10 py-2 text-sm"
                />
              </div>
            </div>
            <ActiveReportsTable onPreviewReport={() => setShowInterpretation(true)} />
          </div>

          {/* Patient Transmissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Patient Transmissions
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events"
                  className="input-medical w-full pl-10 py-2 text-sm"
                />
              </div>
            </div>
            <TransmissionsTable onPreviewReport={() => setShowInterpretation(true)} />
          </div>
        </div>
      ) : (
        /* 3-Column Interpretation Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Patient Summary */}
          <div className="lg:col-span-3">
            <PatientSummaryCard 
              patientId={selectedPatient || 'mike-kam'} 
              onBack={() => setShowInterpretation(false)}
            />
          </div>

          {/* Middle Column - Findings Summary */}
          <div className="lg:col-span-5">
            <FindingsSummary />
          </div>

          {/* Right Column - AI Assistant */}
          <div className="lg:col-span-4">
            <AIAssistant />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
