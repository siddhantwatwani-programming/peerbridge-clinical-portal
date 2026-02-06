import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveEventsTable } from '@/components/dashboard/ActiveEventsTable';
import { ActiveStudiesTable } from '@/components/dashboard/ActiveStudiesTable';
import { PDFPreviewModal } from '@/components/dashboard/PDFPreviewModal';
import { RegisterStudyModal } from '@/components/dashboard/RegisterStudyModal';
import { PlatformHealthCard } from '@/components/dashboard/PlatformHealthCard';

interface Report {
  id: string;
  patient: string;
  studyType: string;
  startDate: string;
  serviceTag: string;
  studyDates: string;
}

const reports: Report[] = [
  { 
    id: '1', 
    patient: 'Mike Kam', 
    studyType: '7 Day XT Holter', 
    startDate: '07/08/2025',
    serviceTag: 'VBG8S0QQCO',
    studyDates: '07/08/2025 -04:02:08 AM - 07/09/2025 -04:01:14 AM'
  },
  { 
    id: '2', 
    patient: 'Ravii Choudhary', 
    studyType: '7 Day XT Holter', 
    startDate: '07/29/2025',
    serviceTag: 'XYZ123ABC',
    studyDates: '07/29/2025 -10:15:00 AM - 08/05/2025 -10:14:00 AM'
  },
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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Platform Health Monitor */}
      <PlatformHealthCard onTabChange={setActiveTab} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search across all..."
            className="input-medical w-full pl-10 h-10 text-sm"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl h-10 text-sm">
          <Filter className="h-4 w-4" />
          Filter by Physician
        </Button>
        <div className="flex-1" />
        <Button variant="accent" className="gap-2 rounded-xl h-10 text-sm shadow-lg shadow-accent/15" onClick={() => setIsRegisterStudyOpen(true)}>
          <Plus className="h-4 w-4" />
          Register New Study
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 h-auto p-0">
          {[
            { value: 'reports', label: 'Active Reports' },
            { value: 'events', label: 'Active Events' },
            { value: 'studies', label: 'Active Studies' },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-foreground rounded-none bg-transparent px-0 pb-3 text-muted-foreground data-[state=active]:shadow-none font-medium text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {activeTab === 'reports' && 'Active Reports'}
              {activeTab === 'events' && 'Active Events'}
              {activeTab === 'studies' && 'Active Studies'}
            </h2>
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-medical w-full pl-10 py-2 text-sm h-9"
              />
            </div>
          </div>

          <TabsContent value="reports" className="mt-0">
            <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          Patient
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          Study Type
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          Study Begin Date
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-right p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-medium text-foreground">
                          {report.patient}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {report.studyType}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {report.startDate}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="accent" 
                              size="sm"
                              className="rounded-lg text-xs shadow-sm"
                              onClick={() => handlePreviewReport(report)}
                            >
                              Preview Report
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-lg text-xs">
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
