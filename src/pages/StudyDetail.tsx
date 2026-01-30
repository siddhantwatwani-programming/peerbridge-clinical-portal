import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Calendar, 
  Building2, 
  Home, 
  X,
  ChevronDown,
  Printer
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for the study
const mockStudyData = {
  id: '1',
  patientName: 'Mike Kam',
  patientId: '23456',
  confirmationId: 'TKDP-3ZNO-9H2D',
  orderStatus: 'Ready To Start',
  orderType: 'clinic',
  studyType: '24 Hours Holter',
  serviceTagNumber: '4XQHZTVC6S4',
  orderDate: '01/27/2026 11:27 PM',
  startDate: '01/27/2026 -11:27:00 PM',
  endDate: '01/28/2026 -11:24:56 PM',
  deviceUseByDate: '02/26/2026 -10:17:06 PM',
  diagnosisCodes: [
    { code: 'ZPD10', description: 'Secondary Diagnosis 3' }
  ],
  hasPacemaker: false,
  hasICD: false,
  primaryPhysician: '',
  orderingPhysician: 'Michael Kaminski',
  interpretingPhysician: '',
  applicationTechnician: 'vikas kumar',
  referringPhysician: '',
  notes: ''
};

// Mock diagnosis codes for search
const availableDiagnosisCodes = [
  { code: 'I48.0', description: 'Paroxysmal atrial fibrillation' },
  { code: 'I48.1', description: 'Persistent atrial fibrillation' },
  { code: 'I49.9', description: 'Cardiac arrhythmia, unspecified' },
  { code: 'R00.0', description: 'Tachycardia, unspecified' },
  { code: 'R00.1', description: 'Bradycardia, unspecified' },
  { code: 'R00.2', description: 'Palpitations' },
  { code: 'R55', description: 'Syncope and collapse' },
  { code: 'ZPD10', description: 'Secondary Diagnosis 3' },
];

const studyTypes = [
  '24 Hours Holter',
  '48 Hours Holter',
  '7 Day Event',
  '14 Day XT',
  '30 Day Event',
  'New Type'
];

const serviceTagNumbers = [
  '4XQHZTVC6S4',
  '5YRIBWUD7T5',
  '6ZSKCXVE8U6',
  '7ATLDYWF9V7'
];

const physicians = [
  'Michael Kaminski',
  'Prashant Kumar',
  'Phisician User',
  'Dr. Sarah Johnson',
  'Dr. James Wilson'
];

const technicians = [
  'vikas kumar',
  'john smith',
  'emily chen',
  'alex rodriguez'
];

const StudyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  // Form state
  const [orderType, setOrderType] = useState(mockStudyData.orderType);
  const [studyType, setStudyType] = useState(mockStudyData.studyType);
  const [serviceTagNumber, setServiceTagNumber] = useState(mockStudyData.serviceTagNumber);
  const [orderDate, setOrderDate] = useState(mockStudyData.orderDate);
  const [startDate, setStartDate] = useState(mockStudyData.startDate);
  const [endDate, setEndDate] = useState(mockStudyData.endDate);
  const [diagnosisCodes, setDiagnosisCodes] = useState(mockStudyData.diagnosisCodes);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const [hasPacemaker, setHasPacemaker] = useState(mockStudyData.hasPacemaker);
  const [hasICD, setHasICD] = useState(mockStudyData.hasICD);
  const [primaryPhysician, setPrimaryPhysician] = useState(mockStudyData.primaryPhysician);
  const [orderingPhysician, setOrderingPhysician] = useState(mockStudyData.orderingPhysician);
  const [interpretingPhysician, setInterpretingPhysician] = useState(mockStudyData.interpretingPhysician);
  const [applicationTechnician, setApplicationTechnician] = useState(mockStudyData.applicationTechnician);
  const [referringPhysician, setReferringPhysician] = useState(mockStudyData.referringPhysician);
  const [notes, setNotes] = useState(mockStudyData.notes);
  
  // Modal state
  const [showStudyDetailsModal, setShowStudyDetailsModal] = useState(false);

  const filteredDiagnosisCodes = availableDiagnosisCodes.filter(
    code => 
      !diagnosisCodes.some(dc => dc.code === code.code) &&
      (code.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
       code.description.toLowerCase().includes(diagnosisSearch.toLowerCase()))
  );

  const addDiagnosisCode = (code: typeof availableDiagnosisCodes[0]) => {
    setDiagnosisCodes(prev => [...prev, code]);
    setDiagnosisSearch('');
    setShowDiagnosisSuggestions(false);
  };

  const removeDiagnosisCode = (codeToRemove: string) => {
    setDiagnosisCodes(prev => prev.filter(c => c.code !== codeToRemove));
  };

  const handleCancel = () => {
    navigate('/studies');
  };

  const handleSave = () => {
    // TODO: Save logic
    console.log('Saving study...', { orderType, studyType, diagnosisCodes });
    navigate('/studies');
  };

  const handlePrintStudy = () => {
    const printContent = `
      <html>
        <head>
          <title>Study Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { font-size: 18px; margin-bottom: 30px; }
            .row { display: flex; margin-bottom: 12px; }
            .label { width: 180px; color: #666; font-size: 14px; }
            .value { font-size: 14px; color: #333; }
            .footer { margin-top: 20px; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <h1>Study Details</h1>
          <div class="row"><span class="label">Patient Name</span><span class="value">${mockStudyData.patientName}</span></div>
          <div class="row"><span class="label">Patient ID</span><span class="value">${mockStudyData.patientId}</span></div>
          <div class="row"><span class="label">Confirmation ID</span><span class="value">${mockStudyData.confirmationId}</span></div>
          <div class="row"><span class="label">Study</span><span class="value">${studyType}</span></div>
          <div class="row"><span class="label">Start Date</span><span class="value">${startDate}</span></div>
          <div class="row"><span class="label">End Date</span><span class="value">${endDate}</span></div>
          <div class="row"><span class="label">Ordering Physician</span><span class="value">${orderingPhysician}</span></div>
          <div class="row"><span class="label">Device ID</span><span class="value">${serviceTagNumber}</span></div>
          <div class="row"><span class="label">Device Use by Date</span><span class="value">${mockStudyData.deviceUseByDate}</span></div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit Order</h1>
          <p className="text-sm text-muted-foreground mt-1">Order Type</p>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{mockStudyData.patientName}</h2>
        <div className="w-[200px]"></div> {/* Spacer for centering */}
      </div>

      {/* Order Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setOrderType('clinic')}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
            orderType === 'clinic'
              ? "border-accent bg-accent/5"
              : "border-border hover:border-muted-foreground/30"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            orderType === 'clinic' ? "bg-accent/10" : "bg-muted"
          )}>
            <Building2 className={cn(
              "h-5 w-5",
              orderType === 'clinic' ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              orderType === 'clinic' ? "border-accent" : "border-muted-foreground/50"
            )}>
              {orderType === 'clinic' && (
                <div className="w-2 h-2 rounded-full bg-accent" />
              )}
            </div>
            <span className={cn(
              "font-medium",
              orderType === 'clinic' ? "text-accent" : "text-muted-foreground"
            )}>
              In Clinic Setup
            </span>
          </div>
        </button>

        <button
          onClick={() => setOrderType('home')}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
            orderType === 'home'
              ? "border-accent bg-accent/5"
              : "border-border hover:border-muted-foreground/30"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            orderType === 'home' ? "bg-accent/10" : "bg-muted"
          )}>
            <Home className={cn(
              "h-5 w-5",
              orderType === 'home' ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              orderType === 'home' ? "border-accent" : "border-muted-foreground/50"
            )}>
              {orderType === 'home' && (
                <div className="w-2 h-2 rounded-full bg-accent" />
              )}
            </div>
            <span className={cn(
              "font-medium",
              orderType === 'home' ? "text-accent" : "text-muted-foreground"
            )}>
              Patient Home Setup
            </span>
          </div>
        </button>
      </div>

      {/* Order Info Row */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Patient Confirmation ID</p>
          <p className="text-sm text-muted-foreground">{mockStudyData.confirmationId}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Order Status</p>
          <p className="text-sm text-muted-foreground">{mockStudyData.orderStatus}</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 text-accent border-accent hover:bg-accent/5"
          onClick={() => setShowStudyDetailsModal(true)}
        >
          <Download className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Study Details Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Study Type <span className="text-destructive">*</span>
          </Label>
          <Select value={studyType} onValueChange={setStudyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select study type" />
            </SelectTrigger>
            <SelectContent>
              {studyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-accent">
            Service Tag Number <span className="text-destructive">*</span>
          </Label>
          <Select value={serviceTagNumber} onValueChange={setServiceTagNumber}>
            <SelectTrigger>
              <SelectValue placeholder="Select service tag" />
            </SelectTrigger>
            <SelectContent>
              {serviceTagNumbers.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Order Date</Label>
          <div className="relative">
            <Input 
              value={orderDate} 
              onChange={(e) => setOrderDate(e.target.value)}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Date Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Start Date</Label>
          <div className="relative">
            <Input 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">End Date</Label>
          <div className="relative">
            <Input 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-8" />

      {/* Diagnosis Codes Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-accent mb-4">
          Diagnosis Codes <span className="text-destructive">*</span>
        </h3>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Diagnosis Codes <span className="text-destructive">*</span>
          </Label>
          
          {/* Selected Codes */}
          <div className="flex flex-wrap gap-2 mb-2">
            {diagnosisCodes.map(code => (
              <Badge 
                key={code.code} 
                variant="secondary"
                className="gap-2 py-1.5 px-3 bg-muted text-foreground"
              >
                <span className="text-accent font-medium">{code.code}:</span>
                {code.description}
                <button 
                  onClick={() => removeDiagnosisCode(code.code)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Type to search diagnosis codes..."
              value={diagnosisSearch}
              onChange={(e) => {
                setDiagnosisSearch(e.target.value);
                setShowDiagnosisSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowDiagnosisSuggestions(diagnosisSearch.length > 0)}
              onBlur={() => setTimeout(() => setShowDiagnosisSuggestions(false), 200)}
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            {/* Suggestions Dropdown */}
            {showDiagnosisSuggestions && filteredDiagnosisCodes.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredDiagnosisCodes.map(code => (
                  <button
                    key={code.code}
                    onClick={() => addDiagnosisCode(code)}
                    className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    <span className="font-medium text-accent">{code.code}</span>
                    <span className="text-muted-foreground">: {code.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Start typing to search by code or description. Selected codes will appear above.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-8" />

      {/* Additional Details Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-6">Additional Details</h3>

        {/* Pacemaker and ICD Row */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Patient has a Pacemaker<span className="text-destructive">*</span>
            </Label>
            <RadioGroup 
              value={hasPacemaker ? 'yes' : 'no'} 
              onValueChange={(val) => setHasPacemaker(val === 'yes')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="pacemaker-yes" />
                <Label htmlFor="pacemaker-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="pacemaker-no" />
                <Label htmlFor="pacemaker-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Patient has an ICD<span className="text-destructive">*</span>
            </Label>
            <RadioGroup 
              value={hasICD ? 'yes' : 'no'} 
              onValueChange={(val) => setHasICD(val === 'yes')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="icd-yes" />
                <Label htmlFor="icd-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="icd-no" />
                <Label htmlFor="icd-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Physicians Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primary Physician</Label>
            <Input 
              placeholder="Primary Physician"
              value={primaryPhysician}
              onChange={(e) => setPrimaryPhysician(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Ordering Physician<span className="text-destructive">*</span>
            </Label>
            <Select value={orderingPhysician} onValueChange={setOrderingPhysician}>
              <SelectTrigger>
                <SelectValue placeholder="Select physician" />
              </SelectTrigger>
              <SelectContent>
                {physicians.map(physician => (
                  <SelectItem key={physician} value={physician}>{physician}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Interpreting Physician</Label>
            <Select value={interpretingPhysician} onValueChange={setInterpretingPhysician}>
              <SelectTrigger>
                <SelectValue placeholder="Select Physician" />
              </SelectTrigger>
              <SelectContent>
                {physicians.map(physician => (
                  <SelectItem key={physician} value={physician}>{physician}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Application Technician<span className="text-destructive">*</span>
            </Label>
            <Select value={applicationTechnician} onValueChange={setApplicationTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Referring Physician and Notes */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Referring Physician</Label>
            <Input 
              placeholder="Referring Physician"
              value={referringPhysician}
              onChange={(e) => setReferringPhysician(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea 
              placeholder="Enter Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-end gap-4 z-40">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="min-w-[140px]"
        >
          Cancel and Return
        </Button>
        <Button 
          onClick={handleSave}
          className="min-w-[120px] bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Edit Order
        </Button>
      </div>

      {/* Study Details Modal */}
      <Dialog open={showStudyDetailsModal} onOpenChange={setShowStudyDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Study Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Patient Name</span>
              <span className="font-medium text-foreground">{mockStudyData.patientName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Patient ID</span>
              <span className="font-medium text-foreground">{mockStudyData.patientId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Confirmation ID</span>
              <span className="font-medium text-foreground">{mockStudyData.confirmationId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Study</span>
              <span className="font-medium text-foreground">{studyType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium text-foreground">{startDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium text-foreground">{endDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Ordering Physician</span>
              <span className="font-medium text-foreground">{orderingPhysician}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Device ID</span>
              <span className="font-medium text-foreground">{serviceTagNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Device Use by Date</span>
              <span className="font-medium text-foreground">{mockStudyData.deviceUseByDate}</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={handlePrintStudy}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Print Study
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyDetail;
