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
}

const reports: Report[] = [
  { id: '1', patient: 'Mike Kam', studyType: '7 Day XT Holter', startDate: '07/08/2025' },
  { id: '2', patient: 'Ravii Choudhary', studyType: '7 Day XT Holter', startDate: '07/29/2025' },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isRegisterStudyOpen, setIsRegisterStudyOpen] = useState(false);

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'reports': return 'Search reports';
      case 'events': return 'Search events';
      case 'studies': return 'Search studies';
      default: return 'Search...';
    }
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Platform Health Monitor for Site Admins */}
      <PlatformHealthCard />

      {/* Top Filters Row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="System All...."
            className="input-medical w-full pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter by Physician (0)
        </Button>
        <div className="flex-1" />
        <Button variant="accent" className="gap-2" onClick={() => setIsRegisterStudyOpen(true)}>
          <Plus className="h-4 w-4" />
          Register New Study
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-4 h-auto p-0">
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none bg-transparent px-0 pb-3 text-muted-foreground data-[state=active]:shadow-none"
          >
            Active Reports
          </TabsTrigger>
          <TabsTrigger 
            value="events"
            className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none bg-transparent px-0 pb-3 text-muted-foreground data-[state=active]:shadow-none"
          >
            Active Events
          </TabsTrigger>
          <TabsTrigger 
            value="studies"
            className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none bg-transparent px-0 pb-3 text-muted-foreground data-[state=active]:shadow-none"
          >
            Active Studies
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {activeTab === 'reports' && 'Active Reports'}
              {activeTab === 'events' && 'Active Events'}
              {activeTab === 'studies' && 'Active Studies'}
            </h2>
            <div className="flex-1 relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-medical w-full pl-10 py-2"
              />
            </div>
          </div>

          <TabsContent value="reports" className="mt-0">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
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
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          STUDY BEGIN DATE
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4 text-sm font-medium text-primary">
                          {report.patient}
                        </td>
                        <td className="p-4 text-sm text-foreground">
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
                              onClick={() => handlePreviewReport(report)}
                            >
                              Preview Report
                            </Button>
                            <Button variant="outline" size="sm">
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal 
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        patientName={selectedReport?.patient || ''}
        studyType={selectedReport?.studyType || ''}
      />

      {/* Register New Study Modal */}
      <RegisterStudyModal 
        isOpen={isRegisterStudyOpen}
        onClose={() => setIsRegisterStudyOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
