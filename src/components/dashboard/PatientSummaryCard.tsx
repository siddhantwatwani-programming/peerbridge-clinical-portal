import React from 'react';
import { ArrowLeft, User, Calendar, Hash, Phone, MapPin, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientSummaryCardProps {
  patientId: string;
  onBack: () => void;
}

// Mock patient data
const patients: Record<string, {
  name: string;
  dob: string;
  mrn: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  physician: string;
  studyType: string;
  studyDuration: string;
}> = {
  'mike-kam': {
    name: 'Mike Kam',
    dob: 'Jan 15, 1996',
    mrn: '7676767676676',
    age: 29,
    gender: 'Male',
    phone: '(555) 123-4567',
    address: 'New York, NY',
    physician: 'Dr. Michael Kaminski',
    studyType: '7 Day XT Holter',
    studyDuration: '168 hours'
  },
  'ravii-choudhary': {
    name: 'Ravii Choudhary',
    dob: 'Aug 09, 1996',
    mrn: '8668240953',
    age: 29,
    gender: 'Male',
    phone: '(866) 824-0953',
    address: 'California, CA',
    physician: 'Dr. Michael Kaminski',
    studyType: '7 Day XT Holter',
    studyDuration: '168 hours'
  }
};

export const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patientId, onBack }) => {
  const patient = patients[patientId] || patients['mike-kam'];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-primary p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-primary-foreground hover:bg-primary-foreground/10 mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h2 className="text-xl font-bold text-primary-foreground">{patient.name}</h2>
        <p className="text-primary-foreground/70 text-sm">Patient Summary</p>
      </div>

      {/* Patient Info */}
      <div className="p-4 space-y-4">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={Calendar} label="DOB" value={patient.dob} />
          <InfoItem icon={User} label="Age" value={`${patient.age} yrs`} />
          <InfoItem icon={Hash} label="MRN" value={patient.mrn} />
          <InfoItem icon={User} label="Gender" value={patient.gender} />
        </div>

        <div className="h-px bg-border" />

        {/* Contact Info */}
        <div className="space-y-3">
          <InfoItem icon={Phone} label="Phone" value={patient.phone} />
          <InfoItem icon={MapPin} label="Location" value={patient.address} />
        </div>

        <div className="h-px bg-border" />

        {/* Study Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent font-medium">
            <Stethoscope className="h-4 w-4" />
            Study Information
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Study Type</span>
              <span className="font-medium">{patient.studyType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{patient.studyDuration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Physician</span>
              <span className="font-medium text-accent">{patient.physician}</span>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="pt-2">
          <div className="trust-badge w-full justify-center text-xs">
            <span>✓ Verified Patient Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ 
  icon: Icon, 
  label, 
  value 
}) => (
  <div className="flex items-start gap-2">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);
