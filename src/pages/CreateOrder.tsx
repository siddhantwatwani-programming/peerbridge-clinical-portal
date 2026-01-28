import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Home, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OrderType = 'clinic' | 'home' | null;

const studyTypes = [
  { value: '14-day-xt', label: '14 Day XT' },
  { value: '30-day', label: '30 Day' },
  { value: '7-day', label: '7 Day' },
  { value: 'event-monitor', label: 'Event Monitor' },
];

const serviceTags = [
  { value: '3Y34NYQ9S74', label: '3Y34NYQ9S74' },
  { value: '4X45MZR0T85', label: '4X45MZR0T85' },
  { value: '5W56LYS1U96', label: '5W56LYS1U96' },
];

const diagnosisCodes = [
  { category: 'Primary Diagnosis', codes: [
    { code: 'IPD10', description: 'primary diagnosis 2' },
    { code: 'iPD10', description: 'Primary Diagnosis 1' },
    { code: 'I48.0', description: 'AFIB, Paroxysmal' },
    { code: 'I48.0', description: '*Adv. effect cardiac-stim. glyosides, seguela' },
    { code: 'I48.2', description: 'AFIB, Chronic' },
  ]},
  { category: 'Symptoms', codes: [
    { code: 'rpd10', description: 'Symptom 1' },
    { code: 'RPD10', description: 'Symptom 2' },
  ]},
];

const physicians = [
  { value: 'physician-1', label: 'Phisician User' },
  { value: 'physician-2', label: 'Dr. Smith' },
  { value: 'physician-3', label: 'Dr. Johnson' },
];

const technicians = [
  { value: 'tech-1', label: 'vikas kumar' },
  { value: 'tech-2', label: 'John Doe' },
  { value: 'tech-3', label: 'Jane Smith' },
];

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientName = searchParams.get('patient') || 'Patient';
  const patientMrn = searchParams.get('mrn') || '';

  const [orderType, setOrderType] = useState<OrderType>(null);
  const [studyType, setStudyType] = useState('');
  const [serviceTag, setServiceTag] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toLocaleString('en-US', { 
    month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
  }));
  const [startDate, setStartDate] = useState(new Date().toLocaleString('en-US', { 
    month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
  }));
  const [endDate, setEndDate] = useState('');
  const [selectedDiagnosisCodes, setSelectedDiagnosisCodes] = useState<Array<{code: string; description: string}>>([]);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);
  const [hasPacemaker, setHasPacemaker] = useState('no');
  const [hasICD, setHasICD] = useState('no');
  const [primaryPhysician, setPrimaryPhysician] = useState('');
  const [orderingPhysician, setOrderingPhysician] = useState('');
  const [interpretingPhysician, setInterpretingPhysician] = useState('');
  const [applicationTechnician, setApplicationTechnician] = useState('');
  const [referringPhysician, setReferringPhysician] = useState('');
  const [notes, setNotes] = useState('');

  // Home Setup Eligibility
  const [eligibilityExpanded, setEligibilityExpanded] = useState(true);
  const [videoCallConsent, setVideoCallConsent] = useState<string | null>(null);
  const [hasDeviceAccess, setHasDeviceAccess] = useState<string | null>(null);
  const [homeSetupAgreed, setHomeSetupAgreed] = useState<string | null>(null);

  const addDiagnosisCode = (code: { code: string; description: string }) => {
    if (!selectedDiagnosisCodes.find(c => c.code === code.code && c.description === code.description)) {
      setSelectedDiagnosisCodes([...selectedDiagnosisCodes, code]);
    }
    setShowDiagnosisDropdown(false);
    setDiagnosisSearch('');
  };

  const removeDiagnosisCode = (codeToRemove: { code: string; description: string }) => {
    setSelectedDiagnosisCodes(selectedDiagnosisCodes.filter(
      c => !(c.code === codeToRemove.code && c.description === codeToRemove.description)
    ));
  };

  const handleCreateOrder = () => {
    // Handle order creation logic here
    console.log('Creating order...', { orderType, studyType, serviceTag });
    navigate('/patients');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="text-xl font-semibold text-foreground">Create a New Order</h1>
        <h2 className="text-xl font-semibold text-foreground">{patientName}</h2>
      </div>

      {/* Order Type Selection */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-primary">Order Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* In Clinic Setup */}
          <button
            onClick={() => setOrderType('clinic')}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              orderType === 'clinic' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                orderType === 'clinic' ? 'border-accent' : 'border-muted-foreground'
              }`}>
                {orderType === 'clinic' && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <span className="text-sm text-primary">In Clinic Setup</span>
            </div>
          </button>

          {/* Patient Home Setup */}
          <button
            onClick={() => setOrderType('home')}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              orderType === 'home' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Home className="h-6 w-6 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                orderType === 'home' ? 'border-accent' : 'border-muted-foreground'
              }`}>
                {orderType === 'home' && <div className="w-3 h-3 rounded-full bg-accent" />}
              </div>
              <span className="text-sm text-primary">Patient Home Setup</span>
            </div>
          </button>
        </div>
      </div>

      {/* In Clinic Setup Form */}
      {orderType === 'clinic' && (
        <div className="space-y-6">
          {/* Study Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-primary">
                Study Type <span className="text-destructive">*</span>
              </Label>
              <Select value={studyType} onValueChange={setStudyType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select study" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {studyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-primary">
                Service Tag Number <span className="text-destructive">*</span>
              </Label>
              <Select value={serviceTag} onValueChange={setServiceTag}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select Tag" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {serviceTags.map((tag) => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Order Date</Label>
              <Input 
                type="text" 
                value={orderDate} 
                onChange={(e) => setOrderDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Start Date</Label>
              <Input 
                type="text" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End Date</Label>
              <Input 
                type="text" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="MM/DD/YYYY HH:MM AM"
                className="bg-background"
              />
            </div>
          </div>

          {/* Diagnosis Codes Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-8">
              <h3 className="text-base font-medium text-primary whitespace-nowrap">
                Diagnosis Codes <span className="text-destructive">*</span>
              </h3>
              <div className="flex-1 space-y-3">
                <Label className="text-sm text-primary">
                  Diagnosis Codes <span className="text-destructive">*</span>
                </Label>
                
                {/* Selected Codes */}
                {selectedDiagnosisCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDiagnosisCodes.map((code, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-md text-sm"
                      >
                        <span className="text-primary">{code.code}:</span> {code.description}
                        <button 
                          onClick={() => removeDiagnosisCode(code)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Type to search diagnosis codes..."
                    value={diagnosisSearch}
                    onChange={(e) => setDiagnosisSearch(e.target.value)}
                    onFocus={() => setShowDiagnosisDropdown(true)}
                    className="bg-background"
                  />
                  
                  {showDiagnosisDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {diagnosisCodes.map((category) => (
                        <div key={category.category}>
                          <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted">
                            {category.category}
                          </div>
                          {category.codes
                            .filter(code => 
                              diagnosisSearch === '' || 
                              code.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
                              code.description.toLowerCase().includes(diagnosisSearch.toLowerCase())
                            )
                            .map((code, index) => (
                              <button
                                key={index}
                                onClick={() => addDiagnosisCode(code)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                              >
                                <span className="text-primary">{code.code}:</span> {code.description}
                              </button>
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Start typing to search by code or description. Selected codes will appear above.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-8">
              <h3 className="text-base font-medium text-muted-foreground whitespace-nowrap">
                Additional Details
              </h3>
              <div className="flex-1 space-y-4">
                {/* Pacemaker and ICD */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">
                      Patient has a Pacemaker<span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup 
                      value={hasPacemaker} 
                      onValueChange={setHasPacemaker}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="pacemaker-yes" />
                        <Label htmlFor="pacemaker-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="pacemaker-no" />
                        <Label htmlFor="pacemaker-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-sm">
                      Patient has an ICD<span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup 
                      value={hasICD} 
                      onValueChange={setHasICD}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="icd-yes" />
                        <Label htmlFor="icd-yes" className="text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="icd-no" />
                        <Label htmlFor="icd-no" className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Physicians Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Primary Physician</Label>
                    <Input
                      type="text"
                      placeholder="Primary Physician"
                      value={primaryPhysician}
                      onChange={(e) => setPrimaryPhysician(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Ordering Physician<span className="text-destructive">*</span>
                    </Label>
                    <Select value={orderingPhysician} onValueChange={setOrderingPhysician}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Physician" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {physicians.map((physician) => (
                          <SelectItem key={physician.value} value={physician.value}>
                            {physician.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Interpreting Physician</Label>
                    <Select value={interpretingPhysician} onValueChange={setInterpretingPhysician}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Physician" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {physicians.map((physician) => (
                          <SelectItem key={physician.value} value={physician.value}>
                            {physician.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Application Technician<span className="text-destructive">*</span>
                    </Label>
                    <Select value={applicationTechnician} onValueChange={setApplicationTechnician}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Clinician" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {technicians.map((tech) => (
                          <SelectItem key={tech.value} value={tech.value}>
                            {tech.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Referring Physician and Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Referring Physician</Label>
                    <Input
                      type="text"
                      placeholder="Referring Physician"
                      value={referringPhysician}
                      onChange={(e) => setReferringPhysician(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <Textarea
                      placeholder="Enter Notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-background resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Home Setup Form */}
      {orderType === 'home' && (
        <div className="space-y-6">
          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-8">
              <h3 className="text-base font-medium text-primary whitespace-nowrap">Eligibility</h3>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary">
                    Home Setup Eligibility - Confirm the following - If any requirements are not met, the patient is not eligible for Home Setup
                  </p>
                  <button 
                    onClick={() => setEligibilityExpanded(!eligibilityExpanded)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {eligibilityExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {eligibilityExpanded && (
                  <div className="space-y-4 pt-2">
                    {/* Video Call Consent */}
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Patient or caregiver will perform device application together with Peerbridge clinician via video call<span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup 
                        value={videoCallConsent || ''} 
                        onValueChange={setVideoCallConsent}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="video-yes" />
                          <Label htmlFor="video-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="video-no" />
                          <Label htmlFor="video-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Device Access */}
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Has access to a device with video and microphone; and reliable wifi connectivity<span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup 
                        value={hasDeviceAccess || ''} 
                        onValueChange={setHasDeviceAccess}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="device-yes" />
                          <Label htmlFor="device-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="device-no" />
                          <Label htmlFor="device-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Home Setup Agreement */}
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Patient has been advised and agreed to a Cor device Home Setup<span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup 
                        value={homeSetupAgreed || ''} 
                        onValueChange={setHomeSetupAgreed}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="agree-yes" />
                          <Label htmlFor="agree-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="agree-no" />
                          <Label htmlFor="agree-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
        <Button 
          variant="outline" 
          onClick={() => navigate('/patients')}
        >
          Cancel and Return
        </Button>
        <Button 
          variant="accent"
          onClick={handleCreateOrder}
          disabled={!orderType}
        >
          Create Order
        </Button>
      </div>
    </div>
  );
};

export default CreateOrder;
