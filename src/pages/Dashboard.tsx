import React, { useState } from 'react';
import { Search, Filter, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveEventsTable } from '@/components/dashboard/ActiveEventsTable';
import { ActiveStudiesTable } from '@/components/dashboard/ActiveStudiesTable';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { RegisterStudyModal } from '@/components/dashboard/RegisterStudyModal';
import { PlatformHealthCard } from '@/components/dashboard/PlatformHealthCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Report {
  id: string;
  patient: string;
  studyType: string;
  startDate: string;
  serviceTag: string;
  studyDates: string;
}

const reports: Report[] = [
  { id: '1', patient: 'Mike Kam', studyType: '7 Day XT Holter', startDate: '07/08/2025', serviceTag: 'VBG8S0QQCO', studyDates: '07/08/2025 -04:02:08 AM - 07/09/2025 -04:01:14 AM' },
  { id: '2', patient: 'Ravii Choudhary', studyType: '7 Day XT Holter', startDate: '07/29/2025', serviceTag: 'XYZ123ABC', studyDates: '07/29/2025 -10:15:00 AM - 08/05/2025 -10:14:00 AM' },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isRegisterStudyOpen, setIsRegisterStudyOpen] = useState(false);

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'reports': return 'Search reports...';
      case 'events': return 'Search events...';
      case 'studies': return 'Search studies...';
      default: return 'Search...';
    }
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search across all..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-secondary/50 border-0 rounded-full placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-card transition-all"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl h-10 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Filter by Physician
        </Button>
        <div className="flex-1" />
        <Button variant="accent" className="gap-2 rounded-xl h-10 text-sm shadow-lg shadow-accent/10" onClick={() => setIsRegisterStudyOpen(true)}>
          <Plus className="h-4 w-4" />
          Register New Study
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border/40 rounded-none w-full justify-start gap-8 h-auto p-0">
          {[
            { value: 'reports', label: 'Active Reports' },
            { value: 'events', label: 'Active Events' },
            { value: 'studies', label: 'Active Studies' },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-foreground rounded-none bg-transparent px-0 pb-3 text-muted-foreground/70 data-[state=active]:shadow-none font-medium text-sm transition-colors"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {activeTab === 'reports' && 'Active Reports'}
              {activeTab === 'events' && 'Active Events'}
              {activeTab === 'studies' && 'Active Studies'}
            </h2>
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-4 text-sm bg-secondary/50 border-0 rounded-full placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-card transition-all"
              />
            </div>
          </div>

          <TabsContent value="reports" className="mt-0">
            <div className="bg-card rounded-2xl border border-border/40 shadow-[0_1px_3px_0_hsl(var(--glass-shadow))] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      {['Patient', 'Study Type', 'Study Begin Date', ''].map((header, i) => (
                        <th key={header || 'actions'} className={`px-5 py-3.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>
                          {header && (
                            <span className="inline-flex items-center gap-1">
                              {header}
                              <ArrowUpDown className="h-3 w-3 text-muted-foreground/25" />
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {reports.map((report) => (
                      <tr key={report.id} className="group hover:bg-accent/[0.03] transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-accent">{report.patient}</td>
                        <td className="px-5 py-3.5 text-sm text-foreground">{report.studyType}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground tabular-nums">{report.startDate}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-accent hover:bg-accent/5 rounded-lg" onClick={() => handlePreviewReport(report)}>
                              Preview
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg">
                              Send to history
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <ActiveEventsTable />
          </TabsContent>

          <TabsContent value="studies" className="mt-0">
            <ActiveStudiesTable />
          </TabsContent>
        </div>
      </Tabs>

      <PlatformHealthCard onTabChange={setActiveTab} />

      <PDFPreviewModal 
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        patientName={selectedReport?.patient || ''}
        studyType={selectedReport?.studyType || ''}
        showInterpretationButton={true}
        serviceTag={selectedReport?.serviceTag}
        studyDates={selectedReport?.studyDates}
      />

      <RegisterStudyModal 
        isOpen={isRegisterStudyOpen}
        onClose={() => setIsRegisterStudyOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
