import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PatientSummaryCard } from '@/components/dashboard/PatientSummaryCard';
import { FindingsSummary } from '@/components/dashboard/FindingsSummary';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { SmartRecommendation } from '@/components/dashboard/SmartRecommendation';

const Interpretation: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Physician Interpretation</h1>
            <p className="text-muted-foreground">Review and sign off on study findings</p>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Patient Summary */}
        <div className="lg:col-span-3">
          <PatientSummaryCard 
            patientId="mike-kam" 
            onBack={() => {}}
          />
        </div>

        {/* Middle Column - Findings Summary */}
        <div className="lg:col-span-5 space-y-6">
          <FindingsSummary />
          <SmartRecommendation />
        </div>

        {/* Right Column - AI Assistant */}
        <div className="lg:col-span-4">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
