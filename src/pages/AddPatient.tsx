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
import { VoiceFormInput } from '@/components/voice/VoiceFormInput';
import { FieldSchema } from '@/hooks/useVoiceFormParser';

// Field schema for voice parsing
const patientFieldSchema: FieldSchema[] = [
  { key: 'firstName', label: 'First Name', type: 'text' },
  { key: 'middleName', label: 'Middle Name', type: 'text' },
  { key: 'lastName', label: 'Last Name', type: 'text' },
  { key: 'dob', label: 'Date of Birth', type: 'date' },
  { key: 'mrn', label: 'Medical Record Number', type: 'text' },
  { key: 'race', label: 'Race', type: 'select', options: ['white', 'black', 'asian', 'hispanic', 'native', 'pacific', 'other'] },
  { key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other', 'prefer-not'] },
  { key: 'cellPhone', label: 'Cell Phone', type: 'phone' },
  { key: 'email', label: 'Email Address', type: 'email' },
  { key: 'streetAddress', label: 'Street Address', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'zipCode', label: 'Zip Code', type: 'text' },
];

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [noCellPhone, setNoCellPhone] = useState(false);
  const [differentResponsibleParty, setDifferentResponsibleParty] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientData, setPatientData] = useState({ firstName: '', lastName: '', mrn: '' });
  
  // Form field states for voice input
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [race, setRace] = useState('');
  const [gender, setGender] = useState('');

  const handleVoiceFieldsParsed = useCallback((parsedFields: Record<string, string>) => {
    setFormValues(prev => ({ ...prev, ...parsedFields }));
    
    // Handle select fields separately
    if (parsedFields.race) setRace(parsedFields.race);
    if (parsedFields.gender) setGender(parsedFields.gender);
    
    // Update actual form inputs
    Object.entries(parsedFields).forEach(([key, value]) => {
      const input = document.getElementById(key) as HTMLInputElement;
      if (input && key !== 'race' && key !== 'gender') {
        input.value = value;
      }
    });
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
            <VoiceFormInput
              context="patient_registration"
              fields={patientFieldSchema}
              onFieldsParsed={handleVoiceFieldsParsed}
            />
          </div>
          <div className="flex-1 space-y-6">
            {/* Row 1: Names and DOB */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-accent">*</span>
                </Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter the First Name" 
                  required 
                  className="bg-background"
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
                <Label htmlFor="lastName">
                  Last Name <span className="text-accent">*</span>
                </Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter the Last Name" 
                  required 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">
                  Date of Birth <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="dob" 
                    type="date" 
                    placeholder="Enter Date" 
                    required 
                    className="bg-background"
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
                <Label htmlFor="mrn">
                  Medical Record Number <span className="text-accent">*</span>
                </Label>
                <Input 
                  id="mrn" 
                  placeholder="Enter the Medical Record Number" 
                  required 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="race">
                  Race <span className="text-accent">*</span>
                </Label>
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
                <Label htmlFor="gender">
                  Gender <span className="text-accent">*</span>
                </Label>
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
                <Label htmlFor="cellPhone">
                  Cell Phone<span className="text-accent">*</span>
                </Label>
                <Input 
                  id="cellPhone" 
                  placeholder="Enter Cell Phone number" 
                  disabled={noCellPhone}
                  required={!noCellPhone}
                  className="bg-background"
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
