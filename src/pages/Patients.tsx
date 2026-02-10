import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { AIInsightsCard } from '@/components/shared/AIInsightsCard';

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

  const columns = [
    { key: 'mrn', label: 'MRN', sortable: true, render: (p: Patient) => (
      <span className="font-medium text-accent">{p.mrn}</span>
    )},
    { key: 'lastName', label: 'Last Name', sortable: true, render: (p: Patient) => (
      <span className="font-medium text-foreground">{p.lastName}</span>
    )},
    { key: 'firstName', label: 'First Name', sortable: true, render: (p: Patient) => (
      <span className="text-foreground">{p.firstName}</span>
    )},
    { key: 'dateOfBirth', label: 'Date of Birth', sortable: true, render: (p: Patient) => (
      <span className="text-muted-foreground">{p.dateOfBirth}</span>
    )},
    { key: 'phoneNumber', label: 'Phone', sortable: true, render: (p: Patient) => (
      <span className="text-muted-foreground tabular-nums">{p.phoneNumber}</span>
    )},
    { key: 'actions', label: '', align: 'center' as const, render: (p: Patient) => (
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 gap-1.5 text-accent hover:text-accent hover:bg-accent/5 rounded-lg text-xs font-medium"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/patients/create-order?patient=${encodeURIComponent(p.firstName + ' ' + p.lastName)}&mrn=${p.mrn}`);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        New Order
      </Button>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Patients" subtitle={`${totalResults} patients enrolled`}>
        <Button variant="accent" className="gap-2 rounded-xl shadow-lg shadow-accent/10" onClick={() => navigate('/patients/add')}>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </DataPageHeader>

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, MRN..." />

      <ModernTable
        columns={columns}
        data={filteredPatients}
        keyExtractor={(p) => p.id}
        emptyMessage="No patients found"
      />

      <ModernPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <AIInsightsCard
        context="Patient enrollment insights powered by AI"
        insights={[
          { icon: 'trend', text: '39 patients enrolled across the site. Enrollment rate has increased 8% month-over-month.' },
          { icon: 'alert', text: '3 patients have upcoming study end dates within the next 48 hours.' },
          { icon: 'success', text: 'All patient records are complete with valid contact information and demographics.' },
        ]}
      />
    </div>
  );
};

export default Patients;
