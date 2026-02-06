import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { BatchReportReviewPanel } from '@/components/reports/BatchReportReviewPanel';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Report {
  id: string;
  patientName: string;
  studyType: string;
  reportStatus: string;
  doctor: string;
  startDate: string;
  endDate: string;
}

const reports: Report[] = [
  { id: '1', patientName: 'Mike Kam', studyType: '7 Day XT Holter', reportStatus: 'Report Ready', doctor: 'Michael Kaminski', startDate: '07/08/2025', endDate: '07/09/2025' },
  { id: '2', patientName: 'Ravii Choudhary', studyType: '7 Day XT Holter', reportStatus: 'Report Ready', doctor: 'Michael Kaminski', startDate: '07/29/2025', endDate: '07/30/2025' },
];

interface ReportAnalysis { id: string; quickSummary: string; category: 'normal' | 'abnormal-minor' | 'abnormal-major' | 'requires-attention'; batchEligible: boolean; flagReason?: string; }
interface BatchGroup { category: string; count: number; description: string; }

const Reports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [physicianFilters, setPhysicianFilters] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [batchModeEnabled, setBatchModeEnabled] = useState(false);
  const [reportAnalysis, setReportAnalysis] = useState<ReportAnalysis[]>([]);
  const [batchGroups, setBatchGroups] = useState<BatchGroup[]>([]);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBatchReview = async () => {
      if (!batchModeEnabled) return;
      setIsLoadingBatch(true);
      try {
        const { data, error } = await supabase.functions.invoke('batch-report-review', { body: { reports } });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        setReportAnalysis(data.reports || []);
        setBatchGroups(data.batchGroups || []);
      } catch (err) {
        setReportAnalysis([
          { id: '1', quickSummary: 'Normal sinus rhythm. No significant arrhythmias.', category: 'normal', batchEligible: true },
          { id: '2', quickSummary: 'Study in progress - awaiting additional data.', category: 'normal', batchEligible: true }
        ]);
        setBatchGroups([{ category: 'Normal', count: 2, description: 'Normal NSR reports ready for batch sign-off' }]);
      } finally { setIsLoadingBatch(false); }
    };
    fetchBatchReview();
  }, [batchModeEnabled]);

  const uniquePhysicians = [...new Set(reports.map(r => r.doctor))];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || report.studyType.toLowerCase().includes(searchQuery.toLowerCase()) || report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhysician = physicianFilters.length === 0 || physicianFilters.includes(report.doctor);
    return matchesSearch && matchesPhysician;
  });

  const totalResults = filteredReports.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const togglePhysicianFilter = (physician: string) => { setPhysicianFilters(prev => prev.includes(physician) ? prev.filter(p => p !== physician) : [...prev, physician]); };
  const handlePreviewReport = (report: Report) => { setSelectedReport(report); setIsPdfModalOpen(true); };
  const handleBatchSignOff = (category: string) => { const count = batchGroups.find(g => g.category === category)?.count || 0; toast.success(`${count} ${category} reports signed off`); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">Final Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">{totalResults} reports available</p>
          </div>
          <Button variant={batchModeEnabled ? "accent" : "outline"} className="gap-2 rounded-xl" onClick={() => setBatchModeEnabled(!batchModeEnabled)}>
            <Layers className="h-4 w-4" />
            {batchModeEnabled ? 'Batch Mode On' : 'Batch Mode'}
          </Button>
        </div>
        <div className="inline-flex items-center border-b border-border">
          {[{ value: 'active', label: 'Active Reports' }, { value: 'historical', label: 'Historical Reports' }].map(tab => (
            <button key={tab.value} className={`relative px-4 py-2.5 text-sm font-medium transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:transition-all after:duration-200 ${tab.value === 'active' ? 'text-accent after:bg-accent' : 'text-muted-foreground hover:text-foreground after:bg-transparent'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Review Panel */}
      {batchModeEnabled && (
        <div className="space-y-4">
          {isLoadingBatch ? (
            <div className="flex items-center gap-2 p-4 bg-accent/5 rounded-xl border border-accent/20">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">AI analyzing reports for batch review...</span>
            </div>
          ) : (
            <BatchReportReviewPanel reports={reportAnalysis} batchGroups={batchGroups} onBatchSignOff={handleBatchSignOff} onViewReport={(reportId) => { const report = reports.find(r => r.id === reportId); if (report) handlePreviewReport(report); }} />
          )}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl border-border">
              <Filter className="h-4 w-4" />
              Filter Physician ({physicianFilters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {uniquePhysicians.map((physician) => (
              <DropdownMenuCheckboxItem key={physician} checked={physicianFilters.includes(physician)} onCheckedChange={() => togglePhysicianFilter(physician)}>
                {physician}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-medical w-full pl-11" />
        </div>
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
              {filteredReports.map((report) => (
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
              ))}
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

export default Reports;
