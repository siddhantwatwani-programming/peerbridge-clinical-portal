import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';

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

  const handlePreviewReport = (report: ResearchReport) => { setSelectedReport(report); setIsPdfModalOpen(true); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Research</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalResults} research reports</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search research reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-medical w-full pl-11" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Patient', 'Study Type', 'Report Status', 'Doctor', 'Start Date', 'End Date'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">{h}<ArrowUpDown className="h-3 w-3" /></button>
                  </th>
                ))}
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No research reports found</td></tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border/40 last:border-0 hover:bg-accent/[0.03] transition-colors">
                    <td className="p-4 text-sm text-accent font-medium">{report.patientName}</td>
                    <td className="p-4 text-sm text-foreground">{report.studyType}</td>
                    <td className="p-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">{report.reportStatus}</span>
                    </td>
                    <td className="p-4 text-sm text-foreground">{report.doctor}</td>
                    <td className="p-4 text-sm text-muted-foreground">{report.startDate}</td>
                    <td className="p-4 text-sm text-muted-foreground">{report.endDate}</td>
                    <td className="p-4">
                      <Button variant="accent" size="sm" className="rounded-lg text-xs shadow-sm" onClick={() => handlePreviewReport(report)}>Preview Report</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 1 to {Math.min(itemsPerPage, totalResults)} of {totalResults} results</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="icon" className={`h-8 w-8 rounded-lg ${currentPage === page ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`} onClick={() => setCurrentPage(page)}>{page}</Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {selectedReport && (
        <PDFPreviewModal isOpen={isPdfModalOpen} onClose={() => { setIsPdfModalOpen(false); setSelectedReport(null); }} patientName={selectedReport.patientName} studyType={selectedReport.studyType} />
      )}
    </div>
  );
};

export default Research;
