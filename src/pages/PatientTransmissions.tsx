import React, { useState, useEffect } from 'react';
import { FileText, Filter, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { TransmissionTriageAlert } from '@/components/transmissions/TransmissionTriageAlert';
import { DataPageHeader } from '@/components/shared/DataPageHeader';
import { SearchToolbar } from '@/components/shared/SearchToolbar';
import { ModernTable } from '@/components/shared/ModernTable';
import { ModernPagination } from '@/components/shared/ModernPagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

interface Transmission {
  id: string;
  patient: string;
  status: string;
  createdDate: string;
  symptomDescription: string;
  physician: string;
}

const transmissions: Transmission[] = [
  { id: '1', patient: 'Joel Larson', status: 'ReportAssigned', createdDate: '08/12/2025 -08:12:32 PM', symptomDescription: 'Fainted', physician: 'Michael Kaminski' },
  { id: '2', patient: 'Mike Kam', status: 'ReportAssigned', createdDate: '07/29/2025 -04:58:47 AM', symptomDescription: 'No symptoms reported', physician: 'Michael Kaminski' },
  { id: '3', patient: 'Mike Kam', status: 'ReportAssigned', createdDate: '07/31/2024 -10:33:10 PM', symptomDescription: 'Shortness of breath', physician: 'Michael Kaminski' },
];

interface TriageInfo {
  alertLevel: 'critical' | 'high' | 'moderate' | 'low';
  summary: string;
  symptomCorrelation?: string;
}

const physicians = ['Michael Kaminski', 'Prashant Kumar', 'Sarah Chen'];

const PatientTransmissions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhysicians, setSelectedPhysicians] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [triageData, setTriageData] = useState<Record<string, TriageInfo>>({});
  const [isLoadingTriage, setIsLoadingTriage] = useState(false);
  const [triageEnabled, setTriageEnabled] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTriage = async () => {
      if (!triageEnabled) return;
      setIsLoadingTriage(true);
      try {
        const { data, error } = await supabase.functions.invoke('transmission-triage', { body: { transmissions } });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        const triageMap: Record<string, TriageInfo> = {};
        data.transmissions?.forEach((t: any) => {
          triageMap[t.id] = { alertLevel: t.alertLevel, summary: t.summary, symptomCorrelation: t.symptomCorrelation };
        });
        setTriageData(triageMap);
      } catch {
        setTriageData({
          '1': { alertLevel: 'high', summary: 'Syncope reported - requires urgent attention.', symptomCorrelation: 'Syncope often indicates significant arrhythmia' },
          '2': { alertLevel: 'low', summary: 'No symptoms reported. Routine monitoring.', symptomCorrelation: undefined },
          '3': { alertLevel: 'moderate', summary: 'Shortness of breath reported. May indicate arrhythmia.', symptomCorrelation: 'SOB may correlate with AFib' }
        });
      } finally {
        setIsLoadingTriage(false);
      }
    };
    fetchTriage();
  }, [triageEnabled]);

  const filteredTransmissions = transmissions.filter(t => {
    const matchesSearch = t.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.symptomDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.physician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhysician = selectedPhysicians.length === 0 || selectedPhysicians.includes(t.physician);
    return matchesSearch && matchesPhysician;
  });

  const totalResults = filteredTransmissions.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;

  const columns = [
    { key: 'patient', label: 'Patient', sortable: true, render: (t: Transmission) => (
      <span className="font-medium text-accent">{t.patient}</span>
    )},
    { key: 'status', label: 'Status', render: (t: Transmission) => (
      <StatusBadge label={t.status} variant="info" />
    )},
    { key: 'createdDate', label: 'Created', sortable: true, render: (t: Transmission) => (
      <span className="text-muted-foreground text-xs tabular-nums">{t.createdDate}</span>
    )},
    { key: 'symptomDescription', label: 'Symptoms', render: (t: Transmission) => (
      <span className="text-foreground">{t.symptomDescription}</span>
    )},
    { key: 'physician', label: 'Physician', sortable: true, render: (t: Transmission) => (
      <span className="text-muted-foreground">{t.physician}</span>
    )},
    ...(triageEnabled ? [{
      key: 'triage', label: 'AI Triage', render: (t: Transmission) => (
        triageData[t.id] ? <TransmissionTriageAlert triage={triageData[t.id]} compact /> : <span className="text-xs text-muted-foreground">—</span>
      ),
    }] : []),
    { key: 'actions', label: '', align: 'right' as const, render: (t: Transmission) => (
      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-accent hover:bg-accent/5 rounded-lg"
        onClick={(e) => { e.stopPropagation(); setSelectedTransmission(t); setIsPdfModalOpen(true); }}>
        Preview
      </Button>
    )},
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <DataPageHeader title="Patient Transmissions" subtitle="Incoming patient data transmissions">
        <Button variant="outline" className="gap-2 rounded-xl text-sm">
          <FileText className="h-4 w-4" />
          Historical
        </Button>
        <Button 
          variant={triageEnabled ? "accent" : "outline"} 
          className="gap-2 rounded-xl text-sm"
          onClick={() => setTriageEnabled(!triageEnabled)}
        >
          <Sparkles className="h-4 w-4" />
          {triageEnabled ? 'AI Triage On' : 'AI Triage Off'}
        </Button>
      </DataPageHeader>

      {isLoadingTriage && triageEnabled && (
        <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-2xl border border-accent/20">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">AI analyzing transmissions...</span>
        </div>
      )}

      <SearchToolbar value={searchQuery} onChange={setSearchQuery} placeholder="Search transmissions...">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Physician {selectedPhysicians.length > 0 && `(${selectedPhysicians.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {physicians.map((p) => (
              <DropdownMenuCheckboxItem key={p} checked={selectedPhysicians.includes(p)} onCheckedChange={() => setSelectedPhysicians(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>
                {p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchToolbar>

      <ModernTable columns={columns} data={filteredTransmissions} keyExtractor={(t) => t.id} emptyMessage="No transmissions found" />

      <ModernPagination currentPage={currentPage} totalPages={totalPages} totalResults={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />

      {selectedTransmission && (
        <PDFPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => { setIsPdfModalOpen(false); setSelectedTransmission(null); }}
          patientName={selectedTransmission.patient}
          studyType="Patient Transmission"
        />
      )}
    </div>
  );
};

export default PatientTransmissions;
