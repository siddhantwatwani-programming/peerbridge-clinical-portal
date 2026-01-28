import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Transmission {
  id: string;
  patient: string;
  status: string;
  createdDate: string;
  symptomDescription: string;
  physician: string;
}

const transmissions: Transmission[] = [
  { 
    id: '1', 
    patient: 'Joel Larson', 
    status: 'ReportAssigned',
    createdDate: '08/12/2025 -08:12:32 PM',
    symptomDescription: 'Fainted',
    physician: 'Michael Kaminski'
  },
  { 
    id: '2', 
    patient: 'Mike Kam', 
    status: 'ReportAssigned',
    createdDate: '07/29/2025 -04:58:47 AM',
    symptomDescription: 'No symptoms reported',
    physician: 'Michael Kaminski'
  },
  { 
    id: '3', 
    patient: 'Mike Kam', 
    status: 'ReportAssigned',
    createdDate: '07/31/2024 -10:33:10 PM',
    symptomDescription: 'Shortness of breath',
    physician: 'Michael Kaminski'
  },
];

const physicians = ['Michael Kaminski', 'Prashant Kumar', 'Sarah Chen'];

const PatientTransmissions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhysicians, setSelectedPhysicians] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredTransmissions = transmissions.filter(transmission => {
    const matchesSearch = 
      transmission.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transmission.symptomDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transmission.physician.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPhysician = selectedPhysicians.length === 0 || 
      selectedPhysicians.includes(transmission.physician);
    
    return matchesSearch && matchesPhysician;
  });

  const totalResults = filteredTransmissions.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const handlePreviewReport = (transmission: Transmission) => {
    setSelectedTransmission(transmission);
    setIsPdfModalOpen(true);
  };

  const togglePhysician = (physician: string) => {
    setSelectedPhysicians(prev => 
      prev.includes(physician) 
        ? prev.filter(p => p !== physician)
        : [...prev, physician]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Patient Transmissions</h1>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          View Historical Transmissions
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter Physician ({selectedPhysicians.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border border-border z-50">
            {physicians.map((physician) => (
              <DropdownMenuCheckboxItem
                key={physician}
                checked={selectedPhysicians.includes(physician)}
                onCheckedChange={() => togglePhysician(physician)}
              >
                {physician}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-medical w-full pl-11 py-3"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    PATIENT
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    STATUS
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    CREATED DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    SYMPTOM DESCRIPTION
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    PHYSICIAN
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransmissions.map((transmission) => (
                <tr key={transmission.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-primary font-medium">{transmission.patient}</td>
                  <td className="p-4 text-sm text-foreground">{transmission.status}</td>
                  <td className="p-4 text-sm text-foreground">{transmission.createdDate}</td>
                  <td className="p-4 text-sm text-foreground">{transmission.symptomDescription}</td>
                  <td className="p-4 text-sm text-foreground">{transmission.physician}</td>
                  <td className="p-4">
                    <Button 
                      variant="accent" 
                      size="sm"
                      onClick={() => handlePreviewReport(transmission)}
                    >
                      Preview Report
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
        <span>Showing 1 to {Math.min(itemsPerPage, totalResults)} of {totalResults} results</span>
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
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
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

      {/* PDF Preview Modal */}
      {selectedTransmission && (
        <PDFPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setSelectedTransmission(null);
          }}
          patientName={selectedTransmission.patient}
          studyType="Patient Transmission"
        />
      )}
    </div>
  );
};

export default PatientTransmissions;
