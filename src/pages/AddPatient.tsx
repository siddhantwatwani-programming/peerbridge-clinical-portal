import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GuidedVoiceInput, MandatoryField } from '@/components/voice/GuidedVoiceInput';

// Mandatory fields for guided voice input
const mandatoryFields: MandatoryField[] = [
  { 
    key: 'firstName', 
    label: 'First Name', 
    question: 'What is the patient\'s first name?',
    type: 'text' 
  },
  { 
    key: 'lastName', 
    label: 'Last Name', 
    question: 'What is the patient\'s last name?',
    type: 'text' 
  },
  { 
    key: 'dob', 
    label: 'Date of Birth', 
    question: 'What is the patient\'s date of birth? Please say it like January 15, 1985.',
    type: 'date' 
  },
  { 
    key: 'mrn', 
    label: 'Medical Record Number', 
    question: 'What is the medical record number or MRN?',
    type: 'text' 
  },
  { 
    key: 'race', 
    label: 'Race', 
    question: 'What is the patient\'s race?',
    type: 'select',
    options: [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black or African American' },
      { value: 'asian', label: 'Asian' },
      { value: 'hispanic', label: 'Hispanic or Latino' },
      { value: 'native', label: 'American Indian or Alaska Native' },
      { value: 'pacific', label: 'Native Hawaiian or Pacific Islander' },
      { value: 'other', label: 'Other' },
    ]
  },
  { 
    key: 'gender', 
    label: 'Gender', 
    question: 'What is the patient\'s gender? Male, Female, or Other?',
    type: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not', label: 'Prefer not to say' },
    ]
  },
  { 
    key: 'cellPhone', 
    label: 'Cell Phone', 
    question: 'What is the patient\'s cell phone number?',
    type: 'phone' 
  },
];

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [noCellPhone, setNoCellPhone] = useState(false);
  const [differentResponsibleParty, setDifferentResponsibleParty] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientData, setPatientData] = useState({ firstName: '', lastName: '', mrn: '' });
  
  // Form field states for voice input
  const [race, setRace] = useState('');
  const [gender, setGender] = useState('');
  const [voiceValues, setVoiceValues] = useState<Record<string, string>>({});

  // Handle single field captured from guided voice input
  const handleFieldCaptured = useCallback((key: string, value: string) => {
    setVoiceValues(prev => ({ ...prev, [key]: value }));
    
    // Handle select fields
    if (key === 'race') setRace(value);
    if (key === 'gender') setGender(value);
    
    // Update DOM input for text fields
    const input = document.getElementById(key) as HTMLInputElement;
    if (input && key !== 'race' && key !== 'gender') {
      input.value = value;
      // Trigger change event for React to pick up
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  }, []);

  const handleVoiceComplete = useCallback(() => {
    toast.success('All mandatory fields captured via voice!');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement)?.value || '';
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement)?.value || '';
    const mrn = (form.elements.namedItem('mrn') as HTMLInputElement)?.value || '';
    
    setPatientData({ firstName, lastName, mrn });
    setShowSuccessModal(true);
  };

  const handleCreateOrder = () => {
    const { firstName, lastName, mrn } = patientData;
    navigate(`/patients/create-order?patient=${encodeURIComponent(firstName + ' ' + lastName)}&mrn=${mrn}`);
  };

  const handleGoToPatients = () => {
    toast.success('Patient registered successfully');
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Information Section */}
        <div className="flex gap-8">
          <div className="w-48 shrink-0 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              Patient Information
            </h2>
            <GuidedVoiceInput
              fields={mandatoryFields}
              onFieldCaptured={handleFieldCaptured}
              onComplete={handleVoiceComplete}
            />
          </div>
          <div className="flex-1 space-y-6">
            {/* Row 1: Names and DOB */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="firstName">
                    First Name <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.firstName && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Input 
                  id="firstName" 
                  placeholder="Enter the First Name" 
                  required 
                  className="bg-background"
                  defaultValue={voiceValues.firstName || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input 
                  id="middleName" 
                  placeholder="Optional" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.lastName && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Input 
                  id="lastName" 
                  placeholder="Enter the Last Name" 
                  required 
                  className="bg-background"
                  defaultValue={voiceValues.lastName || ''}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.dob && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    id="dob" 
                    type="date" 
                    placeholder="Enter Date" 
                    required 
                    className="bg-background"
                    defaultValue={voiceValues.dob || ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  placeholder="" 
                  disabled 
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Row 2: MRN, Race, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mrn">
                    Medical Record Number <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.mrn && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Input 
                  id="mrn" 
                  placeholder="Enter the Medical Record Number" 
                  required 
                  className="bg-background"
                  defaultValue={voiceValues.mrn || ''}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="race">
                    Race <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.race && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Select value={race} onValueChange={setRace} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Race" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black or African American</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                    <SelectItem value="native">American Indian or Alaska Native</SelectItem>
                    <SelectItem value="pacific">Native Hawaiian or Pacific Islander</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gender">
                    Gender <span className="text-accent">*</span>
                  </Label>
                  {voiceValues.gender && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Cell Phone */}
            <div className="space-y-3">
              <div className="max-w-md space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cellPhone">
                    Cell Phone<span className="text-accent">*</span>
                  </Label>
                  {voiceValues.cellPhone && (
                    <span className="text-xs text-success">✓ Voice</span>
                  )}
                </div>
                <Input 
                  id="cellPhone" 
                  placeholder="Enter Cell Phone number" 
                  disabled={noCellPhone}
                  required={!noCellPhone}
                  className="bg-background"
                  defaultValue={voiceValues.cellPhone || ''}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="noCellPhone" 
                  checked={noCellPhone}
                  onCheckedChange={(checked) => setNoCellPhone(checked as boolean)}
                />
                <Label htmlFor="noCellPhone" className="text-sm font-normal cursor-pointer">
                  Patient does not have a cellphone
                </Label>
              </div>
            </div>
            {/* Row 4: Email, Marital Status, Address */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter the Email Address" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input 
                  id="streetAddress" 
                  placeholder="Enter Street Address" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress2">Street Address 2</Label>
                <Input 
                  id="streetAddress2" 
                  placeholder="Enter Street Address 2" 
                  className="bg-background"
                />
              </div>
            </div>

            {/* Row 5: City, State, Country, Zip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="Enter City" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  placeholder="Enter State" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input 
                  id="zipCode" 
                  placeholder="Enter Zip Code" 
                  className="bg-background"
                />
              </div>
            </div>

            {/* Responsible Party */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Responsible Party</h3>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="differentResponsibleParty" 
                  checked={differentResponsibleParty}
                  onCheckedChange={(checked) => setDifferentResponsibleParty(checked as boolean)}
                />
                <Label htmlFor="differentResponsibleParty" className="text-sm font-normal cursor-pointer">
                  Select this option if different from patient
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Contact Section */}
        <div className="flex gap-8">
          <h2 className="text-lg font-semibold text-foreground w-48 shrink-0">
            Secondary contact
          </h2>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name</Label>
                <Input 
                  id="contactName" 
                  placeholder="Contact Name" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input 
                  id="contactPhone" 
                  placeholder="Contact Phone Number" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email" 
                  placeholder="Contact Email" 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select defaultValue="self">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="accent">
            Register
          </Button>
        </div>
      </form>

      {/* Success Modal - Direct path to Create Order */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-success" />
              </div>
              Patient Registered Successfully
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{patientData.firstName} {patientData.lastName}</span> has been added to the system. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              variant="accent" 
              className="w-full gap-2" 
              onClick={handleCreateOrder}
            >
              <Plus className="h-4 w-4" />
              Create Order & Assign Device
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={handleGoToPatients}
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Patients List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPatient;
