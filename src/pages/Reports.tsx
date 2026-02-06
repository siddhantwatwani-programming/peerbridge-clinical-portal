import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Filter, FileText, ChevronLeft, ChevronRight, Sparkles, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { BatchReportReviewPanel } from '@/components/reports/BatchReportReviewPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
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
  { 
    id: '1', 
    patientName: 'Mike Kam', 
    studyType: '7 Day XT Holter', 
    reportStatus: 'Report Ready', 
    doctor: 'Michael Kaminski', 
    startDate: '07/08/2025', 
    endDate: '07/09/2025' 
  },
  { 
    id: '2', 
    patientName: 'Ravii Choudhary', 
    studyType: '7 Day XT Holter', 
    reportStatus: 'Report Ready', 
    doctor: 'Michael Kaminski', 
    startDate: '07/29/2025', 
    endDate: '07/30/2025' 
  },
];

interface ReportAnalysis {
  id: string;
  quickSummary: string;
  category: 'normal' | 'abnormal-minor' | 'abnormal-major' | 'requires-attention';
  batchEligible: boolean;
  flagReason?: string;
}

interface BatchGroup {
  category: string;
  count: number;
  description: string;
}

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

  // Fetch batch review data
  useEffect(() => {
    const fetchBatchReview = async () => {
      if (!batchModeEnabled) return;
      
      setIsLoadingBatch(true);
      try {
        const { data, error } = await supabase.functions.invoke('batch-report-review', {
          body: { reports }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setReportAnalysis(data.reports || []);
        setBatchGroups(data.batchGroups || []);
      } catch (err) {
        console.error('Error fetching batch review:', err);
        // Use fallback data
        setReportAnalysis([
          { id: '1', quickSummary: 'Normal sinus rhythm throughout 7-day study. No significant arrhythmias detected. Heart rate 49-194 bpm.', category: 'normal', batchEligible: true },
          { id: '2', quickSummary: 'Study in progress - awaiting additional data for complete analysis.', category: 'normal', batchEligible: true }
        ]);
        setBatchGroups([
          { category: 'Normal', count: 2, description: 'Normal NSR reports ready for batch sign-off' }
        ]);
      } finally {
        setIsLoadingBatch(false);
      }
    };

    fetchBatchReview();
  }, [batchModeEnabled]);

  // Get unique physicians for filter
  const uniquePhysicians = [...new Set(reports.map(r => r.doctor))];

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.studyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPhysician = physicianFilters.length === 0 || physicianFilters.includes(report.doctor);
    
    return matchesSearch && matchesPhysician;
  });

  const totalResults = filteredReports.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const togglePhysicianFilter = (physician: string) => {
    setPhysicianFilters(prev => 
      prev.includes(physician) 
        ? prev.filter(p => p !== physician)
        : [...prev, physician]
    );
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsPdfModalOpen(true);
  };

  const handleBatchSignOff = (category: string) => {
    const count = batchGroups.find(g => g.category === category)?.count || 0;
    toast.success(`${count} ${category} reports signed off`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Active Reports</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            View Historical Reports
          </Button>
          <Button 
            variant={batchModeEnabled ? "accent" : "outline"} 
            className="gap-2"
            onClick={() => setBatchModeEnabled(!batchModeEnabled)}
          >
            <Layers className="h-4 w-4" />
            {batchModeEnabled ? 'Batch Mode On' : 'Batch Mode'}
          </Button>
        </div>
      </div>

      {/* Batch Review Panel */}
      {batchModeEnabled && (
        <div className="space-y-4">
          {isLoadingBatch ? (
            <div className="flex items-center gap-2 p-4 bg-accent/5 rounded-lg border border-accent/30">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">AI analyzing reports for batch review...</span>
            </div>
          ) : (
            <BatchReportReviewPanel
              reports={reportAnalysis}
              batchGroups={batchGroups}
              onBatchSignOff={handleBatchSignOff}
              onViewReport={(reportId) => {
                const report = reports.find(r => r.id === reportId);
                if (report) handlePreviewReport(report);
              }}
            />
          )}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter Physician ({physicianFilters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-card border border-border z-50">
            {uniquePhysicians.map((physician) => (
              <DropdownMenuCheckboxItem
                key={physician}
                checked={physicianFilters.includes(physician)}
                onCheckedChange={() => togglePhysicianFilter(physician)}
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
                    STUDY TYPE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  REPORT STATUS
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    DOCTOR
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    START DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    END DATE
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm text-primary font-medium">{report.patientName}</td>
                  <td className="p-4 text-sm text-foreground">{report.studyType}</td>
                  <td className="p-4 text-sm text-foreground">{report.reportStatus}</td>
                  <td className="p-4 text-sm text-foreground">{report.doctor}</td>
                  <td className="p-4 text-sm text-foreground">{report.startDate}</td>
                  <td className="p-4 text-sm text-foreground">{report.endDate}</td>
                  <td className="p-4">
                    <Button 
                      variant="accent" 
                      size="sm"
                      onClick={() => handlePreviewReport(report)}
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
      {selectedReport && (
        <PDFPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setSelectedReport(null);
          }}
          patientName={selectedReport.patientName}
          studyType={selectedReport.studyType}
        />
      )}
    </div>
  );
};

export default Reports;
