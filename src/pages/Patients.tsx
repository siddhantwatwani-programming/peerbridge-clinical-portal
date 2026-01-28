import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  mrn: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  phoneNumber: string;
}

const patients: Patient[] = [
  { id: '1', mrn: '77676767667676', lastName: 'Choudhary', firstName: 'Ravii', dateOfBirth: 'Aug 09, 1996', phoneNumber: '8668240953' },
  { id: '2', mrn: '12345', lastName: 'Danie', firstName: 'Danie', dateOfBirth: 'Jul 01, 2024', phoneNumber: '555-555-5555' },
  { id: '3', mrn: '9876543', lastName: 'Decfourteen', firstName: 'Mobile', dateOfBirth: 'Dec 12, 2000', phoneNumber: '4567891234' },
  { id: '4', mrn: '32355', lastName: 'eight', firstName: 'P', dateOfBirth: 'Jul 29, 1950', phoneNumber: '2135667899' },
  { id: '5', mrn: '433546', lastName: 'eighteen', firstName: 'P', dateOfBirth: 'Nov 24, 1943', phoneNumber: '2315454544' },
  { id: '6', mrn: '67677', lastName: 'Eleven', firstName: 'P', dateOfBirth: 'Jun 26, 1936', phoneNumber: '2135678990' },
  { id: '7', mrn: '78901', lastName: 'Smith', firstName: 'John', dateOfBirth: 'Mar 15, 1985', phoneNumber: '5551234567' },
  { id: '8', mrn: '45678', lastName: 'Johnson', firstName: 'Mary', dateOfBirth: 'Sep 22, 1972', phoneNumber: '5559876543' },
  { id: '9', mrn: '23456', lastName: 'Williams', firstName: 'Robert', dateOfBirth: 'Dec 01, 1990', phoneNumber: '5554567890' },
  { id: '10', mrn: '34567', lastName: 'Brown', firstName: 'Patricia', dateOfBirth: 'Apr 18, 1968', phoneNumber: '5557890123' },
];

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalResults = 39;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const filteredPatients = patients.filter(patient => 
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mrn.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
        <Button variant="accent" className="gap-2" onClick={() => navigate('/patients/add')}>
          <Plus className="h-4 w-4" />
          Add a New Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-medical w-full pl-11 py-3"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    MRN
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    LAST NAME
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    FIRST NAME
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    DATE OF BIRTH
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    PHONE NUMBER
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  CREATE NEW ORDER
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-primary font-medium">
                    {patient.mrn}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {patient.lastName}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {patient.firstName}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {patient.dateOfBirth}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {patient.phoneNumber}
                  </td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                      onClick={() => navigate(`/patients/create-order?patient=${encodeURIComponent(patient.firstName + ' ' + patient.lastName)}&mrn=${patient.mrn}`)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 1 to {itemsPerPage} of {totalResults} results</span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3, 4].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 ${currentPage === page ? 'bg-muted text-foreground' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Patients;
