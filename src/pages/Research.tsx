import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ResearchReport {
  id: string;
  patientName: string;
  studyType: string;
  reportStatus: string;
  doctor: string;
  startDate: string;
  endDate: string;
}

const researchReports: ResearchReport[] = [
  { id: '1', patientName: 'Ravii Choudhary', studyType: '24 Hours Holter', reportStatus: 'Report Ready', doctor: 'Prashant Kumar', startDate: '10/30/2025', endDate: '11/01/2025' },
];

const Research: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredReports = researchReports.filter(report => 
    report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.studyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResults = filteredReports.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const columns = [
    { key: 'patientName', label: 'Patient', sortable: true, render: (r: ResearchReport) => (
      <span className="font-medium text-accent">{r.patientName}</span>
    )},
    { key: 'studyType', label: 'Study Type', sortable: true, render: (r: ResearchReport) => (
      <span className="text-foreground">{r.studyType}</span>
    )},
    { key: 'reportStatus', label: 'Status', render: (r: ResearchReport) => (
      <StatusBadge label={r.reportStatus} variant="success" />
    )},
    { key: 'doctor', label: 'Doctor', sortable: true, render: (r: ResearchReport) => (
      <span className="text-muted-foreground">{r.doctor}</span>
    )},
    { key: 'startDate', label: 'Start', sortable: true, render: (r: ResearchReport) => (
      <span className="text-muted-foreground tabular-nums text-xs">{r.startDate}</span>
    )},
    { key: 'endDate', label: 'End', sortable: true, render: (r: ResearchReport) => (
      <span className="text-muted-foreground tabular-nums text-xs">{r.endDate}</span>
    )},
    { key: 'actions', label: '', align: 'right' as const, render: (r: ResearchReport) => (
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 text-xs font-medium text-accent hover:bg-accent/5 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReport(r);
          setIsPdfModalOpen(true);
        }}
      >
        Preview
      </Button>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Research" subtitle="Research studies and reports" />

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search research reports..." />

      <ModernTable
        columns={columns}
        data={filteredReports}
        keyExtractor={(r) => r.id}
        emptyMessage="No research reports found"
      />

      <ModernPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {selectedReport && (
        <PDFPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => { setIsPdfModalOpen(false); setSelectedReport(null); }}
          patientName={selectedReport.patientName}
          studyType={selectedReport.studyType}
        />
      )}
    </div>
  );
};

export default Research;
