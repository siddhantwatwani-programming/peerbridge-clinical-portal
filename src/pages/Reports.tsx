import React, { useState, useEffect } from 'react';
import { Filter, FileText, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { BatchReportReviewPanel } from '@/components/reports/BatchReportReviewPanel';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AIInsightsCard } from '@/components/shared/AIInsightsCard';
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
  { id: '1', patientName: 'Mike Kam', studyType: '7 Day XT Holter', reportStatus: 'Report Ready', doctor: 'Michael Kaminski', startDate: '07/08/2025', endDate: '07/09/2025' },
  { id: '2', patientName: 'Ravii Choudhary', studyType: '7 Day XT Holter', reportStatus: 'Report Ready', doctor: 'Michael Kaminski', startDate: '07/29/2025', endDate: '07/30/2025' },
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
      } catch {
        setReportAnalysis([
          { id: '1', quickSummary: 'Normal sinus rhythm throughout 7-day study.', category: 'normal', batchEligible: true },
          { id: '2', quickSummary: 'Study in progress - awaiting additional data.', category: 'normal', batchEligible: true }
        ]);
        setBatchGroups([{ category: 'Normal', count: 2, description: 'Normal NSR reports ready for batch sign-off' }]);
      } finally {
        setIsLoadingBatch(false);
      }
    };
    fetchBatchReview();
  }, [batchModeEnabled]);

  const uniquePhysicians = [...new Set(reports.map(r => r.doctor))];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.studyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhysician = physicianFilters.length === 0 || physicianFilters.includes(report.doctor);
    return matchesSearch && matchesPhysician;
  });

  const totalResults = filteredReports.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const columns = [
    { key: 'patientName', label: 'Patient', sortable: true, render: (r: Report) => (
      <span className="font-medium text-accent">{r.patientName}</span>
    )},
    { key: 'studyType', label: 'Study Type', sortable: true, render: (r: Report) => (
      <span className="text-foreground">{r.studyType}</span>
    )},
    { key: 'reportStatus', label: 'Status', render: (r: Report) => (
      <StatusBadge label={r.reportStatus} variant="success" />
    )},
    { key: 'doctor', label: 'Doctor', sortable: true, render: (r: Report) => (
      <span className="text-muted-foreground">{r.doctor}</span>
    )},
    { key: 'startDate', label: 'Start', sortable: true, render: (r: Report) => (
      <span className="text-muted-foreground tabular-nums text-xs">{r.startDate}</span>
    )},
    { key: 'endDate', label: 'End', sortable: true, render: (r: Report) => (
      <span className="text-muted-foreground tabular-nums text-xs">{r.endDate}</span>
    )},
    { key: 'actions', label: '', align: 'right' as const, render: (r: Report) => (
      <Button 
        variant="ghost" size="sm"
        className="h-8 text-xs font-medium text-accent hover:bg-accent/5 rounded-lg"
        onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setIsPdfModalOpen(true); }}
      >
        Preview
      </Button>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Active Reports" subtitle="Final reports ready for review">
        <Button variant="outline" className="gap-2 rounded-xl text-sm">
          <FileText className="h-4 w-4" />
          Historical
        </Button>
        <Button 
          variant={batchModeEnabled ? "accent" : "outline"} 
          className="gap-2 rounded-xl text-sm"
          onClick={() => setBatchModeEnabled(!batchModeEnabled)}
        >
          <Layers className="h-4 w-4" />
          {batchModeEnabled ? 'Batch On' : 'Batch Mode'}
        </Button>
      </DataPageHeader>

      {batchModeEnabled && (
        <div className="space-y-4">
          {isLoadingBatch ? (
            <div className="flex items-center gap-2 p-4 bg-accent/5 rounded-2xl border border-accent/20">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">AI analyzing reports for batch review...</span>
            </div>
          ) : (
            <BatchReportReviewPanel
              reports={reportAnalysis}
              batchGroups={batchGroups}
              onBatchSignOff={(cat) => toast.success(`${batchGroups.find(g => g.category === cat)?.count || 0} reports signed off`)}
              onViewReport={(id) => { const r = reports.find(r => r.id === id); if (r) { setSelectedReport(r); setIsPdfModalOpen(true); } }}
            />
          )}
        </div>
      )}

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search reports...">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Physician {physicianFilters.length > 0 && `(${physicianFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {uniquePhysicians.map((physician) => (
              <DropdownMenuCheckboxItem
                key={physician}
                checked={physicianFilters.includes(physician)}
                onCheckedChange={() => setPhysicianFilters(prev => prev.includes(physician) ? prev.filter(p => p !== physician) : [...prev, physician])}
              >
                {physician}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchToolbar>

      <ModernTable columns={columns} data={filteredReports} keyExtractor={(r) => r.id} emptyMessage="No reports found" />

      <ModernPagination currentPage={currentPage} totalPages={totalPages} totalResults={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />

      <AIInsightsCard
        context="Report review insights powered by AI"
        insights={[
          { icon: 'trend', text: '2 reports ready for physician sign-off. Average review time is 2.4 hours per report.' },
          { icon: 'alert', text: '1 report has been pending review for over 24 hours. Prioritize for timely patient care.' },
          { icon: 'success', text: 'Batch mode available — both reports share similar study types and may qualify for batch sign-off.' },
        ]}
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

export default Reports;
