import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';

interface Patient {
  id: string;
  mrn: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
}

const patients: Patient[] = [
  { id: '1', mrn: '9876543', lastName: 'Decfourteen', firstName: 'Mobile', dateOfBirth: 'Dec 12, 2000' },
  { id: '2', mrn: '654987', lastName: 'Testing', firstName: 'NewApp', dateOfBirth: 'Jan 01, 2000' },
  { id: '3', mrn: '12345', lastName: 'EventTiming', firstName: 'MECA', dateOfBirth: 'Jan 01, 2000' },
  { id: '4', mrn: '8765678', lastName: 'km', firstName: 'pk', dateOfBirth: 'Jan 01, 1997' },
  { id: '5', mrn: '87878', lastName: 'three', firstName: 'P', dateOfBirth: 'Dec 28, 1957' },
  { id: '6', mrn: '34355', lastName: 'FOUR', firstName: 'P', dateOfBirth: 'Jun 29, 1984' },
  { id: '7', mrn: '77676767667676', lastName: 'Choudhary', firstName: 'Ravii', dateOfBirth: 'Aug 09, 1996' },
  { id: '8', mrn: '78901', lastName: 'Smith', firstName: 'John', dateOfBirth: 'Mar 15, 1985' },
];

interface RegisterStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterStudyModal: React.FC<RegisterStudyModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mrn.includes(searchQuery)
  );

  const handleCreateOrder = (patient: Patient) => {
    onClose();
    navigate(`/patients/create-order?patient=${encodeURIComponent(patient.firstName + ' ' + patient.lastName)}&mrn=${patient.mrn}`);
  };

  const handleAddPatient = () => {
    onClose();
    navigate('/patients/add');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Patient"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-medical w-full pl-10 py-3"
            />
          </div>

          {/* Add Patient Button */}
          <div className="flex justify-end">
            <Button variant="accent" className="gap-2" onClick={handleAddPatient}>
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>

          {/* Patients Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Medical Record No
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Last Name
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      First Name
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      DOB
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">
                      New Order
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 text-sm text-foreground">
                        {patient.mrn}
                      </td>
                      <td className="p-3 text-sm text-foreground">
                        {patient.lastName}
                      </td>
                      <td className="p-3 text-sm text-foreground">
                        {patient.firstName}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {patient.dateOfBirth}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleCreateOrder(patient)}
                          className="text-accent hover:text-accent/80 transition-colors"
                        >
                          <Plus className="h-5 w-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
