import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

type ClinicianSubType = 'RN' | 'MA' | 'None';
type PhysicianSubType = 'MD' | 'DO' | 'NP' | 'PA';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Role selection
  const [isClinician, setIsClinician] = useState(false);
  const [isPhysician, setIsPhysician] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  
  // Sub-types
  const [clinicianSubType, setClinicianSubType] = useState<ClinicianSubType>('None');
  const [physicianSubType, setPhysicianSubType] = useState<PhysicianSubType>('MD');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isClinician && !isPhysician && !isSiteAdmin) {
      toast.error('Please select at least one user type');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('User added successfully');
    navigate('/users');
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl mx-4 border border-border animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-semibold text-foreground">Add User</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                First Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                Last Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                Phone Number<span className="text-destructive">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email<span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">
              User<span className="text-destructive">*</span>
            </Label>
            
            <div className="space-y-4">
              {/* Clinician Row */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Checkbox
                    id="clinician"
                    checked={isClinician}
                    onCheckedChange={(checked) => setIsClinician(checked === true)}
                  />
                  <Label htmlFor="clinician" className="text-sm cursor-pointer">
                    Clinician
                  </Label>
                </div>
                
                {isClinician && (
                  <RadioGroup
                    value={clinicianSubType}
                    onValueChange={(value) => setClinicianSubType(value as ClinicianSubType)}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="RN" id="rn" />
                      <Label htmlFor="rn" className="text-sm cursor-pointer">RN</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="MA" id="ma" />
                      <Label htmlFor="ma" className="text-sm cursor-pointer">MA</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="None" id="none" />
                      <Label htmlFor="none" className="text-sm cursor-pointer">None</Label>
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Physician Row */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Checkbox
                    id="physician"
                    checked={isPhysician}
                    onCheckedChange={(checked) => setIsPhysician(checked === true)}
                  />
                  <Label htmlFor="physician" className="text-sm cursor-pointer">
                    Physician
                  </Label>
                </div>
                
                {isPhysician && (
                  <RadioGroup
                    value={physicianSubType}
                    onValueChange={(value) => setPhysicianSubType(value as PhysicianSubType)}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="MD" id="md" />
                      <Label htmlFor="md" className="text-sm cursor-pointer">MD</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="DO" id="do" />
                      <Label htmlFor="do" className="text-sm cursor-pointer">DO</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="NP" id="np" />
                      <Label htmlFor="np" className="text-sm cursor-pointer">NP</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="PA" id="pa" />
                      <Label htmlFor="pa" className="text-sm cursor-pointer">PA</Label>
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Site Admin Row */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="siteAdmin"
                  checked={isSiteAdmin}
                  onCheckedChange={(checked) => setIsSiteAdmin(checked === true)}
                />
                <Label htmlFor="siteAdmin" className="text-sm cursor-pointer">
                  Site Admin
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel and Return
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
